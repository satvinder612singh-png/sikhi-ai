"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
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
      className="relative isolate overflow-hidden bg-midnight-950"
    >
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-midnight-900 via-[#10172e] to-[#1a1a24]" />
      <div className="absolute inset-0 -z-20 opacity-80">
        <TempleSilhouette />
      </div>
      {HERO_IMAGE && (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-midnight-950/80 via-midnight-950/55 to-midnight-900" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_0%,rgba(212,169,76,0.18),transparent_60%)]" />

      <Navbar />

      <div className="mx-auto flex min-h-[92vh] max-w-4xl flex-col items-center justify-center px-5 pb-24 pt-32 text-center sm:px-8">
        <p lang="pa" className="mb-5 font-gurmukhi text-lg tracking-wide text-gold sm:text-xl">
          ਸਿੱਖੀ · ਗੁਰਬਾਣੀ · ਇਤਿਹਾਸ
        </p>

        <h1
          id="hero-title"
          className="font-serif text-5xl font-semibold leading-[1.05] tracking-tight text-gold-pale sm:text-7xl"
        >
          Explore Sikhi with{" "}
          <span className="bg-gradient-to-r from-[#f6e2a0] via-gold to-[#f6e2a0] bg-clip-text text-transparent">
            clarity and context
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
          Sikhi AI helps you learn Sikh philosophy, history and Gurbani through clear
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
