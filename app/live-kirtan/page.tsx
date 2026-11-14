"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
import {
  useKirtanAudio,
  type KirtanTrack,
} from "@/components/kirtan-audio-context";

const DARBAR_SAHIB_SCHEDULE = [
  {
    timeIst: "02:15 AM IST",
    ceremony: "Kewar Khulna (Opening of the Sacred Portals)",
    gurmukhi: "ਕਿਵਾੜ ਖੁੱਲ੍ਹਣੇ",
    details: "Opening of the golden portals of Sachkhand Sri Harmandir Sahib.",
  },
  {
    timeIst: "02:30 AM – 05:30 AM IST",
    ceremony: "Amrit Vela Asa Di Vaar Kirtan",
    gurmukhi: "ਆਸਾ ਦੀ ਵਾਰ ਕੀਰਤਨ",
    details:
      "Sung by Hazoori Ragi Jathas in Raag Asa prior to the arrival of the Palki Sahib from Sri Akal Takhat Sahib.",
  },
  {
    timeIst: "05:00 AM – 05:30 AM IST",
    ceremony: "Prakash & Today's Mukhwaak (Daily Hukamnama)",
    gurmukhi: "ਪ੍ਰਕਾਸ਼ ਅਤੇ ਅੰਮ੍ਰਿਤ ਵੇਲੇ ਦਾ ਮੁੱਖਵਾਕ",
    details:
      "Ceremonial installation of Sri Guru Granth Sahib Ji and proclamation of the Daily Hukamnama.",
  },
  {
    timeIst: "06:00 AM – 03:00 PM IST",
    ceremony: "Morning & Afternoon Raag KirtanChaukiyan",
    gurmukhi: "ਬਿਲਾਵਲੁ, ਆਨੰਦ ਸਾਹਿਬ ਅਤੇ ਦੁਪਹਿਰ ਦੀਆਂ ਚੌਕੀਆਂ",
    details:
      "Continuous Kirtan in prescribed morning and afternoon Raags (Bilaaval, Todi, Sarang, Dhanasari).",
  },
  {
    timeIst: "06:00 PM – 06:30 PM IST",
    ceremony: "Sodar Sri Rehras Sahib & Evening Ardas",
    gurmukhi: "ਸੋ ਦਰੁ ਰਹਿਰਾਸਿ ਸਾਹਿਬ ਅਤੇ ਆਰਤੀ",
    details:
      "Recitation of Evening Rehras Sahib followed by Aarti Kirtan in evening Raags (Kalyan, Kedar, Kanada).",
  },
  {
    timeIst: "09:45 PM – 10:15 PM IST",
    ceremony: "Kirtan Sohila & Sukhasan Sahib",
    gurmukhi: "ਕੀਰਤਨੁ ਸੋਹਿਲਾ ਅਤੇ ਸੁਖਾਸਨ ਸਾਹਿਬ",
    details:
      "Concluding night Kirtan, Ardas, and ceremonial procession of Palki Sahib to Sri Akal Takhat Sahib.",
  },
];

export default function LiveKirtanPage() {
  const {
    liveStreams,
    instrumentalTracks,
    currentTrack,
    isPlaying,
    isLoadingAudio,
    volume,
    isReadingVolumePreset,
    playTrack,
    togglePlayPause,
    setVolume,
    startReadingInstrumental,
    toggleReadingVolumePreset,
    setIsCustomModalOpen,
  } = useKirtanAudio();

  const [selectedLive, setSelectedLive] = useState<KirtanTrack>(liveStreams[0]);
  const [showTheaterEmbed, setShowTheaterEmbed] = useState(false);
  const [amritsarTime, setAmritsarTime] = useState<string>("");

  useEffect(() => {
    const updateClock = () => {
      try {
        const formatted = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
          weekday: "short",
          month: "short",
          day: "numeric",
        }).format(new Date());
        setAmritsarTime(`${formatted} IST`);
      } catch {
        setAmritsarTime("Amritsar Standard Time (IST)");
      }
    };
    updateClock();
    const timer = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const handleSelectBroadcast = (stream: KirtanTrack) => {
    setSelectedLive(stream);
    playTrack(stream);
  };

  const isSelectedPlaying =
    isPlaying && currentTrack.id === selectedLive.id;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EE] text-[#171917]">
      <Header solid />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 pb-28">
        {/* Hero Broadcast Banner */}
        <section className="rounded-3xl border-2 border-[#C59B27] bg-[#1B2A20] p-8 md:p-10 shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-white shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                  LIVE FROM AMRITSAR • 24/7 BROADCAST
                </span>
                {amritsarTime && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#121C15] border border-[#C59B27]/40 text-[#C59B27]">
                    🕰 Amritsar: {amritsarTime}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight">
                Live 24/7 Gurdwara Kirtan &amp; Ambient Reading Sanctuary
              </h1>
              <p className="text-sm sm:text-base text-[#4A554E] leading-relaxed">
                Listen to the live 24/7 broadcast from Sachkhand Sri Harmandir Sahib (Darbar
                Sahib), Amritsar and historic Takhats—or start gentle 25%-volume Dilruba, Sitar,
                Veena, Taus, and Rabab instrumentals while you read on any page.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (currentTrack.id === selectedLive.id) {
                    togglePlayPause();
                  } else {
                    playTrack(selectedLive);
                  }
                }}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:brightness-105 transition"
              >
                {isSelectedPlaying
                  ? "⏸ Pause Live Broadcast"
                  : "▶ Listen Live in Bottom Player"}
              </button>

              <button
                type="button"
                onClick={() => setIsCustomModalOpen(true)}
                className="px-4 py-3.5 rounded-2xl border border-[#C59B27]/50 bg-[#121C15] text-xs font-bold uppercase tracking-wider text-[#C59B27] hover:border-[#C59B27] transition"
              >
                + Suggest Kirtan / Bani for Review
              </button>
            </div>
          </div>
        </section>

        {/* ================================================================
            1. MULTI-GURDWARA LIVE SELECTOR & BROADCAST CONSOLE
        ================================================================ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 Cols: Active Live Broadcast Console + Optional Theater Toggle */}
          <div className="lg:col-span-7 rounded-3xl border-2 border-[#C59B27] bg-[#1B2A20] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#C59B27]/25 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C59B27]">
                  {selectedLive.angCitation}
                </span>
                <p
                  lang="pa"
                  className="font-gurmukhi text-xl sm:text-2xl font-semibold text-[#D97706] mt-1"
                >
                  {selectedLive.gurmukhiTitle}
                </p>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold">
                  {selectedLive.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#4A554E] mt-0.5">
                  {selectedLive.ragi}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowTheaterEmbed((v) => !v)}
                className="px-4 py-2 rounded-xl border border-[#C59B27]/50 bg-[#121C15] text-xs font-bold text-[#C59B27] hover:border-[#C59B27] transition"
              >
                {showTheaterEmbed
                  ? "Hide Darbar Theater View"
                  : "📺 Open Darbar Theater / Playlist View"}
              </button>
            </div>

            {/* Live Audio Controls */}
            <div className="p-5 rounded-2xl bg-[#121C15] border border-[#C59B27]/40 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C59B27]">
                    {isLoadingAudio && currentTrack.id === selectedLive.id
                      ? "Connecting to Live Broadcast..."
                      : isSelectedPlaying
                      ? "Streaming Live Audio (Continues While Browsing)"
                      : "Ready to Stream Live"}
                  </span>
                </div>

                <a
                  href={selectedLive.audioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#C59B27] hover:underline"
                >
                  Direct Stream Link ↗
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (currentTrack.id === selectedLive.id) {
                      togglePlayPause();
                    } else {
                      playTrack(selectedLive);
                    }
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs sm:text-sm font-bold uppercase tracking-wider shadow-sm hover:brightness-105 transition"
                >
                  {isSelectedPlaying
                    ? "⏸ Pause Stream"
                    : "▶ Start Live Audio Stream"}
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleReadingVolumePreset}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold transition ${
                      isReadingVolumePreset
                        ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] border-[#C59B27]"
                        : "border-[#C59B27]/40 text-[#C59B27]"
                    }`}
                  >
                    {isReadingVolumePreset
                      ? "25% Reading Vol ✓"
                      : "Set 25% Reading Vol"}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    aria-label="Broadcast Volume"
                    className="w-28 accent-[#C59B27] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Optional Theater / Archive Embed */}
            {showTheaterEmbed && (
              <div className="space-y-2">
                <div className="w-full h-[260px] rounded-2xl overflow-hidden border border-[#C59B27]/50 bg-black">
                  <iframe
                    src={selectedLive.archiveEmbedUrl}
                    title={`${selectedLive.title} Theater Player`}
                    className="w-full h-full border-0"
                    allow="autoplay; fullscreen"
                  />
                </div>
                <p className="text-xs text-[#4A554E]">
                  Embedded player above stays on this page; use &ldquo;Start Live Audio
                  Stream&rdquo; to keep listening in the bottom bar while navigating across
                  Learn Sikhi.
                </p>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-[#121C15] border border-[#C59B27]/30 space-y-2 text-xs sm:text-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C59B27]">
                Historical &amp; Maryada Context
              </p>
              <p className="text-[#4A554E] leading-relaxed">
                {selectedLive.raagNotes}
              </p>
              <p className="text-[#4A554E] leading-relaxed pt-1 border-t border-[#C59B27]/20">
                {selectedLive.historicalContext}
              </p>
            </div>
          </div>

          {/* Right 5 Cols: Multi-Gurdwara Channel Selector */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-xl font-serif font-bold">
              Select Live Gurdwara or 24/7 Radio Channel
            </h2>
            <div className="space-y-3">
              {liveStreams.map((stream) => {
                const active = selectedLive.id === stream.id;
                const playingNow = isPlaying && currentTrack.id === stream.id;
                return (
                  <button
                    key={stream.id}
                    type="button"
                    onClick={() => handleSelectBroadcast(stream)}
                    className={`w-full text-left p-4 rounded-2xl border transition flex items-start justify-between gap-3 ${
                      active
                        ? "bg-[#1B2A20] border-2 border-[#C59B27] shadow-sm"
                        : "bg-[#F3ECE0] border-[#C59B27]/35 hover:border-[#C59B27]"
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-bold uppercase">
                          LIVE
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#C59B27] truncate">
                          {stream.locationLabel}
                        </span>
                      </div>
                      <p
                        lang="pa"
                        className="font-gurmukhi text-sm font-medium text-[#D97706] truncate"
                      >
                        {stream.gurmukhiTitle}
                      </p>
                      <h3 className="text-sm sm:text-base font-serif font-bold truncate">
                        {stream.title}
                      </h3>
                      <p className="text-xs text-[#4A554E] truncate">
                        {stream.ragi}
                      </p>
                    </div>

                    <span className="shrink-0 px-3 py-1.5 rounded-xl bg-[#121C15] border border-[#C59B27]/40 text-xs font-bold text-[#C59B27]">
                      {playingNow ? "⏸ Live" : "▶ Tune In"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================================================================
            2. AMBIENT BACKGROUND MUSIC MODE FOR READING (DILRUBA, SITAR, VEENA, TAUS & RABAB)
        ================================================================ */}
        <section
          id="reading-instrumentals"
          className="rounded-3xl border border-[#C59B27]/45 bg-[#1B2A20] p-8 md:p-10 shadow-sm space-y-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#C59B27]">
                BACKGROUND RAAG INSTRUMENTALS • CONTEMPLATIVE READING MODE
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold">
                Gentle Dilruba, Sitar, Veena, Taus &amp; Rabab for Reading
              </h2>
              <p className="text-sm sm:text-base text-[#4A554E] leading-relaxed">
                Select any classical string instrumental below to play softly at{" "}
                <strong>25% Reading Volume</strong> in the persistent bottom bar while you
                read Granths, Nitnem, or Matriarch biographies.
              </p>
            </div>

            <button
              type="button"
              onClick={() => startReadingInstrumental()}
              className="shrink-0 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider shadow-sm hover:brightness-105 transition"
            >
              🎻 Start 25% Reading Instrumental Now
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {instrumentalTracks.map((inst) => {
              const active = currentTrack.id === inst.id && isPlaying;
              return (
                <div
                  key={inst.id}
                  className={`p-5 rounded-2xl border transition flex flex-col justify-between gap-4 ${
                    active
                      ? "bg-[#121C15] border-2 border-[#C59B27]"
                      : "bg-[#121C15]/80 border-[#C59B27]/35 hover:border-[#C59B27]"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C59B27]">
                        {inst.tantiSaaj}
                      </span>
                      <span className="text-xs text-[#4A554E]">
                        {inst.durationLabel}
                      </span>
                    </div>
                    <p
                      lang="pa"
                      className="font-gurmukhi text-base font-medium text-[#D97706]"
                    >
                      {inst.gurmukhiTitle}
                    </p>
                    <h3 className="text-lg font-serif font-bold">
                      {inst.title}
                    </h3>
                    <p className="text-xs text-[#4A554E] leading-relaxed">
                      {inst.raagNotes}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#C59B27]/20">
                    <button
                      type="button"
                      onClick={() => startReadingInstrumental(inst.id)}
                      className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider"
                    >
                      {active ? "♫ Playing (25% Vol)" : "▶ Play at 25% Reading Vol"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================================================================
            3. DAILY SRI DARBAR SAHIB KIRTAN & HUKAMNAMA SCHEDULE
        ================================================================ */}
        <section className="rounded-3xl border border-[#C59B27]/40 bg-[#1B2A20] p-8 md:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-[#C59B27]">
                DAILY MARYADA TIMETABLE • SACHKHAND SRI HARMANDIR SAHIB
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold mt-1">
                Daily Darbar Sahib Kirtan &amp; Mukhwaak Schedule (IST)
              </h2>
            </div>
            <Link
              href="/hukamnama"
              className="px-4 py-2.5 rounded-xl border border-[#C59B27]/50 bg-[#121C15] text-xs font-bold text-[#C59B27] hover:border-[#C59B27]"
            >
              Read Today&apos;s Written Hukamnama →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {DARBAR_SAHIB_SCHEDULE.map((item) => (
              <div
                key={item.ceremony}
                className="p-5 rounded-2xl bg-[#121C15] border border-[#C59B27]/30 space-y-2"
              >
                <span className="text-xs font-bold text-[#C59B27]">
                  {item.timeIst}
                </span>
                <p
                  lang="pa"
                  className="font-gurmukhi text-base font-medium text-[#D97706]"
                >
                  {item.gurmukhi}
                </p>
                <h3 className="text-base font-serif font-bold">
                  {item.ceremony}
                </h3>
                <p className="text-xs text-[#4A554E] leading-relaxed">
                  {item.details}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
