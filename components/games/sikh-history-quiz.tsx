"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  type LearnerProfile,
  formatLearnerProfileBadge,
} from "./learner-profile";
import { CelebrationBurst } from "./celebration-burst";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const LOCAL_FALLBACK_QUESTIONS: QuizQuestion[] = [
  {
    id: "q-guru-nanak",
    question:
      "Who founded Sikhi and established the egalitarian community of Kartarpur Sahib?",
    options: [
      "Guru Nanak Dev Ji",
      "Guru Angad Dev Ji",
      "Guru Ram Das Ji",
      "Guru Hargobind Sahib Ji",
    ],
    correctIndex: 0,
    explanation:
      "Guru Nanak Dev Ji (1469–1539), the First Guru, founded Kartarpur Sahib where seekers lived together practicing Kirat Karni, Naam Japna, and Vand Chakna.",
  },
  {
    id: "q-gurmukhi",
    question:
      "Which Guru standardized and popularized the Gurmukhi script so Gurbani could be read by all people?",
    options: [
      "Guru Amar Das Ji",
      "Guru Angad Dev Ji",
      "Guru Har Rai Ji",
      "Guru Tegh Bahadur Ji",
    ],
    correctIndex: 1,
    explanation:
      "Guru Angad Dev Ji (Second Guru) systematized Gurmukhi and opened learning centers so spiritual wisdom was accessible regardless of caste or background.",
  },
  {
    id: "q-langar-khivi",
    question:
      "Who is lovingly honored in Sri Guru Granth Sahib Ji for nurturing and expanding Guru Ka Langar with warmth and abundance?",
    options: [
      "Bebe Nanaki Ji",
      "Mata Khivi Ji",
      "Mai Bhago Ji",
      "Mata Sundari Ji",
    ],
    correctIndex: 1,
    explanation:
      "Mata Khivi Ji, spouse of Guru Angad Dev Ji, is praised in the Vaar of Satta and Balwand (Ang 967) for serving kheer and nourishing the Sangat in Langar.",
  },
  {
    id: "q-pangat",
    question:
      "What principle did Guru Amar Das Ji emphasize with 'Pehle Pangat, Pache Sangat'?",
    options: [
      "Everyone sits together as equals in Langar before meeting the Guru",
      "Only scholars may study scripture",
      "Silent fasting before sunrise",
      "Traveling to distant pilgrimage sites",
    ],
    correctIndex: 0,
    explanation:
      "Guru Amar Das Ji required rulers and commoners alike to sit side by side on the floor in Pangat (Langar) to dissolve caste and status hierarchy.",
  },
  {
    id: "q-miri-piri",
    question:
      "Which Guru introduced the twin swords of Miri and Piri and established Sri Akal Takht Sahib?",
    options: [
      "Guru Har Krishan Ji",
      "Guru Hargobind Sahib Ji",
      "Guru Amar Das Ji",
      "Guru Arjan Dev Ji",
    ],
    correctIndex: 1,
    explanation:
      "Guru Hargobind Sahib Ji (Sixth Guru) wore Miri (temporal justice) and Piri (spiritual sovereignty) and built Sri Akal Takht Sahib facing Sri Harmandir Sahib.",
  },
  {
    id: "q-eternal-guru",
    question:
      "In 1708 at Hazur Sahib (Nanded), whom did Guru Gobind Singh Ji bestow eternal Guruship upon?",
    options: [
      "A hereditary dynasty",
      "Sri Guru Granth Sahib Ji",
      "A council of monarchs",
      "A single regional shrine",
    ],
    correctIndex: 1,
    explanation:
      "Guru Gobind Singh Ji enshrined Sri Guru Granth Sahib Ji as the Eternal Living Guru of the Sikhs, uniting the Panth under timeless Divine Word (Shabad Guru).",
  },
];

export function SikhHistoryQuiz({
  learnerProfile,
}: {
  learnerProfile: LearnerProfile;
}) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    LOCAL_FALLBACK_QUESTIONS
  );
  const [roundSeed, setRoundSeed] = useState(1);
  const [loading, setLoading] = useState(true);
  const [roundSource, setRoundSource] = useState<"gemini" | "fallback">(
    "fallback"
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const loadRound = useCallback(
    async (seedValue: number, signal?: AbortSignal) => {
      setLoading(true);
      setCurrentIndex(0);
      setSelectedOption(null);
      setScore(0);
      setFinished(false);

      try {
        const res = await fetch("/api/generate-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "history",
            ageGroup: learnerProfile.ageGroup,
            level: learnerProfile.level,
            seed: seedValue,
          }),
          signal,
        });
        if (!res.ok) throw new Error("Failed to fetch quiz round");
        const data = (await res.json()) as {
          source?: "gemini" | "fallback";
          questions?: QuizQuestion[];
        };
        if (Array.isArray(data.questions) && data.questions.length >= 4) {
          setQuestions(data.questions);
          setRoundSource(data.source === "gemini" ? "gemini" : "fallback");
        } else {
          setQuestions(LOCAL_FALLBACK_QUESTIONS);
          setRoundSource("fallback");
        }
      } catch (err) {
        if ((err as { name?: string })?.name === "AbortError") return;
        setQuestions(LOCAL_FALLBACK_QUESTIONS);
        setRoundSource("fallback");
      } finally {
        setLoading(false);
      }
    },
    [learnerProfile.ageGroup, learnerProfile.level]
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadRound(roundSeed, controller.signal);
    return () => controller.abort();
  }, [loadRound, roundSeed]);

  const handleGenerateFreshRound = () => {
    setRoundSeed((s) => s + 1);
  };

  const handleReplayCurrentRound = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setFinished(false);
  };

  const currentQuestion = questions[currentIndex] || questions[0];
  const hasAnswered = selectedOption !== null;
  const isCorrect =
    hasAnswered &&
    currentQuestion &&
    selectedOption === currentQuestion.correctIndex;

  const progressRatio = finished
    ? 1
    : questions.length > 0
      ? (currentIndex + (hasAnswered ? 1 : 0)) / questions.length
      : 0;

  const handleSelectOption = (optionIdx: number) => {
    if (hasAnswered || !currentQuestion) return;
    setSelectedOption(optionIdx);
    if (optionIdx === currentQuestion.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
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
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-3 w-44 rounded-full bg-current opacity-15 animate-pulse" />
            <p
              style={{ color: "var(--theme-text-muted)" }}
              className="text-sm font-medium"
            >
              Crafting tailored questions for{" "}
              {formatLearnerProfileBadge(learnerProfile)}…
            </p>
          </div>
          <div className="h-8 w-36 rounded-xl bg-current opacity-10 animate-pulse" />
        </div>
        <div className="h-2 w-full rounded-full bg-current opacity-10 overflow-hidden" />
        <div className="h-8 w-5/6 rounded-xl bg-current opacity-15 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((row) => (
            <div
              key={row}
              style={{ borderColor: "var(--border-subtle)" }}
              className="h-14 w-full rounded-2xl border bg-current opacity-10 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (finished) {
    return (
      <motion.div
        key={`quiz-finished-${roundSeed}`}
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
          className="text-xs font-bold uppercase tracking-[0.2em]"
        >
          Round Complete • {formatLearnerProfileBadge(learnerProfile)}
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold">
          You answered {score} of {questions.length} correctly
        </h2>
        <p
          style={{ color: "var(--theme-text-muted)" }}
          className="text-base sm:text-lg leading-relaxed max-w-lg mx-auto"
        >
          Every round deepens your understanding of Sikh history and the living
          wisdom of the Ten Gurus.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleGenerateFreshRound}
            className="sanctuary-interactive rounded-[var(--radius-control)] bg-gradient-to-r from-[#C59B27] to-[#D97706] px-6 py-3 text-base font-extrabold text-[#18181B] shadow-md hover:brightness-105"
          >
            ✨ Generate Fresh Round
          </button>
          <button
            type="button"
            onClick={handleReplayCurrentRound}
            style={{
              backgroundColor: "var(--theme-card-darker)",
              borderColor: "var(--border-subtle)",
            }}
            className="sanctuary-interactive rounded-[var(--radius-control)] border px-5 py-3 text-sm sm:text-base font-semibold hover:border-[#C59B27]"
          >
            Review This Round
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
        color: "var(--text-primary)",
      }}
      className="sanctuary-glass mx-auto max-w-3xl rounded-[var(--radius-card)] border p-6 sm:p-8 space-y-6"
    >
      {/* Header + Progress Bar */}
      <div className="space-y-3 border-b pb-4" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p
              style={{ color: "var(--accent-text, var(--accent-primary))" }}
              className="text-xs font-bold uppercase tracking-[0.18em]"
            >
              Question {currentIndex + 1} of {questions.length} •{" "}
              {roundSource === "gemini" ? "AI-Tailored Round" : "Curated Round"}
            </p>
            <p
              style={{ color: "var(--theme-text-muted)" }}
              className="text-xs sm:text-sm font-medium"
            >
              Score: {score} / {questions.length}
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateFreshRound}
            style={{
              backgroundColor: "var(--theme-card-darker)",
              borderColor: "var(--border-subtle)",
            }}
            className="sanctuary-interactive rounded-[var(--radius-control)] border px-3.5 py-2 text-xs sm:text-sm font-semibold hover:border-[#C59B27]"
          >
            ✨ Generate Fresh Round
          </button>
        </div>

        {/* Animated GPU Progress Bar */}
        <div
          role="progressbar"
          aria-valuenow={Math.round(progressRatio * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Quiz progress"
          style={{ backgroundColor: "var(--theme-card-darker)" }}
          className="h-2 w-full rounded-full overflow-hidden"
        >
          <motion.div
            initial={false}
            animate={{ scaleX: Math.max(0.04, progressRatio) }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: "left center" }}
            className="h-full w-full rounded-full bg-gradient-to-r from-[#C59B27] via-[#D97706] to-[#10B981]"
          />
        </div>
      </div>

      {/* Animated Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${roundSeed}-${currentQuestion.id}-${currentIndex}`}
          initial={{ opacity: 0, x: 18, scale: 0.99 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -18, scale: 0.99 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-5"
        >
          <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-snug">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3" role="group" aria-label="Answer choices">
            {currentQuestion.options.map((opt, idx) => {
              const isThisSelected = selectedOption === idx;
              const isThisCorrect = idx === currentQuestion.correctIndex;

              let borderColor = "var(--border-subtle)";
              let bgColor = "var(--bg-surface)";
              let boxShadow = "none";
              let statusLabel = "";

              if (hasAnswered) {
                if (isThisCorrect) {
                  borderColor = "#10B981";
                  bgColor = "var(--theme-card-darker)";
                  boxShadow = "0 0 0 3px rgba(16, 185, 129, 0.22)";
                  statusLabel = "✓ Correct";
                } else if (isThisSelected) {
                  borderColor = "#D97706";
                  bgColor = "var(--theme-card-darker)";
                  boxShadow = "0 0 0 3px rgba(217, 119, 6, 0.22)";
                  statusLabel = "Your choice";
                }
              }

              return (
                <button
                  key={`${idx}-${opt}`}
                  type="button"
                  disabled={hasAnswered}
                  aria-pressed={isThisSelected}
                  onClick={() => handleSelectOption(idx)}
                  style={{
                    backgroundColor: bgColor,
                    borderColor,
                    boxShadow,
                  }}
                  className={`sanctuary-interactive w-full rounded-2xl border-2 px-5 py-4 text-left flex items-center justify-between gap-3 transition ${
                    hasAnswered
                      ? "cursor-default"
                      : "cursor-pointer hover:border-[#C59B27]"
                  }`}
                >
                  <span className="flex items-center gap-3.5 text-base sm:text-lg font-medium leading-snug">
                    <span
                      aria-hidden="true"
                      style={{
                        backgroundColor: "var(--theme-card-darker)",
                        borderColor: "var(--border-subtle)",
                      }}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold"
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </span>
                  {statusLabel && (
                    <span className="text-xs font-bold shrink-0">
                      {statusLabel}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Explanation & Next Button (stable height prevents CLS) */}
      <div className="min-h-[7.5rem] flex flex-col justify-between gap-4 pt-1">
        <div
          role="status"
          aria-live="polite"
          style={{
            backgroundColor: hasAnswered
              ? "var(--theme-card-darker)"
              : "transparent",
            borderColor: hasAnswered
              ? isCorrect
                ? "#10B981"
                : "#D97706"
              : "transparent",
            boxShadow: hasAnswered
              ? isCorrect
                ? "0 8px 24px -10px rgba(16, 185, 129, 0.35)"
                : "0 8px 24px -10px rgba(217, 119, 6, 0.32)"
              : "none",
          }}
          className={`rounded-2xl border p-4 transition-opacity duration-200 ${
            hasAnswered ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {hasAnswered && (
            <div className="space-y-1.5">
              <p className="text-sm font-extrabold">
                {isCorrect
                  ? "✓ Well done!"
                  : "Good effort — here is the historical context:"}
              </p>
              <p className="text-base leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            disabled={!hasAnswered}
            onClick={handleNext}
            className="sanctuary-interactive rounded-[var(--radius-control)] bg-gradient-to-r from-[#C59B27] to-[#D97706] px-6 py-3 text-base font-extrabold text-[#18181B] disabled:opacity-35 disabled:cursor-not-allowed"
          >
            {currentIndex + 1 < questions.length ? "Next →" : "See Results →"}
          </button>
        </div>
      </div>
    </div>
  );
}
