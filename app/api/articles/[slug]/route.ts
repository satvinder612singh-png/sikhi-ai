import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  deleteArticleBySlugOrId,
  getArticleBySlug,
  upsertArticleRecord,
  verifyFounderAdminHeader,
  type ArticleStatus,
} from "@/lib/articles-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const isAdmin = verifyFounderAdminHeader(req);
  const { searchParams } = new URL(req.url);
  const allowDraft = isAdmin || searchParams.get("preview") === "true";

  const article = await getArticleBySlug(slug, allowDraft);
  if (!article) {
    return NextResponse.json(
      { ok: false, error: "Article not found." },
      { status: 404 }
    );
  }

  return NextResponse.json(
    { ok: true, article },
    {
      headers: { "Cache-Control": "no-store, max-age=0" },
    }
  );
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const existing = await getArticleBySlug(slug, true);
  if (!existing) {
    return NextResponse.json(
      { ok: false, error: "Article not found." },
      { status: 404 }
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

  const nextStatus =
    body.status === "draft" ||
    body.status === "pending_review" ||
    body.status === "published"
      ? (body.status as ArticleStatus)
      : existing.status;

  const updated = {
    ...existing,
    title:
      typeof body.title === "string" && body.title.trim()
        ? body.title.trim()
        : existing.title,
    summary_short:
      typeof body.summary_short === "string" && body.summary_short.trim()
        ? body.summary_short.trim()
        : existing.summary_short,
    content_markdown:
      typeof body.content_markdown === "string" && body.content_markdown.trim()
        ? body.content_markdown.trim()
        : existing.content_markdown,
    cover_image_url:
      body.cover_image_url !== undefined
        ? typeof body.cover_image_url === "string" && body.cover_image_url.trim()
          ? body.cover_image_url.trim()
          : null
        : existing.cover_image_url,
    source_name:
      typeof body.source_name === "string" && body.source_name.trim()
        ? body.source_name.trim()
        : existing.source_name,
    source_url:
      body.source_url !== undefined
        ? typeof body.source_url === "string" && body.source_url.trim()
          ? body.source_url.trim()
          : null
        : existing.source_url,
    category:
      typeof body.category === "string" && body.category.trim()
        ? body.category.trim()
        : existing.category,
    tags: Array.isArray(body.tags)
      ? body.tags.map((t) => String(t || "").trim()).filter(Boolean)
      : existing.tags,
    status: nextStatus,
    updated_at: new Date().toISOString(),
  };

  const result = await upsertArticleRecord(updated);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error || "Update failed." },
      { status: 500 }
    );
  }

  try {
    revalidatePath("/articles");
    revalidatePath(`/articles/${result.article.slug}`);
    revalidatePath("/sangat");
    revalidatePath("/admin");
  } catch {
    // ignore
  }

  return NextResponse.json(
    { ok: true, article: result.article },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  if (!verifyFounderAdminHeader(req)) {
    return NextResponse.json(
      { ok: false, error: "Admin authentication required to delete articles." },
      { status: 401 }
    );
  }

  const { slug } = await context.params;
  const result = await deleteArticleBySlugOrId(slug);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error || "Could not delete article." },
      { status: 500 }
    );
  }

  try {
    revalidatePath("/articles");
    revalidatePath(`/articles/${slug}`);
    revalidatePath("/sangat");
    revalidatePath("/admin");
  } catch {
    // ignore
  }

  return NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
