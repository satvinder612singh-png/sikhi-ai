"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LearnFirstGameShell } from "@/components/games/learn-first-game-shell";
import { GurmukhiLetterMatch } from "@/components/games/gurmukhi-letter-match";
import { SikhHistoryQuiz } from "@/components/games/sikh-history-quiz";
import { SikhiConceptsMatch } from "@/components/games/sikhi-concepts-match";
import { GurmatScenarioSimulator } from "@/components/games/gurmat-scenario-simulator";
import { AdaptiveMatchGame } from "@/components/games/adaptive-match-game";
import {
  AGE_GROUP_OPTIONS,
  GAMES_CATALOG,
  KNOWLEDGE_LEVEL_OPTIONS,
  type GameCatalogEntry,
  type GameType,
  type LearnerAgeGroup,
  type LearnerKnowledgeLevel,
  type LearnerProfile,
  filterGamesForProfile,
  formatLearnerProfileBadge,
  isGameEligibleForProfile,
  readStoredLearnerProfile,
  saveStoredLearnerProfile,
} from "@/components/games/learner-profile";

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
  const [knowledgeLevel, setKnowledgeLevel] = useState<LearnerKnowledgeLevel>(
    initialProfile?.knowledgeLevel ?? "beginner"
  );

  const previewCount = useMemo(
    () => filterGamesForProfile({ ageGroup, knowledgeLevel }).length,
    [ageGroup, knowledgeLevel]
  );

  return (
    <motion.section
      key="learner-setup-card"
      initial={{ opacity: 0, y: 12, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.99 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      aria-label="Tailor Games to Your Pace"
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
          className="text-xs font-extrabold uppercase tracking-[0.22em]"
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
          Select your age group and Sikhi knowledge tier. We immediately filter
          the catalog and dynamically adapt every AI scenario, quiz, and
          reflection to match your level.
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {KNOWLEDGE_LEVEL_OPTIONS.map((opt) => {
            const active = knowledgeLevel === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setKnowledgeLevel(opt.id)}
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
                <div className="relative z-10 space-y-1.5">
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
                        ✓
                      </span>
                    )}
                  </div>
                  <p
                    style={{ color: "var(--theme-text-muted)" }}
                    className="text-xs leading-relaxed"
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
            className="text-xs sm:text-sm font-medium"
          >
            {previewCount} tailored game{previewCount === 1 ? "" : "s"} unlocked
            for this profile
          </p>
        )}

        <button
          type="button"
          onClick={() => onSave({ ageGroup, knowledgeLevel })}
          className="sanctuary-interactive rounded-[var(--radius-control)] bg-gradient-to-r from-[#C59B27] to-[#D97706] px-7 py-3 text-base font-extrabold text-[#18181B] shadow-md hover:brightness-105"
        >
          {isEditingExisting
            ? `Apply Profile (${previewCount} Games)`
            : `Continue to ${previewCount} Games →`}
        </button>
      </div>
    </motion.section>
  );
}

function GameCardGrid({
  heading,
  subheading,
  games,
  onOpenGame,
}: {
  heading: string;
  subheading: string;
  games: GameCatalogEntry[];
  onOpenGame: (id: GameType) => void;
}) {
  if (games.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
          {heading}
        </h2>
        <p
          style={{ color: "var(--theme-text-muted)" }}
          className="text-sm sm:text-base"
        >
          {subheading}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {games.map((game, idx) => (
          <motion.article
            key={game.id}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
              duration: 0.26,
              delay: Math.min(idx * 0.05, 0.2),
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor:
                game.tier === "advanced-exclusive"
                  ? "#C59B27"
                  : "var(--border-subtle)",
              color: "var(--text-primary)",
            }}
            className="sanctuary-glass sanctuary-interactive h-full rounded-[var(--radius-card)] border p-6 flex flex-col justify-between gap-6"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span
                  style={{
                    backgroundColor: "var(--theme-card-darker)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--accent-text, var(--accent-primary))",
                  }}
                  className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-extrabold uppercase tracking-wider"
                >
                  {game.tier === "advanced-exclusive" ? "✦ " : ""}
                  {game.tierLabel}
                </span>
                <span
                  style={{ color: "var(--theme-text-muted)" }}
                  className="font-semibold"
                >
                  {game.estimatedTime}
                </span>
              </div>

              <h3 className="font-serif text-2xl font-bold leading-snug">
                {game.title}
              </h3>

              <p
                style={{ color: "var(--theme-text-muted)" }}
                className="text-sm sm:text-base leading-relaxed"
              >
                {game.description}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => onOpenGame(game.id)}
                className="sanctuary-interactive w-full rounded-[var(--radius-control)] bg-gradient-to-r from-[#C59B27] to-[#D97706] px-5 py-3 text-sm sm:text-base font-extrabold text-[#18181B] shadow-sm hover:brightness-105"
              >
                Read Rules &amp; Play
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function GamesHubContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeGameId, setActiveGameId] = useState<GameType | null>(null);
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
    const param = searchParams.get("game") as GameType | null;
    if (param && GAMES_CATALOG.some((g) => g.id === param)) {
      setActiveGameId(param);
    } else if (!param) {
      setActiveGameId(null);
    }
  }, [searchParams]);

  const effectiveProfile: LearnerProfile = learnerProfile ?? {
    ageGroup: "young-adults",
    knowledgeLevel: "beginner",
  };

  const eligibleGames = useMemo(
    () => filterGamesForProfile(effectiveProfile),
    [effectiveProfile]
  );

  // If the user switches profile and the currently active game is no longer eligible
  // (e.g., Gurmukhi Letter Match when switching to Intermediate/Advanced), exit cleanly.
  useEffect(() => {
    if (!profileHydrated || !activeGameId || !learnerProfile) return;
    const found = GAMES_CATALOG.find((g) => g.id === activeGameId);
    if (found && !isGameEligibleForProfile(found, learnerProfile)) {
      setActiveGameId(null);
      router.replace("/games", { scroll: true });
    }
  }, [profileHydrated, activeGameId, learnerProfile, router]);

  const handleSaveProfile = (profile: LearnerProfile) => {
    saveStoredLearnerProfile(profile);
    setLearnerProfile(profile);
    setShowSetup(false);

    if (activeGameId) {
      const current = GAMES_CATALOG.find((g) => g.id === activeGameId);
      if (current && !isGameEligibleForProfile(current, profile)) {
        setActiveGameId(null);
        router.replace("/games", { scroll: true });
      }
    }
  };

  const handleOpenGame = (id: GameType) => {
    setActiveGameId(id);
    router.replace(`/games?game=${id}`, { scroll: true });
  };

  const handleBackToGames = () => {
    setActiveGameId(null);
    router.replace("/games", { scroll: true });
  };

  const activeGame =
    eligibleGames.find((g) => g.id === activeGameId) || null;
  const profileBadge = formatLearnerProfileBadge(effectiveProfile);
  const profileCacheKey = `${effectiveProfile.ageGroup}-${effectiveProfile.knowledgeLevel}`;

  const foundationalGames = useMemo(
    () => eligibleGames.filter((g) => g.tier === "foundational"),
    [eligibleGames]
  );
  const adaptiveGames = useMemo(
    () => eligibleGames.filter((g) => g.tier === "adaptive"),
    [eligibleGames]
  );
  const advancedGames = useMemo(
    () => eligibleGames.filter((g) => g.tier === "advanced-exclusive"),
    [eligibleGames]
  );

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
          {/* Persistent Active Profile Pill & Change Level Toggle */}
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
                  className="font-extrabold uppercase tracking-wider text-xs"
                >
                  Active Tier:
                </span>
                <span className="font-bold">{profileBadge}</span>
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
                key={`games-hub-${profileCacheKey}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-12"
              >
                <header className="sanctuary-hero-glow max-w-3xl space-y-3">
                  <p
                    style={{
                      color: "var(--accent-text, var(--accent-primary))",
                    }}
                    className="relative z-10 text-xs font-extrabold uppercase tracking-[0.22em]"
                  >
                    Adaptive Self-Paced Learning • {profileBadge}
                  </p>
                  <h1 className="relative z-10 font-serif text-4xl sm:text-5xl font-bold tracking-tight">
                    Sikhi Learning Games
                  </h1>
                  <p
                    style={{ color: "var(--theme-text-muted)" }}
                    className="relative z-10 text-base sm:text-lg leading-relaxed"
                  >
                    {effectiveProfile.knowledgeLevel === "advanced"
                      ? "Elementary alphabet and surface trivia are hidden. Explore high-level Gurbani synthesis, Raag musicology, and real-world Gurmat dilemmas."
                      : effectiveProfile.knowledgeLevel === "intermediate"
                        ? "Foundational basics are bypassed. Challenge yourself with real-life dilemmas, Raag resonance, Pankti decoding, and historical crossroads."
                        : "Start warmly with foundational Gurmukhi, Sakhis, and core values—plus interactive real-life Gurmat scenarios tailored to your pace."}
                  </p>
                </header>

                {/* Advanced-Exclusive Challenges shown first for Intermediate/Advanced adults */}
                <GameCardGrid
                  heading="Advanced-Exclusive Challenges"
                  subheading="Unlocked for Intermediate & Advanced adult learners — deep Gurbani Vichaar synthesis and Puratan Granth / Raag analysis."
                  games={advancedGames}
                  onOpenGame={handleOpenGame}
                />

                {/* All-Ages Adaptive Games */}
                <GameCardGrid
                  heading="Life-Relevant & Adaptive Challenges"
                  subheading="Scenarios, Raags, Pankti decoding, and 3-minute sprints dynamically calibrated to your age group and tier."
                  games={adaptiveGames}
                  onOpenGame={handleOpenGame}
                />

                {/* Beginner / Foundational Tier (Only rendered when Beginner is active) */}
                <GameCardGrid
                  heading="Foundational Essentials"
                  subheading="Welcoming building blocks for Gurmukhi letters, Sikh history milestones, and core Gurmat values."
                  games={foundationalGames}
                  onOpenGame={handleOpenGame}
                />
              </motion.div>
            ) : (
              <motion.div
                key={`game-view-${activeGame.id}-${profileCacheKey}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                <LearnFirstGameShell
                  key={`${activeGame.id}-${profileCacheKey}`}
                  title={activeGame.title}
                  subtitle={activeGame.rulesSubtitle}
                  rules={activeGame.rules}
                  profileBadge={profileBadge}
                  onBackToGames={handleBackToGames}
                >
                  {activeGame.id === "gurmukhi" && (
                    <GurmukhiLetterMatch
                      key={`gurmukhi-${profileCacheKey}`}
                      learnerProfile={effectiveProfile}
                    />
                  )}
                  {activeGame.id === "concepts" && (
                    <SikhiConceptsMatch
                      key={`concepts-${profileCacheKey}`}
                      learnerProfile={effectiveProfile}
                    />
                  )}
                  {(activeGame.id === "history" ||
                    activeGame.id === "chardi-kala-sprint" ||
                    activeGame.id === "puratan-analysis") && (
                    <SikhHistoryQuiz
                      key={`${activeGame.id}-${profileCacheKey}`}
                      gameType={activeGame.id}
                      title={activeGame.title}
                      learnerProfile={effectiveProfile}
                    />
                  )}
                  {(activeGame.id === "gurmat-action" ||
                    activeGame.id === "history-crossroads") && (
                    <GurmatScenarioSimulator
                      key={`${activeGame.id}-${profileCacheKey}`}
                      gameType={activeGame.id}
                      title={activeGame.title}
                      learnerProfile={effectiveProfile}
                    />
                  )}
                  {(activeGame.id === "raag-pehar" ||
                    activeGame.id === "pankti-decoder" ||
                    activeGame.id === "gurbani-synthesis") && (
                    <AdaptiveMatchGame
                      key={`${activeGame.id}-${profileCacheKey}`}
                      gameType={activeGame.id}
                      title={activeGame.title}
                      leftColumnLabel={
                        activeGame.leftColumnLabel || "Gurbani Concept"
                      }
                      rightColumnLabel={
                        activeGame.rightColumnLabel || "Meaning & Application"
                      }
                      learnerProfile={effectiveProfile}
                    />
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
