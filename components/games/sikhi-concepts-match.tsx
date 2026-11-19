"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import {
  type LearnerProfile,
  formatLearnerProfileBadge,
} from "./learner-profile";
import {
  appendSeenTopics,
  getTodayDateSeed,
  readSeenTopics,
} from "./daily-session";
import { CelebrationBurst } from "./celebration-burst";

interface ConceptPair {
  id: string;
  term: string;
  gurmukhi: string;
  meaning: string;
}

const LOCAL_FALLBACK_CONCEPTS: ConceptPair[] = [
  {
    id: "seva",
    term: "Seva",
    gurmukhi: "ਸੇਵਾ",
    meaning:
      "Selfless service offered to humanity with humility and without expecting reward.",
  },
  {
    id: "simran",
    term: "Simran",
    gurmukhi: "ਸਿਮਰਨ",
    meaning:
      "Loving, mindful remembrance of the One Divine Creator in daily life.",
  },
  {
    id: "hukam",
    term: "Hukam",
    gurmukhi: "ਹੁਕਮ",
    meaning:
      "Divine Order and cosmic harmony—accepting life with wisdom and serenity.",
  },
  {
    id: "kirat-karni",
    term: "Kirat Karni",
    gurmukhi: "ਕਿਰਤ ਕਰਨੀ",
    meaning:
      "Earning an honest, ethical living through dedicated effort and integrity.",
  },
  {
    id: "vand-chakna",
    term: "Vand Chakna",
    gurmukhi: "ਵੰਡ ਛਕਣਾ",
    meaning:
      "Sharing one's earnings, food, and blessings generously with those in need.",
  },
  {
    id: "chardi-kala",
    term: "Chardi Kala",
    gurmukhi: "ਚੜ੍ਹਦੀ ਕਲਾ",
    meaning:
      "Ever-rising spirit—maintaining resilient optimism and courage even in hardship.",
  },
  {
    id: "miri-piri",
    term: "Miri-Piri",
    gurmukhi: "ਮੀਰੀ-ਪੀਰੀ",
    meaning:
      "The harmony of spiritual devotion (Piri) and ethical social justice (Miri).",
  },
];

function deterministicShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let s = seed + 1;
  for (let i = arr.length - 1; i > 0; i -= 1) {
    s = (s * 48271) % 2147483647;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function SikhiConceptsMatch({
  learnerProfile,
}: {
  learnerProfile: LearnerProfile;
}) {
  const [concepts, setConcepts] = useState<ConceptPair[]>(
    LOCAL_FALLBACK_CONCEPTS
  );
  const [roundSeed, setRoundSeed] = useState(1);
  const [shuffleSeed, setShuffleSeed] = useState(11);
  const [loading, setLoading] = useState(true);
  const [roundSource, setRoundSource] = useState<"gemini" | "fallback">(
    "fallback"
  );
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [selectedMeaningId, setSelectedMeaningId] = useState<string | null>(
    null
  );
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [lastMatchedId, setLastMatchedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    tone: "neutral" | "success" | "gentle";
    text: string;
  }>({
    tone: "neutral",
    text: "Select a Sikhi term on the left, then select its plain-English meaning on the right.",
  });

  const loadRound = useCallback(
    async (seedValue: number, signal?: AbortSignal) => {
      setLoading(true);
      setConcepts([]);
      setSelectedTermId(null);
      setSelectedMeaningId(null);
      setMatchedIds([]);
      setLastMatchedId(null);
      setFeedback({
        tone: "neutral",
        text: "Select a Sikhi term on the left, then select its plain-English meaning on the right.",
      });

      try {
        const dateSeed = getTodayDateSeed();
        const excludeTopics = readSeenTopics("concepts", dateSeed);
        const res = await fetch("/api/generate-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({
            gameType: "concepts",
            ageGroup: learnerProfile.ageGroup,
            knowledgeLevel: learnerProfile.knowledgeLevel,
            seed: seedValue,
            dateSeed,
            roundNumber: seedValue,
            excludeTopics,
          }),
          signal,
        });
        if (!res.ok) throw new Error("Failed to fetch concepts round");
        const data = (await res.json()) as {
          source?: "gemini" | "fallback";
          pairs?: ConceptPair[];
        };
        if (Array.isArray(data.pairs) && data.pairs.length >= 5) {
          setConcepts(data.pairs);
          setRoundSource(data.source === "gemini" ? "gemini" : "fallback");
          appendSeenTopics(
            "concepts",
            data.pairs.map((p) => p.term),
            dateSeed
          );
        } else {
          setConcepts(LOCAL_FALLBACK_CONCEPTS);
          setRoundSource("fallback");
        }
      } catch (err) {
        if ((err as { name?: string })?.name === "AbortError") return;
        setConcepts(LOCAL_FALLBACK_CONCEPTS);
        setRoundSource("fallback");
      } finally {
        setShuffleSeed((s) => s + 7);
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

  const shuffledMeanings = useMemo(
    () => deterministicShuffle(concepts, shuffleSeed + roundSeed * 19),
    [concepts, shuffleSeed, roundSeed]
  );

  const checkMatch = (termId: string, meaningId: string) => {
    const termObj = concepts.find((c) => c.id === termId);
    if (!termObj) return;

    if (termId === meaningId) {
      const next = [...matchedIds, termId];
      setMatchedIds(next);
      setLastMatchedId(termId);
      setSelectedTermId(null);
      setSelectedMeaningId(null);
      setFeedback({
        tone: "success",
        text:
          next.length === concepts.length
            ? `Beautiful! You matched all ${concepts.length} Sikhi concepts in this round.`
            : `Matched ${termObj.term} (${termObj.gurmukhi}): ${termObj.meaning}`,
      });
    } else {
      setSelectedTermId(null);
      setSelectedMeaningId(null);
      setFeedback({
        tone: "gentle",
        text: `Not a match yet for ${termObj.term}. Take your time and try another meaning.`,
      });
    }
  };

  const handleSelectTerm = (id: string) => {
    if (matchedIds.includes(id)) return;
    if (selectedTermId === id) {
      setSelectedTermId(null);
      return;
    }
    if (selectedMeaningId) {
      checkMatch(id, selectedMeaningId);
    } else {
      setSelectedTermId(id);
      const item = concepts.find((c) => c.id === id);
      setFeedback({
        tone: "neutral",
        text: `Selected "${item?.term}". Now choose its matching meaning on the right.`,
      });
    }
  };

  const handleSelectMeaning = (id: string) => {
    if (matchedIds.includes(id)) return;
    if (selectedMeaningId === id) {
      setSelectedMeaningId(null);
      return;
    }
    if (selectedTermId) {
      checkMatch(selectedTermId, id);
    } else {
      setSelectedMeaningId(id);
      setFeedback({
        tone: "neutral",
        text: "Selected a meaning. Now choose the matching Sikhi term on the left.",
      });
    }
  };

  const handleShuffleSameRound = () => {
    setShuffleSeed((s) => s + 7);
    setSelectedTermId(null);
    setSelectedMeaningId(null);
    setMatchedIds([]);
    setLastMatchedId(null);
    setFeedback({
      tone: "neutral",
      text: "Select a Sikhi term on the left, then select its plain-English meaning on the right.",
    });
  };

  const isComplete = concepts.length > 0 && matchedIds.length === concepts.length;
  const progressRatio =
    concepts.length > 0 ? matchedIds.length / concepts.length : 0;

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
            Crafting Sikhi concepts for{" "}
            {formatLearnerProfileBadge(learnerProfile)}…
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-2.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="h-16 rounded-2xl bg-current opacity-10 animate-pulse"
              />
            ))}
          </div>
          <div className="lg:col-span-7 space-y-2.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="h-16 rounded-2xl bg-current opacity-10 animate-pulse"
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold">
              Sikhi Concepts Match
            </h2>
            <p
              style={{ color: "var(--theme-text-muted)" }}
              className="text-sm sm:text-base"
            >
              Matched {matchedIds.length} of {concepts.length} concepts •{" "}
              {roundSource === "gemini" ? "AI-Tailored Round" : "Curated Round"}
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
              style={{
                backgroundColor: "var(--theme-card-darker)",
                borderColor: "var(--border-subtle)",
              }}
              className="sanctuary-interactive inline-flex items-center gap-1.5 rounded-[var(--radius-control)] border px-3.5 py-2 text-xs sm:text-sm font-semibold hover:border-[#C59B27]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Set
            </button>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div
          role="progressbar"
          aria-valuenow={Math.round(progressRatio * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Concepts match progress"
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
            All Concepts Matched!
          </p>
          <p
            style={{ color: "var(--theme-text-muted)" }}
            className="text-sm sm:text-base"
          >
            Beautiful focus. Continue to explore a fresh set of Gurmat
            vocabulary.
          </p>
          <button
            type="button"
            onClick={() => setRoundSeed((s) => s + 1)}
            className="sanctuary-interactive rounded-[var(--radius-control)] bg-gradient-to-r from-[#C59B27] to-[#D97706] px-6 py-2.5 text-sm sm:text-base font-extrabold text-[#18181B]"
          >
            Continue to Next Round →
          </button>
        </motion.div>
      )}

      {/* Clean 2-Column Concepts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div
          className="lg:col-span-5 space-y-2.5"
          role="group"
          aria-label="Sikhi terms"
        >
          <p
            style={{ color: "var(--accent-text, var(--accent-primary))" }}
            className="text-xs font-bold uppercase tracking-[0.18em]"
          >
            Sikhi Terms
          </p>
          <div className="space-y-2.5">
            {concepts.map((item) => {
              const matched = matchedIds.includes(item.id);
              const selected = selectedTermId === item.id;
              const justMatched = lastMatchedId === item.id;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  disabled={matched}
                  aria-pressed={selected}
                  onClick={() => handleSelectTerm(item.id)}
                  animate={justMatched ? { scale: [1, 1.025, 1] } : { scale: 1 }}
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
                  className={`sanctuary-interactive w-full min-h-[4.25rem] rounded-2xl border-2 px-4 py-3 flex items-center justify-between gap-3 text-left transition ${
                    matched ? "opacity-75 cursor-default" : "cursor-pointer"
                  }`}
                >
                  <div>
                    <span className="block font-serif text-lg font-bold">
                      {item.term}
                    </span>
                    <span
                      lang="pa"
                      style={{
                        color: "var(--accent-text, var(--accent-primary))",
                      }}
                      className="font-gurmukhi text-sm font-semibold"
                    >
                      {item.gurmukhi}
                    </span>
                  </div>
                  <span className="text-xs font-bold shrink-0">
                    {matched ? "✓ Matched" : selected ? "Selected" : ""}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div
          className="lg:col-span-7 space-y-2.5"
          role="group"
          aria-label="Plain-English meanings"
        >
          <p
            style={{ color: "var(--accent-text, var(--accent-primary))" }}
            className="text-xs font-bold uppercase tracking-[0.18em]"
          >
            Plain-English Meanings
          </p>
          <div className="space-y-2.5">
            {shuffledMeanings.map((item) => {
              const matched = matchedIds.includes(item.id);
              const selected = selectedMeaningId === item.id;
              const justMatched = lastMatchedId === item.id;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  disabled={matched}
                  aria-pressed={selected}
                  onClick={() => handleSelectMeaning(item.id)}
                  animate={justMatched ? { scale: [1, 1.02, 1] } : { scale: 1 }}
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
                  className={`sanctuary-interactive w-full min-h-[4.25rem] rounded-2xl border-2 px-4 py-3 flex items-center justify-between gap-3 text-left transition ${
                    matched ? "opacity-75 cursor-default" : "cursor-pointer"
                  }`}
                >
                  <span className="text-sm sm:text-base leading-relaxed">
                    {item.meaning}
                  </span>
                  {matched && (
                    <span className="text-xs font-bold shrink-0">
                      ✓ {item.term}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
