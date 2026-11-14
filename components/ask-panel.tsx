"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnswerSkeleton, AnswerView } from "@/components/answer-view";
import { SearchBar, SuggestionChips } from "@/components/search-bar";
import { MIN_PROMPT, type Answer } from "@/lib/answer";

type State =
  | { status: "idle" }
  | { status: "loading"; question: string }
  | { status: "success"; data: Answer }
  | { status: "error"; question: string; message: string; needsSignIn: boolean };

const GENERIC_ERROR = "Unable to retrieve synthesis. Please try again.";

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
        // Non-JSON body
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
      if (id !== requestId.current) return;
      if (err instanceof DOMException && err.name === "AbortError") return;
      setState({
        status: "error",
        question: text,
        message: "Could not reach the archive server. Check your connection and try again.",
        needsSignIn: false,
      });
    }
  }

  useEffect(() => {
    if (initialQuery && !autoRan.current) {
      autoRan.current = true;
      void ask(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (state.status === "success" || state.status === "error") {
      resultRef.current?.focus({ preventScroll: false });
    }
  }, [state.status]);

  const busy = state.status === "loading";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D97706]">
          Scriptural &amp; Historical Inquiry
        </p>
        <h2 className="mt-1 font-serif text-2xl font-bold text-[#171917] sm:text-3xl">
          Explore Gurmat &amp; Historical Sources
        </h2>
      </div>

      <SearchBar
        value={query}
        onChange={setQuery}
        onSubmit={ask}
        busy={busy}
        busyLabel="Consulting Sources…"
      />
      <SuggestionChips onPick={ask} disabled={busy} />

      <div
        ref={resultRef}
        tabIndex={-1}
        aria-busy={busy}
        className="min-h-[18rem] rounded-2xl border border-[#C59B27]/40 bg-[#1B2A20] p-6 text-[#FAF6EE] shadow-parchment focus:outline-none sm:p-8"
      >
        {state.status === "idle" && (
          <div className="flex min-h-[14rem] flex-col items-center justify-center text-center">
            <span
              lang="pa"
              className="mb-2 font-gurmukhi text-2xl text-[#E5C158]"
            >
              ੴ
            </span>
            <p className="font-serif text-2xl font-semibold text-[#FAF6EE]">
              Gurbani &amp; Historical Synthesis
            </p>
            <p className="mt-2 max-w-sm text-sm text-[#F3ECE0]/75">
              Enter a scriptural or historical inquiry above to read a synthesis with primary
              Ang and Granth citations.
            </p>
          </div>
        )}

        {state.status === "loading" && <AnswerSkeleton question={state.question} />}

        {state.status === "error" && (
          <div role="alert" className="flex min-h-[14rem] flex-col items-center justify-center text-center">
            <span className="rounded border border-[#D97706]/50 bg-[#121C15] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#D97706]">
              Archival Notice
            </span>
            <p className="mt-4 max-w-md text-base text-[#FAF6EE]">{state.message}</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {state.needsSignIn ? (
                <Link
                  href="/login?next=/ask"
                  className="rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] px-5 py-2.5 text-sm font-semibold text-[#171917] hover:brightness-110"
                >
                  Sign in
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => void ask(state.question)}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#C59B27]/60 px-5 py-2.5 text-sm font-medium text-[#E5C158] transition hover:bg-[#C59B27] hover:text-[#171917] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B27]"
                >
                  Repeat Inquiry
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
