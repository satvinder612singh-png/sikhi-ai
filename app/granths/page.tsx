"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
import {
  useKirtanAudio,
  formatAudioTime,
  type KirtanTrack,
} from "@/components/kirtan-audio-context";

type GranthVolume = {
  id: string;
  numeral: string;
  category: "Scriptural Teeka" | "Historical Chronicle" | "Canonical Bani" | "Lexicon";
  title: string;
  gurmukhiTitle: string;
  author: string;
  period: string;
  volumesCount: string;
  summary: string;
  significance: string;
  gurmatVeecharUrl: string;
  directPdfUrl: string;
  archiveEmbedUrl: string;
  sampleFolio: {
    heading: string;
    gurmukhi: string;
    transliteration: string;
    translation: string;
    scholarlyNote: string;
  };
};

const HISTORICAL_GRANTHS: GranthVolume[] = [
  {
    id: "sggs-darpan",
    numeral: "੧",
    category: "Scriptural Teeka",
    title: "Sri Guru Granth Sahib Darpan (10 Volumes)",
    gurmukhiTitle: "ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਦਰਪਣ",
    author: "Prof. Sahib Singh Ji (D.Litt.)",
    period: "1962 – 1964 CE • Amritsar",
    volumesCount: "Volumes 1–10 (Complete Ang 1 to 1430)",
    summary:
      "The gold-standard grammatical exegesis (Teeka) of Sri Guru Granth Sahib Ji, unlocking the morphological rules of Gurbani Viyakaran (vowel endings, case markers, and syntax).",
    significance:
      "Demonstrated systematically that Sihari (ਿ) and Aunkar (ੁ) endings in Gurbani are deliberate grammatical cases (prepositions, singular nouns, and imperative verbs).",
    gurmatVeecharUrl:
      "https://www.gurmatveechar.com/books/Punjabi_Books/Professor_Sahib_Singh/",
    directPdfUrl:
      "https://www.gurmatveechar.com/books/Punjabi_Books/Professor_Sahib_Singh/Sri.Guru.Granth.Sahib.Darpan.Volume.01.by.Prof.Sahib.Singh.(GurmatVeechar.com).pdf",
    archiveEmbedUrl:
      "https://archive.org/embed/SriGuruGranthSahibDarpanVol1ByProfSahibSingh",
    sampleFolio: {
      heading: "Volume I • Mool Mantar & Japji Sahib Grammatical Analysis (Ang 1)",
      gurmukhi: "ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ ॥",
      transliteration:
        "Ik Oankaar Sat Naamu Kartaa Purakhu Nirbhau Nirvairu Akaal Moorati Ajoonee Saibhang Gur Prasaadi ||",
      translation:
        "There is One Universal Creator whose Eternal Name is Truth, All-Pervading Doer, Without Fear, Without Enmity, Timeless Form, Unborn, Self-Illuminated, realized by the Guru's Grace.",
      scholarlyNote:
        "Prof. Sahib Singh explains that the Aunkar (ੁ) beneath 'ਨਾਮੁ' (Naamu) and 'ਪੁਰਖੁ' (Purakhu) marks the singular nominative subject, whereas in 'ਗੁਰ ਪ੍ਰਸਾਦਿ' (Gur Prasaadi), the Sihari (ਿ) on 'ਪ੍ਰਸਾਦਿ' denotes the instrumental case ('by means of Grace').",
    },
  },
  {
    id: "panth-prakash",
    numeral: "੨",
    category: "Historical Chronicle",
    title: "Sri Gur Panth Prakash (Prachin)",
    gurmukhiTitle: "ਸ੍ਰੀ ਗੁਰ ਪੰਥ ਪ੍ਰਕਾਸ਼",
    author: "Shaheed Bhai Rattan Singh Bhangu",
    period: "Completed 1841 CE • Amritsar",
    volumesCount: "Complete Braj / Punjabi Verse Chronicle",
    summary:
      "Primary 18th-century chronicle of the Khalsa's struggle for sovereignty, written by the grandson of Shaheed Bhai Mehtab Singh Ji (who liberated Sri Harmandir Sahib from Massa Ranghar).",
    significance:
      "Written directly to counter colonial distortions and record how Guru Nanak Dev Ji and Guru Gobind Singh Ji bestowed sovereign Patshahi (self-rule) upon the Khalsa Panth.",
    gurmatVeecharUrl:
      "https://www.gurmatveechar.com/literature?q=f&f=%2FEnglish_Books",
    directPdfUrl:
      "https://archive.org/download/SriGurPanthPrakashVol1EngTranslationKulwantSingh/Sri%20Gur%20Panth%20Prakash%20Vol%201%20%28Eng%20Translation%20-%20Kulwant%20Singh%29.pdf",
    archiveEmbedUrl:
      "https://archive.org/embed/SriGurPanthPrakashVol1EngTranslationKulwantSingh",
    sampleFolio: {
      heading: "Sakhi: The Sovereign Testimony of the Khalsa (Dohra)",
      gurmukhi: "ਸਿੰਘਨ ਕੀ ਪਾਤਸ਼ਾਹੀ ਸਾਚੀ । ਸਤਿਗੁਰਿ ਆਪੁ ਸਿੰਘਨ ਕਉ ਦੀਨੀ ॥",
      transliteration: "Singhan kee Paatshaahee saachee. Satigur aapu Singhan kau deenee ||",
      translation:
        "True and eternal is the sovereignty of the Singhs; the True Guru Himself bestowed this sovereignty upon the Khalsa.",
      scholarlyNote:
        "Bhai Rattan Singh Bhangu interviewed surviving 18th-century Akali and Misl veterans, including his own father Rai Singh and maternal grandfather Shyam Singh of the Karorsinghia Misl.",
    },
  },
  {
    id: "suraj-prakash",
    numeral: "੩",
    category: "Historical Chronicle",
    title: "Sri Gur Pratap Suraj Granth (Suraj Prakash)",
    gurmukhiTitle: "ਸ੍ਰੀ ਗੁਰ ਪ੍ਰਤਾਪ ਸੂਰਜ ਗ੍ਰੰਥ",
    author: "Mahakavi Bhai Santokh Singh Ji (Chudamani)",
    period: "Completed 1843 CE • Kaithal (14 Volumes annotated by Bhai Vir Singh)",
    volumesCount: "12 Raas (Lives of Guru Hargobind Ji to Guru Tegh Bahadur Ji) & 6 Rut (Guru Gobind Singh Ji)",
    summary:
      "The monumental 51,829-verse Braj Bhasha historical epic of the Ten Sikh Gurus and Banda Singh Bahadur, read daily in historical Gurdwaras during afternoon Suraj Prakash Katha.",
    significance:
      "Preserves intricate accounts of the Gurus' courts, travels, philosophical dialogues, and battles, later critically edited across 14 volumes by Bhai Vir Singh Ji.",
    gurmatVeecharUrl:
      "https://www.gurmatveechar.com/books/Punjabi_Books/Bhai_Vir_Singh/",
    directPdfUrl:
      "https://archive.org/download/SriGurPratapSurajGranthVol01BhaiVirSingh/Sri.Gur.Pratap.Suraj.Granth.Vol.01.Bhai.Vir.Singh.pdf",
    archiveEmbedUrl:
      "https://archive.org/embed/SriGurPratapSurajGranthVol01BhaiVirSingh",
    sampleFolio: {
      heading: "Manglacharan • Invocation to the Ten Sovereign Lights",
      gurmukhi: "ਏਕੰਕਾਰਾ ਸਤਿਗੁਰੂ ਤਿਹ ਪ੍ਰਸਾਦਿ ਸਚੁ ਹੋਇ । ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫਤਹਿ ਵਿਘਨ ਵਿਨਾਸਨ ਸੋਇ ॥",
      transliteration:
        "Ekankaaraa Satiguroo tih prasaadi sachu hoi. Vaahiguroo jee kee fatehi vighan vinaasan soi ||",
      translation:
        "By the Grace of the One Universal True Guru, Truth is realized; Victory belongs to Waheguru Ji, the Destroyer of all obstacles.",
      scholarlyNote:
        "Completed after twenty years of research using earlier sources such as Bhai Gurbakhsh Singh's oral accounts, Gurbilas Patshahi 6 & 10, and Sikhan Di Bhagat Mala.",
    },
  },
  {
    id: "bhai-gurdas-vaaran",
    numeral: "੪",
    category: "Canonical Bani",
    title: "Vaaran Bhai Gurdas Ji (40 Vaaran & Kabitt Savaiye)",
    gurmukhiTitle: "ਵਾਰਾਂ ਭਾਈ ਗੁਰਦਾਸ ਜੀ",
    author: "Bhai Gurdas Ji (First Scribe of the Adi Granth, 1604 CE)",
    period: "Late 16th – Early 17th Century CE",
    volumesCount: "40 Canonical Vaaran + 675 Braj Kabitt Savaiye",
    summary:
      "Blessed by Guru Arjan Dev Ji as the 'Key to Sri Guru Granth Sahib Ji' (Gurbani Di Kunji) and one of the four canonical pillars authorized for Kirtan in every Gurdwara.",
    significance:
      "Vaar 1 provides the earliest eyewitness biography of Guru Nanak Dev Ji's Udasis to Baghdad, Mecca, Achal Batala, and Mount Sumeru, while Vaar 11 lists the prominent early Gursikhs.",
    gurmatVeecharUrl:
      "https://www.gurmatveechar.com/literature?q=f&f=%2FPunjabi_Books",
    directPdfUrl:
      "https://archive.org/download/VaranBhaiGurdasJiSteekByGianiHazaraSinghPandit/Varan.Bhai.Gurdas.Ji.Steek.by.Giani.Hazara.Singh.Pandit.pdf",
    archiveEmbedUrl:
      "https://archive.org/embed/VaranBhaiGurdasJiSteekByGianiHazaraSinghPandit",
    sampleFolio: {
      heading: "Vaar 1, Pauri 27 • The Dawn of Guru Nanak Dev Ji",
      gurmukhi: "ਸਤਿਗੁਰ ਨਾਨਕ ਪ੍ਰਗਟਿਆ ਮਿਟੀ ਧੁੰਧੁ ਜਗਿ ਚਾਨਣੁ ਹੋਆ ॥ ਜਿਉ ਕਰਿ ਸੂਰਜੁ ਨਿਕਲਿਆ ਤਾਰੇ ਛਪਿ ਅੰਧੇਰੁ ਪਲੋਆ ॥",
      transliteration:
        "Satigur Naanak pragatiaa mitee dhundhu jagi chaananu hoaa || Jiu kari sooraju nikaliaa taare chhapi andheru paloaa ||",
      translation:
        "With the emergence of the True Guru Nanak, the mist of ignorance cleared and divine light illuminated the world—just as when the sun rises, the stars vanish and darkness flees.",
      scholarlyNote:
        "Bhai Gurdas Ji was the nephew of Guru Amar Das Ji, maternal uncle of Guru Arjan Dev Ji, and inscribed the original 1604 Kartarpur Bir at Ramsar Sarovar.",
    },
  },
  {
    id: "bhai-nand-lal-ghazals",
    numeral: "੫",
    category: "Canonical Bani",
    title: "Kalam-e-Goya: Bhai Nand Lal Ji Ghazals & Zindaginama",
    gurmukhiTitle: "ਕਲਾਮ ਭਾਈ ਨੰਦ ਲਾਲ ਜੀ ਗੋਯਾ",
    author: "Bhai Nand Lal Ji 'Goya' (1633 – 1713 CE)",
    period: "Anandpur Sahib Court • Late 17th Century CE",
    volumesCount: "Diwan-e-Goya, Zindaginama, Ganjnama, Jot Bigas & Tankahnama",
    summary:
      "Mystical Persian and Punjabi poetry composed by the poet laureate of Guru Gobind Singh Ji's Darbar at Sri Anandpur Sahib, authorized for Gurdwara Kirtan.",
    significance:
      "Captures the intoxicating spiritual love (Ishq Haqiqi) of the Khalsa and preserves early Rehit maryada guidelines from 1695–1699 CE.",
    gurmatVeecharUrl:
      "https://www.gurmatveechar.com/literature?q=f&f=%2FEnglish_Books",
    directPdfUrl:
      "https://archive.org/download/DiwanEGoyaBhaiNandLalJi/Diwan-e-Goya-Bhai-Nand-Lal-Ji.pdf",
    archiveEmbedUrl:
      "https://archive.org/embed/DiwanEGoyaBhaiNandLalJi",
    sampleFolio: {
      heading: "Diwan-e-Goya • Ghazal 1: Din-o-Duniya Dar Kamand-e-Aan Pari Rukhsaar-e-Maa",
      gurmukhi: "ਦੀਨੋ ਦੁਨੀਆ ਦਰ ਕਮੰਦੇ ਆਂ ਪਰੀ ਰੁਖ਼ਸਾਰੇ ਮਾ ॥ ਹਰ ਦੋ ਆਲਮ ਕੀਮਤੇ ਯਕ ਤਾਰ ਮੂਏ ਯਾਰੇ ਮਾ ॥",
      transliteration:
        "Deen-o-duniyaa dar kamande aan paree rukhsaare maa || Har do aalam keemate yak taar mooe yaare maa ||",
      translation:
        "Both faith and the world are bound in the lasso of our Beloved's radiant countenance; the price of both worlds does not equal a single strand of our Beloved Guru's hair.",
      scholarlyNote:
        "Born in Ghazni and raised in Multan, Bhai Nand Lal Ji was titled 'Goya' (The Eloquent Speaker) and his Zindaginama ('Book of Eternal Life') was blessed directly by Guru Gobind Singh Ji.",
    },
  },
  {
    id: "mahan-kosh",
    numeral: "੬",
    category: "Lexicon",
    title: "Gurshabad Ratnakar Mahan Kosh (Encyclopaedia of Sikh Literature)",
    gurmukhiTitle: "ਗੁਰਸ਼ਬਦ ਰਤਨਾਕਰ ਮਹਾਨ ਕੋਸ਼",
    author: "Panth Rattan Bhai Kahn Singh Nabha (1861 – 1938 CE)",
    period: "Published 1930 CE • Patiala / Amritsar",
    volumesCount: "81,426 Alphabetical Gurmukhi Entries",
    summary:
      "The comprehensive encyclopedic dictionary of Gurbani vocabulary, Braj/Persian/Sanskrit etymology, Raag musicology, flora, fauna, and Sikh historical biographies.",
    significance:
      "Compiled over 14 years of tireless scholarship, providing exact scriptural citations, meter prosody (Chhand), and geographical coordinates of historical Gurdwaras.",
    gurmatVeecharUrl:
      "https://www.gurmatveechar.com/books/Punjabi_Books/Bhai_Kahn_Singh_Nabha/",
    directPdfUrl:
      "https://www.gurmatveechar.com/books/Punjabi_Books/Bhai_Kahn_Singh_Nabha/Bhai.Kahn.Singh.Nabha.-.Gurshabad.Ratnakar.Mahan.Kosh.(GurmatVeechar.com).pdf",
    archiveEmbedUrl:
      "https://archive.org/embed/GurshabadRatnakarMahanKoshByBhaiKahnSinghNabha",
    sampleFolio: {
      heading: "Lexicon Entry: ਗੁਰਮਤਿ (Gurmat) & ਸਿੱਖ (Sikh)",
      gurmukhi: "ਸਿੱਖ — ਸਤਿਗੁਰੂ ਨਾਨਕ ਦੇਵ ਜੀ ਦਾ ਅਨੁਯਾਈ, ਜੋ ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ ਦੀ ਬਾਣੀ ਨੂੰ ਗੁਰੂ ਮੰਨਦਾ ਹੈ।",
      transliteration:
        "Sikh — Satiguru Naanak Dev Jee daa anuyaayee, jo Sri Guru Granth Sahib Jee dee Baanee noo Guru manndaa hai.",
      translation:
        "Sikh — A disciple of True Guru Nanak Dev Ji who reveres the revealed Word of Sri Guru Granth Sahib Ji as the Eternal Guru.",
      scholarlyNote:
        "Bhai Kahn Singh Nabha also authored 'Hum Hindu Nahin' (1898) and 'Gurmat Martand', laying the philological foundation for modern Sikh studies.",
    },
  },
];

export default function GranthsAndKirtanPage() {
  const [activeTab, setActiveTab] = useState<"kirtan" | "granths">("kirtan");
  const [granthQuery, setGranthQuery] = useState("");
  const [granthCategory, setGranthCategory] = useState<string>("All");
  const [selectedGranth, setSelectedGranth] = useState<GranthVolume | null>(null);
  const [modalMode, setModalMode] = useState<"folio" | "pdf">("folio");

  const {
    tracks,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    usingTantiSynth,
    playTrack,
    togglePlayPause,
    seekTo,
    setVolume,
    nextTrack,
    prevTrack,
  } = useKirtanAudio();

  const filteredGranths = useMemo(() => {
    return HISTORICAL_GRANTHS.filter((g) => {
      const matchesCat =
        granthCategory === "All" || g.category === granthCategory;
      const q = granthQuery.trim().toLowerCase();
      if (!q) return matchesCat;
      return (
        matchesCat &&
        (g.title.toLowerCase().includes(q) ||
          g.author.toLowerCase().includes(q) ||
          g.summary.toLowerCase().includes(q) ||
          g.gurmukhiTitle.includes(q))
      );
    });
  }, [granthCategory, granthQuery]);

  const handleTrackClick = (track: KirtanTrack) => {
    if (currentTrack.id === track.id) {
      togglePlayPause();
    } else {
      playTrack(track);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EE] text-[#171917]">
      <Header solid />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 pb-28">
        {/* Page Header */}
        <section className="rounded-3xl border border-[#C59B27]/40 bg-[#1B2A20] p-8 md:p-10 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#C59B27] px-3 py-1 rounded-full border border-[#C59B27]/40 bg-[#121C15]">
                  SANCTUARY ARCHIVE • PURATAN KIRTAN &amp; GRANTHS
                </span>
                <span lang="pa" className="font-gurmukhi text-sm text-[#D97706]">
                  ਗੁਰਮਤਿ ਸੰਗੀਤ ਅਤੇ ਇਤਿਹਾਸਕ ਗ੍ਰੰਥ
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight">
                Puratan Raag Darbar &amp; Historical Granths
              </h1>
              <p className="text-sm sm:text-base text-[#4A554E] leading-relaxed">
                Immerse in authentic Puratan Gurbani Kirtan across traditional Raags and Tanti
                Saaj instruments—with a persistent bottom mini-player that stays with you as you
                explore—or study primary Sikh Granths, Teekas, and encyclopedic lexicons inline.
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl border border-[#C59B27]/40 bg-[#121C15] shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("kirtan")}
                className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition ${
                  activeTab === "kirtan"
                    ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] shadow-sm"
                    : "text-[#4A554E] hover:text-[#171917]"
                }`}
              >
                ੧ · Puratan Kirtan &amp; Raag Player
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("granths")}
                className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition ${
                  activeTab === "granths"
                    ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] shadow-sm"
                    : "text-[#4A554E] hover:text-[#171917]"
                }`}
              >
                ੨ · Historical Granths &amp; PDF Library
              </button>
            </div>
          </div>
        </section>

        {/* ================================================================
            TAB A: PURATAN KIRTAN & RAAG DARBAR PLAYER
        ================================================================ */}
        {activeTab === "kirtan" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Active Raag Console */}
            <div className="lg:col-span-5 rounded-3xl border-2 border-[#C59B27] bg-[#1B2A20] p-6 sm:p-8 shadow-md space-y-6 sticky top-24">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C59B27] px-3 py-1 rounded-full bg-[#121C15] border border-[#C59B27]/40">
                  NOW IN RAAG DARBAR
                </span>
                <span className="text-xs font-semibold text-[#D97706]">
                  {currentTrack.angCitation}
                </span>
              </div>

              <div>
                <p
                  lang="pa"
                  className="font-gurmukhi text-2xl sm:text-3xl font-semibold text-[#C59B27]"
                >
                  {currentTrack.gurmukhiTitle}
                </p>
                <h2 className="text-2xl font-serif font-bold mt-1">
                  {currentTrack.title}
                </h2>
                <p className="text-sm font-medium text-[#4A554E] mt-1">
                  {currentTrack.ragi}
                </p>
              </div>

              {/* Audio Scrubber & Transport */}
              <div className="p-5 rounded-2xl bg-[#121C15] border border-[#C59B27]/35 space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="tabular-nums">{formatAudioTime(currentTime)}</span>
                  <span className="uppercase tracking-widest text-[10px] text-[#C59B27]">
                    {isPlaying
                      ? usingTantiSynth
                        ? "Playing Tanti Saaj Raag Harmonics"
                        : "Streaming Puratan Recital"
                      : "Ready to Play"}
                  </span>
                  <span className="tabular-nums">{formatAudioTime(duration)}</span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={duration || 300}
                  value={currentTime}
                  onChange={(e) => seekTo(Number(e.target.value))}
                  aria-label="Seek Kirtan audio"
                  className="w-full accent-[#C59B27] cursor-pointer h-2 rounded-lg"
                />

                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={prevTrack}
                    className="px-3.5 py-2 rounded-xl border border-[#C59B27]/40 text-xs font-semibold hover:border-[#C59B27] transition"
                  >
                    ⏮ Prev
                  </button>
                  <button
                    type="button"
                    onClick={togglePlayPause}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs sm:text-sm font-bold uppercase tracking-wider shadow-sm hover:brightness-105 transition"
                  >
                    {isPlaying ? "⏸ Pause Recital" : "▶ Play Puratan Recital"}
                  </button>
                  <button
                    type="button"
                    onClick={nextTrack}
                    className="px-3.5 py-2 rounded-xl border border-[#C59B27]/40 text-xs font-semibold hover:border-[#C59B27] transition"
                  >
                    Next ⏭
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#C59B27]/20 text-xs">
                  <span className="font-semibold text-[#4A554E]">Volume Control</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    aria-label="Volume control"
                    className="w-36 accent-[#C59B27] cursor-pointer"
                  />
                </div>
              </div>

              {/* Raag Musicology & Tanti Saaj Metadata */}
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="p-4 rounded-2xl bg-[#121C15] border border-[#C59B27]/30">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C59B27]">
                    Tanti Saaj &amp; Pehar (Time of Day)
                  </p>
                  <p className="font-semibold mt-1">{currentTrack.tantiSaaj}</p>
                  <p className="text-xs text-[#4A554E] mt-0.5">
                    Prescribed Pehar: {currentTrack.timeOfDay}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#121C15] border border-[#C59B27]/30 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C59B27]">
                    Raag Musicology &amp; Historical Lineage
                  </p>
                  <p className="text-[#4A554E] leading-relaxed">
                    {currentTrack.raagNotes}
                  </p>
                  <p className="text-[#4A554E] leading-relaxed pt-1 border-t border-[#C59B27]/20">
                    {currentTrack.historicalContext}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-[#4A554E]">
                    Continues playing in bottom bar while you browse
                  </span>
                  <a
                    href={currentTrack.externalArchiveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#C59B27] hover:underline"
                  >
                    Full Ragi Archive ↗
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Curated Puratan Kirtan Repertoire */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-serif font-bold">
                    Curated Puratan Raag Repertoire
                  </h2>
                  <p className="text-xs sm:text-sm text-[#4A554E]">
                    Select any Shabad to launch the HTML5 player and persistent bottom
                    mini-player.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {tracks.map((track) => {
                  const active = currentTrack.id === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => handleTrackClick(track)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleTrackClick(track);
                        }
                      }}
                      className={`p-6 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-4 ${
                        active
                          ? "bg-[#1B2A20] border-2 border-[#C59B27] shadow-md"
                          : "bg-[#F3ECE0] border-[#C59B27]/35 hover:border-[#C59B27]"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span
                            lang="pa"
                            className="h-10 w-10 rounded-xl bg-[#121C15] border border-[#C59B27]/45 font-gurmukhi text-base font-bold text-[#C59B27] flex items-center justify-center shrink-0"
                          >
                            {track.numeral}
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C59B27]">
                                {track.raag}
                              </span>
                              <span className="text-xs text-[#4A554E]">
                                • {track.durationLabel}
                              </span>
                            </div>
                            <p
                              lang="pa"
                              className="font-gurmukhi text-lg font-medium text-[#D97706] mt-0.5"
                            >
                              {track.gurmukhiTitle}
                            </p>
                            <h3 className="text-lg font-serif font-bold">
                              {track.title}
                            </h3>
                            <p className="text-xs font-medium text-[#4A554E]">
                              {track.ragi}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTrackClick(track);
                          }}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition ${
                            active && isPlaying
                              ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B]"
                              : "bg-[#121C15] border border-[#C59B27]/50 text-[#C59B27] hover:border-[#C59B27]"
                          }`}
                        >
                          {active && isPlaying ? "⏸ Playing" : "▶ Listen"}
                        </button>
                      </div>

                      <p className="text-xs sm:text-sm text-[#4A554E] leading-relaxed">
                        {track.raagNotes}
                      </p>

                      <div className="pt-3 border-t border-[#C59B27]/20 flex flex-wrap items-center justify-between gap-2 text-xs text-[#4A554E]">
                        <span>Instruments: {track.tantiSaaj}</span>
                        <span>{track.angCitation}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            TAB B: HISTORICAL GRANTHS & GURMAT VEECHAR PDF LIBRARY
        ================================================================ */}
        {activeTab === "granths" && (
          <div className="space-y-8">
            {/* Search & Category Filter Bar */}
            <div className="p-6 rounded-2xl bg-[#1B2A20] border border-[#C59B27]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {[
                  "All",
                  "Scriptural Teeka",
                  "Historical Chronicle",
                  "Canonical Bani",
                  "Lexicon",
                ].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setGranthCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                      granthCategory === cat
                        ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] font-bold"
                        : "bg-[#121C15] border border-[#C59B27]/35 text-[#4A554E] hover:border-[#C59B27]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="w-full md:w-80">
                <input
                  type="search"
                  value={granthQuery}
                  onChange={(e) => setGranthQuery(e.target.value)}
                  placeholder="Search Granth, author, or topic..."
                  aria-label="Search Historical Granths"
                  className="w-full rounded-xl border border-[#C59B27]/45 bg-[#121C15] px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#C59B27]"
                />
              </div>
            </div>

            {/* Granth Cards Grid (Max 3 per row on large screens) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredGranths.map((granth) => (
                <article
                  key={granth.id}
                  className="rounded-2xl border border-[#C59B27]/40 bg-[#1B2A20] p-6 shadow-sm hover:border-[#C59B27] transition flex flex-col justify-between gap-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        lang="pa"
                        className="h-8 w-8 rounded-lg bg-[#121C15] border border-[#C59B27]/40 font-gurmukhi text-sm font-bold text-[#C59B27] flex items-center justify-center"
                      >
                        {granth.numeral}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C59B27] px-2.5 py-1 rounded-full bg-[#121C15] border border-[#C59B27]/30">
                        {granth.category}
                      </span>
                    </div>

                    <div>
                      <p
                        lang="pa"
                        className="font-gurmukhi text-base font-medium text-[#D97706]"
                      >
                        {granth.gurmukhiTitle}
                      </p>
                      <h3 className="text-xl font-serif font-bold mt-0.5">
                        {granth.title}
                      </h3>
                      <p className="text-xs font-semibold text-[#4A554E] mt-1">
                        {granth.author} • {granth.period}
                      </p>
                    </div>

                    <p className="text-sm text-[#4A554E] leading-relaxed">
                      {granth.summary}
                    </p>

                    <div className="p-3.5 rounded-xl bg-[#121C15] border border-[#C59B27]/25 text-xs text-[#4A554E] leading-relaxed">
                      <strong className="text-[#C59B27] block mb-0.5">
                        Scholarly Significance:
                      </strong>
                      {granth.significance}
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-[#C59B27]/25">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGranth(granth);
                        setModalMode("folio");
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider shadow-sm hover:brightness-105 transition"
                    >
                      Open Inline Granth &amp; PDF Reader
                    </button>

                    <div className="flex items-center justify-between gap-2 text-xs font-semibold">
                      <a
                        href={granth.directPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#C59B27] hover:underline"
                      >
                        Direct PDF Download ↗
                      </a>
                      <a
                        href={granth.gurmatVeecharUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#4A554E] hover:underline"
                      >
                        GurmatVeechar Folder ↗
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Inline Granth & PDF Document Reader Modal */}
        {selectedGranth && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={selectedGranth.title}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto"
          >
            <div className="relative w-full max-w-4xl rounded-3xl border-2 border-[#C59B27] bg-[#1B2A20] p-6 sm:p-8 shadow-2xl space-y-6 my-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C59B27]/30 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C59B27]">
                    {selectedGranth.category} • {selectedGranth.volumesCount}
                  </span>
                  <h2 className="text-2xl font-serif font-bold mt-0.5">
                    {selectedGranth.title}
                  </h2>
                  <p className="text-xs text-[#4A554E]">{selectedGranth.author}</p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => setModalMode("folio")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                      modalMode === "folio"
                        ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B]"
                        : "bg-[#121C15] border border-[#C59B27]/40 text-[#4A554E]"
                    }`}
                  >
                    Folio &amp; Exegesis View
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalMode("pdf")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                      modalMode === "pdf"
                        ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B]"
                        : "bg-[#121C15] border border-[#C59B27]/40 text-[#4A554E]"
                    }`}
                  >
                    Embedded Document / PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedGranth(null)}
                    aria-label="Close reader modal"
                    className="px-3 py-2 rounded-xl border border-[#C59B27]/45 text-xs font-bold hover:border-[#C59B27]"
                  >
                    ✕ Close
                  </button>
                </div>
              </div>

              {modalMode === "folio" ? (
                <div className="space-y-5">
                  <div className="p-6 rounded-2xl bg-[#121C15] border border-[#C59B27]/40 space-y-4">
                    <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#C59B27]">
                      {selectedGranth.sampleFolio.heading}
                    </span>
                    <p
                      lang="pa"
                      className="font-gurmukhi text-2xl sm:text-3xl leading-relaxed text-[#C59B27]"
                    >
                      {selectedGranth.sampleFolio.gurmukhi}
                    </p>
                    <p className="text-sm italic text-[#4A554E]">
                      {selectedGranth.sampleFolio.transliteration}
                    </p>
                    <p className="text-base font-medium leading-relaxed pt-2 border-t border-[#C59B27]/20">
                      {selectedGranth.sampleFolio.translation}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#121C15] border border-[#C59B27]/30 space-y-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#C59B27]">
                      Scholarly &amp; Grammatical Commentary
                    </h3>
                    <p className="text-sm text-[#4A554E] leading-relaxed">
                      {selectedGranth.sampleFolio.scholarlyNote}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-full h-[460px] rounded-2xl overflow-hidden border border-[#C59B27]/45 bg-[#121C15]">
                    <iframe
                      src={selectedGranth.archiveEmbedUrl}
                      title={`${selectedGranth.title} Document Reader`}
                      className="w-full h-full border-0"
                      allowFullScreen
                    />
                  </div>
                  <p className="text-xs text-[#4A554E]">
                    If your browser blocks third-party embedded PDF frames, use the direct
                    PDF download or GurmatVeechar repository links below.
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#C59B27]/30">
                <div className="flex flex-wrap gap-3">
                  <a
                    href={selectedGranth.directPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider"
                  >
                    Download Full PDF ↗
                  </a>
                  <a
                    href={selectedGranth.gurmatVeecharUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl border border-[#C59B27]/50 bg-[#121C15] text-xs font-semibold hover:border-[#C59B27]"
                  >
                    Browse All Volumes on GurmatVeechar ↗
                  </a>
                </div>
                <Link
                  href="/nitnem"
                  className="text-xs font-semibold text-[#C59B27] hover:underline"
                >
                  Open Live Nitnem &amp; Bani Reader →
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
