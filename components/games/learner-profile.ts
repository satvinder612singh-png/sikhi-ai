export type LearnerAgeGroup =
  | "kids"
  | "youth"
  | "young-adults"
  | "adults-seniors";

export type LearnerKnowledgeLevel = "beginner" | "intermediate" | "advanced";

export type GameType =
  | "gurmukhi"
  | "history"
  | "concepts"
  | "gurmat-action"
  | "raag-pehar"
  | "pankti-decoder"
  | "history-crossroads"
  | "chardi-kala-sprint"
  | "gurbani-synthesis"
  | "puratan-analysis";

export type GameTier = "foundational" | "adaptive" | "advanced-exclusive";
export type GameMechanic = "match" | "quiz" | "scenario";

export interface LearnerProfile {
  ageGroup: LearnerAgeGroup;
  knowledgeLevel: LearnerKnowledgeLevel;
}

export interface GameCatalogEntry {
  id: GameType;
  tier: GameTier;
  tierLabel: string;
  mechanic: GameMechanic;
  title: string;
  estimatedTime: string;
  description: string;
  rulesSubtitle: string;
  rules: string[];
  eligibleLevels: LearnerKnowledgeLevel[];
  eligibleAgeGroups: LearnerAgeGroup[];
  leftColumnLabel?: string;
  rightColumnLabel?: string;
}

export const LEARNER_PROFILE_STORAGE_KEY = "learnsikhi_learner_profile_v2";
const LEGACY_STORAGE_KEY = "learnsikhi_learner_profile_v1";

export const AGE_GROUP_OPTIONS: {
  id: LearnerAgeGroup;
  label: string;
  range: string;
  hint: string;
}[] = [
  {
    id: "kids",
    label: "Kids",
    range: "Ages 5–10",
    hint: "Warm, playful stories, simple everyday words, and friendly guidance.",
  },
  {
    id: "youth",
    label: "Youth",
    range: "Ages 11–17",
    hint: "School & peer scenarios, clear Sikh history, and practical Gurmat values.",
  },
  {
    id: "young-adults",
    label: "Young Adults",
    range: "Ages 18–30",
    hint: "University, career ethics, stress resilience, leadership, and philosophy.",
  },
  {
    id: "adults-seniors",
    label: "Adults & Seniors",
    range: "Ages 30+",
    hint: "Family, mentorship, Gurbani synthesis, Raag musicology, and deep Itihaas.",
  },
];

export const KNOWLEDGE_LEVEL_OPTIONS: {
  id: LearnerKnowledgeLevel;
  label: string;
  hint: string;
}[] = [
  {
    id: "beginner",
    label: "Beginner",
    hint: "New to Sikhi or starting with Gurmukhi letters, Sakhis, and core values.",
  },
  {
    id: "intermediate",
    label: "Intermediate",
    hint: "Familiar with the Ten Gurus and core values; ready for applied Gurmat & deeper history.",
  },
  {
    id: "advanced",
    label: "Advanced",
    hint: "Bypasses basics for Gurbani Vichaar synthesis, Raag musicology, and leadership dilemmas.",
  },
];

const ALL_AGES: LearnerAgeGroup[] = [
  "kids",
  "youth",
  "young-adults",
  "adults-seniors",
];
const ALL_LEVELS: LearnerKnowledgeLevel[] = [
  "beginner",
  "intermediate",
  "advanced",
];

export const GAMES_CATALOG: GameCatalogEntry[] = [
  // =========================================================================
  // BEGINNER / FOUNDATIONAL TIER (Hidden from Intermediate & Advanced)
  // =========================================================================
  {
    id: "gurmukhi",
    tier: "foundational",
    tierLabel: "Foundational",
    mechanic: "match",
    title: "Gurmukhi Letter Match",
    estimatedTime: "4 min",
    description:
      "Build comfortable recognition of foundational Gurmukhi characters and their English phonetic sounds.",
    rulesSubtitle:
      "Match each Gurmukhi character with its everyday spoken phonetic sound.",
    rules: [
      "Choose a Gurmukhi character on the left, then select its matching English phonetic sound on the right.",
      "Navigate comfortably with your mouse or keyboard (Tab, Enter, or Space).",
      "Click Generate Fresh Round anytime for a new set tailored to your age group.",
    ],
    eligibleLevels: ["beginner"],
    eligibleAgeGroups: ALL_AGES,
  },
  {
    id: "history",
    tier: "foundational",
    tierLabel: "Foundational",
    mechanic: "quiz",
    title: "Sikh History & Heritage Quiz",
    estimatedTime: "5 min",
    description:
      "Explore core Sakhis, the Ten Guru Sahiban, and foundational milestones of Sikh heritage at your own pace.",
    rulesSubtitle:
      "Read thoughtfully and discover the historical context behind every milestone.",
    rules: [
      "Select the answer that best fits each untimed multiple-choice question.",
      "Read the short historical explanation after every choice before moving forward.",
      "Generate a fresh AI-tailored round anytime to keep exploring Sikh heritage.",
    ],
    eligibleLevels: ["beginner"],
    eligibleAgeGroups: ALL_AGES,
  },
  {
    id: "concepts",
    tier: "foundational",
    tierLabel: "Foundational",
    mechanic: "match",
    title: "Core Sikhi Concept Match",
    estimatedTime: "4 min",
    description:
      "Pair foundational Gurmat values like Seva, Simran, Kirat Karni, and Vand Chakna with plain-English meanings.",
    rulesSubtitle:
      "Connect essential Sikh principles to clear, practical everyday definitions.",
    rules: [
      "Select a Sikhi term in the left column, then choose its plain-English meaning on the right.",
      "Matched pairs glow softly in emerald so you can review them as you finish the set.",
      "Click Generate Fresh Round whenever you want a new set of foundational concepts.",
    ],
    eligibleLevels: ["beginner"],
    eligibleAgeGroups: ALL_AGES,
  },

  // =========================================================================
  // ALL-AGES / STUDENT & PROFESSIONAL ADAPTIVE GAMES
  // =========================================================================
  {
    id: "gurmat-action",
    tier: "adaptive",
    tierLabel: "Real-Life Simulator",
    mechanic: "scenario",
    title: "Gurmat in Action",
    estimatedTime: "5 min",
    description:
      "Navigate real-world ethical dilemmas—from exams, burnout, and career integrity to mentorship—guided by Gurbani reflections.",
    rulesSubtitle:
      "Apply living Gurmat wisdom to realistic everyday situations tailored to your life stage.",
    rules: [
      "Read each real-world scenario and choose how you would respond.",
      "Every choice reveals a thoughtful outcome plus a relevant Gurbani Pankti and reflection.",
      "Scenarios dynamically adapt to your age group and knowledge tier—no timers, pure reflection.",
    ],
    eligibleLevels: ALL_LEVELS,
    eligibleAgeGroups: ALL_AGES,
  },
  {
    id: "raag-pehar",
    tier: "adaptive",
    tierLabel: "Music & Focus",
    mechanic: "match",
    title: "Raag & Pehar Resonance",
    estimatedTime: "4 min",
    description:
      "Match emotional states, focus needs, and times of day to the corresponding Raag from Sri Guru Granth Sahib Ji and its traditional Pehar.",
    rulesSubtitle:
      "Discover how the 31 classical Raags align melody, emotion (Ras), and time of day (Pehar).",
    rules: [
      "Select a Raag and its Pehar on the left, then pair it with its matching emotional resonance or daily focus state on the right.",
      "Notice how each Raag shifts in depth from beginner essentials to classical Gurmat Sangeet nuances.",
      "Click Generate Fresh Round anytime to explore additional Raags.",
    ],
    eligibleLevels: ALL_LEVELS,
    eligibleAgeGroups: ALL_AGES,
    leftColumnLabel: "Classical Raag & Pehar",
    rightColumnLabel: "Emotional Resonance & Daily Focus",
  },
  {
    id: "pankti-decoder",
    tier: "adaptive",
    tierLabel: "Word-to-Wisdom",
    mechanic: "match",
    title: "Pankti Decoder",
    estimatedTime: "5 min",
    description:
      "Decode pivotal Gurbani terms—Hukam, Haumai, Sehaj, Bibek, Santokh—and map them to modern psychology and lived philosophy.",
    rulesSubtitle:
      "Bridge timeless Gurmukhi vocabulary with practical mental clarity and philosophical insight.",
    rules: [
      "Select a Gurbani concept on the left and match it with its modern psychological or philosophical application on the right.",
      "Read the brief insight banner after each match to deepen your reflection.",
      "Generate a fresh round anytime for deeper terminology suited to your tier.",
    ],
    eligibleLevels: ALL_LEVELS,
    eligibleAgeGroups: ALL_AGES,
    leftColumnLabel: "Gurbani Term",
    rightColumnLabel: "Modern Psychology & Wisdom",
  },
  {
    id: "history-crossroads",
    tier: "adaptive",
    tierLabel: "Strategic History",
    mechanic: "scenario",
    title: "Sikh History: Crossroads",
    estimatedTime: "6 min",
    description:
      "Step into pivotal moments of Sikh diplomacy, governance, selfless service, and resilience to weigh strategic and ethical choices.",
    rulesSubtitle:
      "Explore how Gurmat principles shaped courageous leadership at turning points in Sikh history.",
    rules: [
      "Examine each historical crossroads and choose the strategic or ethical course of action.",
      "Discover the historical outcome alongside a Gurbani Pankti that illuminates the principle behind it.",
      "Complexity scales from inspiring Sakhis to nuanced statecraft and Misl-era diplomacy.",
    ],
    eligibleLevels: ALL_LEVELS,
    eligibleAgeGroups: ALL_AGES,
  },
  {
    id: "chardi-kala-sprint",
    tier: "adaptive",
    tierLabel: "3-Min Sprint",
    mechanic: "quiz",
    title: "3-Minute Daily Chardi Kala Sprint",
    estimatedTime: "3 min",
    description:
      "A brisk, focused 3-question mix—1 concept, 1 history insight, and 1 real-life reflection—crafted for busy students and professionals.",
    rulesSubtitle:
      "Three high-signal questions to reset your focus and lift your spirit during a short break.",
    rules: [
      "Complete 3 curated challenges: one Gurmat concept, one historical insight, and one practical life reflection.",
      "Every question adapts to your selected age group and knowledge level.",
      "Click Generate Fresh Round anytime for a brand-new 3-minute mental reset.",
    ],
    eligibleLevels: ALL_LEVELS,
    eligibleAgeGroups: ALL_AGES,
  },

  // =========================================================================
  // ADVANCED-EXCLUSIVE CHALLENGES (Intermediate/Advanced + Young Adults/Adults & Seniors)
  // =========================================================================
  {
    id: "gurbani-synthesis",
    tier: "advanced-exclusive",
    tierLabel: "Advanced Synthesis",
    mechanic: "match",
    title: "Gurbani Vichaar & Conceptual Synthesis",
    estimatedTime: "6 min",
    description:
      "Match complex Gurbani Panktis to nuanced philosophical frameworks and cross-reference thematic threads across Banis.",
    rulesSubtitle:
      "Engage directly with contemplative Gurbani philosophy, ontology, and cross-Bani synthesis.",
    rules: [
      "Select a Gurbani Pankti or thematic reference on the left and pair it with its philosophical synthesis on the right.",
      "Each match reveals a brief exegetical reflection linking the concept across Sri Guru Granth Sahib Ji.",
      "Designed exclusively for Intermediate and Advanced adult learners—zero elementary trivia.",
    ],
    eligibleLevels: ["intermediate", "advanced"],
    eligibleAgeGroups: ["young-adults", "adults-seniors"],
    leftColumnLabel: "Gurbani Pankti & Reference",
    rightColumnLabel: "Philosophical Synthesis",
  },
  {
    id: "puratan-analysis",
    tier: "advanced-exclusive",
    tierLabel: "Scholarly Analysis",
    mechanic: "quiz",
    title: "Puratan Granth & Raag Musicology Analysis",
    estimatedTime: "7 min",
    description:
      "Tackle high-level analytical challenges across Raag structures, Tanti Saaj lineages, Puratan chronicles, and Gurbani grammar.",
    rulesSubtitle:
      "Examine primary texts, classical Gurmat Sangeet theory, and historical historiography in depth.",
    rules: [
      "Analyze each scholarly prompt covering Raag/Ghar/Partaal structures, Puratan Granths, or Viyakaran.",
      "After each selection, review the concise analytical commentary before advancing.",
      "Click Generate Fresh Round anytime for new advanced-tier analytical questions.",
    ],
    eligibleLevels: ["intermediate", "advanced"],
    eligibleAgeGroups: ["young-adults", "adults-seniors"],
  },
];

export function isGameEligibleForProfile(
  game: GameCatalogEntry,
  profile: LearnerProfile
): boolean {
  // Explicit safety rule: Gurmukhi Letter Match is NEVER shown to Intermediate/Advanced,
  // nor to Adults & Seniors unless Beginner is explicitly selected.
  if (game.id === "gurmukhi") {
    if (profile.knowledgeLevel !== "beginner") return false;
  }
  return (
    game.eligibleLevels.includes(profile.knowledgeLevel) &&
    game.eligibleAgeGroups.includes(profile.ageGroup)
  );
}

export function filterGamesForProfile(
  profile: LearnerProfile
): GameCatalogEntry[] {
  return GAMES_CATALOG.filter((game) => isGameEligibleForProfile(game, profile));
}

export function formatAgeGroupLabel(ageGroup: LearnerAgeGroup): string {
  const found = AGE_GROUP_OPTIONS.find((a) => a.id === ageGroup);
  return found ? found.label : ageGroup;
}

export function formatKnowledgeLevelLabel(
  level: LearnerKnowledgeLevel
): string {
  const found = KNOWLEDGE_LEVEL_OPTIONS.find((l) => l.id === level);
  return found ? found.label : level;
}

export function formatLearnerProfileBadge(profile: LearnerProfile): string {
  return `${formatAgeGroupLabel(profile.ageGroup)} • ${formatKnowledgeLevelLabel(profile.knowledgeLevel)}`;
}

function normalizeStoredLevel(raw: unknown): LearnerKnowledgeLevel | null {
  if (raw === "beginner" || raw === "intermediate" || raw === "advanced") {
    return raw;
  }
  if (raw === "fluent") {
    return "intermediate";
  }
  return null;
}

export function readStoredLearnerProfile(): LearnerProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      window.localStorage.getItem(LEARNER_PROFILE_STORAGE_KEY) ||
      window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      ageGroup?: LearnerAgeGroup;
      knowledgeLevel?: unknown;
      level?: unknown;
    };
    const validAges: LearnerAgeGroup[] = [
      "kids",
      "youth",
      "young-adults",
      "adults-seniors",
    ];
    const normalizedLevel = normalizeStoredLevel(
      parsed.knowledgeLevel ?? parsed.level
    );
    if (
      parsed.ageGroup &&
      validAges.includes(parsed.ageGroup) &&
      normalizedLevel
    ) {
      return {
        ageGroup: parsed.ageGroup,
        knowledgeLevel: normalizedLevel,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveStoredLearnerProfile(profile: LearnerProfile): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      LEARNER_PROFILE_STORAGE_KEY,
      JSON.stringify(profile)
    );
  } catch {
    // ignore storage quota errors
  }
}
