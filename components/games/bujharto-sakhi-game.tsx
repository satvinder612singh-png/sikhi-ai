"use client";

import React, { useState, useMemo } from "react";
import type { BadgeId } from "@/lib/games-economy";

type BujhartoRiddle = {
  id: string;
  numeral: string;
  category: string;
  clues: [string, string, string];
  options: string[];
  answer: string;
  gurmukhiAnswer: string;
  sakhiLesson: string;
};

const BUJHARTAN_RIDDLES: BujhartoRiddle[] = [
  {
    id: "r1",
    numeral: "੧",
    category: "Compassion & Seva",
    clues: [
      "I carried a leather mashak (water-skin) across the battlefield of Anandpur Sahib in 1704 CE.",
      "I poured cool water for wounded soldiers of both the Khalsa and the opposing army without discrimination.",
      "When asked why I helped enemy soldiers, I replied: 'I saw no Mughal or Sikh on the field—I saw only the Guru's face in all.'",
    ],
    options: [
      "Bhai Kanhaiya Ji",
      "Bhai Mardana Ji",
      "Baba Banda Singh Bahadur",
      "Bhai Mani Singh Ji",
    ],
    answer: "Bhai Kanhaiya Ji",
    gurmukhiAnswer: "ਭਾਈ ਘਨੱਈਆ ਜੀ",
    sakhiLesson:
      "Guru Gobind Singh Ji blessed Bhai Kanhaiya Ji and gave him soothing medical ointment (Malham) to apply to the wounds of all soldiers, founding the Sevapanthi tradition.",
  },
  {
    id: "r2",
    numeral: "੨",
    category: "Chaar Sahibzaade",
    clues: [
      "We were the two youngest sons of Guru Gobind Singh Ji and Mata Gujri Ji, aged only 9 and 7.",
      "Inside the freezing Thanda Burj at Sirhind, we listened to stories of our grandfather Guru Tegh Bahadur Sahib Ji's courage.",
      "We stood fearless before Wazir Khan's court and chose to be bricked alive rather than abandon our Sikhi.",
    ],
    options: [
      "Sahibzada Zorawar Singh Ji & Sahibzada Fateh Singh Ji",
      "Sahibzada Ajit Singh Ji & Sahibzada Jujhar Singh Ji",
      "Baba Buddha Ji & Bhai Gurdas Ji",
      "Bhai Taru Singh Ji & Bhai Mati Das Ji",
    ],
    answer: "Sahibzada Zorawar Singh Ji & Sahibzada Fateh Singh Ji",
    gurmukhiAnswer: "ਸਾਹਿਬਜ਼ਾਦਾ ਜ਼ੋਰਾਵਰ ਸਿੰਘ ਜੀ ਅਤੇ ਸਾਹਿਬਜ਼ਾਦਾ ਫ਼ਤਹਿ ਸਿੰਘ ਜੀ",
    sakhiLesson:
      "In December 1704 CE at Fatehgarh Sahib (Sirhind), the Chhote Sahibzaade demonstrated that courage and devotion to truth have no minimum age.",
  },
  {
    id: "r3",
    numeral: "੩",
    category: "Matriarchs of the Panth",
    clues: [
      "I was the elder sister of Guru Nanak Dev Ji and the very first person to recognize his divine light.",
      "I protected young Nanak from our father Mehta Kalu's anger after he spent 20 rupees feeding hungry saints (Sacha Sauda).",
      "In Sultanpur Lodhi, I gifted the very first Rabab to Bhai Mardana Ji so Gurmat Kirtan could blossom.",
    ],
    options: [
      "Bebe Nanaki Ji",
      "Mata Khivi Ji",
      "Mata Sundari Ji",
      "Mai Bhago Ji",
    ],
    answer: "Bebe Nanaki Ji",
    gurmukhiAnswer: "ਬੇਬੇ ਨਾਨਕੀ ਜੀ",
    sakhiLesson:
      "Bebe Nanaki Ji is revered as the first Sikh in history and the patron of Gurmat Kirtan.",
  },
  {
    id: "r4",
    numeral: "੪",
    category: "The Ten Gurus",
    clues: [
      "I became the Eighth Guru of the Sikhs at the tender age of five in Kiratpur Sahib.",
      "I maintained a large herbal dispensary (Dawa-Khana) whose rare medicines even cured Emperor Shah Jahan's daughter Dara Shikoh.",
      "In Delhi in 1664 CE, I personally healed thousands suffering from the smallpox & cholera epidemic before giving up my life at age eight.",
    ],
    options: [
      "Guru Har Krishan Sahib Ji",
      "Guru Har Rai Sahib Ji",
      "Guru Angad Dev Ji",
      "Guru Amar Das Ji",
    ],
    answer: "Guru Har Krishan Sahib Ji",
    gurmukhiAnswer: "ਗੁਰੂ ਹਰਿ ਕ੍ਰਿਸ਼ਨ ਸਾਹਿਬ ਜੀ",
    sakhiLesson:
      "Remembered in Ardas as 'Jis Dithe Sabh Dukh Jaye' (Whose sight dispels all suffering), Gurudwara Bangla Sahib in New Delhi marks the site where Guru Har Krishan Sahib Ji served the sick.",
  },
  {
    id: "r5",
    numeral: "੫",
    category: "Gurmukhi & Langar",
    clues: [
      "Before meeting Guru Nanak Dev Ji at Kartarpur, my name was Bhai Lehna Ji.",
      "Together with Mata Khivi Ji at Khadur Sahib, I expanded Guru ka Langar and personally taught children the 35 letters of Gurmukhi (Painti Akhar).",
      "I also started the tradition of Mall Akhara (physical wrestling and fitness grounds) so Sikhs would be strong in both mind and body.",
    ],
    options: [
      "Guru Angad Dev Ji",
      "Guru Ram Das Ji",
      "Guru Arjan Dev Ji",
      "Guru Hargobind Sahib Ji",
    ],
    answer: "Guru Angad Dev Ji",
    gurmukhiAnswer: "ਗੁਰੂ ਅੰਗਦ ਦੇਵ ਜੀ",
    sakhiLesson:
      "Guru Angad Dev Ji standardized the Gurmukhi script so every man, woman, and child could read Gurbani directly without priestly intermediaries.",
  },
  {
    id: "r6",
    numeral: "੬",
    category: "Khalsa Valor",
    clues: [
      "When 40 tired soldiers deserted Anandpur Sahib and returned home to Majha, I rallied them to return and stand with the Guru.",
      "Wearing a steel Dastar-Bunga and carrying my iron lance (Barcha), I led the charge on horseback at Khidrana Dhaab (Muktsar) in 1705 CE.",
      "I later served at Takht Sri Hazur Sahib, Nanded, as part of Guru Gobind Singh Ji's personal guard.",
    ],
    options: [
      "Mai Bhago Ji (Mata Bhag Kaur)",
      "Rani Sada Kaur",
      "Bibi Sharan Kaur",
      "Mata Sahib Kaur Ji",
    ],
    answer: "Mai Bhago Ji (Mata Bhag Kaur)",
    gurmukhiAnswer: "ਮਾਈ ਭਾਗੋ ਜੀ",
    sakhiLesson:
      "Mai Bhago Ji's original spear (Barcha) is still preserved at Takht Sri Hazur Sahib as an enduring symbol of Khalsa courage.",
  },
];

type PaintiPair = {
  id: string;
  akhar: string;
  name: string;
  wordGurmukhi: string;
  wordTranslit: string;
  wordMeaning: string;
};

const PAINTI_MEMORY_SET: PaintiPair[] = [
  {
    id: "oora",
    akhar: "ੳ",
    name: "Oora",
    wordGurmukhi: "ਉੱਦਮ",
    wordTranslit: "Uddam",
    wordMeaning: "Diligent Effort",
  },
  {
    id: "aira",
    akhar: "ਅ",
    name: "Aira",
    wordGurmukhi: "ਅੰਮ੍ਰਿਤ",
    wordTranslit: "Amrit",
    wordMeaning: "Sacred Nectar",
  },
  {
    id: "sassa",
    akhar: "ਸ",
    name: "Sassa",
    wordGurmukhi: "ਸੇਵਾ",
    wordTranslit: "Seva",
    wordMeaning: "Selfless Service",
  },
  {
    id: "kakka",
    akhar: "ਕ",
    name: "Kakka",
    wordGurmukhi: "ਕਿਰਤ",
    wordTranslit: "Kirat",
    wordMeaning: "Honest Labour",
  },
  {
    id: "pappa",
    akhar: "ਪ",
    name: "Pappa",
    wordGurmukhi: "ਪੰਗਤ",
    wordTranslit: "Pangat",
    wordMeaning: "Row of Equality",
  },
  {
    id: "lalla",
    akhar: "ਲ",
    name: "Lalla",
    wordGurmukhi: "ਲੰਗਰ",
    wordTranslit: "Langar",
    wordMeaning: "Community Kitchen",
  },
];

const FULL_35_PAINTI: { akhar: string; name: string; sound: string; example: string }[] = [
  { akhar: "ੳ", name: "Oora", sound: "u / o", example: "ਉੱਦਮ (Uddam — Effort)" },
  { akhar: "ਅ", name: "Aira", sound: "a / aa", example: "ਅਕਾਲ (Akal — Timeless)" },
  { akhar: "ੲ", name: "Eeri", sound: "i / ee / e", example: "ਇੱਕ (Ik — One)" },
  { akhar: "ਸ", name: "Sassa", sound: "sa", example: "ਸੇਵਾ (Seva — Service)" },
  { akhar: "ਹ", name: "Haha", sound: "ha", example: "ਹੁਕਮੁ (Hukam — Divine Order)" },
  { akhar: "ਕ", name: "Kakka", sound: "ka", example: "ਕਿਰਤ (Kirat — Honest Work)" },
  { akhar: "ਖ", name: "Khakha", sound: "kha", example: "ਖ਼ਾਲਸਾ (Khalsa — The Pure)" },
  { akhar: "ਗ", name: "Gagga", sound: "ga", example: "ਗੁਰੂ (Guru — Enlightener)" },
  { akhar: "ਘ", name: "Ghagha", sound: "gha", example: "ਘਰੁ (Ghar — Spiritual Home)" },
  { akhar: "ਙ", name: "Nganga", sound: "nga", example: "ਅੰਗ (Ang — Sacred Limb/Page)" },
  { akhar: "ਚ", name: "Chacha", sound: "cha", example: "ਚੜ੍ਹਦੀ ਕਲਾ (Chardi Kala — High Spirits)" },
  { akhar: "ਛ", name: "Chhachha", sound: "chha", example: "ਛਾਂ (Chhaa — Shade of Langar)" },
  { akhar: "ਜ", name: "Jajja", sound: "ja", example: "ਜਪੁ (Japu — Recitation)" },
  { akhar: "ਝ", name: "Jhajha", sound: "jha", example: "ਝੂਠੁ (Jhooth — Falsehood)" },
  { akhar: "ਞ", name: "Njanja", sound: "nya", example: "ਜੰਞ (Janj — Procession)" },
  { akhar: "ਟ", name: "Tainka", sound: "ta (retroflex)", example: "ਟੇਕ (Tek — Support)" },
  { akhar: "ਠ", name: "Thatha", sound: "tha (retroflex)", example: "ਠਾਕੁਰੁ (Thakur — Sovereign Lord)" },
  { akhar: "ਡ", name: "Dadda", sound: "da (retroflex)", example: "ਡਰੁ (Daru — Reverential Awe)" },
  { akhar: "ਢ", name: "Dhadha", sound: "dha (retroflex)", example: "ਢਾਲ (Dhaal — Shield)" },
  { akhar: "ਣ", name: "Naana", sound: "na (retroflex)", example: "ਪਾਣੀ (Pani — Water)" },
  { akhar: "ਤ", name: "Tatta", sound: "ta", example: "ਤਖ਼ਤ (Takht — Throne)" },
  { akhar: "ਥ", name: "Thatha", sound: "tha", example: "ਥਾਲੁ (Thaal — Plate)" },
  { akhar: "ਦ", name: "Dadda", sound: "da", example: "ਦਇਆ (Daya — Compassion)" },
  { akhar: "ਧ", name: "Dhadha", sound: "dha", example: "ਧਰਮੁ (Dharam — Righteousness)" },
  { akhar: "ਨ", name: "Nanna", sound: "na", example: "ਨਾਮੁ (Naam — Divine Name)" },
  { akhar: "ਪ", name: "Pappa", sound: "pa", example: "ਪਵਣੁ (Pavan — Air)" },
  { akhar: "ਫ", name: "Phapha", sound: "pha", example: "ਫਤਹਿ (Fateh — Victory)" },
  { akhar: "ਬ", name: "Babba", sound: "ba", example: "ਬਾਣੀ (Bani — Sacred Word)" },
  { akhar: "ਭ", name: "Bhabha", sound: "bha", example: "ਭਲਾ (Bhala — Welfare of All)" },
  { akhar: "ਮ", name: "Mamma", sound: "ma", example: "ਮਾਤਾ (Mata — Mother)" },
  { akhar: "ਯ", name: "Yayya", sound: "ya", example: "ਯਾਦ (Yaad — Remembrance)" },
  { akhar: "ਰ", name: "Rara", sound: "ra", example: "ਰਬਾਬ (Rabab — Stringed Instrument)" },
  { akhar: "ਲ", name: "Lalla", sound: "la", example: "ਲੰਗਰੁ (Langar — Community Kitchen)" },
  { akhar: "ਵ", name: "Vava", sound: "va / wa", example: "ਵਾਹਿਗੁਰੂ (Waheguru — Wondrous Enlightener)" },
  { akhar: "ੜ", name: "Rhaarha", sound: "rha", example: "ਚੜ੍ਹਦੀ (Chardi — Rising)" },
];

type MemoryCard = {
  uid: string;
  pairId: string;
  kind: "akhar" | "word";
  primaryText: string;
  secondaryText: string;
};

function createShuffledMemoryDeck(): MemoryCard[] {
  const deck: MemoryCard[] = [];
  for (const item of PAINTI_MEMORY_SET) {
    deck.push({
      uid: `${item.id}-akhar`,
      pairId: item.id,
      kind: "akhar",
      primaryText: item.akhar,
      secondaryText: `${item.name} (Akhar)`,
    });
    deck.push({
      uid: `${item.id}-word`,
      pairId: item.id,
      kind: "word",
      primaryText: item.wordGurmukhi,
      secondaryText: `${item.wordTranslit} — ${item.wordMeaning}`,
    });
  }
  // Deterministic-friendly shuffle on client call
  return deck.sort(() => Math.random() - 0.5);
}

export function BujhartoSakhiGame({
  onEarnCoins,
}: {
  onEarnCoins: (params: {
    game: string;
    delta: number;
    reason: string;
    incrementStreak?: boolean;
    resetStreak?: boolean;
    unlockBadge?: BadgeId;
  }) => void;
}) {
  const [arcadeTab, setArcadeTab] = useState<"bujharto" | "painti">("bujharto");

  // Bujhartan Riddle State
  const [riddleIdx, setRiddleIdx] = useState(0);
  const [revealedClues, setRevealedClues] = useState(2);
  const [selectedRiddleAnswer, setSelectedRiddleAnswer] = useState<string | null>(null);
  const [riddleStreak, setRiddleStreak] = useState(0);

  // Painti Akhar Memory Match State
  const [deck, setDeck] = useState<MemoryCard[]>(() =>
    PAINTI_MEMORY_SET.flatMap((item) => [
      {
        uid: `${item.id}-akhar`,
        pairId: item.id,
        kind: "akhar" as const,
        primaryText: item.akhar,
        secondaryText: `${item.name} (Akhar)`,
      },
      {
        uid: `${item.id}-word`,
        pairId: item.id,
        kind: "word" as const,
        primaryText: item.wordGurmukhi,
        secondaryText: `${item.wordTranslit} — ${item.wordMeaning}`,
      },
    ])
  );
  const [flippedUids, setFlippedUids] = useState<string[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [selectedPaintiLetter, setSelectedPaintiLetter] = useState(FULL_35_PAINTI[0]);

  const currentRiddle = BUJHARTAN_RIDDLES[riddleIdx % BUJHARTAN_RIDDLES.length];

  const handleRiddleOption = (option: string) => {
    if (selectedRiddleAnswer !== null) return;
    setSelectedRiddleAnswer(option);
    const correct = option === currentRiddle.answer;

    if (correct) {
      const nextStreak = riddleStreak + 1;
      setRiddleStreak(nextStreak);
      onEarnCoins({
        game: "Bujharto & Sakhi Quest",
        delta: 5,
        reason: `Solved Bujharto: ${currentRiddle.answer} (Streak ${nextStreak})`,
        incrementStreak: true,
        unlockBadge: "young-khalsa-scholar",
      });
    } else {
      setRiddleStreak(0);
    }
  };

  const nextRiddle = () => {
    setRiddleIdx((prev) => prev + 1);
    setRevealedClues(2);
    setSelectedRiddleAnswer(null);
  };

  const handleCardFlip = (uid: string) => {
    if (flippedUids.length >= 2 || flippedUids.includes(uid)) return;
    const card = deck.find((c) => c.uid === uid);
    if (!card || matchedPairIds.includes(card.pairId)) return;

    const nextFlipped = [...flippedUids, uid];
    setFlippedUids(nextFlipped);

    if (nextFlipped.length === 2) {
      const first = deck.find((c) => c.uid === nextFlipped[0]);
      const second = deck.find((c) => c.uid === nextFlipped[1]);

      if (first && second && first.pairId === second.pairId) {
        const nextMatched = [...matchedPairIds, first.pairId];
        setMatchedPairIds(nextMatched);
        setFlippedUids([]);

        if (nextMatched.length === PAINTI_MEMORY_SET.length) {
          onEarnCoins({
            game: "Painti Akhar Match",
            delta: 5,
            reason: "Completed all 6 Gurmukhi Painti Akhar memory pairs!",
            incrementStreak: true,
            unlockBadge: "painti-master",
          });
        }
      } else {
        setTimeout(() => {
          setFlippedUids([]);
        }, 700);
      }
    }
  };

  const resetPaintiMemory = () => {
    setDeck(createShuffledMemoryDeck());
    setFlippedUids([]);
    setMatchedPairIds([]);
  };

  const allPairsMatched = useMemo(
    () => matchedPairIds.length === PAINTI_MEMORY_SET.length,
    [matchedPairIds]
  );

  return (
    <div className="space-y-8">
      {/* Arcade Header & Mode Switcher */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#121C15] border border-[#C59B27]/45 text-[#FAF6EE] shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-[11px] uppercase tracking-[0.22em] text-[#E5C158] font-semibold px-2.5 py-0.5 rounded bg-[#1B2A20] border border-[#C59B27]/40">
                CHILDREN &amp; FAMILY SIKHI ARCADE • +5 COINS PER STREAK &amp; BADGE UNLOCKS
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#FAF6EE]">
              Bujharto &amp; Painti Akhar Sakhi Quest
            </h3>
            <p className="text-sm text-[#F3ECE0]/85 mt-1 max-w-2xl">
              Solve rapid-fire <strong>&ldquo;Who Am I?&rdquo; Sikh historical riddles (Bujhartan)</strong>{" "}
              and master the <strong>35 letters of the Gurmukhi Painti Akhar</strong> to unlock the{" "}
              <em>Young Khalsa Scholar</em> and <em>Painti Master</em> badges!
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setArcadeTab("bujharto")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                arcadeTab === "bujharto"
                  ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#171917]"
                  : "bg-[#1B2A20] text-[#FAF6EE] border border-[#C59B27]/40 hover:border-[#C59B27]"
              }`}
            >
              ੧ · &ldquo;Who Am I?&rdquo; Riddles (Bujhartan)
            </button>
            <button
              type="button"
              onClick={() => setArcadeTab("painti")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                arcadeTab === "painti"
                  ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#171917]"
                  : "bg-[#1B2A20] text-[#FAF6EE] border border-[#C59B27]/40 hover:border-[#C59B27]"
              }`}
            >
              ੨ · Gurmukhi Painti Akhar Match
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: "WHO AM I?" HISTORICAL RIDDLES (BUJHARTAN) */}
      {arcadeTab === "bujharto" && (
        <div className="p-6 md:p-8 rounded-2xl bg-[#F3ECE0] border-2 border-[#C59B27]/55 text-[#171917] shadow-parchment space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#C59B27]/30 pb-4">
            <div className="flex items-center gap-2.5">
              <span
                lang="pa"
                className="font-gurmukhi text-base font-bold px-3 py-1 rounded-lg bg-[#1B2A20] text-[#E5C158] border border-[#C59B27]/40"
              >
                {currentRiddle.numeral}
              </span>
              <div>
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#D97706] font-bold block">
                  Bujharto Riddle #{(riddleIdx % BUJHARTAN_RIDDLES.length) + 1} of{" "}
                  {BUJHARTAN_RIDDLES.length} • {currentRiddle.category}
                </span>
                <h4 className="text-xl font-serif font-bold text-[#171917]">
                  ਬੁਝਾਰਤ: Who Am I in Sikh History?
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1.5 rounded-full bg-[#1B2A20] text-[#E5C158] border border-[#C59B27]/40 text-xs font-bold">
                Current Streak: {riddleStreak} 🔥 (+5 Coins / Answer)
              </span>
            </div>
          </div>

          {/* Progressive Clues */}
          <div className="space-y-3">
            {currentRiddle.clues.slice(0, revealedClues).map((clue, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#1B2A20] text-[#FAF6EE] border border-[#C59B27]/40 flex items-start gap-3"
              >
                <span className="px-2.5 py-0.5 rounded bg-[#C59B27]/20 border border-[#C59B27]/40 text-xs font-bold text-[#E5C158] shrink-0">
                  Clue {idx + 1}
                </span>
                <p className="text-sm md:text-base leading-relaxed">{clue}</p>
              </div>
            ))}

            {revealedClues < 3 && selectedRiddleAnswer === null && (
              <button
                type="button"
                onClick={() => setRevealedClues(3)}
                className="text-xs font-semibold text-[#D97706] hover:underline"
              >
                + Reveal Clue 3 for an extra hint
              </button>
            )}
          </div>

          {/* 4 Answer Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {currentRiddle.options.map((opt) => {
              const isSelected = selectedRiddleAnswer === opt;
              const isCorrect = opt === currentRiddle.answer;

              let btnClass =
                "p-4 rounded-xl border text-left font-serif text-base font-bold transition ";
              if (selectedRiddleAnswer !== null) {
                if (isCorrect) {
                  btnClass += "bg-[#1B2A20] text-emerald-300 border-2 border-emerald-400 shadow-lg";
                } else if (isSelected) {
                  btnClass += "bg-[#1B2A20] text-amber-300 border-2 border-amber-400";
                } else {
                  btnClass += "bg-[#FAF6EE]/60 text-[#4A554E] border-[#C59B27]/25 opacity-60";
                }
              } else {
                btnClass +=
                  "bg-[#FAF6EE] text-[#171917] border-[#C59B27]/50 hover:bg-[#1B2A20] hover:text-[#E5C158] hover:border-[#D97706]";
              }

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={selectedRiddleAnswer !== null}
                  onClick={() => handleRiddleOption(opt)}
                  className={btnClass}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Sakhi Reveal & Next Button */}
          {selectedRiddleAnswer !== null && (
            <div className="p-5 rounded-2xl bg-[#1B2A20] text-[#FAF6EE] border border-[#C59B27] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p lang="pa" className="font-gurmukhi text-xl text-[#E5C158] font-bold">
                  {currentRiddle.gurmukhiAnswer} ({currentRiddle.answer})
                </p>
                <p className="text-xs sm:text-sm text-[#F3ECE0]/90 leading-relaxed">
                  {currentRiddle.sakhiLesson}
                </p>
              </div>
              <button
                type="button"
                onClick={nextRiddle}
                className="shrink-0 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#171917] font-bold text-xs uppercase tracking-wider hover:brightness-105 transition"
              >
                Next Riddle →
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GURMUKHI PAINTI AKHAR MEMORY MATCH & 35-LETTER EXPLORER */}
      {arcadeTab === "painti" && (
        <div className="space-y-8">
          <div className="p-6 md:p-8 rounded-2xl bg-[#F3ECE0] border-2 border-[#C59B27]/55 text-[#171917] shadow-parchment space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C59B27]/30 pb-4">
              <div>
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#D97706] font-bold">
                  Gurmukhi Literacy Memory Challenge (+5 Coins &amp; Painti Master Badge)
                </span>
                <h4 className="text-xl font-serif font-bold text-[#171917] mt-0.5">
                  Match Each Gurmukhi Akhar to Its Sacred Word ({matchedPairIds.length} /{" "}
                  {PAINTI_MEMORY_SET.length} Pairs Matched)
                </h4>
              </div>
              <button
                type="button"
                onClick={resetPaintiMemory}
                className="px-4 py-2 rounded-xl bg-[#1B2A20] text-[#E5C158] border border-[#C59B27] text-xs font-semibold uppercase tracking-wider hover:bg-[#D97706] hover:text-[#171917] transition"
              >
                Shuffle &amp; Play Again
              </button>
            </div>

            {allPairsMatched && (
              <div className="p-4 rounded-xl bg-[#1B2A20] text-[#FAF6EE] border border-emerald-400 flex items-center justify-between">
                <p className="text-sm font-semibold text-emerald-300">
                  🎉 Waheguru! You matched all 6 Gurmukhi Painti Akhar pairs (+5 Knowledge Coins &amp;
                  Painti Master badge unlocked)!
                </p>
              </div>
            )}

            {/* 12-Card Memory Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {deck.map((card) => {
                const isFlipped =
                  flippedUids.includes(card.uid) || matchedPairIds.includes(card.pairId);
                const isMatched = matchedPairIds.includes(card.pairId);

                return (
                  <button
                    key={card.uid}
                    type="button"
                    onClick={() => handleCardFlip(card.uid)}
                    className={`h-28 rounded-2xl border p-3 flex flex-col items-center justify-center text-center transition-all ${
                      isMatched
                        ? "bg-[#1B2A20] text-[#E5C158] border-2 border-emerald-400 shadow-md"
                        : isFlipped
                        ? "bg-[#1B2A20] text-[#FAF6EE] border-2 border-[#D97706] shadow-lg"
                        : "bg-[#FAF6EE] text-[#1B2A20] border-[#C59B27]/50 hover:border-[#D97706] hover:bg-[#1B2A20] hover:text-[#E5C158]"
                    }`}
                  >
                    {isFlipped ? (
                      <>
                        <span
                          lang="pa"
                          className="font-gurmukhi text-2xl sm:text-3xl font-bold text-[#E5C158]"
                        >
                          {card.primaryText}
                        </span>
                        <span className="text-[11px] text-[#F3ECE0]/85 mt-1 font-medium">
                          {card.secondaryText}
                        </span>
                      </>
                    ) : (
                      <>
                        <span lang="pa" className="font-gurmukhi text-2xl font-bold opacity-80">
                          ੴ
                        </span>
                        <span className="text-[10px] uppercase tracking-widest mt-1 font-semibold opacity-75">
                          Tap to Reveal
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive 35 Painti Akhar Chart */}
          <div className="p-6 md:p-8 rounded-2xl bg-[#1B2A20] border border-[#C59B27]/45 text-[#FAF6EE] space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#C59B27]/25 pb-4">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[#E5C158] font-semibold">
                  Complete 35 Gurmukhi Painti Akhar Reference
                </span>
                <h4 className="text-xl font-serif font-bold text-[#FAF6EE] mt-0.5">
                  Tap Any Letter to Inspect Its Pronunciation &amp; Gurmat Word
                </h4>
              </div>

              <div className="p-3.5 rounded-xl bg-[#121C15] border border-[#C59B27]/45 min-w-[260px]">
                <div className="flex items-center gap-3">
                  <span
                    lang="pa"
                    className="font-gurmukhi text-3xl font-bold text-[#E5C158] px-3 py-1 rounded bg-[#1B2A20] border border-[#C59B27]/40"
                  >
                    {selectedPaintiLetter.akhar}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#FAF6EE]">
                      {selectedPaintiLetter.name}{" "}
                      <span className="text-xs text-[#E5C158] font-normal">
                        ({selectedPaintiLetter.sound})
                      </span>
                    </p>
                    <p lang="pa" className="text-xs text-[#F3ECE0]/85 mt-0.5">
                      {selectedPaintiLetter.example}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-7 gap-2.5">
              {FULL_35_PAINTI.map((item) => {
                const active = selectedPaintiLetter.akhar === item.akhar;
                return (
                  <button
                    key={item.akhar + item.name}
                    type="button"
                    onClick={() => setSelectedPaintiLetter(item)}
                    className={`p-3 rounded-xl border text-center transition ${
                      active
                        ? "bg-gradient-to-b from-[#E5C158] to-[#C59B27] text-[#171917] border-[#FAF6EE] font-bold shadow-md"
                        : "bg-[#121C15] text-[#FAF6EE] border-[#C59B27]/30 hover:border-[#E5C158]"
                    }`}
                  >
                    <span lang="pa" className="font-gurmukhi text-xl sm:text-2xl block">
                      {item.akhar}
                    </span>
                    <span className="text-[10px] opacity-80 block mt-0.5">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
