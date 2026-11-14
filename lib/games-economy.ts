"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type BadgeId =
  | "larivaar-khoji"
  | "dhai-phat-strategist"
  | "anandpur-cavalier"
  | "young-khalsa-scholar"
  | "painti-master";

export type BadgeDefinition = {
  id: BadgeId;
  title: string;
  gurmukhi: string;
  description: string;
  category: string;
};

export const BADGE_CATALOG: Record<BadgeId, BadgeDefinition> = {
  "larivaar-khoji": {
    id: "larivaar-khoji",
    title: "Larivaar Khoji",
    gurmukhi: "ਲੜੀਵਾਰ ਖੋਜੀ",
    description: "Completed a Larivaar Padchhed & Arth scriptural contemplation challenge.",
    category: "GurbaniSanthiya",
  },
  "dhai-phat-strategist": {
    id: "dhai-phat-strategist",
    title: "Dhai Phat Strategist",
    gurmukhi: "ਢਾਈ ਫੱਟ ਰਣਨੀਤੀਕਾਰ",
    description: "Commanded the Khalsa ranks to victory in Sikh Shatranj.",
    category: "Khalsa Strategy",
  },
  "anandpur-cavalier": {
    id: "anandpur-cavalier",
    title: "Anandpur Cavalier",
    gurmukhi: "ਅਨੰਦਪੁਰ ਘੋੜਸਵਾਰ",
    description: "Championed a winning steed in the Hola Mahalla Ghurdaur sprint.",
    category: "Hola Mahalla",
  },
  "young-khalsa-scholar": {
    id: "young-khalsa-scholar",
    title: "Young Khalsa Scholar",
    gurmukhi: "ਬਾਲ ਖ਼ਾਲਸਾ ਵਿਦਵਾਨ",
    description: "Solved a streak of historical Sikh riddles (Bujhartan) in Sakhi Quest.",
    category: "Sakhi Quest",
  },
  "painti-master": {
    id: "painti-master",
    title: "Painti Master",
    gurmukhi: "ਪੈਂਤੀ ਅੱਖਰ ਮਾਹਿਰ",
    description: "Mastered the Gurmukhi Painti Akhar memory & literacy challenge.",
    category: "Gurmukhi Literacy",
  },
};

export type WalletActivity = {
  id: string;
  game: string;
  delta: number;
  reason: string;
  timestamp: string;
};

export type GamesWalletState = {
  coins: number;
  streak: number;
  gamesPlayed: number;
  unlockedBadges: BadgeId[];
  recentActivity: WalletActivity[];
  updatedAt: string;
};

const STORAGE_KEY = "learn_sikhi_games_wallet_v1";
export const INITIAL_COINS = 50;

export const DEFAULT_WALLET: GamesWalletState = {
  coins: INITIAL_COINS,
  streak: 0,
  gamesPlayed: 0,
  unlockedBadges: [],
  recentActivity: [
    {
      id: "init-grant",
      game: "Abhiyaas Treasury",
      delta: INITIAL_COINS,
      reason: "Initial Seva & Knowledge Coins grant for new learners",
      timestamp: "Welcome Grant",
    },
  ],
  updatedAt: new Date(0).toISOString(),
};

export type ScholarRank = {
  title: string;
  gurmukhi: string;
  minCoins: number;
  nextRankCoins: number | null;
};

export function getScholarRank(coins: number): ScholarRank {
  if (coins >= 250) {
    return {
      title: "Khalsa Vidwan",
      gurmukhi: "ਖ਼ਾਲਸਾ ਵਿਦਵਾਨ",
      minCoins: 250,
      nextRankCoins: null,
    };
  }
  if (coins >= 150) {
    return {
      title: "Gurbani Khoji",
      gurmukhi: "ਗੁਰਬਾਣੀ ਖੋਜੀ",
      minCoins: 150,
      nextRankCoins: 250,
    };
  }
  if (coins >= 75) {
    return {
      title: "Abhiyaasi Learner",
      gurmukhi: "ਅਭਿਆਸੀ ਸਿੱਖਿਆਰਥੀ",
      minCoins: 75,
      nextRankCoins: 150,
    };
  }
  return {
    title: "Sevak Initiate",
    gurmukhi: "ਸੇਵਕ ਆਰੰਭਕ",
    minCoins: 0,
    nextRankCoins: 75,
  };
}

function readLocalWallet(): GamesWalletState {
  if (typeof window === "undefined") return DEFAULT_WALLET;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = { ...DEFAULT_WALLET, updatedAt: new Date().toISOString() };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as Partial<GamesWalletState>;
    return {
      coins: typeof parsed.coins === "number" ? Math.max(0, parsed.coins) : INITIAL_COINS,
      streak: typeof parsed.streak === "number" ? Math.max(0, parsed.streak) : 0,
      gamesPlayed: typeof parsed.gamesPlayed === "number" ? Math.max(0, parsed.gamesPlayed) : 0,
      unlockedBadges: Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : [],
      recentActivity: Array.isArray(parsed.recentActivity)
        ? parsed.recentActivity.slice(0, 12)
        : DEFAULT_WALLET.recentActivity,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return DEFAULT_WALLET;
  }
}

function writeLocalWallet(next: GamesWalletState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("learn-sikhi-wallet-updated", { detail: next }));
  } catch {
    // Ignore storage quota errors
  }
}

async function syncWalletToSupabase(wallet: GamesWalletState, userId?: string | null) {
  if (!userId) return false;
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  try {
    // 1. Sync to Supabase user_metadata (works immediately on any Supabase project without custom table migrations)
    await supabase.auth.updateUser({
      data: {
        games_wallet: {
          coins: wallet.coins,
          streak: wallet.streak,
          gamesPlayed: wallet.gamesPlayed,
          unlockedBadges: wallet.unlockedBadges,
          updatedAt: wallet.updatedAt,
        },
      },
    });

    // 2. Also attempt upsert to user_game_wallets table if present
    await supabase.from("user_game_wallets").upsert(
      {
        user_id: userId,
        coins: wallet.coins,
        streak: wallet.streak,
        games_played: wallet.gamesPlayed,
        unlocked_badges: wallet.unlockedBadges,
        updated_at: wallet.updatedAt,
      },
      { onConflict: "user_id" }
    );

    return true;
  } catch {
    return false;
  }
}

export function useGamesWallet(userId?: string | null) {
  const [wallet, setWallet] = useState<GamesWalletState>(DEFAULT_WALLET);
  const [hydrated, setHydrated] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(false);
  const [lastDelta, setLastDelta] = useState<{ delta: number; label: string } | null>(null);

  // Hydrate from localStorage and merge with Supabase user_metadata if logged in
  useEffect(() => {
    const local = readLocalWallet();
    setWallet(local);
    setHydrated(true);

    const handleStorageUpdate = (e: Event) => {
      const custom = e as CustomEvent<GamesWalletState>;
      if (custom.detail) {
        setWallet(custom.detail);
      } else {
        setWallet(readLocalWallet());
      }
    };

    window.addEventListener("learn-sikhi-wallet-updated", handleStorageUpdate);
    return () => window.removeEventListener("learn-sikhi-wallet-updated", handleStorageUpdate);
  }, []);

  useEffect(() => {
    if (!hydrated || !userId) {
      setCloudSynced(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const sb = supabase;

    let cancelled = false;

    async function reconcileCloudWallet() {
      try {
        const { data } = await sb.auth.getUser();
        const remote = data?.user?.user_metadata?.games_wallet as
          | Partial<GamesWalletState>
          | undefined;

        const currentLocal = readLocalWallet();

        if (remote && typeof remote.coins === "number") {
          const mergedBadges = Array.from(
            new Set([...(currentLocal.unlockedBadges || []), ...(remote.unlockedBadges || [])])
          ) as BadgeId[];

          const merged: GamesWalletState = {
            ...currentLocal,
            coins: Math.max(currentLocal.coins, remote.coins),
            streak: Math.max(currentLocal.streak, remote.streak ?? 0),
            gamesPlayed: Math.max(currentLocal.gamesPlayed, remote.gamesPlayed ?? 0),
            unlockedBadges: mergedBadges,
            updatedAt: new Date().toISOString(),
          };
          if (!cancelled) {
            setWallet(merged);
            writeLocalWallet(merged);
            setCloudSynced(true);
          }
        } else {
          const ok = await syncWalletToSupabase(currentLocal, userId);
          if (!cancelled) setCloudSynced(ok);
        }
      } catch {
        if (!cancelled) setCloudSynced(false);
      }
    }

    void reconcileCloudWallet();
    return () => {
      cancelled = true;
    };
  }, [hydrated, userId]);

  const recordGameOutcome = useCallback(
    (params: {
      game: string;
      delta: number;
      reason: string;
      incrementStreak?: boolean;
      resetStreak?: boolean;
      unlockBadge?: BadgeId;
    }) => {
      const prev = readLocalWallet();
      const nextCoins = Math.max(0, prev.coins + params.delta);
      const nextStreak = params.resetStreak
        ? 0
        : params.incrementStreak
        ? prev.streak + 1
        : prev.streak;

      const nextBadges =
        params.unlockBadge && !prev.unlockedBadges.includes(params.unlockBadge)
          ? [...prev.unlockedBadges, params.unlockBadge]
          : prev.unlockedBadges;

      const activityEntry: WalletActivity = {
        id: Math.random().toString(36).slice(2, 9),
        game: params.game,
        delta: params.delta,
        reason: params.reason,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      const nextState: GamesWalletState = {
        coins: nextCoins,
        streak: nextStreak,
        gamesPlayed: prev.gamesPlayed + 1,
        unlockedBadges: nextBadges,
        recentActivity: [activityEntry, ...prev.recentActivity].slice(0, 12),
        updatedAt: new Date().toISOString(),
      };

      setWallet(nextState);
      writeLocalWallet(nextState);
      setLastDelta({ delta: params.delta, label: params.reason });

      if (userId) {
        void syncWalletToSupabase(nextState, userId).then((ok) => setCloudSynced(ok));
      }
    },
    [userId]
  );

  return {
    wallet,
    hydrated,
    cloudSynced,
    lastDelta,
    rank: getScholarRank(wallet.coins),
    recordGameOutcome,
  };
}
