"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LearnFirstGameShell } from "@/components/games/learn-first-game-shell";
import { GurmukhiLetterMatch } from "@/components/games/gurmukhi-letter-match";
import { SikhHistoryQuiz } from "@/components/games/sikh-history-quiz";
import { SikhiConceptsMatch } from "@/components/games/sikhi-concepts-match";
import {
  AGE_GROUP_OPTIONS,
  KNOWLEDGE_LEVEL_OPTIONS,
  type LearnerAgeGroup,
  type LearnerLevel,
  type LearnerProfile,
  formatLearnerProfileBadge,
  readStoredLearnerProfile,
  saveStoredLearnerProfile,
} from "@/components/games/learner-profile";

type ActiveGameId = "gurmukhi" | "history" | "concepts";

interface GameHubEntry {
  id: ActiveGameId;
  title: string;
  description: string;
  rulesSubtitle: string;
  rules: string[];
}

const GAMES_CATALOG: GameHubEntry[] = [
  {
    id: "gurmukhi",
    title: "Gurmukhi Letter Match",
    description:
      "Match Gurmukhi characters to their English phonetic sounds in a calm two-column grid tailored to your level.",
    rulesSubtitle:
      "Build comfortable recognition of Gurmukhi letters and their everyday spoken sounds.",
    rules: [
      "Choose a Gurmukhi character on the left and select its matching English phonetic sound on the right.",
      "You can navigate completely with your mouse or keyboard (Tab, Enter, or Space).",
      "Click Generate Fresh Round anytime for a brand-new set matched to your learning level.",
    ],
  },
  {
    id: "history",
    title: "Sikh History & Heritage Quiz",
    description:
      "Explore untimed AI-tailored multiple-choice rounds on the Ten Gurus, Sikh history, and living Gurmat values.",
    rulesSubtitle:
      "Read thoughtfully and learn the story behind each historical milestone at your own pace.",
    rules: [
      "Select the answer you believe best fits each question—there is no countdown clock.",
      "After every choice, read the clear explanation before clicking Next.",
      "Click Generate Fresh Round anytime to explore new questions adapted to your age and level.",
    ],
  },
  {
    id: "concepts",
    title: "Sikhi Concepts Match",
    description:
      "Pair foundational and deeper Sikhi terms like Seva, Simran, Hukam, and Chardi Kala with clear plain-English meanings.",
    rulesSubtitle:
      "Connect core Gurmat principles to clear, practical everyday definitions.",
    rules: [
      "Select a Sikhi term in the left column, then choose its plain-English meaning in the right column.",
      "Matched pairs glow softly in emerald so you can review them as you complete the round.",
      "Click Generate Fresh Round whenever you want a fresh set of concepts for your level.",
    ],
  },
];

function LearnerSetupPanel({
  initialProfile,
  isEditingExisting,
  onSave,
  onCancel,
}: {
  initialProfile: LearnerProfile | null;
  isEditingExisting: boolean;
  onSave: (profile: LearnerProfile) => void;
  onCancel?: () => void;
}) {
  const [ageGroup, setAgeGroup] = useState<LearnerAgeGroup>(
    initialProfile?.ageGroup ?? "young-adults"
  );
  const [level, setLevel] = useState<LearnerLevel>(
    initialProfile?.level ?? "beginner"
  );

  return (
    <motion.section
      key="learner-setup-card"
      initial={{ opacity: 0, y: 12, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.99 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Learner setup"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
        color: "var(--text-primary)",
      }}
      className="sanctuary-glass mx-auto max-w-3xl rounded-[var(--radius-card)] border p-6 sm:p-10 space-y-8"
    >
      <div className="space-y-2">
        <p
          style={{ color: "var(--accent-text, var(--accent-primary))" }}
          className="text-xs font-bold uppercase tracking-[0.22em]"
        >
          Personalized Learning Setup
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
          Tailor Games to Your Pace
        </h2>
        <p
          style={{ color: "var(--theme-text-muted)" }}
          className="text-base leading-relaxed"
        >
          Choose your age group and Sikhi familiarity so questions, Gurmukhi
          practice, and explanations feel clear and welcoming. You can change
          this anytime.
        </p>
      </div>

      {/* Question 1: Age Group */}
      <div className="space-y-3" role="radiogroup" aria-label="Select age group">
        <p className="text-sm font-bold uppercase tracking-[0.16em]">
          1. Age Group
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {AGE_GROUP_OPTIONS.map((opt) => {
            const active = ageGroup === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setAgeGroup(opt.id)}
                style={{
                  borderColor: active ? "#C59B27" : "var(--border-subtle)",
                  backgroundColor: "var(--bg-surface)",
                }}
                className="sanctuary-interactive relative overflow-hidden rounded-2xl border-2 p-4 text-left transition"
              >
                {active && (
                  <motion.span
                    layoutId="games-age-active-bg"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    style={{ backgroundColor: "var(--theme-card-darker)" }}
                    className="pointer-events-none absolute inset-0 z-0"
                  />
                )}
                <div className="relative z-10 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-serif text-lg font-bold">
                      {opt.label}
                    </span>
                    <span
                      style={{
                        color: "var(--accent-text, var(--accent-primary))",
                      }}
                      className="text-xs font-extrabold uppercase tracking-wider"
                    >
                      {opt.range}
                    </span>
                  </div>
                  <p
                    style={{ color: "var(--theme-text-muted)" }}
                    className="text-xs sm:text-sm leading-relaxed"
                  >
                    {opt.hint}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Question 2: Sikhi Knowledge Level */}
      <div
        className="space-y-3"
        role="radiogroup"
        aria-label="Select Sikhi knowledge level"
      >
        <p className="text-sm font-bold uppercase tracking-[0.16em]">
          2. Sikhi Knowledge Level
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {KNOWLEDGE_LEVEL_OPTIONS.map((opt) => {
            const active = level === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setLevel(opt.id)}
                style={{
                  borderColor: active ? "#C59B27" : "var(--border-subtle)",
                  backgroundColor: "var(--bg-surface)",
                }}
                className="sanctuary-interactive relative overflow-hidden rounded-2xl border-2 p-4 text-left transition"
              >
                {active && (
                  <motion.span
                    layoutId="games-level-active-bg"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    style={{ backgroundColor: "var(--theme-card-darker)" }}
                    className="pointer-events-none absolute inset-0 z-0"
                  />
                )}
                <div className="relative z-10 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-serif text-lg font-bold">
                      {opt.label}
                    </span>
                    {active && (
                      <span
                        style={{
                          color: "var(--accent-text, var(--accent-primary))",
                        }}
                        className="text-xs font-extrabold"
                      >
                        ✓ Selected
                      </span>
                    )}
                  </div>
                  <p
                    style={{ color: "var(--theme-text-muted)" }}
                    className="text-xs sm:text-sm leading-relaxed"
                  >
                    {opt.hint}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        {isEditingExisting && onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            style={{ borderColor: "var(--border-subtle)" }}
            className="sanctuary-interactive rounded-[var(--radius-control)] border px-5 py-2.5 text-sm font-semibold hover:border-[#C59B27]"
          >
            Cancel
          </button>
        ) : (
          <p
            style={{ color: "var(--theme-text-muted)" }}
            className="text-xs sm:text-sm"
          >
            Saved privately in your browser • Change anytime
          </p>
        )}

        <button
          type="button"
          onClick={() => onSave({ ageGroup, level })}
          className="sanctuary-interactive rounded-[var(--radius-control)] bg-gradient-to-r from-[#C59B27] to-[#D97706] px-7 py-3 text-base font-extrabold text-[#18181B] shadow-md hover:brightness-105"
        >
          {isEditingExisting ? "Save & Update Games" : "Continue to Games →"}
        </button>
      </div>
    </motion.section>
  );
}

function GamesHubContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeGameId, setActiveGameId] = useState<ActiveGameId | null>(null);
  const [learnerProfile, setLearnerProfile] = useState<LearnerProfile | null>(
    null
  );
  const [profileHydrated, setProfileHydrated] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    const stored = readStoredLearnerProfile();
    if (stored) {
      setLearnerProfile(stored);
      setShowSetup(false);
    } else {
      setShowSetup(true);
    }
    setProfileHydrated(true);
  }, []);

  useEffect(() => {
    const param = searchParams.get("game");
    if (param === "gurmukhi" || param === "history" || param === "concepts") {
      setActiveGameId(param);
    } else if (!param) {
      setActiveGameId(null);
    }
  }, [searchParams]);

  const handleSaveProfile = (profile: LearnerProfile) => {
    saveStoredLearnerProfile(profile);
    setLearnerProfile(profile);
    setShowSetup(false);
  };

  const handleOpenGame = (id: ActiveGameId) => {
    setActiveGameId(id);
    router.replace(`/games?game=${id}`, { scroll: true });
  };

  const handleBackToGames = () => {
    setActiveGameId(null);
    router.replace("/games", { scroll: true });
  };

  const activeGame = GAMES_CATALOG.find((g) => g.id === activeGameId) || null;
  const effectiveProfile: LearnerProfile = learnerProfile ?? {
    ageGroup: "young-adults",
    level: "beginner",
  };

  return (
    <MotionConfig reducedMotion="user">
      <div
        style={{
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
        className="min-h-screen flex flex-col"
      >
        <Header solid />

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 pb-28">
          {/* Persistent Learner Profile Pill & Change Level Toggle */}
          {profileHydrated && learnerProfile && !showSetup && (
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
              <div
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-subtle)",
                }}
                className="sanctuary-glass inline-flex flex-wrap items-center gap-3 rounded-full border px-4 py-2 text-xs sm:text-sm font-semibold"
              >
                <span
                  style={{ color: "var(--accent-text, var(--accent-primary))" }}
                  className="font-bold"
                >
                  Level:
                </span>
                <span>{formatLearnerProfileBadge(learnerProfile)}</span>
                <button
                  type="button"
                  onClick={() => setShowSetup(true)}
                  style={{
                    backgroundColor: "var(--theme-card-darker)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="sanctuary-interactive rounded-full border px-3 py-1 text-xs font-bold hover:border-[#C59B27]"
                >
                  Change Level
                </button>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {!profileHydrated ? (
              <motion.div
                key="games-hydrating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mx-auto max-w-3xl h-72 rounded-[var(--radius-card)] border animate-pulse"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-subtle)",
                }}
              />
            ) : showSetup ? (
              <LearnerSetupPanel
                key="learner-setup"
                initialProfile={learnerProfile}
                isEditingExisting={Boolean(learnerProfile)}
                onSave={handleSaveProfile}
                onCancel={
                  learnerProfile ? () => setShowSetup(false) : undefined
                }
              />
            ) : !activeGame ? (
              <motion.div
                key="games-hub-home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-10"
              >
                <header className="max-w-2xl space-y-3">
                  <p
                    style={{
                      color: "var(--accent-text, var(--accent-primary))",
                    }}
                    className="text-xs font-bold uppercase tracking-[0.22em]"
                  >
                    Adaptive Self-Paced Learning
                  </p>
                  <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight">
                    Sikhi Learning Games
                  </h1>
                  <p
                    style={{ color: "var(--theme-text-muted)" }}
                    className="text-base sm:text-lg leading-relaxed"
                  >
                    A calm, distraction-free space with AI-adapted rounds for
                    Gurmukhi letters, Sikh history, and core Gurmat concepts at
                    your own rhythm.
                  </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                  {GAMES_CATALOG.map((game) => (
                    <article
                      key={game.id}
                      style={{
                        backgroundColor: "var(--bg-surface)",
                        borderColor: "var(--border-subtle)",
                        color: "var(--text-primary)",
                      }}
                      className="sanctuary-glass h-full rounded-[var(--radius-card)] border p-6 sm:p-7 flex flex-col justify-between gap-6"
                    >
                      <div className="space-y-3">
                        <h2 className="font-serif text-2xl font-bold leading-snug">
                          {game.title}
                        </h2>
                        <p
                          style={{ color: "var(--theme-text-muted)" }}
                          className="text-base leading-relaxed"
                        >
                          {game.description}
                        </p>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => handleOpenGame(game.id)}
                          className="sanctuary-interactive w-full rounded-[var(--radius-control)] bg-gradient-to-r from-[#C59B27] to-[#D97706] px-5 py-3 text-sm sm:text-base font-extrabold text-[#18181B] shadow-sm hover:brightness-105"
                        >
                          Read Rules &amp; Play
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`game-view-${activeGame.id}-${effectiveProfile.ageGroup}-${effectiveProfile.level}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                <LearnFirstGameShell
                  key={activeGame.id}
                  title={activeGame.title}
                  subtitle={activeGame.rulesSubtitle}
                  rules={activeGame.rules}
                  onBackToGames={handleBackToGames}
                >
                  {activeGame.id === "gurmukhi" && (
                    <GurmukhiLetterMatch learnerProfile={effectiveProfile} />
                  )}
                  {activeGame.id === "history" && (
                    <SikhHistoryQuiz learnerProfile={effectiveProfile} />
                  )}
                  {activeGame.id === "concepts" && (
                    <SikhiConceptsMatch learnerProfile={effectiveProfile} />
                  )}
                </LearnFirstGameShell>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}

export default function GamesPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            backgroundColor: "var(--bg-primary)",
            color: "var(--text-primary)",
          }}
          className="min-h-screen flex flex-col"
        >
          <Header solid />
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="h-56 rounded-[var(--radius-card)] border p-6 animate-pulse"
                />
              ))}
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <GamesHubContent />
    </Suspense>
  );
}
