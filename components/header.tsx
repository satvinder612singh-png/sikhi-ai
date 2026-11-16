"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useAuth } from "@/components/auth-provider";
import {
  useCmsSiteState,
  useAdminEditMode,
  pushAdminCmsPatch,
  checkVerifiedAdminStatus,
  clearAdminAuthTokens,
  isStealthAdminEmail,
  type CmsFontFamily,
  type CmsFontScale,
  type CmsPageTransition,
  type CmsLayoutConfig,
} from "@/components/editable-heritage-image";

const VISITOR_THEME_KEY = "learn_sikhi_theme_v2";

function resolveDefaultThemeId(raw?: string, pageBg?: string): string | null {
  const val = (raw || "").trim().toLowerCase();
  if (val === "ivory" || val === "sunlit ivory" || val === "light") return "ivory";
  if (val === "marble" || val === "harmandir marble") return "marble";
  if (val === "indigo" || val === "midnight darbar" || val === "dark") return "indigo";
  if (val === "terracotta" || val === "puratan parchment") return "terracotta";
  if (val === "obsidian" || val === "royal maroon") return "obsidian";

  if (pageBg && /^#[0-9a-f]{6}$/i.test(pageBg)) {
    const r = parseInt(pageBg.slice(1, 3), 16);
    const g = parseInt(pageBg.slice(3, 5), 16);
    const b = parseInt(pageBg.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.45 ? "indigo" : "ivory";
  }
  return null;
}

/**
 * Publication-grade primary navigation: typography only, no emoji or icon
 * glyphs, and no duplicate links (Community lives on Home, Live Kirtan lives
 * inside Granths, Hukamnama lives inside Daily Bani).
 */
const LINKS: { href: string; title: string; sub?: string }[] = [
  { href: "/", title: "Home", sub: "SikhStack & SikhInterest" },
  { href: "/foundations", title: "Foundations" },
  { href: "/nitnem", title: "Daily Bani" },
  { href: "/granths", title: "Granths & Kirtan" },
  { href: "/matriarchs", title: "Sikh Women" },
  { href: "/games", title: "Vidyala" },
];

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C59B27]";

export function Header({ solid = false }: { solid?: boolean }) {
  const { user, signOut } = useAuth();
  const cms = useCmsSiteState();
  const [liveEditMode, setLiveEditMode] = useAdminEditMode();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isStealthAdmin, setIsStealthAdmin] = useState(false);
  const [isAdminBarOpen, setIsAdminBarOpen] = useState(false);
  const [adminSaving, setAdminSaving] = useState<string | null>(null);
  const menuId = useId();

  const layoutCfg: CmsLayoutConfig = cms.layoutConfig || {};

  const applyAdminLayoutPatch = async (
    patch: Partial<CmsLayoutConfig>,
    label: string
  ) => {
    setAdminSaving("Saving...");
    const ok = await pushAdminCmsPatch({
      layoutConfig: { ...layoutCfg, ...patch },
    });
    setAdminSaving(ok ? `✓ ${label}` : "Saved locally");
    window.setTimeout(() => {
      setAdminSaving((curr) => (curr === `✓ ${label}` ? null : curr));
    }, 2500);
  };

  useEffect(() => {
    let active = true;
    const syncAdminState = async () => {
      if (isStealthAdminEmail(user?.email)) {
        try {
          window.localStorage.setItem("learnsikhi_founder_admin_v1", "true");
          if (!window.localStorage.getItem("learnsikhi_admin_token_v1")) {
            window.localStorage.setItem(
              "learnsikhi_admin_token_v1",
              "verified_founder_1313"
            );
          }
        } catch {
          // ignore
        }
        if (active) setIsStealthAdmin(true);
        return;
      }
      const ok = await checkVerifiedAdminStatus();
      if (active) setIsStealthAdmin(ok);
    };

    void syncAdminState();
    const onSync = () => {
      void syncAdminState();
    };
    window.addEventListener("storage", onSync);
    window.addEventListener("focus", onSync);
    window.addEventListener("learnsikhi-admin-change", onSync);
    return () => {
      active = false;
      window.removeEventListener("storage", onSync);
      window.removeEventListener("focus", onSync);
      window.removeEventListener("learnsikhi-admin-change", onSync);
    };
  }, [user?.email]);

  useEffect(() => {
    try {
      const manualOverride = window.localStorage.getItem(VISITOR_THEME_KEY);
      if (manualOverride) return;
      const cfg = cms.layoutConfig as {
        defaultSiteTheme?: string;
        pageBgColor?: string;
        headingTextColor?: string;
      };
      const targetTheme = resolveDefaultThemeId(cfg?.defaultSiteTheme, cfg?.pageBgColor);
      if (targetTheme) {
        document.documentElement.setAttribute("data-theme", targetTheme);
      }
      if (cfg?.pageBgColor) {
        document.documentElement.style.setProperty("--bg-primary", cfg.pageBgColor);
      }
      if (cfg?.headingTextColor) {
        document.documentElement.style.setProperty("--text-primary", cfg.headingTextColor);
      }
    } catch {
      // ignore DOM/storage errors
    }
  }, [cms.layoutConfig]);

  const handleSignOut = async () => {
    clearAdminAuthTokens();
    setIsStealthAdmin(false);
    await signOut();
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname?.startsWith(href);

  return (
    <header
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
        color: "var(--text-primary)",
      }}
      className={
        solid
          ? "sticky top-0 z-30 border-b backdrop-blur-md shadow-sm"
          : "sticky top-0 z-30 border-b backdrop-blur-md"
      }
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8"
      >
        <Link
          href="/"
          aria-label="Learn Sikhi — Home"
          className={`flex shrink-0 items-center gap-2.5 rounded-lg py-0.5 whitespace-nowrap ${focusRing}`}
        >
          <BrandLogo size="sm" />
          <span className="whitespace-nowrap font-serif text-xl sm:text-2xl font-bold tracking-wide">
            Learn <span style={{ color: "var(--accent-primary)" }}>Sikhi</span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 xl:gap-2 lg:flex">
          {LINKS.map((l) => {
            const active = isActive(l.href);
            return (
              <li key={l.href} className="shrink-0">
                <Link
                  href={l.href}
                  title={l.sub}
                  aria-current={active ? "page" : undefined}
                  className={`block whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm transition hover:bg-black/5 ${
                    active ? "font-bold" : "font-medium opacity-80 hover:opacity-100"
                  } ${focusRing}`}
                  style={active ? { color: "var(--accent-primary)" } : undefined}
                >
                  {l.title}
                </Link>
              </li>
            );
          })}

          <li className="shrink-0 pl-2">
            <ThemeSwitcher />
          </li>

          {user ? (
            <li className="shrink-0 flex items-center gap-2">
              <Link
                href="/?studio=1"
                style={{ borderColor: "var(--border-subtle)" }}
                className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:border-[#C59B27] ${focusRing}`}
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                title={user.email ?? undefined}
                className={`whitespace-nowrap px-2 py-1.5 text-xs font-medium opacity-75 hover:opacity-100 ${focusRing}`}
              >
                Sign out
              </button>
            </li>
          ) : (
            <li className="shrink-0">
              <Link
                href="/login"
                style={{ backgroundColor: "var(--accent-primary)", color: "#FFFFFF" }}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold shadow-sm transition hover:brightness-105 ${focusRing}`}
              >
                Sign in
              </Link>
            </li>
          )}

          {isStealthAdmin && (
            <li className="shrink-0 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setLiveEditMode(!liveEditMode)}
                title="Toggle Live On-Page Edit Mode"
                className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-extrabold border transition ${
                  liveEditMode
                    ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                    : "border-[#C59B27]/55 bg-[#C59B27]/15 text-[#9A7418] dark:text-[#E5C158] hover:border-[#C59B27]"
                } ${focusRing}`}
              >
                ✏️ Edit Mode{liveEditMode ? ": ON" : ""}
              </button>
              <button
                type="button"
                aria-expanded={isAdminBarOpen}
                onClick={() => setIsAdminBarOpen((v) => !v)}
                className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border transition ${
                  isAdminBarOpen || liveEditMode
                    ? "border-[#C59B27] bg-[#C59B27]/20 text-[#9A7418] dark:text-[#E5C158]"
                    : "border-transparent opacity-75 hover:opacity-100 hover:border-[#C59B27]/40"
                } ${focusRing}`}
              >
                Admin {isAdminBarOpen ? "▲" : "▼"}
              </button>
            </li>
          )}
        </ul>

        <div className="flex items-center gap-2 lg:hidden">
          {isStealthAdmin && (
            <button
              type="button"
              onClick={() => setLiveEditMode(!liveEditMode)}
              className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-extrabold border transition ${
                liveEditMode
                  ? "bg-emerald-600 text-white border-emerald-500"
                  : "border-[#C59B27]/55 bg-[#C59B27]/15 text-[#9A7418] dark:text-[#E5C158]"
              } ${focusRing}`}
            >
              ✏️ Edit{liveEditMode ? ": ON" : ""}
            </button>
          )}
          <ThemeSwitcher />
          <button
            type="button"
            style={{ borderColor: "var(--border-subtle)" }}
            className={`whitespace-nowrap rounded-md border px-3 py-1.5 text-xs uppercase tracking-[0.2em] font-semibold ${focusRing}`}
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </nav>

      <div
        id={menuId}
        hidden={!open}
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
          color: "var(--text-primary)",
        }}
        className="mx-4 mb-3 rounded-2xl border p-2 shadow-xl lg:hidden"
      >
        <ul className="flex flex-col">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-baseline justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-black/5"
              >
                <span className={`text-sm ${isActive(l.href) ? "font-bold" : "font-medium"}`}>
                  {l.title}
                </span>
                {l.sub && (
                  <span className="text-xs" style={{ color: "var(--theme-text-muted)" }}>
                    {l.sub}
                  </span>
                )}
              </Link>
            </li>
          ))}
          <li className="mt-1 border-t pt-1" style={{ borderColor: "var(--border-subtle)" }}>
            {user ? (
              <div className="flex items-center justify-between px-3 py-2">
                <Link href="/?studio=1" onClick={() => setOpen(false)} className="text-sm font-medium">
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    void handleSignOut();
                  }}
                  className="text-sm font-medium opacity-75"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                style={{ color: "var(--accent-primary)" }}
                className="block px-3 py-2.5 text-sm font-bold"
              >
                Sign in
              </Link>
            )}
          </li>
          {isStealthAdmin && (
            <li>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setIsAdminBarOpen((v) => !v);
                }}
                className="w-full text-left block px-3 py-2 text-xs uppercase tracking-wider font-bold text-[#C59B27]"
              >
                Admin Studio Bar {isAdminBarOpen ? "▲" : "▼"}
              </button>
            </li>
          )}
        </ul>
      </div>

      {/* Live Top Admin Studio Dropdown Toolbar */}
      {isStealthAdmin && isAdminBarOpen && (
        <div
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--accent-primary)",
            color: "var(--text-primary)",
          }}
          className="border-t border-b shadow-2xl px-4 sm:px-6 lg:px-8 py-4"
        >
          <div className="mx-auto max-w-7xl space-y-4">
            {/* Top Action Row: Master Live Edit Mode + Status + Vault Link */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setLiveEditMode(!liveEditMode)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition ${
                    liveEditMode
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                      : "border-[#C59B27]/50 bg-[#C59B27]/10 text-[#9A7418] dark:text-[#E5C158] hover:border-[#C59B27]"
                  }`}
                >
                  ✏️ Live Page Edit Mode: {liveEditMode ? "ON" : "OFF"}
                </button>
                {adminSaving && (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {adminSaving}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/admin"
                  onClick={() => setIsAdminBarOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-extrabold shadow-sm hover:brightness-105 transition"
                >
                  🛡️ Security &amp; Moderation Vault (/admin)
                </Link>
                <button
                  type="button"
                  onClick={() => setIsAdminBarOpen(false)}
                  className="px-3 py-2 rounded-xl border text-xs font-bold opacity-75 hover:opacity-100"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  Close ✕
                </button>
              </div>
            </div>

            {/* Row 2: Page Transition + Quick Theme Switches + Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <span className="block text-[11px] font-bold uppercase tracking-wider opacity-75">
                  Page Transition
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { id: "fade", label: "Smooth Fade" },
                      { id: "slide-up", label: "Slide Up" },
                      { id: "scale-zoom", label: "Cinematic Zoom" },
                      { id: "blur-reveal", label: "Blur Reveal" },
                    ] as { id: CmsPageTransition; label: string }[]
                  ).map((tr) => (
                    <button
                      key={tr.id}
                      type="button"
                      onClick={() =>
                        void applyAdminLayoutPatch(
                          { pageTransition: tr.id },
                          `Transition: ${tr.label}`
                        )
                      }
                      className={`px-2.5 py-1.5 rounded-lg border font-semibold transition ${
                        (layoutCfg.pageTransition || "fade") === tr.id
                          ? "border-[#C59B27] bg-[#C59B27]/20 text-[#9A7418] dark:text-[#E5C158]"
                          : "border-white/15 opacity-75 hover:opacity-100"
                      }`}
                    >
                      {tr.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="block text-[11px] font-bold uppercase tracking-wider opacity-75">
                  Quick Theme Switches
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      void applyAdminLayoutPatch(
                        {
                          defaultSiteTheme: "indigo",
                          pageBgColor: "#0B101B",
                          cardBgColor: "#141B2D",
                          headingTextColor: "#FAF7F0",
                          bodyTextColor: "#D6D3CD",
                          accentColor: "#E5C158",
                        },
                        "Dark Darbar Theme"
                      )
                    }
                    className="px-2.5 py-1.5 rounded-lg border border-[#C59B27]/40 font-semibold hover:border-[#C59B27]"
                  >
                    🌙 Dark Darbar
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void applyAdminLayoutPatch(
                        {
                          defaultSiteTheme: "ivory",
                          pageBgColor: "#FAF7F0",
                          cardBgColor: "#FFFFFF",
                          headingTextColor: "#18181B",
                          bodyTextColor: "#3F3F46",
                          accentColor: "#9A7418",
                        },
                        "Light Ivory Theme"
                      )
                    }
                    className="px-2.5 py-1.5 rounded-lg border border-[#C59B27]/40 font-semibold hover:border-[#C59B27]"
                  >
                    ☀️ Light Ivory
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void applyAdminLayoutPatch(
                        {
                          defaultSiteTheme: "terracotta",
                          pageBgColor: "#F2E9D8",
                          cardBgColor: "#FBF6EC",
                          headingTextColor: "#2C1D0C",
                          bodyTextColor: "#4A3621",
                          accentColor: "#B45309",
                        },
                        "Puratan Parchment Theme"
                      )
                    }
                    className="px-2.5 py-1.5 rounded-lg border border-[#C59B27]/40 font-semibold hover:border-[#C59B27]"
                  >
                    📜 Puratan Parchment
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="block text-[11px] font-bold uppercase tracking-wider opacity-75">
                  Font, Size &amp; Grid
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <select
                    aria-label="Global font family"
                    value={layoutCfg.fontFamily || "serif-heritage"}
                    onChange={(e) =>
                      void applyAdminLayoutPatch(
                        { fontFamily: e.target.value as CmsFontFamily },
                        "Font updated"
                      )
                    }
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-subtle)",
                    }}
                    className="rounded-lg border px-2 py-1 text-xs font-semibold"
                  >
                    <option value="serif-heritage">Serif</option>
                    <option value="sans-modern">Sans</option>
                    <option value="manuscript">Manuscript</option>
                    <option value="mono-clean">Mono</option>
                  </select>

                  {(["sm", "md", "lg", "xl"] as CmsFontScale[]).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() =>
                        void applyAdminLayoutPatch(
                          { headingScale: sz, bodyScale: sz },
                          `Size: ${sz.toUpperCase()}`
                        )
                      }
                      className={`px-2 py-1 rounded-lg border uppercase font-bold ${
                        (layoutCfg.bodyScale || "md") === sz
                          ? "border-[#C59B27] bg-[#C59B27]/20 text-[#9A7418] dark:text-[#E5C158]"
                          : "border-white/15 opacity-75"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}

                  {(
                    [
                      { id: "grid-3", label: "3-Col" },
                      { id: "grid-2", label: "2-Col" },
                      { id: "editorial", label: "Editorial" },
                    ] as const
                  ).map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() =>
                        void applyAdminLayoutPatch(
                          { feedLayout: g.id },
                          `Grid: ${g.label}`
                        )
                      }
                      className={`px-2 py-1 rounded-lg border font-semibold ${
                        (layoutCfg.feedLayout || "grid-3") === g.id
                          ? "border-[#C59B27] bg-[#C59B27]/20 text-[#9A7418] dark:text-[#E5C158]"
                          : "border-white/15 opacity-75"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 3: Live Color Pickers */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
              {(
                [
                  { key: "pageBgColor", label: "Page BG", def: "#0B101B" },
                  { key: "cardBgColor", label: "Card BG", def: "#141B2D" },
                  { key: "headingTextColor", label: "Heading", def: "#FAF7F0" },
                  { key: "bodyTextColor", label: "Body", def: "#D6D3CD" },
                  { key: "accentColor", label: "Accent", def: "#C59B27" },
                ] as const
              ).map((c) => {
                const cur = layoutCfg[c.key] || "";
                return (
                  <label
                    key={c.key}
                    className="flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5"
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    <span className="font-bold truncate">{c.label}</span>
                    <input
                      type="color"
                      value={/^#[0-9a-f]{6}$/i.test(cur) ? cur : c.def}
                      onChange={(e) =>
                        void applyAdminLayoutPatch(
                          { [c.key]: e.target.value },
                          `${c.label} color updated`
                        )
                      }
                      className="w-6 h-6 rounded border-0 bg-transparent p-0 cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export const Navbar = Header;
export default Header;
