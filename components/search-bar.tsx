"use client";

import { useId, type FormEvent } from "react";
import { Icon } from "@/components/icons";
import { MAX_PROMPT, MIN_PROMPT } from "@/lib/answer";

export const SUGGESTIONS = [
  "What is the meaning of Hukam?",
  "What is the purpose of Langar?",
  "What are Miri and Piri?",
];

/** Controlled search field shared by the hero and the Ask workspace. */
export function SearchBar({
  value,
  onChange,
  onSubmit,
  busy = false,
  buttonLabel = "Ask",
  busyLabel = "Searching…",
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
      aria-label="Ask a question about Sikhi"
      className="w-full"
    >
      <label htmlFor={inputId} className="sr-only">
        Ask a question about Sikh philosophy, history or Gurbani
      </label>
      <div className="flex items-center gap-2 rounded-2xl border border-[#C59B27]/55 bg-[#FAF6EE] p-2 text-[#171917] shadow-parchment transition focus-within:border-[#D97706] focus-within:ring-2 focus-within:ring-[#C59B27]/40">
        <span className="ml-3 flex h-5 w-5 shrink-0 items-center justify-center text-[#D97706]">
          <Icon name="search" className="h-5 w-5" />
        </span>
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="What is the meaning of Hukam?"
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

export function SuggestionChips({
  onPick,
  disabled = false,
  className = "",
}: {
  onPick: (text: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-xs font-semibold uppercase tracking-widest text-[#C59B27]">
        Try
      </span>
      {SUGGESTIONS.map((s) => (
        <button
          key={s}
          type="button"
          disabled={disabled}
          onClick={() => onPick(s)}
          className="rounded-full border border-[#C59B27]/45 bg-[#1B2A20]/85 px-3.5 py-1.5 text-xs font-medium text-[#FAF6EE] transition hover:border-[#D97706] hover:bg-[#D97706] hover:text-[#FAF6EE] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B27] disabled:opacity-50 sm:text-sm"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
