export type ErrorCode = string | number;

export type SourceItem = {
  id: string;
  title: string;
  gurmukhi?: string;
  category: "Primary Scripture" | "Canonical Exegesis" | "Historical Text" | "Code of Conduct";
  reference: string;
  period: string;
  excerpt: string;
  detailedNotes: string[];
  keywords: string[];
};

export type ApiLogEntry = {
  id: string;
  timestamp: string;
  question: string;
  model: string;
  status: number;
  durationMs: number;
  preview: string;
};

const globalForState = globalThis as unknown as {
  sikhiLogs?: ApiLogEntry[];
  cachedModels?: string[];
};

if (!globalForState.sikhiLogs) {
  globalForState.sikhiLogs = [];
}

export function addApiLog(entry: Omit<ApiLogEntry, "id" | "timestamp">) {
  const newEntry: ApiLogEntry = {
    id: Math.random().toString(36).slice(2, 9),
    timestamp: new Date().toLocaleTimeString(),
    ...entry,
  };
  globalForState.sikhiLogs = [newEntry, ...(globalForState.sikhiLogs || [])].slice(0, 30);
  return newEntry;
}

export function getApiLogs(): ApiLogEntry[] {
  return globalForState.sikhiLogs || [];
}

export const SIKHI_SOURCES: SourceItem[] = [
  {
    id: "sggs-ang-1",
    title: "Sri Guru Granth Sahib Ji — Japji Sahib",
    gurmukhi: "ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ",
    category: "Primary Scripture",
    reference: "Ang 1–8 • Guru Nanak Dev Ji",
    period: "1604 CE • Adi Granth Compilation",
    excerpt:
      "Establishes Ik Onkar (One Universal Creator), the cosmic law of Hukam (Divine Will), and spiritual realization through Naam and truthful living.",
    detailedNotes: [
      "Japji Sahib opens Sri Guru Granth Sahib Ji on Ang 1 with the Mool Mantar, defining the Divine as Ik Onkar—One indivisible, timeless, fearless, and rancor-free Reality.",
      "In the first Pauri, Guru Nanak Dev Ji asks how one can become truthful (Sachiara) and dissolve the veil of falsehood, answering: 'Hukam Rajai Chalna Nanak Likhia Naal'—by walking in harmony with Hukam, the Divine Order woven into existence.",
      "Rather than blind fate, Hukam in Gurbani represents the cosmic moral and natural law that governs creation. Recognizing Hukam dissolves Haumai (self-centered ego) and aligns the mind with peace, humility, and purposeful action."
    ],
    keywords: ["hukam", "ik onkar", "naam", "japji", "god", "creator", "ego", "haumai", "meaning", "mool mantar"],
  },
  {
    id: "sggs-langar",
    title: "Sri Guru Granth Sahib Ji — Ramkali Ki Vaar",
    gurmukhi: "ਲੰਗਰੁ ਚਲੈ ਗੁਰ ਸਬਦਿ ਹਰਿ ਤੋਟਿ ਨ ਆਵਈ ਖਟੀਐ ॥",
    category: "Primary Scripture",
    reference: "Ang 967 • Rai Balwand & Satta Doom",
    period: "16th Century CE",
    excerpt:
      "Describes the sacred institution of Langar where all sit together as equals (Pangat) sharing food blessed through Seva and Gur Shabad.",
    detailedNotes: [
      "Ramkali Ki Vaar (Ang 966–968), composed by the rababi bards Rai Balwand and Satta Doom in the court of Guru Arjan Dev Ji, chronicles the continuity of the Divine Light (Jot) across the Sikh Gurus and praises the institution of Guru ka Langar.",
      "The bani highlights how Mata Khivi Ji, spouse of Guru Angad Dev Ji, personally oversaw the Langar, serving nourishing kheer (rice pudding prepared with ghee) with warmth and generosity while the spiritual Langar of the Guru's Shabad flowed inexhaustibly.",
      "Founded by Guru Nanak Dev Ji and institutionalized by subsequent Gurus, Langar dismantles caste, gender, and social hierarchies by requiring emperors and commoners alike to sit on the same floor in Pangat (rows of equality) and engage in Seva (selfless service)."
    ],
    keywords: ["langar", "ramkali", "vaar", "seva", "equality", "food", "kitchen", "pangat", "mata khivi", "caste", "purpose"],
  },
  {
    id: "bhai-gurdas-vaaran",
    title: "Vaaran Bhai Gurdas Ji",
    gurmukhi: "ਕਿਰਤਿ ਵਿਰਤਿ ਕਰਿ ਧਰਮ ਦੀ ਹਥਹੁ ਦੇ ਕੈ ਭਲਾ ਮਨਾਵੈ ॥",
    category: "Canonical Exegesis",
    reference: "Vaar 1 & Vaar 6 • Bhai Gurdas Ji",
    period: "Early 17th Century CE",
    excerpt:
      "Details the three pillars of Sikhi—Naam Japna, Kirat Karni (honest labour), and Vand Chhakna (sharing with others)—alongside Miri-Piri.",
    detailedNotes: [
      "Blessed by Guru Arjan Dev Ji as the 'Key to Sri Guru Granth Sahib Ji' (Kunji), the 40 Vaaran of Bhai Gurdas Ji provide the primary historical and theological commentary on early Sikh life and Gurbani.",
      "Bhai Gurdas Ji explains how a Gursikh integrates spirituality into daily life through three core principles: Naam Japna (remembering the Divine), Kirat Karni (earning an honest, ethical livelihood), and Vand Chhakna (sharing one's earnings and food with those in need).",
      "His writings also document Guru Nanak Dev Ji's Udasis (travels) and defend Guru Hargobind Sahib Ji's adoption of Miri and Piri—explaining that just as a thorny hedge protects an orchard of flowers, temporal sovereignty protects spiritual dharma."
    ],
    keywords: ["bhai gurdas", "vaaran", "kirat", "vand", "pillars", "history", "guru nanak", "honest", "sharing"],
  },
  {
    id: "dasam-granth",
    title: "Sri Dasam Granth Sahib & Miri-Piri Tradition",
    gurmukhi: "ਚੂੰ ਕਾਰ ਅਜ਼ ਹਮਹ ਹੀਲਤੇ ਦਰ ਗੁਜ਼ਸ਼ਤ ॥ ਹਲਾਲ ਅਸਤ ਬੁਰਦਨ ਬ ਸ਼ਮਸ਼ੀਰ ਦਸਤ ॥",
    category: "Historical Text",
    reference: "Guru Hargobind Sahib Ji & Guru Gobind Singh Ji",
    period: "17th – Early 18th Century CE",
    excerpt:
      "Articulates Miri-Piri (temporal and spiritual authority), the Sant-Sipahi (Saint-Soldier) ideal, and standing up for justice.",
    detailedNotes: [
      "Miri (temporal/worldly responsibility) and Piri (spiritual authority) were formally united by the sixth Guru, Guru Hargobind Sahib Ji, who wore two swords and established Sri Akal Takht Sahib facing Harimandir Sahib in Amritsar.",
      "In Sikhi, spirituality (Piri) and social justice (Miri) cannot be separated: inner devotion must guide political and social action, ensuring power is exercised solely to protect the weak and uphold righteousness (Dharam).",
      "Guru Gobind Singh Ji culminated this ideal in 1699 by establishing the Khalsa Panth as Sant-Sipahi (Saint-Soldiers), writing in the Zafarnama that when all peaceful remedies against tyranny are exhausted, defending justice is righteous."
    ],
    keywords: ["miri", "piri", "khalsa", "sword", "justice", "guru gobind singh", "guru hargobind", "akal takht", "sant sipahi"],
  },
  {
    id: "rehat-maryada",
    title: "Sikh Rehat Maryada",
    gurmukhi: "ਸਿੱਖ ਰਹਿਤ ਮਰਯਾਦਾ",
    category: "Code of Conduct",
    reference: "SGPC Official Code of Conduct",
    period: "1945 CE (Codified from historical Rehatnamas)",
    excerpt:
      "Defines personal and communal Sikh ethics, Nitnem (daily prayers), Gurdwara protocol, Langar egalitarianism, and Amrit Sanskar.",
    detailedNotes: [
      "The Sikh Rehat Maryada codifies both personal spiritual discipline (Shakhsi Rehat) and collective community life (Panthic Rehat) rooted in the teachings of the ten Gurus and Sri Guru Granth Sahib Ji.",
      "It outlines daily Nitnem prayers (Japji Sahib, Jaap Sahib, Tav-Prasad Savaiye, Chaupai Sahib, and Anand Sahib in the morning; Rehras Sahib in the evening; and Kirtan Sohila before sleep).",
      "It strictly prohibits superstitions, caste discrimination, dowry, and ritualism, emphasizing that every Gurdwara and Langar is open to all humanity regardless of background, creed, or status."
    ],
    keywords: ["rehat", "maryada", "conduct", "gurdwara", "prayer", "nitnem", "equality", "rules", "amrit", "5 ks"],
  },
  {
    id: "sggs-kudrat-ecology",
    title: "Sri Guru Granth Sahib Ji — Pavan Guru Pani Pita & Kudrat",
    gurmukhi: "ਪਵਣੁ ਗੁਰੂ ਪਾਣੀ ਪਿਤਾ ਮਾਤਾ ਧਰਤਿ ਮਹਤੁ ॥",
    category: "Primary Scripture",
    reference: "Ang 8 & Ang 463 • Guru Nanak Dev Ji",
    period: "16th Century CE • Japji Sahib & Asa Di Vaar",
    excerpt:
      "Elevates Air to the Guru, Water to the Father, and Earth to the Great Mother, establishing the sacredness of Kudrat (Nature) and ecological stewardship as living Seva.",
    detailedNotes: [
      "In the concluding Salok of Japji Sahib (Ang 8), Guru Nanak Dev Ji establishes a relational cosmology—'Pavan Guru Pani Pita Mata Dharat Mahat'—where Air is revered as the Guru, Water as the Father, and the vast Earth as the Great Mother in whose lap day and night nurture all living beings.",
      "In Asa Di Vaar (Ang 463), Gurbani proclaims 'Balihari Kudrat Vasia Tera Ant Na Jai Lakhia'—the Creator is not separate from creation, but abides within Kudrat (Nature) itself. Polluting rivers, degrading soil, or exploiting ecosystems is therefore a direct violation of sacred kinship.",
      "Coupled with Bhagat Kabir Ji's teaching of Santokh (contentment and simplicity, Ang 1372) and the Sikh prayer for Sarbat da Bhala (the welfare of all creation), Gurmat calls for zero-waste Langar, ethical consumption, and active climate stewardship."
    ],
    keywords: ["ecology", "nature", "kudrat", "pavan", "pani", "dharat", "environment", "earth", "water", "air", "climate", "sarbat da bhala", "santokh", "waste"],
  },
];

export function matchSourcesForQuestion(question: string): SourceItem[] {
  const q = question.toLowerCase();
  const scored = SIKHI_SOURCES.map((s) => {
    let score = 0;
    if (q.includes(s.title.toLowerCase())) score += 10;
    for (const kw of s.keywords) {
      if (q.includes(kw)) score += 3;
    }
    return { source: s, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.source);

  return scored.length > 0 ? scored : [SIKHI_SOURCES[0], SIKHI_SOURCES[1], SIKHI_SOURCES[2]];
}

export class DeepSeekError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
    this.name = "DeepSeekError";
  }
}

export const FRIENDLY: Record<string, { status: number; message: string }> = {
  BAD_REQUEST: { status: 400, message: "Please enter a valid question." },
  NO_API_KEY: { status: 500, message: "GEMINI_API_KEY is missing in .env.local." },
  INVALID_API_KEY: { status: 401, message: "Invalid Google API key in .env.local." },
  RATE_LIMITED: { status: 429, message: "Rate limit reached. Please wait a few seconds." },
  UPSTREAM_ERROR: { status: 502, message: "Google AI server error. Please try again." },
  INTERNAL_ERROR: { status: 500, message: "An unexpected internal error occurred." },
};

export function classify(err: unknown): { code: ErrorCode; message: string } {
  if (err instanceof DeepSeekError) {
    if (err.status === 401 || err.status === 403) return { code: "INVALID_API_KEY", message: err.message };
    if (err.status === 429) return { code: "RATE_LIMITED", message: err.message };
    if (err.status >= 500) return { code: "UPSTREAM_ERROR", message: err.message };
    return { code: String(err.status), message: err.message };
  }
  return { code: "INTERNAL_ERROR", message: err instanceof Error ? err.message : "Unknown error" };
}

export function createDeepSeek(options: { apiKey: string }) {
  return {
    async chat(params: { model?: string; messages: { role: string; content: string }[] }) {
      const result = await generateAnswer(
        options.apiKey,
        params.messages[params.messages.length - 1]?.content || ""
      );
      return { choices: [{ index: 0, message: { role: "assistant", content: result.answer } }] };
    },
  };
}

async function getCandidateModels(apiKey: string): Promise<string[]> {
  if (globalForState.cachedModels && globalForState.cachedModels.length > 0) {
    return globalForState.cachedModels;
  }

  const defaults = [
    "gemini-3.8-flash-lite",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash-lite",
    "gemini-3.8-flash",
    "gemini-flash-lite-latest",
    "gemini-flash-latest",
  ];

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models?key=" + encodeURIComponent(apiKey),
      { signal: controller.signal, cache: "no-store" }
    );
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      const available: string[] = (data?.models || [])
        .filter(
          (m: any) =>
            Array.isArray(m.supportedGenerationMethods) &&
            m.supportedGenerationMethods.includes("generateContent") &&
            typeof m.name === "string" &&
            m.name.includes("gemini") &&
            !m.name.includes("tts") &&
            !m.name.includes("image") &&
            !m.name.includes("vision") &&
            !m.name.includes("embedding")
        )
        .map((m: any) => String(m.name).replace(/^models\//, ""));

      // Prioritize "lite" and "flash" models because they respond in ~1s and rarely hit high-demand 503 errors
      const sorted = available.sort((a, b) => {
        const score = (name: string) =>
          (name.includes("lite") ? 10 : 0) +
          (name.includes("flash") ? 5 : 0) +
          (name.includes("3.8") ? 3 : 0);
        return score(b) - score(a);
      });

      if (sorted.length > 0) {
        globalForState.cachedModels = sorted.slice(0, 5);
        return globalForState.cachedModels;
      }
    }
  } catch {}

  return defaults;
}

async function callSingleGeminiModel(
  apiKey: string,
  modelName: string,
  systemInstruction: string,
  question: string
): Promise<{ text: string; model: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8500); // Fast 8.5s timeout per model

  try {
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/" +
      modelName +
      ":generateContent?key=" +
      encodeURIComponent(apiKey);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: question }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 750,
        },
      }),
    });

    clearTimeout(timeout);
    const data = await res.json().catch(() => null);

    if (res.ok && data?.candidates?.[0]?.content?.parts) {
      const text = data.candidates[0].content.parts
        .map((p: { text?: string }) => p.text || "")
        .join("")
        .trim();
      if (text) {
        return { text, model: modelName };
      }
    }

    throw new Error(data?.error?.message || "HTTP " + res.status);
  } finally {
    clearTimeout(timeout);
  }
}

function buildLocalScholarlySynthesis(question: string, matchedSources: SourceItem[]): string {
  const primary = matchedSources[0];
  const secondary = matchedSources[1];

  const paragraphs = [...primary.detailedNotes];
  if (secondary && paragraphs.length < 3) {
    paragraphs.push(
      "Furthermore, in " +
        secondary.title +
        " (" +
        secondary.reference +
        "), Sikh tradition emphasizes: " +
        secondary.excerpt
    );
  }
  return paragraphs.join("\n\n");
}

export async function generateAnswer(apiKey: string, question: string) {
  const startTime = Date.now();
  const matchedSources = matchSourcesForQuestion(question);

  const sourceContext = matchedSources
    .map((s) => "- " + s.title + " (" + s.reference + "): " + s.excerpt)
    .join("\n");

  const systemInstruction =
    "You are Learn Sikhi, a scholarly and accurate assistant specializing in Sikh philosophy, Gurbani, and history, while also answering general questions clearly.\n" +
    "Ground your response in these authentic Sikh sources when relevant:\n" +
    sourceContext +
    "\nWrite 2 to 3 clear, insightful paragraphs.";

  const candidateModels = await getCandidateModels(apiKey);
  let answerText = "";
  let usedModel = "";

  // 1. Race the top 2 fastest models in parallel so whichever responds first wins immediately
  const primaryBatch = candidateModels.slice(0, 2);
  try {
    const winner = await Promise.any(
      primaryBatch.map((m) => callSingleGeminiModel(apiKey, m, systemInstruction, question))
    );
    answerText = winner.text;
    usedModel = winner.model;
  } catch {
    // 2. If the first batch was busy, try remaining models sequentially
    for (const backupModel of candidateModels.slice(2)) {
      try {
        const res = await callSingleGeminiModel(apiKey, backupModel, systemInstruction, question);
        answerText = res.text;
        usedModel = res.model;
        break;
      } catch {
        continue;
      }
    }
  }

  // 3. Zero-downtime fallback: if all Google free-tier servers are experiencing high demand, synthesize immediately from our local Gurbani engine
  if (!answerText) {
    answerText = buildLocalScholarlySynthesis(question, matchedSources);
    usedModel = "sikhi-grounded-engine (cloud busy fallback)";
  }

  const durationMs = Date.now() - startTime;

  addApiLog({
    question,
    model: usedModel,
    status: 200,
    durationMs,
    preview: answerText.slice(0, 140) + (answerText.length > 140 ? "..." : ""),
  });

  const paragraphs = answerText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return {
    ok: true,
    question,
    model: usedModel,
    durationMs,
    answer: answerText,
    content: answerText,
    text: answerText,
    response: answerText,
    summary: paragraphs[0] || answerText,
    paragraphs,
    sources: matchedSources,
    citations: matchedSources,
    logs: getApiLogs(),
    relatedQuestions: [
      "What is the meaning of Hukam?",
      "What is the purpose of Langar?",
      "What are Miri and Piri?",
      "Tell me about Sri Guru Granth Sahib Ji — Ramkali Ki Vaar",
    ],
  };
}