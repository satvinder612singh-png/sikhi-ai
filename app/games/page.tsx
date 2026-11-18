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
      "Match classic Gurmukhi characters to their English phonetic sounds in a calm two-column grid.",
    rulesSubtitle:
      "Build comfortable recognition of Gurmukhi letters and their everyday spoken sounds.",
    rules: [
      "Choose a Gurmukhi character on the left and select its matching English phonetic sound on the right.",
      "You can navigate completely with your mouse or keyboard (Tab, Enter, or Space).",
      "There is no timer—take your time and switch between letter sets whenever you feel ready.",
    ],
  },
  {
    id: "history",
    title: "Sikh History & Heritage Quiz",
    description:
      "Explore ten untimed multiple-choice questions on the Ten Gurus, key historical milestones, and Sikh values.",
    rulesSubtitle:
      "Read thoughtfully and learn the story behind each historical milestone at your own pace.",
    rules: [
      "Select the answer you believe best fits each question—there is no countdown clock.",
      "After every choice, read the short historical explanation before clicking Next.",
      "You can review your score at the end and replay anytime to reinforce what you learned.",
    ],
  },
  {
    id: "concepts",
    title: "Sikhi Concepts Match",
    description:
      "Pair foundational Sikhi terms like Seva, Simran, Hukam, and Chardi Kala with their plain-English meanings.",
    rulesSubtitle:
      "Connect core Gurmat principles to clear, practical everyday definitions.",
    rules: [
      "Select a Sikhi term in the left column, then choose its plain-English meaning in the right column.",
      "Matched pairs stay highlighted calmly on screen so you can review them as you finish the set.",
      "If a pair does not match yet, gentle feedback will guide you to try another pairing.",
    ],
  },
];

function GamesHubContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeGameId, setActiveGameId] = useState<ActiveGameId | null>(null);

  useEffect(() => {
    const param = searchParams.get("game");
    if (param === "gurmukhi" || param === "history" || param === "concepts") {
      setActiveGameId(param);
    } else if (!param) {
      setActiveGameId(null);
    }
  }, [searchParams]);

  const handleOpenGame = (id: ActiveGameId) => {
    setActiveGameId(id);
    router.replace(`/games?game=${id}`, { scroll: true });
  };

  const handleBackToGames = () => {
    setActiveGameId(null);
    router.replace("/games", { scroll: true });
  };

  const activeGame = GAMES_CATALOG.find((g) => g.id === activeGameId) || null;

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
          <AnimatePresence mode="wait">
            {!activeGame ? (
              <motion.div
                key="games-hub-home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-10"
              >
                {/* Calm, Uncluttered Hub Header */}
                <header className="max-w-2xl space-y-3">
                  <p
                    style={{ color: "var(--accent-text, var(--accent-primary))" }}
                    className="text-xs font-bold uppercase tracking-[0.22em]"
                  >
                    Self-Paced Learning
                  </p>
                  <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight">
                    Sikhi Learning Games
                  </h1>
                  <p
                    style={{ color: "var(--theme-text-muted)" }}
                    className="text-base sm:text-lg leading-relaxed"
                  >
                    A calm, distraction-free space to practice Gurmukhi letters, Sikh history, and core Gurmat concepts at your own rhythm.
                  </p>
                </header>

                {/* 3 Equal-Height Clean Game Cards */}
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
                key={`game-view-${activeGame.id}`}
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
                  {activeGame.id === "gurmukhi" && <GurmukhiLetterMatch />}
                  {activeGame.id === "history" && <SikhHistoryQuiz />}
                  {activeGame.id === "concepts" && <SikhiConceptsMatch />}
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
