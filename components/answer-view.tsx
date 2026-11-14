import type { Answer } from "@/lib/answer";

const GURMUKHI_NUMERALS = ["੧", "੨", "੩", "੪", "੫", "੬", "੭", "੮"];

export function AnswerSkeleton({ question }: { question: string }) {
  return (
    <div role="status" aria-live="polite" className="space-y-4">
      <span className="sr-only">Consulting sources for: {question}</span>
      <p className="text-xs uppercase tracking-[0.2em] text-[#E5C158]">
        Consulting Gurbani &amp; Historical Sources…
      </p>
      <div className="h-6 w-3/5 animate-pulse rounded bg-[#FAF6EE]/15" />
      <div className="h-4 w-full animate-pulse rounded bg-[#FAF6EE]/10" />
      <div className="h-4 w-11/12 animate-pulse rounded bg-[#FAF6EE]/10" />
      <div className="h-4 w-4/5 animate-pulse rounded bg-[#FAF6EE]/10" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-[#FAF6EE]/10" />
    </div>
  );
}

export function AnswerView({ data }: { data: Answer }) {
  return (
    <article>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C59B27]/25 pb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#E5C158]">
          Gurbani &amp; Historical Synthesis
        </p>
        <span className="rounded border border-[#C59B27]/35 bg-[#121C15] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#F3ECE0]/80">
          PRIMARY &amp; CANONICAL RECORD
        </span>
      </div>
      <h2 className="mt-3 font-serif text-3xl font-semibold leading-snug text-[#FAF6EE]">
        {data.question}
      </h2>

      <div className="mt-5 space-y-4 text-base leading-relaxed text-[#F3ECE0]/90">
        {data.answer.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      <div className="mt-8 border-t border-[#C59B27]/25 pt-6">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E5C158]">
          Referenced Scriptural &amp; Historical Sources
        </h3>
        {data.citations.length > 0 ? (
          <ol className="mt-3 space-y-2.5">
            {data.citations.map((c, i) => (
              <li
                key={`${c.label}-${i}`}
                className="flex gap-3 rounded-xl border border-[#C59B27]/30 bg-[#121C15] p-3.5 text-sm"
              >
                <span
                  lang="pa"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-[#C59B27]/40 bg-[#1B2A20] font-gurmukhi text-xs font-bold text-[#E5C158]"
                >
                  {GURMUKHI_NUMERALS[i] || String(i + 1)}
                </span>
                <span className="min-w-0">
                  <span className="mr-2 rounded bg-[#C59B27]/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-[#E5C158]">
                    {c.type}
                  </span>
                  <span className="text-[#FAF6EE]">{c.label}</span>
                  {c.detail && <span className="block text-[#F3ECE0]/70 mt-0.5">{c.detail}</span>}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-[#F3ECE0]/75">
            Verify this synthesis directly against Sri Guru Granth Sahib Ji and primary
            historical Granths.
          </p>
        )}
      </div>

      <p className="mt-6 text-xs leading-relaxed text-[#F3ECE0]/70">
        Learn Sikhi is a study aid. Verify Ang numbers and quotations directly in Sri Guru
        Granth Sahib Ji, and consult respected Sikh scholars for guidance.
      </p>
    </article>
  );
}
