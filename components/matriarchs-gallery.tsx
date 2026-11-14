"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Flame, Scroll, Eye, Sparkles } from "lucide-react";

interface MatriarchFigure {
  id: string;
  name: string;
  gurmukhiName: string;
  era: string;
  title: string;
  paintingTitle: string;
  paintingSceneDescription: string;
  palette: { primary: string; secondary: string; accent: string };
  emblemType: "rabab" | "langar" | "mohar" | "lance";
  lifeStory: string;
  whyMenTalkLess: string;
  historicalProof: string;
  primaryCitation: string;
}

const MATRIARCHS: MatriarchFigure[] = [
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

export default function MatriarchsGallery() {
  const [activeFigure, setActiveFigure] = useState<MatriarchFigure>(MATRIARCHS[0]);
  const [activeTab, setActiveTab] = useState<"story" | "silence" | "proof">("story");

  return (
    <div className="space-y-10">
      {/* Editorial Callout: Confronting the Cultural Silence */}
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
              While Guru Nanak Dev Ji declared women's absolute equality on Ang 473 over five centuries ago, modern discourse and male-dominated stages often relegate Sikh women to the background. Without <strong>Bebe Nanaki Ji</strong>, there is no first Rabab; without <strong>Mata Khivi Ji</strong>, no institutionalized Langar; without <strong>Mata Sundari Ji</strong>, the 18th-century Khalsa would have fractured. Explore their lives through the oil-canvas gallery below.
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

      {/* Portrait Selector Pills */}
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

      {/* Main Exhibition Display: Oil Painting Canvas + Historical Dossier */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFigure.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
        >
          {/* Left: Classical Oil-Painting Canvas Frame */}
          <div className="lg:col-span-6 flex flex-col">
            <div
              className="relative flex-1 min-h-[380px] rounded-2xl p-6 md:p-8 flex flex-col justify-between overflow-hidden border-4 border-[#8A6D2F] shadow-[inset_0_0_60px_rgba(0,0,0,0.85),0_15px_40px_rgba(0,0,0,0.7)]"
              style={{
                background: `radial-gradient(circle at 50% 35%, ${activeFigure.palette.secondary}, ${activeFigure.palette.primary} 75%, #05070B 100%)`,
              }}
            >
              {/* SVG Oil Canvas Brushstroke & Weave Filter Overlay */}
              <svg className="pointer-events-none absolute inset-0 w-full h-full opacity-25 mix-blend-overlay">
                <filter id="oil-canvas-weave">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.8"
                    numOctaves="3"
                    result="noise"
                  />
                  <feDiffuseLighting
                    in="noise"
                    lightingColor="#D4AF37"
                    surfaceScale="1.5"
                  >
                    <feDistantLight azimuth="45" elevation="60" />
                  </feDiffuseLighting>
                </filter>
                <rect width="100%" height="100%" filter="url(#oil-canvas-weave)" />
              </svg>

              {/* Ornate Corner Filigree */}
              <div className="relative z-10 flex justify-between items-center text-xs uppercase tracking-widest text-[#D4AF37]/80">
                <span> Sikh Heritage Oil Collection </span>
                <span>{activeFigure.era}</span>
              </div>

              {/* Central Chiaroscuro Emblem & Silhouette Scene */}
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

              {/* Museum Brass Plaque Caption */}
              <div className="relative z-10 p-4 rounded-xl bg-black/65 border border-[#D4AF37]/40 backdrop-blur-md">
                <p className="text-xs text-amber-100/90 leading-relaxed italic">
                  <strong>Scene Study:</strong> {activeFigure.paintingSceneDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Deep-Dive Historical Portal & Tabs */}
          <div className="lg:col-span-6 bg-[#0D1322] border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
                {activeFigure.title}
              </span>
              <h3 className="text-3xl font-serif text-white mt-1">
                {activeFigure.name}
              </h3>

              {/* Interactive Perspective Switcher */}
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

              {/* Tab Content */}
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