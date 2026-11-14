"use client";

import React, { useState, useEffect, useRef } from "react";
import type { BadgeId } from "@/lib/games-economy";

type Steed = {
  id: string;
  numeral: string;
  name: string;
  gurmukhi: string;
  coatColor: string;
  accentColor: string;
  speed: number;
  stamina: number;
  burst: number;
  lore: string;
};

const STEEDS: Steed[] = [
  {
    id: "dilbagh-neeli",
    numeral: "੧",
    name: "Dilbagh (Neeli-Ki-Shan)",
    gurmukhi: "ਦਿਲਬਾਗ਼ · ਨੀਲੀ ਦੀ ਸ਼ਾਨ",
    coatColor: "#3B82F6",
    accentColor: "#E5C158",
    speed: 93,
    stamina: 90,
    burst: 92,
    lore: "Inspired by Guru Gobind Singh Ji's famed blue-roan charger Dilbagh (Neeli), celebrated for unmatched grace and discipline across the Shivalik foothills.",
  },
  {
    id: "chardi-kala-tez",
    numeral: "੨",
    name: "Chardi Kala Tez",
    gurmukhi: "ਚੜ੍ਹਦੀ ਕਲਾ ਤੇਜ਼",
    coatColor: "#D97706",
    accentColor: "#FDE68A",
    speed: 96,
    stamina: 84,
    burst: 89,
    lore: "A lightning-fast bay steed from the Sutlej plains, trained for explosive early acceleration in Hola Mahalla Neza-Bazi (tent-pegging) runs.",
  },
  {
    id: "anandpur-surma",
    numeral: "੩",
    name: "Anandpur Surma",
    gurmukhi: "ਅਨੰਦਪੁਰ ਸੂਰਮਾ",
    coatColor: "#10B981",
    accentColor: "#E5C158",
    speed: 88,
    stamina: 96,
    burst: 90,
    lore: "Conditioned near Qila Lohgarh and Charan Ganga, renowned for tireless stamina that surges ahead in the final 200 meters.",
  },
  {
    id: "sandhawalia-baaz",
    numeral: "੪",
    name: "Sandhawalia Baaz",
    gurmukhi: "ਸੰਧਾਵਾਲੀਆ ਬਾਜ਼",
    coatColor: "#A855F7",
    accentColor: "#F59E0B",
    speed: 91,
    stamina: 88,
    burst: 95,
    lore: "Inspired by the swift cavalry chargers of the Majha Misls, possessing a fierce late-stage sprint when the Ranjit Nagara sounds.",
  },
];

type TriviaItem = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

const HOLA_MAHALLA_TRIVIA: TriviaItem[] = [
  {
    id: "t1",
    question:
      "In what year and at which historic city did Guru Gobind Singh Ji institute the martial festival of Hola Mahalla?",
    options: [
      "1701 CE at Sri Anandpur Sahib",
      "1604 CE at Lahore",
      "1799 CE at Multan",
    ],
    correctIndex: 0,
    explanation:
      "Guru Gobind Singh Ji established Hola Mahalla at Sri Anandpur Sahib in Chet 1701 CE on the day following Holi, transforming passive celebration into martial readiness, mock battles, Kirtan, and poetry.",
  },
  {
    id: "t2",
    question:
      "What is the traditional Sikh equestrian discipline where a galloping rider uses a lance (Neza) to pick up a ground peg at full speed?",
    options: ["Gatka", "Neza Bazi (Tent-Pegging)", "Kalaripayattu"],
    correctIndex: 1,
    explanation:
      "Neza Bazi (tent-pegging) is a signature equestrian display during Hola Mahalla at Charan Ganga Stadium in Anandpur Sahib.",
  },
  {
    id: "t3",
    question:
      "What was the revered name of Guru Gobind Singh Ji's famous blue-grey steed?",
    options: ["Dilbagh (also lovingly called Neeli)", "Chetak", "Bucephalus"],
    correctIndex: 0,
    explanation:
      "Guru Gobind Singh Ji's steed was named Dilbagh ('Garden of the Heart'), and because of his distinctive blue-roan coat, Sikhs affectionately called him Neeli.",
  },
  {
    id: "t4",
    question:
      "In Sikh tradition, caring for horses and animals with fresh grain and water is referred to as:",
    options: ["Dana-Pani & Astabal Seva", "Karah Parshad", "Daswandh"],
    correctIndex: 0,
    explanation:
      "At historical Gurdwara stables (Astabal), Sikhs perform Dana-Pani Seva—providing grain, fodder, and grooming for the Guru's horses.",
  },
];

export function HolaMahallaGame({
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
  const [selectedSteedId, setSelectedSteedId] = useState<string>(STEEDS[0].id);
  const [triviaIdx, setTriviaIdx] = useState(0);
  const [selectedTriviaOption, setSelectedTriviaOption] = useState<number | null>(null);
  const [triviaAnswered, setTriviaAnswered] = useState(false);
  const [boostUnlocked, setBoostUnlocked] = useState(false);

  const [raceState, setRaceState] = useState<"setup" | "racing" | "finished">("setup");
  const [positions, setPositions] = useState<Record<string, number>>({
    "dilbagh-neeli": 0,
    "chardi-kala-tez": 0,
    "anandpur-surma": 0,
    "sandhawalia-baaz": 0,
  });
  const [finishOrder, setFinishOrder] = useState<string[]>([]);
  const [commentary, setCommentary] = useState<string>(
    "Pledge your support to a steed and answer the Hola Mahalla trivia question to grant a Chardi Kala speed boost!"
  );

  const rafRef = useRef<number | null>(null);

  const currentTrivia = HOLA_MAHALLA_TRIVIA[triviaIdx % HOLA_MAHALLA_TRIVIA.length];
  const chosenSteed = STEEDS.find((s) => s.id === selectedSteedId) || STEEDS[0];

  const handleTriviaSelect = (idx: number) => {
    if (triviaAnswered || raceState === "racing") return;
    setSelectedTriviaOption(idx);
    setTriviaAnswered(true);
    const isCorrect = idx === currentTrivia.correctIndex;
    setBoostUnlocked(isCorrect);
    if (isCorrect) {
      setCommentary(
        `Bole So Nihal! Trivia answered correctly—${chosenSteed.name} receives a +8% Chardi Kala surge for the sprint!`
      );
    } else {
      setCommentary(
        `Trivia complete! ${chosenSteed.name} is ready at the starting line of Charan Ganga Arena.`
      );
    }
  };

  const startRace = () => {
    if (raceState === "racing") return;
    setRaceState("racing");
    setFinishOrder([]);
    const currentPos: Record<string, number> = {
      "dilbagh-neeli": 0,
      "chardi-kala-tez": 0,
      "anandpur-surma": 0,
      "sandhawalia-baaz": 0,
    };
    setPositions(currentPos);
    setCommentary("🥁 The Ranjit Nagara thunders! All four steeds burst across the Anandpur turf!");

    const finished: string[] = [];
    let frameCount = 0;

    const step = () => {
      frameCount++;
      let allDone = true;

      for (const steed of STEEDS) {
        if (currentPos[steed.id] >= 100) continue;
        allDone = false;

        const progress = currentPos[steed.id];
        // Base velocity from stats
        const speedFactor = steed.speed / 95;
        const staminaFactor = progress > 55 ? steed.stamina / 92 : 1;
        const burstFactor = progress > 75 ? steed.burst / 90 : 1;
        const triviaBonus =
          steed.id === selectedSteedId && boostUnlocked ? 1.085 : 1.0;

        const randomStride = 0.28 + Math.random() * 0.42;
        const delta =
          randomStride * speedFactor * staminaFactor * burstFactor * triviaBonus;

        currentPos[steed.id] = Math.min(100, progress + delta);

        if (currentPos[steed.id] >= 100 && !finished.includes(steed.id)) {
          finished.push(steed.id);
        }
      }

      setPositions({ ...currentPos });

      // Live mid-race commentary updates
      if (frameCount % 35 === 0 && finished.length === 0) {
        const leader = [...STEEDS].sort(
          (a, b) => currentPos[b.id] - currentPos[a.id]
        )[0];
        const leaderDist = Math.round((currentPos[leader.id] / 100) * 500);
        setCommentary(
          `🐎 At ${leaderDist}m: ${leader.name} (${leader.gurmukhi}) leads the charge as golden dust rises!`
        );
      }

      if (!allDone) {
        rafRef.current = window.requestAnimationFrame(step);
      } else {
        setFinishOrder([...finished]);
        setRaceState("finished");
        concludeRace(finished);
      }
    };

    rafRef.current = window.requestAnimationFrame(step);
  };

  const concludeRace = (order: string[]) => {
    const placement = order.indexOf(selectedSteedId) + 1;
    const steedObj = STEEDS.find((s) => s.id === selectedSteedId) || STEEDS[0];

    if (placement === 1) {
      setCommentary(
        `🏆 1st Place! ${steedObj.name} crosses the Nishan Sahib finish banner first! You earned +10 Knowledge Coins!`
      );
      onEarnCoins({
        game: "Hola Mahalla Ghurdaur",
        delta: 10,
        reason: `1st Place with ${steedObj.name} at Hola Mahalla Ghurdaur`,
        incrementStreak: true,
        unlockBadge: "anandpur-cavalier",
      });
    } else if (placement === 2) {
      setCommentary(
        `🥈 2nd Place! ${steedObj.name} finishes a close second! You earned +3 Knowledge Coins!`
      );
      onEarnCoins({
        game: "Hola Mahalla Ghurdaur",
        delta: 3,
        reason: `2nd Place with ${steedObj.name} at Hola Mahalla Ghurdaur`,
        incrementStreak: true,
      });
    } else {
      setCommentary(
        `🌾 ${steedObj.name} finished ${
          placement === 3 ? "3rd" : "4th"
        }. You contributed -1 Coin toward Dana-Pani (fresh grain & stable Seva) to prepare for the next run!`
      );
      onEarnCoins({
        game: "Hola Mahalla Ghurdaur",
        delta: -1,
        reason: `Dana-Pani (horse feed & stable Seva) for ${steedObj.name}`,
      });
    }
  };

  const prepareNextSprint = () => {
    setRaceState("setup");
    setTriviaIdx((prev) => prev + 1);
    setSelectedTriviaOption(null);
    setTriviaAnswered(false);
    setBoostUnlocked(false);
    setPositions({
      "dilbagh-neeli": 0,
      "chardi-kala-tez": 0,
      "anandpur-surma": 0,
      "sandhawalia-baaz": 0,
    });
    setFinishOrder([]);
    setCommentary(
      "Select your steed and answer the new Hola Mahalla trivia question for a Chardi Kala speed boost!"
    );
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Header & Non-Gambling Framing */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#121C15] border border-[#C59B27]/45 text-[#FAF6EE] shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-[11px] uppercase tracking-[0.22em] text-[#E5C158] font-semibold px-2.5 py-0.5 rounded bg-[#1B2A20] border border-[#C59B27]/40">
                ANANDPUR SAHIB EQUESTRIAN DISPLAY • 1ST: +10 • 2ND: +3 • 3RD/4TH: -1 DANA-PANI
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#FAF6EE]">
              Hola Mahalla Ghurdaur (Khalsa Equestrian Sprint)
            </h3>
            <p className="text-sm text-[#F3ECE0]/85 mt-1 max-w-2xl">
              Inspired by the martial equestrian traditions instituted by Guru Gobind Singh Ji at
              Sri Anandpur Sahib (1701 CE). Pledge your support to a steed, answer the history
              question for a speed boost, and sound the Ranjit Nagara!
            </p>
          </div>

          <div className="shrink-0 p-3.5 rounded-xl bg-[#1B2A20] border border-[#C59B27]/40 text-xs space-y-1">
            <div className="text-[#E5C158] font-bold uppercase tracking-wider">
              Seva &amp; Sponsorship Rewards
            </div>
            <div className="text-[#F3ECE0]/90">🥇 1st Place: +10 Knowledge Coins</div>
            <div className="text-[#F3ECE0]/90">🥈 2nd Place: +3 Knowledge Coins</div>
            <div className="text-[#F3ECE0]/75">🌾 3rd/4th: -1 Coin (Dana-Pani Feed Seva)</div>
          </div>
        </div>
      </div>

      {/* Step 1: Steed Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STEEDS.map((steed) => {
          const isSelected = steed.id === selectedSteedId;
          return (
            <button
              key={steed.id}
              type="button"
              disabled={raceState === "racing"}
              onClick={() => setSelectedSteedId(steed.id)}
              className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? "bg-[#1B2A20] text-[#FAF6EE] border-2 border-[#E5C158] shadow-xl"
                  : "bg-[#F3ECE0] text-[#171917] border-[#C59B27]/40 hover:border-[#D97706]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    lang="pa"
                    className={`font-gurmukhi text-sm font-bold px-2.5 py-0.5 rounded border ${
                      isSelected
                        ? "bg-[#121C15] text-[#E5C158] border-[#C59B27]/50"
                        : "bg-[#FAF6EE] text-[#1B2A20] border-[#C59B27]/40"
                    }`}
                  >
                    {steed.numeral}
                  </span>
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-white/40"
                    style={{ backgroundColor: steed.coatColor }}
                  />
                </div>
                <p
                  lang="pa"
                  className={`font-gurmukhi text-sm font-semibold ${
                    isSelected ? "text-[#E5C158]" : "text-[#D97706]"
                  }`}
                >
                  {steed.gurmukhi}
                </p>
                <h4 className="font-serif text-lg font-bold mt-0.5">{steed.name}</h4>
                <p
                  className={`text-xs mt-2 leading-relaxed ${
                    isSelected ? "text-[#F3ECE0]/85" : "text-[#4A554E]"
                  }`}
                >
                  {steed.lore}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#C59B27]/30 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span>Speed</span>
                  <span className="font-bold">{steed.speed}/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Stamina</span>
                  <span className="font-bold">{steed.stamina}/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Final Surge</span>
                  <span className="font-bold">{steed.burst}/100</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Step 2: Pre-Race Trivia Boost Card */}
      <div className="p-6 rounded-2xl bg-[#F3ECE0] border border-[#C59B27]/50 text-[#171917] shadow-parchment">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#C59B27]/30">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#D97706] font-bold">
              Pre-Race Knowledge Boost (Optional +8% Speed Surge for {chosenSteed.name})
            </span>
            <h4 className="text-lg font-serif font-bold text-[#171917] mt-0.5">
              {currentTrivia.question}
            </h4>
          </div>
          {boostUnlocked && (
            <span className="shrink-0 px-3 py-1 rounded-full bg-emerald-700 text-[#FAF6EE] text-xs font-bold">
              ⚡ +8% Chardi Kala Boost Active!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          {currentTrivia.options.map((opt, idx) => {
            const isSelected = selectedTriviaOption === idx;
            const isCorrect = idx === currentTrivia.correctIndex;
            let btnStyle =
              "p-3.5 rounded-xl border text-left text-xs sm:text-sm font-semibold transition ";
            if (triviaAnswered) {
              if (isCorrect) {
                btnStyle += "bg-[#1B2A20] text-emerald-300 border-emerald-400";
              } else if (isSelected) {
                btnStyle += "bg-[#1B2A20] text-amber-300 border-amber-400";
              } else {
                btnStyle += "bg-[#FAF6EE]/60 text-[#4A554E] border-[#C59B27]/25 opacity-65";
              }
            } else {
              btnStyle +=
                "bg-[#FAF6EE] text-[#171917] border-[#C59B27]/45 hover:border-[#D97706] hover:bg-[#1B2A20] hover:text-[#FAF6EE]";
            }

            return (
              <button
                key={opt}
                type="button"
                disabled={triviaAnswered || raceState === "racing"}
                onClick={() => handleTriviaSelect(idx)}
                className={btnStyle}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {triviaAnswered && (
          <p className="mt-3 text-xs text-[#1B2A20] bg-[#FAF6EE] p-3 rounded-xl border border-[#C59B27]/35">
            <strong>Historical Note:</strong> {currentTrivia.explanation}
          </p>
        )}
      </div>

      {/* Step 3: 2D Horizontal Race Track Arena */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#1B2A20] border-2 border-[#C59B27] text-[#FAF6EE] shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#E5C158] font-semibold">
              Charan Ganga Equestrian Track • 500m Sprint
            </span>
            <p className="text-sm text-[#FAF6EE] font-medium mt-1">{commentary}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {raceState === "finished" && (
              <button
                type="button"
                onClick={prepareNextSprint}
                className="px-4 py-2.5 rounded-xl border border-[#C59B27] bg-[#121C15] text-[#E5C158] text-xs font-semibold uppercase tracking-wider hover:bg-[#263B2D] transition"
              >
                Next Trivia &amp; Reset Track
              </button>
            )}
            <button
              type="button"
              disabled={raceState === "racing"}
              onClick={startRace}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#171917] font-bold text-xs uppercase tracking-wider shadow-lg hover:brightness-105 disabled:opacity-50 transition"
            >
              {raceState === "racing"
                ? "Sprint in Progress…"
                : raceState === "finished"
                ? "Run Another Sprint 🐎"
                : `Sound Nagara & Start Sprint`}
            </button>
          </div>
        </div>

        {/* Distance Markers */}
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-[#E5C158]/70 px-4">
          <span>Start (0m)</span>
          <span>125m</span>
          <span>250m</span>
          <span>375m</span>
          <span>Nishan Sahib Finish (500m)</span>
        </div>

        {/* 4 Turf Lanes */}
        <div className="space-y-3 bg-[#121C15] p-4 rounded-2xl border border-[#C59B27]/40 relative overflow-hidden">
          {/* Finish Line Vertical Banner */}
          <div className="absolute right-8 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#D97706] via-[#E5C158] to-[#D97706] opacity-75 pointer-events-none" />

          {STEEDS.map((steed) => {
            const pos = positions[steed.id] || 0;
            const isPlayerSteed = steed.id === selectedSteedId;
            const rankIndex = finishOrder.indexOf(steed.id);

            return (
              <div
                key={steed.id}
                className={`relative h-16 rounded-xl border px-3 flex items-center overflow-hidden ${
                  isPlayerSteed
                    ? "bg-[#1B2A20] border-[#E5C158]"
                    : "bg-[#17241B] border-[#C59B27]/25"
                }`}
              >
                {/* Lane Label */}
                <div className="z-10 flex items-center gap-2 pointer-events-none">
                  <span
                    lang="pa"
                    className="font-gurmukhi text-xs font-bold px-2 py-0.5 rounded bg-[#121C15] text-[#E5C158] border border-[#C59B27]/40"
                  >
                    {steed.numeral}
                  </span>
                  <span className="text-xs font-semibold text-[#FAF6EE]/80">
                    {steed.name}
                    {isPlayerSteed && (
                      <span className="ml-2 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#D97706] text-[#171917] font-bold">
                        Your Steed
                      </span>
                    )}
                  </span>
                </div>

                {/* Animated Dust & Galloping Steed */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 transition-none flex items-center gap-1"
                  style={{
                    left: `calc(${Math.min(88, pos * 0.86)}% + 12px)`,
                  }}
                >
                  {raceState === "racing" && pos > 2 && pos < 100 && (
                    <div className="flex items-center gap-0.5 mr-1 opacity-75">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E5C158]/60 animate-ping" />
                      <span className="w-2 h-2 rounded-full bg-[#C59B27]/50" />
                    </div>
                  )}
                  <div
                    className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 shadow-md ${
                      raceState === "racing" && pos < 100 ? "animate-bounce" : ""
                    }`}
                    style={{
                      backgroundColor: "#121C15",
                      borderColor: steed.accentColor,
                    }}
                  >
                    <span className="text-lg leading-none" role="img" aria-label={steed.name}>
                      🐎
                    </span>
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: steed.coatColor }}
                    />
                  </div>
                </div>

                {/* Placement Badge */}
                {rankIndex !== -1 && (
                  <span className="ml-auto z-10 px-2.5 py-1 rounded-lg bg-[#121C15] border border-[#C59B27]/50 text-xs font-bold text-[#E5C158]">
                    #{rankIndex + 1} Place
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
