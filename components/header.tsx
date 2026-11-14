"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { Icon } from "@/components/icons";
import { useAuth } from "@/components/auth-provider";

const LINKS = [
  { href: "/#baani", label: "Gurbani" },
  { href: "/#matriarchs", label: "Matriarchs" },
  { href: "/sources", label: "Sources" },
  { href: "/#archives", label: "Explore" },
];

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B27]";

/**
 * Top navigation header integrating <BrandLogo size="sm" /> with
 * Warm Ivory & Deep Olive glassmorphism and Saffron / Burnished Gold accents.
 */
export function Header({ solid = false }: { solid?: boolean }) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  return (
    <header
      className={
        solid
          ? "sticky top-0 z-30 border-b border-[#C59B27]/35 bg-[#1B2A20]/95 text-[#FAF6EE] backdrop-blur-md shadow-sm"
          : "sticky top-0 z-30 border-b border-[#C59B27]/25 bg-[#1B2A20]/90 text-[#FAF6EE] backdrop-blur-md"
      }
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-8"
      >
        <Link
          href="/"
          aria-label="Learn Sikhi"
          className={`group flex items-center gap-3 rounded-lg py-0.5 transition ${focusRing}`}
        >
          <BrandLogo size="sm" />
          <div className="flex flex-col">
            <span className="font-serif text-2xl font-bold tracking-wide text-[#FAF6EE] transition-colors group-hover:text-[#E5C158]">
              Learn <span className="text-[#E5C158] group-hover:text-[#D97706] transition-colors">Sikhi</span>
            </span>
          </div>
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`rounded text-sm font-medium tracking-wide text-[#F3ECE0]/90 transition-colors hover:text-[#E5C158] ${focusRing}`}
              >
                {l.label}
              </Link>
            </li>
          ))}
          {user ? (
            <>
              <li>
                <Link
                  href="/ask"
                  className={`rounded-full border border-[#C59B27] bg-gradient-to-r from-[#C59B27] to-[#D97706] px-4 py-2 text-sm font-semibold text-[#171917] shadow-sm transition hover:brightness-110 ${focusRing}`}
                >
                  Ask a question
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className={`rounded text-sm text-[#F3ECE0]/80 transition-colors hover:text-[#E5C158] ${focusRing}`}
                  title={user.email ?? undefined}
                >
                  Sign out
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link
                href="/login"
                className={`rounded-full border border-[#C59B27]/80 bg-[#FAF6EE]/10 px-4 py-2 text-sm font-medium text-[#FAF6EE] transition hover:border-[#D97706] hover:bg-[#D97706] hover:text-[#FAF6EE] ${focusRing}`}
              >
                Sign in
              </Link>
            </li>
          )}
        </ul>

        <button
          type="button"
          className={`rounded-md p-2 text-[#FAF6EE] hover:text-[#E5C158] md:hidden ${focusRing}`}
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? "close" : "menu"} className="h-6 w-6" />
        </button>
      </nav>

      <div
        id={menuId}
        hidden={!open}
        className="mx-5 mb-3 rounded-2xl border border-[#C59B27]/35 bg-[#1B2A20]/98 p-3 text-[#FAF6EE] shadow-xl backdrop-blur-md md:hidden"
      >
        <ul className="flex flex-col gap-1">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-[#FAF6EE] transition hover:bg-[#FAF6EE]/10 hover:text-[#E5C158]"
              >
                {l.label}
              </Link>
            </li>
          ))}
          {user ? (
            <>
              <li>
                <Link
                  href="/ask"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-[#E5C158] hover:bg-[#FAF6EE]/10"
                >
                  Ask a question
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    void signOut();
                  }}
                  className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-[#F3ECE0]/80 hover:bg-[#FAF6EE]/10 hover:text-[#E5C158]"
                >
                  Sign out
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-[#E5C158] hover:bg-[#FAF6EE]/10"
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
