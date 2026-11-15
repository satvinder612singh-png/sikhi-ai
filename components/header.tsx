"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useAuth } from "@/components/auth-provider";

const ADMIN_STORAGE_KEY = "learnsikhi_founder_admin_v1";
const ADMIN_EMAIL_STORAGE_KEY = "learnsikhi_active_email_v1";

function isStealthAdminEmail(email?: string | null): boolean {
  return Boolean(email && email.trim().toLowerCase().endsWith("student1313@learnsikhi.com"));
}

/**
 * Publication-grade primary navigation: typography only, no emoji or icon
 * glyphs, and no duplicate links (Community lives on Home, Live Kirtan lives
 * inside Granths, Hukamnama lives inside Daily Bani).
 */
const LINKS: { href: string; title: string; sub?: string }[] = [
  { href: "/", title: "Home", sub: "SikhStack & SikhInterest" },
  { href: "/foundations", title: "Foundations" },
  { href: "/nitnem", title: "Daily Bani" },
  { href: "/granths", title: "Granths & Kirtan" },
  { href: "/matriarchs", title: "Sikh Women" },
  { href: "/games", title: "Vidyala" },
];

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B27]";

export function Header({ solid = false }: { solid?: boolean }) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isStealthAdmin, setIsStealthAdmin] = useState(false);
  const menuId = useId();

  useEffect(() => {
    const syncAdminState = () => {
      try {
        const storedEmail = window.localStorage.getItem(ADMIN_EMAIL_STORAGE_KEY);
        const emailUnlocked = isStealthAdminEmail(user?.email) || isStealthAdminEmail(storedEmail);
        if (emailUnlocked) {
          window.localStorage.setItem(ADMIN_STORAGE_KEY, "true");
          setIsStealthAdmin(true);
        } else {
          if (window.localStorage.getItem(ADMIN_STORAGE_KEY) === "true" && !storedEmail && !user?.email) {
            window.localStorage.removeItem(ADMIN_STORAGE_KEY);
          }
          setIsStealthAdmin(false);
        }
      } catch {
        setIsStealthAdmin(isStealthAdminEmail(user?.email));
      }
    };

    syncAdminState();
    window.addEventListener("storage", syncAdminState);
    window.addEventListener("focus", syncAdminState);
    window.addEventListener("learnsikhi-admin-change", syncAdminState);
    return () => {
      window.removeEventListener("storage", syncAdminState);
      window.removeEventListener("focus", syncAdminState);
      window.removeEventListener("learnsikhi-admin-change", syncAdminState);
    };
  }, [user?.email]);

  const handleSignOut = async () => {
    try {
      window.localStorage.removeItem(ADMIN_STORAGE_KEY);
      window.localStorage.removeItem(ADMIN_EMAIL_STORAGE_KEY);
      window.dispatchEvent(new Event("learnsikhi-admin-change"));
    } catch {
      // ignore storage errors
    }
    setIsStealthAdmin(false);
    await signOut();
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

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
          aria-label="Learn Sikhi — Home"
          className={`flex shrink-0 items-center gap-2.5 rounded-lg py-0.5 whitespace-nowrap ${focusRing}`}
        >
          <BrandLogo size="sm" />
          <span className="whitespace-nowrap font-serif text-xl sm:text-2xl font-bold tracking-wide">
            Learn <span style={{ color: "var(--accent-primary)" }}>Sikhi</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 xl:gap-2 lg:flex">
          {LINKS.map((l) => {
            const active = isActive(l.href);
            return (
              <li key={l.href} className="shrink-0">
                <Link
                  href={l.href}
                  title={l.sub}
                  aria-current={active ? "page" : undefined}
                  className={`block whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm transition hover:bg-black/5 ${
                    active ? "font-bold" : "font-medium opacity-80 hover:opacity-100"
                  } ${focusRing}`}
                  style={active ? { color: "var(--accent-primary)" } : undefined}
                >
                  {l.title}
                </Link>
              </li>
            );
          })}

          <li className="shrink-0 pl-2">
            <ThemeSwitcher />
          </li>

          {user ? (
            <li className="shrink-0 flex items-center gap-2">
              <Link
                href="/?studio=1"
                style={{ borderColor: "var(--border-subtle)" }}
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:border-[#C59B27] ${focusRing}`}
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                title={user.email ?? undefined}
                className={`whitespace-nowrap px-2 py-1.5 text-xs font-medium opacity-75 hover:opacity-100 ${focusRing}`}
              >
                Sign out
              </button>
            </li>
          ) : (
            <li className="shrink-0">
              <Link
                href="/login"
                style={{ backgroundColor: "var(--accent-primary)", color: "#FFFFFF" }}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold shadow-sm transition hover:brightness-105 ${focusRing}`}
              >
                Sign in
              </Link>
            </li>
          )}

          {isStealthAdmin && (
            <li className="shrink-0">
              <Link
                href="/admin"
                className={`whitespace-nowrap px-1.5 py-1.5 text-[11px] font-medium uppercase tracking-wider opacity-70 hover:opacity-100 ${focusRing}`}
              >
                Admin
              </Link>
            </li>
          )}
        </ul>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeSwitcher />
          <button
            type="button"
            style={{ borderColor: "var(--border-subtle)" }}
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
        className="mx-4 mb-3 rounded-2xl border p-2 shadow-xl lg:hidden"
      >
        <ul className="flex flex-col">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-baseline justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-black/5"
              >
                <span className={`text-sm ${isActive(l.href) ? "font-bold" : "font-medium"}`}>
                  {l.title}
                </span>
                {l.sub && (
                  <span className="text-xs" style={{ color: "var(--theme-text-muted)" }}>
                    {l.sub}
                  </span>
                )}
              </Link>
            </li>
          ))}
          <li className="mt-1 border-t pt-1" style={{ borderColor: "var(--border-subtle)" }}>
            {user ? (
              <div className="flex items-center justify-between px-3 py-2">
                <Link href="/?studio=1" onClick={() => setOpen(false)} className="text-sm font-medium">
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    void handleSignOut();
                  }}
                  className="text-sm font-medium opacity-75"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                style={{ color: "var(--accent-primary)" }}
                className="block px-3 py-2.5 text-sm font-bold"
              >
                Sign in
              </Link>
            )}
          </li>
          {isStealthAdmin && (
            <li>
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-xs uppercase tracking-wider opacity-70"
              >
                Admin
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
