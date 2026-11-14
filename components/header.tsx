"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useAuth } from "@/components/auth-provider";
import { SikhiIcon, type SikhiIconName } from "@/components/sikhi-icons";

const LINKS: { href: string; title: string; sub: string; icon: SikhiIconName }[] = [
  { href: "/foundations", title: "Start Here", sub: "Sikhi 101", icon: "ikonkar" },
  { href: "/nitnem", title: "Daily Bani", sub: "& Hukamnama", icon: "scroll" },
  { href: "/granths", title: "Granths", sub: "& Live Kirtan", icon: "rabab" },
  { href: "/matriarchs", title: "Sikh Women", sub: "Matriarchs", icon: "lotus-dome" },
  { href: "/games", title: "Games", sub: "Abhiyaas", icon: "dhaal" },
  { href: "/sangat", title: "Community", sub: "Sangat", icon: "khanda" },
];

const MOBILE_EXTRA_LINKS: { href: string; title: string; sub: string; icon?: SikhiIconName }[] = [
  { href: "/live-kirtan", title: "Live Kirtan", sub: "24/7 from Darbar Sahib" },
  { href: "/sangat?studio=1", title: "Profile Studio", sub: "Avatar & identity" },
  { href: "/hukamnama", title: "Daily Hukamnama", sub: "Sri Darbar Sahib" },
  { href: "/ask", title: "Scriptural Inquiry", sub: "Ask with sources" },
  { href: "/sources", title: "Primary Sources", sub: "Archive" },
];
const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B27]";

/**
 * Clean, breathable 5-link top navigation bar with ThemeSwitcher and Sign In.
 */
export function Header({ solid = false }: { solid?: boolean }) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  return (
    <header
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
        color: "var(--text-primary)",
      }}
      className={
        solid
          ? "sticky top-0 z-30 border-b backdrop-blur-md shadow-sm"
          : "sticky top-0 z-30 border-b backdrop-blur-md"
      }
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8"
      >
        <Link
          href="/"
          aria-label="Learn Sikhi"
          className={`group flex shrink-0 items-center gap-2.5 rounded-lg py-0.5 whitespace-nowrap transition ${focusRing}`}
        >
          <BrandLogo size="sm" />
          <span
            className="whitespace-nowrap font-serif text-xl sm:text-2xl font-bold tracking-wide transition-colors"
            style={{ color: "var(--text-primary)" }}
          >
            Learn{" "}
            <span style={{ color: "var(--accent-primary)" }}>Sikhi</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-2 xl:gap-4 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href} className="shrink-0">
              <Link
                href={l.href}
                style={{ color: "var(--text-primary)" }}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-1.5 py-1 transition hover:bg-black/5 ${focusRing}`}
              >
                <SikhiIcon name={l.icon} size={26} />
                <span className="flex flex-col leading-tight">
                  <span className="text-xs xl:text-sm font-bold">{l.title}</span>
                  <span className="hidden xl:block text-[10px] font-semibold" style={{ color: "var(--theme-text-muted)" }}>
                    {l.sub}
                  </span>
                </span>
              </Link>
            </li>
          ))}

          <li className="shrink-0">
            <ThemeSwitcher />
          </li>

          {user ? (
            <li className="shrink-0 flex items-center gap-2">
              <Link
                href="/sangat?studio=1"
                style={{
                  borderColor: "var(--border-subtle)",
                  color: "var(--accent-primary)",
                }}
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold transition hover:border-[#C59B27] ${focusRing}`}
                title="Open Researcher Profile Studio"
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={() => void signOut()}
                style={{
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
                className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs xl:text-sm font-semibold transition hover:opacity-80 ${focusRing}`}
                title={user.email ?? undefined}
              >
                Sign out
              </button>
            </li>
          ) : (
            <li className="shrink-0">
              <Link
                href="/login"
                style={{
                  backgroundColor: "var(--accent-primary)",
                  color: "#FFFFFF",
                }}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs xl:text-sm font-bold shadow-sm transition hover:brightness-105 ${focusRing}`}
              >
                Sign in
              </Link>
            </li>
          )}
        </ul>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeSwitcher />
          <button
            type="button"
            style={{
              borderColor: "var(--border-subtle)",
              color: "var(--accent-primary)",
            }}
            className={`whitespace-nowrap rounded-md border px-3 py-1.5 text-xs uppercase tracking-[0.2em] font-semibold ${focusRing}`}
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </nav>

      <div
        id={menuId}
        hidden={!open}
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
          color: "var(--text-primary)",
        }}
        className="animate-fade-in-up mx-4 mb-3 rounded-2xl border p-3 shadow-xl backdrop-blur-md lg:hidden"
      >
        <ul className="flex flex-col gap-1">
          {[...LINKS, ...MOBILE_EXTRA_LINKS].map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition hover:opacity-80"
              >
                {"icon" in l && l.icon ? <SikhiIcon name={l.icon} size={28} /> : <span className="w-7" />}
                <span className="flex flex-col leading-tight">
                  <span className="text-sm font-bold">{l.title}</span>
                  <span className="text-xs" style={{ color: "var(--theme-text-muted)" }}>{l.sub}</span>
                </span>
              </Link>
            </li>
          ))}
          {user ? (
            <li>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  void signOut();
                }}
                className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold opacity-80 hover:opacity-100"
              >
                Sign out
              </button>
            </li>
          ) : (
            <li>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                style={{ color: "var(--accent-primary)" }}
                className="block rounded-lg px-3 py-2.5 text-sm font-bold"
              >
                Sign in
              </Link>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}

export const Navbar = Header;
export default Header;

