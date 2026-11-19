"use client";

import React, { useState, useEffect, useRef } from "react";

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
    subtitle: "Warm editorial paper canvas (#FAF8F5)",
    bgPreview: "#FAF8F5",
    surfacePreview: "#FFFFFF",
    accentPreview: "#B45309",
    isDark: false,
  },
  {
    id: "indigo",
    name: "Dark",
    shortLabel: "Dark",
    subtitle: "Deep neutral charcoal (#0F1115)",
    bgPreview: "#0F1115",
    surfacePreview: "#161920",
    accentPreview: "#E5A93C",
    isDark: true,
  },
  {
    id: "obsidian",
    name: "OLED",
    shortLabel: "OLED",
    subtitle: "True #000000 black with #0A0A0A surfaces",
    bgPreview: "#000000",
    surfacePreview: "#0A0A0A",
    accentPreview: "#F5C451",
    isDark: true,
  },
];

const THEME_STORAGE_KEY = "learn_sikhi_theme_v2";
const VALID_THEME_IDS: SikhiThemeId[] = ["ivory", "indigo", "obsidian"];

function applyThemeToDocument(nextTheme: SikhiThemeId) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-theme", nextTheme);
  const isDark = nextTheme === "indigo" || nextTheme === "obsidian";
  root.classList.toggle("dark", isDark);
  root.style.colorScheme = isDark ? "dark" : "light";
  // Clear any stale inline CSS variable overrides so data-theme tokens govern
  root.style.removeProperty("--bg-primary");
  root.style.removeProperty("--bg-surface");
  root.style.removeProperty("--text-primary");
}

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<SikhiThemeId>("ivory");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
      const initial: SikhiThemeId =
        saved && VALID_THEME_IDS.includes(saved as SikhiThemeId)
          ? (saved as SikhiThemeId)
          : "ivory";
      setTheme(initial);
      applyThemeToDocument(initial);
    } catch {
      applyThemeToDocument("ivory");
    }
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

  const selectTheme = (nextTheme: SikhiThemeId) => {
    setTheme(nextTheme);
    applyThemeToDocument(nextTheme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // ignore storage errors
    }
    setOpen(false);
  };

  const currentObj =
    SIKHI_THEMES.find((t) => t.id === theme) || SIKHI_THEMES[0];

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Switch color theme"
        style={{
          borderColor: "var(--border-subtle)",
          backgroundColor: "var(--bg-surface)",
          color: "var(--text-primary)",
        }}
        className="whitespace-nowrap inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors duration-150 hover:border-[var(--accent-primary)] focus:outline-none"
      >
        <span
          className="h-3 w-3 rounded-full border border-white/20 shrink-0"
          style={{
            backgroundColor: currentObj.bgPreview,
            boxShadow: `inset 0 0 0 2px ${currentObj.accentPreview}`,
          }}
        />
        <span>{currentObj.shortLabel}</span>
        <span
          className="text-[10px] opacity-70"
          style={{ color: "var(--theme-text-muted)" }}
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
          className="animate-fade-in-up absolute right-0 mt-2 w-60 origin-top-right rounded-xl border p-1.5 shadow-xl z-50"
        >
          <div
            className="px-2.5 py-1.5 border-b mb-1"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: "var(--theme-text-muted)" }}
            >
              Theme
            </span>
          </div>

          <div className="space-y-0.5">
            {SIKHI_THEMES.map((item) => {
              const active = item.id === theme;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  onClick={() => selectTheme(item.id)}
                  style={{
                    backgroundColor: active
                      ? "var(--bg-tertiary)"
                      : "transparent",
                    borderColor: active
                      ? "var(--border-subtle)"
                      : "transparent",
                  }}
                  className="w-full rounded-lg px-2.5 py-2 text-left transition-colors duration-150 flex items-center gap-2.5 border hover:bg-[var(--bg-tertiary)]"
                >
                  <span
                    className="h-4 w-4 rounded-full border border-white/15 shrink-0"
                    style={{
                      backgroundColor: item.bgPreview,
                      boxShadow: `inset 0 0 0 2px ${item.accentPreview}`,
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {item.name}
                      </span>
                      {active && (
                        <span
                          className="text-[10px] font-semibold shrink-0"
                          style={{ color: "var(--accent-text)" }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                    <p
                      className="text-[11px] leading-snug truncate"
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
    </div>
  );
}
