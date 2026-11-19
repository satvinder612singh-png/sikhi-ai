import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface DriveFileItem {
  id?: string;
  name?: string;
  size?: string;
  mimeType?: string;
}

interface DriveFilesResponse {
  files?: DriveFileItem[];
  nextPageToken?: string;
  error?: { message?: string; code?: number };
}

export interface DriveKirtanTrackItem {
  id: string;
  title: string;
  ragi: string;
  streamUrl: string;
  source: "google-drive";
  size?: number;
  mimeType?: string;
}

const AUDIO_EXT_RE = /\.(mp3|m4a|wav|ogg|aac|flac|webm)$/i;

function stripWrappingQuotes(raw: string): string {
  return raw.trim().replace(/^["']|["']$/g, "").trim();
}

function extractDriveFolderId(raw: string): string {
  const cleaned = stripWrappingQuotes(raw);
  if (!cleaned) return "";
  const folderPathMatch = cleaned.match(/\/folders\/([a-zA-Z0-9_-]{8,128})/);
  if (folderPathMatch?.[1]) return folderPathMatch[1];
  const queryIdMatch = cleaned.match(/[?&]id=([a-zA-Z0-9_-]{8,128})/);
  if (queryIdMatch?.[1]) return queryIdMatch[1];
  return cleaned;
}

function cleanSegment(raw: string): string {
  return raw
    .replace(/[._]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseKirtanFilename(fileName: string): { ragi: string; title: string } {
  const withoutExt = fileName.replace(/\.[^/.]+$/, "").trim();
  if (withoutExt.includes("--")) {
    const [rawRagi, ...rest] = withoutExt.split("--");
    const ragi = cleanSegment(rawRagi) || "Puratan Kirtan";
    const title = cleanSegment(rest.join(" ")) || cleanSegment(withoutExt);
    return { ragi, title };
  }

  const dashSplit = withoutExt.match(/^(.+?)\s+(?:-|—|–)\s+(.+)$/);
  if (dashSplit) {
    return {
      ragi: cleanSegment(dashSplit[1]) || "Puratan Kirtan",
      title: cleanSegment(dashSplit[2]) || cleanSegment(withoutExt),
    };
  }

  return {
    ragi: "Google Drive Kirtan",
    title: cleanSegment(withoutExt) || "Sacred Shabad Kirtan",
  };
}

function isAudioFile(file: DriveFileItem): boolean {
  const mime = (file.mimeType || "").toLowerCase();
  const name = file.name || "";
  return mime.startsWith("audio/") || AUDIO_EXT_RE.test(name);
}

export async function GET() {
  const folderId = extractDriveFolderId(
    process.env.KIRTAN_DRIVE_FOLDER_ID ||
      process.env.NEXT_PUBLIC_KIRTAN_DRIVE_FOLDER_ID ||
      process.env.GOOGLE_DRIVE_FOLDER_ID ||
      ""
  );
  const apiKey = stripWrappingQuotes(
    process.env.GOOGLE_DRIVE_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY ||
      ""
  );

  const missingVars: string[] = [];
  if (!folderId) missingVars.push("KIRTAN_DRIVE_FOLDER_ID");
  if (!apiKey) missingVars.push("GOOGLE_DRIVE_API_KEY");

  if (missingVars.length > 0) {
    return NextResponse.json(
      {
        ok: true,
        missingConfig: true,
        configured: false,
        missingVars,
        count: 0,
        tracks: [] as DriveKirtanTrackItem[],
        files: [] as DriveKirtanTrackItem[],
        message: `Missing server environment variable(s): ${missingVars.join(", ")}.`,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }

  try {
    const collected: DriveFileItem[] = [];
    let pageToken: string | undefined;

    for (let page = 0; page < 5; page += 1) {
      const q = `'${folderId}' in parents and trashed=false`;
      const params = new URLSearchParams({
        q,
        fields: "nextPageToken,files(id,name,size,mimeType)",
        pageSize: "1000",
        supportsAllDrives: "true",
        includeItemsFromAllDrives: "true",
        key: apiKey,
      });
      if (pageToken) {
        params.set("pageToken", pageToken);
      }

      const url = `https://www.googleapis.com/drive/v3/files?${params.toString()}`;
      const res = await fetch(url, {
        cache: "no-store",
      });

      const data = (await res.json().catch(() => null)) as DriveFilesResponse | null;
      if (!res.ok || !data) {
        const errorMsg =
          data?.error?.message ||
          `Google Drive API request failed with HTTP ${res.status}`;
        console.error("[/api/kirtan-list] Google Drive API error:", res.status, errorMsg);
        return NextResponse.json(
          {
            ok: false,
            missingConfig: false,
            configured: true,
            tracks: [] as DriveKirtanTrackItem[],
            files: [] as DriveKirtanTrackItem[],
            error: errorMsg,
          },
          {
            status: 502,
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate",
            },
          }
        );
      }

      if (Array.isArray(data.files)) {
        collected.push(...data.files);
      }

      if (!data.nextPageToken) break;
      pageToken = data.nextPageToken;
    }

    const tracks: DriveKirtanTrackItem[] = collected
      .filter((file): file is Required<Pick<DriveFileItem, "id" | "name">> & DriveFileItem =>
        Boolean(file.id && file.name && isAudioFile(file))
      )
      .map((file) => {
        const { ragi, title } = parseKirtanFilename(file.name);
        const parsedSize = file.size ? Number(file.size) : undefined;
        return {
          id: file.id,
          title,
          ragi,
          streamUrl: `/api/kirtan-stream/${encodeURIComponent(file.id)}`,
          source: "google-drive" as const,
          size: Number.isFinite(parsedSize) ? parsedSize : undefined,
          mimeType: file.mimeType || "audio/mpeg",
        };
      })
      .sort((a, b) => {
        const byRagi = a.ragi.localeCompare(b.ragi, undefined, {
          numeric: true,
          sensitivity: "base",
        });
        if (byRagi !== 0) return byRagi;
        return a.title.localeCompare(b.title, undefined, {
          numeric: true,
          sensitivity: "base",
        });
      });

    return NextResponse.json(
      {
        ok: true,
        missingConfig: false,
        configured: true,
        count: tracks.length,
        tracks,
        files: tracks,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (err) {
    const errorMsg =
      err instanceof Error
        ? err.message
        : "Unexpected error fetching Google Drive Kirtan list.";
    console.error("[/api/kirtan-list] Unexpected error:", errorMsg);
    return NextResponse.json(
      {
        ok: false,
        missingConfig: false,
        configured: true,
        tracks: [] as DriveKirtanTrackItem[],
        files: [] as DriveKirtanTrackItem[],
        error: errorMsg,
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}
