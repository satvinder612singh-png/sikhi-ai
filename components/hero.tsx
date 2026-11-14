"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { Header } from "@/components/header";
import { SearchBar, SuggestionChips } from "@/components/search-bar";
import { TempleSilhouette } from "@/components/temple-silhouette";

/**
 * Optional real photograph. Put a licensed Golden Temple image in /public and
 * set this to its path, e.g. "/images/golden-temple.jpg". While null, the SVG
 * scene is used and no failing image request is made.
 */
const HERO_IMAGE: string | null = null;

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  // Signed-out users are redirected to /login by middleware, then returned
  // to /ask with their question preserved.
  function go(text: string) {
    router.push(`/ask?q=${encodeURIComponent(text)}`);
  }

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden border-b border-[#C59B27]/35 bg-[#1B2A20] text-[#FAF6EE]"
    >
      {/* Rich Deep Olive & Burnished Gold Architectural Backdrop */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-[#121C15] via-[#1B2A20] to-[#233629]" />
      <div className="absolute inset-0 -z-20 opacity-45">
        <TempleSilhouette />
      </div>
      {HERO_IMAGE && (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#121C15]/80 via-[#1B2A20]/65 to-[#1B2A20]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_15%,rgba(197,155,39,0.22),rgba(217,119,6,0.08)_45%,transparent_72%)]" />

      <Header />

      <div className="mx-auto flex min-h-[88vh] max-w-4xl flex-col items-center justify-center px-5 pb-24 pt-16 text-center sm:px-8">
        {/* Interactive Martial Heritage Emblem (Kataar, Crossed Talwars & Dhaal) */}
        <div className="mb-6 flex flex-col items-center">
          <BrandLogo size="xl" animated={true} />
        </div>

        <p
          lang="pa"
          className="mb-3 font-gurmukhi text-lg tracking-wide text-[#E5C158] sm:text-xl"
        >
          ਸਿੱਖੀ · ਗੁਰਬਾਣੀ · ਇਤਿਹਾਸ
        </p>

        {/* Official Brand Tagline */}
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#D97706] sm:text-sm">
          Explore the depths of Sikhi.
        </p>

        <h1
          id="hero-title"
          className="font-serif text-5xl font-semibold leading-[1.06] tracking-tight text-[#FAF6EE] sm:text-7xl"
        >
          Explore Sikhi with{" "}
          <span className="bg-gradient-to-r from-[#E5C158] via-[#C59B27] to-[#D97706] bg-clip-text text-transparent">
            clarity and context
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#F3ECE0]/90 sm:text-lg">
          Learn Sikhi helps you explore Sikh philosophy, history and Gurbani through clear
          explanations, always pointing back to the sources so you can read, reflect
          and verify for yourself.
        </p>

        <div className="mt-10 w-full max-w-2xl">
          <SearchBar value={query} onChange={setQuery} onSubmit={go} />
          <SuggestionChips onPick={go} className="mt-4 justify-center" />
        </div>
      </div>
    </section>
  );
}

export default Hero;
