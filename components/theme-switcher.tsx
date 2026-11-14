"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export type SikhiThemeId = "emerald" | "parchment" | "navy" | "dusk";

export type SikhiThemeOption = {
  id: SikhiThemeId;
  name: string;
  shortLabel: string;
  gurmukhi: string;
  subtitle: string;
  bgPreview: string;
  surfacePreview: string;
  accentPreview: string;
};

export const SIKHI_THEMES: SikhiThemeOption[] = [
  {
    id: "emerald",
    name: "Royal Emerald & Gold",
    shortLabel: "Emerald",
    gurmukhi: "ਸ਼ਾਹੀ ਪੰਨਾ",
    subtitle: "Deep forest green (#0a1f17) with antique gold (#d4af37)",
    bgPreview: "#0a1f17",
    surfacePreview: "#153226",
    accentPreview: "#d4af37",
  },
  {
    id: "parchment",
    name: "Puratan Parchment",
    shortLabel: "Parchment",
    gurmukhi: "ਪੁਰਾਤਨ ਪੱਤਰਾ",
    subtitle: "Warm sunlit manuscript (#f7f2e7) with charcoal ink (#1c2421)",
    bgPreview: "#f7f2e7",
    surfacePreview: "#efe6d5",
    accentPreview: "#9a7b2c",
  },
  {
    id: "navy",
    name: "Khalsa Navy & Basanti",
    shortLabel: "Nihang Blue",
    gurmukhi: "ਖ਼ਾਲਸਾ ਨੀਲਾ",
    subtitle: "Midnight Nihang indigo (#0b162c) with Basanti gold (#f4b41a)",
    bgPreview: "#0b162c",
    surfacePreview: "#16284c",
    accentPreview: "#f4b41a",
  },
  {
    id: "dusk",
    name: "Amrit Vela Dusk",
    shortLabel: "Amrit Vela",
    gurmukhi: "ਅੰਮ੍ਰਿਤ ਵੇਲਾ",
    subtitle: "Serene twilight plum (#161224) with rose-gold (#e2b887)",
    bgPreview: "#161224",
    surfacePreview: "#28213f",
    accentPreview: "#e2b887",
  },
];

const THEME_STORAGE_KEY = "learn_sikhi_theme_v1";

type WaveTransitionState = {
  key: number;
  theme: SikhiThemeOption;
  x: number;
  y: number;
};

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<SikhiThemeId>("emerald");
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [wave, setWave] = useState<WaveTransitionState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerBtnRef = useRef<HTMLButtonElement>(null);
  const waveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY) as SikhiThemeId | null;
      const initial: SikhiThemeId =
        saved && ["emerald", "parchment", "navy", "dusk"].includes(saved)
          ? saved
          : "emerald";
      setTheme(initial);
      document.documentElement.setAttribute("data-theme", initial);
    } catch {
      document.documentElement.setAttribute("data-theme", "emerald");
    }

    return () => {
      if (waveTimeoutRef.current) {
        window.clearTimeout(waveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const selectTheme = (
    nextTheme: SikhiThemeId,
    e?: React.MouseEvent<HTMLButtonElement>
  ) => {
    const nextObj =
      SIKHI_THEMES.find((t) => t.id === nextTheme) || SIKHI_THEMES[0];

    // Compute origin coordinates for the radial color-wash wave
    let originX = typeof window !== "undefined" ? window.innerWidth - 120 : 800;
    let originY = 36;
    if (e && e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      originX = Math.round(rect.left + rect.width / 2);
      originY = Math.round(rect.top + rect.height / 2);
    } else if (triggerBtnRef.current) {
      const rect = triggerBtnRef.current.getBoundingClientRect();
      originX = Math.round(rect.left + rect.width / 2);
      originY = Math.round(rect.top + rect.height / 2);
    }

    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--wave-x", `${originX}px`);
      document.documentElement.style.setProperty("--wave-y", `${originY}px`);
    }

    // Trigger the full-viewport radial ripple & diagonal shimmer overlay (650ms)
    if (waveTimeoutRef.current) {
      window.clearTimeout(waveTimeoutRef.current);
    }
    setWave({
      key: Date.now(),
      theme: nextObj,
      x: originX,
      y: originY,
    });
    waveTimeoutRef.current = window.setTimeout(() => {
      setWave(null);
    }, 680);

    const applyDomTheme = () => {
      setTheme(nextTheme);
      document.documentElement.setAttribute("data-theme", nextTheme);
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      } catch {
        // Ignore storage errors
      }
    };

    // Coordinate with View Transition API if available for ultra-smooth clip-path morph
    const docWithTransition = document as Document & {
      startViewTransition?: (cb: () => void) => void;
    };
    if (typeof docWithTransition.startViewTransition === "function") {
      try {
        docWithTransition.startViewTransition(() => {
          applyDomTheme();
        });
      } catch {
        applyDomTheme();
      }
    } else {
      applyDomTheme();
    }

    setOpen(false);
  };

  const currentObj = SIKHI_THEMES.find((t) => t.id === theme) || SIKHI_THEMES[0];

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        ref={triggerBtnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Switch webpage color theme"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "var(--bg-surface)",
          color: "var(--text-on-surface, #FAF6EE)",
        }}
        className="whitespace-nowrap inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B27]"
      >
        <span
          className="h-3.5 w-3.5 rounded-full border border-white/50 shadow-sm shrink-0 transition-transform duration-300"
          style={{
            background: `linear-gradient(135deg, ${currentObj.bgPreview} 50%, ${currentObj.accentPreview} 50%)`,
          }}
        />
        <span className="hidden sm:inline">{currentObj.shortLabel}</span>
        <span
          className="text-[10px]"
          style={{ color: "var(--accent-primary)" }}
        >
          ▾
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Color Themes"
          style={{
            backgroundColor: "var(--theme-card-darker, #121C15)",
            borderColor: "var(--accent-primary, #C59B27)",
          }}
          className="animate-fade-in-up absolute right-0 mt-2 w-72 origin-top-right rounded-2xl border p-2.5 text-[#FAF6EE] shadow-2xl z-50 backdrop-blur-md"
        >
          <div className="px-2.5 py-1.5 border-b border-[#C59B27]/25 mb-1.5 flex items-center justify-between">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: "var(--theme-accent-bright, #E5C158)" }}
            >
              Select Palette Theme
            </span>
            <span
              lang="pa"
              className="font-gurmukhi text-xs"
              style={{ color: "var(--accent-primary, #D97706)" }}
            >
              ਰੰਗ ਸ਼ੈਲੀ
            </span>
          </div>

          <div className="space-y-1">
            {SIKHI_THEMES.map((item) => {
              const active = item.id === theme;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  onClick={(e) => selectTheme(item.id, e)}
                  className={`w-full rounded-xl p-2.5 text-left transition flex items-start gap-3 ${
                    active
                      ? "bg-[#1B2A20] border border-[#E5C158] shadow-sm"
                      : "hover:bg-[#1B2A20]/60 border border-transparent"
                  }`}
                >
                  <span
                    className="mt-0.5 h-6 w-6 rounded-full border border-white/40 shrink-0 shadow-inner"
                    style={{
                      background: `linear-gradient(135deg, ${item.bgPreview} 55%, ${item.accentPreview} 45%)`,
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-serif font-bold text-[#FAF6EE]">
                        {item.name}
                      </span>
                      {active && (
                        <span
                          className="text-[10px] font-bold"
                          style={{ color: "var(--theme-accent-bright, #E5C158)" }}
                        >
                          Active ✓
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#F3ECE0]/75 leading-snug mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Full-Viewport Radial Color Wash & Diagonal Wave Overlay */}
      {mounted &&
        wave &&
        createPortal(
          <div
            key={wave.key}
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
          >
            {/* Expanding radial wave ring from click origin */}
            <div
              className="theme-wave-overlay absolute inset-0"
              style={
                {
                  "--wave-origin-x": `${wave.x}px`,
                  "--wave-origin-y": `${wave.y}px`,
                  "--wave-bg": wave.theme.bgPreview,
                  "--wave-surface": wave.theme.surfacePreview,
                  "--wave-accent": wave.theme.accentPreview,
                } as React.CSSProperties
              }
            />
            {/* Diagonal metallic accent sweep across viewport */}
            <div
              className="theme-wave-shimmer absolute inset-0"
              style={
                {
                  "--wave-accent": wave.theme.accentPreview,
                  "--wave-bg": wave.theme.bgPreview,
                } as React.CSSProperties
              }
            />
          </div>,
          document.body
        )}
    </div>
  );
}
