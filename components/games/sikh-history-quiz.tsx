"use client";

import React, { useState } from "react";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q-guru-nanak",
    question: "Who founded Sikhi and established the egalitarian community of Kartarpur Sahib?",
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
    question: "Which Guru standardized and popularized the Gurmukhi script so Gurbani could be read by all people?",
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
    question: "Who is lovingly honored in Sri Guru Granth Sahib Ji for nurturing and expanding Guru Ka Langar with warmth and abundance?",
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
    question: "What principle did Guru Amar Das Ji emphasize with 'Pehle Pangat, Pache Sangat'?",
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
    id: "q-amritsar",
    question: "Which Guru founded the city of Ramdaspur (modern-day Amritsar) and excavated the sacred Sarovar?",
    options: [
      "Guru Ram Das Ji",
      "Guru Arjan Dev Ji",
      "Guru Nanak Dev Ji",
      "Guru Gobind Singh Ji",
    ],
    correctIndex: 0,
    explanation:
      "Guru Ram Das Ji (Fourth Guru) established the thriving town of Ramdaspur around the sacred pool that later grew into Sri Harmandir Sahib.",
  },
  {
    id: "q-adi-granth",
    question: "In 1604, Guru Arjan Dev Ji compiled the Adi Granth and installed it at Sri Harmandir Sahib. Who served as the first Granthi?",
    options: [
      "Bhai Mardana Ji",
      "Baba Buddha Ji",
      "Bhai Mani Singh Ji",
      "Bhai Gurdas Ji",
    ],
    correctIndex: 1,
    explanation:
      "Baba Buddha Ji, a revered elder who served six Gurus, was appointed the first Granthi of Sri Harmandir Sahib when the Adi Granth was installed in 1604.",
  },
  {
    id: "q-miri-piri",
    question: "Which Guru introduced the twin swords of Miri and Piri and established Sri Akal Takht Sahib?",
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
    id: "q-guru-tegh-bahadur",
    question: "Why is Guru Tegh Bahadur Ji revered across humanity as 'Hind Di Chadar'?",
    options: [
      "For composing Asa Di Vaar",
      "For sacrificing his life in 1675 to defend the religious freedom of others",
      "For founding Anandpur Sahib's schools",
      "For translating ancient astronomy texts",
    ],
    correctIndex: 1,
    explanation:
      "Guru Tegh Bahadur Ji (Ninth Guru) gave his life in Delhi in 1675 defending the right of Kashmiri Pandits and all people to practice their conscience freely.",
  },
  {
    id: "q-vaisakhi-1699",
    question: "At Anandpur Sahib on Vaisakhi 1699, Guru Gobind Singh Ji initiated which sovereign spiritual order?",
    options: [
      "The Khalsa Panth",
      "The Manji System",
      "The Udasi Order",
      "The Misls of Lahore",
    ],
    correctIndex: 0,
    explanation:
      "Through Khande-di-Pahul and the Panj Pyare, Guru Gobind Singh Ji established the Khalsa—dedicated to fearlessness, compassion, equality, and defense of justice.",
  },
  {
    id: "q-eternal-guru",
    question: "In 1708 at Hazur Sahib (Nanded), whom did Guru Gobind Singh Ji bestow eternal Guruship upon?",
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

export function SikhHistoryQuiz() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[currentIndex];
  const hasAnswered = selectedOption !== null;
  const isCorrect = hasAnswered && selectedOption === currentQuestion.correctIndex;

  const handleSelectOption = (optionIdx: number) => {
    if (hasAnswered) return;
    setSelectedOption(optionIdx);
    if (optionIdx === currentQuestion.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < QUIZ_QUESTIONS.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
    } else {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
          color: "var(--text-primary)",
        }}
        className="sanctuary-glass mx-auto max-w-2xl rounded-[var(--radius-card)] border p-6 sm:p-10 space-y-6 text-center"
      >
        <p
          style={{ color: "var(--accent-text, var(--accent-primary))" }}
          className="text-xs font-bold uppercase tracking-[0.2em]"
        >
          Quiz Complete
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold">
          You answered {score} of {QUIZ_QUESTIONS.length} correctly
        </h2>
        <p
          style={{ color: "var(--theme-text-muted)" }}
          className="text-base sm:text-lg leading-relaxed max-w-lg mx-auto"
        >
          Every question is an invitation to explore Sikh history and the living wisdom of the Ten Gurus further.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={handleRestart}
            className="sanctuary-interactive rounded-[var(--radius-control)] bg-gradient-to-r from-[#C59B27] to-[#D97706] px-7 py-3 text-base font-extrabold text-[#18181B]"
          >
            Review &amp; Play Again
          </button>
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
      className="sanctuary-glass mx-auto max-w-3xl rounded-[var(--radius-card)] border p-6 sm:p-8 space-y-6"
    >
      {/* Calm Progress Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-4" style={{ borderColor: "var(--border-subtle)" }}>
        <p
          style={{ color: "var(--accent-text, var(--accent-primary))" }}
          className="text-xs font-bold uppercase tracking-[0.18em]"
        >
          Question {currentIndex + 1} of {QUIZ_QUESTIONS.length}
        </p>
        <p style={{ color: "var(--theme-text-muted)" }} className="text-sm font-medium">
          Score: {score}
        </p>
      </div>

      {/* Question Prompt */}
      <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-snug">
        {currentQuestion.question}
      </h2>

      {/* Accessible Multiple-Choice Options */}
      <div className="space-y-3" role="group" aria-label="Answer choices">
        {currentQuestion.options.map((opt, idx) => {
          const isThisSelected = selectedOption === idx;
          const isThisCorrect = idx === currentQuestion.correctIndex;

          let borderColor = "var(--border-subtle)";
          let bgColor = "var(--bg-surface)";
          let statusLabel = "";

          if (hasAnswered) {
            if (isThisCorrect) {
              borderColor = "#059669";
              bgColor = "var(--theme-card-darker)";
              statusLabel = "✓ Correct answer";
            } else if (isThisSelected) {
              borderColor = "#D97706";
              bgColor = "var(--theme-card-darker)";
              statusLabel = "Your choice";
            }
          }

          return (
            <button
              key={opt}
              type="button"
              disabled={hasAnswered}
              aria-pressed={isThisSelected}
              onClick={() => handleSelectOption(idx)}
              style={{
                backgroundColor: bgColor,
                borderColor,
              }}
              className={`sanctuary-interactive w-full rounded-2xl border-2 px-5 py-4 text-left flex items-center justify-between gap-3 transition ${
                hasAnswered ? "cursor-default" : "cursor-pointer hover:border-[#C59B27]"
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
                <span className="text-xs font-bold shrink-0">{statusLabel}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Readable Explanation & Next Button (min-height prevents CLS) */}
      <div className="min-h-[7rem] flex flex-col justify-between gap-4 pt-2">
        <div
          role="status"
          aria-live="polite"
          style={{
            backgroundColor: hasAnswered ? "var(--theme-card-darker)" : "transparent",
            borderColor: hasAnswered
              ? isCorrect
                ? "#059669"
                : "#D97706"
              : "transparent",
          }}
          className={`rounded-2xl border p-4 transition-opacity duration-200 ${
            hasAnswered ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {hasAnswered && (
            <div className="space-y-1.5">
              <p className="text-sm font-extrabold">
                {isCorrect ? "✓ Correct!" : "Good effort — here is the historical context:"}
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
            {currentIndex + 1 < QUIZ_QUESTIONS.length ? "Next →" : "See Results →"}
          </button>
        </div>
      </div>
    </div>
  );
}
