import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import {
  listApprovedSources,
  normalizeDomain,
  removeApprovedSource,
  saveApprovedSource,
  verifyFounderAdminHeader,
  type ApprovedSourceRecord,
} from "@/lib/articles-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { sources, backend } = await listApprovedSources();
  return NextResponse.json(
    {
      ok: true,
      backend,
      count: sources.length,
      sources,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}

export async function POST(req: Request) {
  if (!verifyFounderAdminHeader(req)) {
    return NextResponse.json(
      { ok: false, error: "Admin authentication required to manage Sikh sources." },
      { status: 401 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const name = String(body.name || "").trim();
  const rawUrl = String(body.url || body.domain || "").trim();
  const domain = normalizeDomain(rawUrl);

  if (!name || !domain) {
    return NextResponse.json(
      { ok: false, error: "Source name and valid URL/domain are required." },
      { status: 400 }
    );
  }

  const normalizedUrl = /^https?:\/\//i.test(rawUrl)
    ? rawUrl
    : `https://${domain}`;
  const rssUrlRaw = String(body.rss_url || "").trim();
  const rssUrl =
    rssUrlRaw && /^https?:\/\//i.test(rssUrlRaw) ? rssUrlRaw : null;

  const record: ApprovedSourceRecord = {
    id: crypto.randomUUID(),
    name,
    domain,
    url: normalizedUrl,
    rss_url: rssUrl,
    description:
      String(body.description || "").trim() ||
      `Verified Sikh educational source (${domain}).`,
    category: String(body.category || "").trim() || "Sikh Scholarship",
    is_active: true,
    created_at: new Date().toISOString(),
  };

  const result = await saveApprovedSource(record);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error || "Failed to save approved source." },
      { status: 500 }
    );
  }

  try {
    revalidatePath("/articles");
    revalidatePath("/studio");
    revalidatePath("/admin");
    revalidatePath("/news");
  } catch {
    // ignore
  }

  return NextResponse.json(
    { ok: true, source: result.source },
    { status: 201, headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

export async function DELETE(req: Request) {
  if (!verifyFounderAdminHeader(req)) {
    return NextResponse.json(
      { ok: false, error: "Admin authentication required." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const idOrDomain = (searchParams.get("id") || searchParams.get("domain") || "").trim();
  if (!idOrDomain) {
    return NextResponse.json(
      { ok: false, error: "Provide id or domain to remove." },
      { status: 400 }
    );
  }

  const result = await removeApprovedSource(idOrDomain);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error || "Failed to remove source." },
      { status: 500 }
    );
  }

  try {
    revalidatePath("/articles");
    revalidatePath("/studio");
    revalidatePath("/admin");
    revalidatePath("/news");
  } catch {
    // ignore
  }

  return NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
