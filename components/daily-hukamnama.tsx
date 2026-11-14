"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export interface HukamnamaVerse {
  verseId: number;
  shabadId: number;
  pageNo: number;
  writer: string;
  raag: string;
  gurmukhiUnicode: string;
  larivaarUnicode: string;
  transliteration: string;
  punjabiViakhia: string;
  englishTranslation: string;
}

export interface HukamnamaData {
  gregorianDate: string;
  nanakshahiDate: string;
  ang: number;
  raag: string;
  writer: string;
  titleGurmukhi: string;
  verses: HukamnamaVerse[];
}

const DEFAULT_FALLBACK_HUKAMNAMA: HukamnamaData = {
  gregorianDate: "Today's Sacred Mukhwak",
  nanakshahiDate: "Nanakshahi Samvat 558 • Sri Harmandir Sahib, Amritsar",
  ang: 611,
  raag: "Raag Sorath • Mahala 5",
  writer: "Guru Arjan Dev Ji",
  titleGurmukhi: "ਸੋਰਠਿ ਮਹਲਾ ੫ ॥ ਕਰਿ ਇਸਨਾਨੁ ਸਿਮਰਿ ਪ੍ਰਭੁ ਅਪਨਾ ਮਨ ਤਨ ਭਏ ਅਰੋਗਾ ॥",
  verses: [
    {
      verseId: 26391,
      shabadId: 2394,
      pageNo: 611,
      writer: "Guru Arjan Dev Ji",
      raag: "Raag Sorath",
      gurmukhiUnicode: "ਸੋਰਠਿ ਮਹਲਾ ੫ ॥ ਕਰਿ ਇਸਨਾਨੁ ਸਿਮਰਿ ਪ੍ਰਭੁ ਅਪਨਾ ਮਨ ਤਨ ਭਏ ਅਰੋਗਾ ॥",
      larivaarUnicode: "ਸੋਰਠਿਮਹਲਾ੫॥ਕਰਿਇਸਨਾਨੁਸਿਮਰਿਪ੍ਰਭੁਅਪਨਾਮਨਤਨਭਏਅਰੋਗਾ॥",
      transliteration: "Sorath Mahalaa 5 || Kar Isanaan Simar Prabh Apanaa Man Tan Bhae Arogaa ||",
      punjabiViakhia:
        "ਹੇ ਭਾਈ! ਅੰਮ੍ਰਿਤ ਵੇਲੇ ਇਸ਼ਨਾਨ ਕਰ ਕੇ ਆਪਣੇ ਪ੍ਰਭੂ ਦਾ ਸਿਮਰਨ ਕਰ, ਇਸ ਨਾਲ ਮਨ ਅਤੇ ਤਨ ਦੋਵੇਂ ਨਿਰੋਗ ਹੋ ਜਾਂਦੇ ਹਨ।",
      englishTranslation:
        "Sorath, Fifth Mehl: After taking your cleansing bath, remember your God in meditation, and your mind and body shall be free of disease.",
    },
    {
      verseId: 26392,
      shabadId: 2394,
      pageNo: 611,
      writer: "Guru Arjan Dev Ji",
      raag: "Raag Sorath",
      gurmukhiUnicode: "ਕੋਟਿ ਬਿਘਨ ਲਾਥੇ ਪ੍ਰਭ ਸਰਣਾ ਪ੍ਰਗਟੇ ਭਲੇ ਸੰਜੋਗਾ ॥੧॥",
      larivaarUnicode: "ਕੋਟਿਬਿਘਨਲਾਥੇਪ੍ਰਭਸਰਣਾਪ੍ਰਗਟੇਭਲੇਸੰਜੋਗਾ॥੧॥",
      transliteration: "Kot Bighan Laathe Prabh Saranaa Pragate Bhale Sanjogaa ||1||",
      punjabiViakhia:
        "ਪ੍ਰਭੂ ਦੀ ਸਰਨ ਪਿਆਂ ਕਰੋੜਾਂ ਵਿਘਨ ਦੂਰ ਹੋ ਜਾਂਦੇ ਹਨ ਅਤੇ ਪ੍ਰਭੂ-ਮਿਲਾਪ ਦੇ ਚੰਗੇ ਅਵਸਰ ਪ੍ਰਗਟ ਹੋ ਜਾਂਦੇ ਹਨ ॥੧॥",
      englishTranslation:
        "Millions of obstacles are removed in the Sanctuary of God, and good fortune dawns. ||1||",
    },
    {
      verseId: 26393,
      shabadId: 2394,
      pageNo: 611,
      writer: "Guru Arjan Dev Ji",
      raag: "Raag Sorath",
      gurmukhiUnicode:
        "ਪ੍ਰਭ ਬਾਣੀ ਸਬਦੁ ਸੁਭਾਖਿਆ ॥ ਗਾਵਹੁ ਸੁਣਹੁ ਪੜਹੁ ਨਿਤ ਭਾਈ ਗੁਰ ਪੂਰੈ ਤੂ ਰਾਖਿਆ ॥ ਰਹਾਉ ॥",
      larivaarUnicode: "ਪ੍ਰਭਬਾਣੀਸਬਦੁਸੁਭਾਖਿਆ॥ਗਾਵਹੁਸੁਣਹੁਪੜਹੁਨਿਤਭਾਈਗੁਰਪੂਰੈਤੂਰਾਖਿਆ॥ਰਹਾਉ॥",
      transliteration:
        "Prabh Baanee Sabad Subhaakhiaa || Gaavahu Sunahu Parhahu Nit Bhaaee Gur Poorai Too Raakhiaa || Rahaau ||",
      punjabiViakhia:
        "ਹੇ ਭਾਈ! ਪ੍ਰਭੂ ਦੀ ਸਿਫ਼ਤਿ-ਸਾਲਾਹ ਦੀ ਬਾਣੀ ਸਦਾ ਗਾਇਆ ਕਰੋ, ਸੁਣਿਆ ਕਰੋ ਅਤੇ ਪੜ੍ਹਿਆ ਕਰੋ; ਪੂਰੇ ਗੁਰੂ ਨੇ ਤੁਹਾਡੀ ਰੱਖਿਆ ਕੀਤੀ ਹੈ ॥ ਰਹਾਉ ॥",
      englishTranslation:
        "The Word of God's Bani, and His Shabad, are the best utterances. So constantly sing them, listen to them, and read them, O Siblings of Destiny, and the Perfect Guru shall save you. || Pause ||",
    },
  ],
};

export function DailyHukamnama({
  mode = "full",
}: {
  mode?: "preview" | "full";
}) {
  const [hukamnama, setHukamnama] = useState<HukamnamaData>(DEFAULT_FALLBACK_HUKAMNAMA);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  // Reader toggles for full view (and optional inline expand on preview)
  const [expandedInline, setExpandedInline] = useState(false);
  const [scriptMode, setScriptMode] = useState<"padchhed" | "larivaar">("padchhed");
  const [showTranslit, setShowTranslit] = useState(true);
  const [showPunjabiViakhia, setShowPunjabiViakhia] = useState(true);
  const [showEnglish, setShowEnglish] = useState(true);
  const [fontSize, setFontSize] = useState(24);

  useEffect(() => {
    let cancelled = false;
    async function loadHukamnama() {
      try {
        const res = await fetch("/api/banidb?mode=hukamnama");
        const data = await res.json();
        if (!cancelled && data?.ok && data?.hukamnama) {
          setHukamnama(data.hukamnama);
          setIsLive(data.source === "banidb-live");
        }
      } catch {
        // Keep rich fallback Hukamnama
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadHukamnama();
    return () => {
      cancelled = true;
    };
  }, []);

  const rahauOrOpeningVerse =
    hukamnama.verses.find((v) => v.gurmukhiUnicode.includes("ਰਹਾਉ")) ||
    hukamnama.verses[0];

  if (mode === "preview" && !expandedInline) {
    return (
      <section
        aria-label="Today's Hukamnama from Sri Darbar Sahib"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-2"
      >
        <div className="rounded-2xl border-2 border-[#C59B27] bg-[#1B2A20] p-6 sm:p-8 text-[#FAF6EE] shadow-2xl hover:shadow-glow transition-all duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#C59B27]/30">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                lang="pa"
                className="font-gurmukhi text-sm font-bold px-2.5 py-0.5 rounded bg-[#121C15] text-[#E5C158] border border-[#C59B27]/45"
              >
                ਅੱਜ ਦਾ ਹੁਕਮਨਾਮਾ
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#E5C158]">
                Today&apos;s Hukamnama • Sri Harmandir Sahib (Darbar Sahib), Amritsar
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-[#F3ECE0]/85">
              <span className="px-2.5 py-0.5 rounded bg-[#121C15] border border-[#C59B27]/35 font-semibold text-[#E5C158]">
                ANG {hukamnama.ang} • {hukamnama.raag.toUpperCase()}
              </span>
              <span>{hukamnama.nanakshahiDate}</span>
            </div>
          </div>

          <div className="my-5 text-center space-y-2.5 px-2">
            <p
              lang="pa"
              className="font-gurmukhi text-2xl sm:text-3xl md:text-4xl text-[#FAF6EE] leading-relaxed"
            >
              {rahauOrOpeningVerse?.gurmukhiUnicode}
            </p>
            <p className="text-xs sm:text-sm text-[#E5C158] italic">
              {rahauOrOpeningVerse?.transliteration}
            </p>
            <p className="text-sm sm:text-base font-serif text-[#F3ECE0]/95 max-w-3xl mx-auto">
              &ldquo;{rahauOrOpeningVerse?.englishTranslation}&rdquo;
            </p>
          </div>

          <div className="pt-4 border-t border-[#C59B27]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-[#F3ECE0]/75">
              <span>{hukamnama.gregorianDate}</span>
              <span className="mx-2">•</span>
              <span>{hukamnama.writer}</span>
              {loading && <span className="ml-2 text-[#E5C158]">(Syncing live Mukhwak…)</span>}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setExpandedInline(true)}
                className="px-4 py-2.5 rounded-xl border border-[#C59B27]/60 bg-[#121C15] text-xs font-semibold uppercase tracking-wider text-[#E5C158] hover:border-[#D97706] transition"
              >
                Expand Inline ({hukamnama.verses.length} Pangtis)
              </button>
              <Link
                href="/hukamnama"
                className="whitespace-nowrap inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#171917] shadow-md transition hover:brightness-105"
              >
                Read Full Hukamnama &amp; Viakhia →
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div
      className={
        mode === "preview"
          ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4 animate-fade-in-up"
          : "space-y-8 animate-fade-in-up"
      }
    >
      {/* Header Metadata & Reader Controls Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#1B2A20] border-2 border-[#C59B27] text-[#FAF6EE] shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#C59B27]/30">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span
                lang="pa"
                className="font-gurmukhi text-sm font-bold px-3 py-0.5 rounded bg-[#121C15] text-[#E5C158] border border-[#C59B27]/45"
              >
                ਸ੍ਰੀ ਦਰਬਾਰ ਸਾਹਿਬ ਅੰਮ੍ਰਿਤਸਰ • ਮੁੱਖਵਾਕ
              </span>
              <span className="text-xs uppercase tracking-[0.2em] text-[#D97706] font-semibold">
                {isLive ? "Live BaniDB Mukhwak Feed" : "Sri Harmandir Sahib Mukhwak Archive"}
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#FAF6EE]">
              Daily Hukamnama — Ang {hukamnama.ang} ({hukamnama.raag})
            </h2>
            <p className="text-xs sm:text-sm text-[#F3ECE0]/85 mt-1">
              <strong>Nanakshahi:</strong> {hukamnama.nanakshahiDate} &nbsp;|&nbsp;{" "}
              <strong>Gregorian:</strong> {hukamnama.gregorianDate} &nbsp;|&nbsp;{" "}
              <strong>Author:</strong> {hukamnama.writer}
            </p>
          </div>

          {mode === "preview" && (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setExpandedInline(false)}
                className="px-4 py-2 rounded-xl border border-[#C59B27]/60 bg-[#121C15] text-xs font-semibold text-[#E5C158] hover:border-[#D97706] transition"
              >
                Collapse Preview
              </button>
              <Link
                href="/hukamnama"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-xs font-bold text-[#171917]"
              >
                Open Dedicated Page ↗
              </Link>
            </div>
          )}
        </div>

        {/* Reader Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#121C15] border border-[#C59B27]/35">
          {/* Padchhed / Larivaar Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-[#E5C158] font-semibold mr-1">
              Script:
            </span>
            <button
              type="button"
              onClick={() => setScriptMode("padchhed")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                scriptMode === "padchhed"
                  ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#171917]"
                  : "bg-[#1B2A20] text-[#F3ECE0] border border-[#C59B27]/35"
              }`}
            >
              Padchhed (Spaced)
            </button>
            <button
              type="button"
              onClick={() => setScriptMode("larivaar")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                scriptMode === "larivaar"
                  ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#171917]"
                  : "bg-[#1B2A20] text-[#F3ECE0] border border-[#C59B27]/35"
              }`}
            >
              Larivaar (Unbroken)
            </button>
          </div>

          {/* Layer Visibility Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTranslit((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                showTranslit
                  ? "bg-[#1B2A20] text-[#E5C158] border-[#E5C158]"
                  : "bg-transparent text-[#F3ECE0]/60 border-[#C59B27]/25"
              }`}
            >
              {showTranslit ? "✓" : "○"} Transliteration
            </button>
            <button
              type="button"
              onClick={() => setShowPunjabiViakhia((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                showPunjabiViakhia
                  ? "bg-[#1B2A20] text-[#E5C158] border-[#E5C158]"
                  : "bg-transparent text-[#F3ECE0]/60 border-[#C59B27]/25"
              }`}
            >
              {showPunjabiViakhia ? "✓" : "○"} ਪੰਜਾਬੀ ਵਿਆਖਿਆ (Punjabi Viakhia)
            </button>
            <button
              type="button"
              onClick={() => setShowEnglish((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                showEnglish
                  ? "bg-[#1B2A20] text-[#E5C158] border-[#E5C158]"
                  : "bg-transparent text-[#F3ECE0]/60 border-[#C59B27]/25"
              }`}
            >
              {showEnglish ? "✓" : "○"} English Translation
            </button>
          </div>

          {/* Font Size Slider */}
          <div className="flex items-center gap-2">
            <label htmlFor="hukam-font-slider" className="text-xs text-[#E5C158] font-semibold">
              Gurmukhi Size:
            </label>
            <input
              id="hukam-font-slider"
              type="range"
              min={20}
              max={38}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-24 accent-[#D97706] cursor-pointer"
            />
          </div>
        </div>

        {/* Full Gurmukhi Continuous Recitation Block */}
        <div className="p-6 rounded-2xl bg-[#121C15] border border-[#C59B27]/45 text-center space-y-3">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#E5C158] font-semibold">
            Complete Gurmukhi Mukhwak ({scriptMode === "larivaar" ? "Larivaar" : "Padchhed"})
          </p>
          <p
            lang="pa"
            style={{ fontSize: `${fontSize}px` }}
            className={`font-gurmukhi text-[#FAF6EE] leading-relaxed ${
              scriptMode === "larivaar" ? "break-all tracking-normal" : "tracking-wide"
            }`}
          >
            {hukamnama.verses
              .map((v) =>
                scriptMode === "larivaar" ? v.larivaarUnicode : v.gurmukhiUnicode
              )
              .join(" ")}
          </p>
        </div>

        {/* Verse-by-Verse Breakdown with Punjabi Viakhia & English Translation */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[#E5C158] font-semibold px-1">
            <span>Pangti-by-Pangti Viakhia &amp; Translation ({hukamnama.verses.length} Verses)</span>
            <span>Ang {hukamnama.ang}</span>
          </div>

          {hukamnama.verses.map((v, idx) => (
            <div
              key={v.verseId || idx}
              className="p-5 rounded-xl bg-[#121C15] border border-[#C59B27]/35 space-y-2.5"
            >
              <p
                lang="pa"
                style={{ fontSize: `${fontSize}px` }}
                className={`font-gurmukhi text-[#FAF6EE] leading-relaxed ${
                  scriptMode === "larivaar" ? "break-all" : ""
                }`}
              >
                {scriptMode === "larivaar" ? v.larivaarUnicode : v.gurmukhiUnicode}
              </p>

              {showTranslit && v.transliteration && (
                <p className="text-xs sm:text-sm text-[#E5C158] italic">
                  {v.transliteration}
                </p>
              )}

              {showPunjabiViakhia && v.punjabiViakhia && (
                <div className="pt-2 border-t border-[#C59B27]/20">
                  <span className="text-[10px] uppercase tracking-wider text-[#D97706] font-bold block mb-0.5">
                    ਪੰਜਾਬੀ ਵਿਆਖਿਆ (Punjabi Viakhia / Teeka)
                  </span>
                  <p lang="pa" className="font-gurmukhi text-base text-[#F3ECE0]/95 leading-relaxed">
                    {v.punjabiViakhia}
                  </p>
                </div>
              )}

              {showEnglish && v.englishTranslation && (
                <div className="pt-2 border-t border-[#C59B27]/20">
                  <span className="text-[10px] uppercase tracking-wider text-[#E5C158]/80 font-bold block mb-0.5">
                    English Translation
                  </span>
                  <p className="text-sm sm:text-base text-[#FAF6EE] leading-relaxed">
                    {v.englishTranslation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
