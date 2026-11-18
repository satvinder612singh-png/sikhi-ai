"use client";

import React, { useMemo, useState } from "react";

interface ConceptPair {
  id: string;
  term: string;
  gurmukhi: string;
  meaning: string;
}

const SIKHI_CONCEPTS: ConceptPair[] = [
  {
    id: "seva",
    term: "Seva",
    gurmukhi: "ਸੇਵਾ",
    meaning: "Selfless service offered to humanity with humility and without expecting reward.",
  },
  {
    id: "simran",
    term: "Simran",
    gurmukhi: "ਸਿਮਰਨ",
    meaning: "Loving, mindful remembrance of the One Divine Creator in daily life.",
  },
  {
    id: "hukam",
    term: "Hukam",
    gurmukhi: "ਹੁਕਮ",
    meaning: "Divine Order and cosmic harmony—accepting life with wisdom and serenity.",
  },
  {
    id: "kirat-karni",
    term: "Kirat Karni",
    gurmukhi: "ਕਿਰਤ ਕਰਨੀ",
    meaning: "Earning an honest, ethical living through dedicated effort and integrity.",
  },
  {
    id: "vand-chakna",
    term: "Vand Chakna",
    gurmukhi: "ਵੰਡ ਛਕਣਾ",
    meaning: "Sharing one's earnings, food, and blessings generously with those in need.",
  },
  {
    id: "chardi-kala",
    term: "Chardi Kala",
    gurmukhi: "ਚੜ੍ਹਦੀ ਕਲਾ",
    meaning: "Ever-rising spirit—maintaining resilient optimism and courage even in hardship.",
  },
  {
    id: "miri-piri",
    term: "Miri-Piri",
    gurmukhi: "ਮੀਰੀ-ਪੀਰੀ",
    meaning: "The harmony of spiritual devotion (Piri) and ethical social justice (Miri).",
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

export function SikhiConceptsMatch() {
  const [seed, setSeed] = useState(11);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  const [selectedMeaningId, setSelectedMeaningId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{
    tone: "neutral" | "success" | "gentle";
    text: string;
  }>({
    tone: "neutral",
    text: "Select a Sikhi term on the left, then select its plain-English meaning on the right.",
  });

  const shuffledMeanings = useMemo(
    () => deterministicShuffle(SIKHI_CONCEPTS, seed),
    [seed]
  );

  const checkMatch = (termId: string, meaningId: string) => {
    const termObj = SIKHI_CONCEPTS.find((c) => c.id === termId);
    if (!termObj) return;

    if (termId === meaningId) {
      const next = [...matchedIds, termId];
      setMatchedIds(next);
      setSelectedTermId(null);
      setSelectedMeaningId(null);
      setFeedback({
        tone: "success",
        text:
          next.length === SIKHI_CONCEPTS.length
            ? `Beautiful! You matched all ${SIKHI_CONCEPTS.length} foundational Sikhi concepts.`
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
      const item = SIKHI_CONCEPTS.find((c) => c.id === id);
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

  const handleRestart = () => {
    setSeed((s) => s + 7);
    setSelectedTermId(null);
    setSelectedMeaningId(null);
    setMatchedIds([]);
    setFeedback({
      tone: "neutral",
      text: "Select a Sikhi term on the left, then select its plain-English meaning on the right.",
    });
  };

  const isComplete = matchedIds.length === SIKHI_CONCEPTS.length;

  return (
    <div
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
        color: "var(--text-primary)",
      }}
      className="sanctuary-glass rounded-[var(--radius-card)] border p-6 sm:p-8 space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="space-y-1">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold">
            Sikhi Concepts Match
          </h2>
          <p style={{ color: "var(--theme-text-muted)" }} className="text-sm sm:text-base">
            Matched {matchedIds.length} of {SIKHI_CONCEPTS.length} concepts
          </p>
        </div>

        <button
          type="button"
          onClick={handleRestart}
          style={{ borderColor: "var(--border-subtle)" }}
          className="rounded-[var(--radius-control)] border px-4 py-2 text-sm font-semibold hover:border-[#C59B27] transition"
        >
          Shuffle &amp; Restart
        </button>
      </div>

      {/* Live Feedback Region (stable min-height prevents layout shift) */}
      <div
        role="status"
        aria-live="polite"
        style={{
          backgroundColor: "var(--theme-card-darker)",
          borderColor:
            feedback.tone === "success"
              ? "#059669"
              : feedback.tone === "gentle"
                ? "#D97706"
                : "var(--border-subtle)",
        }}
        className="min-h-[3.5rem] flex items-center rounded-[var(--radius-control)] border px-4 py-3 text-base font-medium leading-relaxed"
      >
        <span>
          {feedback.tone === "success" ? "✓ " : ""}
          {feedback.text}
        </span>
      </div>

      {/* Clean 2-Column Concepts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-2.5" role="group" aria-label="Sikhi terms">
          <p
            style={{ color: "var(--accent-text, var(--accent-primary))" }}
            className="text-xs font-bold uppercase tracking-[0.18em]"
          >
            Sikhi Terms
          </p>
          <div className="space-y-2.5">
            {SIKHI_CONCEPTS.map((item) => {
              const matched = matchedIds.includes(item.id);
              const selected = selectedTermId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={matched}
                  aria-pressed={selected}
                  onClick={() => handleSelectTerm(item.id)}
                  style={{
                    backgroundColor: matched
                      ? "var(--theme-card-darker)"
                      : "var(--bg-surface)",
                    borderColor: matched
                      ? "#059669"
                      : selected
                        ? "#C59B27"
                        : "var(--border-subtle)",
                  }}
                  className={`sanctuary-interactive w-full min-h-[4.25rem] rounded-2xl border-2 px-4 py-3 flex items-center justify-between gap-3 text-left transition ${
                    selected ? "ring-2 ring-[#C59B27] ring-offset-2" : ""
                  } ${matched ? "opacity-75 cursor-default" : "cursor-pointer"}`}
                >
                  <div>
                    <span className="block font-serif text-lg font-bold">
                      {item.term}
                    </span>
                    <span
                      lang="pa"
                      style={{ color: "var(--accent-text, var(--accent-primary))" }}
                      className="font-gurmukhi text-sm font-semibold"
                    >
                      {item.gurmukhi}
                    </span>
                  </div>
                  <span className="text-xs font-bold shrink-0">
                    {matched ? "✓ Matched" : selected ? "Selected" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-2.5" role="group" aria-label="Plain-English meanings">
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
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={matched}
                  aria-pressed={selected}
                  onClick={() => handleSelectMeaning(item.id)}
                  style={{
                    backgroundColor: matched
                      ? "var(--theme-card-darker)"
                      : "var(--bg-surface)",
                    borderColor: matched
                      ? "#059669"
                      : selected
                        ? "#C59B27"
                        : "var(--border-subtle)",
                  }}
                  className={`sanctuary-interactive w-full min-h-[4.25rem] rounded-2xl border-2 px-4 py-3 flex items-center justify-between gap-3 text-left transition ${
                    selected ? "ring-2 ring-[#C59B27] ring-offset-2" : ""
                  } ${matched ? "opacity-75 cursor-default" : "cursor-pointer"}`}
                >
                  <span className="text-sm sm:text-base leading-relaxed">
                    {item.meaning}
                  </span>
                  {matched && (
                    <span className="text-xs font-bold shrink-0">
                      ✓ {item.term}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {isComplete && (
        <div className="flex justify-end pt-2 border-t" style={{ borderColor: "var(--border-subtle)" }}>
          <button
            type="button"
            onClick={handleRestart}
            className="sanctuary-interactive rounded-[var(--radius-control)] bg-gradient-to-r from-[#C59B27] to-[#D97706] px-6 py-2.5 text-sm font-extrabold text-[#18181B]"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
