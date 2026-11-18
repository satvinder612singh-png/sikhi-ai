import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

const COPYRIGHT_YEAR = 2026;

const GROUPS = [
  {
    heading: "Sanctuary Pillars",
    links: [
      { href: "/nitnem", label: "੧ · Gurbani & Nitnem Reader" },
      { href: "/live-kirtan", label: "੨ · Live 24/7 Darbar Sahib Kirtan" },
      { href: "/hukamnama", label: "੩ · Daily Darbar Sahib Hukamnama" },
      { href: "/granths", label: "੪ · Granths & Puratan Kirtan" },
      { href: "/matriarchs", label: "੫ · Matriarchs of the Panth" },
      { href: "/games", label: "੬ · Interactive Abhiyaas Games" },
      { href: "/sangat", label: "੭ · SikhInterest & Vichaar (/sangat)" },
    ],
  },
  {
    heading: "Want to Learn More?",
    links: [
      { href: "https://manglacharan.com", label: "Manglacharan (Classical Granths) ↗", external: true },
      { href: "https://www.youtube.com/@BungaAzadi", label: "Bunga Azadi (Sovereignty & History) ↗", external: true },
      {
        href: "https://web.archive.org/web/20160618115353/http://www.neverforget84.com/",
        label: "Never Forget 1984 Archive ↗",
        external: true,
      },
      { href: "https://1984tribute.com/", label: "1984 Tribute & Ensaaf ↗", external: true },
      { href: "https://www.gurmatveechar.com", label: "Gurmat Veechar Library ↗", external: true },
    ],
  },
];

export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
        color: "var(--text-primary)",
      }}
      className="border-t px-4 py-16 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Student Individual Project Highlight Banner */}
        <div
          style={{
            backgroundColor: "var(--theme-card-darker)",
            borderColor: "var(--border-subtle)",
          }}
          className="mb-12 rounded-2xl border p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        >
          <div className="space-y-2 max-w-3xl">
            <span
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
                color: "var(--accent-text, var(--accent-primary))",
              }}
              className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-bold"
            >
              🎓 Student Individual Project • Built to Connect the Sangat with Sikhi
            </span>
            <p
              style={{ color: "var(--theme-text-muted)" }}
              className="text-sm sm:text-base leading-relaxed"
            >
              Learn Sikhi is an independent student individual project dedicated to connecting
              people everywhere with the wisdom of Gurbani, Sikh history, and Gurmat philosophy
              through modern, interactive digital tools.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/games"
              className="sanctuary-interactive whitespace-nowrap rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#18181B] hover:brightness-105"
            >
              Explore Abhiyaas Games →
            </Link>
            <Link
              href="/nitnem"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
                color: "var(--accent-text, var(--accent-primary))",
              }}
              className="sanctuary-interactive whitespace-nowrap rounded-xl border px-4 py-2.5 text-xs font-bold uppercase tracking-wider hover:border-[#C59B27]"
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
                <p className="font-serif text-3xl font-bold">
                  Learn{" "}
                  <span style={{ color: "var(--accent-text, var(--accent-primary))" }}>Sikhi</span>
                </p>
                <p
                  style={{ color: "var(--accent-text, var(--accent-primary))" }}
                  className="text-xs font-semibold uppercase tracking-[0.2em]"
                >
                  Learn. Understand. Practise. Connect.
                </p>
              </div>
            </div>

            <p
              style={{ color: "var(--theme-text-muted)" }}
              className="mt-4 max-w-md text-sm leading-relaxed"
            >
              A living publication and study companion for Sikh philosophy, history, Puratan
              Kirtan, and Gurbani—built to point you directly back to primary sources.
            </p>
          </div>

          {GROUPS.map((g) => (
            <nav key={g.heading} aria-label={g.heading}>
              <h2
                style={{ color: "var(--accent-text, var(--accent-primary))" }}
                className="text-xs font-bold uppercase tracking-[0.2em]"
              >
                {g.heading}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {g.links.map((l) => (
                  <li key={l.label}>
                    {"external" in l && l.external ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--theme-text-muted)" }}
                        className="rounded px-1 -mx-1 text-sm font-medium transition hover:opacity-100 hover:underline focus-visible:underline"
                      >
                        {l.label}
                      </a>
                    ) : (
                      <Link
                        href={l.href}
                        style={{ color: "var(--theme-text-muted)" }}
                        className="rounded px-1 -mx-1 text-sm font-medium transition hover:opacity-100 hover:underline focus-visible:underline"
                      >
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div
          style={{
            borderColor: "var(--border-subtle)",
            color: "var(--theme-text-muted)",
          }}
          className="mt-12 border-t pt-6 text-center text-xs"
        >
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
