"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export type SikhiThemeId =
  | "ivory"
  | "marble"
  | "indigo"
  | "terracotta"
  | "obsidian";

export type SikhiThemeOption = {
  id: SikhiThemeId;
  name: string;
  shortLabel: string;
  gurmukhi: string;
  subtitle: string;
  bgPreview: string;
  surfacePreview: string;
  accentPreview: string;
  isDark: boolean;
};

export const SIKHI_THEMES: SikhiThemeOption[] = [
  {
    id: "ivory",
    name: "Sunlit Ivory & Darbar Gold",
    shortLabel: "Sunlit Ivory",
    gurmukhi: "ਸੁਨਹਿਰੀ ਪ੍ਰਕਾਸ਼",
    subtitle: "Warm alabaster (#FAF7F0), crisp white cards & Darbar gold (#C59B27)",
    bgPreview: "#FAF7F0",
    surfacePreview: "#FFFFFF",
    accentPreview: "#C59B27",
    isDark: false,
  },
  {
    id: "marble",
    name: "Harmandir Marble & Sky",
    shortLabel: "Harmandir Marble",
    gurmukhi: "ਹਰਿਮੰਦਰ ਸੰਗਮਰਮਰ",
    subtitle: "Pure marble white (#F8FAFC), deep navy ink (#0F172A) & amber (#D97706)",
    bgPreview: "#F8FAFC",
    surfacePreview: "#FFFFFF",
    accentPreview: "#D97706",
    isDark: false,
  },
  {
    id: "indigo",
    name: "Khalsa Royal Indigo & Basanti",
    shortLabel: "Khalsa Indigo",
    gurmukhi: "ਖ਼ਾਲਸਾ ਨੀਲਾ ਤੇ ਬਸੰਤੀ",
    subtitle: "Midnight sapphire (#0B132B), slate-blue cards (#1C2541) & Basanti (#F59E0B)",
    bgPreview: "#0B132B",
    surfacePreview: "#1C2541",
    accentPreview: "#F59E0B",
    isDark: true,
  },
  {
    id: "terracotta",
    name: "Anandpur Terracotta & Sand",
    shortLabel: "Anandpur Earth",
    gurmukhi: "ਅਨੰਦਪੁਰ ਮਿੱਟੀ",
    subtitle: "Soft sandstone (#F5EBE6), espresso text (#2D1E17) & terracotta (#B84A39)",
    bgPreview: "#F5EBE6",
    surfacePreview: "#FFFDFB",
    accentPreview: "#B84A39",
    isDark: false,
  },
  {
    id: "obsidian",
    name: "Amrit Vela Obsidian & Rose Gold",
    shortLabel: "Amrit Vela OLED",
    gurmukhi: "ਅੰਮ੍ਰਿਤ ਵੇਲਾ",
    subtitle: "True soft black (#121316), charcoal glass (#1E2025) & champagne (#E5C158)",
    bgPreview: "#121316",
    surfacePreview: "#1E2025",
    accentPreview: "#E5C158",
    isDark: true,
  },
];

const THEME_STORAGE_KEY = "learn_sikhi_theme_v2";
const VALID_THEME_IDS: SikhiThemeId[] = [
  "ivory",
  "marble",
  "indigo",
  "terracotta",
  "obsidian",
];

type WaveTransitionState = {
  key: number;
  theme: SikhiThemeOption;
  x: number;
  y: number;
};

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<SikhiThemeId>("ivory");
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
        saved && VALID_THEME_IDS.includes(saved) ? saved : "ivory";
      setTheme(initial);
      document.documentElement.setAttribute("data-theme", initial);
    } catch {
      document.documentElement.setAttribute("data-theme", "ivory");
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

    let originX = typeof window !== "undefined" ? window.innerWidth - 140 : 800;
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
          color: "var(--text-primary)",
        }}
        className="whitespace-nowrap inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B27]"
      >
        <span
          className="h-3.5 w-3.5 rounded-full border border-black/20 shadow-sm shrink-0 transition-transform duration-300"
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
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
            color: "var(--text-primary)",
          }}
          className="animate-fade-in-up absolute right-0 mt-2 w-80 origin-top-right rounded-2xl border p-2.5 shadow-2xl z-50 backdrop-blur-md"
        >
          <div
            className="px-2.5 py-1.5 border-b mb-1.5 flex items-center justify-between"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <span
              className="text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: "var(--accent-primary)" }}
            >
              5 Curated Sanctuary Themes
            </span>
            <span
              lang="pa"
              className="font-gurmukhi text-xs"
              style={{ color: "var(--accent-primary)" }}
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
                  style={{
                    backgroundColor: active
                      ? "var(--theme-bg-secondary)"
                      : "transparent",
                    borderColor: active
                      ? "var(--accent-primary)"
                      : "transparent",
                  }}
                  className="w-full rounded-xl p-2.5 text-left transition flex items-start gap-3 border hover:opacity-90"
                >
                  <span
                    className="mt-0.5 h-6 w-6 rounded-full border border-black/20 shrink-0 shadow-inner"
                    style={{
                      background: `linear-gradient(135deg, ${item.bgPreview} 55%, ${item.accentPreview} 45%)`,
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-xs font-serif font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {item.name}
                      </span>
                      {active && (
                        <span
                          className="text-[10px] font-bold shrink-0"
                          style={{ color: "var(--accent-primary)" }}
                        >
                          Active ✓
                        </span>
                      )}
                    </div>
                    <p
                      className="text-[11px] leading-snug mt-0.5"
                      style={{ color: "var(--theme-text-muted)" }}
                    >
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
