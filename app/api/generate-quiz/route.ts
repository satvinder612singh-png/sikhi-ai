import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import type {
  GameType,
  LearnerAgeGroup,
  LearnerKnowledgeLevel,
} from "@/components/games/learner-profile";
import {
  buildFallbackPayload,
  type GeneratedMatchPair,
  type GeneratedQuizQuestion,
  type GeneratedScenarioItem,
} from "@/lib/games-fallback-bank";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface GenerateQuizRequest {
  ageGroup?: LearnerAgeGroup;
  knowledgeLevel?: LearnerKnowledgeLevel | "fluent";
  level?: LearnerKnowledgeLevel | "fluent";
  gameType?: GameType;
  mode?: GameType;
  seed?: number;
}

const VALID_AGES: LearnerAgeGroup[] = [
  "kids",
  "youth",
  "young-adults",
  "adults-seniors",
];

const VALID_GAME_TYPES: GameType[] = [
  "gurmukhi",
  "history",
  "concepts",
  "gurmat-action",
  "raag-pehar",
  "pankti-decoder",
  "history-crossroads",
  "chardi-kala-sprint",
  "gurbani-synthesis",
  "puratan-analysis",
];

const AGE_DISPLAY: Record<LearnerAgeGroup, string> = {
  kids: "Kids (5–10)",
  youth: "Youth (11–17)",
  "young-adults": "Young Adults (18–30 · Students & Professionals)",
  "adults-seniors": "Adults & Seniors (30+)",
};

const LEVEL_DISPLAY: Record<LearnerKnowledgeLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const MANDATORY_SYSTEM_INSTRUCTIONS = `Generate game content strictly tailored to the user's profile (ageGroup and knowledgeLevel). Dynamically adjust complexity, vocabulary, real-world framing, and subject matter to match their specific tier.
- For Advanced / Adults & Seniors profiles: Completely bypass elementary alphabet recognition, basic textbook definitions, or surface-level trivia. Generate high-level analytical challenges, nuanced Gurbani conceptual synthesis, Raag/Pehar musicology, and realistic ethical or leadership dilemmas.
- For Young Adults / Students & Professionals: Frame scenarios around university life, career integrity, stress/burnout management, teamwork, and personal discipline grounded in Gurmat.
- For Beginner / Kids profiles: Use warm, encouraging, accessible language, foundational Gurmukhi/Sakhi facts, and clear everyday examples.
- Return strictly valid JSON matching the requested gameType schema (pairs for matching games, scenarios with options + panktiReflection for Dilemma/Crossroads games, or questions for Quizzes/Sprints).`;

function normalizeKnowledgeLevel(raw: unknown): LearnerKnowledgeLevel {
  if (raw === "beginner" || raw === "intermediate" || raw === "advanced") {
    return raw;
  }
  if (raw === "fluent") return "intermediate";
  return "beginner";
}

function buildGameTypePrompt(
  gameType: GameType,
  ageGroup: LearnerAgeGroup,
  knowledgeLevel: LearnerKnowledgeLevel,
  seed: number
): string {
  const profileBlock = `Learner Profile:
- ageGroup: ${AGE_DISPLAY[ageGroup]}
- knowledgeLevel: ${LEVEL_DISPLAY[knowledgeLevel]}
- gameType: ${gameType}
- variationSeed: ${seed}`;

  if (gameType === "gurmukhi") {
    return `${MANDATORY_SYSTEM_INSTRUCTIONS}

${profileBlock}

Generate 8 distinct foundational Gurmukhi character-to-sound matching pairs.
Return STRICT JSON:
{
  "pairs": [
    {
      "gurmukhi": "single Gurmukhi letter",
      "sound": "clear English phonetic sound",
      "name": "letter name",
      "example": "short Sikh/Punjabi example word"
    }
  ]
}`;
  }

  if (gameType === "concepts") {
    return `${MANDATORY_SYSTEM_INSTRUCTIONS}

${profileBlock}

Generate 6 distinct foundational Sikhi concept matching pairs (e.g., Seva, Simran, Kirat Karni, Vand Chakna, Sangat, Chardi Kala, Nimrata).
Return STRICT JSON:
{
  "pairs": [
    {
      "term": "English transliterated Sikhi term",
      "gurmukhi": "Gurmukhi spelling",
      "meaning": "clear plain-English definition (1 sentence)"
    }
  ]
}`;
  }

  if (gameType === "raag-pehar") {
    return `${MANDATORY_SYSTEM_INSTRUCTIONS}

${profileBlock}

Generate 6 distinct Raag & Pehar Resonance matching pairs from the 31 classical Raags of Sri Guru Granth Sahib Ji.
Left side: Raag name + traditional Pehar/time window. Right side: Emotional state (Ras), focus need, or daily mindset resonance.
Return STRICT JSON:
{
  "pairs": [
    {
      "leftPrimary": "Raag Name (e.g., Raag Asa)",
      "leftSecondary": "Pehar & time window (e.g., Amrit Vela • 3–6 AM)",
      "rightPrimary": "Emotional resonance, mental state, or daily focus application",
      "insight": "1-sentence Gurmat Sangeet insight"
    }
  ]
}`;
  }

  if (gameType === "pankti-decoder") {
    return `${MANDATORY_SYSTEM_INSTRUCTIONS}

${profileBlock}

Generate 6 distinct Pankti Decoder (Word-to-Wisdom) pairs mapping pivotal Gurbani terms (e.g., Hukam, Haumai, Sehaj, Bibek, Santokh, Vairaag, Jeevan Mukti, Sabad Surat) to modern psychology, mental resilience, or lived philosophical themes.
Return STRICT JSON:
{
  "pairs": [
    {
      "leftPrimary": "Gurbani term (English)",
      "leftSecondary": "Gurmukhi script",
      "rightPrimary": "Practical modern psychological or philosophical mapping (1 concise sentence)",
      "insight": "1-sentence Gurbani reflection"
    }
  ]
}`;
  }

  if (gameType === "gurbani-synthesis") {
    return `${MANDATORY_SYSTEM_INSTRUCTIONS}

${profileBlock}

Generate 6 high-level Gurbani Vichaar & Conceptual Synthesis pairs matching authentic Gurbani Panktis (with Bani/Ang reference) to nuanced philosophical frameworks and cross-Bani thematic synthesis. NO elementary definitions.
Return STRICT JSON:
{
  "pairs": [
    {
      "leftPrimary": "Authentic Gurbani Pankti in Gurmukhi",
      "leftSecondary": "Bani / Raag & Ang reference",
      "rightPrimary": "Nuanced philosophical framework or cross-Bani synthesis (1–2 sentences)",
      "insight": "1-sentence exegetical note"
    }
  ]
}`;
  }

  if (gameType === "gurmat-action" || gameType === "history-crossroads") {
    const isHistory = gameType === "history-crossroads";
    return `${MANDATORY_SYSTEM_INSTRUCTIONS}

${profileBlock}

Generate 3 rich, deeply engaging interactive ${
      isHistory
        ? "Sikh History: Crossroads strategic & ethical decision scenarios drawn from authentic Sikh history (diplomacy, governance, selfless service, resilience)"
        : "Gurmat in Action real-world ethical dilemma scenarios tailored specifically to the learner's ageGroup and knowledgeLevel"
    }.
Each scenario MUST include 3 distinct choices (one clearly Gurmat-aligned, one reflective/compromise, one cautionary) and an authentic Gurbani Pankti reflection.
Return STRICT JSON:
{
  "scenarios": [
    {
      "contextTag": "short domain tag (e.g., Career Integrity, Exam Pressure, 1705 • Muktsar)",
      "title": "compelling scenario title",
      "scenario": "2–3 vivid sentences setting up the real dilemma",
      "options": [
        {
          "label": "clear actionable choice",
          "outcome": "2-sentence thoughtful consequence & insight",
          "alignment": "gurmat-aligned | reflective | cautionary"
        }
      ],
      "panktiReflection": {
        "gurmukhi": "authentic Gurbani Pankti in Gurmukhi",
        "transliteration": "clean Roman transliteration",
        "translation": "accurate plain-English translation",
        "reflection": "1-sentence practical takeaway connecting the Pankti to the scenario"
      }
    }
  ]
}`;
  }

  if (gameType === "chardi-kala-sprint") {
    return `${MANDATORY_SYSTEM_INSTRUCTIONS}

${profileBlock}

Generate a brisk, high-signal 3-question "3-Minute Daily Chardi Kala Sprint" with EXACTLY 3 questions in this order:
- Question 1 (categoryTag: "1 · Concept"): A Gurmat concept applied to daily clarity.
- Question 2 (categoryTag: "2 · History Insight"): An inspiring, accurate Sikh historical insight.
- Question 3 (categoryTag: "3 · Real-Life Reflection"): A practical real-life reflection tailored to the user's ageGroup and knowledgeLevel.
Each question has 4 distinct options and a 0-based correctIndex.
Return STRICT JSON:
{
  "questions": [
    {
      "categoryTag": "1 · Concept | 2 · History Insight | 3 · Real-Life Reflection",
      "question": "clear question",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "1–2 sentence insightful explanation"
    }
  ]
}`;
  }

  if (gameType === "puratan-analysis") {
    return `${MANDATORY_SYSTEM_INSTRUCTIONS}

${profileBlock}

Generate 6 high-level analytical multiple-choice challenges covering Raag/Ghar/Partaal musicology, Tanti Saaj lineages, Puratan Granths (Sri Gur Panth Prakash, Suraj Prakash, Vaaran Bhai Gurdas), and Gurbani Viyakaran (grammar). Strictly bypass elementary trivia.
Return STRICT JSON:
{
  "questions": [
    {
      "categoryTag": "Raag Musicology | Historiography | Gurbani Viyakaran | Puratan Granths",
      "question": "nuanced analytical question",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "2-sentence scholarly explanation",
      "pankti": "optional short Gurmukhi reference if relevant"
    }
  ]
}`;
  }

  // Default: "history"
  return `${MANDATORY_SYSTEM_INSTRUCTIONS}

${profileBlock}

Generate 6 engaging, historically accurate multiple-choice questions on Sikh history, core Sakhis, the Ten Gurus, and Sikh heritage.
Return STRICT JSON:
{
  "questions": [
    {
      "categoryTag": "short theme tag",
      "question": "clear question",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "1–2 sentence historical explanation"
    }
  ]
}`;
}

function validateAndShapeResponse(
  gameType: GameType,
  parsed: Record<string, unknown>,
  seed: number
): {
  pairs?: GeneratedMatchPair[];
  questions?: GeneratedQuizQuestion[];
  scenarios?: GeneratedScenarioItem[];
} | null {
  if (
    gameType === "gurmukhi" ||
    gameType === "concepts" ||
    gameType === "raag-pehar" ||
    gameType === "pankti-decoder" ||
    gameType === "gurbani-synthesis"
  ) {
    if (!Array.isArray(parsed.pairs)) return null;
    const seen = new Set<string>();
    const valid = parsed.pairs
      .filter((p): p is Record<string, unknown> => Boolean(p && typeof p === "object"))
      .map((p, idx): GeneratedMatchPair | null => {
        if (gameType === "gurmukhi") {
          const gurmukhi = String(p.gurmukhi || p.leftPrimary || "").trim();
          const sound = String(p.sound || p.rightPrimary || "").trim();
          const name = String(p.name || p.leftSecondary || sound).trim();
          const example = String(p.example || p.rightSecondary || "").trim();
          if (!gurmukhi || !sound || seen.has(gurmukhi)) return null;
          seen.add(gurmukhi);
          return {
            id: `ai-g-${seed}-${idx}`,
            leftPrimary: gurmukhi,
            leftSecondary: name,
            rightPrimary: sound,
            rightSecondary: example || `Sound: ${sound}`,
            gurmukhi,
            sound,
            name,
            example: example || `Sound: ${sound}`,
          };
        }

        if (gameType === "concepts") {
          const term = String(p.term || p.leftPrimary || "").trim();
          const gurmukhi = String(p.gurmukhi || p.leftSecondary || "").trim();
          const meaning = String(p.meaning || p.rightPrimary || "").trim();
          if (!term || !meaning || seen.has(term.toLowerCase())) return null;
          seen.add(term.toLowerCase());
          return {
            id: `ai-c-${seed}-${idx}`,
            leftPrimary: term,
            leftSecondary: gurmukhi || undefined,
            rightPrimary: meaning,
            term,
            gurmukhi: gurmukhi || term,
            meaning,
          };
        }

        const leftPrimary = String(p.leftPrimary || "").trim();
        const leftSecondary = String(p.leftSecondary || "").trim() || undefined;
        const rightPrimary = String(p.rightPrimary || "").trim();
        const rightSecondary = String(p.rightSecondary || "").trim() || undefined;
        const insight = String(p.insight || "").trim() || undefined;
        if (!leftPrimary || !rightPrimary || seen.has(leftPrimary.toLowerCase())) {
          return null;
        }
        seen.add(leftPrimary.toLowerCase());
        return {
          id: `ai-m-${seed}-${idx}`,
          leftPrimary,
          leftSecondary,
          rightPrimary,
          rightSecondary,
          insight,
        };
      })
      .filter((x): x is GeneratedMatchPair => x !== null)
      .slice(0, gameType === "gurmukhi" ? 8 : 6);

    if (valid.length >= 5) {
      return { pairs: valid };
    }
    return null;
  }

  if (gameType === "gurmat-action" || gameType === "history-crossroads") {
    if (!Array.isArray(parsed.scenarios)) return null;
    const valid = parsed.scenarios
      .filter((s): s is Record<string, unknown> => Boolean(s && typeof s === "object"))
      .map((s, idx): GeneratedScenarioItem | null => {
        const title = String(s.title || "").trim();
        const scenario = String(s.scenario || "").trim();
        const contextTag = String(s.contextTag || "Gurmat Reflection").trim();
        const rawOptions = Array.isArray(s.options) ? s.options : [];
        const options = rawOptions
          .filter((o): o is Record<string, unknown> => Boolean(o && typeof o === "object"))
          .map((o) => {
            const label = String(o.label || "").trim();
            const outcome = String(o.outcome || "").trim();
            const rawAlign = String(o.alignment || "reflective").trim();
            const alignment: "gurmat-aligned" | "reflective" | "cautionary" =
              rawAlign === "gurmat-aligned" ||
              rawAlign === "reflective" ||
              rawAlign === "cautionary"
                ? rawAlign
                : "reflective";
            return label && outcome ? { label, outcome, alignment } : null;
          })
          .filter(
            (o): o is { label: string; outcome: string; alignment: "gurmat-aligned" | "reflective" | "cautionary" } =>
              o !== null
          )
          .slice(0, 4);

        const rawPankti =
          s.panktiReflection && typeof s.panktiReflection === "object"
            ? (s.panktiReflection as Record<string, unknown>)
            : null;
        const gurmukhi = String(rawPankti?.gurmukhi || "").trim();
        const transliteration = String(rawPankti?.transliteration || "").trim();
        const translation = String(rawPankti?.translation || "").trim();
        const reflection = String(rawPankti?.reflection || "").trim();

        if (!title || !scenario || options.length < 2 || !translation) {
          return null;
        }
        return {
          id: `ai-s-${seed}-${idx}`,
          contextTag,
          title,
          scenario,
          options,
          panktiReflection: {
            gurmukhi: gurmukhi || "ਸਚਹੁ ਓਰੈ ਸਭੁ ਕੋ ਉਪਰਿ ਸਚੁ ਆਚਾਰੁ ॥",
            transliteration:
              transliteration || "Sachahu orai sabhu ko upari sachu aachaar ||",
            translation,
            reflection: reflection || translation,
          },
        };
      })
      .filter((x): x is GeneratedScenarioItem => x !== null)
      .slice(0, 3);

    if (valid.length >= 2) {
      return { scenarios: valid };
    }
    return null;
  }

  // Quiz & Sprint games
  if (!Array.isArray(parsed.questions)) return null;
  const maxCount = gameType === "chardi-kala-sprint" ? 3 : 6;
  const valid = parsed.questions
    .filter((q): q is Record<string, unknown> => Boolean(q && typeof q === "object"))
    .map((q, idx): GeneratedQuizQuestion | null => {
      const question = String(q.question || "").trim();
      const explanation = String(q.explanation || "").trim();
      const rawOpts = Array.isArray(q.options)
        ? q.options.map((o) => String(o || "").trim()).filter(Boolean)
        : [];
      const correctIndex = Number(q.correctIndex);
      if (
        !question ||
        !explanation ||
        rawOpts.length < 4 ||
        !Number.isInteger(correctIndex) ||
        correctIndex < 0 ||
        correctIndex > 3
      ) {
        return null;
      }
      return {
        id: `ai-q-${seed}-${idx}`,
        categoryTag: q.categoryTag ? String(q.categoryTag).trim() : undefined,
        question,
        options: [rawOpts[0], rawOpts[1], rawOpts[2], rawOpts[3]],
        correctIndex,
        explanation,
        pankti: q.pankti ? String(q.pankti).trim() : undefined,
      };
    })
    .filter((x): x is GeneratedQuizQuestion => x !== null)
    .slice(0, maxCount);

  if (valid.length >= (gameType === "chardi-kala-sprint" ? 3 : 4)) {
    return { questions: valid };
  }
  return null;
}

export async function POST(req: Request) {
  let body: GenerateQuizRequest = {};
  try {
    body = (await req.json()) as GenerateQuizRequest;
  } catch {
    body = {};
  }

  const ageGroup: LearnerAgeGroup =
    body.ageGroup && VALID_AGES.includes(body.ageGroup)
      ? body.ageGroup
      : "young-adults";
  const knowledgeLevel: LearnerKnowledgeLevel = normalizeKnowledgeLevel(
    body.knowledgeLevel ?? body.level
  );
  const requestedType = body.gameType ?? body.mode;
  const gameType: GameType =
    requestedType && VALID_GAME_TYPES.includes(requestedType)
      ? requestedType
      : "history";
  const seed = Number.isFinite(Number(body.seed))
    ? Number(body.seed)
    : Date.now();

  const headers = {
    "Cache-Control": "no-store, no-cache, must-revalidate",
  };

  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        ok: true,
        source: "fallback",
        ageGroup,
        knowledgeLevel,
        gameType,
        ...buildFallbackPayload(gameType, ageGroup, knowledgeLevel, seed),
      },
      { headers }
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = buildGameTypePrompt(gameType, ageGroup, knowledgeLevel, seed);

    const response = await Promise.race([
      ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.65,
        },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini game generation timeout")), 9500)
      ),
    ]);

    const rawText = (response.text || "").trim();
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    const parsed = JSON.parse(cleaned) as Record<string, unknown>;
    const shaped = validateAndShapeResponse(gameType, parsed, seed);

    if (shaped) {
      return NextResponse.json(
        {
          ok: true,
          source: "gemini",
          ageGroup,
          knowledgeLevel,
          gameType,
          ...shaped,
        },
        { headers }
      );
    }
  } catch (err) {
    console.warn("[/api/generate-quiz] Falling back to tier-matched local bank:", err);
  }

  return NextResponse.json(
    {
      ok: true,
      source: "fallback",
      ageGroup,
      knowledgeLevel,
      gameType,
      ...buildFallbackPayload(gameType, ageGroup, knowledgeLevel, seed),
    },
    { headers }
  );
}
