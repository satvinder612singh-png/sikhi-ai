import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_DRIVE_ID_RE = /^[a-zA-Z0-9_-]{8,128}$/;

async function proxyDriveAudio(
  req: NextRequest,
  context: { params: Promise<{ fileId: string }> },
  isHead: boolean
): Promise<Response> {
  const { fileId } = await context.params;
  const cleanId = (fileId || "").trim();

  if (!VALID_DRIVE_ID_RE.test(cleanId)) {
    return new Response("Invalid Google Drive file ID", { status: 400 });
  }

  const apiKey = (process.env.GOOGLE_DRIVE_API_KEY || "").trim();
  if (!apiKey) {
    return new Response("Google Drive API key is not configured", {
      status: 503,
    });
  }

  const driveUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(
    cleanId
  )}?alt=media&key=${encodeURIComponent(apiKey)}`;

  const upstreamHeaders = new Headers();
  const incomingRange = req.headers.get("range");
  if (incomingRange) {
    upstreamHeaders.set("Range", incomingRange);
  }

  let upstream: Response;
  try {
    upstream = await fetch(driveUrl, {
      method: isHead ? "HEAD" : "GET",
      headers: upstreamHeaders,
      redirect: "follow",
      cache: "no-store",
    });
  } catch {
    return new Response("Unable to reach Google Drive audio stream", {
      status: 502,
    });
  }

  if (!upstream.ok && upstream.status !== 206) {
    return new Response(`Upstream Google Drive error (${upstream.status})`, {
      status: upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502,
    });
  }

  const responseHeaders = new Headers();
  const upstreamType = upstream.headers.get("content-type") || "";
  const resolvedContentType =
    upstreamType && !upstreamType.includes("octet-stream")
      ? upstreamType
      : "audio/mpeg";

  responseHeaders.set("Content-Type", resolvedContentType);
  responseHeaders.set(
    "Accept-Ranges",
    upstream.headers.get("accept-ranges") || "bytes"
  );

  const contentLength = upstream.headers.get("content-length");
  if (contentLength) {
    responseHeaders.set("Content-Length", contentLength);
  }

  const contentRange = upstream.headers.get("content-range");
  if (contentRange) {
    responseHeaders.set("Content-Range", contentRange);
  }

  responseHeaders.set("Cache-Control", "public, max-age=3600");

  const status = upstream.status === 206 ? 206 : 200;

  return new Response(isHead ? null : upstream.body, {
    status,
    headers: responseHeaders,
  });
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ fileId: string }> }
) {
  return proxyDriveAudio(req, context, false);
}

export async function HEAD(
  req: NextRequest,
  context: { params: Promise<{ fileId: string }> }
) {
  return proxyDriveAudio(req, context, true);
}
