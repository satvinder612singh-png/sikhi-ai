"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, ExternalLink, Sparkles } from "lucide-react";

interface PreloadedBani {
  id: string;
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

const PRELOADED_BANIS: PreloadedBani[] = [
  {
    id: "japji-mool-mantar",
    title: "Japji Sahib — Mool Mantar & Pauri 1",
    gurmukhiTitle: "ਜਪੁਜੀ ਸਾਹਿਬ",
    author: "Guru Nanak Dev Ji",
    raag: "Unset (Prologue to Sri Guru Granth Sahib Ji)",
    ang: 1,
    sttmShabadId: 1,
    historicalContext:
      "Revealed by Guru Nanak Dev Ji following his three-day immersion in the Kali Bein river at Sultanpur Lodhi (c. 1499). It serves as the foundational thesis of Sikhi.",
    philosophicalEssence:
      "Establishes Ik Onkar—the indivisible, genderless, formless, and fearless Creator—rejecting caste purity, ritual fasting, and idol worship in favor of aligning with Hukam (Cosmic Order).",
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
        english:
          "I am in ecstasy, O my mother, for I have found my True Guru.",
      },
    ],
  },
];

export default function BaaniPortal() {
  const [selectedBani, setSelectedBani] = useState<PreloadedBani>(PRELOADED_BANIS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Live BaniDB API Search (Powers SikhiToTheMax)
  const handleGurbaniSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchError("");

    try {
      // searchtype=2 searches English translations/transliterations; searchtype=1 searches first letters
      const isAcronym = searchQuery.trim().split(" ").length === 1 && searchQuery.length <= 6;
      const searchType = isAcronym ? 1 : 2;
      const res = await fetch(
        `https://api.banidb.com/v2/search/${encodeURIComponent(
          searchQuery.trim()
        )}?searchtype=${searchType}&results=6`
      );
      if (!res.ok) throw new Error("Could not reach BaniDB portal.");
      const data = await res.json();
      setSearchResults(data.verses || []);
    } catch (err) {
      setSearchError(
        "Unable to fetch live verses right now. You can still open SikhiToTheMax directly below."
      );
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Part 1: Pre-Generated Foundational Hymns Sanctuary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Hymn Selector Cards */}
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

        {/* Right Column: Illuminated Manuscript Reader */}
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

              {/* Historical & Philosophical Commentary */}
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

              {/* Pre-Generated Verses */}
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

      {/* Part 2: Live BaniDB / SikhiToTheMax Explorer Portal */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#0D1322] border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-serif text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-[#D4AF37]" />
              Explore Any Shabad via SikhiToTheMax / BaniDB Portal
            </h3>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              The core hymns are already curated above. Use this portal whenever you want to look up a specific Shabad by English theme (e.g., &ldquo;equality&rdquo;, &ldquo;fearless&rdquo;) or Gurmukhi first-letters (e.g., &ldquo;skma&rdquo;).
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