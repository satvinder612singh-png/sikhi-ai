import { NextResponse } from "next/server";
import { listArticles, type ArticleRecord } from "@/lib/articles-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type SikhiNewsCategory =
  | "Global Sangat"
  | "Punjab & Heritage"
  | "Seva & Community"
  | "Youth & Education"
  | "Kirtan & Culture";

export interface SikhiNewsItem {
  id: string;
  title: string;
  category: SikhiNewsCategory;
  sourceName: string;
  source: string;
  publishedAt: string;
  publishedAtIso?: string;
  summary: string;
  keyPoints: string[];
  whyItMatters: string;
  highlightQuote?: string;
  sourceUrl: string;
  url: string;
  internalSlug?: string;
  imageUrl: string | null;
  isCustom?: boolean;
  pinned?: boolean;
  aiEnriched?: boolean;
}

function formatDate(isoString: string): string {
  const ts = Date.parse(isoString);
  if (!Number.isFinite(ts)) return "Recent";
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function mapArticleToNewsItem(article: ArticleRecord): SikhiNewsItem {
  const internalUrl = `/articles/${article.slug}`;
  const publishedIso = article.created_at;
  return {
    id: `sikhstacks-${article.id}`,
    title: article.title,
    category: "Global Sangat",
    sourceName: article.source_name || "SikhStacks",
    source: article.source_name || "SikhStacks",
    publishedAt: formatDate(publishedIso),
    publishedAtIso: publishedIso,
    summary: article.summary_short,
    keyPoints: [
      article.summary_short,
      article.source_name
        ? `Cited Source: ${article.source_name}`
        : "Published on SikhStacks",
    ],
    whyItMatters: "Published directly on Learn Sikhi.",
    sourceUrl: internalUrl,
    url: internalUrl,
    internalSlug: article.slug,
    imageUrl: article.cover_image_url || null,
    isCustom: true,
    pinned: true,
    aiEnriched: false,
  };
}

export async function GET() {
  try {
    const { articles } = await listArticles({ status: "published" });
    const items = articles.slice(0, 12).map(mapArticleToNewsItem);
    return NextResponse.json({
      ok: true,
      items,
      updatedAt: new Date().toISOString(),
      sourceMode: "manual-only",
    });
  } catch {
    return NextResponse.json({
      ok: true,
      items: [],
      updatedAt: new Date().toISOString(),
      sourceMode: "manual-only",
    });
  }
}
