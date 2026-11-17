import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";

export const revalidate = 3600;

export type SikhiNewsCategory =
  | "Seva & Langar"
  | "Gurdwara Heritage"
  | "Sikhi Education"
  | "Kirtan & Culture"
  | "Community Update";

export interface SikhiNewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  category: SikhiNewsCategory;
  isCustom?: boolean;
  pinned?: boolean;
}

const STATE_KEY = "learnsikhi_global_site_frames_v1";
const FALLBACK_FILE = path.join(os.tmpdir(), "learnsikhi-site-frames.json");

const RSS_FEEDS: { url: string; defaultSource: string }[] = [
  {
    url: `https://news.google.com/rss/search?q=${encodeURIComponent(
      "Sikh community seva OR Gurdwara heritage OR Sikhi education OR Langar"
    )}&hl=en-US&gl=US&ceid=US:en`,
    defaultSource: "Google News · Sikhi",
  },
  {
    url: `https://news.google.com/rss/search?q=${encodeURIComponent(
      "Sikh heritage museum OR Harmandir Sahib OR Sikh scholarship OR Gurmat"
    )}&hl=en-US&gl=US&ceid=US:en`,
    defaultSource: "Google News · Heritage",
  },
  {
    url: "https://www.sikhnet.com/news/rss.xml",
    defaultSource: "SikhNet News",
  },
  {
    url: "https://www.baaznews.org/feed",
    defaultSource: "Baaz News",
  },
];

const CURATED_FALLBACK_NEWS: SikhiNewsItem[] = [
  {
    id: "curated-harmandir-sahib-heritage",
    title: "Daily Langar & Seva Traditions Continue Serving 100,000+ Visitors at Sri Harmandir Sahib",
    summary:
      "Volunteers and Sangat members from around the world come together daily in Guru Ka Langar at Amritsar, upholding Guru Nanak Dev Ji's timeless institution of equality and selfless service.",
    url: "https://sgpc.net/",
    source: "Sikhi Heritage Desk",
    publishedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    category: "Seva & Langar",
  },
  {
    id: "curated-manuscript-digitization",
    title: "Digital Preservation Efforts Expand Access to Puratan Gurmukhi Manuscripts & Pothis",
    summary:
      "Archival initiatives across Punjab and the global Sikh diaspora continue high-resolution preservation of 18th- and 19th-century Larivaar Birs and classical Gurmat commentaries.",
    url: "https://www.gurmatveechar.com/",
    source: "Gurmat Archival Network",
    publishedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    category: "Gurdwara Heritage",
  },
  {
    id: "curated-tanti-saaj-revival",
    title: "Young Kirtan Scholars Revive Traditional Tanti Saaj String Instruments Across Global Gurdwaras",
    summary:
      "Music academies and Gurmat Sangeet programs are mentoring new generations in Rabab, Dilruba, Saranda, and Taus performance rooted in the 31 classical Raags of Sri Guru Granth Sahib Ji.",
    url: "https://www.sikhnet.com/",
    source: "Gurmat Sangeet Review",
    publishedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    category: "Kirtan & Culture",
  },
  {
    id: "curated-sikh-studies-symposium",
    title: "Global Sikh Studies Scholarships & Community Khalsa Schools Highlight Sikhi Education",
    summary:
      "University chairs and weekend Gurmukhi academies are releasing open-access curriculum guides connecting youth with Gurbani grammar, Sikh history, and civic ethics.",
    url: "https://www.sikhri.org/",
    source: "Sikhi Education Chronicle",
    publishedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    category: "Sikhi Education",
  },
];

const BLOCKED_NEGATIVE_TERMS = [
  "murder",
  "killed",
  "shooting",
  "homicide",
  "assault",
  "arrested",
  "indicted",
  "terror",
  "gang",
  "stabbing",
  "drug bust",
  "scandal",
];

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
  const decoded = decodeXmlEntities(raw);
  return decoded
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(block: string, tag: string): string {
  const regex = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i");
  const match = block.match(regex);
  return match ? match[1] : "";
}

function extractLink(block: string): string {
  const hrefMatch = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*\/?>/i);
  if (hrefMatch?.[1]) return decodeXmlEntities(hrefMatch[1].trim());
  const linkBody = stripTagsAndClean(extractTag(block, "link"));
  return linkBody;
}

function classifyNewsCategory(text: string): SikhiNewsCategory {
  const lower = text.toLowerCase();
  if (/\b(langar|seva|charity|food bank|volunteer|humanitarian|aid)\b/.test(lower)) {
    return "Seva & Langar";
  }
  if (/\b(gurdwara|harmandir|darbar sahib|manuscript|heritage|museum|historical|monument)\b/.test(lower)) {
    return "Gurdwara Heritage";
  }
  if (/\b(education|school|university|scholarship|gurmukhi|research|book|library|study)\b/.test(lower)) {
    return "Sikhi Education";
  }
  if (/\b(kirtan|raag|gatka|nagar kirtan|vaisakhi|art|music|festival|exhibition)\b/.test(lower)) {
    return "Kirtan & Culture";
  }
  return "Community Update";
}

function isUpliftingOrRelevant(title: string, summary: string): boolean {
  const combined = `${title} ${summary}`.toLowerCase();
  if (BLOCKED_NEGATIVE_TERMS.some((term) => combined.includes(term))) {
    return false;
  }
  return /\b(sikh|sikhi|gurdwara|langar|seva|kirtan|gurbani|khalsa|harmandir|guru nanak|guru gobind|punjab|nagar kirtan|gatka|gurmukhi|vaisakhi|karah)\b/i.test(
    combined
  );
}

function parseRssOrAtomFeed(xml: string, defaultSource: string): SikhiNewsItem[] {
  const items: SikhiNewsItem[] = [];
  const blocks = [
    ...(xml.match(/<item\b[\s\S]*?<\/item>/gi) || []),
    ...(xml.match(/<entry\b[\s\S]*?<\/entry>/gi) || []),
  ];

  for (const block of blocks) {
    const rawTitle = stripTagsAndClean(extractTag(block, "title"));
    if (!rawTitle) continue;

    // Split Google News "Headline - Publisher" suffix cleanly when available
    let title = rawTitle;
    let source = stripTagsAndClean(extractTag(block, "source")) || defaultSource;
    const gNewsSplit = rawTitle.lastIndexOf(" - ");
    if (gNewsSplit > 18 && defaultSource.startsWith("Google News")) {
      title = rawTitle.slice(0, gNewsSplit).trim();
      source = rawTitle.slice(gNewsSplit + 3).trim() || defaultSource;
    }

    const url = extractLink(block);
    if (!url || !/^https?:\/\//i.test(url)) continue;

    const rawDesc =
      extractTag(block, "description") ||
      extractTag(block, "summary") ||
      extractTag(block, "content");
    const cleanSummary = stripTagsAndClean(rawDesc);
    const summary =
      cleanSummary.length > 210
        ? `${cleanSummary.slice(0, 207).trim()}...`
        : cleanSummary || `Published via ${source}.`;

    if (!isUpliftingOrRelevant(title, summary)) continue;

    const rawDate =
      stripTagsAndClean(extractTag(block, "pubDate")) ||
      stripTagsAndClean(extractTag(block, "published")) ||
      stripTagsAndClean(extractTag(block, "updated"));
    const parsedTime = rawDate ? Date.parse(rawDate) : Number.NaN;
    const publishedAt = Number.isFinite(parsedTime)
      ? new Date(parsedTime).toISOString()
      : new Date().toISOString();

    const idBase = `${source}-${title}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 56);

    items.push({
      id: `news-${idBase || items.length + 1}`,
      title,
      summary,
      url,
      source,
      publishedAt,
      category: classifyNewsCategory(`${title} ${summary}`),
    });

    if (items.length >= 8) break;
  }

  return items;
}

async function readAdminCustomNews(): Promise<SikhiNewsItem[]> {
  let rawState: Record<string, unknown> | null = null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      });
      const { data, error } = await supabase
        .from("site_state")
        .select("value")
        .eq("key", STATE_KEY)
        .maybeSingle();
      if (!error && data?.value && typeof data.value === "object") {
        rawState = data.value as Record<string, unknown>;
      }
    } catch {
      // ignore and fall back to temp file
    }
  }

  if (!rawState) {
    try {
      const fileText = await fs.readFile(FALLBACK_FILE, "utf8");
      const parsed = JSON.parse(fileText);
      if (parsed && typeof parsed === "object") {
        rawState = parsed as Record<string, unknown>;
      }
    } catch {
      // ignore
    }
  }

  if (!rawState) return [];

  const layoutMap =
    rawState.sectionLayoutMap && typeof rawState.sectionLayoutMap === "object"
      ? (rawState.sectionLayoutMap as Record<string, unknown>)
      : {};
  const customListObj =
    layoutMap.customNewsList && typeof layoutMap.customNewsList === "object"
      ? (layoutMap.customNewsList as { items?: unknown[] })
      : null;

  const rawLists = [
    ...(Array.isArray(rawState.customNews) ? rawState.customNews : []),
    ...(Array.isArray(customListObj?.items) ? customListObj.items : []),
  ];

  const valid: SikhiNewsItem[] = [];
  for (const entry of rawLists) {
    if (!entry || typeof entry !== "object") continue;
    const obj = entry as Partial<SikhiNewsItem>;
    if (!obj.title || !obj.url) continue;
    valid.push({
      id: obj.id || `custom-news-${valid.length + 1}`,
      title: String(obj.title).trim(),
      summary: String(obj.summary || "").trim() || "Admin-featured Sikhi news story.",
      url: String(obj.url).trim(),
      source: String(obj.source || "Admin Dispatch").trim(),
      publishedAt: obj.publishedAt || new Date().toISOString(),
      category: (obj.category as SikhiNewsCategory) || "Community Update",
      isCustom: true,
      pinned: obj.pinned !== false,
    });
  }
  return valid;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const forceRefresh = searchParams.get("refresh") === "true";

  const [customNews, feedResults] = await Promise.all([
    readAdminCustomNews(),
    Promise.allSettled(
      RSS_FEEDS.map(async (feed) => {
        const res = await fetch(feed.url, {
          signal: AbortSignal.timeout(4000),
          headers: {
            "User-Agent": "LearnSikhiNewsBot/1.0 (+https://learnsikhi.com)",
            Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
          },
          ...(forceRefresh
            ? { cache: "no-store" as const }
            : { next: { revalidate: 3600 } }),
        });
        if (!res.ok) return [] as SikhiNewsItem[];
        const xml = await res.text();
        return parseRssOrAtomFeed(xml, feed.defaultSource);
      })
    ),
  ]);

  const aggregated: SikhiNewsItem[] = [];
  let liveFeedSuccessCount = 0;

  for (const result of feedResults) {
    if (result.status === "fulfilled" && result.value.length > 0) {
      liveFeedSuccessCount += 1;
      aggregated.push(...result.value);
    }
  }

  // Deduplicate live stories by normalized title
  const seenTitles = new Set<string>();
  const dedupedLive: SikhiNewsItem[] = [];
  for (const item of aggregated) {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (!key || seenTitles.has(key)) continue;
    seenTitles.add(key);
    dedupedLive.push(item);
  }

  dedupedLive.sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
  );

  // Merge curated fallback if live feeds returned fewer than 4 items
  const liveOrFallback = [...dedupedLive];
  if (liveOrFallback.length < 4) {
    for (const fb of CURATED_FALLBACK_NEWS) {
      const key = fb.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
      if (!seenTitles.has(key)) {
        seenTitles.add(key);
        liveOrFallback.push(fb);
      }
    }
  }

  // Admin-pinned/custom items appear first cleanly
  const dedupedCustom = customNews.filter((c) => {
    const key = c.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (!key || seenTitles.has(key)) return false;
    seenTitles.add(key);
    return true;
  });

  const finalItems = [...dedupedCustom, ...liveOrFallback].slice(0, 18);

  return NextResponse.json(
    {
      ok: true,
      refreshed: forceRefresh,
      liveFeedSuccessCount,
      updatedAt: new Date().toISOString(),
      items: finalItems,
    },
    {
      headers: {
        "Cache-Control": forceRefresh
          ? "no-store, no-cache, must-revalidate"
          : "public, s-maxage=3600, stale-while-revalidate=600",
      },
    }
  );
}
