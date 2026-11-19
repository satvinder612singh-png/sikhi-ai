"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from "framer-motion";
import type {
  SikhiNewsCategory,
  SikhiNewsItem,
} from "@/app/api/sikhi-news/route";

const AUTOPLAY_INTERVAL_MS = 8500;

const CATEGORIES: Array<"All" | SikhiNewsCategory> = [
  "All",
  "Global Sangat",
  "Punjab & Heritage",
  "Seva & Community",
  "Youth & Education",
  "Kirtan & Culture",
];

const HERITAGE_VISUAL_THEMES: Record<
  SikhiNewsCategory,
  {
    gradient: string;
    ring: string;
    glyph: string;
    labelPa: string;
    accentHex: string;
  }
> = {
  "Global Sangat": {
    gradient: "from-[#142342] via-[#1C315E] to-[#0C152B]",
    ring: "border-amber-300/45",
    glyph: "ੴ",
    labelPa: "ਵਿਸ਼ਵ ਸੰਗਤ",
    accentHex: "#F5C542",
  },
  "Punjab & Heritage": {
    gradient: "from-[#3B1E12] via-[#5A2D18] to-[#1F120C]",
    ring: "border-amber-400/50",
    glyph: "☬",
    labelPa: "ਪੰਜਾਬ ਅਤੇ ਵਿਰਸਾ",
    accentHex: "#FBBF24",
  },
  "Seva & Community": {
    gradient: "from-[#122D21] via-[#1C4532] to-[#0B1C14]",
    ring: "border-emerald-300/40",
    glyph: "ਸੇਵਾ",
    labelPa: "ਸੇਵਾ ਅਤੇ ਲੰਗਰ",
    accentHex: "#F5C542",
  },
  "Youth & Education": {
    gradient: "from-[#2B1F42] via-[#3E2C5E] to-[#161024]",
    ring: "border-amber-300/45",
    glyph: "ਵਿਦਿਆ",
    labelPa: "ਗੁਰਮਤਿ ਵਿਦਿਆ",
    accentHex: "#FCD34D",
  },
  "Kirtan & Culture": {
    gradient: "from-[#2D1A2B] via-[#4A2541] to-[#170D17]",
    ring: "border-amber-300/45",
    glyph: "ਰਾਗੁ",
    labelPa: "ਗੁਰਮਤਿ ਸੰਗੀਤ",
    accentHex: "#F5C542",
  },
};

function formatReadableDate(raw: string): string {
  const trimmed = (raw || "").trim();
  if (!trimmed) return "just now";
  if (/ago|just now|yesterday/i.test(trimmed)) {
    return trimmed;
  }
  const ts = Date.parse(trimmed);
  if (!Number.isFinite(ts)) return trimmed;
  const diffMin = Math.max(0, Math.floor((Date.now() - ts) / 60000));
  if (diffMin <= 2) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function HeritageFallbackArtwork({
  story,
  slideIndex,
  totalSlides,
}: {
  story: SikhiNewsItem;
  slideIndex: number;
  totalSlides: number;
}) {
  const palette =
    HERITAGE_VISUAL_THEMES[story.category] ||
    HERITAGE_VISUAL_THEMES["Global Sangat"];

  return (
    <div
      className={`relative h-full w-full min-h-[16rem] sm:min-h-[21rem] bg-gradient-to-br ${palette.gradient} p-6 sm:p-8 flex flex-col justify-between overflow-hidden select-none`}
    >
      {/* Crisp Sikh-heritage inspired Darbar arch & geometric lotus lattice */}
      <svg
        aria-hidden="true"
        viewBox="0 0 420 360"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-55"
        fill="none"
      >
        <defs>
          <radialGradient id={`news-glow-${story.id}`} cx="50%" cy="42%" r="58%">
            <stop offset="0%" stopColor={palette.accentHex} stopOpacity="0.32" />
            <stop offset="100%" stopColor={palette.accentHex} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="420" height="360" fill={`url(#news-glow-${story.id})`} />
        {/* Outer Darbar arch */}
        <path
          d="M42 350V165C42 82 118 28 210 28C302 28 378 82 378 165V350"
          stroke={palette.accentHex}
          strokeOpacity="0.48"
          strokeWidth="1.6"
        />
        <path
          d="M74 350V174C74 108 135 60 210 60C285 60 346 108 346 174V350"
          stroke={palette.accentHex}
          strokeOpacity="0.32"
          strokeWidth="1.2"
          strokeDasharray="4 6"
        />
        {/* Crisp geometric globe / compass meridian lines */}
        <circle
          cx="210"
          cy="176"
          r="94"
          stroke={palette.accentHex}
          strokeOpacity="0.38"
          strokeWidth="1.3"
        />
        <ellipse
          cx="210"
          cy="176"
          rx="48"
          ry="94"
          stroke={palette.accentHex}
          strokeOpacity="0.30"
          strokeWidth="1.1"
        />
        <ellipse
          cx="210"
          cy="176"
          rx="94"
          ry="34"
          stroke={palette.accentHex}
          strokeOpacity="0.28"
          strokeWidth="1.1"
        />
        {/* Phulkari diamond corner accents */}
        <path
          d="M210 14L224 28L210 42L196 28Z"
          stroke={palette.accentHex}
          strokeOpacity="0.72"
          strokeWidth="1.4"
          fill={palette.accentHex}
          fillOpacity="0.16"
        />
      </svg>

      {/* Top Briefing Stamp */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/45 bg-black/35 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-200 backdrop-blur-md">
          <span>✦</span>
          <span>{story.category}</span>
        </span>
        <span className="rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-[11px] font-mono font-bold text-amber-100 backdrop-blur-md">
          {String(slideIndex + 1).padStart(2, "0")} /{" "}
          {String(totalSlides).padStart(2, "0")}
        </span>
      </div>

      {/* Center Calligraphic Emblem */}
      <div className="relative z-10 my-auto py-5 text-center space-y-2">
        <span
          lang="pa"
          className="font-gurmukhi block text-5xl sm:text-6xl font-bold text-amber-200 drop-shadow-[0_4px_18px_rgba(245,197,66,0.35)]"
        >
          {palette.glyph}
        </span>
        <p
          lang="pa"
          className="font-gurmukhi text-sm sm:text-base font-semibold text-amber-100/95 tracking-wide"
        >
          {palette.labelPa}
        </p>
      </div>

      {/* Bottom Source Pill */}
      <div className="relative z-10 flex items-center justify-between gap-2 pt-3 border-t border-white/15">
        <span className="text-xs font-semibold text-amber-50 truncate">
          {story.sourceName}
        </span>
        <span className="text-[11px] font-medium text-zinc-200 shrink-0">
          {formatReadableDate(story.publishedAt)}
        </span>
      </div>
    </div>
  );
}

function SlideVisualPanel({
  story,
  slideIndex,
  totalSlides,
}: {
  story: SikhiNewsItem;
  slideIndex: number;
  totalSlides: number;
}) {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [story.id, story.imageUrl]);

  if (!story.imageUrl || imgFailed) {
    return (
      <HeritageFallbackArtwork
        story={story}
        slideIndex={slideIndex}
        totalSlides={totalSlides}
      />
    );
  }

  return (
    <div className="relative h-full w-full min-h-[16rem] sm:min-h-[21rem] bg-zinc-950 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={story.imageUrl}
        alt={story.title}
        loading="eager"
        onError={() => setImgFailed(true)}
        className="h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/30" />
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/50 bg-black/60 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-200 backdrop-blur-md">
          <span>✦</span>
          <span>{story.category}</span>
        </span>
        <span className="rounded-full border border-white/25 bg-black/60 px-2.5 py-1 text-[11px] font-mono font-bold text-white backdrop-blur-md">
          {String(slideIndex + 1).padStart(2, "0")} /{" "}
          {String(totalSlides).padStart(2, "0")}
        </span>
      </div>
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2 text-xs">
        <span className="font-bold text-white truncate">{story.sourceName}</span>
        <span className="text-zinc-200 shrink-0">
          {formatReadableDate(story.publishedAt)}
        </span>
      </div>
    </div>
  );
}

export interface SikhNewsBriefingDeckProps {
  items: SikhiNewsItem[];
  loading?: boolean;
  updatedAt?: string | null;
  surface?: "dark" | "theme";
  keyboardActive?: boolean;
  isAdmin?: boolean;
  pinnedSet?: Set<string>;
  archivedSet?: Set<string>;
  onRefresh?: () => void;
  onTogglePin?: (newsId: string) => void;
  onToggleHide?: (newsId: string) => void;
  onDeleteCustom?: (newsId: string) => void;
  headerActions?: React.ReactNode;
}

export function SikhNewsBriefingDeck({
  items,
  loading = false,
  updatedAt = null,
  surface = "theme",
  keyboardActive = true,
  isAdmin = false,
  pinnedSet,
  archivedSet,
  onRefresh,
  onTogglePin,
  onToggleHide,
  onDeleteCustom,
  headerActions,
}: SikhNewsBriefingDeckProps) {
  const prefersReducedMotion = useReducedMotion();
  const [selectedCategory, setSelectedCategory] = useState<
    "All" | SikhiNewsCategory
  >("All");
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [autoPlay, setAutoPlay] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const sliderTopRef = useRef<HTMLDivElement | null>(null);

  const isDark = surface === "dark";

  const filteredItems = useMemo(() => {
    if (selectedCategory === "All") return items;
    return items.filter((item) => item.category === selectedCategory);
  }, [items, selectedCategory]);

  useEffect(() => {
    setActiveIndex(0);
  }, [selectedCategory, items.length]);

  const safeIndex =
    filteredItems.length > 0
      ? Math.min(activeIndex, filteredItems.length - 1)
      : 0;
  const activeStory = filteredItems[safeIndex] || null;

  const goToSlide = useCallback(
    (nextIdx: number) => {
      if (filteredItems.length === 0) return;
      const wrapped =
        ((nextIdx % filteredItems.length) + filteredItems.length) %
        filteredItems.length;
      setDirection(nextIdx >= safeIndex ? 1 : -1);
      setActiveIndex(wrapped);
    },
    [filteredItems.length, safeIndex]
  );

  const handleNext = useCallback(() => {
    goToSlide(safeIndex + 1);
  }, [goToSlide, safeIndex]);

  const handlePrev = useCallback(() => {
    goToSlide(safeIndex - 1);
  }, [goToSlide, safeIndex]);

  // Keyboard Left / Right arrow support
  useEffect(() => {
    if (!keyboardActive || filteredItems.length <= 1) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [keyboardActive, filteredItems.length, handleNext, handlePrev]);

  // Auto-play timer (pauses on hover/focus or reduced motion)
  const shouldAutoPlay =
    autoPlay && !isPaused && !prefersReducedMotion && filteredItems.length > 1;

  useEffect(() => {
    if (!shouldAutoPlay) return;
    const timer = window.setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) =>
        filteredItems.length > 0 ? (prev + 1) % filteredItems.length : 0
      );
    }, AUTOPLAY_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [shouldAutoPlay, filteredItems.length, safeIndex]);

  const jumpToStoryFromGrid = (idx: number) => {
    goToSlide(idx);
    sliderTopRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  if (loading && items.length === 0) {
    return (
      <div
        aria-busy="true"
        aria-label="Loading Sikh News Briefing"
        className="space-y-6"
      >
        <div
          className={`rounded-[var(--radius-card)] border p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse ${
            isDark
              ? "border-amber-400/25 bg-white/[0.04]"
              : "border-amber-700/20 bg-white"
          }`}
        >
          <div className="lg:col-span-5 h-64 rounded-2xl bg-current opacity-10" />
          <div className="lg:col-span-7 space-y-4">
            <div className="h-5 w-40 rounded-full bg-current opacity-15" />
            <div className="h-8 w-11/12 rounded-xl bg-current opacity-15" />
            <div className="h-16 w-full rounded-xl bg-current opacity-10" />
            <div className="space-y-2">
              <div className="h-4 w-5/6 rounded bg-current opacity-10" />
              <div className="h-4 w-4/5 rounded bg-current opacity-10" />
              <div className="h-4 w-3/4 rounded bg-current opacity-10" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <div ref={sliderTopRef} className="space-y-7">
        {/* Top Briefing Status & Category Filter Bar */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-bold ${
                  isDark
                    ? "border-emerald-400/45 bg-emerald-500/15 text-emerald-200"
                    : "border-emerald-700/30 bg-emerald-50 text-emerald-900"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  Live • Updated{" "}
                  {updatedAt ? formatReadableDate(updatedAt) : "just now"}
                </span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {filteredItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => setAutoPlay((v) => !v)}
                  aria-pressed={autoPlay}
                  className={`sanctuary-interactive rounded-full border px-3 py-1.5 text-xs font-bold backdrop-blur-md transition ${
                    isDark
                      ? "border-white/20 bg-white/5 text-amber-100 hover:border-amber-400"
                      : "border-stone-300 bg-white/90 text-stone-800 hover:border-amber-600"
                  }`}
                >
                  {autoPlay ? "⏸ Auto-Play On" : "▶ Auto-Play Paused"}
                </button>
              )}
              {onRefresh && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={onRefresh}
                  className={`sanctuary-interactive rounded-full border px-3.5 py-1.5 text-xs font-extrabold transition disabled:opacity-50 ${
                    isDark
                      ? "border-amber-300/50 bg-amber-400/15 text-amber-200 hover:bg-amber-400/25"
                      : "border-amber-700/40 bg-amber-100 text-amber-950 hover:bg-amber-200"
                  }`}
                >
                  {loading ? "Refreshing Live News…" : "↻ Refresh News"}
                </button>
              )}
              {headerActions}
            </div>
          </div>

          {/* Shared-Element Category Filter Pills */}
          <div
            role="tablist"
            aria-label="Filter Sikh news by topic"
            className="flex flex-wrap items-center gap-2"
          >
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(cat)}
                  className={`relative rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                    active
                      ? "text-stone-950"
                      : isDark
                        ? "border border-white/15 bg-white/[0.04] text-zinc-200 hover:text-white hover:border-amber-400/50"
                        : "border border-stone-300 bg-white text-stone-700 hover:text-stone-950 hover:border-amber-600"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId={`news-cat-pill-${surface}`}
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 32,
                      }}
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 shadow-sm"
                    />
                  )}
                  <span className="relative z-10">{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================================================================
            FEATURED INTERACTIVE NEWS SLIDE DECK
        ================================================================ */}
        {activeStory ? (
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={() => setIsPaused(false)}
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(e) => {
              const startX = touchStartX.current;
              touchStartX.current = null;
              const endX = e.changedTouches[0]?.clientX ?? null;
              if (startX !== null && endX !== null) {
                const delta = endX - startX;
                if (delta < -50) handleNext();
                else if (delta > 50) handlePrev();
              }
            }}
            className={`relative rounded-[var(--radius-card)] border overflow-hidden shadow-2xl transition-colors ${
              isDark
                ? "border-amber-400/40 bg-gradient-to-br from-[#121928] via-[#0e1522] to-[#0a101b]"
                : "border-amber-700/25 bg-white shadow-[0_24px_56px_-22px_rgba(24,24,27,0.22)]"
            }`}
          >
            {/* Subtle ambient golden radial accent behind slide */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl"
            />

            {/* Auto-Play Progress Bar (GPU scaleX only) */}
            <div
              className={`h-1 w-full overflow-hidden ${
                isDark ? "bg-white/10" : "bg-stone-200"
              }`}
            >
              {shouldAutoPlay ? (
                <motion.div
                  key={`progress-${activeStory.id}-${safeIndex}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    duration: AUTOPLAY_INTERVAL_MS / 1000,
                    ease: "linear",
                  }}
                  style={{ transformOrigin: "left center" }}
                  className="h-full w-full bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500"
                />
              ) : (
                <div
                  style={{
                    transform: `scaleX(${(safeIndex + 1) / Math.max(1, filteredItems.length)})`,
                    transformOrigin: "left center",
                  }}
                  className="h-full w-full bg-gradient-to-r from-amber-500 to-amber-400 transition-transform duration-300"
                />
              )}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.article
                key={`${activeStory.id}-${safeIndex}`}
                initial={{
                  opacity: 0,
                  x: direction >= 0 ? 34 : -34,
                  scale: 0.99,
                }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  x: direction >= 0 ? -30 : 30,
                  scale: 0.99,
                }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                style={{ willChange: "transform, opacity" }}
                className="grid grid-cols-1 lg:grid-cols-12 items-stretch"
              >
                {/* Left Column: High-Craft Visual / Heritage Fallback */}
                <div className="lg:col-span-5 relative">
                  <SlideVisualPanel
                    story={activeStory}
                    slideIndex={safeIndex}
                    totalSlides={filteredItems.length}
                  />
                </div>

                {/* Right Column: Structured Editorial Briefing */}
                <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-5 relative z-10">
                  <div className="space-y-4">
                    {/* Metadata Pill Row */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 font-extrabold uppercase tracking-[0.14em] ${
                          isDark
                            ? "border-amber-400/45 bg-amber-400/20 text-amber-200"
                            : "border-amber-400 bg-amber-100 text-amber-950"
                        }`}
                      >
                        {Boolean(
                          activeStory.isCustom ||
                            pinnedSet?.has(`news:${activeStory.id}`)
                        )
                          ? "📌 Featured • "
                          : ""}
                        {activeStory.category}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 font-semibold ${
                          isDark
                            ? "bg-white/10 text-zinc-200"
                            : "bg-stone-100 text-stone-700"
                        }`}
                      >
                        {activeStory.sourceName}
                      </span>
                      <span
                        className={`font-semibold ${
                          isDark ? "text-zinc-300" : "text-stone-600"
                        }`}
                      >
                        • {formatReadableDate(activeStory.publishedAt)}
                      </span>
                    </div>

                    {/* Headline */}
                    <h3
                      className={`font-serif text-2xl sm:text-3xl font-bold leading-tight tracking-tight ${
                        isDark ? "text-amber-50" : "text-stone-900"
                      }`}
                    >
                      {activeStory.title}
                    </h3>

                    {/* Concise 2-Sentence Overview */}
                    <p
                      className={`text-sm sm:text-base leading-relaxed ${
                        isDark ? "text-zinc-200" : "text-stone-700"
                      }`}
                    >
                      {activeStory.summary}
                    </p>

                    {/* Scannable Key Points List */}
                    {activeStory.keyPoints.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <p
                          className={`text-[11px] font-extrabold uppercase tracking-[0.18em] ${
                            isDark ? "text-amber-200/90" : "text-amber-900"
                          }`}
                        >
                          Key Takeaways
                        </p>
                        <ul className="space-y-2">
                          {activeStory.keyPoints.slice(0, 4).map((pt, i) => (
                            <li
                              key={i}
                              className={`flex items-start gap-2.5 text-sm leading-relaxed ${
                                isDark ? "text-zinc-100" : "text-stone-800"
                              }`}
                            >
                              <span
                                aria-hidden="true"
                                className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                                  isDark ? "bg-amber-400" : "bg-amber-600"
                                }`}
                              />
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Highlighted "Why It Matters" Callout Box */}
                    <div
                      className={`rounded-2xl border-l-4 px-4 py-3.5 space-y-1 ${
                        isDark
                          ? "border-l-amber-400 bg-amber-400/12 border border-amber-400/25"
                          : "border-l-amber-600 bg-amber-50 border border-amber-200"
                      }`}
                    >
                      <p
                        className={`text-[11px] font-extrabold uppercase tracking-[0.16em] ${
                          isDark ? "text-amber-200" : "text-amber-950"
                        }`}
                      >
                        ✦ Why It Matters
                      </p>
                      <p
                        className={`text-sm font-medium leading-relaxed ${
                          isDark ? "text-amber-50" : "text-stone-900"
                        }`}
                      >
                        {activeStory.highlightQuote || activeStory.whyItMatters}
                      </p>
                    </div>
                  </div>

                  {/* Primary Action Row: Read Full Article + Admin Controls */}
                  <div
                    className={`flex flex-wrap items-center justify-between gap-3 pt-4 border-t ${
                      isDark ? "border-white/12" : "border-stone-200"
                    }`}
                  >
                    <a
                      href={activeStory.sourceUrl || activeStory.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sanctuary-interactive inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 px-5 py-2.5 text-sm font-extrabold text-stone-950 shadow-md hover:brightness-105"
                    >
                      <span>Read Full Article</span>
                      <span aria-hidden="true">→</span>
                    </a>

                    {isAdmin && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        {onTogglePin && (
                          <button
                            type="button"
                            onClick={() => onTogglePin(activeStory.id)}
                            className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${
                              pinnedSet?.has(`news:${activeStory.id}`)
                                ? "bg-amber-400 text-stone-950 border-amber-300"
                                : isDark
                                  ? "border-white/25 text-amber-200 hover:border-amber-400"
                                  : "border-stone-300 text-stone-800 hover:border-amber-600"
                            }`}
                          >
                            {pinnedSet?.has(`news:${activeStory.id}`)
                              ? "📌 Pinned"
                              : "📌 Pin"}
                          </button>
                        )}
                        {onToggleHide && (
                          <button
                            type="button"
                            onClick={() => onToggleHide(activeStory.id)}
                            className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${
                              archivedSet?.has(`news:${activeStory.id}`)
                                ? "bg-emerald-500 text-stone-950 border-emerald-400"
                                : isDark
                                  ? "border-white/25 text-zinc-200 hover:border-red-400"
                                  : "border-stone-300 text-stone-800 hover:border-red-600"
                            }`}
                          >
                            {archivedSet?.has(`news:${activeStory.id}`)
                              ? "Unhide"
                              : "👁 Hide"}
                          </button>
                        )}
                        {activeStory.isCustom && onDeleteCustom && (
                          <button
                            type="button"
                            onClick={() => onDeleteCustom(activeStory.id)}
                            className="rounded-lg border border-red-400/50 px-2.5 py-1.5 text-xs font-bold text-red-500 hover:bg-red-500/10"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>

            {/* Bottom Slider Control Bar (Prev / Indicator Pills / Next) */}
            {filteredItems.length > 1 && (
              <div
                className={`px-5 py-3.5 border-t backdrop-blur-md flex flex-wrap items-center justify-between gap-3 ${
                  isDark
                    ? "border-white/12 bg-black/35"
                    : "border-stone-200 bg-stone-50/90"
                }`}
              >
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous news slide"
                  className={`sanctuary-interactive inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-extrabold backdrop-blur-md transition ${
                    isDark
                      ? "border-white/20 bg-white/5 text-amber-100 hover:border-amber-400"
                      : "border-stone-300 bg-white text-stone-900 hover:border-amber-600"
                  }`}
                >
                  <span aria-hidden="true">←</span>
                  <span>Previous</span>
                </button>

                {/* Clickable Slide Indicator Pills */}
                <div
                  className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1"
                  role="tablist"
                  aria-label="Choose briefing slide"
                >
                  {filteredItems.map((story, idx) => {
                    const active = idx === safeIndex;
                    return (
                      <button
                        key={story.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        aria-label={`Slide ${idx + 1}: ${story.title}`}
                        onClick={() => goToSlide(idx)}
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          active
                            ? "w-8 bg-gradient-to-r from-amber-500 to-orange-500"
                            : isDark
                              ? "w-2.5 bg-white/30 hover:bg-amber-300/70"
                              : "w-2.5 bg-stone-300 hover:bg-amber-500"
                        }`}
                      />
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next news slide"
                  className={`sanctuary-interactive inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-extrabold backdrop-blur-md transition ${
                    isDark
                      ? "border-white/20 bg-white/5 text-amber-100 hover:border-amber-400"
                      : "border-stone-300 bg-white text-stone-900 hover:border-amber-600"
                  }`}
                >
                  <span>Next</span>
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`rounded-2xl border p-8 text-center text-sm font-medium ${
              isDark
                ? "border-white/15 bg-white/5 text-zinc-200"
                : "border-stone-300 bg-white text-stone-700"
            }`}
          >
            No stories found in &ldquo;{selectedCategory}&rdquo; yet. Select
            &ldquo;All&rdquo; to explore the complete briefing.
          </div>
        )}

        {/* ================================================================
            FILTERABLE ALL-STORIES DIRECTORY GRID BELOW SLIDE DECK
        ================================================================ */}
        {filteredItems.length > 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h4
                className={`font-serif text-xl font-bold ${
                  isDark ? "text-amber-50" : "text-stone-900"
                }`}
              >
                All Briefing Stories ({filteredItems.length})
              </h4>
              <p
                className={`text-xs font-medium ${
                  isDark ? "text-zinc-300" : "text-stone-600"
                }`}
              >
                Click any card to jump to its slide
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
              {filteredItems.map((story, idx) => {
                const isCurrent = idx === safeIndex;
                const isHidden = archivedSet?.has(`news:${story.id}`);
                return (
                  <motion.article
                    key={story.id}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{
                      duration: 0.28,
                      delay: Math.min(idx * 0.04, 0.2),
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={`sanctuary-interactive h-full rounded-2xl border p-5 flex flex-col justify-between gap-4 transition ${
                      isHidden ? "opacity-60" : ""
                    } ${
                      isCurrent
                        ? isDark
                          ? "border-2 border-amber-400 bg-amber-400/10 shadow-[0_0_24px_rgba(245,197,66,0.16)]"
                          : "border-2 border-amber-600 bg-amber-50/70 shadow-md"
                        : isDark
                          ? "border-white/15 bg-white/[0.04] hover:border-amber-400/60 hover:bg-white/[0.07]"
                          : "border-stone-200 bg-white hover:border-amber-500 shadow-sm"
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 font-extrabold uppercase tracking-wider ${
                            isDark
                              ? "border-amber-400/35 bg-amber-400/15 text-amber-200"
                              : "border-amber-300 bg-amber-100 text-amber-950"
                          }`}
                        >
                          {story.category}
                        </span>
                        <span
                          className={`font-semibold ${
                            isDark ? "text-zinc-300" : "text-stone-600"
                          }`}
                        >
                          {formatReadableDate(story.publishedAt)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => jumpToStoryFromGrid(idx)}
                        className="text-left group"
                      >
                        <h5
                          className={`font-serif text-base sm:text-lg font-bold leading-snug group-hover:underline ${
                            isDark ? "text-white" : "text-stone-900"
                          }`}
                        >
                          {story.title}
                        </h5>
                      </button>

                      <p
                        className={`text-xs sm:text-sm leading-relaxed line-clamp-3 ${
                          isDark ? "text-zinc-300" : "text-stone-700"
                        }`}
                      >
                        {story.summary}
                      </p>
                    </div>

                    <div
                      className={`pt-3 border-t flex items-center justify-between gap-2 text-xs ${
                        isDark ? "border-white/10" : "border-stone-200"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => jumpToStoryFromGrid(idx)}
                        className={`font-bold hover:underline ${
                          isDark ? "text-amber-200" : "text-amber-900"
                        }`}
                      >
                        {isCurrent ? "● Viewing Slide" : `Open Slide #${idx + 1}`}
                      </button>

                      <a
                        href={story.sourceUrl || story.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`font-extrabold hover:underline ${
                          isDark ? "text-white" : "text-stone-900"
                        }`}
                      >
                        Read Full Article →
                      </a>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </MotionConfig>
  );
}
