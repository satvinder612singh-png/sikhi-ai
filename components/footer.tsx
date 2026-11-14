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
      { href: "/#abhiyaas", label: "੫ · Games & Abhiyaas Hub" },
      { href: "/#archives", label: "੬ · Connected Panthic Archives" },
    ],
  },
  {
    heading: "Research & Study",
    links: [
      { href: "/hukamnama", label: "Daily Darbar Sahib Hukamnama" },
      { href: "/nitnem", label: "Nitnem & Sukhmani Sahib Reader" },
      { href: "/games", label: "Abhiyaas & Games Hub" },
      { href: "/ask", label: "Scriptural & Historical Inquiry" },
      { href: "/sources", label: "Primary Scriptural Sources" },
      { href: "/login", label: "Scholar Sign In" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[#C59B27]/35 bg-[#1B2A20] px-4 py-16 text-[#FAF6EE] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Student Individual Project Highlight Banner */}
        <div className="mb-12 rounded-2xl border border-[#C59B27]/45 bg-[#121C15]/85 p-6 shadow-parchment flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#C59B27]/50 bg-[#1B2A20] px-3.5 py-1 text-xs font-semibold text-[#E5C158]">
              🎓 Student Individual Project • Built to Connect the Sangat with Sikhi
            </span>
            <p className="text-sm sm:text-base leading-relaxed text-[#F3ECE0]/90">
              Learn Sikhi is an independent student individual project dedicated to connecting
              people everywhere with the wisdom of Gurbani, Sikh history, and Gurmat philosophy
              through modern, interactive digital tools.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/games"
              className="whitespace-nowrap rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#171917] transition hover:brightness-105"
            >
              Explore Abhiyaas Games →
            </Link>
            <Link
              href="/#baani"
              className="whitespace-nowrap rounded-xl border border-[#C59B27]/50 bg-[#1B2A20] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#E5C158] transition hover:border-[#D97706]"
            >
              Read Gurbani
            </Link>
          </div>
        </div>

        <div className="grid gap-12 md:grid-cols-[1.8fr_1fr_1fr]">
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

        <div className="mt-12 border-t border-[#C59B27]/20 pt-6 text-center text-xs text-[#F3ECE0]/70">
          <p>
            © {COPYRIGHT_YEAR} Learn Sikhi • Independent Student Individual Project. All rights
            reserved.
          </p>
          <p className="mt-1">
            Learn Sikhi is a scholarly study aid. Please verify all Ang citations directly in Sri
            Guru Granth Sahib Ji and consult respected Sikh scholars and primary Granths.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
