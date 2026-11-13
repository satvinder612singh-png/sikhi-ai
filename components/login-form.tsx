"use client";

import { useId, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";

type Mode = "signin" | "signup";

export function LoginForm({
  next,
  callbackError,
}: {
  next: string;
  callbackError: boolean;
}) {
  const router = useRouter();
  const { configured } = useAuth();
  const emailId = useId();
  const passwordId = useId();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(
    callbackError ? "That confirmation link is invalid or has expired. Please sign in again." : ""
  );
  const [notice, setNotice] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Sign-in is not configured yet.");
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    try {
      if (mode === "signin") {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) throw err;
        router.replace(next);
        router.refresh();
      } else {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (err) throw err;
        if (data.session) {
          router.replace(next);
          router.refresh();
        } else {
          setNotice("Check your email for a confirmation link to finish creating your account.");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const isSignIn = mode === "signin";
  const inputClass =
    "mt-1.5 w-full rounded-xl border border-white/10 bg-midnight-950/60 px-4 py-3 text-base text-slate-100 placeholder:text-slate-500 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/40";

  return (
    <div className="w-full max-w-md rounded-2xl border border-gold/25 bg-midnight-800/80 p-7 shadow-glow backdrop-blur sm:p-9">
      <h1 className="font-serif text-3xl font-semibold text-gold-pale">
        {isSignIn ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        {isSignIn
          ? "Sign in to ask questions and read sourced answers."
          : "A free account lets you ask Sikhi AI questions."}
      </p>

      {!configured && (
        <p role="alert" className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
          Authentication is not configured. Add your Supabase URL and anon key to <code>.env.local</code>.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate={false}>
        <div>
          <label htmlFor={emailId} className="text-sm font-medium text-slate-300">
            Email
          </label>
          <input
            id={emailId}
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor={passwordId} className="text-sm font-medium text-slate-300">
            Password
          </label>
          <input
            id={passwordId}
            type="password"
            required
            minLength={8}
            autoComplete={isSignIn ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className={inputClass}
          />
        </div>

        <div aria-live="polite" className="min-h-[1.25rem] text-sm">
          {error && <p role="alert" className="text-red-300">{error}</p>}
          {notice && <p className="text-gold-light">{notice}</p>}
        </div>

        <button
          type="submit"
          disabled={busy || !configured}
          className="w-full rounded-xl bg-gradient-to-b from-gold-light to-gold-dark px-5 py-3 text-sm font-semibold text-midnight-900 transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-light focus-visible:ring-offset-2 focus-visible:ring-offset-midnight-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Please wait…" : isSignIn ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        {isSignIn ? "New to Sikhi AI?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(isSignIn ? "signup" : "signin");
            setError("");
            setNotice("");
          }}
          className="font-medium text-gold-light underline-offset-4 hover:underline focus:outline-none focus-visible:underline"
        >
          {isSignIn ? "Create an account" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
