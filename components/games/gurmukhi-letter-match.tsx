"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  type LearnerProfile,
  formatLearnerProfileBadge,
} from "./learner-profile";
import { CelebrationBurst } from "./celebration-burst";

interface LetterPair {
  id: string;
  gurmukhi: string;
  sound: string;
  name: string;
  example: string;
}

const LOCAL_FALLBACK_PAIRS: LetterPair[] = [
  { id: "oora", gurmukhi: "ੳ", sound: "U / O (Oora)", name: "Oora", example: "Vowel carrier for u / o" },
  { id: "aira", gurmukhi: "ਅ", sound: "A (Aira)", name: "Aira", example: "Vowel carrier for a / aa" },
  { id: "eeri", gurmukhi: "ੲ", sound: "I / E (Eeri)", name: "Eeri", example: "Vowel carrier for i / e" },
  { id: "sassa", gurmukhi: "ਸ", sound: "S (Sassa)", name: "Sassa", example: "As in Sat (Truth)" },
  { id: "haha", gurmukhi: "ਹ", sound: "H (Haha)", name: "Haha", example: "As in Hukam (Divine Order)" },
  { id: "kakka", gurmukhi: "ਕ", sound: "K (Kakka)", name: "Kakka", example: "As in Kirat (Honest work)" },
  { id: "khakha", gurmukhi: "ਖ", sound: "Kh (Khakha)", name: "Khakha", example: "As in Khalsa" },
  { id: "gagga", gurmukhi: "ਗ", sound: "G (Gagga)", name: "Gagga", example: "As in Guru" },
];

function deterministicShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let s = seed + 1;
  for (let i = arr.length - 1; i > 0; i -= 1) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function GurmukhiLetterMatch({
  learnerProfile,
}: {
  learnerProfile: LearnerProfile;
}) {
  const [pairs, setPairs] = useState<LetterPair[]>(LOCAL_FALLBACK_PAIRS);
  const [roundSeed, setRoundSeed] = useState(1);
  const [shuffleSeed, setShuffleSeed] = useState(3);
  const [loading, setLoading] = useState(true);
  const [roundSource, setRoundSource] = useState<"gemini" | "fallback">(
    "fallback"
  );
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);
  const [selectedSoundId, setSelectedSoundId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [lastMatchedId, setLastMatchedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    tone: "neutral" | "success" | "gentle";
    text: string;
  }>({
    tone: "neutral",
    text: "Select a Gurmukhi character on the left, then select its matching English phonetic sound on the right.",
  });

  const loadRound = useCallback(
    async (seedValue: number, signal?: AbortSignal) => {
      setLoading(true);
      setPairs([]);
      setSelectedLetterId(null);
      setSelectedSoundId(null);
      setMatchedIds([]);
      setLastMatchedId(null);
      setFeedback({
        tone: "neutral",
        text: "Select a Gurmukhi character on the left, then select its matching English phonetic sound on the right.",
      });

      try {
        const res = await fetch("/api/generate-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({
            gameType: "gurmukhi",
            ageGroup: learnerProfile.ageGroup,
            knowledgeLevel: learnerProfile.knowledgeLevel,
            seed: seedValue,
          }),
          signal,
        });
        if (!res.ok) throw new Error("Failed to load Gurmukhi round");
        const data = (await res.json()) as {
          source?: "gemini" | "fallback";
          pairs?: LetterPair[];
        };
        if (Array.isArray(data.pairs) && data.pairs.length >= 6) {
          setPairs(data.pairs);
          setRoundSource(data.source === "gemini" ? "gemini" : "fallback");
        } else {
          setPairs(LOCAL_FALLBACK_PAIRS);
          setRoundSource("fallback");
        }
      } catch (err) {
        if ((err as { name?: string })?.name === "AbortError") return;
        setPairs(LOCAL_FALLBACK_PAIRS);
        setRoundSource("fallback");
      } finally {
        setShuffleSeed((s) => s + 5);
        setLoading(false);
      }
    },
    [learnerProfile.ageGroup, learnerProfile.knowledgeLevel]
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadRound(roundSeed, controller.signal);
    return () => controller.abort();
  }, [loadRound, roundSeed]);

  const shuffledSounds = useMemo(
    () => deterministicShuffle(pairs, shuffleSeed + roundSeed * 13),
    [pairs, shuffleSeed, roundSeed]
  );

  const checkPair = (letterId: string, soundId: string) => {
    const letter = pairs.find((p) => p.id === letterId);
    const sound = pairs.find((p) => p.id === soundId);
    if (!letter || !sound) return;

    if (letterId === soundId) {
      const nextMatched = [...matchedIds, letterId];
      setMatchedIds(nextMatched);
      setLastMatchedId(letterId);
      setSelectedLetterId(null);
      setSelectedSoundId(null);
      setFeedback({
        tone: "success",
        text:
          nextMatched.length === pairs.length
            ? `Well done! You matched all ${pairs.length} Gurmukhi items in this round.`
            : `Matched ${letter.gurmukhi} with ${letter.sound} — ${letter.example}.`,
      });
    } else {
      setSelectedLetterId(null);
      setSelectedSoundId(null);
      setFeedback({
        tone: "gentle",
        text: `Not quite — ${letter.gurmukhi} does not match ${sound.sound}. Try another pairing.`,
      });
    }
  };

  const handleSelectLetter = (id: string) => {
    if (matchedIds.includes(id)) return;
    if (selectedLetterId === id) {
      setSelectedLetterId(null);
      return;
    }
    if (selectedSoundId) {
      checkPair(id, selectedSoundId);
    } else {
      setSelectedLetterId(id);
      const item = pairs.find((p) => p.id === id);
      setFeedback({
        tone: "neutral",
        text: `Selected ${item?.gurmukhi || "letter"}. Now choose its matching phonetic sound.`,
      });
    }
  };

  const handleSelectSound = (id: string) => {
    if (matchedIds.includes(id)) return;
    if (selectedSoundId === id) {
      setSelectedSoundId(null);
      return;
    }
    if (selectedLetterId) {
      checkPair(selectedLetterId, id);
    } else {
      setSelectedSoundId(id);
      const item = pairs.find((p) => p.id === id);
      setFeedback({
        tone: "neutral",
        text: `Selected "${item?.sound || "sound"}". Now choose the matching Gurmukhi character.`,
      });
    }
  };

  const handleShuffleSameRound = () => {
    setShuffleSeed((s) => s + 7);
    setSelectedLetterId(null);
    setSelectedSoundId(null);
    setMatchedIds([]);
    setLastMatchedId(null);
    setFeedback({
      tone: "neutral",
      text: "Select a Gurmukhi character on the left, then select its matching English phonetic sound on the right.",
    });
  };

  const isComplete = pairs.length > 0 && matchedIds.length === pairs.length;
  const progressRatio = pairs.length > 0 ? matchedIds.length / pairs.length : 0;

  if (loading) {
    return (
      <div
        aria-busy="true"
        aria-live="polite"
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
          color: "var(--text-primary)",
        }}
        className="sanctuary-glass rounded-[var(--radius-card)] border p-6 sm:p-8 space-y-6"
      >
        <div className="space-y-2">
          <div className="h-6 w-56 rounded-lg bg-current opacity-15 animate-pulse" />
          <p
            style={{ color: "var(--theme-text-muted)" }}
            className="text-sm font-medium"
          >
            Preparing Gurmukhi practice for{" "}
            {formatLearnerProfileBadge(learnerProfile)}…
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-20 rounded-2xl bg-current opacity-10 animate-pulse"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-20 rounded-2xl bg-current opacity-10 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
        color: "var(--text-primary)",
      }}
      className="sanctuary-glass rounded-[var(--radius-card)] border p-6 sm:p-8 space-y-6"
    >
      {/* Header & Progress */}
      <div
        className="space-y-3 border-b pb-4"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold">
              Gurmukhi Letter Match
            </h2>
            <p
              style={{ color: "var(--theme-text-muted)" }}
              className="text-sm sm:text-base"
            >
              Matched {matchedIds.length} of {pairs.length} •{" "}
              {roundSource === "gemini" ? "AI-Tailored Set" : "Curated Set"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleShuffleSameRound}
              style={{ borderColor: "var(--border-subtle)" }}
              className="sanctuary-interactive rounded-[var(--radius-control)] border px-3.5 py-2 text-xs sm:text-sm font-semibold hover:border-[#C59B27]"
            >
              Shuffle Set
            </button>
            <button
              type="button"
              onClick={() => setRoundSeed((s) => s + 1)}
              className="sanctuary-interactive rounded-[var(--radius-control)] bg-gradient-to-r from-[#C59B27] to-[#D97706] px-4 py-2 text-xs sm:text-sm font-extrabold text-[#18181B]"
            >
              ✨ Generate Fresh Round
            </button>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div
          role="progressbar"
          aria-valuenow={Math.round(progressRatio * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Gurmukhi match progress"
          style={{ backgroundColor: "var(--theme-card-darker)" }}
          className="h-2 w-full rounded-full overflow-hidden"
        >
          <motion.div
            initial={false}
            animate={{ scaleX: Math.max(0.03, progressRatio) }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "left center" }}
            className="h-full w-full rounded-full bg-gradient-to-r from-[#C59B27] via-[#D97706] to-[#10B981]"
          />
        </div>
      </div>

      {/* Live Feedback Region */}
      <div
        role="status"
        aria-live="polite"
        style={{
          backgroundColor: "var(--theme-card-darker)",
          borderColor:
            feedback.tone === "success"
              ? "#10B981"
              : feedback.tone === "gentle"
                ? "#D97706"
                : "var(--border-subtle)",
          boxShadow:
            feedback.tone === "success"
              ? "0 8px 24px -10px rgba(16, 185, 129, 0.32)"
              : feedback.tone === "gentle"
                ? "0 8px 24px -10px rgba(217, 119, 6, 0.28)"
                : "none",
        }}
        className="min-h-[3.5rem] flex items-center rounded-[var(--radius-control)] border px-4 py-3 text-base font-medium leading-relaxed transition-all duration-200"
      >
        <span>
          {feedback.tone === "success" ? "✓ " : ""}
          {feedback.text}
        </span>
      </div>

      {isComplete && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          style={{
            backgroundColor: "var(--theme-card-darker)",
            borderColor: "#10B981",
          }}
          className="rounded-2xl border p-5 text-center space-y-3"
        >
          <CelebrationBurst active />
          <p className="font-serif text-xl sm:text-2xl font-bold">
            Round Complete!
          </p>
          <p
            style={{ color: "var(--theme-text-muted)" }}
            className="text-sm sm:text-base"
          >
            You paired every Gurmukhi character cleanly. Ready for a fresh AI
            round?
          </p>
          <button
            type="button"
            onClick={() => setRoundSeed((s) => s + 1)}
            className="sanctuary-interactive rounded-[var(--radius-control)] bg-gradient-to-r from-[#C59B27] to-[#D97706] px-6 py-2.5 text-sm sm:text-base font-extrabold text-[#18181B]"
          >
            ✨ Generate Fresh Round
          </button>
        </motion.div>
      )}

      {/* Clean 2-Column Matching Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className="space-y-2.5"
          role="group"
          aria-label="Gurmukhi characters"
        >
          <p
            style={{ color: "var(--accent-text, var(--accent-primary))" }}
            className="text-xs font-bold uppercase tracking-[0.18em]"
          >
            Gurmukhi Characters
          </p>
          <div className="grid grid-cols-2 gap-3">
            {pairs.map((pair) => {
              const matched = matchedIds.includes(pair.id);
              const selected = selectedLetterId === pair.id;
              const justMatched = lastMatchedId === pair.id;
              return (
                <motion.button
                  key={pair.id}
                  type="button"
                  disabled={matched}
                  aria-pressed={selected}
                  aria-label={`Gurmukhi letter ${pair.name}${matched ? ", matched" : ""}`}
                  onClick={() => handleSelectLetter(pair.id)}
                  animate={justMatched ? { scale: [1, 1.03, 1] } : { scale: 1 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    backgroundColor: matched
                      ? "var(--theme-card-darker)"
                      : "var(--bg-surface)",
                    borderColor: matched
                      ? "#10B981"
                      : selected
                        ? "#C59B27"
                        : "var(--border-subtle)",
                    boxShadow: matched
                      ? "0 0 0 2px rgba(16, 185, 129, 0.18)"
                      : selected
                        ? "0 0 0 3px rgba(197, 155, 39, 0.28)"
                        : "none",
                  }}
                  className={`sanctuary-interactive min-h-[4.5rem] rounded-2xl border-2 px-4 py-3 flex items-center justify-between gap-2 text-left transition ${
                    matched ? "opacity-75 cursor-default" : "cursor-pointer"
                  }`}
                >
                  <span
                    lang="pa"
                    className="font-gurmukhi text-2xl sm:text-3xl font-bold leading-none"
                  >
                    {pair.gurmukhi}
                  </span>
                  <span className="text-xs font-bold">
                    {matched ? "✓ Matched" : selected ? "Selected" : ""}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div
          className="space-y-2.5"
          role="group"
          aria-label="English phonetic sounds"
        >
          <p
            style={{ color: "var(--accent-text, var(--accent-primary))" }}
            className="text-xs font-bold uppercase tracking-[0.18em]"
          >
            English Phonetic Sounds
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {shuffledSounds.map((pair) => {
              const matched = matchedIds.includes(pair.id);
              const selected = selectedSoundId === pair.id;
              const justMatched = lastMatchedId === pair.id;
              return (
                <motion.button
                  key={pair.id}
                  type="button"
                  disabled={matched}
                  aria-pressed={selected}
                  aria-label={`Phonetic sound ${pair.sound}${matched ? ", matched" : ""}`}
                  onClick={() => handleSelectSound(pair.id)}
                  animate={justMatched ? { scale: [1, 1.03, 1] } : { scale: 1 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    backgroundColor: matched
                      ? "var(--theme-card-darker)"
                      : "var(--bg-surface)",
                    borderColor: matched
                      ? "#10B981"
                      : selected
                        ? "#C59B27"
                        : "var(--border-subtle)",
                    boxShadow: matched
                      ? "0 0 0 2px rgba(16, 185, 129, 0.18)"
                      : selected
                        ? "0 0 0 3px rgba(197, 155, 39, 0.28)"
                        : "none",
                  }}
                  className={`sanctuary-interactive min-h-[4.5rem] rounded-2xl border-2 px-4 py-3 flex flex-col justify-center text-left transition ${
                    matched ? "opacity-75 cursor-default" : "cursor-pointer"
                  }`}
                >
                  <span className="text-base font-bold leading-snug">
                    {pair.sound}
                  </span>
                  <span
                    style={{ color: "var(--theme-text-muted)" }}
                    className="text-xs mt-0.5"
                  >
                    {matched
                      ? `✓ ${pair.gurmukhi} · ${pair.example}`
                      : pair.example}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
