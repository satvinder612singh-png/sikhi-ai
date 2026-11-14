"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Hero } from "@/components/hero";
import { DailyHukamnama } from "@/components/daily-hukamnama";
import { BaaniPortal } from "@/components/baani-portal";
import { GurmatVeecharHub } from "@/components/gurmat-veechar-hub";
import { EcologySevaSection } from "@/components/ecology-seva-section";
import { BrandLogo } from "@/components/brand-logo";
import { Footer } from "@/components/footer";

/* ============================================================================
   1. CEREMONIAL OPENING CURTAIN (Ik Onkar, BrandLogo & Gurmukhi Archway)
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
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1B2A20] text-[#FAF6EE] cursor-pointer overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,155,39,0.22)_0%,rgba(217,119,6,0.08)_40%,transparent_70%)]" />

          <motion.svg
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.4 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="absolute w-[340px] h-[460px] md:w-[460px] md:h-[580px] stroke-[#C59B27]"
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
            className="relative z-10 flex flex-col items-center text-center px-6"
          >
            <div className="mb-3">
              <BrandLogo size="xl" animated={true} />
            </div>
            <div
              lang="pa"
              className="font-gurmukhi text-4xl md:text-5xl text-[#E5C158] drop-shadow-[0_0_20px_rgba(197,155,39,0.45)] mb-2"
            >
              ੴ
            </div>
            <motion.p
              lang="pa"
              initial={{ opacity: 0, letterSpacing: "0.05em" }}
              animate={{ opacity: 1, letterSpacing: "0.18em" }}
              transition={{ duration: 1.4, delay: 0.7 }}
              className="font-gurmukhi text-lg md:text-xl text-[#E5C158] font-medium"
            >
              ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ
            </motion.p>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "180px" }}
              transition={{ duration: 1.2, delay: 1.0 }}
              className="h-[1px] bg-gradient-to-r from-transparent via-[#C59B27] to-transparent mx-auto my-5"
            />
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.3 }}
              className="text-2xl md:text-3xl font-serif tracking-wide text-[#FAF6EE]"
            >
              LEARN <span className="text-[#E5C158]">SIKHI</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              transition={{ duration: 1, delay: 1.7 }}
              className="mt-2 text-xs md:text-sm text-[#F3ECE0]/80 max-w-md mx-auto italic"
            >
              Explore the depths of Sikhi.
            </motion.p>
          </motion.div>

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            transition={{ delay: 2.2 }}
            className="absolute bottom-8 text-xs tracking-widest uppercase text-[#E5C158]"
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
            lang="pa"
            aria-hidden="true"
            className="pointer-events-none select-none absolute left-1/2 -top-10 -translate-x-1/2 text-6xl md:text-8xl font-gurmukhi text-[#C59B27]/[0.14] whitespace-nowrap"
          >
            {gurmukhiWatermark}
          </span>
        )}
        {eyebrow && (
          <p className="text-xs md:text-sm uppercase tracking-[0.25em] text-[#D97706] font-semibold mb-2">
            {eyebrow}
          </p>
        )}
        <h2 className="relative text-3xl md:text-5xl font-serif font-bold text-[#171917] tracking-tight">
          {title}
        </h2>
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="h-[2px] w-36 bg-gradient-to-r from-transparent via-[#C59B27] to-transparent mx-auto my-5"
        />
        {subtitle && (
          <p className="max-w-3xl mx-auto text-sm md:text-base text-[#4A554E] leading-relaxed">
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
   3. THE UNSUNG MATRIARCHS OIL-PAINTING PORTAL
============================================================================ */
const MATRIARCHS = [
  {
    id: "bebe-nanaki",
    numeral: "੧",
    folioTag: "FOLIO I • SULTANPUR LODHI",
    name: "Bebe Nanaki Ji",
    gurmukhiName: "ਬੇਬੇ ਨਾਨਕੀ ਜੀ",
    era: "1464 – 1518 CE",
    title: "The First Sikh & Guardian of the Prophetic Flame",
    paintingTitle: "Canvas I: The First Rabab at Sultanpur Lodhi (c. 1498)",
    paintingSceneDescription:
      "Chiaroscuro oil study: In a lamplit courtyard in Sultanpur Lodhi, Bebe Nanaki Ji places silver coins into the hands of Bhai Mardana Ji to commission the very first Rabab for Guru Nanak Dev Ji, shielding her brother from their father Mehta Kalu's worldly expectations.",
    palette: { primary: "#1E293B", secondary: "#78350F", accent: "#F59E0B" },
    calligraphyEmblem: "ਰਬਾਬ",
    emblemCaption: "PATRON OF GURMAT KIRTAN",
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
    numeral: "੨",
    folioTag: "FOLIO II • ANG 967 RECORD",
    name: "Mata Khivi Ji",
    gurmukhiName: "ਮਾਤਾ ਖੀਵੀ ਜੀ",
    era: "1506 – 1582 CE",
    title: "The Sovereign Architect of Guru Ka Langar",
    paintingTitle: "Canvas II: The Leafy Shade of Khadur Sahib (c. 1545)",
    paintingSceneDescription:
      "Warm Venetian-style oil painting: Beneath a sprawling banyan tree at Khadur Sahib, Mata Khivi Ji personally oversees copper cauldrons of steaming kheer rich with pure ghee, seating emperors, outcastes, and beggars on the exact same floor.",
    palette: { primary: "#27170E", secondary: "#7C2D12", accent: "#FBBF24" },
    calligraphyEmblem: "ਲੰਗਰੁ",
    emblemCaption: "ARCHITECT OF PANGAT",
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
    numeral: "੩",
    folioTag: "FOLIO III • ROYAL HUKAMNAMAS",
    name: "Mata Sundari Ji",
    gurmukhiName: "ਮਾਤਾ ਸੁੰਦਰੀ ਜੀ",
    era: "1667 – 1747 CE",
    title: "40-Year Supreme Stateswoman of the Khalsa Panth",
    paintingTitle: "Canvas III: Sealing the Royal Hukamnamas at Haveli Mata Sundari, Delhi (c. 1721)",
    paintingSceneDescription:
      "Regal Mughal-Sikh court oil portrait: Dressed in deep indigo and gold brocade, Mata Sundari Ji presses her official seal (Mohar) onto a parchment Hukamnama by candlelight, flanked by Bhai Mani Singh Ji and armed Akali Nihang sentries.",
    palette: { primary: "#0F172A", secondary: "#311042", accent: "#EAB308" },
    calligraphyEmblem: "ਹੁਕਮਨਾਮਾ",
    emblemCaption: "SOVEREIGN SEAL (MOHAR)",
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
    numeral: "੪",
    folioTag: "FOLIO IV • KHIDRANA DHAAB",
    name: "Mai Bhago Ji (Mata Bhag Kaur)",
    gurmukhiName: "ਮਾਈ ਭਾਗੋ ਜੀ",
    era: "c. 1666 – 1708 CE",
    title: "Commander of the Battle of Muktsar & Hazoori Bodyguard",
    paintingTitle: "Canvas IV: The Lance at Khidrana Dhaab (1705 CE)",
    paintingSceneDescription:
      "Dramatic battlefield oil canvas: Amidst swirling desert dust at Khidrana, Mai Bhago Ji—wearing a steel Dastar-Bunga and chainmail—charges forward on horseback with her iron lance (Barcha), rallying the forty redeemed warriors against Wazir Khan's imperial cavalry.",
    palette: { primary: "#18181B", secondary: "#450A0A", accent: "#F59E0B" },
    calligraphyEmblem: "ਬਰਛਾ",
    emblemCaption: "COMMANDER AT MUKTSAR",
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
      <div className="p-6 md:p-8 rounded-2xl bg-[#1B2A20] text-[#FAF6EE] border border-[#C59B27]/45 shadow-parchment">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="text-[11px] uppercase tracking-[0.22em] text-[#E5C158] font-semibold px-2.5 py-0.5 rounded bg-[#121C15] border border-[#C59B27]/35">
                ARCHIVAL EXHIBITION • ANG 473 &amp; ANG 967
              </span>
              <span className="h-[1px] w-10 bg-[#C59B27]/45" />
            </div>
            <h3 className="text-xl md:text-2xl font-serif text-[#FAF6EE]">
              Why Do Our Stages Speak So Little of the Women Who Built the Panth?
            </h3>
            <p className="text-sm text-[#F3ECE0]/90 leading-relaxed">
              While Guru Nanak Dev Ji declared women&apos;s absolute equality on Ang 473 over five centuries ago, modern discourse and male-dominated stages often relegate Sikh women to the background. Without <strong>Bebe Nanaki Ji</strong>, there is no first Rabab; without <strong>Mata Khivi Ji</strong>, no institutionalized Langar; without <strong>Mata Sundari Ji</strong>, the 18th-century Khalsa would have fractured. Explore their lives through the oil-canvas gallery below.
            </p>
          </div>
          <div className="shrink-0 p-4 rounded-xl bg-[#121C15] border border-[#C59B27]/40 text-center">
            <p lang="pa" className="text-lg font-gurmukhi text-[#E5C158]">ਸੋ ਕਿਉ ਮੰਦਾ ਆਖੀਐ</p>
            <p className="text-xs text-[#F3ECE0]/85 mt-1">“Why call her inferior?”</p>
            <span className="text-[11px] text-[#D97706] font-medium block mt-1">
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
                  ? "bg-[#1B2A20] text-[#FAF6EE] border-[#C59B27] shadow-[0_8px_24px_rgba(27,42,32,0.2)]"
                  : "bg-[#F3ECE0] text-[#171917] border-[#C59B27]/35 hover:border-[#C59B27]"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span
                  lang="pa"
                  className={`font-gurmukhi text-sm font-bold px-2 py-0.5 rounded border ${
                    selected
                      ? "bg-[#121C15] text-[#E5C158] border-[#C59B27]/45"
                      : "bg-[#FAF6EE] text-[#1B2A20] border-[#C59B27]/35"
                  }`}
                >
                  {m.numeral}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-[0.16em] font-semibold ${
                    selected ? "text-[#E5C158]/80" : "text-[#4A554E]"
                  }`}
                >
                  {m.era}
                </span>
              </div>
              <p
                lang="pa"
                className={`text-sm font-gurmukhi ${
                  selected ? "text-[#E5C158]" : "text-[#D97706]"
                }`}
              >
                {m.gurmukhiName}
              </p>
              <h4
                className={`text-base font-serif font-bold mt-0.5 ${
                  selected ? "text-[#FAF6EE]" : "text-[#171917]"
                }`}
              >
                {m.name}
              </h4>
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
              className="relative flex-1 min-h-[380px] rounded-2xl p-6 md:p-8 flex flex-col justify-between overflow-hidden border-4 border-[#C59B27] shadow-[inset_0_0_60px_rgba(0,0,0,0.85),0_15px_40px_rgba(27,42,32,0.35)]"
              style={{
                background: `radial-gradient(circle at 50% 35%, ${activeFigure.palette.secondary}, ${activeFigure.palette.primary} 75%, #121C15 100%)`,
              }}
            >
              <div className="relative z-10 flex justify-between items-center text-[11px] uppercase tracking-[0.2em] text-[#E5C158]/90">
                <span>{activeFigure.folioTag}</span>
                <span>{activeFigure.era}</span>
              </div>

              <div className="relative z-10 my-auto py-8 text-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="w-36 h-36 mx-auto rounded-full border border-[#C59B27]/60 bg-black/35 backdrop-blur-sm flex flex-col items-center justify-center shadow-[0_0_50px_rgba(197,155,39,0.3)] px-3"
                >
                  <span
                    lang="pa"
                    className="font-gurmukhi text-xs text-[#C59B27] tracking-widest mb-1"
                  >
                    {activeFigure.numeral}
                  </span>
                  <span
                    lang="pa"
                    className="font-gurmukhi text-2xl md:text-3xl text-[#E5C158] font-semibold"
                  >
                    {activeFigure.calligraphyEmblem}
                  </span>
                  <span className="mt-1.5 text-[9px] uppercase tracking-[0.18em] text-[#F3ECE0]/75">
                    {activeFigure.emblemCaption}
                  </span>
                </motion.div>
                <p
                  lang="pa"
                  className="mt-5 text-2xl md:text-3xl font-gurmukhi text-[#FAF6EE] drop-shadow"
                >
                  {activeFigure.gurmukhiName}
                </p>
                <p className="text-sm font-serif italic text-[#E5C158] mt-1">
                  {activeFigure.paintingTitle}
                </p>
              </div>

              <div className="relative z-10 p-4 rounded-xl bg-black/65 border border-[#C59B27]/45 backdrop-blur-md">
                <p className="text-xs text-[#FAF6EE]/90 leading-relaxed italic">
                  <strong>Scene Study:</strong> {activeFigure.paintingSceneDescription}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#1B2A20] text-[#FAF6EE] border border-[#C59B27]/40 rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs uppercase tracking-widest text-[#E5C158] font-semibold">
                  {activeFigure.title}
                </span>
                <span
                  lang="pa"
                  className="font-gurmukhi text-sm font-bold text-[#E5C158] px-2.5 py-0.5 rounded bg-[#121C15] border border-[#C59B27]/40"
                >
                  {activeFigure.numeral}
                </span>
              </div>
              <h3 className="text-3xl font-serif text-[#FAF6EE] mt-1">
                {activeFigure.name}
              </h3>

              <div className="flex flex-wrap gap-2 mt-6 border-b border-[#C59B27]/25 pb-4">
                <button
                  onClick={() => setActiveTab("story")}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                    activeTab === "story"
                      ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#171917]"
                      : "bg-[#121C15] text-[#F3ECE0] hover:bg-[#263B2D]"
                  }`}
                >
                  Her Life &amp; Sovereignty
                </button>
                <button
                  onClick={() => setActiveTab("silence")}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                    activeTab === "silence"
                      ? "bg-[#D97706]/25 text-[#E5C158] border border-[#D97706]/50"
                      : "bg-[#121C15] text-[#F3ECE0] hover:bg-[#263B2D]"
                  }`}
                >
                  Why Men Talk Less About Her
                </button>
                <button
                  onClick={() => setActiveTab("proof")}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                    activeTab === "proof"
                      ? "bg-[#C59B27]/25 text-[#E5C158] border border-[#C59B27]/50"
                      : "bg-[#121C15] text-[#F3ECE0] hover:bg-[#263B2D]"
                  }`}
                >
                  Primary Historical Record
                </button>
              </div>

              <div className="mt-6 min-h-[180px]">
                {activeTab === "story" && (
                  <p className="text-sm md:text-base text-[#F3ECE0] leading-relaxed">
                    {activeFigure.lifeStory}
                  </p>
                )}
                {activeTab === "silence" && (
                  <div className="p-4 rounded-xl bg-[#121C15] border border-[#D97706]/45">
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D97706] mb-2">
                      HISTORIOGRAPHICAL CRITIQUE • CONFRONTING ERASURE
                    </h4>
                    <p className="text-sm md:text-base text-[#F3ECE0] leading-relaxed">
                      {activeFigure.whyMenTalkLess}
                    </p>
                  </div>
                )}
                {activeTab === "proof" && (
                  <div className="p-4 rounded-xl bg-[#121C15] border border-[#C59B27]/45">
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#E5C158] mb-2">
                      PRIMARY ARCHIVAL &amp; SCRIPTURAL EVIDENCE
                    </h4>
                    <p className="text-sm md:text-base text-[#F3ECE0] leading-relaxed">
                      {activeFigure.historicalProof}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#C59B27]/25 flex items-center justify-between text-xs text-[#F3ECE0]/75">
              <span className="uppercase tracking-wider text-[11px]">Primary Source Citation</span>
              <span className="text-[#E5C158] font-medium">
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
type PanthicPortalItem = {
  numeral: string;
  archiveTag: string;
  name: string;
  url: string;
  category: string;
  description: string;
  highlight: string;
  secondaryLinks?: { label: string; url: string }[];
};

const PANTHIC_PORTALS: PanthicPortalItem[] = [
  {
    numeral: "੧",
    archiveTag: "ARCHIVE I • CLASSICAL GRANTHS",
    name: "Manglacharan (by Jvala Singh)",
    url: "https://www.manglacharan.com/",
    category: "Classical Granths & Pre-Colonial History",
    description:
      "Translations and deep literary analysis of classical Sikh historical texts including Sri Gur Pratap Suraj Granth, Panth Prakash, and Sri Dasam Granth.",
    highlight: "Read primary-source translations of 18th-century Khalsa chronicles.",
  },
  {
    numeral: "੨",
    archiveTag: "ARCHIVE II • CONTEMPORARY WITNESS",
    name: "1984 Saka & Shaheed Historical Archives",
    url: "https://1984tribute.com/",
    category: "1984 Tribute, Ensaaf & Preserved NeverForget84 Memorial",
    description:
      "Verified digital memorials and human-rights archives documenting the June 1984 military assault on Sri Harmandir Sahib, the November 1984 anti-Sikh pogroms, and biographies of Shaheeds.",
    highlight: "Eyewitness testimonies, rare photographs, and documented human-rights timelines.",
    secondaryLinks: [
      {
        label: "1984 Tribute Archive ↗",
        url: "https://1984tribute.com/",
      },
      {
        label: "Ensaaf Documentation ↗",
        url: "https://ensaaf.org/",
      },
      {
        label: "Original NeverForget84 (Wayback) ↗",
        url: "https://web.archive.org/web/20160618115353/http://www.neverforget84.com/",
      },
    ],
  },
  {
    numeral: "੩",
    archiveTag: "ARCHIVE III • MIRI-PIRI THOUGHT",
    name: "Bunga Azaadi",
    url: "https://www.bungaazaadi.com/",
    category: "Sikh Sovereignty, Philosophy & Ethos",
    description:
      "Platform dedicated to revitalizing indigenous Sikh political thought, Miri-Piri philosophy, anti-colonial history, and the intellectual traditions of the Khalsa.",
    highlight: "Essays, podcasts, and research on Khalsa sovereignty (Patshahi).",
  },
  {
    numeral: "੪",
    archiveTag: "ARCHIVE IV • SHABAD CONCORDANCE",
    name: "SikhiToTheMax (BaniDB)",
    url: "https://www.sikhitothemax.org/",
    category: "Complete Gurbani Search & Translation Portal",
    description:
      "The gold-standard portal for searching Sri Guru Granth Sahib Ji, Sri Dasam Granth, Bhai Gurdas Ji Vaaran, and Bhai Nand Lal Ji Ghazals with word-by-word meanings.",
    highlight: "Direct Ang-by-Ang navigation and Larivaar/Padchhed toggles.",
  },
];

function ScholarlyPortals() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {PANTHIC_PORTALS.map((portal) => (
        <div
          key={portal.name}
          className="group p-6 rounded-2xl bg-[#F3ECE0] border border-[#C59B27]/40 hover:border-[#D97706] hover:bg-[#1B2A20] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-between shadow-parchment"
        >
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <span
                  lang="pa"
                  className="font-gurmukhi text-sm font-bold px-2.5 py-0.5 rounded bg-[#1B2A20] text-[#E5C158] border border-[#C59B27]/40 group-hover:bg-[#121C15]"
                >
                  {portal.numeral}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D97706] group-hover:text-[#E5C158] px-3 py-1 rounded bg-[#C59B27]/15 border border-[#C59B27]/30">
                  {portal.archiveTag}
                </span>
              </div>
              <a
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-widest text-[#4A554E] group-hover:text-[#E5C158] hover:underline transition font-semibold"
              >
                Visit Archive ↗
              </a>
            </div>
            <h3 className="text-xl font-serif font-bold text-[#171917] group-hover:text-[#FAF6EE] transition">
              <a
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {portal.name}
              </a>
            </h3>
            <p className="text-xs uppercase tracking-wider text-[#4A554E] group-hover:text-[#E5C158]/80 mt-1 font-medium">
              {portal.category}
            </p>
            <p className="text-sm text-[#4A554E] group-hover:text-[#F3ECE0]/90 mt-2.5 leading-relaxed">
              {portal.description}
            </p>

            {portal.secondaryLinks && (
              <div className="mt-4 flex flex-wrap gap-2">
                {portal.secondaryLinks.map((lnk) => (
                  <a
                    key={lnk.url}
                    href={lnk.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 rounded-lg bg-[#1B2A20] text-[#E5C158] border border-[#C59B27]/45 text-xs font-semibold hover:bg-[#D97706] hover:text-[#171917] transition"
                  >
                    {lnk.label}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="mt-5 pt-3 border-t border-[#C59B27]/25 text-xs text-[#1B2A20] group-hover:text-[#E5C158] italic font-medium">
            {portal.highlight}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================================
   6. INTERACTIVE SIKHI GAMES & ABHIYAAS CALLOUT
============================================================================ */
const FEATURED_GAMES = [
  {
    id: "larivaar",
    numeral: "੧",
    tag: "GURBANI SANTHIYA • UP TO +15 COINS",
    title: "Larivaar Padchhed & Arth",
    gurmukhi: "ਲੜੀਵਾਰ ਪਦਛੇਦ ਅਤੇ ਅਰਥ",
    audience: "Adults & Scholars",
    description:
      "Split unbroken Gurmukhi Larivaar verses from Sri Guru Granth Sahib Ji into accurate Padchhed words, then unlock philosophical Arth and Shabad-Arth vocabulary.",
  },
  {
    id: "shatranj",
    numeral: "੨",
    tag: "KHALSA STRATEGY • WIN +20 COINS",
    title: "Sikh Shatranj (Dhai Phat)",
    gurmukhi: "ਸਿੱਖ ਸ਼ਤਰੰਜ · ਢਾਈ ਫੱਟ",
    audience: "Teens & Adults",
    description:
      "Command the Jathedar, Akali Nihang, Ghorchurra Cavalry, Qila Fort, Misl Vanguard, and Khalsa Sipahi on a 6×6 tactical grid with real historical battlefield dispatches.",
  },
  {
    id: "hola-mahalla",
    numeral: "੩",
    tag: "ANANDPUR SPRINT • 1ST PLACE +10 COINS",
    title: "Hola Mahalla Ghurdaur",
    gurmukhi: "ਹੋਲਾ ਮਹੱਲਾ ਘੁੜਦੌੜ",
    audience: "All Ages",
    description:
      "Inspired by the martial equestrian displays of Sri Anandpur Sahib (1701 CE). Pledge support to a historic steed, answer trivia for a Chardi Kala speed boost, and sprint!",
  },
  {
    id: "bujharto",
    numeral: "੪",
    tag: "CHILDREN'S ARCADE • +5 COINS / STREAK",
    title: "Bujharto & Painti Akhar Quest",
    gurmukhi: "ਬੁਝਾਰਤਾਂ ਅਤੇ ਪੈਂਤੀ ਅੱਖਰ",
    audience: "Children & Families",
    description:
      "Solve 'Who Am I?' historical riddles (Bujhartan) about the Ten Gurus, Chaar Sahibzaade, and Gursikhs, and master all 35 letters of the Gurmukhi Painti Akhar.",
  },
];

function GamesAbhiyaasCallout() {
  return (
    <div className="space-y-8">
      <div className="p-6 md:p-8 rounded-2xl bg-[#1B2A20] text-[#FAF6EE] border-2 border-[#C59B27] shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[11px] uppercase tracking-[0.22em] text-[#E5C158] font-semibold px-3 py-1 rounded bg-[#121C15] border border-[#C59B27]/45">
              NEW • SHARED KNOWLEDGE COINS TREASURY (START WITH 50 COINS)
            </span>
          </div>
          <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#FAF6EE]">
            Learn Through Abhiyaas: From Gurmukhi Painti Akhar to Larivaar Santhiya
          </h3>
          <p className="text-sm text-[#F3ECE0]/90 leading-relaxed">
            Every learner begins with <strong>50 Knowledge Coins</strong> in their Abhiyaas
            Treasury. Earn Coins and unlock scholarly badges across four purpose-built interactive
            experiences uniting Gurmukhi literacy, Gurbani contemplation, and Khalsa history.
          </p>
        </div>

        <Link
          href="/games"
          className="shrink-0 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] px-6 py-4 text-sm font-bold uppercase tracking-wider text-[#171917] shadow-lg transition hover:brightness-105"
        >
          Enter Games / Abhiyaas Hub →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {FEATURED_GAMES.map((game) => (
          <Link
            key={game.id}
            href={`/games?game=${game.id}`}
            className="group p-6 rounded-2xl bg-[#F3ECE0] border border-[#C59B27]/45 hover:border-[#D97706] hover:bg-[#1B2A20] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-between shadow-parchment"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    lang="pa"
                    className="font-gurmukhi text-sm font-bold px-2.5 py-0.5 rounded bg-[#1B2A20] text-[#E5C158] border border-[#C59B27]/40 group-hover:bg-[#121C15]"
                  >
                    {game.numeral}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#D97706] group-hover:text-[#E5C158] px-2.5 py-0.5 rounded bg-[#C59B27]/15 border border-[#C59B27]/30">
                    {game.tag}
                  </span>
                </div>
                <span className="text-xs font-semibold text-[#4A554E] group-hover:text-[#E5C158]">
                  {game.audience}
                </span>
              </div>

              <p
                lang="pa"
                className="font-gurmukhi text-sm text-[#D97706] group-hover:text-[#E5C158] font-medium"
              >
                {game.gurmukhi}
              </p>
              <h4 className="text-xl font-serif font-bold text-[#171917] group-hover:text-[#FAF6EE] mt-0.5">
                {game.title}
              </h4>
              <p className="text-sm text-[#4A554E] group-hover:text-[#F3ECE0]/90 mt-2 leading-relaxed">
                {game.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-[#C59B27]/25 flex items-center justify-between text-xs font-semibold text-[#1B2A20] group-hover:text-[#E5C158]">
              <span>Play Directly in Browser</span>
              <span>Launch Module →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ============================================================================
   MAIN HOMEPAGE EXPORT
============================================================================ */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FAF6EE] text-[#171917]">
      <IntroLoader />
      <Hero />

      {/* Daily Sri Darbar Sahib (Golden Temple) Hukamnama Live Banner */}
      <section
        id="hukamnama-preview"
        aria-label="Today's Hukamnama from Sri Darbar Sahib, Amritsar"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-2"
      >
        <DailyHukamnama mode="preview" />
      </section>

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
        id="gurmat-veechar"
        eyebrow="Chapter III • Gurmat Veechar & Classical Exegesis"
        gurmukhiWatermark="ਗੁਰਮਤਿ ਵਿਚਾਰ"
        title="Scriptural Steeks, Historical Granths & Katha Archive"
        subtitle="Explore classical Gurbani exegesis (Steeks and Teekas), canonical court Granths, and foundational oral Katha traditions curated from the Gurmat Veechar digital library."
      >
        <GurmatVeecharHub />
      </ChapterSection>

      <ChapterSection
        id="ecology"
        eyebrow="Chapter IV • Applied Gurmat & Planetary Seva"
        gurmukhiWatermark="ਸਰਬੱਤ ਦਾ ਭਲਾ"
        title="Sarbat da Bhala in Practice: Ecology, Seva & Conscious Living"
        subtitle="Bridging inward Simran—an intimate, unmediated connection between the soul and Akal Purakh—with outward stewardship of Kudrat (Nature), zero-waste Langar, and conscious living."
      >
        <EcologySevaSection />
      </ChapterSection>

      <ChapterSection
        id="abhiyaas"
        eyebrow="Chapter V • Interactive Abhiyaas & Gamified Learning"
        gurmukhiWatermark="ਅਭਿਆਸ"
        title="Interactive Sikhi Games & Knowledge Hub"
        subtitle="Four interactive games for scholars, teens, and children—uniting Larivaar Padchhed contemplation, Khalsa tactical strategy, Hola Mahalla equestrian sprints, and Gurmukhi Painti Akhar literacy."
      >
        <GamesAbhiyaasCallout />
      </ChapterSection>

      <ChapterSection
        id="archives"
        eyebrow="Chapter VI • Community Scholarship"
        gurmukhiWatermark="ਇਤਿਹਾਸ"
        title="Connected Panthic Archives"
        subtitle="Continue your research across independent Sikh historical, scriptural, and human-rights archives."
      >
        <ScholarlyPortals />
      </ChapterSection>

      {/* About This Initiative — Student Individual Project Callout Banner */}
      <section
        id="about-initiative"
        aria-label="About This Student Initiative"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20"
      >
        <div className="p-8 md:p-10 rounded-2xl bg-[#1B2A20] text-[#FAF6EE] border-2 border-[#C59B27] shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#C59B27] bg-[#121C15] px-4 py-1.5 text-xs font-bold tracking-wide text-[#E5C158]">
                🎓 Student Individual Project • Built to Connect the Sangat with Sikhi
              </span>
              <span className="text-xs uppercase tracking-[0.2em] text-[#D97706] font-semibold">
                About This Initiative
              </span>
            </div>
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-[#FAF6EE]">
              Connecting the Global Sangat with Gurbani, History &amp; Gurmat
            </h2>
            <p className="text-sm md:text-base text-[#F3ECE0]/90 leading-relaxed">
              Learn Sikhi is an independent student individual project dedicated to connecting
              people everywhere with the wisdom of Gurbani, Sikh history, and Gurmat philosophy
              through modern, interactive digital tools.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <Link
              href="/games"
              className="whitespace-nowrap inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#171917] shadow-lg transition hover:brightness-105"
            >
              Launch Abhiyaas Games Hub →
            </Link>
            <Link
              href="/ask"
              className="whitespace-nowrap inline-flex items-center justify-center rounded-xl border border-[#C59B27]/60 bg-[#121C15] px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#E5C158] transition hover:border-[#D97706]"
            >
              Explore Scriptural Inquiry →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
