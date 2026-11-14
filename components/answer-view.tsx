import type { Answer } from "@/lib/answer";

export function AnswerSkeleton({ question }: { question: string }) {
  return (
    <div role="status" aria-live="polite" className="space-y-4">
      <span className="sr-only">Searching sources for: {question}</span>
      <p className="text-xs uppercase tracking-[0.2em] text-gold">Searching sources…</p>
      <div className="h-6 w-3/5 animate-pulse rounded bg-white/10" />
      <div className="h-4 w-full animate-pulse rounded bg-white/5" />
      <div className="h-4 w-11/12 animate-pulse rounded bg-white/5" />
      <div className="h-4 w-4/5 animate-pulse rounded bg-white/5" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-white/5" />
    </div>
  );
}

export function AnswerView({ data }: { data: Answer }) {
  return (
    <article>
      <p className="text-xs uppercase tracking-[0.2em] text-gold">Question</p>
      <h2 className="mt-1 font-serif text-3xl font-semibold leading-snug text-gold-pale">
        {data.question}
      </h2>

      <div className="mt-5 space-y-4 text-base leading-relaxed text-slate-300">
        {data.answer.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      <div className="mt-8 border-t border-gold/20 pt-6">
        <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-gold">Sources</h3>
        {data.citations.length > 0 ? (
          <ol className="mt-3 space-y-2">
            {data.citations.map((c, i) => (
              <li
                key={`${c.label}-${i}`}
                className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-xs font-semibold text-gold-light">
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="mr-2 rounded bg-gold/10 px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-gold">
                    {c.type}
                  </span>
                  <span className="text-slate-200">{c.label}</span>
                  {c.detail && <span className="block text-slate-500">{c.detail}</span>}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            No specific citations were given for this answer. Please check it against the
            original Gurbani and trusted scholarship.
          </p>
        )}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-slate-500">
        Learn Sikhi is a study aid and can make mistakes, including in citations. Verify Ang
        numbers and quotations in the Guru Granth Sahib, and consult respected Sikh scholars
        or your local gurdwara for guidance.
      </p>
    </article>
  );
}
