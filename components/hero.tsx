"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { Header } from "@/components/header";
import { SearchBar, SuggestionChips } from "@/components/search-bar";

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function go(text: string) {
    router.push(`/ask?q=${encodeURIComponent(text)}`);
  }

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      style={{
        backgroundColor: "var(--bg-primary)",
        borderColor: "var(--border-subtle)",
        color: "var(--text-primary)",
      }}
      className="relative isolate overflow-hidden border-b"
    >
      {/* Subtle Ambient Darbar Gold Aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--accent-primary, #C59B27) 14%, transparent), transparent 70%)",
        }}
      />

      <Header />

      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center px-5 py-20 sm:py-24 text-center sm:px-8">
        <div className="mb-6 flex flex-col items-center">
          <BrandLogo size="lg" animated={true} />
        </div>

        <p
          lang="pa"
          style={{ color: "var(--accent-primary)" }}
          className="mb-2 font-gurmukhi text-lg font-medium tracking-wide sm:text-xl"
        >
          ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ
        </p>

        <p
          style={{ color: "var(--theme-text-muted)" }}
          className="mb-4 text-xs font-bold uppercase tracking-[0.28em]"
        >
          Explore the depths of Sikhi
        </p>

        <h1
          id="hero-title"
          className="font-serif text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl"
        >
          A calm, source-first{" "}
          <span
            style={{ color: "var(--accent-primary)" }}
            className="underline decoration-[#C59B27]/30 decoration-2 underline-offset-8"
          >
            Sikhi sanctuary
          </span>
        </h1>

        <p
          style={{ color: "var(--theme-text-muted)" }}
          className="mt-5 max-w-2xl text-base leading-relaxed sm:text-lg"
        >
          Read daily Gurbani and Hukamnama, listen to Puratan Raag Kirtan, study
          historical Granths, honor the unsung Matriarchs of the Panth, and learn
          through interactive Abhiyaas.
        </p>

        {/* Smart Concierge Search Bar */}
        <div className="mt-10 w-full max-w-2xl">
          <SearchBar value={query} onChange={setQuery} onSubmit={go} />
          <SuggestionChips onPick={go} className="mt-4 justify-center" />
        </div>

        {/* Minimal Quick Sanctuary Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold">
          <Link
            href="/hukamnama"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
            }}
            className="rounded-full border px-4 py-2 shadow-sm transition hover:border-[#C59B27]"
          >
            ੧ · Today&apos;s Darbar Sahib Hukamnama →
          </Link>
          <Link
            href="/nitnem"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
            }}
            className="rounded-full border px-4 py-2 shadow-sm transition hover:border-[#C59B27]"
          >
            ੨ · Nitnem &amp; Sukhmani Sahib Reader →
          </Link>
          <Link
            href="/live-kirtan"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
            }}
            className="rounded-full border px-4 py-2 shadow-sm transition hover:border-[#C59B27] inline-flex items-center gap-1.5"
          >
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
            ੩ · Live 24/7 Darbar Sahib Kirtan →
          </Link>
          <Link
            href="/granths"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
            }}
            className="rounded-full border px-4 py-2 shadow-sm transition hover:border-[#C59B27]"
          >
            ੪ · Granths &amp; Puratan Raag →
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;
