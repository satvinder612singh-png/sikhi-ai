"use client";

import React, { useState, useMemo } from "react";
import type { BadgeId } from "@/lib/games-economy";

type VocabPair = {
  gurmukhi: string;
  translit: string;
  meaning: string;
};

type LarivaarChallenge = {
  id: string;
  numeral: string;
  angCitation: string;
  author: string;
  raag: string;
  words: string[];
  transliteration: string;
  translation: string;
  arthQuestion: string;
  arthOptions: {
    id: string;
    text: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  vocabPairs: VocabPair[];
  philosophicalCommentary: string;
};

const LARIVAAR_CHALLENGES: LarivaarChallenge[] = [
  {
    id: "japji-sochai",
    numeral: "੧",
    angCitation: "ANG 1 • JAPJI SAHIB • PAURI 1",
    author: "Guru Nanak Dev Ji",
    raag: "Prologue (No Raag)",
    words: ["ਸੋਚੈ", "ਸੋਚਿ", "ਨ", "ਹੋਵਈ", "ਜੇ", "ਸੋਚੀ", "ਲਖ", "ਵਾਰ"],
    transliteration: "Sochai soch na hova-ee je sochee lakh vaar",
    translation:
      "By ritual purification or mere intellectual calculation, purity of truth cannot be achieved—even if one performs it hundreds of thousands of times.",
    arthQuestion:
      "In classical Gurmat exegesis (such as Bhai Gurdas Ji and Prof. Sahib Singh's Darpan), what dual meaning does 'Soch' (ਸੋਚ) carry in this opening Pauri of Japji Sahib?",
    arthOptions: [
      {
        id: "a",
        text: "Both external ritual bathing for bodily purity (Sucham) and ego-driven intellectual speculation—neither of which can dissolve the veil of Haumai.",
        isCorrect: true,
        feedback:
          "Correct! Both Sanskrit 'Shauch' (external ritual cleansing) and Punjabi 'Soch' (conceptual brooding) fall short of realizing Akal Purakh without walking in Hukam.",
      },
      {
        id: "b",
        text: "That human beings should abandon all study, reflection, and daily work in favor of forest asceticism.",
        isCorrect: false,
        feedback:
          "Incorrect. Guru Nanak Dev Ji explicitly rejects forest asceticism and calls for Vichar (contemplation) within active household life.",
      },
      {
        id: "c",
        text: "That performing pilgrimage baths exactly one hundred thousand times guarantees spiritual liberation.",
        isCorrect: false,
        feedback:
          "Incorrect. 'Lakh vaar' (hundreds of thousands of times) is used to show the futility of repetitive external rituals.",
      },
    ],
    vocabPairs: [
      {
        gurmukhi: "ਸੋਚੈ",
        translit: "Sochai",
        meaning: "Through ritual purity / conceptual thought",
      },
      {
        gurmukhi: "ਹੋਵਈ",
        translit: "Hova-ee",
        meaning: "Comes to pass / is attained",
      },
      {
        gurmukhi: "ਲਖ",
        translit: "Lakh",
        meaning: "Hundreds of thousands (countless)",
      },
      {
        gurmukhi: "ਵਾਰ",
        translit: "Vaar",
        meaning: "Times / repetitions",
      },
    ],
    philosophicalCommentary:
      "Until the mid-20th century, all birs (manuscripts) of Sri Guru Granth Sahib Ji were inscribed in Larivaar—an unbroken stream of Gurmukhi characters symbolizing the indivisible oneness of the Shabad. Reading Larivaar requires deep Santhiya (grammatical and contemplative training): recognizing that 'ਸੋਚੈ' (with dulavan) is instrumental ('by means of purity/thought') while 'ਸੋਚਿ' (with sihari) is the noun ('spiritual purity').",
  },
  {
    id: "pavan-guru",
    numeral: "੨",
    angCitation: "ANG 8 • JAPJI SAHIB • SALOK",
    author: "Guru Nanak Dev Ji",
    raag: "Salok (Concluding Verse)",
    words: ["ਪਵਣੁ", "ਗੁਰੂ", "ਪਾਣੀ", "ਪਿਤਾ", "ਮਾਤਾ", "ਧਰਤਿ", "ਮਹਤੁ"],
    transliteration: "Pavan guroo paanee pitaa maataa dharat mahat",
    translation:
      "Air is the Guru, Water is the Father, and the vast Earth is the Great Mother.",
    arthQuestion:
      "Why does Guru Nanak Dev Ji compare Air (Pavan / Prana) specifically to the Guru in this Salok?",
    arthOptions: [
      {
        id: "a",
        text: "Just as breath (Pavan) sustains physical life and carries spoken sound, the Guru's Shabad awakens and sustains the spiritual life of the soul.",
        isCorrect: true,
        feedback:
          "Spot on! Pavan is both the vital breath of all biosphere life and the medium of the Guru's Shabad that gives spiritual life.",
      },
      {
        id: "b",
        text: "Because worshipping wind deities through fire sacrifices brings material wealth.",
        isCorrect: false,
        feedback:
          "Incorrect. Sikhi rejects elemental deity worship while honoring creation (Kudrat) as the sacred dwelling of the One Creator.",
      },
      {
        id: "c",
        text: "Because air is invisible and therefore unrelated to human responsibility on Earth.",
        isCorrect: false,
        feedback:
          "Incorrect. The verse establishes sacred kinship with Air, Water, and Earth, grounding ecological stewardship in reverence.",
      },
    ],
    vocabPairs: [
      {
        gurmukhi: "ਪਵਣੁ",
        translit: "Pavanu",
        meaning: "Air / Vital Breath (Prana)",
      },
      {
        gurmukhi: "ਪਾਣੀ",
        translit: "Paanee",
        meaning: "Water (Progenitor of biological life)",
      },
      {
        gurmukhi: "ਧਰਤਿ",
        translit: "Dharati",
        meaning: "The Earth (Nurturing sanctuary)",
      },
      {
        gurmukhi: "ਮਹਤੁ",
        translit: "Mahatu",
        meaning: "Great / Vast / Exalted",
      },
    ],
    philosophicalCommentary:
      "Notice the Gurmukhi grammar (Gurbani Viyakaran): 'ਪਵਣੁ' and 'ਮਹਤੁ' end with an aunkar (ੁ) indicating singular masculine/qualitative nouns, while 'ਧਰਤਿ' ends with a sihari (ਿ) as a feminine noun paired with 'ਮਾਤਾ'. Splitting Larivaar accurately relies on recognizing these grammatical vowel markers.",
  },
  {
    id: "so-kio-manda",
    numeral: "੩",
    angCitation: "ANG 473 • RAAG ASA • ASA DI VAAR",
    author: "Guru Nanak Dev Ji",
    raag: "Raag Asa",
    words: ["ਸੋ", "ਕਿਉ", "ਮੰਦਾ", "ਆਖੀਐ", "ਜਿਤੁ", "ਜੰਮਹਿ", "ਰਾਜਾਨ"],
    transliteration: "So kio mandaa aakhee-ai jit jammahi raajaan",
    translation:
      "Why call her inferior, from whom kings and sovereigns are born?",
    arthQuestion:
      "What social and religious orthodoxy is Guru Nanak Dev Ji dismantling on Ang 473 with this Pangti?",
    arthOptions: [
      {
        id: "a",
        text: "Only royal women of high caste deserve respect, while ordinary women remain bound by ritual impurity.",
        isCorrect: false,
        feedback:
          "Incorrect. Guru Nanak Dev Ji uses 'Raajaan' (even the highest rulers revered by the world) to expose the hypocrisy of patriarchal hierarchies toward all women.",
      },
      {
        id: "b",
        text: "Patriarchal and priestly doctrines of female inferiority and biological 'impurity' (Sutak), affirming women's absolute spiritual and social equality.",
        isCorrect: true,
        feedback:
          "Correct! Spoken within the Asa Di Vaar critique of Sutak (ritual pollution), this verse establishes unconditional gender equality in Sikhi.",
      },
      {
        id: "c",
        text: "A purely political commentary on Mughal succession laws.",
        isCorrect: false,
        feedback:
          "Incorrect. It is a universal spiritual and ethical declaration addressing human dignity across all society.",
      },
    ],
    vocabPairs: [
      {
        gurmukhi: "ਮੰਦਾ",
        translit: "Mandaa",
        meaning: "Inferior / Lowly / Impure",
      },
      {
        gurmukhi: "ਆਖੀਐ",
        translit: "Aakhee-ai",
        meaning: "Should be called / spoken of",
      },
      {
        gurmukhi: "ਜਿਤੁ",
        translit: "Jitu",
        meaning: "From whom / By whom",
      },
      {
        gurmukhi: "ਰਾਜਾਨ",
        translit: "Raajaan",
        meaning: "Kings / Sovereigns / Great leaders",
      },
    ],
    philosophicalCommentary:
      "In the full Pauri on Ang 473, Guru Nanak Dev Ji traces every stage of human life—conception, birth, companionship, and the continuation of humanity—to woman, concluding that only the One Timeless Creator (Akal Purakh) is independent of woman.",
  },
  {
    id: "aval-alah-noor",
    numeral: "੪",
    angCitation: "ANG 1349 • RAAG PRABHATI",
    author: "Bhagat Kabir Ji",
    raag: "Raag Prabhati",
    words: ["ਅਵਲਿ", "ਅਲਹ", "ਨੂਰੁ", "ਉਪਾਇਆ", "ਕੁਦਰਤਿ", "ਕੇ", "ਸਭ", "ਬੰਦੇ"],
    transliteration: "Aval alah noor upaa-i-aa kudrat ke sabh bande",
    translation:
      "First, the Divine created the One Light; all mortal beings belong to Nature (Kudrat).",
    arthQuestion:
      "How does Bhagat Kabir Ji's verse on Ang 1349 refute caste supremacy and religious sectarianism?",
    arthOptions: [
      {
        id: "a",
        text: "By tracing every human being directly to the same primordial Divine Light (Noor) and the same creative Nature (Kudrat), leaving zero basis for viewing anyone as 'high' or 'low'.",
        isCorrect: true,
        feedback:
          "Exact! As the next line states: 'Ek noor te sabh jag upjia, kaun bhale ko mande' (From the One Light the whole universe welled up—who then is high and who is low?).",
      },
      {
        id: "b",
        text: "By arguing that only ascetics who renounce society possess the Divine Light.",
        isCorrect: false,
        feedback:
          "Incorrect. Bhagat Kabir Ji states 'Kudrat ke sabh bande'—all beings without exception share the same Divine Light.",
      },
      {
        id: "c",
        text: "By claiming that nature exists independently without any Creator.",
        isCorrect: false,
        feedback:
          "Incorrect. The verse explicitly opens with the Creator emanating the Divine Light ('Aval Alah Noor Upaaia').",
      },
    ],
    vocabPairs: [
      {
        gurmukhi: "ਅਵਲਿ",
        translit: "Avali",
        meaning: "First / In the beginning",
      },
      {
        gurmukhi: "ਨੂਰੁ",
        translit: "Nooru",
        meaning: "Divine Light / Consciousness",
      },
      {
        gurmukhi: "ਉਪਾਇਆ",
        translit: "Upaa-i-aa",
        meaning: "Created / Manifested",
      },
      {
        gurmukhi: "ਕੁਦਰਤਿ",
        translit: "Kudrati",
        meaning: "Creative Nature / Cosmic Order",
      },
    ],
    philosophicalCommentary:
      "Included by Guru Arjan Dev Ji in Sri Guru Granth Sahib Ji, Bhagat Kabir Ji's hymn harmonizes Islamic Sufi vocabulary ('Aval', 'Alah', 'Noor', 'Kudrat', 'Bande') with universal Gurmat ontology, demonstrating that truth transcends sectarian boundaries.",
  },
  {
    id: "bhai-kahu-kau",
    numeral: "੫",
    angCitation: "ANG 1427 • SALOK MAHALA 9",
    author: "Guru Tegh Bahadur Sahib Ji",
    raag: "Salok Mahala 9",
    words: ["ਭੈ", "ਕਾਹੂ", "ਕਉ", "ਦੇਤ", "ਨਹਿ", "ਨਹਿ", "ਭੈ", "ਮਾਨਤ", "ਆਨ"],
    transliteration: "Bhai kaahoo kau det nahi nahi bhai maanat aan",
    translation:
      "One who frightens no one, and submits to the fear of no one else—says Nanak, recognize such a person as truly enlightened.",
    arthQuestion:
      "How does Guru Tegh Bahadur Sahib Ji's definition of a spiritually enlightened person (Giani) on Ang 1427 embody the Miri-Piri ethos?",
    arthOptions: [
      {
        id: "a",
        text: "True spirituality unites non-tyranny ('frightens no one') with unyielding fearlessness before oppression ('fears no one').",
        isCorrect: true,
        feedback:
          "Correct! Guru Tegh Bahadur Sahib Ji lived this verse to the ultimate degree through his supreme martyrdom in Delhi in 1675 CE defending freedom of conscience.",
      },
      {
        id: "b",
        text: "One should intimidate others before they can intimidate you.",
        isCorrect: false,
        feedback:
          "Incorrect. The first half of the Pangti strictly prohibits inflicting fear or tyranny on anyone ('Bhai kaahoo kau det nahi').",
      },
      {
        id: "c",
        text: "One should quietly accept injustice to avoid worldly conflict.",
        isCorrect: false,
        feedback:
          "Incorrect. 'Nahi bhai maanat aan' commands never bowing in fear to any tyrant.",
      },
    ],
    vocabPairs: [
      {
        gurmukhi: "ਭੈ",
        translit: "Bhai",
        meaning: "Fear / Intimidation / Terror",
      },
      {
        gurmukhi: "ਕਾਹੂ",
        translit: "Kaahoo",
        meaning: "To anyone at all",
      },
      {
        gurmukhi: "ਮਾਨਤ",
        translit: "Maanat",
        meaning: "Accepts / Submits to",
      },
      {
        gurmukhi: "ਆਨ",
        translit: "Aan",
        meaning: "Another / Any worldly power",
      },
    ],
    philosophicalCommentary:
      "Notice the repeated word 'ਨਹਿ' (nahi) right at the center of the Pangti ('ਦੇਤ ਨਹਿ ਨਹਿ ਭੈ'). In Larivaar ('ਦੇਤਨਹਿਨਹਿਭੈ'), a reader must carefully split between the two consecutive 'ਨਹਿ' words: the first closes the clause 'frightens no one', and the second opens 'nor accepts fear from another'.",
  },
];

/**
 * Splits a Gurmukhi word into visual akshara clusters so vowel matras, bindis,
 * tippis, adhaks, and pairin characters stay attached to their base letter.
 */
function segmentGurmukhiWordIntoClusters(word: string): string[] {
  const clusters: string[] = [];
  const combiningRegex = /[\u0A01-\u0A03\u0A3C\u0A3E-\u0A4D\u0A51\u0A70-\u0A71]/;

  for (let i = 0; i < word.length; i++) {
    const ch = word[i];
    if (clusters.length > 0 && combiningRegex.test(ch)) {
      clusters[clusters.length - 1] += ch;
      // If virama/halant (\u0A4D) is followed by a subjoined consonant (e.g. ਪ੍ਰ, ਹ੍ਵ), keep attached
      if (ch === "\u0A4D" && i + 1 < word.length) {
        clusters[clusters.length - 1] += word[i + 1];
        i++;
      }
    } else {
      clusters.push(ch);
    }
  }
  return clusters;
}

export function LarivaarGame({
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
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [activeSubMode, setActiveSubMode] = useState<"padchhed" | "arth">("padchhed");
  const [userSplits, setUserSplits] = useState<number[]>([]);
  const [padchhedVerified, setPadchhedVerified] = useState(false);
  const [padchhedScore, setPadchhedScore] = useState<number | null>(null);

  const [selectedArthOption, setSelectedArthOption] = useState<string | null>(null);
  const [selectedVocabTerm, setSelectedVocabTerm] = useState<string | null>(null);
  const [matchedVocab, setMatchedVocab] = useState<Record<string, string>>({});
  const [vocabFeedback, setVocabFeedback] = useState<string | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<Record<string, boolean>>({});

  const challenge = LARIVAAR_CHALLENGES[challengeIdx];

  // Build akshara clusters and true word-split indices for the current Pangti
  const { allClusters, trueSplits, larivaarString } = useMemo(() => {
    const clusters: string[] = [];
    const splits: number[] = [];
    challenge.words.forEach((w, wIdx) => {
      const wClusters = segmentGurmukhiWordIntoClusters(w);
      clusters.push(...wClusters);
      if (wIdx < challenge.words.length - 1) {
        splits.push(clusters.length - 1);
      }
    });
    return {
      allClusters: clusters,
      trueSplits: splits,
      larivaarString: challenge.words.join(""),
    };
  }, [challenge]);

  // Shuffled meanings for the vocabulary matching challenge
  const shuffledMeanings = useMemo(() => {
    return [...challenge.vocabPairs].sort((a, b) => a.translit.localeCompare(b.translit));
  }, [challenge]);

  const userWordsPreview = useMemo(() => {
    const sorted = [...userSplits].sort((a, b) => a - b);
    const words: string[] = [];
    let current = "";
    allClusters.forEach((c, idx) => {
      current += c;
      if (sorted.includes(idx)) {
        words.push(current);
        current = "";
      }
    });
    if (current) words.push(current);
    return words;
  }, [allClusters, userSplits]);

  const resetForChallenge = (newIdx: number) => {
    setChallengeIdx(newIdx);
    setActiveSubMode("padchhed");
    setUserSplits([]);
    setPadchhedVerified(false);
    setPadchhedScore(null);
    setSelectedArthOption(null);
    setSelectedVocabTerm(null);
    setMatchedVocab({});
    setVocabFeedback(null);
  };

  const toggleSplit = (clusterIndex: number) => {
    if (padchhedVerified) return;
    setUserSplits((prev) =>
      prev.includes(clusterIndex)
        ? prev.filter((i) => i !== clusterIndex)
        : [...prev, clusterIndex]
    );
  };

  const giveHintSplit = () => {
    if (padchhedVerified) return;
    const missing = trueSplits.find((idx) => !userSplits.includes(idx));
    if (missing !== undefined) {
      setUserSplits((prev) => [...prev, missing]);
    }
  };

  const verifyPadchhed = () => {
    const correctHits = userSplits.filter((idx) => trueSplits.includes(idx)).length;
    const falseSplits = userSplits.filter((idx) => !trueSplits.includes(idx)).length;
    const rawRatio = Math.max(
      0,
      (correctHits - falseSplits * 0.5) / Math.max(1, trueSplits.length)
    );
    const accuracyPct = Math.round(rawRatio * 100);
    setPadchhedScore(accuracyPct);
    setPadchhedVerified(true);
  };

  const handleVocabMeaningClick = (meaning: string) => {
    if (!selectedVocabTerm) {
      setVocabFeedback("Select a Gurmukhi word on the left first, then click its meaning.");
      return;
    }
    const pair = challenge.vocabPairs.find((p) => p.gurmukhi === selectedVocabTerm);
    if (pair && pair.meaning === meaning) {
      setMatchedVocab((prev) => ({ ...prev, [selectedVocabTerm]: meaning }));
      setSelectedVocabTerm(null);
      setVocabFeedback("Shabash! Accurate Gurmukhi word-meaning match.");
    } else {
      setVocabFeedback("Not quite—reflect on the context of the Pangti and try another meaning.");
    }
  };

  const arthCorrect =
    challenge.arthOptions.find((o) => o.id === selectedArthOption)?.isCorrect ?? false;
  const allVocabMatched =
    Object.keys(matchedVocab).length === challenge.vocabPairs.length;

  const canClaimReward =
    padchhedVerified && selectedArthOption !== null && allVocabMatched;
  const alreadyClaimed = Boolean(completedChallenges[challenge.id]);

  const handleClaimChallengeReward = () => {
    if (!canClaimReward || alreadyClaimed) return;
    const splitPoints = Math.round(((padchhedScore ?? 100) / 100) * 8);
    const arthPoints = arthCorrect ? 4 : 2;
    const vocabPoints = 3;
    const totalEarned = Math.min(15, Math.max(5, splitPoints + arthPoints + vocabPoints));

    setCompletedChallenges((prev) => ({ ...prev, [challenge.id]: true }));
    onEarnCoins({
      game: "Larivaar Padchhed & Arth",
      delta: totalEarned,
      reason: `Completed ${challenge.angCitation} (${padchhedScore}% Padchhed accuracy)`,
      incrementStreak: true,
      unlockBadge: "larivaar-khoji",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header & Pangti Selector */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#121C15] border border-[#C59B27]/45 text-[#FAF6EE] shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#C59B27]/25">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-[11px] uppercase tracking-[0.22em] text-[#E5C158] font-semibold px-2.5 py-0.5 rounded bg-[#1B2A20] border border-[#C59B27]/40">
                SANTHIYA &amp; EXEGESIS • UP TO +15 COINS
              </span>
              <span className="text-xs text-[#F3ECE0]/70">{challenge.angCitation}</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#FAF6EE]">
              Larivaar Padchhed &amp; Gurbani Arth
            </h3>
            <p className="text-sm text-[#F3ECE0]/85 mt-1 max-w-2xl">
              Step into the traditional <em>Santhiya</em> classroom: first split the unbroken{" "}
              <strong>Larivaar</strong> manuscript line into accurate <strong>Padchhed</strong>{" "}
              words (Mode A), then unlock its philosophical <strong>Arth</strong> and vocabulary
              (Mode B).
            </p>
          </div>

          {/* Folio Switcher */}
          <div className="flex flex-wrap gap-2">
            {LARIVAAR_CHALLENGES.map((item, idx) => {
              const active = idx === challengeIdx;
              const done = Boolean(completedChallenges[item.id]);
              return (
                <button
                  key={item.id}
                  onClick={() => resetForChallenge(idx)}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 ${
                    active
                      ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#171917] border-[#E5C158]"
                      : "bg-[#1B2A20] text-[#FAF6EE] border-[#C59B27]/35 hover:border-[#C59B27]"
                  }`}
                >
                  <span lang="pa" className="font-gurmukhi text-sm font-bold">
                    {item.numeral}
                  </span>
                  <span>Ang {item.angCitation.split(" ")[1]}</span>
                  {done && <span className="text-[10px]">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Continuous Larivaar Manuscript Banner */}
        <div className="mt-6 p-5 rounded-xl bg-[#1B2A20] border border-[#C59B27]/40 text-center overflow-hidden">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#E5C158] font-semibold mb-2">
            Original Unbroken Larivaar Script ({challenge.author} • {challenge.raag})
          </p>
          <div
            lang="pa"
            className="flex flex-wrap justify-center gap-y-2 px-4 font-gurmukhi text-2xl sm:text-3xl md:text-4xl text-[#FAF6EE] tracking-wide leading-relaxed"
          >
            {allClusters.map((c, i) => (
              <span key={i} className=" inline-block">
                {c}
              </span>
            ))}
          </div>
          <p className="text-xs text-[#F3ECE0]/75 italic mt-2">{challenge.transliteration}</p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={() => setActiveSubMode("padchhed")}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-[0.16em] transition ${
              activeSubMode === "padchhed"
                ? "bg-[#E5C158] text-[#171917] shadow-sm"
                : "bg-[#1B2A20] text-[#F3ECE0] border border-[#C59B27]/35 hover:border-[#C59B27]"
            }`}
          >
            ੧ · Mode A: Larivaar Word Splitting {padchhedVerified ? `(${padchhedScore}%)` : ""}
          </button>
          <button
            onClick={() => setActiveSubMode("arth")}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-[0.16em] transition ${
              activeSubMode === "arth"
                ? "bg-[#E5C158] text-[#171917] shadow-sm"
                : "bg-[#1B2A20] text-[#F3ECE0] border border-[#C59B27]/35 hover:border-[#C59B27]"
            }`}
          >
            ੨ · Mode B: Arth &amp; Vocabulary Contemplation
          </button>
        </div>
      </div>

      {/* MODE A: LARIVAAR WORD SPLITTING */}
      {activeSubMode === "padchhed" && (
        <div className="p-6 md:p-8 rounded-2xl bg-[#F3ECE0] border border-[#C59B27]/50 text-[#171917] shadow-parchment space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#C59B27]/30 pb-4">
            <div>
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#D97706] font-semibold">
                Interactive Manuscript Splitter
              </span>
              <h4 className="text-xl font-serif font-bold text-[#171917] mt-0.5">
                Click Between Gurmukhi Aksharas to Place Word Breaks ({userSplits.length} /{" "}
                {trueSplits.length} Breaks)
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={giveHintSplit}
                disabled={padchhedVerified}
                className="px-3.5 py-2 rounded-lg border border-[#C59B27] bg-[#FAF6EE] text-xs font-semibold text-[#1B2A20] hover:bg-[#C59B27]/20 disabled:opacity-40 transition"
              >
                Reveal 1 Word Boundary
              </button>
              <button
                type="button"
                onClick={() => setUserSplits([])}
                disabled={padchhedVerified || userSplits.length === 0}
                className="px-3.5 py-2 rounded-lg border border-[#C59B27]/50 bg-[#FAF6EE] text-xs font-semibold text-[#4A554E] hover:text-[#171917] disabled:opacity-40 transition"
              >
                Clear Splits
              </button>
            </div>
          </div>

          {/* Interactive Akshara Cluster Ribbon */}
          <div className="p-6 rounded-2xl bg-[#1B2A20] border-2 border-[#C59B27]/60 text-[#FAF6EE] overflow-hidden">
            <p className="text-xs text-[#E5C158] mb-4 text-center">
              Tap the vertical slot between any two Gurmukhi letters to toggle a Padchhed space:
            </p>
            <div
              lang="pa"
              className="flex flex-wrap items-center justify-center gap-y-3 px-4 select-none py-2"
            >
              {allClusters.map((cluster, idx) => {
                const isLast = idx === allClusters.length - 1;
                const isSplitActive = userSplits.includes(idx);
                const isTrueSplit = trueSplits.includes(idx);

                let slotStyle =
                  "w-3.5 sm:w-4 h-12 mx-0.5 rounded flex items-center justify-center transition-all cursor-pointer ";
                if (padchhedVerified) {
                  if (isSplitActive && isTrueSplit) {
                    slotStyle += "bg-emerald-500/30 border border-emerald-400 text-emerald-300";
                  } else if (isSplitActive && !isTrueSplit) {
                    slotStyle += "bg-red-500/30 border border-red-400 text-red-300";
                  } else if (!isSplitActive && isTrueSplit) {
                    slotStyle += "bg-amber-500/30 border border-dashed border-amber-300 text-amber-200";
                  } else {
                    slotStyle += "opacity-25";
                  }
                } else if (isSplitActive) {
                  slotStyle +=
                    "bg-[#D97706] text-[#171917] w-5 sm:w-6 shadow-[0_0_12px_rgba(217,119,6,0.6)] font-bold";
                } else {
                  slotStyle +=
                    "bg-[#FAF6EE]/5 hover:bg-[#E5C158]/35 border border-transparent hover:border-[#E5C158]/60 text-[#E5C158]/40 hover:text-[#E5C158]";
                }

                return (
                  <React.Fragment key={idx}>
                    <span className="font-gurmukhi text-2xl sm:text-3xl md:text-4xl px-1 py-1.5 rounded bg-[#121C15]/90 border border-[#C59B27]/25 text-[#FAF6EE]">
                      {cluster}
                    </span>
                    {!isLast && (
                      <button
                        type="button"
                        aria-label={`Toggle split after ${cluster}`}
                        onClick={() => toggleSplit(idx)}
                        disabled={padchhedVerified}
                        className={slotStyle}
                        title={
                          isSplitActive ? "Click to remove word break" : "Click to split word here"
                        }
                      >
                        {isSplitActive ? "│" : "·"}
                      </button>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Live Padchhed Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#FAF6EE] border border-[#C59B27]/40">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#4A554E] font-semibold mb-2">
                Your Current Padchhed Words ({userWordsPreview.length} words)
              </p>
              <div lang="pa" className="flex flex-wrap gap-2">
                {userWordsPreview.map((w, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-lg bg-[#1B2A20] text-[#E5C158] font-gurmukhi text-lg border border-[#C59B27]/40"
                  >
                    {w}
                  </span>
                ))}
              </div>
            </div>

            {padchhedVerified ? (
              <div className="p-4 rounded-xl bg-[#1B2A20] text-[#FAF6EE] border border-[#C59B27]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-[#E5C158] font-semibold">
                    Canonical Padchhed ({challenge.words.length} words)
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-[#D97706] text-[#171917] text-xs font-bold">
                    Accuracy: {padchhedScore}%
                  </span>
                </div>
                <div lang="pa" className="flex flex-wrap gap-2">
                  {challenge.words.map((w, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-lg bg-[#121C15] text-[#FAF6EE] font-gurmukhi text-lg border border-[#C59B27]/45"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#FAF6EE] border border-[#C59B27]/40 flex flex-col justify-between">
                <p className="text-xs text-[#4A554E] leading-relaxed">
                  This Pangti contains <strong>{challenge.words.length} Padchhed words</strong> (so
                  there are <strong>{trueSplits.length} word boundaries</strong>). Once you have
                  placed your splits, verify your Padchhed below.
                </p>
                <button
                  type="button"
                  onClick={verifyPadchhed}
                  className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#171917] font-semibold text-xs uppercase tracking-wider hover:brightness-105 transition"
                >
                  Verify Padchhed &amp; Continue to Mode B →
                </button>
              </div>
            )}
          </div>

          {padchhedVerified && (
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#C59B27]/30">
              <p className="text-xs text-[#1B2A20] font-medium">
                Padchhed verified at <strong>{padchhedScore}% accuracy</strong>. Proceed to{" "}
                <strong>Mode B (Arth &amp; Vocabulary)</strong> to complete the contemplation and
                claim up to +15 Knowledge Coins.
              </p>
              <button
                type="button"
                onClick={() => setActiveSubMode("arth")}
                className="px-5 py-2.5 rounded-xl bg-[#1B2A20] text-[#E5C158] border border-[#C59B27] text-xs font-semibold uppercase tracking-wider hover:bg-[#D97706] hover:text-[#171917] transition"
              >
                Open Mode B: Arth &amp; Contemplation →
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODE B: ARTH INTERPRETATION & SHABAD-ARTH VOCABULARY MATCH */}
      {activeSubMode === "arth" && (
        <div className="p-6 md:p-8 rounded-2xl bg-[#F3ECE0] border border-[#C59B27]/50 text-[#171917] shadow-parchment space-y-8">
          {/* 1. Philosophical Interpretation Question */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D97706]">
                Part I · Gurmat Veechar (Philosophical Interpretation)
              </span>
              <span className="h-[1px] flex-1 bg-[#C59B27]/35" />
            </div>
            <h4 className="text-lg md:text-xl font-serif font-bold text-[#171917]">
              {challenge.arthQuestion}
            </h4>

            <div className="space-y-3">
              {challenge.arthOptions.map((opt) => {
                const isSelected = selectedArthOption === opt.id;
                let cardClass =
                  "w-full text-left p-4 rounded-xl border transition-all text-sm leading-relaxed ";
                if (isSelected) {
                  cardClass += opt.isCorrect
                    ? "bg-[#1B2A20] text-[#FAF6EE] border-emerald-400 shadow-md"
                    : "bg-[#1B2A20] text-[#FAF6EE] border-[#D97706] shadow-md";
                } else {
                  cardClass +=
                    "bg-[#FAF6EE] text-[#171917] border-[#C59B27]/40 hover:border-[#D97706]";
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedArthOption(opt.id)}
                    className={cardClass}
                  >
                    <div className="flex items-start gap-3">
                      <span className="px-2.5 py-0.5 rounded bg-[#C59B27]/20 border border-[#C59B27]/40 text-xs font-bold uppercase">
                        {opt.id}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium">{opt.text}</p>
                        {isSelected && (
                          <p
                            className={`mt-2 text-xs pt-2 border-t border-[#C59B27]/30 ${
                              opt.isCorrect ? "text-emerald-300" : "text-[#E5C158]"
                            }`}
                          >
                            {opt.feedback}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Gurbani Vocabulary Matching */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D97706]">
                Part II · Shabad-Arth Vocabulary Match ({Object.keys(matchedVocab).length} /{" "}
                {challenge.vocabPairs.length} Matched)
              </span>
              <span className="h-[1px] flex-1 bg-[#C59B27]/35" />
            </div>
            <p className="text-xs text-[#4A554E]">
              Click a Gurmukhi term on the left, then click its contextual meaning on the right:
            </p>

            {vocabFeedback && (
              <p className="text-xs font-semibold text-[#1B2A20] bg-[#FAF6EE] px-3.5 py-2 rounded-lg border border-[#C59B27]/40">
                {vocabFeedback}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2.5">
                {challenge.vocabPairs.map((pair) => {
                  const matched = Boolean(matchedVocab[pair.gurmukhi]);
                  const active = selectedVocabTerm === pair.gurmukhi;
                  return (
                    <button
                      key={pair.gurmukhi}
                      type="button"
                      disabled={matched}
                      onClick={() => setSelectedVocabTerm(pair.gurmukhi)}
                      className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition ${
                        matched
                          ? "bg-[#1B2A20]/90 text-[#E5C158] border-emerald-500/50 opacity-80"
                          : active
                          ? "bg-[#1B2A20] text-[#FAF6EE] border-[#D97706] ring-2 ring-[#D97706]/40"
                          : "bg-[#FAF6EE] text-[#171917] border-[#C59B27]/40 hover:border-[#C59B27]"
                      }`}
                    >
                      <div>
                        <span lang="pa" className="font-gurmukhi text-xl font-bold block">
                          {pair.gurmukhi}
                        </span>
                        <span className="text-xs opacity-75 italic">{pair.translit}</span>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        {matched ? "Matched ✓" : active ? "Selected →" : "Select"}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2.5">
                {shuffledMeanings.map((pair) => {
                  const isAlreadyUsed = Object.values(matchedVocab).includes(pair.meaning);
                  return (
                    <button
                      key={pair.meaning}
                      type="button"
                      disabled={isAlreadyUsed}
                      onClick={() => handleVocabMeaningClick(pair.meaning)}
                      className={`w-full p-3.5 rounded-xl border text-left text-sm transition ${
                        isAlreadyUsed
                          ? "bg-[#1B2A20]/80 text-[#F3ECE0]/70 border-emerald-500/40"
                          : "bg-[#FAF6EE] text-[#171917] border-[#C59B27]/40 hover:border-[#D97706] hover:bg-[#1B2A20] hover:text-[#FAF6EE]"
                      }`}
                    >
                      <p className="font-medium">{pair.meaning}</p>
                      {isAlreadyUsed && (
                        <span className="text-[11px] text-emerald-300 font-semibold block mt-1">
                          Paired with {pair.gurmukhi} ({pair.translit})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Completion & Philosophical Commentary Reveal */}
          <div className="pt-4 border-t border-[#C59B27]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-[#4A554E]">
              {!padchhedVerified && (
                <span className="text-[#D97706] font-semibold">
                  Tip: Complete Mode A (Verify Padchhed) first to unlock the full +15 Coins reward.
                </span>
              )}
              {padchhedVerified && !canClaimReward && (
                <span>
                  Answer Part I and match all 4 vocabulary terms in Part II to claim your Knowledge
                  Coins.
                </span>
              )}
              {canClaimReward && !alreadyClaimed && (
                <span className="text-[#1B2A20] font-semibold">
                  Both modes complete! Claim your Knowledge Coins &amp; unlock the full exegesis.
                </span>
              )}
              {alreadyClaimed && (
                <span className="text-emerald-800 font-semibold">
                  ✓ Knowledge Coins claimed for this Pangti! Explore another folio above.
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={!canClaimReward || alreadyClaimed}
              onClick={handleClaimChallengeReward}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#171917] font-semibold text-xs uppercase tracking-wider shadow-sm hover:brightness-105 disabled:opacity-40 transition"
            >
              {alreadyClaimed
                ? "Coins Awarded ✓"
                : "Complete Santhiya & Claim Up to +15 Coins"}
            </button>
          </div>

          {(canClaimReward || alreadyClaimed) && (
            <div className="p-6 rounded-2xl bg-[#1B2A20] text-[#FAF6EE] border border-[#C59B27] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-[#E5C158] font-semibold">
                  Complete Translation &amp; Santhiya Commentary
                </span>
                <span className="text-xs text-[#F3ECE0]/75">{challenge.angCitation}</span>
              </div>
              <p lang="pa" className="font-gurmukhi text-2xl text-[#E5C158]">
                {challenge.words.join(" ")}
              </p>
              <p className="text-base font-serif italic text-[#FAF6EE]">
                &ldquo;{challenge.translation}&rdquo;
              </p>
              <p className="text-sm text-[#F3ECE0]/90 leading-relaxed pt-2 border-t border-[#C59B27]/25">
                {challenge.philosophicalCommentary}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
