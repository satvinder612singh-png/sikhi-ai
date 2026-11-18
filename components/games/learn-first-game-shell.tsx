"use client";

import React, { useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";

export interface LearnFirstGameShellProps {
  title: string;
  subtitle: string;
  rules: string[];
  onBackToGames: () => void;
  children: React.ReactNode;
}

export function LearnFirstGameShell({
  title,
  subtitle,
  rules,
  onBackToGames,
  children,
}: LearnFirstGameShellProps) {
  const [started, setStarted] = useState(false);
  const [showRulesDrawer, setShowRulesDrawer] = useState(false);

  return (
    <MotionConfig reducedMotion="user">
      <section aria-label={title} className="space-y-6">
        {/* Persistent, unobtrusive top navigation row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToGames}
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
              color: "var(--text-primary)",
            }}
            className="sanctuary-interactive inline-flex items-center gap-2 rounded-[var(--radius-control)] border px-4 py-2 text-sm font-semibold hover:border-[#C59B27]"
          >
            <span aria-hidden="true">←</span>
            <span>Back to Games</span>
          </button>

          {started && (
            <button
              type="button"
              onClick={() => setShowRulesDrawer((v) => !v)}
              aria-expanded={showRulesDrawer}
              aria-controls="inline-how-to-play"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-primary)",
              }}
              className="sanctuary-interactive inline-flex items-center gap-2 rounded-[var(--radius-control)] border px-4 py-2 text-sm font-semibold hover:border-[#C59B27]"
            >
              <span>{showRulesDrawer ? "Hide Rules" : "How to Play"}</span>
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!started ? (
            <motion.div
              key="pregame-rules"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-primary)",
              }}
              className="sanctuary-glass mx-auto max-w-2xl rounded-[var(--radius-card)] border p-6 sm:p-10 space-y-6"
            >
              <div className="space-y-2">
                <p
                  style={{ color: "var(--accent-text, var(--accent-primary))" }}
                  className="text-xs font-bold uppercase tracking-[0.2em]"
                >
                  How to Play
                </p>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
                  {title}
                </h1>
                <p
                  style={{ color: "var(--theme-text-muted)" }}
                  className="text-base sm:text-lg leading-relaxed"
                >
                  {subtitle}
                </p>
              </div>

              <ul className="space-y-3.5 border-t border-b py-6" style={{ borderColor: "var(--border-subtle)" }}>
                {rules.map((rule, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 text-base sm:text-lg leading-relaxed"
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        backgroundColor: "var(--theme-card-darker)",
                        color: "var(--accent-text, var(--accent-primary))",
                        borderColor: "var(--border-subtle)",
                      }}
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-sm font-bold"
                    >
                      {idx + 1}
                    </span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <p
                  style={{ color: "var(--theme-text-muted)" }}
                  className="text-sm"
                >
                  Self-paced • No timers • Take all the time you need.
                </p>
                <button
                  type="button"
                  onClick={() => setStarted(true)}
                  className="sanctuary-interactive rounded-[var(--radius-control)] bg-gradient-to-r from-[#C59B27] to-[#D97706] px-7 py-3.5 text-base font-extrabold text-[#18181B] shadow-md hover:brightness-105"
                >
                  Start Playing
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="active-game"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5"
            >
              <AnimatePresence>
                {showRulesDrawer && (
                  <motion.div
                    id="inline-how-to-play"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      borderColor: "var(--border-subtle)",
                      color: "var(--text-primary)",
                    }}
                    className="sanctuary-glass rounded-[var(--radius-card)] border p-5 sm:p-6 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="font-serif text-xl font-bold">
                        How to Play: {title}
                      </h2>
                      <button
                        type="button"
                        onClick={() => setShowRulesDrawer(false)}
                        aria-label="Close How to Play rules"
                        style={{ borderColor: "var(--border-subtle)" }}
                        className="rounded-lg border px-2.5 py-1 text-xs font-semibold hover:border-[#C59B27]"
                      >
                        Close
                      </button>
                    </div>
                    <ul className="space-y-2 text-base leading-relaxed">
                      {rules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span
                            aria-hidden="true"
                            style={{ color: "var(--accent-text, var(--accent-primary))" }}
                            className="font-bold"
                          >
                            •
                          </span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>

              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </MotionConfig>
  );
}
