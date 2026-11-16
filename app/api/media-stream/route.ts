import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function extractGoogleDriveFileId(input: string): string | null {
  const trimmed = (input || "").trim();
  if (!trimmed) return null;

  // Bare Drive ID
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed) && !trimmed.includes("http")) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    if (!host.includes("drive.google.com") && !host.includes("docs.google.com")) {
      return null;
    }
    const idParam = parsed.searchParams.get("id");
    if (idParam) return idParam;

    const match = parsed.pathname.match(/\/(?:file\/d|d|open)\/([a-zA-Z0-9_-]+)/);
    if (match?.[1]) return match[1];
  } catch {
    const match = trimmed.match(/(?:\/file\/d\/|[?&]id=|uc\?id=)([a-zA-Z0-9_-]+)/);
    if (match?.[1]) return match[1];
  }

  return null;
}

function resolvePlayableAudioUrl(rawUrl: string): string {
  const trimmed = (rawUrl || "").trim();
  if (!trimmed) return "";

  const lower = trimmed.toLowerCase();
  if (lower.includes("drive.google.com") || lower.includes("docs.google.com")) {
    return `/api/media-stream?url=${encodeURIComponent(trimmed)}`;
  }

  if (lower.includes("dropbox.com")) {
    try {
      const parsed = new URL(trimmed);
      parsed.searchParams.delete("dl");
      parsed.searchParams.set("raw", "1");
      return parsed.toString();
    } catch {
      return trimmed.includes("?")
        ? trimmed.replace(/([?&])dl=\d/g, "$1raw=1")
        : `${trimmed}?raw=1`;
    }
  }

  return trimmed;
}

export async function GET(req: NextRequest) {
  const rawUrl = req.nextUrl.searchParams.get("url") || "";
  const driveIdParam = req.nextUrl.searchParams.get("driveId") || "";
  const fileId = driveIdParam.trim() || extractGoogleDriveFileId(rawUrl);

  let targetUrl = "";
  if (fileId) {
    targetUrl = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`;
  } else if (rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") {
        targetUrl = parsed.toString();
      }
    } catch {
      return new Response("Invalid media url", { status: 400 });
    }
  }

  if (!targetUrl) {
    return new Response("Missing url or driveId parameter", { status: 400 });
  }

  const rangeHeader = req.headers.get("range");
  const upstreamHeaders: Record<string, string> = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) LearnSikhiMediaProxy/1.0",
    Accept: "audio/*,application/pdf,*/*;q=0.8",
  };
  if (rangeHeader) {
    upstreamHeaders["Range"] = rangeHeader;
  }

  try {
    let upstreamRes = await fetch(targetUrl, {
      headers: upstreamHeaders,
      redirect: "follow",
      cache: "no-store",
    });

    const contentType = upstreamRes.headers.get("content-type") || "";
    if (fileId && contentType.toLowerCase().includes("text/html")) {
      const directContentUrl = `https://drive.usercontent.google.com/download?id=${encodeURIComponent(fileId)}&export=download&confirm=t`;
      upstreamRes = await fetch(directContentUrl, {
        headers: upstreamHeaders,
        redirect: "follow",
        cache: "no-store",
      });
    }

    if (!upstreamRes.ok && upstreamRes.status !== 206) {
      return new Response("Upstream media stream unavailable", {
        status: upstreamRes.status || 502,
      });
    }

    const headers = new Headers();
    const resType = upstreamRes.headers.get("content-type");
    headers.set(
      "Content-Type",
      resType && !resType.includes("text/html") ? resType : "audio/mpeg"
    );
    headers.set("Accept-Ranges", "bytes");
    headers.set(
      "Cache-Control",
      "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400"
    );
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Headers", "Range, Content-Type");

    const contentRange = upstreamRes.headers.get("content-range");
    if (contentRange) headers.set("Content-Range", contentRange);

    const contentLength = upstreamRes.headers.get("content-length");
    if (contentLength) headers.set("Content-Length", contentLength);

    const status =
      rangeHeader && upstreamRes.status === 206
        ? 206
        : upstreamRes.status === 206
          ? 206
          : 200;

    return new Response(upstreamRes.body, {
      status,
      headers,
    });
  } catch {
    return new Response("Failed to stream remote media", { status: 502 });
  }
}
