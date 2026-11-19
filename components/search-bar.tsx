"use client";

import { useId, type FormEvent } from "react";
import { MAX_PROMPT, MIN_PROMPT } from "@/lib/answer";

export const SUGGESTIONS: string[] = [];

/** Controlled search field shared by Khoj AI workspaces. */
export function SearchBar({
  value,
  onChange,
  onSubmit,
  busy = false,
  buttonLabel = "Ask Khoj AI",
  busyLabel = "Consulting Sources…",
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (text: string) => void;
  busy?: boolean;
  buttonLabel?: string;
  busyLabel?: string;
}) {
  const inputId = useId();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = value.trim();
    if (busy || text.length < MIN_PROMPT) return;
    onSubmit(text);
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Explore Gurmat & Historical Sources"
      className="w-full"
    >
      <label htmlFor={inputId} className="sr-only">
        Explore Gurmat and Historical Sources
      </label>
      <div className="flex items-center gap-2 rounded-2xl border border-[#C59B27]/55 bg-[#FAF6EE] p-2 text-[#171917] shadow-parchment transition focus-within:border-[#D97706] focus-within:ring-2 focus-within:ring-[#C59B27]/40">
        <span
          lang="pa"
          aria-hidden="true"
          className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#C59B27]/40 bg-[#F3ECE0] font-gurmukhi text-sm font-bold text-[#1B2A20]"
        >
          ੴ
        </span>
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ask Khoj AI about Gurbani, Sikh history, or Gurmat philosophy…"
          autoComplete="off"
          maxLength={MAX_PROMPT}
          className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-base text-[#171917] placeholder:text-[#4A554E]/75 focus:outline-none sm:text-lg"
        />
        <button
          type="submit"
          disabled={busy || (value || "").trim().length < MIN_PROMPT}
          className="rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] px-5 py-2.5 text-sm font-semibold text-[#171917] shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? busyLabel : buttonLabel}
        </button>
      </div>
    </form>
  );
}

export function SuggestionChips(_props: {
  onPick?: (text: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  return null;
}
