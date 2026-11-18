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
  | "Heritage & History"
  | "Seva & Community"
  | "Education & Youth"
  | "Kirtan & Culture";

export interface SikhiNewsItem {
  id: string;
  title: string;
  category: SikhiNewsCategory;
  sourceName: string;
  source: string;
  publishedAt: string;
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
  "Heritage & History",
  "Seva & Community",
  "Education & Youth",
  "Kirtan & Culture",
];

const STATE_KEY = "learnsikhi_global_site_frames_v1";
const FALLBACK_FILE = path.join(os.tmpdir(), "learnsikhi-site-frames.json");

const RSS_FEEDS: { url: string; defaultSource: string }[] = [
  {
    url: `https://news.google.com/rss/search?q=${encodeURIComponent(
      "Sikh community seva OR Gurdwara heritage OR Langar OR Sikh education"
    )}&hl=en-US&gl=US&ceid=US:en`,
    defaultSource: "Global Press · Sikhi",
  },
  {
    url: `https://news.google.com/rss/search?q=${encodeURIComponent(
      "Sikh heritage museum OR Harmandir Sahib OR Sikh scholarship OR Gurmat"
    )}&hl=en-US&gl=US&ceid=US:en`,
    defaultSource: "Global Press · Heritage",
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
    id: "curated-harmandir-sahib-langar",
    title:
      "Guru Ka Langar at Sri Harmandir Sahib Continues Feeding Over 100,000 Seekers Daily",
    category: "Seva & Community",
    sourceName: "SGPC Heritage Desk",
    source: "SGPC Heritage Desk",
    publishedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    summary:
      "Volunteers from every walk of life gather around the clock at Sachkhand Sri Harmandir Sahib in Amritsar to prepare and serve freshly cooked vegetarian meals free of charge. The uninterrupted community kitchen embodies Guru Nanak Dev Ji's living commitment to radical equality and Vand Chakna.",
    keyPoints: [
      "Serves more than 100,000 visitors daily—and up to 200,000 on Gurpurabs—entirely through voluntary Seva.",
      "Every guest sits side by side in Pangat regardless of faith, nationality, wealth, or social standing.",
      "Supported solely by Daswandh (charitable sharing) and hands-on community volunteer shifts.",
      "Inspires thousands of local Gurdwaras worldwide to operate open-door kitchens and disaster relief.",
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
    category: "Heritage & History",
    sourceName: "Gurmat Archival Network",
    source: "Gurmat Archival Network",
    publishedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
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
    id: "curated-tanti-saaj-revival",
    title:
      "New Generation of Kirtanias Revives Classical Tanti Saaj & 31-Raag Gurmat Sangeet",
    category: "Kirtan & Culture",
    sourceName: "SikhNet Cultural Desk",
    source: "SikhNet Cultural Desk",
    publishedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    summary:
      "Gurmat Sangeet academies across diaspora Gurdwaras are training youth in traditional string instruments including the Rabab, Dilruba, Saranda, and Taus. Students are studying time-of-day Pehar Raags and Puratan Shabad compositions directly from Sri Guru Granth Sahib Ji.",
    keyPoints: [
      "Revives instruments pioneered and cherished during the era of the Ten Gurus.",
      "Reconnects Kirtan gatherings with the 31 classical Raags and Partaal rhythms inscribed in Gurbani.",
      "Builds intergenerational mentorship between senior Hazoori Ragis and young Sangat musicians.",
    ],
    whyItMatters:
      "In Sikhi, Raag is not mere decoration—it tunes the listener's heart to the exact spiritual mood (Ras) of the Shabad.",
    sourceUrl: "https://www.sikhnet.com/",
    url: "https://www.sikhnet.com/",
    imageUrl: null,
  },
  {
    id: "curated-youth-gurmukhi-academies",
    title:
      "Sikh Education Initiatives Launch Open Gurmukhi & Gurmat Curricula for Global Youth",
    category: "Education & Youth",
    sourceName: "SikhRI Education Briefing",
    source: "SikhRI Education Briefing",
    publishedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
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
  {
    id: "curated-global-sangat-relief",
    title:
      "Sikh Humanitarian Volunteers Mobilize Rapid Food, Water & Shelter Aid Worldwide",
    category: "Global Sangat",
    sourceName: "Global Seva Watch",
    source: "Global Seva Watch",
    publishedAt: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
    summary:
      "Guided by Sarbat Da Bhala—welfare for all—Sikh volunteer networks continue partnering with local civic agencies to deliver hot meals and emergency supplies during climate and humanitarian crises. Grassroots Gurdwara teams coordinate logistics within hours of regional emergencies.",
    keyPoints: [
      "Applies the principle of Langar beyond Gurdwara walls through mobile kitchens and clean-water relief.",
      "Mobilizes youth and senior volunteers together across North America, Europe, Asia, and Oceania.",
      "Maintains transparent, grassroots-funded aid focused on immediate dignity and long-term recovery.",
    ],
    whyItMatters:
      "Selfless global relief shows the living relevance of Guru Gobind Singh Ji's teaching: recognize the entire human race as one.",
    sourceUrl: "https://www.khalsaaid.org/",
    url: "https://www.khalsaaid.org/",
    imageUrl: null,
  },
  {
    id: "curated-sikh-heritage-months",
    title:
      "Libraries, Museums & Civic Halls Celebrate Sikh Heritage Exhibits Across North America & UK",
    category: "Heritage & History",
    sourceName: "Diaspora Heritage Journal",
    source: "Diaspora Heritage Journal",
    publishedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    summary:
      "Public libraries, city halls, and regional museums are hosting curated Sikh Heritage Month exhibitions showcasing historical artifacts, fine art, and diaspora pioneer archives. Free community workshops introduce neighbors of all faiths to Sikh philosophy, turban heritage, and Kirtan.",
    keyPoints: [
      "Features curated photography, historical textiles, and stories of early Sikh settlers and civic leaders.",
      "Brings school classes and local communities together through interactive storytelling and Langar tastings.",
      "Expands public understanding of Sikhi's core pillars: Naam Japna, Kirat Karni, and Vand Chakna.",
    ],
    whyItMatters:
      "Public cultural storytelling replaces unfamiliarity with neighborly warmth, mutual respect, and shared civic pride.",
    sourceUrl: "https://www.sikhcoalition.org/",
    url: "https://www.sikhcoalition.org/",
    imageUrl: null,
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
    // Skip tiny Google News icons / tracking pixels
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
  if (/\b(langar|seva|charity|food bank|volunteer|humanitarian|aid|community)\b/.test(lower)) {
    return "Seva & Community";
  }
  if (/\b(gurdwara|harmandir|darbar sahib|manuscript|heritage|museum|historical|history|monument)\b/.test(lower)) {
    return "Heritage & History";
  }
  if (/\b(education|school|university|scholarship|gurmukhi|research|youth|student|book|library|study)\b/.test(lower)) {
    return "Education & Youth";
  }
  if (/\b(kirtan|raag|gatka|nagar kirtan|vaisakhi|art|music|festival|exhibition|culture)\b/.test(lower)) {
    return "Kirtan & Culture";
  }
  return "Global Sangat";
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

function buildDeterministicBriefing(
  title: string,
  cleanSummary: string,
  sourceName: string,
  category: SikhiNewsCategory
): {
  summary: string;
  keyPoints: string[];
  whyItMatters: string;
} {
  const sentences = cleanSummary
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 24 && s.toLowerCase() !== title.toLowerCase());

  const summary =
    sentences.length >= 2
      ? `${sentences[0]} ${sentences[1]}`.slice(0, 320)
      : sentences.length === 1
        ? `${sentences[0]} Reported by ${sourceName} as part of ongoing ${category.toLowerCase()} coverage.`
        : `${title}. Published by ${sourceName}, highlighting developments in ${category.toLowerCase()} across the Sikh community.`;

  const keyPoints: string[] = [];
  for (const sentence of sentences.slice(0, 3)) {
    const trimmed =
      sentence.length > 145 ? `${sentence.slice(0, 142).trim()}…` : sentence;
    keyPoints.push(trimmed);
  }
  if (keyPoints.length < 3) {
    keyPoints.push(`Reported by ${sourceName} under ${category}.`);
  }
  if (keyPoints.length < 3) {
    keyPoints.push(
      `Explores how Sikh heritage, Seva, and community leadership continue shaping public life today.`
    );
  }
  if (keyPoints.length < 3) {
    keyPoints.push(
      `Full original reporting and direct primary context are available via the publisher link below.`
    );
  }

  const whyByCategory: Record<SikhiNewsCategory, string> = {
    "Global Sangat":
      "Connects the worldwide Sikh Sangat by spotlighting community milestones, civic engagement, and shared resilience.",
    "Heritage & History":
      "Preserves living Sikh historical memory and deepens appreciation for Gurdwara architecture, archives, and lineage.",
    "Seva & Community":
      "Demonstrates Guru Nanak Dev Ji's enduring ethic of Vand Chakna and selfless service in action.",
    "Education & Youth":
      "Supports lifelong Gurbani learning, Gurmukhi literacy, and confident leadership for the next generation.",
    "Kirtan & Culture":
      "Celebrates the spiritual richness of Gurmat Sangeet, classical Raags, and Sikh artistic traditions.",
  };

  return {
    summary,
    keyPoints: keyPoints.slice(0, 4),
    whyItMatters: whyByCategory[category],
  };
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

    let title = rawTitle;
    let sourceName = stripTagsAndClean(extractTag(block, "source")) || defaultSource;
    const gNewsSplit = rawTitle.lastIndexOf(" - ");
    if (gNewsSplit > 18 && defaultSource.startsWith("Global Press")) {
      title = rawTitle.slice(0, gNewsSplit).trim();
      sourceName = rawTitle.slice(gNewsSplit + 3).trim() || defaultSource;
    }

    const sourceUrl = extractLink(block);
    if (!sourceUrl) continue;

    const rawDesc =
      extractTag(block, "description") ||
      extractTag(block, "summary") ||
      extractTag(block, "content");
    const cleanSummary = stripTagsAndClean(rawDesc);

    if (!isUpliftingOrRelevant(title, cleanSummary)) continue;

    const rawDate =
      stripTagsAndClean(extractTag(block, "pubDate")) ||
      stripTagsAndClean(extractTag(block, "published")) ||
      stripTagsAndClean(extractTag(block, "updated"));
    const parsedTime = rawDate ? Date.parse(rawDate) : Number.NaN;
    const publishedAt = Number.isFinite(parsedTime)
      ? new Date(parsedTime).toISOString()
      : new Date().toISOString();

    const category = normalizeCategory(`${title} ${cleanSummary}`);
    const briefing = buildDeterministicBriefing(
      title,
      cleanSummary,
      sourceName,
      category
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
      summary: briefing.summary,
      keyPoints: briefing.keyPoints,
      whyItMatters: briefing.whyItMatters,
      sourceUrl,
      url: sourceUrl,
      imageUrl,
    });

    if (items.length >= 6) break;
  }

  return items;
}

async function enrichStoriesWithGemini(
  stories: SikhiNewsItem[]
): Promise<SikhiNewsItem[]> {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey || stories.length === 0) {
    return stories;
  }

  const batch = stories.slice(0, 8);
  const inputPayload = batch.map((s) => ({
    id: s.id,
    title: s.title,
    sourceName: s.sourceName,
    category: s.category,
    rawSummary: s.summary,
  }));

  const prompt = `You are the Senior Editorial Curator for Learn Sikhi's Sikh News Briefing.
Transform each input news item into a crisp, uplifting, factually faithful structured editorial briefing.
NEVER invent statistics, dates, or quotes that are not supported by the input.

Return STRICT JSON matching this exact schema:
{
  "briefings": [
    {
      "id": "same id as input",
      "title": "clear compelling headline (max 110 chars)",
      "category": "Global Sangat | Heritage & History | Seva & Community | Education & Youth | Kirtan & Culture",
      "summary": "concise 2-sentence editorial overview (clear, engaging plain English)",
      "keyPoints": ["3 to 4 punchy, scannable factual bullet points"],
      "whyItMatters": "1 impactful sentence explaining why this matters for the global Sangat or seekers"
    }
  ]
}

Input stories:
${JSON.stringify(inputPayload)}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await Promise.race([
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini news briefing timeout")), 7500)
      ),
    ]);

    const rawText = (response.text || "").trim();
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const parsed = JSON.parse(cleaned) as {
      briefings?: Array<{
        id?: string;
        title?: string;
        category?: string;
        summary?: string;
        keyPoints?: unknown[];
        whyItMatters?: string;
      }>;
    };

    if (!Array.isArray(parsed.briefings)) {
      return stories;
    }

    const byId = new Map(
      parsed.briefings
        .filter((b) => b && typeof b.id === "string")
        .map((b) => [b.id as string, b])
    );

    return stories.map((story) => {
      const enriched = byId.get(story.id);
      if (!enriched) return story;

      const cleanTitle = String(enriched.title || "").trim();
      const cleanSummary = String(enriched.summary || "").trim();
      const cleanWhy = String(enriched.whyItMatters || "").trim();
      const cleanPoints = Array.isArray(enriched.keyPoints)
        ? enriched.keyPoints
            .map((p) => String(p || "").trim())
            .filter((p) => p.length > 8)
            .slice(0, 4)
        : [];

      return {
        ...story,
        title: cleanTitle || story.title,
        category: enriched.category
          ? normalizeCategory(enriched.category)
          : story.category,
        summary: cleanSummary || story.summary,
        keyPoints: cleanPoints.length >= 2 ? cleanPoints : story.keyPoints,
        whyItMatters: cleanWhy || story.whyItMatters,
        aiEnriched: true,
      };
    });
  } catch {
    return stories;
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
    const summaryText =
      String(obj.summary || "").trim() ||
      "Admin-featured positive Sikhi community briefing.";
    const fallbackBriefing = buildDeterministicBriefing(
      title,
      summaryText,
      sourceName,
      category
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
      publishedAt: obj.publishedAt || new Date().toISOString(),
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

  const [customNews, feedResults] = await Promise.all([
    readAdminCustomNews(),
    Promise.allSettled(
      RSS_FEEDS.map(async (feed) => {
        const res = await fetch(feed.url, {
          signal: AbortSignal.timeout(4500),
          headers: {
            "User-Agent": "LearnSikhiNewsBot/2.0 (+https://learnsikhi.com)",
            Accept:
              "application/rss+xml, application/atom+xml, application/xml, text/xml",
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

  const seenTitles = new Set<string>();
  const dedupedLive: SikhiNewsItem[] = [];
  for (const item of aggregated) {
    const key = item.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
    if (!key || seenTitles.has(key)) continue;
    seenTitles.add(key);
    dedupedLive.push(item);
  }

  dedupedLive.sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)
  );

  // Enrich live RSS items with Gemini 2.5 Flash structured briefings
  const enrichedLive =
    dedupedLive.length > 0
      ? await enrichStoriesWithGemini(dedupedLive.slice(0, 10))
      : [];

  // Ensure at least 6 rich stories by blending curated fallback items
  const liveOrFallback = [...enrichedLive];
  if (liveOrFallback.length < 6) {
    for (const fb of CURATED_FALLBACK_NEWS) {
      const key = fb.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
      if (!seenTitles.has(key)) {
        seenTitles.add(key);
        liveOrFallback.push(fb);
      }
    }
  }

  const dedupedCustom = customNews.filter((c) => {
    const key = c.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
    if (!key || seenTitles.has(key)) return false;
    seenTitles.add(key);
    return true;
  });

  const finalItems = [...dedupedCustom, ...liveOrFallback].slice(0, 16);

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
