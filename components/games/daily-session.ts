import type { GameType } from "@/components/games/learner-profile";

const MAX_TRACKED_TOPICS = 36;

export function getTodayDateSeed(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getStorageKey(gameType: GameType, dateSeed: string): string {
  return `learnsikhi_game_seen_v1_${dateSeed}_${gameType}`;
}

export function readSeenTopics(gameType: GameType, dateSeed = getTodayDateSeed()): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(getStorageKey(gameType, dateSeed));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map((v) => String(v || "").trim()).filter(Boolean).slice(-MAX_TRACKED_TOPICS)
      : [];
  } catch {
    return [];
  }
}

export function appendSeenTopics(
  gameType: GameType,
  newTopics: string[],
  dateSeed = getTodayDateSeed()
): string[] {
  const existing = readSeenTopics(gameType, dateSeed);
  const cleaned = newTopics
    .map((t) => t.replace(/\s+/g, " ").trim().slice(0, 90))
    .filter(Boolean);
  const merged = Array.from(new Set([...existing, ...cleaned])).slice(-MAX_TRACKED_TOPICS);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        getStorageKey(gameType, dateSeed),
        JSON.stringify(merged)
      );
    } catch {
      // ignore quota errors
    }
  }
  return merged;
}
