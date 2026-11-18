export type LearnerAgeGroup =
  | "kids"
  | "youth"
  | "young-adults"
  | "adults-seniors";

export type LearnerLevel =
  | "beginner"
  | "intermediate"
  | "fluent"
  | "advanced";

export interface LearnerProfile {
  ageGroup: LearnerAgeGroup;
  level: LearnerLevel;
}

export const LEARNER_PROFILE_STORAGE_KEY = "learnsikhi_learner_profile_v1";

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
    hint: "Warm, playful stories and simple everyday words.",
  },
  {
    id: "youth",
    label: "Youth",
    range: "Ages 11–17",
    hint: "Clear historical adventures, values, and Gurmukhi practice.",
  },
  {
    id: "young-adults",
    label: "Young Adults",
    range: "Ages 18–30",
    hint: "Reflective philosophy, Sikh history, and modern context.",
  },
  {
    id: "adults-seniors",
    label: "Adults & Seniors",
    range: "Ages 30+",
    hint: "Calm, thoughtful depth across Gurbani, Raags, and Itihaas.",
  },
];

export const KNOWLEDGE_LEVEL_OPTIONS: {
  id: LearnerLevel;
  label: string;
  hint: string;
}[] = [
  {
    id: "beginner",
    label: "Beginner",
    hint: "New to Sikhi or starting with the first Gurmukhi letters.",
  },
  {
    id: "intermediate",
    label: "Intermediate",
    hint: "Familiar with the Ten Gurus, basic letters, and core values.",
  },
  {
    id: "fluent",
    label: "Fluent",
    hint: "Comfortable reading Gurmukhi and exploring deeper concepts.",
  },
  {
    id: "advanced",
    label: "Advanced",
    hint: "Ready for Gurbani terminology, Raags, and Puratan history.",
  },
];

export function formatLearnerProfileBadge(profile: LearnerProfile): string {
  const age = AGE_GROUP_OPTIONS.find((a) => a.id === profile.ageGroup);
  const lvl = KNOWLEDGE_LEVEL_OPTIONS.find((l) => l.id === profile.level);
  return `${age ? `${age.label} (${age.range.replace("Ages ", "")})` : profile.ageGroup} • ${lvl?.label ?? profile.level}`;
}

export function readStoredLearnerProfile(): LearnerProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LEARNER_PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LearnerProfile>;
    const validAges: LearnerAgeGroup[] = [
      "kids",
      "youth",
      "young-adults",
      "adults-seniors",
    ];
    const validLevels: LearnerLevel[] = [
      "beginner",
      "intermediate",
      "fluent",
      "advanced",
    ];
    if (
      parsed.ageGroup &&
      validAges.includes(parsed.ageGroup) &&
      parsed.level &&
      validLevels.includes(parsed.level)
    ) {
      return { ageGroup: parsed.ageGroup, level: parsed.level };
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
    // ignore storage errors
  }
}
