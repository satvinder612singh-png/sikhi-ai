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
      <div className="flex items-center gap-2 rounded-2xl border border-gold/40 bg-midnight-900/80 p-2 shadow-glow backdrop-blur transition focus-within:border-gold focus-within:shadow-glow-strong">
        <span className="ml-3 flex h-5 w-5 shrink-0 items-center justify-center text-gold">
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
          className="min-w-0 flex-1 bg-transparent px-2 py-3 text-base text-slate-100 placeholder:text-slate-500 focus:outline-none sm:text-lg"
        />
        <button
          type="submit"
          disabled={busy || (value || "").trim().length < MIN_PROMPT}
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
      <span className="text-xs uppercase tracking-widest text-slate-500">Try</span>
      {SUGGESTIONS.map((s) => (
        <button
          key={s}
          type="button"
          disabled={disabled}
          onClick={() => onPick(s)}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300 transition hover:border-gold/60 hover:text-gold-light focus:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:opacity-50"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
