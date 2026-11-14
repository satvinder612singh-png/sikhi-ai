"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Hero } from "@/components/hero";
import { DailyHukamnama } from "@/components/daily-hukamnama";
import { MoolMantarExplorer } from "@/components/mool-mantar-explorer";
import { SevaPathFinderInline } from "@/components/seva-concierge";
import { Footer } from "@/components/footer";

type PillarGateway = {
  id: string;
  numeral: string;
  eyebrow: string;
  title: string;
  gurmukhi: string;
  href: string;
  ctaLabel: string;
  description: string;
  highlights: string[];
};

const PILLAR_GATEWAYS: PillarGateway[] = [
  {
    id: "gurbani-nitnem",
    numeral: "੧",
    eyebrow: "PILLAR I • SABAD GURU & DAILY BANI",
    title: "Gurbani & Nitnem Sanctuary",
    gurmukhi: "ਗੁਰਬਾਣੀ ਅਤੇ ਨਿਤਨੇਮ",
    href: "/nitnem",
    ctaLabel: "Open Nitnem & Bani Reader →",
    description:
      "Read Morning & Evening Nitnem, all 24 Ashtpadis of Sukhmani Sahib, and Asa Di Vaar in a distraction-free reader with Larivaar/Padchhed toggles, Viakhia, and adjustable typography.",
    highlights: [
      "Japji Sahib, Jaap Sahib, Savaiye, Chaupai Sahib & Anand Sahib",
      "Rehras Sahib, Kirtan Sohila & 24 Ashtpadis of Sukhmani Sahib",
      "Live Padchhed / Larivaar toggle & Punjabi Teeka",
    ],
  },
  {
    id: "granths-kirtan",
    numeral: "੨",
    eyebrow: "PILLAR II • RAAG DARBAR & CLASSICAL EXEGESIS",
    title: "Granths & Puratan Kirtan",
    gurmukhi: "ਪੁਰਾਤਨ ਕੀਰਤਨ ਅਤੇ ਇਤਿਹਾਸਕ ਗ੍ਰੰਥ",
    href: "/granths",
    ctaLabel: "Enter Raag Darbar & Granth Library →",
    description:
      "Listen to authentic Puratan Kirtan across Raag Asa, Bilaaval, Tukhari, and Kalyan with our persistent bottom mini-player, and study primary Granth PDFs and Teekas inline.",
    highlights: [
      "Bhai Avtar Singh Ji, Bhai Gurmej Singh Ji & Sant Sujan Singh Ji",
      "Prof. Sahib Singh's 10-Vol Darpan, Panth Prakash & Suraj Prakash",
      "Bhai Gurdas Ji Vaaran, Bhai Nand Lal Ghazals & Mahan Kosh",
    ],
  },
  {
    id: "matriarchs",
    numeral: "੩",
    eyebrow: "PILLAR III • SOVEREIGN EQUALITY (ANG 473)",
    title: "Matriarchs of the Panth",
    gurmukhi: "ਪੰਥ ਦੀਆਂ ਮਹਾਨ ਸਿੰਘਣੀਆਂ ਅਤੇ ਮਾਤਾਵਾਂ",
    href: "/matriarchs",
    ctaLabel: "Explore All 13 Matriarchs & Warriors →",
    description:
      "Honor 13 renowned and unsung Sikh women—from Bebe Nanaki Ji and Mata Khivi Ji to Bibi Sharan Kaur Pabla, Mai Bhago Ji, Rani Sada Kaur, Maharani Jind Kaur, and Bibi Gulab Kaur.",
    highlights: [
      "Spiritual Pioneers, Battlefield Commanders & Diplomats",
      "Martyrs of Chamkaur Sahib, Sirhind, and the 1978–1984 Morchas",
      "Primary scriptural & historical archival citations",
    ],
  },
  {
    id: "abhiyaas-games",
    numeral: "੪",
    eyebrow: "PILLAR IV • GAMIFIED LEARNING (50-COIN TREASURY)",
    title: "Interactive Abhiyaas Games",
    gurmukhi: "ਗੁਰਮਤਿ ਅਭਿਆਸ ਅਤੇ ਖੇਡਾਂ",
    href: "/games",
    ctaLabel: "Launch Interactive Games Hub →",
    description:
      "Four interactive experiences for scholars, teens, and children—uniting Larivaar word-splitting, Sikh Shatranj tactical chess, Hola Mahalla sprints, and Painti Akhar literacy.",
    highlights: [
      "Larivaar Padchhed & Philosophical Arth Contemplation",
      "Sikh Shatranj (Dhai Phat) & Hola Mahalla Ghurdaur",
      "Children's Bujharto Riddles & 35 Painti Akhar Quest",
    ],
  },
];

const CONNECTED_ARCHIVES = [
  {
    numeral: "੧",
    tag: "CLASSICAL GRANTHS",
    name: "Manglacharan Archive",
    url: "https://www.manglacharan.com/",
    description:
      "Translations and literary analysis of Sri Gur Pratap Suraj Granth, Panth Prakash, and pre-colonial Khalsa chronicles.",
  },
  {
    numeral: "੨",
    tag: "CONTEMPORARY WITNESS",
    name: "1984 Tribute & Ensaaf",
    url: "https://1984tribute.com/",
    secondaryUrl: "https://ensaaf.org/",
    description:
      "Verified digital memorials and human-rights documentation of June & November 1984 and Shaheed biographies.",
  },
  {
    numeral: "੩",
    tag: "MIRI-PIRI THOUGHT",
    name: "Bunga Azaadi & SikhiToTheMax",
    url: "https://www.bungaazaadi.com/",
    secondaryUrl: "https://www.sikhitothemax.org/",
    description:
      "Indigenous Sikh political philosophy, Miri-Piri essays, and complete BaniDB Shabad concordance.",
  },
];

export default function HomePage() {
  const [showMoolMantar, setShowMoolMantar] = useState(false);

  return (
    <main
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
      className="min-h-screen"
    >
      {/* 1. Minimalist Hero & Smart Search */}
      <Hero />

      {/* 2. Compact Daily Sri Darbar Sahib Hukamnama Preview */}
      <section
        id="hukamnama-preview"
        aria-label="Today's Hukamnama from Sri Darbar Sahib, Amritsar"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-6"
      >
        <DailyHukamnama mode="preview" />
      </section>

      {/* 3. Four Clean Pillar Gateway Cards */}
      <section
        id="pillars"
        aria-labelledby="pillars-heading"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="max-w-3xl mb-12">
          <p
            style={{ color: "var(--accent-primary)" }}
            className="text-xs font-bold uppercase tracking-[0.25em] mb-2"
          >
            Four Dedicated Sanctuaries
          </p>
          <h2
            id="pillars-heading"
            className="text-3xl sm:text-5xl font-serif font-bold tracking-tight"
          >
            Explore Sikhi by Pillar
          </h2>
          <p
            style={{ color: "var(--theme-text-muted)" }}
            className="mt-3 text-base leading-relaxed"
          >
            Each domain lives in its own focused, distraction-free workspace so you can
            read, listen, research, and practice at your own pace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {PILLAR_GATEWAYS.map((pillar) => (
            <article
              key={pillar.id}
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
              }}
              className="group rounded-3xl border p-8 sm:p-10 shadow-sm hover:border-[#C59B27] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between gap-8"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span
                    lang="pa"
                    style={{
                      backgroundColor: "var(--theme-card-darker)",
                      borderColor: "var(--border-subtle)",
                      color: "var(--accent-primary)",
                    }}
                    className="h-10 w-10 rounded-xl border font-gurmukhi text-base font-bold flex items-center justify-center"
                  >
                    {pillar.numeral}
                  </span>
                  <span
                    style={{ color: "var(--accent-primary)" }}
                    className="text-[11px] font-bold uppercase tracking-[0.2em]"
                  >
                    {pillar.eyebrow}
                  </span>
                </div>

                <div>
                  <p
                    lang="pa"
                    style={{ color: "var(--accent-primary)" }}
                    className="font-gurmukhi text-base font-medium"
                  >
                    {pillar.gurmukhi}
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold mt-1">
                    <Link href={pillar.href} className="hover:underline">
                      {pillar.title}
                    </Link>
                  </h3>
                </div>

                <p
                  style={{ color: "var(--theme-text-muted)" }}
                  className="text-sm sm:text-base leading-relaxed"
                >
                  {pillar.description}
                </p>

                <ul className="space-y-2 pt-2">
                  {pillar.highlights.map((item) => (
                    <li
                      key={item}
                      style={{ color: "var(--theme-text-muted)" }}
                      className="flex items-start gap-2.5 text-xs sm:text-sm"
                    >
                      <span
                        style={{ color: "var(--accent-primary)" }}
                        className="font-bold mt-0.5"
                      >
                        •
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                style={{ borderColor: "var(--border-subtle)" }}
                className="pt-5 border-t flex items-center justify-between"
              >
                <Link
                  href={pillar.href}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#18181B] shadow-sm transition hover:brightness-105"
                >
                  {pillar.ctaLabel}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. Collapsible Mool Mantar & Japji Sahib Deep-Dive Preview */}
      <section
        id="mool-mantar"
        aria-labelledby="mool-mantar-heading"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
          className="rounded-3xl border p-8 sm:p-10 shadow-sm space-y-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span
                style={{ color: "var(--accent-primary)" }}
                className="text-xs font-bold uppercase tracking-[0.22em]"
              >
                FOUNDATIONAL REVELATION • SRI GURU GRANTH SAHIB JI (ANG 1)
              </span>
              <h2
                id="mool-mantar-heading"
                className="text-2xl sm:text-4xl font-serif font-bold"
              >
                Mool Mantar &amp; Japji Sahib Interactive Study
              </h2>
              <p
                style={{ color: "var(--theme-text-muted)" }}
                className="text-sm sm:text-base leading-relaxed"
              >
                Explore the 9 foundational attributes of Akal Purakh word-by-word with
                Gurbani grammar (*Viyakaran*) or step through all 38 Pauris of Japji Sahib.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowMoolMantar((v) => !v)}
                className="rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#18181B] shadow-sm transition hover:brightness-105"
              >
                {showMoolMantar
                  ? "Collapse Interactive Study ↑"
                  : "Expand Mool Mantar & 38 Pauris ↓"}
              </button>
              <Link
                href="/nitnem"
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--theme-card-darker)",
                }}
                className="rounded-xl border px-5 py-3 text-xs font-bold uppercase tracking-wider transition hover:border-[#C59B27]"
              >
                Full Nitnem Reader →
              </Link>
            </div>
          </div>

          {showMoolMantar && (
            <div className="pt-4">
              <MoolMantarExplorer />
            </div>
          )}
        </div>
      </section>

      {/* 5. Smart Path-Finder ("What Are You Looking For?") & Sangat Hub */}
      <section
        id="sangat"
        aria-labelledby="sangat-heading"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12"
      >
        <div className="max-w-3xl">
          <p
            style={{ color: "var(--accent-primary)" }}
            className="text-xs font-bold uppercase tracking-[0.25em] mb-2"
          >
            Sangat Concierge &amp; Connected Scholarship
          </p>
          <h2
            id="sangat-heading"
            className="text-3xl sm:text-5xl font-serif font-bold tracking-tight"
          >
            Guided Path-Finder &amp; Panthic Archives
          </h2>
          <p
            style={{ color: "var(--theme-text-muted)" }}
            className="mt-3 text-base leading-relaxed"
          >
            Not sure where to begin, going through a difficult moment, or searching for a
            specific historical Granth? Use the instant Path-Finder or submit a Seva request
            below.
          </p>
        </div>

        <SevaPathFinderInline />

        {/* Max 3 Cards Per Row for Connected Archives */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {CONNECTED_ARCHIVES.map((item) => (
            <div
              key={item.name}
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
              }}
              className="rounded-2xl border p-6 shadow-sm flex flex-col justify-between gap-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span
                    lang="pa"
                    style={{
                      backgroundColor: "var(--theme-card-darker)",
                      borderColor: "var(--border-subtle)",
                      color: "var(--accent-primary)",
                    }}
                    className="h-7 w-7 rounded-lg border font-gurmukhi text-xs font-bold flex items-center justify-center"
                  >
                    {item.numeral}
                  </span>
                  <span
                    style={{ color: "var(--accent-primary)" }}
                    className="text-[10px] font-bold uppercase tracking-[0.18em]"
                  >
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-lg font-serif font-bold">{item.name}</h3>
                <p
                  style={{ color: "var(--theme-text-muted)" }}
                  className="text-xs sm:text-sm leading-relaxed"
                >
                  {item.description}
                </p>
              </div>

              <div
                style={{ borderColor: "var(--border-subtle)" }}
                className="pt-3 border-t flex items-center justify-between text-xs font-bold"
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent-primary)" }}
                  className="hover:underline"
                >
                  Visit Archive ↗
                </a>
                {item.secondaryUrl && (
                  <a
                    href={item.secondaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--theme-text-muted)" }}
                    className="hover:underline"
                  >
                    Partner Link ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
