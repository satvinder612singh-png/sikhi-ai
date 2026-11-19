import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {
  listApprovedSources,
  listArticles,
  normalizeDomain,
  type ApprovedSourceRecord,
  type ArticleRecord,
} from "@/lib/articles-store";

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

const VALID_CATEGORIES: SikhiNewsCategory[] = [
  "Global Sangat",
  "Punjab & Heritage",
  "Seva & Community",
  "Youth & Education",
  "Kirtan & Culture",
];

// 15-minute in-memory server cache strictly for whitelisted Sikh educational feeds
const CACHE_TTL_MS = 15 * 60 * 1000;
let curatedFeedCache: {
  items: SikhiNewsItem[];
  updatedAt: string;
  approvedDomains: string[];
  liveFeedSuccessCount: number;
  expiresAt: number;
} | null = null;

function formatRelativePublishedAt(isoString: string): string {
  const ts = Date.parse(isoString);
  if (!Number.isFinite(ts)) return "Recent";
  const diffMs = Math.max(0, Date.now() - ts);
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 5) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays <= 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function decodeXmlEntities(input: string): string {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = Number.parseInt(dec, 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : "";
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      const code = Number.parseInt(hex, 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : "";
    });
}

function stripTagsAndClean(raw: string): string {
  return decodeXmlEntities(raw)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(block: string, tag: string): string {
  const regex = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = block.match(regex);
  return match ? match[1] : "";
}

function validateExternalUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

function extractLink(block: string): string | null {
  const hrefMatch = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*\/?>/i);
  if (hrefMatch?.[1]) {
    const valid = validateExternalUrl(decodeXmlEntities(hrefMatch[1]));
    if (valid) return valid;
  }
  const linkBody = stripTagsAndClean(extractTag(block, "link"));
  return validateExternalUrl(linkBody);
}

function extractImageUrl(block: string): string | null {
  const candidates: string[] = [];
  const mediaContent = block.match(
    /<media:content[^>]+url=["']([^"']+)["'][^>]*>/i
  );
  if (mediaContent?.[1]) candidates.push(mediaContent[1]);

  const mediaThumb = block.match(
    /<media:thumbnail[^>]+url=["']([^"']+)["'][^>]*>/i
  );
  if (mediaThumb?.[1]) candidates.push(mediaThumb[1]);

  const decodedBlock = decodeXmlEntities(block);
  const imgTag = decodedBlock.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  if (imgTag?.[1]) candidates.push(imgTag[1]);

  for (const raw of candidates) {
    const valid = validateExternalUrl(decodeXmlEntities(raw));
    if (valid && !/pixel|1x1|favicon/i.test(valid)) return valid;
  }
  return null;
}

function normalizeCategory(raw: string): SikhiNewsCategory {
  const clean = raw.trim();
  if ((VALID_CATEGORIES as string[]).includes(clean)) {
    return clean as SikhiNewsCategory;
  }
  const lower = clean.toLowerCase();
  if (/\b(seva|langar|advocacy|rights|community|wso|charity)\b/.test(lower)) {
    return "Seva & Community";
  }
  if (/\b(history|granth|suraj|panth|manuscript|punjab|heritage|manglacharan|sovereignty|bunga)\b/.test(lower)) {
    return "Punjab & Heritage";
  }
  if (/\b(education|study|youth|school|council|gurmukhi|curriculum)\b/.test(lower)) {
    return "Youth & Education";
  }
  if (/\b(kirtan|raag|sangeet|culture|poetry)\b/.test(lower)) {
    return "Kirtan & Culture";
  }
  return "Global Sangat";
}

function isUrlWhitelisted(
  url: string,
  allowedDomains: Set<string>
): boolean {
  const host = normalizeDomain(url);
  if (!host) return false;
  for (const allowed of allowedDomains) {
    if (host === allowed || host.endsWith(`.${allowed}`)) {
      return true;
    }
  }
  return false;
}

function parseApprovedSourceRss(
  xml: string,
  source: ApprovedSourceRecord,
  allowedDomains: Set<string>
): SikhiNewsItem[] {
  const items: SikhiNewsItem[] = [];
  const blocks = [
    ...(xml.match(/<item\b[\s\S]*?<\/item>/gi) || []),
    ...(xml.match(/<entry\b[\s\S]*?<\/entry>/gi) || []),
  ];

  for (const block of blocks) {
    const title = stripTagsAndClean(extractTag(block, "title"));
    if (!title) continue;

    const sourceUrl = extractLink(block);
    if (!sourceUrl || !isUrlWhitelisted(sourceUrl, allowedDomains)) continue;

    const rawDesc =
      extractTag(block, "description") ||
      extractTag(block, "summary") ||
      extractTag(block, "content:encoded") ||
      extractTag(block, "content");
    const cleanDesc = stripTagsAndClean(rawDesc);

    const rawDate =
      stripTagsAndClean(extractTag(block, "pubDate")) ||
      stripTagsAndClean(extractTag(block, "published")) ||
      stripTagsAndClean(extractTag(block, "updated"));
    const parsedTime = rawDate ? Date.parse(rawDate) : Number.NaN;
    const publishedAtIso = Number.isFinite(parsedTime)
      ? new Date(parsedTime).toISOString()
      : new Date().toISOString();
    const publishedAt = formatRelativePublishedAt(publishedAtIso);

    const category = normalizeCategory(`${title} ${cleanDesc} ${source.category}`);
    const sentences = cleanDesc
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 22);

    const summary =
      sentences.length >= 2
        ? `${sentences[0]} ${sentences[1]}`.slice(0, 300)
        : cleanDesc.slice(0, 260) ||
          `Curated Sikh educational dispatch from ${source.name}.`;

    const keyPoints = [
      sentences[0]?.slice(0, 140) || `Featured research from ${source.name}.`,
      sentences[1]?.slice(0, 140) ||
        `Published under ${source.category} (${source.domain}).`,
      `Verified Sikh educational source on Learn Sikhi's approved whitelist.`,
    ];

    items.push({
      id: `whitelisted-${source.domain}-${title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 48)}`,
      title,
      category,
      sourceName: source.name,
      source: source.name,
      publishedAt,
      publishedAtIso,
      summary,
      keyPoints,
      whyItMatters: `Curated directly from ${source.name}, a verified Sikh educational platform dedicated to primary Gurmat scholarship and heritage.`,
      sourceUrl,
      url: sourceUrl,
      imageUrl: extractImageUrl(block),
    });

    if (items.length >= 4) break;
  }

  return items;
}

function articleToNewsSlide(article: ArticleRecord): SikhiNewsItem {
  const sentences = article.summary_short
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    id: `article-${article.id}`,
    title: article.title,
    category: normalizeCategory(`${article.category} ${article.title}`),
    sourceName: article.source_name || "Learn Sikhi Original",
    source: article.source_name || "Learn Sikhi Original",
    publishedAt: formatRelativePublishedAt(article.created_at),
    publishedAtIso: article.created_at,
    summary: article.summary_short,
    keyPoints: [
      sentences[0] || article.summary_short,
      `Source citation: ${article.source_name || "Learn Sikhi Original"}.`,
      `Read the complete formatted essay directly inside Learn Sikhi without leaving the platform.`,
    ],
    whyItMatters: `Published directly inside Learn Sikhi's research sanctuary by ${article.author_name}.`,
    sourceUrl: `/articles/${article.slug}`,
    url: `/articles/${article.slug}`,
    internalSlug: article.slug,
    imageUrl: article.cover_image_url,
    isCustom: true,
    pinned: true,
  };
}

async function polishWhitelistedSlidesWithGemini(
  slides: SikhiNewsItem[]
): Promise<SikhiNewsItem[]> {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey || slides.length === 0) return slides;

  const externalBatch = slides.filter((s) => !s.internalSlug).slice(0, 8);
  if (externalBatch.length === 0) return slides;

  const payload = externalBatch.map((s) => ({
    id: s.id,
    title: s.title,
    sourceName: s.sourceName,
    publishedAt: s.publishedAt,
    snippet: s.summary,
    sourceUrl: s.sourceUrl,
  }));

  const prompt = `You are the Editorial Curator for Learn Sikhi.
Refine these entries fetched strictly from verified Sikh educational sources (Bunga Azaadi, Manglacharan, Study Sikhi, Sikh Education Council, Discover Sikhi, World Sikh Organization).
Keep all facts faithful and preserve "id" and "sourceUrl" untouched.
Return STRICT JSON:
{
  "slides": [
    {
      "id": "exact id",
      "title": "clear scholarly headline",
      "category": "Global Sangat | Punjab & Heritage | Seva & Community | Youth & Education | Kirtan & Culture",
      "summary": "concise 2-sentence overview",
      "keyPoints": ["bullet 1", "bullet 2", "bullet 3"],
      "whyItMatters": "1-sentence takeaway"
    }
  ]
}
Input: ${JSON.stringify(payload)}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await Promise.race([
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json", temperature: 0.3 },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini whitelist curation timeout")), 7500)
      ),
    ]);

    const cleaned = (response.text || "")
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const parsed = JSON.parse(cleaned) as {
      slides?: Array<{
        id?: string;
        title?: string;
        category?: string;
        summary?: string;
        keyPoints?: unknown[];
        whyItMatters?: string;
      }>;
    };

    if (!Array.isArray(parsed.slides)) return slides;
    const byId = new Map(
      parsed.slides
        .filter((s) => s && typeof s.id === "string")
        .map((s) => [s.id as string, s])
    );

    return slides.map((original) => {
      const updated = byId.get(original.id);
      if (!updated) return original;
      const pts = Array.isArray(updated.keyPoints)
        ? updated.keyPoints
            .map((p) => String(p || "").trim())
            .filter((p) => p.length > 6)
            .slice(0, 3)
        : [];
      return {
        ...original,
        title: String(updated.title || "").trim() || original.title,
        category: updated.category
          ? normalizeCategory(updated.category)
          : original.category,
        summary: String(updated.summary || "").trim() || original.summary,
        keyPoints: pts.length >= 2 ? pts : original.keyPoints,
        whyItMatters:
          String(updated.whyItMatters || "").trim() || original.whyItMatters,
        aiEnriched: true,
      };
    });
  } catch {
    return slides;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const forceRefresh = searchParams.get("refresh") === "true";

  const [{ sources }, { articles: publishedArticles }] = await Promise.all([
    listApprovedSources(),
    listArticles({ status: "published" }),
  ]);

  const approvedDomains = new Set(
    sources.map((s) => normalizeDomain(s.domain || s.url)).filter(Boolean)
  );
  const internalSlides = publishedArticles.map(articleToNewsSlide);

  if (
    !forceRefresh &&
    curatedFeedCache &&
    Date.now() < curatedFeedCache.expiresAt
  ) {
    const merged = [...internalSlides, ...curatedFeedCache.items].slice(0, 14);
    return NextResponse.json(
      {
        ok: true,
        cached: true,
        whitelistedOnly: true,
        approvedSources: sources,
        liveFeedSuccessCount: curatedFeedCache.liveFeedSuccessCount,
        updatedAt: curatedFeedCache.updatedAt,
        items: merged,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }

  // Fetch ONLY RSS feeds explicitly belonging to approved Sikh educational sources
  const feedSources = sources.filter(
    (s) => s.is_active && s.rss_url && /^https?:\/\//i.test(s.rss_url)
  );

  const feedResults = await Promise.allSettled(
    feedSources.map(async (src) => {
      const res = await fetch(src.rss_url!, {
        signal: AbortSignal.timeout(5500),
        headers: {
          "User-Agent": "LearnSikhiScholarlyReader/4.0 (+https://learnsikhi.com)",
          Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
        },
        cache: "no-store",
      });
      if (!res.ok) return [] as SikhiNewsItem[];
      const xml = await res.text();
      return parseApprovedSourceRss(xml, src, approvedDomains);
    })
  );

  const collectedExternal: SikhiNewsItem[] = [];
  let liveFeedSuccessCount = 0;

  for (const r of feedResults) {
    if (r.status === "fulfilled" && r.value.length > 0) {
      liveFeedSuccessCount += 1;
      collectedExternal.push(...r.value);
    }
  }

  collectedExternal.sort(
    (a, b) =>
      (Date.parse(b.publishedAtIso || "") || 0) -
      (Date.parse(a.publishedAtIso || "") || 0)
  );

  const polishedExternal = await polishWhitelistedSlidesWithGemini(
    collectedExternal.slice(0, 10)
  );

  const updatedAt = new Date().toISOString();
  curatedFeedCache = {
    items: polishedExternal,
    updatedAt,
    approvedDomains: Array.from(approvedDomains),
    liveFeedSuccessCount,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };

  const finalItems = [...internalSlides, ...polishedExternal].slice(0, 14);

  return NextResponse.json(
    {
      ok: true,
      cached: false,
      whitelistedOnly: true,
      approvedSources: sources,
      liveFeedSuccessCount,
      updatedAt,
      items: finalItems,
    },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}
