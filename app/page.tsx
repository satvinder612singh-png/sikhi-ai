"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Hero } from "@/components/hero";
import { DailyHukamnama } from "@/components/daily-hukamnama";
import { ManglacharanSpotlight } from "@/components/manglacharan-spotlight";
import { MoolMantarExplorer } from "@/components/mool-mantar-explorer";
import { SevaPathFinderInline } from "@/components/seva-concierge";
import { Footer } from "@/components/footer";
import { SikhiFoundationsDeck } from "@/components/sikhi-foundations-deck";
import { ChitrakariCardHeader, type ChitrakariVariant } from "@/components/chitrakari-card-header";
import { SikhiIcon, type SikhiIconName } from "@/components/sikhi-icons";

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
  icon: SikhiIconName;
  art: { artKey: string; variant: ChitrakariVariant };
};

const PILLAR_GATEWAYS: PillarGateway[] = [
  {
    id: "gurbani-nitnem",
    numeral: "੧",
    eyebrow: "PILLAR I • SABAD GURU & DAILY BANI",
    title: "Daily Bani & Hukamnama",
    icon: "scroll",
    art: { artKey: "home-bani", variant: "manuscript" },
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
    eyebrow: "PILLAR II • RAAG DARBAR & INTERACTIVE BOOKREADER",
    title: "Granths & Live Kirtan",
    icon: "rabab",
    art: { artKey: "darbar-sahib", variant: "darbar" },
    gurmukhi: "ਪੁਰਾਤਨ ਕੀਰਤਨ ਅਤੇ ਇਤਿਹਾਸਕ ਗ੍ਰੰਥ",
    href: "/granths",
    ctaLabel: "Enter Raag Darbar & Granth Library →",
    description:
      "Stream authentic Puratan Kirtan by Bhai Avtar Singh Ji with our persistent bottom mini-player, and explore our Dual-Mode 2-Up BookReader & Live Ang 1–1430 Darpan Viewer.",
    highlights: [
      "Verified Archive.org Puratan Kirtan MP3s & Playlist Player",
      "Prof. Sahib Singh Darpan (Ang 1–1430), Panth Prakash & Suraj Prakash",
      "Puratan SGGS Manuscript, Pracheen Reet Ratnavli & Khalsa Dharam Shastar",
    ],
  },
  {
    id: "matriarchs",
    numeral: "੩",
    eyebrow: "PILLAR III • SOVEREIGN EQUALITY (ANG 473)",
    title: "Sikh Women (Matriarchs)",
    icon: "lotus-dome",
    art: { artKey: "mai-bhago", variant: "woman" },
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
    title: "Games (Abhiyaas)",
    icon: "dhaal",
    art: { artKey: "home-games", variant: "horse" },
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

type DeepDiveResource = {
  numeral: string;
  tag: string;
  name: string;
  gurmukhi: string;
  description: string;
  links: { label: string; url: string }[];
};

const DEEP_DIVE_RESOURCES: DeepDiveResource[] = [
  {
    numeral: "੧",
    tag: "CLASSICAL GRANTHS & EXEGESIS",
    name: "Manglacharan",
    gurmukhi: "ਮੰਗਲਾਚਰਨ",
    description:
      "Translations and scholarly commentary on classical Braj and Gurmukhi Sikh texts (such as Suraj Prakash, Panth Prakash, and Sarbloh Granth).",
    links: [
      { label: "Explore Manglacharan.com ↗", url: "https://manglacharan.com" },
    ],
  },
  {
    numeral: "੨",
    tag: "SOVEREIGNTY & PHILOSOPHY",
    name: "Bunga Azadi",
    gurmukhi: "ਬੁੰਗਾ ਆਜ਼ਾਦੀ",
    description:
      "Deep-dive discussions on Sikh sovereignty, philosophy, colonial history, and Panthic literature.",
    links: [
      {
        label: "Bunga Azadi YouTube ↗",
        url: "https://www.youtube.com/@BungaAzadi",
      },
      {
        label: "Bunga Azadi Instagram ↗",
        url: "https://www.instagram.com/bungaazadi/",
      },
    ],
  },
  {
    numeral: "੩",
    tag: "VERIFIED HISTORICAL ARCHIVES",
    name: "Never Forget 1984",
    gurmukhi: "੧੯੮੪ ਇਤਿਹਾਸਕ ਦਸਤਾਵੇਜ਼",
    description:
      "Verified historical archives, eyewitness testimonies, and human-rights documentation of June & November 1984 and Shaheed biographies.",
    links: [
      {
        label: "NeverForget84 (Wayback Archive) ↗",
        url: "https://web.archive.org/web/20160618115353/http://www.neverforget84.com/",
      },
      { label: "1984 Tribute ↗", url: "https://1984tribute.com/" },
      { label: "Ensaaf Documentation ↗", url: "https://ensaaf.org/" },
    ],
  },
  {
    numeral: "੪",
    tag: "KIRTAN, KATHA & POTHIS",
    name: "Gurmat Veechar",
    gurmukhi: "ਗੁਰਮਤਿ ਵਿਚਾਰ",
    description:
      "Comprehensive digital archive of Puratan Kirtan, classical Katha recordings, and downloadable Granth PDFs.",
    links: [
      {
        label: "Explore GurmatVeechar.com ↗",
        url: "https://www.gurmatveechar.com",
      },
    ],
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

      {/* 2B. Rotating Manglacharan Classical Granth Spotlight */}
      <section
        id="manglacharan-spotlight"
        aria-label="Manglacharan Classical Granth Spotlight"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <ManglacharanSpotlight />
      </section>

      {/* 2C. Who is a Sikh? & Foundations of Sikhi interactive deck */}
      <section
        id="foundations"
        aria-label="Foundations of Sikhi"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        <SikhiFoundationsDeck />
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
                <ChitrakariCardHeader
                  artKey={pillar.art.artKey}
                  variant={pillar.art.variant}
                  title={pillar.title}
                  heightClass="h-44"
                />
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2.5">
                    <SikhiIcon name={pillar.icon} size={40} />
                    <span
                      lang="pa"
                      style={{ color: "var(--accent-primary)" }}
                      className="font-gurmukhi text-xl font-bold"
                    >
                      {pillar.numeral}
                    </span>
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

      {/* 5. Smart Path-Finder, SikhInterest & Vichaar Gateway & "Want to Learn More?" */}
      <section
        id="sangat"
        aria-labelledby="learn-more-heading"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-16"
      >
        <div
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
          className="rounded-3xl border-2 border-[#C59B27]/55 p-8 sm:p-10 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        >
          <div className="space-y-2 max-w-2xl">
            <span
              style={{ color: "var(--accent-primary)" }}
              className="text-xs font-bold uppercase tracking-[0.22em]"
            >
              NEW COMMUNITY HUB • SUBSTACK + PINTEREST + DIL DI BAAT
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold">
              SikhInterest &amp; Vichaar (/sangat)
            </h2>
            <p
              style={{ color: "var(--theme-text-muted)" }}
              className="text-sm sm:text-base leading-relaxed"
            >
              Publish long-form Gurbani &amp; history research essays, curate visual pins of
              Sikh art and calligraphy, share personal reflections in Dil Di Baat, and
              customize your Researcher Profile Studio.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/sangat"
              className="rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#18181B] shadow-sm transition hover:brightness-105"
            >
              Enter SikhInterest &amp; Vichaar (/sangat) →
            </Link>
          </div>
        </div>

        <SevaPathFinderInline />

        <div className="space-y-10">
          <div className="max-w-3xl">
            <p
              style={{ color: "var(--accent-primary)" }}
              className="text-xs font-bold uppercase tracking-[0.25em] mb-2"
            >
              Deep-Dive Resources • Independent Scholarship
            </p>
            <h2
              id="learn-more-heading"
              className="text-3xl sm:text-5xl font-serif font-bold tracking-tight"
            >
              Want to Learn More? Explore Independent Sikhi Archives &amp; Research
            </h2>
            <p
              style={{ color: "var(--theme-text-muted)" }}
              className="mt-3 text-base leading-relaxed"
            >
              If you want to dive deeper into classical Sikh manuscripts, philosophy, and
              historical documentation, explore these respected resources:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {DEEP_DIVE_RESOURCES.map((item) => (
              <article
                key={item.name}
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-subtle)",
                }}
                className="rounded-3xl border p-7 sm:p-8 shadow-sm hover:border-[#C59B27] transition flex flex-col justify-between gap-6"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span
                      lang="pa"
                      style={{
                        backgroundColor: "var(--theme-card-darker)",
                        borderColor: "var(--border-subtle)",
                        color: "var(--accent-primary)",
                      }}
                      className="h-9 w-9 rounded-xl border font-gurmukhi text-sm font-bold flex items-center justify-center"
                    >
                      {item.numeral}
                    </span>
                    <span
                      style={{ color: "var(--accent-primary)" }}
                      className="text-[11px] font-bold uppercase tracking-[0.18em]"
                    >
                      {item.tag}
                    </span>
                  </div>

                  <div>
                    <p
                      lang="pa"
                      style={{ color: "var(--accent-primary)" }}
                      className="font-gurmukhi text-sm font-medium"
                    >
                      {item.gurmukhi}
                    </p>
                    <h3 className="text-2xl font-serif font-bold mt-0.5">
                      {item.name}
                    </h3>
                  </div>

                  <p
                    style={{ color: "var(--theme-text-muted)" }}
                    className="text-sm sm:text-base leading-relaxed"
                  >
                    {item.description}
                  </p>
                </div>

                <div
                  style={{ borderColor: "var(--border-subtle)" }}
                  className="pt-4 border-t flex flex-wrap items-center gap-2.5"
                >
                  {item.links.map((lnk) => (
                    <a
                      key={lnk.url}
                      href={lnk.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: "var(--theme-card-darker)",
                        borderColor: "var(--border-subtle)",
                        color: "var(--accent-primary)",
                      }}
                      className="px-3.5 py-2 rounded-xl border text-xs font-bold hover:border-[#C59B27] transition"
                    >
                      {lnk.label}
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

