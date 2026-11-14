"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MoolMantarExplorer } from "@/components/mool-mantar-explorer";

interface PreloadedBani {
  id: string;
  numeral: string;
  archivalTag: string;
  title: string;
  gurmukhiTitle: string;
  author: string;
  raag: string;
  ang: number;
  sttmShabadId: number;
  historicalContext: string;
  philosophicalEssence: string;
  verses: {
    gurmukhi: string;
    transliteration: string;
    english: string;
  }[];
}

export interface InlineVerseResult {
  verseId: number;
  shabadId: number;
  pageNo: number;
  writer: string;
  raag: string;
  gurmukhiUnicode: string;
  transliteration: string;
  englishTranslation: string;
}

export interface InlineFullShabad {
  shabadId: number;
  pageNo: number;
  writer: string;
  raag: string;
  verses: InlineVerseResult[];
}

const PRELOADED_BANIS: PreloadedBani[] = [
  {
    id: "japji-mool-mantar",
    numeral: "੧",
    archivalTag: "ANG 1 • PROLOGUE • JAPJI SAHIB",
    title: "Japji Sahib — Mool Mantar & Pauri 1",
    gurmukhiTitle: "ਜਪੁਜੀ ਸਾਹਿਬ",
    author: "Guru Nanak Dev Ji",
    raag: "Prologue to Sri Guru Granth Sahib Ji",
    ang: 1,
    sttmShabadId: 1,
    historicalContext:
      "Revealed by Guru Nanak Dev Ji following his three-day immersion in the Kali Bein river at Sultanpur Lodhi (c. 1499). It serves as the foundational thesis of Sikhi.",
    philosophicalEssence:
      "Establishes Ik Onkar—the indivisible, genderless, formless, and fearless Creator—rejecting caste purity and ritualism in favor of aligning with Hukam (Cosmic Order).",
    verses: [
      {
        gurmukhi:
          "ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ ॥",
        transliteration:
          "Ik Oankaar Sat Naam Kartaa Purakh Nirbhau Nirvair Akaal Moorat Ajoonee Saibhan Gur Prasaad ||",
        english:
          "One Universal Creator God. The Name Is Truth. Creative Being Personified. No Fear. No Hatred. Image Of The Undying, Beyond Birth, Self-Existent. By Guru's Grace.",
      },
      {
        gurmukhi: "ਹੁਕਮੀ ਹੋਵਨਿ ਆਕਾਰ ਹੁਕਮੁ ਨ ਕਹਿਆ ਜਾਈ ॥",
        transliteration: "Hukamee Hovan Aakaar Hukam Na Kahiaa Jaaee ||",
        english:
          "By Hukam (the Divine Command), bodies and forms are created; Hukam cannot be described in words.",
      },
    ],
  },
  {
    id: "so-kio-mandaa",
    numeral: "੨",
    archivalTag: "ANG 473 • RAAG AASAA • ASA DI VAAR",
    title: "Asa Di Vaar — The Charter of Women's Sovereignty",
    gurmukhiTitle: "ਭੰਡਿ ਜੰਮੀਐ ਭੰਡਿ ਨਿੰਮੀਐ",
    author: "Guru Nanak Dev Ji",
    raag: "Raag Aasaa",
    ang: 473,
    sttmShabadId: 1797,
    historicalContext:
      "Composed in the early 16th century when both Brahmanical orthodoxy and medieval sultanates treated women as ritual pollution or property.",
    philosophicalEssence:
      "Directly dismantles patriarchal theology by pointing out that all human life, social bonds, and even kingship originate from women; only the Formless One is independent of woman.",
    verses: [
      {
        gurmukhi: "ਭੰਡਿ ਜੰਮੀਐ ਭੰਡਿ ਨਿੰਮੀਐ ਭੰਡਿ ਮੰਗਣੁ ਵੀਆਹੁ ॥",
        transliteration: "Bhand Jammeeai Bhand Nimmeeai Bhand Mangan Veeaahu ||",
        english:
          "From woman, man is born; within woman, man is conceived; to woman he is engaged and married.",
      },
      {
        gurmukhi: "ਸੋ ਕਿਉ ਮੰਦਾ ਆਖੀਐ ਜਿਤੁ ਜੰਮਹਿ ਰਾਜਾਨ ॥",
        transliteration: "So Kio Mandaa Aakheeai Jit Jammeh Raajaan ||",
        english:
          "So why call her inferior or polluted, from whom kings and sovereigns are born?",
      },
      {
        gurmukhi:
          "ਭੰਡਹੁ ਹੀ ਭੰਡੁ ਊਪਜੈ ਭੰਡੈ ਬਾਝੁ ਨ ਕੋਇ ॥ ਨਾਨਕ ਭੰਡੈ ਬਾਹਰਾ ਏਕੋ ਸਚਾ ਸੋਇ ॥",
        transliteration:
          "Bhandahu Hee Bhand Oopajai Bhandai Baajh Na Koe || Nanak Bhandai Baaharaa Eko Sachaa Soe ||",
        english:
          "From woman, woman is born; without woman, there would be no one at all. O Nanak, only the True One is independent of woman.",
      },
    ],
  },
  {
    id: "mata-khivi-var",
    numeral: "੩",
    archivalTag: "ANG 967 • RAAG RAMKALI • RAMKALI KI VAAR",
    title: "Ramkali Ki Vaar — Tribute to Mata Khivi Ji",
    gurmukhiTitle: "ਬਲਵੰਡੁ ਤਥਾ ਸਤਾ",
    author: "Bhatt Balwand & Satta Doom",
    raag: "Raag Ramkali",
    ang: 967,
    sttmShabadId: 3630,
    historicalContext:
      "Recorded by the court rababis Balwand and Satta, making Mata Khivi Ji the only historical woman explicitly praised by name in Sri Guru Granth Sahib Ji.",
    philosophicalEssence:
      "Celebrates feminine leadership and material generosity (Langar) as an equal pillar alongside spiritual meditation.",
    verses: [
      {
        gurmukhi: "ਬਲਵੰਡ ਖੀਵੀ ਨੇਕ ਜਨ ਜਿਸੁ ਬਹੁਤੀ ਛਾਉ ਪਤ੍ਰਾਲੀ ॥",
        transliteration: "Balvand Kheevee Nek Jan Jis Bahutee Chhaau Patraalee ||",
        english:
          "Says Balwand: Khivi is a noble and sovereign soul, who provides dense, leafy shade (sanctuary) to all.",
      },
      {
        gurmukhi: "ਲੰਗਰਿ ਦਉਲਤਿ ਵੰਡੀਐ ਰਸੁ ਅੰਮ੍ਰਿਤੁ ਖੀਰਿ ਘਿਆਲੀ ॥",
        transliteration: "Langar Daulat Vandeeai Ras Amrit Kheer Ghiaalee ||",
        english:
          "In her Langar, wealth is distributed freely—ambrosial kheer rich with pure ghee.",
      },
    ],
  },
  {
    id: "anand-sahib",
    numeral: "੪",
    archivalTag: "ANG 917 • RAAG RAMKALI • ANAND SAHIB",
    title: "Anand Sahib — The Song of Sovereign Bliss",
    gurmukhiTitle: "ਅਨੰਦੁ ਸਾਹਿਬ",
    author: "Guru Amar Das Ji",
    raag: "Raag Ramkali",
    ang: 917,
    sttmShabadId: 3393,
    historicalContext:
      "Revealed by the third Guru, Guru Amar Das Ji, at Goindwal Sahib—where he also established the 22 Manjis (spiritual dioceses) and appointed women as preachers.",
    philosophicalEssence:
      "Defines true spiritual bliss (Anand) not as escapism into forests, but as internal equilibrium achieved through the Guru's Shabad amidst everyday life.",
    verses: [
      {
        gurmukhi: "ਅਨੰਦੁ ਭਇਆ ਮੇਰੀ ਮਾਏ ਸਤਿਗੁਰੂ ਮੈ ਪਾਇਆ ॥",
        transliteration: "Anand Bhaiaa Meree Maae Satguroo Mai Paaiaa ||",
        english: "I am in ecstasy, O my mother, for I have found my True Guru.",
      },
    ],
  },
];

const QUICK_SEARCH_PRESETS = [
  { label: "“kings are born”", query: "kings are born" },
  { label: "“fearless”", query: "fearless" },
  { label: "“equality”", query: "equality" },
  { label: "“langar”", query: "langar" },
  { label: "Initials: stnk", query: "stnk" },
  { label: "Initials: skma", query: "skma" },
];

export function BaaniPortal() {
  const [selectedBani, setSelectedBani] = useState<PreloadedBani>(PRELOADED_BANIS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [searchResults, setSearchResults] = useState<InlineVerseResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Inline Full Shabad Reader State
  const [activeShabad, setActiveShabad] = useState<InlineFullShabad | null>(null);
  const [highlightedVerseId, setHighlightedVerseId] = useState<number | null>(null);
  const [isLoadingShabad, setIsLoadingShabad] = useState(false);
  const [shabadError, setShabadError] = useState("");

  const executeBaniSearch = async (rawQuery: string) => {
    const trimmed = rawQuery.trim();
    if (!trimmed) return;

    setSearchQuery(trimmed);
    setSubmittedQuery(trimmed);
    setIsSearching(true);
    setSearchError("");
    setHasSearched(true);
    setActiveShabad(null);
    setShabadError("");

    try {
      const res = await fetch(
        `/api/banidb?q=${encodeURIComponent(trimmed)}`
      );
      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Could not search BaniDB right now.");
      }

      setSearchResults(Array.isArray(data.verses) ? data.verses : []);
    } catch (err: any) {
      setSearchError(
        err?.message ||
          "Unable to fetch verses right now. Please try another keyword or initial."
      );
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGurbaniSearch = (e: React.FormEvent) => {
    e.preventDefault();
    void executeBaniSearch(searchQuery);
  };

  const openFullShabadInline = async (shabadId: number, verseId?: number) => {
    setIsLoadingShabad(true);
    setShabadError("");
    setHighlightedVerseId(verseId ?? null);

    try {
      const res = await fetch(
        `/api/banidb?shabadId=${encodeURIComponent(String(shabadId))}`
      );
      const data = await res.json();

      if (!res.ok || !data?.ok || !data?.shabad) {
        throw new Error("Could not load the full Shabad.");
      }

      setActiveShabad(data.shabad);
    } catch (err: any) {
      setShabadError(
        err?.message || "Unable to load full Shabad details right now."
      );
    } finally {
      setIsLoadingShabad(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* ====================================================================
          PART 1: PRE-CURATED FOUNDATIONAL HYMNS SANCTUARY
      ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#C59B27]/35 pb-2.5 mb-2">
            <span className="text-xs uppercase tracking-[0.22em] text-[#D97706] font-semibold">
              CURATED SCRIPTURAL FOLIOS
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-[#4A554E]">
              ፬ CANONICAL HYMNS
            </span>
          </div>
          {PRELOADED_BANIS.map((bani) => {
            const isActive = selectedBani.id === bani.id;
            return (
              <button
                key={bani.id}
                type="button"
                onClick={() => setSelectedBani(bani)}
                className={`w-full text-left p-5 rounded-xl border transition-all duration-300 ${
                  isActive
                    ? "bg-[#1B2A20] text-[#FAF6EE] border-[#C59B27] shadow-[0_10px_28px_rgba(27,42,32,0.22)]"
                    : "bg-[#F3ECE0] text-[#171917] border-[#C59B27]/35 hover:border-[#C59B27]"
                }`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      lang="pa"
                      className={`font-gurmukhi text-lg font-bold px-2.5 py-0.5 rounded border shrink-0 ${
                        isActive
                          ? "border-[#C59B27]/50 bg-[#121C15] text-[#E5C158]"
                          : "border-[#C59B27]/40 bg-[#FAF6EE] text-[#1B2A20]"
                      }`}
                    >
                      {bani.numeral}
                    </span>
                    <div>
                      <p
                        lang="pa"
                        className={`text-lg font-gurmukhi ${
                          isActive ? "text-[#E5C158]" : "text-[#D97706]"
                        }`}
                      >
                        {bani.gurmukhiTitle}
                      </p>
                      <h3
                        className={`text-base font-serif font-bold mt-0.5 ${
                          isActive ? "text-[#FAF6EE]" : "text-[#171917]"
                        }`}
                      >
                        {bani.title}
                      </h3>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded border shrink-0 ${
                      isActive
                        ? "bg-[#C59B27]/20 text-[#E5C158] border-[#C59B27]/40"
                        : "bg-[#1B2A20]/10 text-[#1B2A20] border-[#1B2A20]/20"
                    }`}
                  >
                    ANG {bani.ang}
                  </span>
                </div>
                <div
                  className={`mt-3 pt-2.5 border-t text-xs flex items-center justify-between ${
                    isActive
                      ? "border-[#C59B27]/25 text-[#F3ECE0]/75"
                      : "border-[#C59B27]/20 text-[#4A554E]"
                  }`}
                >
                  <span>{bani.author}</span>
                  <span className="uppercase tracking-wider text-[11px]">{bani.raag}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedBani.id}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.35 }}
              className="bg-[#1B2A20] text-[#FAF6EE] border border-[#C59B27]/45 rounded-2xl p-6 md:p-8 shadow-xl"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#C59B27]/25 pb-5">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#E5C158]">
                    {selectedBani.archivalTag} • {selectedBani.author}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-serif text-[#FAF6EE] mt-1">
                    {selectedBani.title}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => void openFullShabadInline(selectedBani.sttmShabadId)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#171917] font-semibold text-xs uppercase tracking-wider hover:brightness-105 transition"
                  >
                    Read Full Shabad Inline (Ang {selectedBani.ang}) →
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                <div className="p-4 rounded-xl bg-[#121C15]/80 border border-[#C59B27]/25">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#E5C158] mb-1">
                    Historical Context
                  </h4>
                  <p className="text-xs md:text-sm text-[#F3ECE0]/90 leading-relaxed">
                    {selectedBani.historicalContext}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#121C15]/80 border border-[#C59B27]/25">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#E5C158] mb-1">
                    Philosophical Essence
                  </h4>
                  <p className="text-xs md:text-sm text-[#F3ECE0]/90 leading-relaxed">
                    {selectedBani.philosophicalEssence}
                  </p>
                </div>
              </div>

              <div className="space-y-6 mt-6">
                {selectedBani.verses.map((v, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-xl bg-[#121C15] border border-[#C59B27]/30 space-y-2"
                  >
                    <p
                      lang="pa"
                      className="text-xl md:text-2xl font-gurmukhi text-[#FAF6EE] leading-relaxed"
                    >
                      {v.gurmukhi}
                    </p>
                    <p className="text-xs md:text-sm text-[#E5C158]/85 italic">
                      {v.transliteration}
                    </p>
                    <div className="h-[1px] w-full bg-[#C59B27]/20" />
                    <p className="text-sm md:text-base text-[#F3ECE0] pt-1 font-medium">
                      “{v.english}”
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ====================================================================
          PART 1B: MULTI-PAGE MOOL MANTAR & JAPJI SAHIB PAURI EXPLORER
      ==================================================================== */}
      <MoolMantarExplorer />

      {/* Direct Callout to Full Nitnem, Sukhmani Sahib & Complete Bani Reader */}
      <div className="p-6 rounded-2xl bg-[#121C15] border border-[#C59B27]/50 text-[#FAF6EE] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-[#E5C158] font-bold">
            COMPLETE NITNEM &amp; SUKHMANI SAHIB SANCTUARY
          </span>
          <h4 className="text-xl font-serif font-bold text-[#FAF6EE] mt-0.5">
            Read Complete Daily Nitnem, Sukhmani Sahib (All 24 Ashtpadis) &amp; Asa Di Vaar
          </h4>
        </div>
        <Link
          href="/nitnem"
          className="whitespace-nowrap inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#171917] shadow-md hover:brightness-105 transition"
        >
          Open Complete Bani Reader →
        </Link>
      </div>

      {/* ====================================================================
          PART 2: INLINE BANIDB SHABAD SEARCH & FULL SHABAD READER
      ==================================================================== */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#F3ECE0] border border-[#C59B27]/45 shadow-parchment">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#C59B27]/30 pb-5 mb-6">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#D97706]">
              CONCORDANCE &amp; SHABAD INDEX • BANIDB ARCHIVE
            </span>
            <h3 className="text-xl md:text-2xl font-serif font-bold text-[#171917] mt-1">
              Explore Any Shabad via SikhiToTheMax / BaniDB Portal
            </h3>
            <p className="text-xs md:text-sm text-[#4A554E] mt-1">
              Search and read Shabads directly inside this page by English theme (e.g., &ldquo;equality&rdquo;, &ldquo;fearless&rdquo;, &ldquo;kings are born&rdquo;) or Gurmukhi first-letter initials (e.g., &ldquo;stnk&rdquo;, &ldquo;skma&rdquo;). Select any verse below to read the entire Shabad inline.
            </p>
          </div>
          <a
            href="https://www.sikhitothemax.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold uppercase tracking-wider text-[#D97706] hover:underline shrink-0"
          >
            Open SikhiToTheMax Portal ↗
          </a>
        </div>

        {/* Search Input + Find Baani Submit Button (Supports Enter & Click) */}
        <form onSubmit={handleGurbaniSearch} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search English translation (e.g., 'kings are born', 'fearless') or first letters (e.g., 'stnk', 'skma')..."
            aria-label="Search Gurbani by English translation or Gurmukhi initials"
            className="flex-1 bg-[#FAF6EE] border border-[#C59B27]/55 rounded-xl px-4 py-3.5 text-sm md:text-base text-[#171917] placeholder-[#4A554E]/75 focus:outline-none focus:border-[#D97706] focus:ring-2 focus:ring-[#C59B27]/35"
          />
          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#171917] font-semibold text-sm hover:brightness-105 transition disabled:opacity-50 shrink-0 shadow-sm"
          >
            {isSearching ? "Searching..." : "Find Baani"}
          </button>
        </form>

        {/* Quick Search Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#4A554E] mr-1">
            Concordance Presets:
          </span>
          {QUICK_SEARCH_PRESETS.map((preset) => (
            <button
              key={preset.query}
              type="button"
              disabled={isSearching}
              onClick={() => void executeBaniSearch(preset.query)}
              className="text-xs px-3 py-1.5 rounded-full bg-[#FAF6EE] hover:bg-[#1B2A20] text-[#171917] hover:text-[#FAF6EE] border border-[#C59B27]/45 transition font-medium"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Loading Skeleton for Verse Search */}
        {isSearching && (
          <div
            role="status"
            aria-live="polite"
            className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6"
          >
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-[#1B2A20] border border-[#C59B27]/35 animate-pulse space-y-3"
              >
                <div className="flex justify-between">
                  <div className="h-3 w-28 rounded bg-[#C59B27]/30" />
                  <div className="h-3 w-20 rounded bg-[#C59B27]/20" />
                </div>
                <div className="h-6 w-4/5 rounded bg-[#FAF6EE]/20" />
                <div className="h-3.5 w-3/4 rounded bg-[#FAF6EE]/10" />
                <div className="h-4 w-full rounded bg-[#FAF6EE]/15" />
              </div>
            ))}
          </div>
        )}

        {/* Error Banner */}
        {!isSearching && searchError && (
          <div
            role="alert"
            className="mt-6 p-4 rounded-xl bg-[#1B2A20] border border-[#D97706] text-[#FAF6EE] flex items-center justify-between gap-3 text-xs md:text-sm"
          >
            <span>{searchError}</span>
          </div>
        )}

        {/* Loading Skeleton for Full Shabad View */}
        {isLoadingShabad && (
          <div
            role="status"
            aria-live="polite"
            className="mt-6 p-6 md:p-8 rounded-2xl bg-[#1B2A20] border border-[#C59B27]/50 animate-pulse space-y-4"
          >
            <div className="h-4 w-40 rounded bg-[#E5C158]/30" />
            <div className="h-7 w-2/3 rounded bg-[#FAF6EE]/20" />
            <div className="space-y-3 pt-4">
              <div className="h-16 w-full rounded-xl bg-[#121C15]" />
              <div className="h-16 w-full rounded-xl bg-[#121C15]" />
              <div className="h-16 w-full rounded-xl bg-[#121C15]" />
            </div>
          </div>
        )}

        {shabadError && !isLoadingShabad && (
          <div
            role="alert"
            className="mt-6 p-4 rounded-xl bg-[#1B2A20] border border-[#D97706] text-[#FAF6EE] flex items-center justify-between gap-3 text-xs md:text-sm"
          >
            <span>{shabadError}</span>
            <button
              type="button"
              onClick={() => setShabadError("")}
              className="text-xs font-semibold text-[#E5C158] underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Inline Full Shabad Reader View */}
        {!isLoadingShabad && activeShabad && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl bg-[#1B2A20] text-[#FAF6EE] border-2 border-[#C59B27] p-6 md:p-8 shadow-2xl space-y-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#C59B27]/30 pb-5">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E5C158]">
                  COMPLETE SHABAD FOLIO • ANG {activeShabad.pageNo} • {activeShabad.raag}
                </span>
                <h4 className="text-2xl md:text-3xl font-serif text-[#FAF6EE] mt-1">
                  {activeShabad.writer} — Ang {activeShabad.pageNo}
                </h4>
              </div>

              <button
                type="button"
                onClick={() => setActiveShabad(null)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#171917] font-semibold text-xs hover:brightness-105 transition"
              >
                ← Close / Back to results
              </button>
            </div>

            <div className="space-y-4 max-h-[540px] overflow-y-auto pr-1">
              {activeShabad.verses.map((v) => {
                const isHighlighted =
                  highlightedVerseId !== null && v.verseId === highlightedVerseId;
                return (
                  <div
                    key={v.verseId}
                    className={`p-5 rounded-xl border transition ${
                      isHighlighted
                        ? "bg-[#263B2D] border-[#E5C158] shadow-[0_0_20px_rgba(197,155,39,0.2)]"
                        : "bg-[#121C15] border-[#C59B27]/25"
                    }`}
                  >
                    <p
                      lang="pa"
                      className="text-xl md:text-2xl font-gurmukhi text-[#FAF6EE] leading-relaxed"
                    >
                      {v.gurmukhiUnicode}
                    </p>
                    {v.transliteration && (
                      <p className="text-xs md:text-sm text-[#E5C158]/85 italic mt-1.5">
                        {v.transliteration}
                      </p>
                    )}
                    {v.englishTranslation && (
                      <p className="text-sm md:text-base text-[#F3ECE0] mt-2 font-medium">
                        “{v.englishTranslation}”
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[#C59B27]/25 flex flex-wrap items-center justify-between gap-3 text-xs text-[#F3ECE0]/75">
              <span>
                Showing all {activeShabad.verses.length} verses of Shabad #{activeShabad.shabadId} (Ang {activeShabad.pageNo})
              </span>
              <button
                type="button"
                onClick={() => setActiveShabad(null)}
                className="text-[#E5C158] hover:underline font-semibold"
              >
                ← Close / Back to results
              </button>
            </div>
          </motion.div>
        )}

        {/* Empty State when a search has been performed and returned 0 verses */}
        {!isSearching &&
          !activeShabad &&
          hasSearched &&
          !searchError &&
          searchResults.length === 0 && (
            <div className="mt-6 p-8 rounded-2xl bg-[#FAF6EE] border border-[#C59B27]/40 text-center space-y-2">
              <p className="font-serif text-xl font-bold text-[#171917]">
                No matching verses found for “{submittedQuery}”
              </p>
              <p className="text-xs md:text-sm text-[#4A554E] max-w-md mx-auto">
                Try searching with an English keyword (such as &ldquo;kings are born&rdquo;, &ldquo;fearless&rdquo;, &ldquo;equality&rdquo;, &ldquo;hukam&rdquo;) or Gurmukhi first-letter initials (such as &ldquo;stnk&rdquo; or &ldquo;skma&rdquo;).
              </p>
            </div>
          )}

        {/* Matching Verses Grid */}
        {!isSearching && !activeShabad && searchResults.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-[#4A554E] px-1">
              <span>
                Found <strong className="text-[#171917]">{searchResults.length}</strong> matching verses for{" "}
                <strong className="text-[#171917]">“{submittedQuery}”</strong>
              </span>
              <span className="text-[#D97706] font-semibold uppercase tracking-wider">
                Select any verse card to read the full Shabad inline
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((item) => (
                <div
                  key={item.verseId}
                  onClick={() => void openFullShabadInline(item.shabadId, item.verseId)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      void openFullShabadInline(item.shabadId, item.verseId);
                    }
                  }}
                  className="group cursor-pointer p-5 rounded-xl bg-[#1B2A20] text-[#FAF6EE] border border-[#C59B27]/40 hover:border-[#E5C158] transition-all flex flex-col justify-between shadow-md hover:shadow-xl"
                >
                  <div>
                    <div className="flex justify-between items-center text-[11px] uppercase tracking-wider text-[#E5C158] mb-2">
                      <span className="font-semibold">
                        ANG {item.pageNo} • {item.writer}
                      </span>
                      <span className="px-2 py-0.5 rounded border border-[#C59B27]/35 bg-[#121C15]">
                        {item.raag}
                      </span>
                    </div>
                    <p
                      lang="pa"
                      className="text-lg md:text-xl font-gurmukhi text-[#FAF6EE] mb-1.5"
                    >
                      {item.gurmukhiUnicode}
                    </p>
                    {item.transliteration && (
                      <p className="text-xs text-[#E5C158]/80 italic mb-2">
                        {item.transliteration}
                      </p>
                    )}
                    {item.englishTranslation && (
                      <p className="text-sm text-[#F3ECE0] leading-relaxed">
                        “{item.englishTranslation}”
                      </p>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#C59B27]/25 flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-[#F3ECE0]/65">
                      SHABAD #{item.shabadId} • ANG {item.pageNo}
                    </span>
                    <span className="text-xs font-semibold text-[#E5C158] group-hover:text-[#D97706] transition">
                      Read Full Shabad Inline →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BaaniPortal;
