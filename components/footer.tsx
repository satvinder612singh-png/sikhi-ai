import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

const COPYRIGHT_YEAR = 2026;

const CORE_PAGES = [
  { href: "/", label: "Home — SikhStacks & SikhInterest" },
  { href: "/foundations", label: "Foundations of Sikhi" },
  { href: "/granths", label: "Granths & Kirtan" },
  { href: "/matriarchs", label: "Sikh Women" },
  { href: "/games", label: "Sikhi Games" },
  { href: "/news", label: "Explore & News" },
];

export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
        color: "var(--text-primary)",
      }}
      className="border-t px-4 py-14 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="grid gap-10 md:grid-cols-[1.8fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              <BrandLogo size="md" />
              <div>
                <p className="font-serif text-3xl font-bold">
                  Learn{" "}
                  <span style={{ color: "var(--accent-text, var(--accent-primary))" }}>
                    Sikhi
                  </span>
                </p>
                <p
                  style={{ color: "var(--accent-text, var(--accent-primary))" }}
                  className="text-xs font-semibold uppercase tracking-[0.2em]"
                >
                  Knowledge • Scholarship • Community
                </p>
              </div>
            </div>

            <p
              style={{ color: "var(--theme-text-muted)" }}
              className="max-w-lg text-sm sm:text-base leading-relaxed"
            >
              A safe space for Sikhs and scholars to share knowledge, sources,
              books, and work together.
            </p>
          </div>

          <nav aria-label="Core Pages">
            <h2
              style={{ color: "var(--accent-text, var(--accent-primary))" }}
              className="text-xs font-bold uppercase tracking-[0.2em]"
            >
              Explore Learn Sikhi
            </h2>
            <ul className="mt-4 space-y-2.5">
              {CORE_PAGES.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    style={{ color: "var(--theme-text-muted)" }}
                    className="rounded px-1 -mx-1 text-sm font-medium transition hover:opacity-100 hover:underline focus-visible:underline"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div
          style={{
            borderColor: "var(--border-subtle)",
            color: "var(--theme-text-muted)",
          }}
          className="border-t pt-6 text-center text-xs"
        >
          <p>© {COPYRIGHT_YEAR} Learn Sikhi. Built for lifelong learning and Sangat collaboration.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
