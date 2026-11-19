"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  type GameType,
  type LearnerProfile,
  formatLearnerProfileBadge,
} from "./learner-profile";
import { CelebrationBurst } from "./celebration-burst";
import {
  buildFallbackPayload,
  type GeneratedMatchPair,
} from "@/lib/games-fallback-bank";

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

export function AdaptiveMatchGame({
  gameType,
  title,
  leftColumnLabel,
  rightColumnLabel,
  learnerProfile,
}: {
  gameType: Extract<
    GameType,
    "raag-pehar" | "pankti-decoder" | "gurbani-synthesis"
  >;
  title: string;
  leftColumnLabel: string;
  rightColumnLabel: string;
  learnerProfile: LearnerProfile;
}) {
  const [pairs, setPairs] = useState<GeneratedMatchPair[]>([]);
  const [roundSeed, setRoundSeed] = useState(1);
  const [shuffleSeed, setShuffleSeed] = useState(13);
  const [loading, setLoading] = useState(true);
  const [roundSource, setRoundSource] = useState<"gemini" | "fallback">(
    "fallback"
  );
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [selectedRightId, setSelectedRightId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [lastMatchedId, setLastMatchedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    tone: "neutral" | "success" | "gentle";
    text: string;
  }>({
    tone: "neutral",
    text: `Select an item under ${leftColumnLabel}, then choose its matching pair under ${rightColumnLabel}.`,
  });

  const loadRound = useCallback(
    async (seedValue: number, signal?: AbortSignal) => {
      setLoading(true);
      setPairs([]);
      setSelectedLeftId(null);
      setSelectedRightId(null);
      setMatchedIds([]);
      setLastMatchedId(null);
      setFeedback({
        tone: "neutral",
        text: `Select an item under ${leftColumnLabel}, then choose its matching pair under ${rightColumnLabel}.`,
      });

      try {
        const res = await fetch("/api/generate-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({
            gameType,
            ageGroup: learnerProfile.ageGroup,
            knowledgeLevel: learnerProfile.knowledgeLevel,
            seed: seedValue,
          }),
          signal,
        });
        if (!res.ok) throw new Error("Failed to load match round");
        const data = (await res.json()) as {
          source?: "gemini" | "fallback";
          pairs?: GeneratedMatchPair[];
        };
        if (Array.isArray(data.pairs) && data.pairs.length >= 4) {
          setPairs(data.pairs);
          setRoundSource(data.source === "gemini" ? "gemini" : "fallback");
        } else {
          const fb = buildFallbackPayload(
            gameType,
            learnerProfile.ageGroup,
            learnerProfile.knowledgeLevel,
            seedValue
          );
          setPairs(fb.pairs || []);
          setRoundSource("fallback");
        }
      } catch (err) {
        if ((err as { name?: string })?.name === "AbortError") return;
        const fb = buildFallbackPayload(
          gameType,
          learnerProfile.ageGroup,
          learnerProfile.knowledgeLevel,
          seedValue
        );
        setPairs(fb.pairs || []);
        setRoundSource("fallback");
      } finally {
        setShuffleSeed((s) => s + 7);
        setLoading(false);
      }
    },
    [
      gameType,
      leftColumnLabel,
      rightColumnLabel,
      learnerProfile.ageGroup,
      learnerProfile.knowledgeLevel,
    ]
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadRound(roundSeed, controller.signal);
    return () => controller.abort();
  }, [loadRound, roundSeed]);

  const shuffledRight = useMemo(
    () => deterministicShuffle(pairs, shuffleSeed + roundSeed * 17),
    [pairs, shuffleSeed, roundSeed]
  );

  const checkPair = (leftId: string, rightId: string) => {
    const leftObj = pairs.find((p) => p.id === leftId);
    if (!leftObj) return;

    if (leftId === rightId) {
      const next = [...matchedIds, leftId];
      setMatchedIds(next);
      setLastMatchedId(leftId);
      setSelectedLeftId(null);
      setSelectedRightId(null);
      setFeedback({
        tone: "success",
        text:
          next.length === pairs.length
            ? `Excellent! You completed all ${pairs.length} pairs in ${title}.`
            : leftObj.insight
              ? `Matched! ${leftObj.insight}`
              : `Matched ${leftObj.leftPrimary} cleanly.`,
      });
    } else {
      setSelectedLeftId(null);
      setSelectedRightId(null);
      setFeedback({
        tone: "gentle",
        text: "Not a match yet—take a calm moment and try another pairing.",
      });
    }
  };

  const handleSelectLeft = (id: string) => {
    if (matchedIds.includes(id)) return;
    if (selectedLeftId === id) {
      setSelectedLeftId(null);
      return;
    }
    if (selectedRightId) {
      checkPair(id, selectedRightId);
    } else {
      setSelectedLeftId(id);
      setFeedback({
        tone: "neutral",
        text: `Selected an item on the left. Now choose its matching pair under ${rightColumnLabel}.`,
      });
    }
  };

  const handleSelectRight = (id: string) => {
    if (matchedIds.includes(id)) return;
    if (selectedRightId === id) {
      setSelectedRightId(null);
      return;
    }
    if (selectedLeftId) {
      checkPair(selectedLeftId, id);
    } else {
      setSelectedRightId(id);
      setFeedback({
        tone: "neutral",
        text: `Selected an item on the right. Now choose its matching pair under ${leftColumnLabel}.`,
      });
    }
  };

  const isComplete = pairs.length > 0 && matchedIds.length === pairs.length;
  const progressRatio = pairs.length > 0 ? matchedIds.length / pairs.length : 0;
  const isGurmukhiLeft = gameType === "gurbani-synthesis";

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
          <div className="h-6 w-60 rounded-lg bg-current opacity-15 animate-pulse" />
          <p
            style={{ color: "var(--theme-text-muted)" }}
            className="text-sm font-medium"
          >
            Tailoring {title} for {formatLearnerProfileBadge(learnerProfile)}…
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-2.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="h-20 rounded-2xl bg-current opacity-10 animate-pulse"
              />
            ))}
          </div>
          <div className="lg:col-span-7 space-y-2.5">
            {[1, 2, 3, 4, 5].map((n) => (
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold">
              {title}
            </h2>
            <p
              style={{ color: "var(--theme-text-muted)" }}
              className="text-sm sm:text-base"
            >
              Matched {matchedIds.length} of {pairs.length} •{" "}
              {roundSource === "gemini" ? "AI-Tailored" : "Curated"} •{" "}
              {formatLearnerProfileBadge(learnerProfile)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShuffleSeed((s) => s + 5);
                setSelectedLeftId(null);
                setSelectedRightId(null);
                setMatchedIds([]);
                setLastMatchedId(null);
              }}
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

        <div
          role="progressbar"
          aria-valuenow={Math.round(progressRatio * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${title} progress`}
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
            Ready for a brand-new set tailored to{" "}
            {formatLearnerProfileBadge(learnerProfile)}?
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div
          className="lg:col-span-5 space-y-2.5"
          role="group"
          aria-label={leftColumnLabel}
        >
          <p
            style={{ color: "var(--accent-text, var(--accent-primary))" }}
            className="text-xs font-extrabold uppercase tracking-[0.18em]"
          >
            {leftColumnLabel}
          </p>
          <div className="space-y-2.5">
            {pairs.map((item) => {
              const matched = matchedIds.includes(item.id);
              const selected = selectedLeftId === item.id;
              const justMatched = lastMatchedId === item.id;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  disabled={matched}
                  aria-pressed={selected}
                  onClick={() => handleSelectLeft(item.id)}
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
                  className={`sanctuary-interactive w-full min-h-[4.5rem] rounded-2xl border-2 px-4 py-3.5 flex items-center justify-between gap-3 text-left transition ${
                    matched ? "opacity-75 cursor-default" : "cursor-pointer"
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <span
                      lang={isGurmukhiLeft ? "pa" : undefined}
                      className={`block font-bold leading-snug ${
                        isGurmukhiLeft
                          ? "font-gurmukhi text-lg"
                          : "font-serif text-lg"
                      }`}
                    >
                      {item.leftPrimary}
                    </span>
                    {item.leftSecondary && (
                      <span
                        lang={gameType === "pankti-decoder" ? "pa" : undefined}
                        style={{
                          color: "var(--accent-text, var(--accent-primary))",
                        }}
                        className={`block text-xs sm:text-sm font-semibold ${
                          gameType === "pankti-decoder" ? "font-gurmukhi" : ""
                        }`}
                      >
                        {item.leftSecondary}
                      </span>
                    )}
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
          aria-label={rightColumnLabel}
        >
          <p
            style={{ color: "var(--accent-text, var(--accent-primary))" }}
            className="text-xs font-extrabold uppercase tracking-[0.18em]"
          >
            {rightColumnLabel}
          </p>
          <div className="space-y-2.5">
            {shuffledRight.map((item) => {
              const matched = matchedIds.includes(item.id);
              const selected = selectedRightId === item.id;
              const justMatched = lastMatchedId === item.id;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  disabled={matched}
                  aria-pressed={selected}
                  onClick={() => handleSelectRight(item.id)}
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
                  className={`sanctuary-interactive w-full min-h-[4.5rem] rounded-2xl border-2 px-4 py-3.5 flex items-center justify-between gap-3 text-left transition ${
                    matched ? "opacity-75 cursor-default" : "cursor-pointer"
                  }`}
                >
                  <span className="text-sm sm:text-base leading-relaxed">
                    {item.rightPrimary}
                  </span>
                  {matched && (
                    <span className="text-xs font-bold shrink-0">✓ Matched</span>
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
