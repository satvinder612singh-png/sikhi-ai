import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VERIFIED_TRACK_URLS: Record<string, string> = {
  // Sri Harmandir Sahib (Darbar Sahib), Amritsar Live 24/7 SGPC Stream
  sgpc_live: "https://live.sgpc.net:8443/;nocache=1",
  // Puratan Kirtan Masters (Archive.org verified masters)
  vol1a: "https://archive.org/download/a-volume-1/A%20-%20volume%201.mp3",
  vol2a: "https://archive.org/download/a-volume-1/A%20-%20volume%202.mp3",
  vol1b: "https://archive.org/download/a-volume-1/B%20-%20volume%201.mp3",
  vol2b: "https://archive.org/download/a-volume-1/B%20-%20volume%202.mp3",
  // Classical Instrumentals & Ambient Reading Mode (Wikimedia / Archive.org public domain)
  sitar_alaap:
    "https://upload.wikimedia.org/wikipedia/commons/c/c8/Sitar_improvisation.ogg",
  tanpura_drone:
    "https://upload.wikimedia.org/wikipedia/commons/4/45/Tanpura_drone_C.ogg",
};

function isAllowedAudioHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === "gurmatveechar.com" ||
    host === "www.gurmatveechar.com" ||
    host.endsWith(".gurmatveechar.com") ||
    host === "archive.org" ||
    host.endsWith(".archive.org") ||
    host === "live.sgpc.net" ||
    host.endsWith(".sgpc.net") ||
    host === "upload.wikimedia.org" ||
    host === "sikhnet.com" ||
    host.endsWith(".sikhnet.com")
  );
}

function resolveTargetUrl(req: NextRequest): { url: string; isLive: boolean } | null {
  const { searchParams } = req.nextUrl;
  const trackKey = searchParams.get("track");
  if (trackKey && VERIFIED_TRACK_URLS[trackKey]) {
    return {
      url: VERIFIED_TRACK_URLS[trackKey],
      isLive: trackKey === "sgpc_live",
    };
  }

  const fileParam = searchParams.get("file");
  if (fileParam) {
    return {
      url: `https://archive.org/download/a-volume-1/${encodeURIComponent(fileParam)}`,
      isLive: false,
    };
  }

  const rawUrl = searchParams.get("url");
  if (rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      if (
        (parsed.protocol === "https:" || parsed.protocol === "http:") &&
        isAllowedAudioHost(parsed.hostname)
      ) {
        return {
          url: parsed.toString(),
          isLive: parsed.hostname.toLowerCase().includes("live.sgpc.net"),
        };
      }
    } catch {
      return null;
    }
  }

  return {
    url: VERIFIED_TRACK_URLS.vol1a,
    isLive: false,
  };
}

export async function GET(req: NextRequest) {
  const resolved = resolveTargetUrl(req);
  if (!resolved) {
    return new Response("Invalid or non-whitelisted audio URL", { status: 400 });
  }

  const { url: targetUrl, isLive } = resolved;
  const rangeHeader = req.headers.get("range");
  const upstreamHeaders: Record<string, string> = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) LearnSikhiAudioProxy/2.0",
    Accept: "audio/*,*/*;q=0.9",
  };
  if (rangeHeader && !isLive) {
    upstreamHeaders["Range"] = rangeHeader;
  }
  if (isLive) {
    upstreamHeaders["Icy-MetaData"] = "0";
  }

  try {
    const upstreamRes = await fetch(targetUrl, {
      headers: upstreamHeaders,
      redirect: "follow",
      cache: "no-store",
    });

    if (!upstreamRes.ok && upstreamRes.status !== 206) {
      return Response.redirect(targetUrl, 302);
    }

    const responseHeaders = new Headers();
    const upstreamType = upstreamRes.headers.get("content-type");
    responseHeaders.set(
      "Content-Type",
      upstreamType && upstreamType.includes("audio")
        ? upstreamType
        : "audio/mpeg"
    );
    responseHeaders.set("Access-Control-Allow-Origin", "*");
    responseHeaders.set("Access-Control-Allow-Headers", "Range, Content-Type");
    responseHeaders.set(
      "Access-Control-Expose-Headers",
      "Content-Range, Content-Length, Accept-Ranges"
    );

    if (isLive) {
      responseHeaders.set("Cache-Control", "no-cache, no-store, must-revalidate");
    } else {
      responseHeaders.set("Accept-Ranges", "bytes");
      responseHeaders.set("Cache-Control", "public, max-age=86400");
      const contentLength = upstreamRes.headers.get("content-length");
      if (contentLength) {
        responseHeaders.set("Content-Length", contentLength);
      }
      const contentRange = upstreamRes.headers.get("content-range");
      if (contentRange) {
        responseHeaders.set("Content-Range", contentRange);
      }
    }

    return new Response(upstreamRes.body, {
      status: upstreamRes.status === 206 ? 206 : 200,
      headers: responseHeaders,
    });
  } catch {
    return Response.redirect(targetUrl, 302);
  }
}
