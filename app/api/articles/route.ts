import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import {
  listArticles,
  slugifyArticleTitle,
  upsertArticleRecord,
  verifyFounderAdminHeader,
  wipeAllArticlesAndFeeds,
  type ArticleRecord,
  type ArticleStatus,
} from "@/lib/articles-store";
import { getVerifiedSessionUser } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status") as ArticleStatus | "all" | null;
  const authorId = searchParams.get("authorId");
  const isAdmin = verifyFounderAdminHeader(req);

  const includeAllStatuses =
    statusParam === "all" && (isAdmin || Boolean(authorId));
  const statusFilter: ArticleStatus | undefined =
    statusParam === "draft" ||
    statusParam === "pending_review" ||
    statusParam === "published"
      ? statusParam
      : undefined;

  // Non-admins querying without authorId only see published articles
  const safeStatus: ArticleStatus | undefined =
    !isAdmin && !authorId ? "published" : statusFilter;

  const { articles, backend } = await listArticles({
    includeAllStatuses,
    status: safeStatus,
    authorId: authorId || undefined,
  });

  return NextResponse.json(
    {
      ok: true,
      backend,
      count: articles.length,
      articles,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}

export async function POST(req: Request) {
  const { user: currentUser, isAdmin: isSessionAdmin } =
    await getVerifiedSessionUser();
  const isHeaderAdmin = verifyFounderAdminHeader(req);
  if (!currentUser && !isHeaderAdmin) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized: Sign in required to publish on SikhStacks." },
      { status: 401 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const title = String(body.title || "").trim();
  const summaryShort = String(body.summary_short || "").trim();
  const contentMarkdown = String(body.content_markdown || "").trim();

  if (!title || !summaryShort || !contentMarkdown) {
    return NextResponse.json(
      {
        ok: false,
        error: "Title, short summary (2–4 lines), and article content are required.",
      },
      { status: 400 }
    );
  }

  const isAdmin = isHeaderAdmin || isSessionAdmin;
  const requestedStatus = String(body.status || "draft") as ArticleStatus;
  let finalStatus: ArticleStatus =
    requestedStatus === "draft" ||
    requestedStatus === "pending_review" ||
    requestedStatus === "published"
      ? requestedStatus
      : "draft";

  // Allow direct publishing for admins or signed-in writers when requested
  if (finalStatus === "published" && !isAdmin && body.requireReview === true) {
    finalStatus = "pending_review";
  }

  const now = new Date().toISOString();
  const existingId =
    typeof body.id === "string" && body.id.trim() ? body.id.trim() : null;
  const rawSlug =
    typeof body.slug === "string" && body.slug.trim()
      ? slugifyArticleTitle(body.slug)
      : `${slugifyArticleTitle(title)}-${Date.now().toString(36).slice(-4)}`;

  const rawSourceUrl = String(body.source_url || "").trim();
  let validatedSourceUrl: string | null = null;
  if (rawSourceUrl) {
    try {
      const parsed = new URL(
        /^https?:\/\//i.test(rawSourceUrl)
          ? rawSourceUrl
          : `https://${rawSourceUrl}`
      );
      if (parsed.protocol === "https:" || parsed.protocol === "http:") {
        validatedSourceUrl = parsed.toString();
      }
    } catch {
      validatedSourceUrl = null;
    }
  }

  const tags = Array.isArray(body.tags)
    ? body.tags
        .map((t) => String(t || "").trim())
        .filter(Boolean)
        .slice(0, 8)
    : typeof body.tags === "string"
      ? body.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 8)
      : [];

  const record: ArticleRecord = {
    id: existingId || crypto.randomUUID(),
    slug: rawSlug,
    title,
    summary_short: summaryShort.slice(0, 420),
    content_markdown: contentMarkdown,
    cover_image_url:
      typeof body.cover_image_url === "string" && body.cover_image_url.trim()
        ? body.cover_image_url.trim()
        : null,
    author_id:
      typeof body.author_id === "string" && body.author_id.trim()
        ? body.author_id.trim()
        : null,
    author_name:
      String(body.author_name || "").trim() || "Learn Sikhi Contributor",
    source_name:
      String(body.source_name || "").trim() || "Learn Sikhi Original",
    source_url: validatedSourceUrl,
    category: String(body.category || "").trim() || "Gurbani Research",
    tags,
    status: finalStatus,
    created_at:
      typeof body.created_at === "string" && body.created_at
        ? body.created_at
        : now,
    updated_at: now,
  };

  const result = await upsertArticleRecord(record);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error || "Could not save article." },
      { status: 500 }
    );
  }

  try {
    revalidatePath("/articles");
    revalidatePath(`/articles/${result.article.slug}`);
    revalidatePath("/sangat");
    revalidatePath("/studio");
  } catch {
    // ignore outside request context
  }

  return NextResponse.json(
    {
      ok: true,
      backend: result.backend,
      article: result.article,
    },
    {
      status: 201,
      headers: { "Cache-Control": "no-store, max-age=0" },
    }
  );
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("wipe") !== "true") {
    return NextResponse.json(
      { ok: false, error: "Specify ?wipe=true to truncate articles & feeds." },
      { status: 400 }
    );
  }
  if (!verifyFounderAdminHeader(req)) {
    return NextResponse.json(
      { ok: false, error: "Founder Admin authentication required." },
      { status: 401 }
    );
  }

  const res = await wipeAllArticlesAndFeeds();
  try {
    revalidatePath("/articles");
    revalidatePath("/sangat");
    revalidatePath("/news");
  } catch {
    // ignore
  }

  return NextResponse.json(res, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
