"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnswerSkeleton, AnswerView } from "@/components/answer-view";
import { Icon } from "@/components/icons";
import { SearchBar, SuggestionChips } from "@/components/search-bar";
import { MIN_PROMPT, type Answer } from "@/lib/answer";

type State =
  | { status: "idle" }
  | { status: "loading"; question: string }
  | { status: "success"; data: Answer }
  | { status: "error"; question: string; message: string; needsSignIn: boolean };

const GENERIC_ERROR = "Something went wrong. Please try again.";

export function AskPanel({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [state, setState] = useState<State>({ status: "idle" });

  const requestId = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const autoRan = useRef(false);
  const resultRef = useRef<HTMLDivElement>(null);

  async function ask(raw: string) {
    const text = raw.trim();
    if (text.length < MIN_PROMPT) return;

    // Cancel any in-flight request and ignore its result.
    controller.current?.abort();
    const ctrl = new AbortController();
    controller.current = ctrl;
    const id = ++requestId.current;

    setQuery(text);
    setState({ status: "loading", question: text });

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
        signal: ctrl.signal,
      });

      let body: unknown = null;
      try {
        body = await res.json();
      } catch {
        // Non-JSON body (e.g. a proxy error page).
      }
      if (id !== requestId.current) return;

      if (!res.ok) {
        const message =
          body && typeof body === "object" && typeof (body as { error?: unknown }).error === "string"
            ? (body as { error: string }).error
            : GENERIC_ERROR;
        setState({ status: "error", question: text, message, needsSignIn: res.status === 401 });
        return;
      }

      const data = body as Answer | null;
      if (!data || !Array.isArray(data.answer) || data.answer.length === 0) {
        setState({ status: "error", question: text, message: GENERIC_ERROR, needsSignIn: false });
        return;
      }
      setState({ status: "success", data });
    } catch (err) {
      if (id !== requestId.current) return; // superseded or aborted
      if (err instanceof DOMException && err.name === "AbortError") return;
      setState({
        status: "error",
        question: text,
        message: "Could not reach the server. Check your connection and try again.",
        needsSignIn: false,
      });
    }
  }

  // Run the question carried over from the landing page once. The ref guard
  // keeps React Strict Mode's double-invoked effect from sending it twice.
  useEffect(() => {
    if (initialQuery && !autoRan.current) {
      autoRan.current = true;
      void ask(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Move focus to the result so keyboard and screen-reader users land on it.
  useEffect(() => {
    if (state.status === "success" || state.status === "error") {
      resultRef.current?.focus({ preventScroll: false });
    }
  }, [state.status]);

  const busy = state.status === "loading";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <SearchBar
        value={query}
        onChange={setQuery}
        onSubmit={ask}
        busy={busy}
        busyLabel="Searching…"
      />
      <SuggestionChips onPick={ask} disabled={busy} />

      <div
        ref={resultRef}
        tabIndex={-1}
        aria-busy={busy}
        className="min-h-[18rem] rounded-2xl border border-gold/25 bg-midnight-900/80 p-6 focus:outline-none sm:p-8"
      >
        {state.status === "idle" && (
          <div className="flex min-h-[14rem] flex-col items-center justify-center text-center">
            <p className="font-serif text-2xl font-semibold text-gold-light">
              Your answer will appear here
            </p>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Ask a question above, or pick a suggestion, to read an explanation with its
              sources.
            </p>
          </div>
        )}

        {state.status === "loading" && <AnswerSkeleton question={state.question} />}

        {state.status === "error" && (
          <div role="alert" className="flex min-h-[14rem] flex-col items-center justify-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-300">
              <Icon name="alert" className="h-6 w-6" />
            </span>
            <p className="mt-4 max-w-md text-base text-slate-200">{state.message}</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {state.needsSignIn ? (
                <Link
                  href="/login?next=/ask"
                  className="rounded-xl bg-gradient-to-b from-gold-light to-gold-dark px-5 py-2.5 text-sm font-semibold text-midnight-900 hover:brightness-110"
                >
                  Sign in
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => void ask(state.question)}
                  className="inline-flex items-center gap-2 rounded-xl border border-gold/60 px-5 py-2.5 text-sm font-medium text-gold-light transition hover:bg-gold hover:text-midnight-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <Icon name="refresh" className="h-4 w-4" />
                  Try again
                </button>
              )}
            </div>
          </div>
        )}

        {state.status === "success" && <AnswerView data={state.data} />}
      </div>
    </div>
  );
}
