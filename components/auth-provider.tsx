"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type AuthUser = { id: string; email: string | null };

type AuthContextValue = {
  user: AuthUser | null;
  /** False when Supabase env vars are missing (auth cannot work). */
  configured: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Receives the server-verified user from the root layout, so the first client
 * render matches the server HTML (no hydration mismatch). It then follows
 * Supabase auth events so the state stays correct across client navigations.
 */
export function AuthProvider({
  initialUser,
  configured,
  children,
}: {
  initialUser: AuthUser | null;
  configured: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const lastId = useRef<string | null>(initialUser?.id ?? null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const next = session?.user
        ? { id: session.user.id, email: session.user.email ?? null }
        : null;
      setUser(next);

      // Re-run server components only when the signed-in identity changed.
      const nextId = next?.id ?? null;
      if (nextId !== lastId.current) {
        lastId.current = nextId;
        router.refresh();
      }
    });

    return () => data.subscription.unsubscribe();
  }, [router]);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    lastId.current = null;
    router.push("/");
    router.refresh();
  }, [router]);

  const value = useMemo(
    () => ({ user, configured, signOut }),
    [user, configured, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
