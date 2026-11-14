"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Search,
  ExternalLink,
  Sparkles,
  Shield,
  Flame,
  Scroll,
  Eye,
  BookMarked,
  ShieldAlert,
  ScrollText,
  Globe,
} from "lucide-react";
import { Hero } from "@/components/hero";
import { AskPanel } from "@/components/ask-panel";

/* ============================================================================
   1. CEREMONIAL OPENING CURTAIN (Ik Onkar & Gurmukhi Archway)
============================================================================ */
function IntroLoader() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem("sikhi_ai_intro_seen");
    if (hasSeenIntro) {
      setIsVisible(false);
      return;
    }
    const timer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("sikhi_ai_intro_seen", "true");
    }, 3400);
    return () => clearTimeout(timer);
  }, []);

  const skipIntro = () => {
    setIsVisible(false);
    sessionStorage.setItem("sikhi_ai_intro_seen", "true");
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="intro-curtain"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.9, ease: "easeInOut" } }}
          onClick={skipIntro}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070A12] text-[#F5E6C8] cursor-pointer overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.16)_0%,transparent_65%)]" />

          <motion.svg
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.35 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="absolute w-[340px] h-[460px] md:w-[460px] md:h-[580px] stroke-[#D4AF37]"
            viewBox="0 0 200 260"
            fill="none"
          >
            <motion.path
              d="M10 250 V110 C10 50 100 10 100 10 C100 10 190 50 190 110 V250 Z"
              strokeWidth="1.2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.2, ease: "easeInOut" }}
            />
            <motion.path
              d="M20 242 V114 C20 60 100 22 100 22 C100 22 180 60 180 114 V242 Z"
              strokeWidth="0.5"
              strokeDasharray="3 3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.5, ease: "easeInOut" }}
            />
          </motion.svg>

          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.2 }}
            className="relative z-10 text-center px-6"
          >
            <div className="text-7xl md:text-8xl font-serif text-[#D4AF37] drop-shadow-[0_0_25px_rgba(212,175,55,0.45)] mb-4">
              ੴ
            </div>
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.05em" }}
              animate={{ opacity: 1, letterSpacing: "0.22em" }}
              transition={{ duration: 1.4, delay: 0.7 }}
              className="text-lg md:text-xl text-[#E6C762] font-medium uppercase"
            >
              ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ
            </motion.p>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "180px" }}
              transition={{ duration: 1.2, delay: 1.0 }}
              className="h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto my-5"
            />
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.3 }}
              className="text-2xl md:text-3xl font-serif tracking-wide text-white"
            >
              SIKHI <span className="text-[#D4AF37]">AI</span> ARCHIVE
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.75 }}
              transition={{ duration: 1, delay: 1.7 }}
              className="mt-2 text-xs md:text-sm text-amber-100/70 max-w-md mx-auto italic"
            >
              Scripture, Sovereign History, & the Unsung Matriarchs of the Panth
            </motion.p>
          </motion.div>

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 2.2 }}
            className="absolute bottom-8 text-xs tracking-widest uppercase text-[#D4AF37]"
          >
            Click anywhere to enter
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================================================================
   2. ANIMATED CHAPTER SECTION WRAPPER
============================================================================ */
function ChapterSection({
  id,
  eyebrow,
  gurmukhiWatermark,
  title,
  subtitle,
  children,
}: {
  id?: string;
  eyebrow?: string;
  gurmukhiWatermark?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.75, ease: "easeOut" }}
        className="relative text-center mb-14"
      >
        {gurmukhiWatermark && (
          <span
            aria-hidden="true"
            className="pointer-events-none select-none absolute left-1/2 -top-10 -translate-x-1/2 text-6xl md:text-8xl font-serif text-[#D4AF37]/[0.07] whitespace-nowrap"
          >
            {gurmukhiWatermark}
          </span>
        )}
        {eyebrow && (
          <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-2">
            {eyebrow}
          </p>
        )}
        <h2 className="relative text-3xl md:text-5xl font-serif font-bold text-white tracking-tight">
          {title}
        </h2>
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="h-[2px] w-36 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto my-5"
        />
        {subtitle && (
          <p className="max-w-3xl mx-auto text-sm md:text-base text-slate-300 leading-relaxed">
            {subtitle}
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.7, delay: 0.15 }}
      >
        {children}
      </motion.div>
    </section>
  );
}

/* ============================================================================
   3. PRE-GENERATED BAANI SANCTUARY & LIVE SIKHITOTHEMAX PORTAL
============================================================================ */
const PRELOADED_BANIS = [
  {
    id: "japji-mool-mantar",
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
        gurmukhi: "ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ ॥",
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
        gurmukhi: "ਭੰਡਹੁ ਹੀ ਭੰਡੁ ਊਪਜੈ ਭੰਡੈ ਬਾਝੁ ਨ ਕੋਇ ॥ ਨਾਨਕ ਭੰਡੈ ਬਾਹਰਾ ਏਕੋ ਸਚਾ ਸੋਇ ॥",
        transliteration:
          "Bhandahu Hee Bhand Oopajai Bhandai Baajh Na Koe || Nanak Bhandai Baaharaa Eko Sachaa Soe ||",
        english:
          "From woman, woman is born; without woman, there would be no one at all. O Nanak, only the True One is independent of woman.",
      },
    ],
  },
  {
    id: "mata-khivi-var",
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

function BaaniPortal() {
  const [selectedBani, setSelectedBani] = useState(PRELOADED_BANIS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const handleGurbaniSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError("");

    try {
      const isAcronym =
        searchQuery.trim().split(" ").length === 1 && searchQuery.length <= 6;
      const searchType = isAcronym ? 1 : 2;
      const res = await fetch(
        `https://api.banidb.com/v2/search/${encodeURIComponent(
          searchQuery.trim()
        )}?searchtype=${searchType}&results=6`
      );
      if (!res.ok) throw new Error("Could not reach BaniDB portal.");
      const data = await res.json();
      setSearchResults(data.verses || []);
    } catch {
      setSearchError(
        "Unable to fetch live verses right now. You can open SikhiToTheMax directly below."
      );
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#D4AF37] mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Pre-Generated Scriptural Pillars</span>
          </div>
          {PRELOADED_BANIS.map((bani) => {
            const isActive = selectedBani.id === bani.id;
            return (
              <button
                key={bani.id}
                onClick={() => setSelectedBani(bani)}
                className={`w-full text-left p-5 rounded-xl border transition-all duration-300 ${
                  isActive
                    ? "bg-[#121826] border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.15)]"
                    : "bg-[#0B0F19]/80 border-slate-800 hover:border-slate-600"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-serif text-[#D4AF37]">{bani.gurmukhiTitle}</p>
                    <h3 className="text-base font-semibold text-white mt-0.5">{bani.title}</h3>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Ang {bani.ang}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {bani.author} • {bani.raag}
                </p>
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
              className="bg-gradient-to-b from-[#111726] to-[#0A0E17] border border-[#D4AF37]/30 rounded-2xl p-6 md:p-8 shadow-2xl"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#D4AF37]">
                    {selectedBani.author} • {selectedBani.raag}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-serif text-white mt-1">
                    {selectedBani.title}
                  </h3>
                </div>
                <a
                  href={`https://www.sikhitothemax.org/shabad?id=${selectedBani.sttmShabadId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4AF37] text-slate-950 font-semibold text-xs hover:bg-amber-400 transition"
                >
                  <BookOpen className="w-4 h-4" />
                  Read Full Ang {selectedBani.ang} on SikhiToTheMax
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                    Historical Context
                  </h4>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    {selectedBani.historicalContext}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                    Philosophical Essence
                  </h4>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    {selectedBani.philosophicalEssence}
                  </p>
                </div>
              </div>

              <div className="space-y-6 mt-6">
                {selectedBani.verses.map((v, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-xl bg-[#080B12] border border-slate-800/80 space-y-2"
                  >
                    <p className="text-xl md:text-2xl font-serif text-[#F5E6C8] leading-relaxed">
                      {v.gurmukhi}
                    </p>
                    <p className="text-xs md:text-sm text-amber-200/70 italic">
                      {v.transliteration}
                    </p>
                    <p className="text-sm md:text-base text-white pt-1 font-medium">
                      “{v.english}”
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="p-6 md:p-8 rounded-2xl bg-[#0D1322] border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-serif text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-[#D4AF37]" />
              Explore Any Shabad via SikhiToTheMax / BaniDB Portal
            </h3>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              The core hymns are pre-curated above. Use this portal whenever you want to search any Shabad by English theme (e.g., &ldquo;equality&rdquo;, &ldquo;fearless&rdquo;) or Gurmukhi initials (e.g., &ldquo;skma&rdquo;).
            </p>
          </div>
          <a
            href="https://www.sikhitothemax.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 shrink-0"
          >
            Open SikhiToTheMax Portal <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <form onSubmit={handleGurbaniSearch} className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search English translation (e.g., 'kings are born') or first letters (e.g., 'stnk')..."
            className="flex-1 bg-[#070A12] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-3 rounded-xl bg-[#D4AF37] text-slate-950 font-semibold text-sm hover:bg-amber-400 transition disabled:opacity-50"
          >
            {isSearching ? "Searching..." : "Find Baani"}
          </button>
        </form>

        {searchError && <p className="text-xs text-amber-400 mt-3">{searchError}</p>}

        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {searchResults.map((item: any) => (
              <div
                key={item.verseId}
                className="p-4 rounded-xl bg-[#070A12] border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center text-xs text-[#D4AF37] mb-2">
                    <span>
                      Ang {item.pageNo} • {item.writer?.english || "Gurbani"}
                    </span>
                    <span>{item.raag?.english}</span>
                  </div>
                  <p className="text-lg font-serif text-[#F5E6C8] mb-1">
                    {item.verse?.unicode}
                  </p>
                  <p className="text-xs text-slate-400 italic mb-2">
                    {item.transliteration?.english}
                  </p>
                  <p className="text-sm text-slate-200">
                    {item.translation?.en?.bdb || item.translation?.en?.ms}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-end">
                  <a
                    href={`https://www.sikhitothemax.org/shabad?id=${item.shabadId}&highlight=${item.verseId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#D4AF37] hover:underline inline-flex items-center gap-1"
                  >
                    Read Full Shabad on SikhiToTheMax <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   4. THE UNSUNG MATRIARCHS OIL-PAINTING PORTAL
============================================================================ */
const MATRIARCHS = [
  {
    id: "bebe-nanaki",
    name: "Bebe Nanaki Ji",
    gurmukhiName: "ਬੇਬੇ ਨਾਨਕੀ ਜੀ",
    era: "1464 – 1518 CE",
    title: "The First Sikh & Guardian of the Prophetic Flame",
    paintingTitle: "Canvas I: The First Rabab at Sultanpur Lodhi (c. 1498)",
    paintingSceneDescription:
      "Chiaroscuro oil study: In a lamplit courtyard in Sultanpur Lodhi, Bebe Nanaki Ji places silver coins into the hands of Bhai Mardana Ji to commission the very first Rabab for Guru Nanak Dev Ji, shielding her brother from their father Mehta Kalu's worldly expectations.",
    palette: { primary: "#1E293B", secondary: "#78350F", accent: "#F59E0B" },
    emblemType: "rabab",
    lifeStory:
      "Five years older than Guru Nanak Dev Ji, Bebe Nanaki Ji was the very first human being to recognize his divine light—long before any male disciple. When Mehta Kalu scolded young Nanak for spending business money to feed hungry saints (Sacha Sauda), Bebe Nanaki Ji stood between them, brought Nanak to Sultanpur Lodhi, and funded the musical instrument (Rabab) that gave birth to Gurmat Kirtan.",
    whyMenTalkLess:
      "Patriarchal storytelling often reduces Bebe Nanaki Ji to a passive 'older sister' in childhood anecdotes, erasing the fact that she was the foundational patron of Sikh Kirtan and the very first initiate of Sikhi.",
    historicalProof:
      "Puratan Janamsakhi & Bhai Gurdas Ji's Vaaran record her household in Sultanpur Lodhi as the first dharamsal (spiritual center) where Guru Nanak Dev Ji's Udasis (world journeys) were financed and launched.",
    primaryCitation: "Puratan Janamsakhi & Mehma Prakash",
  },
  {
    id: "mata-khivi",
    name: "Mata Khivi Ji",
    gurmukhiName: "ਮਾਤਾ ਖੀਵੀ ਜੀ",
    era: "1506 – 1582 CE",
    title: "The Sovereign Architect of Guru Ka Langar",
    paintingTitle: "Canvas II: The Leafy Shade of Khadur Sahib (c. 1545)",
    paintingSceneDescription:
      "Warm Venetian-style oil painting: Beneath a sprawling banyan tree at Khadur Sahib, Mata Khivi Ji personally oversees copper cauldrons of steaming kheer rich with pure ghee, seating emperors, outcastes, and beggars on the exact same floor.",
    palette: { primary: "#27170E", secondary: "#7C2D12", accent: "#FBBF24" },
    emblemType: "langar",
    lifeStory:
      "Married to Guru Angad Dev Ji, Mata Khivi Ji lived for 76 years and served across the eras of the first five Gurus. She transformed Langar from a modest kitchen into a massive socio-political institution that broke the spine of the Indian caste system. She administered the supplies, finances, and distribution herself.",
    whyMenTalkLess:
      "In many modern gurdwaras, women are expected to silently roll rotis in the back while male committees monopolize the stage and microphones. Yet in Sri Guru Granth Sahib Ji, the ONLY historical person praised by name for running Langar is a woman—Mata Khivi Ji—compared to a towering tree giving shade to the world.",
    historicalProof:
      "Explicitly immortalized on Ang 967 of Sri Guru Granth Sahib Ji: 'Balvand Kheevee Nek Jan Jis Bahutee Chhaau Patraalee' (Khivi is that noble stateswoman who gives dense, leafy shade to the multitude).",
    primaryCitation: "Sri Guru Granth Sahib Ji, Ang 967 (Raag Ramkali)",
  },
  {
    id: "mata-sundari",
    name: "Mata Sundari Ji",
    gurmukhiName: "ਮਾਤਾ ਸੁੰਦਰੀ ਜੀ",
    era: "1667 – 1747 CE",
    title: "40-Year Supreme Stateswoman of the Khalsa Panth",
    paintingTitle: "Canvas III: Sealing the Royal Hukamnamas at Haveli Mata Sundari, Delhi (c. 1721)",
    paintingSceneDescription:
      "Regal Mughal-Sikh court oil portrait: Dressed in deep indigo and gold brocade, Mata Sundari Ji presses her official seal (Mohar) onto a parchment Hukamnama by candlelight, flanked by Bhai Mani Singh Ji and armed Akali Nihang sentries.",
    palette: { primary: "#0F172A", secondary: "#311042", accent: "#EAB308" },
    emblemType: "mohar",
    lifeStory:
      "After the martyrdom of all four Sahibzade and Guru Gobind Singh Ji's passing at Nanded in 1708, the Khalsa faced total annihilation under Mughal imperial edicts. From Delhi, Mata Sundari Ji led the Khalsa Panth for nearly four decades (1708–1747). She resolved the Tat Khalsa vs. Bandai Khalsa schism, appointed Bhai Mani Singh Ji as Head Granthi of Sri Harmandir Sahib, and commissioned the compilation of the Dasam Granth.",
    whyMenTalkLess:
      "Popular male-centric histories jump straight from Guru Gobind Singh Ji (1708) and Banda Singh Bahadur (1716) to the male Misldars, practically erasing the 40-year period where a woman held the highest executive and spiritual authority in the Sikh world.",
    historicalProof:
      "Nine original signed and sealed Hukamnamas issued by Mata Sundari Ji survive today (preserved at Gurdwara Mata Sundari Ji in New Delhi and Bhai Rupa collections), bearing her sovereign seal ordering Sikh sangats across Patna, Agra, and Punjab.",
    primaryCitation: "Hukamnamas of Mata Sundari Ji (ed. Ganda Singh) & Panth Prakash",
  },
  {
    id: "mai-bhago",
    name: "Mai Bhago Ji (Mata Bhag Kaur)",
    gurmukhiName: "ਮਾਈ ਭਾਗੋ ਜੀ",
    era: "c. 1666 – 1708 CE",
    title: "Commander of the Battle of Muktsar & Hazoori Bodyguard",
    paintingTitle: "Canvas IV: The Lance at Khidrana Dhaab (1705 CE)",
    paintingSceneDescription:
      "Dramatic battlefield oil canvas: Amidst swirling desert dust at Khidrana, Mai Bhago Ji—wearing a steel Dastar-Bunga and chainmail—charges forward on horseback with her iron lance (Barcha), rallying the forty redeemed warriors against Wazir Khan's imperial cavalry.",
    palette: { primary: "#18181B", secondary: "#450A0A", accent: "#F59E0B" },
    emblemType: "lance",
    lifeStory:
      "When 40 exhausted Sikh soldiers deserted Guru Gobind Singh Ji at Anandpur Sahib and returned home to Majha, Mai Bhago Ji refused to let cowardice stand. She rallied the men, rode at their head to Khidrana (Muktsar), fought fiercely on the front lines against the Mughal army, and later served in Hazur Sahib Nanded as one of Guru Gobind Singh Ji's personal armed bodyguards.",
    whyMenTalkLess:
      "Even when Mai Bhago Ji is mentioned, she is often treated as an 'exception' rather than proof that Guru Gobind Singh Ji's Khalsa broke all gender barriers in military command and spiritual sovereignty.",
    historicalProof:
      "Her personal steel spear (Barcha) and musket are still preserved and venerated at Takht Sri Hazur Sahib, Nanded, alongside her Bunga at Janwada.",
    primaryCitation: "Sri Gur Pratap Suraj Granth & Takht Hazur Sahib Relics",
  },
];

function MatriarchsGallery() {
  const [activeFigure, setActiveFigure] = useState(MATRIARCHS[0]);
  const [activeTab, setActiveTab] = useState<"story" | "silence" | "proof">("story");

  return (
    <div className="space-y-10">
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-amber-950/30 via-[#121826] to-amber-950/30 border border-[#D4AF37]/40">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
              <Flame className="w-4 h-4" /> Reclaiming the Forgotten Half of Panthic History
            </span>
            <h3 className="text-xl md:text-2xl font-serif text-white">
              Why Do Our Stages Speak So Little of the Women Who Built the Panth?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              While Guru Nanak Dev Ji declared women&apos;s absolute equality on Ang 473 over five centuries ago, modern discourse and male-dominated stages often relegate Sikh women to the background. Without <strong>Bebe Nanaki Ji</strong>, there is no first Rabab; without <strong>Mata Khivi Ji</strong>, no institutionalized Langar; without <strong>Mata Sundari Ji</strong>, the 18th-century Khalsa would have fractured. Explore their lives through the oil-canvas gallery below.
            </p>
          </div>
          <div className="shrink-0 p-4 rounded-xl bg-[#070A12] border border-amber-500/30 text-center">
            <p className="text-lg font-serif text-[#D4AF37]">ਸੋ ਕਿਉ ਮੰਦਾ ਆਖੀਐ</p>
            <p className="text-xs text-slate-400 mt-1">“Why call her inferior?”</p>
            <span className="text-[11px] text-amber-400/80 block mt-1">
              — Guru Granth Sahib Ji, Ang 473
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {MATRIARCHS.map((m) => {
          const selected = m.id === activeFigure.id;
          return (
            <button
              key={m.id}
              onClick={() => {
                setActiveFigure(m);
                setActiveTab("story");
              }}
              className={`p-4 rounded-xl border text-left transition-all ${
                selected
                  ? "bg-[#151C2C] border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                  : "bg-[#0A0E17] border-slate-800 hover:border-slate-600"
              }`}
            >
              <p className="text-sm font-serif text-[#D4AF37]">{m.gurmukhiName}</p>
              <h4 className="text-base font-bold text-white mt-0.5">{m.name}</h4>
              <p className="text-xs text-slate-400 mt-1">{m.era}</p>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeFigure.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
        >
          <div className="lg:col-span-6 flex flex-col">
            <div
              className="relative flex-1 min-h-[380px] rounded-2xl p-6 md:p-8 flex flex-col justify-between overflow-hidden border-4 border-[#8A6D2F] shadow-[inset_0_0_60px_rgba(0,0,0,0.85),0_15px_40px_rgba(0,0,0,0.7)]"
              style={{
                background: `radial-gradient(circle at 50% 35%, ${activeFigure.palette.secondary}, ${activeFigure.palette.primary} 75%, #05070B 100%)`,
              }}
            >
              <div className="relative z-10 flex justify-between items-center text-xs uppercase tracking-widest text-[#D4AF37]/80">
                <span>Sikh Heritage Oil Collection</span>
                <span>{activeFigure.era}</span>
              </div>

              <div className="relative z-10 my-auto py-8 text-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="w-36 h-36 mx-auto rounded-full border border-[#D4AF37]/50 bg-black/30 backdrop-blur-sm flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.3)]"
                >
                  {activeFigure.emblemType === "rabab" && (
                    <Sparkles className="w-16 h-16 text-[#D4AF37]" />
                  )}
                  {activeFigure.emblemType === "langar" && (
                    <Flame className="w-16 h-16 text-[#D4AF37]" />
                  )}
                  {activeFigure.emblemType === "mohar" && (
                    <Scroll className="w-16 h-16 text-[#D4AF37]" />
                  )}
                  {activeFigure.emblemType === "lance" && (
                    <Shield className="w-16 h-16 text-[#D4AF37]" />
                  )}
                </motion.div>
                <p className="mt-5 text-2xl md:text-3xl font-serif text-[#F5E6C8] drop-shadow">
                  {activeFigure.gurmukhiName}
                </p>
                <p className="text-sm font-serif italic text-amber-200/90 mt-1">
                  {activeFigure.paintingTitle}
                </p>
              </div>

              <div className="relative z-10 p-4 rounded-xl bg-black/65 border border-[#D4AF37]/40 backdrop-blur-md">
                <p className="text-xs text-amber-100/90 leading-relaxed italic">
                  <strong>Scene Study:</strong> {activeFigure.paintingSceneDescription}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#0D1322] border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
                {activeFigure.title}
              </span>
              <h3 className="text-3xl font-serif text-white mt-1">
                {activeFigure.name}
              </h3>

              <div className="flex flex-wrap gap-2 mt-6 border-b border-slate-800 pb-4">
                <button
                  onClick={() => setActiveTab("story")}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                    activeTab === "story"
                      ? "bg-[#D4AF37] text-slate-950"
                      : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Her Life & Sovereignty
                </button>
                <button
                  onClick={() => setActiveTab("silence")}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                    activeTab === "silence"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Why Men Talk Less About Her
                </button>
                <button
                  onClick={() => setActiveTab("proof")}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                    activeTab === "proof"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Primary Historical Record
                </button>
              </div>

              <div className="mt-6 min-h-[180px]">
                {activeTab === "story" && (
                  <p className="text-sm md:text-base text-slate-200 leading-relaxed">
                    {activeFigure.lifeStory}
                  </p>
                )}
                {activeTab === "silence" && (
                  <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-300 mb-2 flex items-center gap-1.5">
                      <Eye className="w-4 h-4" /> Confronting the Erasure
                    </h4>
                    <p className="text-sm md:text-base text-slate-200 leading-relaxed">
                      {activeFigure.whyMenTalkLess}
                    </p>
                  </div>
                )}
                {activeTab === "proof" && (
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-2">
                      Archival & Scriptural Evidence
                    </h4>
                    <p className="text-sm md:text-base text-slate-200 leading-relaxed">
                      {activeFigure.historicalProof}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Primary Source Citation:</span>
              <span className="text-[#D4AF37] font-medium">
                {activeFigure.primaryCitation}
              </span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ============================================================================
   5. CURATED PANTHIC & SCHOLARLY PORTALS
============================================================================ */
const PANTHIC_PORTALS = [
  {
    name: "Manglacharan (by Jvala Singh)",
    url: "https://www.manglacharan.com/",
    category: "Classical Granths & Pre-Colonial History",
    description:
      "Translations and deep literary analysis of classical Sikh historical texts including Sri Gur Pratap Suraj Granth, Panth Prakash, and Sri Dasam Granth.",
    highlight: "Read primary-source translations of 18th-century Khalsa chronicles.",
    icon: ScrollText,
  },
  {
    name: "Never Forget 1984",
    url: "https://www.neverforget84.com/",
    category: "1984 Saka & Shaheed Archive",
    description:
      "Comprehensive digital memorial documenting the June 1984 military assault on Sri Harmandir Sahib (Operation Blue Star), the November 1984 anti-Sikh pogroms, and biographies of Shaheeds.",
    highlight: "Eyewitness testimonies, rare photographs, and documented timelines.",
    icon: ShieldAlert,
  },
  {
    name: "Bunga Azaadi",
    url: "https://www.bungaazaadi.com/",
    category: "Sikh Sovereignty, Philosophy & Ethos",
    description:
      "Platform dedicated to revitalizing indigenous Sikh political thought, Miri-Piri philosophy, anti-colonial history, and the intellectual traditions of the Khalsa.",
    highlight: "Essays, podcasts, and research on Khalsa sovereignty (Patshahi).",
    icon: BookMarked,
  },
  {
    name: "SikhiToTheMax (BaniDB)",
    url: "https://www.sikhitothemax.org/",
    category: "Complete Gurbani Search & Translation Portal",
    description:
      "The gold-standard portal for searching Sri Guru Granth Sahib Ji, Sri Dasam Granth, Bhai Gurdas Ji Vaaran, and Bhai Nand Lal Ji Ghazals with word-by-word meanings.",
    highlight: "Direct Ang-by-Ang navigation and Larivaar/Padchhed toggles.",
    icon: Globe,
  },
];

function ScholarlyPortals() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {PANTHIC_PORTALS.map((portal) => {
        const Icon = portal.icon;
        return (
          <a
            key={portal.name}
            href={portal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-6 rounded-2xl bg-[#0C111D] border border-slate-800 hover:border-[#D4AF37] transition-all duration-300 flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37] px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                  {portal.category}
                </span>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-[#D4AF37] transition" />
              </div>
              <h3 className="text-xl font-serif text-white group-hover:text-[#D4AF37] transition flex items-center gap-2">
                <Icon className="w-5 h-5 text-[#D4AF37]" />
                {portal.name}
              </h3>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                {portal.description}
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-800/80 text-xs text-amber-200/80 italic">
              ✦ {portal.highlight}
            </div>
          </a>
        );
      })}
    </div>
  );
}

/* ============================================================================
   MAIN HOMEPAGE EXPORT
============================================================================ */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#070A12] text-slate-100">
      <IntroLoader />
      <Hero />

      <ChapterSection
        id="baani"
        eyebrow="Chapter I • Sabad Guru"
        gurmukhiWatermark="ਗੁਰਬਾਣੀ"
        title="The Living Treasury of Gurbani"
        subtitle="Foundational hymns of Sri Guru Granth Sahib Ji are pre-curated below with historical and philosophical commentary, paired with a live BaniDB / SikhiToTheMax portal for exploring any Ang."
      >
        <BaaniPortal />
      </ChapterSection>

      <ChapterSection
        id="matriarchs"
        eyebrow="Chapter II • Sovereign Equality"
        gurmukhiWatermark="ਮਾਤਾ ਖੀਵੀ"
        title="The Unsung Matriarchs of the Panth"
        subtitle="An oil-canvas exhibition restoring the women who financed Kirtan, institutionalized Langar, commanded armies, and governed the Khalsa for forty years—yet are rarely spoken of on modern stages."
      >
        <MatriarchsGallery />
      </ChapterSection>

      <ChapterSection
        id="ask-ai"
        eyebrow="Chapter III • Interactive Inquiry"
        gurmukhiWatermark="ਖੋਜ"
        title="Deep-Dive AI Research Assistant"
        subtitle="Have a specific question about a Shabad, philosophical concept, or historical event? Ask below for answers grounded in Sri Guru Granth Sahib Ji and Panthic archives."
      >
        <AskPanel initialQuery="" />
      </ChapterSection>

      <ChapterSection
        id="archives"
        eyebrow="Chapter IV • Community Scholarship"
        gurmukhiWatermark="ਇਤਿਹਾਸ"
        title="Connected Panthic Archives"
        subtitle="Continue your research across independent Sikh historical, scriptural, and human-rights archives."
      >
        <ScholarlyPortals />
      </ChapterSection>
    </main>
  );
}