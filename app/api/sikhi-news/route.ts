import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";

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

const STATE_KEY = "learnsikhi_global_site_frames_v1";
const FALLBACK_FILE = path.join(os.tmpdir(), "learnsikhi-site-frames.json");

// 15-minute in-memory server cache for live internet news
const LIVE_NEWS_CACHE_TTL_MS = 15 * 60 * 1000;
interface LiveNewsMemoryCache {
  items: SikhiNewsItem[];
  updatedAt: string;
  liveFeedSuccessCount: number;
  expiresAt: number;
}
let liveNewsCache: LiveNewsMemoryCache | null = null;

const RSS_FEEDS: { url: string; defaultSource: string; isGoogleNews?: boolean }[] = [
  {
    url: 'https://news.google.com/rss/search?q=(Sikh+OR+Sikhism+OR+Gurdwara+OR+"Harmandir+Sahib"+OR+"Sikh+community")+when:7d&hl=en-GB&gl=GB&ceid=GB:en',
    defaultSource: "Google News · Global Sangat",
    isGoogleNews: true,
  },
  {
    url: "https://news.google.com/rss/search?q=(Punjabi+media+OR+Sikh+heritage+OR+Khalsa+Aid+OR+SGPC)+when:7d&hl=en-GB&gl=GB&ceid=GB:en",
    defaultSource: "Google News · Punjab & Heritage",
    isGoogleNews: true,
  },
  {
    url: 'https://news.google.com/rss/search?q=("Golden+Temple"+OR+Amritsar+heritage+OR+"Khalsa+Aid"+OR+SGPC+OR+Gurbani)+when:7d&hl=en-GB&gl=GB&ceid=GB:en',
    defaultSource: "Google News · Amritsar & Seva",
    isGoogleNews: true,
  },
  {
    url: "https://news.google.com/rss/search?q=(site:sikhnet.com+OR+site:tribuneindia.com+Sikh+OR+Gurdwara+OR+Punjab)+when:14d&hl=en-GB&gl=GB&ceid=GB:en",
    defaultSource: "SikhNet & The Tribune",
    isGoogleNews: true,
  },
  {
    url: "https://www.baaznews.org/feed",
    defaultSource: "Baaz News",
  },
  {
    url: "https://www.sikhnet.com/news/rss.xml",
    defaultSource: "SikhNet News",
  },
  {
    url: "https://www.tribuneindia.com/rss/feed?catId=120",
    defaultSource: "The Tribune · Punjab",
  },
];

const CURATED_FALLBACK_NEWS: SikhiNewsItem[] = [
  {
    id: "curated-harmandir-sahib-langar",
    title:
      "Guru Ka Langar at Sri Harmandir Sahib Continues Feeding Over 100,000 Seekers Daily",
    category: "Seva & Community",
    sourceName: "SGPC Heritage Desk",
    source: "SGPC Heritage Desk",
    publishedAt: "2 hours ago",
    publishedAtIso: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    summary:
      "Volunteers from every walk of life gather around the clock at Sachkhand Sri Harmandir Sahib in Amritsar to prepare and serve freshly cooked vegetarian meals free of charge. The uninterrupted community kitchen embodies Guru Nanak Dev Ji's living commitment to radical equality and Vand Chakna.",
    keyPoints: [
      "Serves more than 100,000 visitors daily—and up to 200,000 on Gurpurabs—entirely through voluntary Seva.",
      "Every guest sits side by side in Pangat regardless of faith, nationality, wealth, or social standing.",
      "Supported solely by Daswandh (charitable sharing) and hands-on community volunteer shifts.",
    ],
    whyItMatters:
      "Guru Ka Langar demonstrates that spiritual devotion in Sikhi is inseparable from practical compassion, dignity, and shared nourishment for all humanity.",
    sourceUrl: "https://sgpc.net/",
    url: "https://sgpc.net/",
    imageUrl: null,
  },
  {
    id: "curated-puratan-manuscript-preservation",
    title:
      "Archival Scholars Expand High-Resolution Digitization of Puratan Gurmukhi Manuscripts",
    category: "Punjab & Heritage",
    sourceName: "Gurmat Archival Network",
    source: "Gurmat Archival Network",
    publishedAt: "5 hours ago",
    publishedAtIso: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    summary:
      "Digital heritage teams across Punjab, the UK, and North America are cataloging centuries-old Larivaar Birs, Janamsakhis, and classical Teekas for open public study. High-resolution scans protect fragile historical folios while connecting modern readers with authentic Puratan scribal traditions.",
    keyPoints: [
      "Preserves 17th- through 19th-century hand-illuminated Gurmukhi calligraphy and historical notes.",
      "Makes rare Panthic chronicles like Sri Gur Panth Prakash and Suraj Prakash freely searchable online.",
      "Enables global researchers and students to compare Puratan orthography and Gurbani grammar.",
    ],
    whyItMatters:
      "Open digital preservation safeguards Sikh literary memory from physical decay and puts primary historical sources directly into the hands of everyday learners.",
    sourceUrl: "https://www.gurmatveechar.com/",
    url: "https://www.gurmatveechar.com/",
    imageUrl: null,
  },
  {
    id: "curated-youth-gurmukhi-academies",
    title:
      "Sikh Education Initiatives Launch Open Gurmukhi & Gurmat Curricula for Global Youth",
    category: "Youth & Education",
    sourceName: "SikhRI Education Briefing",
    source: "SikhRI Education Briefing",
    publishedAt: "8 hours ago",
    publishedAtIso: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    summary:
      "Educators and Sikh research institutes are rolling out accessible Gurmukhi literacy programs, interactive history toolkits, and bilingual study guides for families and students. The resources help young learners read Gurbani directly while exploring Sikh ethics in modern civic life.",
    keyPoints: [
      "Combines phonetic Gurmukhi reading foundations with accessible English and Punjabi explanations.",
      "Equips weekend Khalsa Schools and university Sikh Student Associations with structured lesson plans.",
      "Highlights the contributions of Sikh matriarchs, scholars, and humanitarian pioneers.",
    ],
    whyItMatters:
      "Empowering youth with direct Gurmukhi literacy and historical context builds confident, grounded identity across diaspora generations.",
    sourceUrl: "https://www.sikhri.org/",
    url: "https://www.sikhri.org/",
    imageUrl: null,
  },
];

const BLOCKED_NEGATIVE_TERMS = [
  "murder",
  "homicide",
  "stabbing",
  "drug bust",
  "gang war",
  "sexual assault",
];

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

  const enclosure = block.match(
    /<enclosure[^>]+type=["']image\/[^"']+["'][^>]+url=["']([^"']+)["'][^>]*>/i
  );
  if (enclosure?.[1]) candidates.push(enclosure[1]);

  const decodedBlock = decodeXmlEntities(block);
  const imgTag = decodedBlock.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  if (imgTag?.[1]) candidates.push(imgTag[1]);

  for (const raw of candidates) {
    const valid = validateExternalUrl(decodeXmlEntities(raw));
    if (!valid) continue;
    if (/googleusercontent\.com\/|gstatic\.com|pixel|1x1|favicon/i.test(valid)) {
      continue;
    }
    return valid;
  }
  return null;
}

function normalizeCategory(raw: string): SikhiNewsCategory {
  const clean = raw.trim();
  if ((VALID_CATEGORIES as string[]).includes(clean)) {
    return clean as SikhiNewsCategory;
  }
  const lower = clean.toLowerCase();
  if (
    /\b(langar|seva|khalsa aid|charity|food|relief|volunteer|humanitarian|aid|community service)\b/.test(
      lower
    )
  ) {
    return "Seva & Community";
  }
  if (
    /\b(punjab|amritsar|anandpur|harmandir|darbar sahib|golden temple|sgpc|takht|manuscript|heritage|museum|historical|history|monument|gurpurab)\b/.test(
      lower
    )
  ) {
    return "Punjab & Heritage";
  }
  if (
    /\b(education|school|university|scholarship|gurmukhi|research|youth|student|children|academy|book|library|study)\b/.test(
      lower
    )
  ) {
    return "Youth & Education";
  }
  if (
    /\b(kirtan|raag|gatka|nagar kirtan|vaisakhi|art|music|festival|exhibition|culture)\b/.test(
      lower
    )
  ) {
    return "Kirtan & Culture";
  }
  return "Global Sangat";
}

function isRelevantSikhOrPunjabiStory(title: string, summary: string): boolean {
  const combined = `${title} ${summary}`.toLowerCase();
  if (BLOCKED_NEGATIVE_TERMS.some((term) => combined.includes(term))) {
    return false;
  }
  return /\b(sikh|sikhs|sikhi|sikhism|gurdwara|gurudwara|langar|seva|kirtan|gurbani|khalsa|harmandir|golden temple|darbar sahib|guru nanak|guru gobind|guru tegh bahadur|guru arjan|punjab|punjabi|amritsar|anandpur|sgpc|akal takht|turban|dastar|gatka|gurmukhi|vaisakhi|gurpurab)\b/i.test(
    combined
  );
}

function headlineSimilarityTokens(title: string): string[] {
  const stopWords = new Set([
    "the",
    "and",
    "for",
    "with",
    "from",
    "that",
    "this",
    "over",
    "into",
    "after",
    "amid",
    "says",
    "news",
  ]);
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));
}

function areHeadlinesSimilar(a: string, b: string): boolean {
  const normA = a.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const normB = b.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  if (normA === normB) return true;
  const tokensA = headlineSimilarityTokens(a);
  const tokensB = headlineSimilarityTokens(b);
  if (tokensA.length === 0 || tokensB.length === 0) return false;
  const setB = new Set(tokensB);
  let overlap = 0;
  for (const t of tokensA) {
    if (setB.has(t)) overlap += 1;
  }
  const ratio = overlap / Math.min(tokensA.length, tokensB.length);
  return ratio >= 0.72;
}

function buildDeterministicBriefing(
  title: string,
  cleanSummary: string,
  sourceName: string,
  category: SikhiNewsCategory,
  publishedLabel: string
): {
  summary: string;
  keyPoints: string[];
  whyItMatters: string;
} {
  // Strip redundant trailing source name from Google News snippet
  const strippedSnippet = cleanSummary
    .replace(new RegExp(`\\s*[-–—]?\\s*${sourceName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "i"), "")
    .trim();

  const hasDistinctSnippet =
    strippedSnippet.length > 35 &&
    !areHeadlinesSimilar(strippedSnippet, title);

  const summary = hasDistinctSnippet
    ? strippedSnippet.length > 290
      ? `${strippedSnippet.slice(0, 287).trim()}…`
      : strippedSnippet
    : `${title}. Published by ${sourceName} (${publishedLabel}), covering live developments in ${category.toLowerCase()} for the global Sikh and Punjabi community.`;

  const sentences = hasDistinctSnippet
    ? strippedSnippet
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 20)
    : [];

  const keyPoints: string[] = [];
  keyPoints.push(
    sentences[0] && !areHeadlinesSimilar(sentences[0], title)
      ? sentences[0]
      : `Headline report: ${title}.`
  );
  if (sentences[1]) {
    keyPoints.push(sentences[1]);
  } else {
    keyPoints.push(
      `Published by ${sourceName} (${publishedLabel}) under ${category}.`
    );
  }
  keyPoints.push(
    `Click "Read Full Article" below to read the complete original dispatch on ${sourceName}.`
  );

  const whyByCategory: Record<SikhiNewsCategory, string> = {
    "Global Sangat":
      "Keeps the worldwide Sikh Sangat connected to real-time community milestones, civic leadership, and diaspora developments.",
    "Punjab & Heritage":
      "Highlights living developments across Punjab, historic Gurdwaras, and Panthic heritage institutions.",
    "Seva & Community":
      "Reflects Guru Nanak Dev Ji's enduring ethic of Langar, Vand Chakna, and humanitarian Seva in action today.",
    "Youth & Education":
      "Spotlights educational programs, youth leadership, and Gurmukhi/Gurmat initiatives shaping the next generation.",
    "Kirtan & Culture":
      "Celebrates Gurmat Sangeet, Nagar Kirtan gatherings, and vibrant Sikh cultural heritage worldwide.",
  };

  return {
    summary,
    keyPoints: keyPoints.slice(0, 3),
    whyItMatters: whyByCategory[category],
  };
}

function parseRssOrAtomFeed(
  xml: string,
  defaultSource: string,
  isGoogleNews = false
): SikhiNewsItem[] {
  const items: SikhiNewsItem[] = [];
  const blocks = [
    ...(xml.match(/<item\b[\s\S]*?<\/item>/gi) || []),
    ...(xml.match(/<entry\b[\s\S]*?<\/entry>/gi) || []),
  ];

  for (const block of blocks) {
    const rawTitle = stripTagsAndClean(extractTag(block, "title"));
    if (!rawTitle) continue;

    let title = rawTitle;
    let sourceName =
      stripTagsAndClean(extractTag(block, "source")) || defaultSource;

    const gNewsSplit = rawTitle.lastIndexOf(" - ");
    if (gNewsSplit > 15 && (isGoogleNews || sourceName === defaultSource)) {
      const candidateTitle = rawTitle.slice(0, gNewsSplit).trim();
      const candidateSource = rawTitle.slice(gNewsSplit + 3).trim();
      if (candidateTitle.length > 12 && candidateSource.length <= 48) {
        title = candidateTitle;
        if (!stripTagsAndClean(extractTag(block, "source"))) {
          sourceName = candidateSource;
        }
      }
    }

    const sourceUrl = extractLink(block);
    if (!sourceUrl) continue;

    const rawDesc =
      extractTag(block, "description") ||
      extractTag(block, "summary") ||
      extractTag(block, "content:encoded") ||
      extractTag(block, "content");
    const cleanSummary = stripTagsAndClean(rawDesc);

    if (!isRelevantSikhOrPunjabiStory(title, cleanSummary)) continue;

    const rawDate =
      stripTagsAndClean(extractTag(block, "pubDate")) ||
      stripTagsAndClean(extractTag(block, "published")) ||
      stripTagsAndClean(extractTag(block, "updated"));
    const parsedTime = rawDate ? Date.parse(rawDate) : Number.NaN;
    const publishedAtIso = Number.isFinite(parsedTime)
      ? new Date(parsedTime).toISOString()
      : new Date().toISOString();
    const publishedAt = formatRelativePublishedAt(publishedAtIso);

    const category = normalizeCategory(`${title} ${cleanSummary} ${sourceName}`);
    const briefing = buildDeterministicBriefing(
      title,
      cleanSummary,
      sourceName,
      category,
      publishedAt
    );
    const imageUrl = extractImageUrl(block);

    const idBase = `${sourceName}-${title}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 56);

    items.push({
      id: `news-${idBase || items.length + 1}`,
      title,
      category,
      sourceName,
      source: sourceName,
      publishedAt,
      publishedAtIso,
      summary: briefing.summary,
      keyPoints: briefing.keyPoints,
      whyItMatters: briefing.whyItMatters,
      sourceUrl,
      url: sourceUrl,
      imageUrl,
    });

    if (items.length >= 15) break;
  }

  return items;
}

async function curateTopArticlesWithGemini(
  articles: SikhiNewsItem[]
): Promise<SikhiNewsItem[]> {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey || articles.length === 0) {
    return articles;
  }

  const topBatch = articles.slice(0, 10);
  const inputPayload = topBatch.map((s) => ({
    id: s.id,
    title: s.title,
    sourceName: s.sourceName,
    publishedAt: s.publishedAt,
    snippet: s.summary,
    sourceUrl: s.sourceUrl,
  }));

  const prompt = `You are the Senior News Editor for Learn Sikhi's live Sikh & Punjabi News Briefing.
You are given ${inputPayload.length} real-time news articles fetched live from the internet.
For each article, return a polished, accurate editorial slide object.
STRICT RULES:
1. Keep every fact faithful to the headline, publisher, and snippet—never fabricate events or links.
2. Preserve "id" and "sourceUrl" EXACTLY as provided.
3. Choose "category" from ONLY: "Global Sangat", "Punjab & Heritage", "Seva & Community", "Youth & Education".
4. Write a concise 2-sentence "summary" and exactly 3 concise, scannable "keyPoints" bullets.
5. Write a 1-sentence "whyItMatters" takeaway explaining the story's significance.

Return STRICT JSON matching this exact structure:
{
  "slides": [
    {
      "id": "exact id from input",
      "title": "clear compelling headline",
      "category": "Global Sangat | Punjab & Heritage | Seva & Community | Youth & Education",
      "sourceName": "publisher name",
      "publishedAt": "relative time or date from input",
      "summary": "2-sentence overview",
      "keyPoints": ["bullet 1", "bullet 2", "bullet 3"],
      "whyItMatters": "1-sentence takeaway",
      "sourceUrl": "exact untouched sourceUrl from input"
    }
  ]
}

Live articles:
${JSON.stringify(inputPayload)}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await Promise.race([
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini live news timeout")), 8000)
      ),
    ]);

    const rawText = (response.text || "").trim();
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const parsed = JSON.parse(cleaned) as {
      slides?: Array<{
        id?: string;
        title?: string;
        category?: string;
        sourceName?: string;
        publishedAt?: string;
        summary?: string;
        keyPoints?: unknown[];
        whyItMatters?: string;
      }>;
    };

    const slidesList = Array.isArray(parsed.slides)
      ? parsed.slides
      : Array.isArray(parsed)
        ? (parsed as Array<{
            id?: string;
            title?: string;
            category?: string;
            sourceName?: string;
            publishedAt?: string;
            summary?: string;
            keyPoints?: unknown[];
            whyItMatters?: string;
          }>)
        : null;

    if (!slidesList) return articles;

    const byId = new Map(
      slidesList
        .filter((s) => s && typeof s.id === "string")
        .map((s) => [s.id as string, s])
    );

    return articles.map((original) => {
      const slide = byId.get(original.id);
      if (!slide) return original;

      const cleanTitle = String(slide.title || "").trim();
      const cleanSummary = String(slide.summary || "").trim();
      const cleanWhy = String(slide.whyItMatters || "").trim();
      const cleanPoints = Array.isArray(slide.keyPoints)
        ? slide.keyPoints
            .map((p) => String(p || "").trim())
            .filter((p) => p.length > 6)
            .slice(0, 3)
        : [];

      // Always keep original.sourceUrl untouched so every redirect link works 100%
      return {
        ...original,
        title: cleanTitle || original.title,
        category: slide.category
          ? normalizeCategory(slide.category)
          : original.category,
        sourceName: String(slide.sourceName || "").trim() || original.sourceName,
        source: String(slide.sourceName || "").trim() || original.source,
        publishedAt:
          String(slide.publishedAt || "").trim() || original.publishedAt,
        summary: cleanSummary || original.summary,
        keyPoints:
          cleanPoints.length >= 2 ? cleanPoints : original.keyPoints,
        whyItMatters: cleanWhy || original.whyItMatters,
        sourceUrl: original.sourceUrl,
        url: original.sourceUrl,
        aiEnriched: true,
      };
    });
  } catch (err) {
    console.warn("[/api/sikhi-news] Gemini curation fallback to raw live RSS:", err);
    return articles;
  }
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
    const validUrl = validateExternalUrl(String(obj.sourceUrl || obj.url || ""));
    if (!obj.title || !validUrl) continue;

    const title = String(obj.title).trim();
    const sourceName = String(
      obj.sourceName || obj.source || "Learn Sikhi Editorial"
    ).trim();
    const category = normalizeCategory(String(obj.category || "Global Sangat"));
    const publishedAtIso = obj.publishedAtIso || obj.publishedAt || new Date().toISOString();
    const publishedAt = formatRelativePublishedAt(publishedAtIso);
    const summaryText =
      String(obj.summary || "").trim() ||
      "Admin-featured positive Sikh community briefing.";
    const fallbackBriefing = buildDeterministicBriefing(
      title,
      summaryText,
      sourceName,
      category,
      publishedAt
    );

    const existingPoints = Array.isArray(obj.keyPoints)
      ? obj.keyPoints.map((p) => String(p).trim()).filter(Boolean)
      : [];

    valid.push({
      id: obj.id || `custom-news-${valid.length + 1}`,
      title,
      category,
      sourceName,
      source: sourceName,
      publishedAt,
      publishedAtIso,
      summary: summaryText,
      keyPoints:
        existingPoints.length >= 2 ? existingPoints : fallbackBriefing.keyPoints,
      whyItMatters:
        String(obj.whyItMatters || "").trim() || fallbackBriefing.whyItMatters,
      highlightQuote: obj.highlightQuote
        ? String(obj.highlightQuote).trim()
        : undefined,
      sourceUrl: validUrl,
      url: validUrl,
      imageUrl: obj.imageUrl ? validateExternalUrl(String(obj.imageUrl)) : null,
      isCustom: true,
      pinned: obj.pinned !== false,
    });
  }
  return valid;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const forceRefresh = searchParams.get("refresh") === "true";

  // Return fast 15-minute in-memory cached live news unless ?refresh=true
  if (
    !forceRefresh &&
    liveNewsCache &&
    Date.now() < liveNewsCache.expiresAt &&
    liveNewsCache.items.length > 0
  ) {
    const customNews = await readAdminCustomNews();
    const merged = [
      ...customNews,
      ...liveNewsCache.items.filter(
        (it) => !customNews.some((c) => areHeadlinesSimilar(c.title, it.title))
      ),
    ].slice(0, 14);

    return NextResponse.json(
      {
        ok: true,
        cached: true,
        refreshed: false,
        liveFeedSuccessCount: liveNewsCache.liveFeedSuccessCount,
        updatedAt: liveNewsCache.updatedAt,
        items: merged,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }

  const [customNews, feedResults] = await Promise.all([
    readAdminCustomNews(),
    Promise.allSettled(
      RSS_FEEDS.map(async (feed) => {
        const res = await fetch(feed.url, {
          signal: AbortSignal.timeout(5500),
          headers: {
            "User-Agent":
              "Mozilla/5.0 (compatible; LearnSikhiNewsBot/3.0; +https://learnsikhi.com)",
            Accept:
              "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
          },
          cache: "no-store",
        });
        if (!res.ok) return [] as SikhiNewsItem[];
        const xml = await res.text();
        return parseRssOrAtomFeed(xml, feed.defaultSource, feed.isGoogleNews);
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

  // Sort all fetched live items by newest pubDate first
  aggregated.sort((a, b) => {
    const tA = Date.parse(a.publishedAtIso || a.publishedAt) || 0;
    const tB = Date.parse(b.publishedAtIso || b.publishedAt) || 0;
    return tB - tA;
  });

  // Deduplicate similar headlines
  const dedupedLive: SikhiNewsItem[] = [];
  for (const item of aggregated) {
    if (
      dedupedLive.some((existing) =>
        areHeadlinesSimilar(existing.title, item.title)
      )
    ) {
      continue;
    }
    dedupedLive.push(item);
    if (dedupedLive.length >= 12) break;
  }

  // Send top 10 newest live articles to Gemini 2.5 Flash for structured slide curation
  const curatedLive =
    dedupedLive.length > 0
      ? await curateTopArticlesWithGemini(dedupedLive.slice(0, 10))
      : CURATED_FALLBACK_NEWS;

  const updatedAt = new Date().toISOString();

  // Save in 15-minute in-memory cache when we have live stories
  if (dedupedLive.length > 0) {
    liveNewsCache = {
      items: curatedLive,
      updatedAt,
      liveFeedSuccessCount,
      expiresAt: Date.now() + LIVE_NEWS_CACHE_TTL_MS,
    };
  }

  const dedupedCustom = customNews.filter(
    (c) => !curatedLive.some((it) => areHeadlinesSimilar(c.title, it.title))
  );

  const finalItems = [...dedupedCustom, ...curatedLive].slice(0, 12);

  return NextResponse.json(
    {
      ok: true,
      cached: false,
      refreshed: forceRefresh,
      liveFeedSuccessCount,
      updatedAt,
      items: finalItems,
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}
