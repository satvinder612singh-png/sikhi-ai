"use client";

import React, { useMemo, useState } from "react";

interface LetterPair {
  id: string;
  gurmukhi: string;
  sound: string;
  name: string;
  example: string;
}

const LETTER_SETS: { label: string; pairs: LetterPair[] }[] = [
  {
    label: "Set 1 · Opening Letters (ੳ – ਗ)",
    pairs: [
      { id: "oora", gurmukhi: "ੳ", sound: "U / O (Oora)", name: "Oora", example: "Vowel carrier for u / o" },
      { id: "aira", gurmukhi: "ਅ", sound: "A (Aira)", name: "Aira", example: "Vowel carrier for a / aa" },
      { id: "eeri", gurmukhi: "ੲ", sound: "I / E (Eeri)", name: "Eeri", example: "Vowel carrier for i / e" },
      { id: "sassa", gurmukhi: "ਸ", sound: "S (Sassa)", name: "Sassa", example: "As in Sat (Truth)" },
      { id: "haha", gurmukhi: "ਹ", sound: "H (Haha)", name: "Haha", example: "As in Hukam (Divine Order)" },
      { id: "kakka", gurmukhi: "ਕ", sound: "K (Kakka)", name: "Kakka", example: "As in Kirat (Honest work)" },
      { id: "khakha", gurmukhi: "ਖ", sound: "Kh (Khakha)", name: "Khakha", example: "As in Khalsa" },
      { id: "gagga", gurmukhi: "ਗ", sound: "G (Gagga)", name: "Gagga", example: "As in Guru" },
    ],
  },
  {
    label: "Set 2 · Essential Consonants (ਚ – ਪ)",
    pairs: [
      { id: "chacha", gurmukhi: "ਚ", sound: "Ch (Chacha)", name: "Chacha", example: "As in Chardi Kala" },
      { id: "jajja", gurmukhi: "ਜ", sound: "J (Jajja)", name: "Jajja", example: "As in Japji" },
      { id: "tatta", gurmukhi: "ਤ", sound: "T (Tatta)", name: "Tatta", example: "Soft dental 't' as in Tera" },
      { id: "dadda", gurmukhi: "ਦ", sound: "D (Dadda)", name: "Dadda", example: "Soft 'd' as in Daya" },
      { id: "nanna", gurmukhi: "ਨ", sound: "N (Nanna)", name: "Nanna", example: "As in Naam" },
      { id: "pappa", gurmukhi: "ਪ", sound: "P (Pappa)", name: "Pappa", example: "As in Panth" },
      { id: "babba", gurmukhi: "ਬ", sound: "B (Babba)", name: "Babba", example: "As in Bani" },
      { id: "mamma", gurmukhi: "ਮ", sound: "M (Mamma)", name: "Mamma", example: "As in Mool Mantar" },
    ],
  },
];

function deterministicShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  let s = seed + 1;
  for (let i = arr.length - 1; i > 0; i -= 1) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function GurmukhiLetterMatch() {
  const [setIdx, setSetIdx] = useState(0);
  const [roundSeed, setRoundSeed] = useState(3);
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);
  const [selectedSoundId, setSelectedSoundId] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{
    tone: "neutral" | "success" | "gentle";
    text: string;
  }>({
    tone: "neutral",
    text: "Select a Gurmukhi letter on the left, then select its matching English sound on the right.",
  });

  const activeSet = LETTER_SETS[setIdx];

  const shuffledSounds = useMemo(
    () => deterministicShuffle(activeSet.pairs, roundSeed + setIdx * 17),
    [activeSet.pairs, roundSeed, setIdx]
  );

  const checkPair = (letterId: string, soundId: string) => {
    const letter = activeSet.pairs.find((p) => p.id === letterId);
    const sound = activeSet.pairs.find((p) => p.id === soundId);
    if (!letter || !sound) return;

    if (letterId === soundId) {
      const nextMatched = [...matchedIds, letterId];
      setMatchedIds(nextMatched);
      setSelectedLetterId(null);
      setSelectedSoundId(null);
      setFeedback({
        tone: "success",
        text:
          nextMatched.length === activeSet.pairs.length
            ? `Well done! You matched all ${activeSet.pairs.length} Gurmukhi letters in this set.`
            : `Matched ${letter.gurmukhi} with ${letter.sound} — ${letter.example}.`,
      });
    } else {
      setSelectedLetterId(null);
      setSelectedSoundId(null);
      setFeedback({
        tone: "gentle",
        text: `Not quite — ${letter.gurmukhi} does not match ${sound.sound}. Try another pairing.`,
      });
    }
  };

  const handleSelectLetter = (id: string) => {
    if (matchedIds.includes(id)) return;
    if (selectedLetterId === id) {
      setSelectedLetterId(null);
      return;
    }
    if (selectedSoundId) {
      checkPair(id, selectedSoundId);
    } else {
      setSelectedLetterId(id);
      const item = activeSet.pairs.find((p) => p.id === id);
      setFeedback({
        tone: "neutral",
        text: `Selected ${item?.gurmukhi || "letter"}. Now choose its matching phonetic sound.`,
      });
    }
  };

  const handleSelectSound = (id: string) => {
    if (matchedIds.includes(id)) return;
    if (selectedSoundId === id) {
      setSelectedSoundId(null);
      return;
    }
    if (selectedLetterId) {
      checkPair(selectedLetterId, id);
    } else {
      setSelectedSoundId(id);
      const item = activeSet.pairs.find((p) => p.id === id);
      setFeedback({
        tone: "neutral",
        text: `Selected "${item?.sound || "sound"}". Now choose the matching Gurmukhi character.`,
      });
    }
  };

  const resetSet = (nextIdx: number) => {
    setSetIdx(nextIdx);
    setRoundSeed((s) => s + 5);
    setSelectedLetterId(null);
    setSelectedSoundId(null);
    setMatchedIds([]);
    setFeedback({
      tone: "neutral",
      text: "Select a Gurmukhi letter on the left, then select its matching English sound on the right.",
    });
  };

  const isComplete = matchedIds.length === activeSet.pairs.length;

  return (
    <div
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
        color: "var(--text-primary)",
      }}
      className="sanctuary-glass rounded-[var(--radius-card)] border p-6 sm:p-8 space-y-6"
    >
      {/* Header & Set Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4" style={{ borderColor: "var(--border-subtle)" }}>
        <div className="space-y-1">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold">
            Gurmukhi Letter Match
          </h2>
          <p style={{ color: "var(--theme-text-muted)" }} className="text-sm sm:text-base">
            Matched {matchedIds.length} of {activeSet.pairs.length} letters
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Choose letter set">
          {LETTER_SETS.map((setItem, idx) => (
            <button
              key={setItem.label}
              type="button"
              onClick={() => resetSet(idx)}
              aria-pressed={setIdx === idx}
              style={{
                borderColor: setIdx === idx ? "#C59B27" : "var(--border-subtle)",
                backgroundColor:
                  setIdx === idx ? "var(--theme-card-darker)" : "transparent",
              }}
              className="rounded-[var(--radius-control)] border px-3 py-1.5 text-xs sm:text-sm font-semibold transition hover:border-[#C59B27]"
            >
              Set {idx + 1}
            </button>
          ))}
        </div>
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

      {/* Clean 2-Column Matching Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column 1: Gurmukhi Letters */}
        <div className="space-y-2.5" role="group" aria-label="Gurmukhi characters">
          <p
            style={{ color: "var(--accent-text, var(--accent-primary))" }}
            className="text-xs font-bold uppercase tracking-[0.18em]"
          >
            Gurmukhi Characters
          </p>
          <div className="grid grid-cols-2 gap-3">
            {activeSet.pairs.map((pair) => {
              const matched = matchedIds.includes(pair.id);
              const selected = selectedLetterId === pair.id;
              return (
                <button
                  key={pair.id}
                  type="button"
                  disabled={matched}
                  aria-pressed={selected}
                  aria-label={`Gurmukhi letter ${pair.name}${matched ? ", matched" : ""}`}
                  onClick={() => handleSelectLetter(pair.id)}
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
                  className={`sanctuary-interactive min-h-[4.5rem] rounded-2xl border-2 px-4 py-3 flex items-center justify-between gap-2 text-left transition ${
                    selected ? "ring-2 ring-[#C59B27] ring-offset-2" : ""
                  } ${matched ? "opacity-70 cursor-default" : "cursor-pointer"}`}
                >
                  <span
                    lang="pa"
                    className="font-gurmukhi text-3xl sm:text-4xl font-bold leading-none"
                  >
                    {pair.gurmukhi}
                  </span>
                  <span className="text-xs font-bold">
                    {matched ? "✓ Matched" : selected ? "Selected" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 2: English Phonetic Sounds */}
        <div className="space-y-2.5" role="group" aria-label="English phonetic sounds">
          <p
            style={{ color: "var(--accent-text, var(--accent-primary))" }}
            className="text-xs font-bold uppercase tracking-[0.18em]"
          >
            English Phonetic Sounds
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {shuffledSounds.map((pair) => {
              const matched = matchedIds.includes(pair.id);
              const selected = selectedSoundId === pair.id;
              return (
                <button
                  key={pair.id}
                  type="button"
                  disabled={matched}
                  aria-pressed={selected}
                  aria-label={`Phonetic sound ${pair.sound}${matched ? ", matched" : ""}`}
                  onClick={() => handleSelectSound(pair.id)}
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
                  className={`sanctuary-interactive min-h-[4.5rem] rounded-2xl border-2 px-4 py-3 flex flex-col justify-center text-left transition ${
                    selected ? "ring-2 ring-[#C59B27] ring-offset-2" : ""
                  } ${matched ? "opacity-70 cursor-default" : "cursor-pointer"}`}
                >
                  <span className="text-base font-bold leading-snug">
                    {pair.sound}
                  </span>
                  <span
                    style={{ color: "var(--theme-text-muted)" }}
                    className="text-xs mt-0.5"
                  >
                    {matched ? `✓ ${pair.gurmukhi} · ${pair.example}` : pair.example}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t" style={{ borderColor: "var(--border-subtle)" }}>
        <button
          type="button"
          onClick={() => resetSet(setIdx)}
          style={{ borderColor: "var(--border-subtle)" }}
          className="rounded-[var(--radius-control)] border px-4 py-2 text-sm font-semibold hover:border-[#C59B27] transition"
        >
          Shuffle &amp; Restart Set
        </button>

        {isComplete && (
          <button
            type="button"
            onClick={() => resetSet((setIdx + 1) % LETTER_SETS.length)}
            className="sanctuary-interactive rounded-[var(--radius-control)] bg-gradient-to-r from-[#C59B27] to-[#D97706] px-5 py-2.5 text-sm font-extrabold text-[#18181B]"
          >
            Continue to Set {((setIdx + 1) % LETTER_SETS.length) + 1} →
          </button>
        )}
      </div>
    </div>
  );
}
