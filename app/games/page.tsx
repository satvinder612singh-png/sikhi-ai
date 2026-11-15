"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/components/auth-provider";
import {
  useGamesWallet,
  BADGE_CATALOG,
  type BadgeId,
} from "@/lib/games-economy";
import { LarivaarGame } from "@/components/games/larivaar-game";
import { SikhShatranjGame } from "@/components/games/sikh-shatranj-game";
import { HolaMahallaGame } from "@/components/games/hola-mahalla-game";
import { BujhartoSakhiGame } from "@/components/games/bujharto-sakhi-game";
import { SikhiIcon, type SikhiIconName } from "@/components/sikhi-icons";
import { ChitrakariCardHeader, type ChitrakariVariant } from "@/components/chitrakari-card-header";

type GameTabId = "larivaar" | "shatranj" | "hola-mahalla" | "bujharto";

const GAME_TABS: {
  id: GameTabId;
  numeral: string;
  title: string;
  traditionalSubtitle: string;
  gurmukhi: string;
  audience: string;
  rewardTag: string;
  shortDesc: string;
  icon: SikhiIconName;
  artKey: string;
  artVariant: ChitrakariVariant;
}[] = [
  {
    id: "larivaar",
    numeral: "੧",
    title: "Split the Gurbani Words (Larivaar)",
    traditionalSubtitle: "Larivaar Padchhed & Arth",
    gurmukhi: "ਲੜੀਵਾਰ ਪਦਛੇਦ ਅਤੇ ਅਰਥ",
    audience: "Adults & Scholars",
    rewardTag: "Up to +15 Coins",
    shortDesc:
      "Split unbroken Gurmukhi Larivaar verses into Padchhed words and contemplate their philosophical Arth.",
    icon: "scroll",
    artKey: "game-larivaar",
    artVariant: "manuscript",
  },
  {
    id: "shatranj",
    numeral: "੨",
    title: "Sikh Chess (Shatranj)",
    traditionalSubtitle: "Sikh Shatranj · Dhai Phat",
    gurmukhi: "ਸਿੱਖ ਸ਼ਤਰੰਜ · ਢਾਈ ਫੱਟ",
    audience: "Teens & Adults",
    rewardTag: "Win +20 • Draw +5",
    shortDesc:
      "6×6 Khalsa tactical strategy grid featuring Jathedar, Akali Nihang, Ghorchurra Cavalry, and battlefield dispatches.",
    icon: "dhaal",
    artKey: "game-shatranj",
    artVariant: "warrior",
  },
  {
    id: "hola-mahalla",
    numeral: "੩",
    title: "Hola Mahalla Horse Race",
    traditionalSubtitle: "Hola Mahalla Ghurdaur",
    gurmukhi: "ਹੋਲਾ ਮਹੱਲਾ ਘੁੜਦੌੜ",
    audience: "All Ages",
    rewardTag: "1st +10 • 2nd +3",
    shortDesc:
      "Anandpur Sahib equestrian sprint: sponsor a historical steed, answer trivia for a speed boost, and race!",
    icon: "khanda",
    artKey: "game-hola",
    artVariant: "horse",
  },
  {
    id: "bujharto",
    numeral: "੪",
    title: "Sikhi Trivia & Riddles",
    traditionalSubtitle: "Bujharto & Sakhi Quest",
    gurmukhi: "ਬੁਝਾਰਤਾਂ ਅਤੇ ਪੈਂਤੀ ਅੱਖਰ",
    audience: "Children & Families",
    rewardTag: "+5 Coins / Streak",
    shortDesc:
      "Rapid-fire 'Who Am I?' Sikh historical riddles and Gurmukhi Painti Akhar (35 letters) memory matching.",
    icon: "ikonkar",
    artKey: "game-bujharto",
    artVariant: "darbar",
  },
];

function GamesHubContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { wallet, rank, cloudSynced, lastDelta, recordGameOutcome } = useGamesWallet(
    user?.id ?? null
  );

  const initialTabParam = searchParams.get("game") as GameTabId | null;
  const [activeTab, setActiveTab] = useState<GameTabId>(
    initialTabParam && ["larivaar", "shatranj", "hola-mahalla", "bujharto"].includes(initialTabParam)
      ? initialTabParam
      : "larivaar"
  );
  const [showLedger, setShowLedger] = useState(false);
  const [isFounderAdmin, setIsFounderAdmin] = useState(false);

  useEffect(() => {
    const syncAdminFlag = () => {
      try {
        setIsFounderAdmin(
          window.localStorage.getItem("learnsikhi_founder_admin_v1") === "true"
        );
      } catch {
        setIsFounderAdmin(false);
      }
    };
    syncAdminFlag();
    window.addEventListener("storage", syncAdminFlag);
    window.addEventListener("focus", syncAdminFlag);
    return () => {
      window.removeEventListener("storage", syncAdminFlag);
      window.removeEventListener("focus", syncAdminFlag);
    };
  }, []);

  useEffect(() => {
    const param = searchParams.get("game") as GameTabId | null;
    if (param && ["larivaar", "shatranj", "hola-mahalla", "bujharto"].includes(param)) {
      setActiveTab(param);
    }
  }, [searchParams]);

  const handleSelectTab = (tabId: GameTabId) => {
    setActiveTab(tabId);
    router.replace(`/games?game=${tabId}`, { scroll: false });
    setTimeout(
      () =>
        document
          .getElementById("active-game-arena")
          ?.scrollIntoView({ behavior: "smooth", block: "start" }),
      60
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col">
      <Header solid />

      {/* Hero & Global Coin Wallet Header */}
      <section className="relative overflow-hidden border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(212,175,55,0.14),transparent_70%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 space-y-8">
          {/* 12-Column Hero & Wallet Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-3">
              <div className="inline-flex flex-wrap items-center gap-2.5">
                <span
                  lang="pa"
                  className="font-gurmukhi text-sm font-bold px-2.5 py-0.5 rounded bg-[var(--theme-card-darker)] text-[#C59B27] border border-[var(--border-subtle)]"
                >
                  ਅਭਿਆਸ
                </span>
                <span className="text-xs uppercase tracking-[0.25em] text-[#D97706] font-semibold">
                  Phase IV • Interactive Sikhi Abhiyaas &amp; Learning Hub
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[var(--text-primary)] tracking-tight">
                Gurmat Games &amp; <span className="text-[#C59B27]">Knowledge Treasury</span>
              </h1>
              <p className="text-sm sm:text-base text-[var(--theme-text-muted)] leading-relaxed max-w-2xl">
                Engage with authentic Gurbani <em>Santhiya</em>, Khalsa tactical strategy, Hola
                Mahalla equestrian tradition, and Gurmukhi <em>Painti Akhar</em> literacy—designed
                for scholars, teens, and children alike.
              </p>
            </div>

            {/* Global Coin Wallet Dashboard Widget (lg:col-span-5 flush right) */}
            <div className="lg:col-span-5 w-full">
              <div className="w-full p-5 rounded-2xl bg-[var(--theme-card-darker)] text-[var(--text-primary)] border-2 border-[#C59B27] shadow-lg">
                <div className="flex items-center justify-between gap-4 pb-3 border-b border-[var(--border-subtle)]">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#C59B27] font-semibold block">
                      Global Knowledge Treasury
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl font-serif font-bold text-[var(--text-primary)]">
                        {wallet.coins}
                      </span>
                      <span className="text-xs uppercase tracking-wider text-[#C59B27] font-semibold">
                        Knowledge Coins
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--theme-text-muted)] block">
                      Scholar Rank
                    </span>
                    <p className="text-sm font-serif font-bold text-[#C59B27]">{rank.title}</p>
                    <p lang="pa" className="font-gurmukhi text-xs text-[#D97706]">
                      {rank.gurmukhi}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 text-center">
                  <div className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--theme-text-muted)] block">
                      Current Streak
                    </span>
                    <span className="text-sm font-bold text-[#C59B27]">
                      {wallet.streak} 🔥
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                    <span className="text-[10px] uppercase tracking-wider text-[var(--theme-text-muted)] block">
                      Badges
                    </span>
                    <span className="text-sm font-bold text-[var(--text-primary)]">
                      {wallet.unlockedBadges.length} / {Object.keys(BADGE_CATALOG).length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLedger((v) => !v)}
                    className="p-2 rounded-xl bg-[var(--bg-surface)] hover:border-[#C59B27] border border-[var(--border-subtle)] text-center transition"
                  >
                    <span className="text-[10px] uppercase tracking-wider text-[#C59B27] block font-semibold">
                      {showLedger ? "Hide" : "View"}
                    </span>
                    <span className="text-xs font-bold text-[var(--text-primary)]">
                      Badges &amp; Log
                    </span>
                  </button>
                </div>

                {(isFounderAdmin || lastDelta) && (
                  <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--theme-text-muted)]">
                    {isFounderAdmin ? (
                      <span>
                        {user
                          ? cloudSynced
                            ? "✓ Synced to Supabase Account"
                            : "Syncing with Account…"
                          : "Saved in Browser (Sign in to sync)"}
                      </span>
                    ) : (
                      <span />
                    )}
                    {lastDelta && (
                      <span
                        className={`font-bold px-2 py-0.5 rounded ${
                          lastDelta.delta >= 0
                            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300"
                            : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                        }`}
                      >
                        {lastDelta.delta >= 0 ? `+${lastDelta.delta}` : lastDelta.delta} Coins
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Expandable Badges & Activity Drawer */}
          {showLedger && (
            <div className="animate-fade-in-up p-6 rounded-2xl bg-[#121C15] border border-[#C59B27]/50 grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-3">
                <h2 className="text-xs uppercase tracking-[0.2em] text-[#E5C158] font-semibold">
                  Panthic Scholar Badges ({wallet.unlockedBadges.length} /{" "}
                  {Object.keys(BADGE_CATALOG).length} Unlocked)
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.keys(BADGE_CATALOG) as BadgeId[]).map((badgeKey) => {
                    const badge = BADGE_CATALOG[badgeKey];
                    const unlocked = wallet.unlockedBadges.includes(badgeKey);
                    return (
                      <div
                        key={badge.id}
                        className={`p-3.5 rounded-xl border transition ${
                          unlocked
                            ? "bg-[#1B2A20] border-[#E5C158] text-[#FAF6EE]"
                            : "bg-[#0F1712]/70 border-[#C59B27]/20 text-[#F3ECE0]/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-serif font-bold text-[#E5C158]">
                            {badge.title}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#121C15] border border-[#C59B27]/35">
                            {unlocked ? "Unlocked ✓" : "Locked"}
                          </span>
                        </div>
                        <p lang="pa" className="font-gurmukhi text-xs text-[#D97706] mt-0.5">
                          {badge.gurmukhi}
                        </p>
                        <p className="text-xs mt-1 leading-relaxed">{badge.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-5 space-y-3">
                <h2 className="text-xs uppercase tracking-[0.2em] text-[#E5C158] font-semibold">
                  Recent Knowledge Coins Activity
                </h2>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {wallet.recentActivity.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-xl bg-[#1B2A20] border border-[#C59B27]/30 text-xs flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-semibold text-[#FAF6EE]">{act.game}</p>
                        <p className="text-[#F3ECE0]/75 text-[11px]">{act.reason}</p>
                      </div>
                      <span
                        className={`shrink-0 font-bold px-2.5 py-1 rounded ${
                          act.delta >= 0
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        }`}
                      >
                        {act.delta >= 0 ? `+${act.delta}` : act.delta}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4 Equal-Height Game Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            {GAME_TABS.map((tab) => {
              const selected = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelectTab(tab.id)}
                  className={`flex flex-col justify-between h-full p-5 rounded-2xl border text-left hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ${
                    selected
                      ? "bg-[#FAF6EE] text-[#171917] border-2 border-[#E5C158] shadow-[0_10px_30px_rgba(197,155,39,0.28)]"
                      : "bg-[#1B2A20]/90 text-[#FAF6EE] border-[#C59B27]/40 hover:border-[#E5C158]"
                  }`}
                >
                  <div>
                    <div className="mb-3 -mx-1 -mt-1">
                      <ChitrakariCardHeader
                        artKey={tab.artKey}
                        variant={tab.artVariant}
                        title={tab.title}
                        heightClass="h-28"
                        compact
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <SikhiIcon name={tab.icon} size={26} />
                        <span
                          lang="pa"
                          className={`font-gurmukhi text-sm font-bold px-2 py-0.5 rounded border ${
                            selected
                              ? "bg-[#1B2A20] text-[#E5C158] border-[#C59B27]"
                              : "bg-[#121C15] text-[#E5C158] border-[#C59B27]/40"
                          }`}
                        >
                          {tab.numeral}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded whitespace-nowrap ${
                          selected
                            ? "bg-[#D97706]/20 text-[#D97706]"
                            : "bg-[#121C15] text-[#E5C158]"
                        }`}
                      >
                        {tab.rewardTag}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <p
                        lang="pa"
                        className={`font-gurmukhi text-xs font-semibold ${
                          selected ? "text-[#D97706]" : "text-[#E5C158]"
                        }`}
                      >
                        {tab.gurmukhi}
                      </p>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/20 border border-[#C59B27]/35">
                        {tab.traditionalSubtitle}
                      </span>
                    </div>
                    <h2 className="font-serif text-lg font-bold mt-1">{tab.title}</h2>
                    <p
                      className={`text-xs mt-1.5 leading-relaxed ${
                        selected ? "text-[#4A554E]" : "text-[#F3ECE0]/80"
                      }`}
                    >
                      {tab.shortDesc}
                    </p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-[#C59B27]/30 flex items-center justify-between text-[11px] font-semibold">
                    <span>{tab.audience}</span>
                    <span>{selected ? "Active Module ●" : "Launch ->"}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Active Game Workspace */}
      <main
        id="active-game-arena"
        className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 scroll-mt-20"
      >
        <div key={activeTab} className="animate-fade-in-up">
          {activeTab === "larivaar" && <LarivaarGame onEarnCoins={recordGameOutcome} />}
          {activeTab === "shatranj" && <SikhShatranjGame onEarnCoins={recordGameOutcome} />}
          {activeTab === "hola-mahalla" && <HolaMahallaGame onEarnCoins={recordGameOutcome} />}
          {activeTab === "bujharto" && <BujhartoSakhiGame onEarnCoins={recordGameOutcome} />}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function GamesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#1B2A20] text-[#FAF6EE] p-12 text-center font-serif text-xl">
          Loading Learn Sikhi Abhiyaas &amp; Games Hub…
        </div>
      }
    >
      <GamesHubContent />
    </Suspense>
  );
}
