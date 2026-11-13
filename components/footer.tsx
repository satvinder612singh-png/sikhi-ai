import Link from "next/link";

// Static on purpose: a Date here could differ between server and client render.
const COPYRIGHT_YEAR = 2026;

const GROUPS = [
  {
    heading: "Explore",
    links: [
      { href: "/#sources", label: "Our sources" },
      { href: "/#explore", label: "Topics" },
      { href: "/ask", label: "Ask a question" },
    ],
  },
  {
    heading: "Account",
    links: [{ href: "/login", label: "Sign in" }],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-gold/20 bg-midnight-950 px-5 py-16 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <p className="font-serif text-3xl font-semibold text-gold-pale">
            Sikhi <span className="text-gold">AI</span>
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">
            A study companion for Sikh philosophy, history and Gurbani, built to point you
            back to the source.
          </p>
        </div>

        {GROUPS.map((g) => (
          <nav key={g.heading} aria-label={g.heading}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {g.heading}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {g.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-slate-400 transition hover:text-gold-light focus:outline-none focus-visible:underline"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mx-auto mt-12 max-w-6xl border-t border-white/5 pt-6 text-center text-xs text-slate-500">
        <p>© {COPYRIGHT_YEAR} Sikhi AI. All rights reserved.</p>
        <p className="mt-1">
          Sikhi AI is a study aid and can make mistakes. Please consult the original Gurbani
          and respected Sikh scholars.
        </p>
      </div>
    </footer>
  );
}
