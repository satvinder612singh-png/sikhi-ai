"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { Icon } from "@/components/icons";
import { useAuth } from "@/components/auth-provider";

const LINKS = [
  { href: "/#sources", label: "Sources" },
  { href: "/#explore", label: "Explore" },
];

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-gold";

/** `solid` = normal flow with a background (inner pages); otherwise overlays the hero. */
export function Navbar({ solid = false }: { solid?: boolean }) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  return (
    <header
      className={
        solid
          ? "relative z-30 border-b border-gold/15 bg-midnight-950"
          : "absolute inset-x-0 top-0 z-30"
      }
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8"
      >
        <Link href="/" className={`flex items-center gap-2.5 rounded-md ${focusRing}`}>
          <span
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/60 bg-gold/10 font-gurmukhi text-lg text-gold-light"
          >
            ੴ
          </span>
          <span className="font-serif text-2xl font-semibold tracking-wide text-gold-pale">
            Sikhi <span className="text-gold">AI</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`rounded text-sm tracking-wide text-slate-300 transition-colors hover:text-gold-light ${focusRing}`}
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
                  className={`rounded-full border border-gold/70 px-4 py-2 text-sm font-medium text-gold-light transition hover:bg-gold hover:text-midnight-900 ${focusRing}`}
                >
                  Ask a question
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className={`rounded text-sm text-slate-400 transition-colors hover:text-gold-light ${focusRing}`}
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
                className={`rounded-full border border-gold/70 px-4 py-2 text-sm font-medium text-gold-light transition hover:bg-gold hover:text-midnight-900 ${focusRing}`}
              >
                Sign in
              </Link>
            </li>
          )}
        </ul>

        <button
          type="button"
          className={`rounded-md p-2 text-slate-200 hover:text-gold-light md:hidden ${focusRing}`}
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
        className="mx-5 rounded-2xl border border-white/10 bg-midnight-900/95 p-3 backdrop-blur md:hidden"
      >
        <ul className="flex flex-col gap-1">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-slate-200 hover:bg-white/5 hover:text-gold-light"
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
                  className="block rounded-lg px-3 py-2.5 text-gold-light hover:bg-white/5"
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
                  className="block w-full rounded-lg px-3 py-2.5 text-left text-slate-300 hover:bg-white/5"
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
                className="block rounded-lg px-3 py-2.5 text-gold-light hover:bg-white/5"
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
