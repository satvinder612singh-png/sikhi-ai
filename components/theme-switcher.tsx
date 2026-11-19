"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export type SikhiThemeId = "ivory" | "indigo" | "obsidian";

export type SikhiThemeOption = {
  id: SikhiThemeId;
  name: string;
  shortLabel: string;
  subtitle: string;
  bgPreview: string;
  surfacePreview: string;
  accentPreview: string;
  isDark: boolean;
};

export const SIKHI_THEMES: SikhiThemeOption[] = [
  {
    id: "ivory",
    name: "Light",
    shortLabel: "Light",
    subtitle: "Clean warm light canvas with crisp dark text",
    bgPreview: "#FAF7F0",
    surfacePreview: "#FFFFFF",
    accentPreview: "#C59B27",
    isDark: false,
  },
  {
    id: "indigo",
    name: "Dark",
    shortLabel: "Dark",
    subtitle: "Balanced dark slate surface for comfortable reading",
    bgPreview: "#0B132B",
    surfacePreview: "#1C2541",
    accentPreview: "#F59E0B",
    isDark: true,
  },
  {
    id: "obsidian",
    name: "OLED",
    shortLabel: "OLED",
    subtitle: "Pure #000000 black with high-contrast accents",
    bgPreview: "#000000",
    surfacePreview: "#090A0F",
    accentPreview: "#FFB800",
    isDark: true,
  },
];

const THEME_STORAGE_KEY = "learn_sikhi_theme_v2";
const VALID_THEME_IDS: SikhiThemeId[] = ["ivory", "indigo", "obsidian"];

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
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY) as
        | SikhiThemeId
        | "marble"
        | "terracotta"
        | null;
      const initial: SikhiThemeId =
        saved && VALID_THEME_IDS.includes(saved as SikhiThemeId)
          ? (saved as SikhiThemeId)
          : "ivory";
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
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
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
        aria-label="Switch color theme"
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
          aria-label="Appearance"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
            color: "var(--text-primary)",
          }}
          className="animate-fade-in-up absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border p-2 shadow-2xl z-50 backdrop-blur-md"
        >
          <div
            className="px-2.5 py-1.5 border-b mb-1.5"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <span
              className="text-[10px] font-bold uppercase tracking-[0.2em]"
              style={{ color: "var(--accent-primary)" }}
            >
              Appearance
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
                    className="mt-0.5 h-5 w-5 rounded-full border border-black/20 shrink-0 shadow-inner"
                    style={{
                      background: `linear-gradient(135deg, ${item.bgPreview} 55%, ${item.accentPreview} 45%)`,
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-xs font-bold"
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
