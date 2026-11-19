"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import {
  type GameType,
  type LearnerProfile,
  formatLearnerProfileBadge,
} from "./learner-profile";
import {
  appendSeenTopics,
  getTodayDateSeed,
  readSeenTopics,
} from "./daily-session";
import { CelebrationBurst } from "./celebration-burst";
import {
  buildFallbackPayload,
  type GeneratedScenarioItem,
} from "@/lib/games-fallback-bank";

export function GurmatScenarioSimulator({
  gameType,
  title,
  learnerProfile,
}: {
  gameType: Extract<GameType, "gurmat-action" | "history-crossroads">;
  title: string;
  learnerProfile: LearnerProfile;
}) {
  const [scenarios, setScenarios] = useState<GeneratedScenarioItem[]>([]);
  const [roundSeed, setRoundSeed] = useState(1);
  const [loading, setLoading] = useState(true);
  const [roundSource, setRoundSource] = useState<"gemini" | "fallback">(
    "fallback"
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(
    null
  );
  const [alignedCount, setAlignedCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const loadRound = useCallback(
    async (seedValue: number, signal?: AbortSignal) => {
      // Clear previous state immediately so stale data is never shown
      setLoading(true);
      setScenarios([]);
      setCurrentIndex(0);
      setSelectedOptionIdx(null);
      setAlignedCount(0);
      setFinished(false);

      try {
        const dateSeed = getTodayDateSeed();
        const excludeTopics = readSeenTopics(gameType, dateSeed);
        const res = await fetch("/api/generate-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({
            gameType,
            ageGroup: learnerProfile.ageGroup,
            knowledgeLevel: learnerProfile.knowledgeLevel,
            seed: seedValue,
            dateSeed,
            roundNumber: seedValue,
            excludeTopics,
          }),
          signal,
        });
        if (!res.ok) throw new Error("Failed to load scenarios");
        const data = (await res.json()) as {
          source?: "gemini" | "fallback";
          scenarios?: GeneratedScenarioItem[];
        };
        if (Array.isArray(data.scenarios) && data.scenarios.length >= 2) {
          setScenarios(data.scenarios);
          setRoundSource(data.source === "gemini" ? "gemini" : "fallback");
          appendSeenTopics(
            gameType,
            data.scenarios.map((s) => `${s.contextTag}: ${s.title}`),
            dateSeed
          );
        } else {
          const fb = buildFallbackPayload(
            gameType,
            learnerProfile.ageGroup,
            learnerProfile.knowledgeLevel,
            seedValue
          );
          setScenarios(fb.scenarios || []);
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
        setScenarios(fb.scenarios || []);
        setRoundSource("fallback");
      } finally {
        setLoading(false);
      }
    },
    [gameType, learnerProfile.ageGroup, learnerProfile.knowledgeLevel]
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadRound(roundSeed, controller.signal);
    return () => controller.abort();
  }, [loadRound, roundSeed]);

  const currentScenario = scenarios[currentIndex] || null;
  const hasChosen = selectedOptionIdx !== null && currentScenario !== null;
  const chosenOption =
    hasChosen && currentScenario
      ? currentScenario.options[selectedOptionIdx]
      : null;

  const progressRatio = finished
    ? 1
    : scenarios.length > 0
      ? (currentIndex + (hasChosen ? 1 : 0)) / scenarios.length
      : 0;

  const handleChoose = (idx: number) => {
    if (hasChosen || !currentScenario) return;
    setSelectedOptionIdx(idx);
    if (currentScenario.options[idx]?.alignment === "gurmat-aligned") {
      setAlignedCount((c) => c + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < scenarios.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOptionIdx(null);
    } else {
      setFinished(true);
    }
  };

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
        className="sanctuary-glass mx-auto max-w-3xl rounded-[var(--radius-card)] border p-6 sm:p-8 space-y-6"
      >
        <div className="space-y-2">
          <div className="h-3.5 w-44 rounded-full bg-current opacity-15 animate-pulse" />
          <p
            style={{ color: "var(--theme-text-muted)" }}
            className="text-sm font-medium"
          >
            Crafting {title} scenarios for{" "}
            {formatLearnerProfileBadge(learnerProfile)}…
          </p>
        </div>
        <div className="h-24 w-full rounded-2xl bg-current opacity-10 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-16 w-full rounded-2xl bg-current opacity-10 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <motion.div
        key={`scenario-done-${roundSeed}`}
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
          color: "var(--text-primary)",
        }}
        className="sanctuary-glass mx-auto max-w-2xl rounded-[var(--radius-card)] border p-6 sm:p-10 space-y-5 text-center"
      >
        <CelebrationBurst active />
        <p
          style={{ color: "var(--accent-text, var(--accent-primary))" }}
          className="text-xs font-extrabold uppercase tracking-[0.2em]"
        >
          Reflection Complete • {formatLearnerProfileBadge(learnerProfile)}
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold">
          {alignedCount} of {scenarios.length} Gurmat-Aligned Choices
        </h2>
        <p
          style={{ color: "var(--theme-text-muted)" }}
          className="text-base sm:text-lg leading-relaxed max-w-lg mx-auto"
        >
          Every real-life dilemma is an opportunity to practice Bibek
          (discernment), Nimrata, and Chardi Kala.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setRoundSeed((s) => s + 1)}
            className="sanctuary-interactive rounded-[var(--radius-control)] bg-gradient-to-r from-[#C59B27] to-[#D97706] px-6 py-3 text-base font-extrabold text-[#18181B] shadow-md hover:brightness-105"
          >
            Continue to Next Round →
          </button>
          <button
            type="button"
            onClick={() => {
              setCurrentIndex(0);
              setSelectedOptionIdx(null);
              setAlignedCount(0);
              setFinished(false);
            }}
            style={{
              backgroundColor: "var(--theme-card-darker)",
              borderColor: "var(--border-subtle)",
            }}
            className="sanctuary-interactive rounded-[var(--radius-control)] border px-5 py-3 text-sm sm:text-base font-semibold hover:border-[#C59B27]"
          >
            Replay These Scenarios
          </button>
        </div>
      </motion.div>
    );
  }

  if (!currentScenario) return null;

  return (
    <div
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
        color: "var(--text-primary)",
      }}
      className="sanctuary-glass mx-auto max-w-3xl rounded-[var(--radius-card)] border p-6 sm:p-8 space-y-6"
    >
      {/* Header + Active Profile & Progress Bar */}
      <div
        className="space-y-3 border-b pb-4"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p
              style={{ color: "var(--accent-text, var(--accent-primary))" }}
              className="text-xs font-extrabold uppercase tracking-[0.18em]"
            >
              Scenario {currentIndex + 1} of {scenarios.length} •{" "}
              {roundSource === "gemini" ? "AI-Tailored" : "Curated"} •{" "}
              {formatLearnerProfileBadge(learnerProfile)}
            </p>
            <h2 className="font-serif text-xl sm:text-2xl font-bold">
              {title}
            </h2>
          </div>

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

        <div
          role="progressbar"
          aria-valuenow={Math.round(progressRatio * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Scenario progress"
          style={{ backgroundColor: "var(--theme-card-darker)" }}
          className="h-2 w-full rounded-full overflow-hidden"
        >
          <motion.div
            initial={false}
            animate={{ scaleX: Math.max(0.05, progressRatio) }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "left center" }}
            className="h-full w-full rounded-full bg-gradient-to-r from-[#C59B27] via-[#D97706] to-[#10B981]"
          />
        </div>
      </div>

      {/* Animated Scenario Body */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${roundSeed}-${currentScenario.id}-${currentIndex}`}
          initial={{ opacity: 0, x: 18, scale: 0.99 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -18, scale: 0.99 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-5"
        >
          <div
            style={{
              backgroundColor: "var(--theme-card-darker)",
              borderColor: "var(--border-subtle)",
            }}
            className="rounded-2xl border p-5 sm:p-6 space-y-2.5"
          >
            <span
              style={{ color: "var(--accent-text, var(--accent-primary))" }}
              className="inline-block text-xs font-extrabold uppercase tracking-[0.16em]"
            >
              ✦ {currentScenario.contextTag}
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold leading-snug">
              {currentScenario.title}
            </h3>
            <p className="text-base sm:text-lg leading-relaxed">
              {currentScenario.scenario}
            </p>
          </div>

          <div
            className="space-y-3"
            role="group"
            aria-label="Choose your response"
          >
            {currentScenario.options.map((opt, idx) => {
              const isSelected = selectedOptionIdx === idx;
              const isGurmat = opt.alignment === "gurmat-aligned";

              let borderColor = "var(--border-subtle)";
              let bgColor = "var(--bg-surface)";
              let boxShadow = "none";
              let badge = "";

              if (hasChosen) {
                if (isGurmat) {
                  borderColor = "#10B981";
                  bgColor = "var(--theme-card-darker)";
                  boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.2)";
                  badge = "✓ Gurmat-Aligned";
                } else if (isSelected) {
                  borderColor = "#D97706";
                  bgColor = "var(--theme-card-darker)";
                  boxShadow = "0 0 0 3px rgba(217, 119, 6, 0.2)";
                  badge =
                    opt.alignment === "reflective"
                      ? "Reflective Choice"
                      : "Cautionary Choice";
                }
              }

              return (
                <button
                  key={`${idx}-${opt.label.slice(0, 24)}`}
                  type="button"
                  disabled={hasChosen}
                  aria-pressed={isSelected}
                  onClick={() => handleChoose(idx)}
                  style={{
                    backgroundColor: bgColor,
                    borderColor,
                    boxShadow,
                  }}
                  className={`sanctuary-interactive w-full rounded-2xl border-2 px-5 py-4 text-left flex items-start justify-between gap-3 transition ${
                    hasChosen
                      ? "cursor-default"
                      : "cursor-pointer hover:border-[#C59B27]"
                  }`}
                >
                  <span className="flex items-start gap-3.5 text-base font-medium leading-relaxed">
                    <span
                      aria-hidden="true"
                      style={{
                        backgroundColor: "var(--theme-card-darker)",
                        borderColor: "var(--border-subtle)",
                      }}
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold"
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt.label}</span>
                  </span>
                  {badge && (
                    <span className="text-xs font-extrabold shrink-0 mt-1">
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Outcome + Highlighted Gurbani Pankti Reflection */}
      <AnimatePresence>
        {hasChosen && chosenOption && (
          <motion.div
            key={`outcome-${currentScenario.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            role="status"
            aria-live="polite"
            className="space-y-4 pt-1"
          >
            <div
              style={{
                backgroundColor: "var(--theme-card-darker)",
                borderColor:
                  chosenOption.alignment === "gurmat-aligned"
                    ? "#10B981"
                    : "#D97706",
              }}
              className="rounded-2xl border p-4 sm:p-5 space-y-1.5"
            >
              <p className="text-sm font-extrabold">
                {chosenOption.alignment === "gurmat-aligned"
                  ? "✓ Outcome — Grounded in Gurmat"
                  : "Outcome & Reflection"}
              </p>
              <p className="text-base leading-relaxed">
                {chosenOption.outcome}
              </p>
            </div>

            {/* Highlighted Gurbani Pankti Callout with Warm Amber Left-Accent Bar */}
            <div
              style={{
                backgroundColor: "var(--theme-card-darker)",
                borderColor: "var(--border-subtle)",
              }}
              className="rounded-2xl border border-l-4 border-l-[#C59B27] p-5 space-y-2"
            >
              <p
                style={{ color: "var(--accent-text, var(--accent-primary))" }}
                className="text-xs font-extrabold uppercase tracking-[0.18em]"
              >
                ✦ Gurbani Pankti &amp; Reflection
              </p>
              <p
                lang="pa"
                className="font-gurmukhi text-xl sm:text-2xl font-bold leading-relaxed"
              >
                {currentScenario.panktiReflection.gurmukhi}
              </p>
              {currentScenario.panktiReflection.transliteration && (
                <p
                  style={{ color: "var(--theme-text-muted)" }}
                  className="text-xs sm:text-sm italic"
                >
                  {currentScenario.panktiReflection.transliteration}
                </p>
              )}
              <p className="text-sm sm:text-base font-semibold leading-relaxed">
                &ldquo;{currentScenario.panktiReflection.translation}&rdquo;
              </p>
              <p
                style={{ color: "var(--theme-text-muted)" }}
                className="text-sm leading-relaxed pt-1 border-t"
              >
                {currentScenario.panktiReflection.reflection}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-end pt-1">
        <button
          type="button"
          disabled={!hasChosen}
          onClick={handleNext}
          className="sanctuary-interactive rounded-[var(--radius-control)] bg-gradient-to-r from-[#C59B27] to-[#D97706] px-6 py-3 text-base font-extrabold text-[#18181B] disabled:opacity-35 disabled:cursor-not-allowed"
        >
          {currentIndex + 1 < scenarios.length
            ? "Next Scenario →"
            : "Complete Reflection →"}
        </button>
      </div>
    </div>
  );
}
