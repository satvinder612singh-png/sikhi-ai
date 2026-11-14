import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

// Static on purpose: a Date here could differ between server and client render.
const COPYRIGHT_YEAR = 2026;

const GROUPS = [
  {
    heading: "Explore",
    links: [
      { href: "/#baani", label: "Living Gurbani" },
      { href: "/#matriarchs", label: "Matriarchs of the Panth" },
      { href: "/sources", label: "Our sources" },
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
    <footer className="border-t border-[#C59B27]/35 bg-[#1B2A20] px-5 py-16 text-[#FAF6EE] sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.8fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3.5">
            <BrandLogo size="md" />
            <div>
              <p className="font-serif text-3xl font-semibold text-[#FAF6EE]">
                Learn <span className="text-[#E5C158]">Sikhi</span>
              </p>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D97706]">
                Learn. Understand. Practise. Connect.
              </p>
            </div>
          </div>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-[#F3ECE0]/85">
            A study companion for Sikh philosophy, history and Gurbani, built to point you
            back to the source.
          </p>

          <p className="mt-3 max-w-md rounded-xl border border-[#C59B27]/30 bg-[#121C15]/60 px-3.5 py-2.5 text-xs leading-relaxed text-[#F3ECE0]/75">
            <strong className="text-[#E5C158]">Heritage Emblem:</strong> The Learn Sikhi crest
            is inspired by historical Sikh martial artistry (Shastarvidya)—uniting the central{" "}
            <em>Kataar</em>, circular <em>Dhaal</em> shield, and crossed <em>Talwar</em> swords
            as symbols of spiritual discernment and sovereign dignity.
          </p>
        </div>

        {GROUPS.map((g) => (
          <nav key={g.heading} aria-label={g.heading}>
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E5C158]">
              {g.heading}
            </h2>
            <ul className="mt-4 space-y-2.5">
              {g.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-[#F3ECE0]/80 transition hover:text-[#E5C158] focus:outline-none focus-visible:underline"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mx-auto mt-12 max-w-6xl border-t border-[#C59B27]/20 pt-6 text-center text-xs text-[#F3ECE0]/70">
        <p>© {COPYRIGHT_YEAR} Learn Sikhi. All rights reserved.</p>
        <p className="mt-1">
          Learn Sikhi is a study aid and can make mistakes. Please consult the original Gurbani
          and respected Sikh scholars.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
