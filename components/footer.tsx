import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

// Static on purpose: a Date here could differ between server and client render.
const COPYRIGHT_YEAR = 2026;

const GROUPS = [
  {
    heading: "Chapters & Archives",
    links: [
      { href: "/#baani", label: "੧ · Living Gurbani Treasury" },
      { href: "/#matriarchs", label: "੨ · Matriarchs of the Panth" },
      { href: "/#gurmat-veechar", label: "੩ · Gurmat Veechar & Granths" },
      { href: "/#ecology", label: "੪ · Ecology, Seva & Conscious Living" },
      { href: "/#archives", label: "੫ · Connected Panthic Archives" },
    ],
  },
  {
    heading: "Research & Study",
    links: [
      { href: "/ask", label: "Scriptural & Historical Inquiry" },
      { href: "/sources", label: "Primary Scriptural Sources" },
      { href: "/login", label: "Scholar Sign In" },
    ],
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
            A living publication and study companion for Sikh philosophy, history, ecological
            stewardship, and Gurbani—built to point you directly back to primary sources.
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
          Learn Sikhi is a scholarly study aid. Please verify all Ang citations directly in Sri
          Guru Granth Sahib Ji and consult respected Sikh scholars and primary Granths.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
