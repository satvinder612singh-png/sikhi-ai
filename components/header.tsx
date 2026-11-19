"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { motion } from "framer-motion";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useAuth } from "@/components/auth-provider";
import {
  useCmsSiteState,
  useAdminEditMode,
  pushAdminCmsPatch,
  checkVerifiedAdminStatus,
  clearAdminAuthTokens,
  getVerifiedAdminToken,
  isStealthAdminEmail,
  type CmsFontFamily,
  type CmsFontScale,
  type CmsPageTransition,
  type CmsLayoutConfig,
} from "@/components/editable-heritage-image";
import {
  toggleCmsArchiveItem,
  permanentlyDeleteCmsItem,
  clampFloatingWidgetPos,
  getRegisteredCanvasNodesSnapshot,
} from "@/components/inline-cms-editor";
import { GlobalExplorerSidebar } from "@/components/global-explorer-sidebar";

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
 * Focused 6-page core navigation architecture alongside Auth & Theme controls.
 */
const LINKS: { href: string; title: string; sub?: string }[] = [
  { href: "/", title: "Home", sub: "SikhStacks & SikhInterest" },
  { href: "/foundations", title: "Foundations of Sikhi" },
  { href: "/granths", title: "Granths & Kirtan" },
  { href: "/matriarchs", title: "Sikh Women" },
  { href: "/games", title: "Sikhi Games" },
  { href: "/news", title: "Explore & News" },
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
  const [isHiddenDrawerOpen, setIsHiddenDrawerOpen] = useState(false);
  const [confirmDrawerDeleteId, setConfirmDrawerDeleteId] = useState<string | null>(null);
  const [adminSaving, setAdminSaving] = useState<string | null>(null);
  const [aiCommand, setAiCommand] = useState("");
  const [aiBusy, setAiBusy] = useState<string | null>(null);
  const [aiOutput, setAiOutput] = useState<{
    summary: string;
    prompt: string;
    engine: string;
    wroteTaskFile: boolean;
  } | null>(null);
  const menuId = useId();

  const layoutCfg: CmsLayoutConfig = cms.layoutConfig || {};
  const deletedSet = new Set(Array.isArray(cms.deletedIds) ? cms.deletedIds : []);
  const archivedIds = (Array.isArray(cms.archivedIds) ? cms.archivedIds : []).filter(
    (id) => !deletedSet.has(id)
  );

  const resolveHiddenItemLabel = (id: string): string => {
    const editedTitle = cms.topicEdits?.[id]?.title;
    if (editedTitle) return editedTitle;
    for (const list of Object.values(cms.customTopics || {})) {
      const found = Array.isArray(list) ? list.find((t) => t.id === id) : undefined;
      if (found?.title) return found.title;
    }
    return id;
  };

  useEffect(() => {
    if (!isStealthAdmin || typeof window === "undefined") return;
    const rawPos = (
      cms.sectionLayoutMap as
        | { supportWidgetPos?: { right?: unknown; bottom?: unknown } }
        | undefined
    )?.supportWidgetPos;
    if (!rawPos) return;
    const check = clampFloatingWidgetPos(rawPos.right, rawPos.bottom);
    if (check.needsHeal) {
      void pushAdminCmsPatch({
        sectionLayoutMap: {
          ...(cms.sectionLayoutMap || {}),
          supportWidgetPos: { right: 24, bottom: 24 },
        },
      });
    }
  }, [isStealthAdmin, cms.sectionLayoutMap]);

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

  const runAiArchitect = async (
    mode: "live-layout" | "antigravity-bridge",
    overrideCommand?: string
  ) => {
    const commandText = (overrideCommand ?? aiCommand).trim() || "shuffle layout";
    setAiBusy(mode);
    setAdminSaving("⚡ AI Architect thinking...");
    try {
      const token = await getVerifiedAdminToken();
      const xToken =
        typeof window !== "undefined"
          ? window.localStorage.getItem("learnsikhi_admin_token_v1") ||
            (window.localStorage.getItem("learnsikhi_founder_admin_v1") === "true"
              ? "verified_founder_1313"
              : "")
          : "";
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers.Authorization = `Bearer ${token}`;
      if (xToken) headers["x-admin-token"] = xToken;
      else if (token) headers["x-admin-token"] = token;

      const res = await fetch("/api/ai-architect", {
        method: "POST",
        headers,
        body: JSON.stringify({
          command: commandText,
          currentPath: pathname || "/",
          currentSiteState: cms,
          registeredNodes: getRegisteredCanvasNodesSnapshot(),
          mode,
          email: user?.email,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        summary?: string;
        updatedStatePatch?: Partial<typeof cms>;
        antigravityPrompt?: string;
        engine?: string;
        wroteTaskFile?: boolean;
        error?: string;
      } | null;

      if (!res.ok || !data?.ok) {
        setAdminSaving(data?.error || "AI Architect request failed");
        setAiBusy(null);
        return;
      }

      if (mode === "live-layout" && data.updatedStatePatch) {
        const applied = await pushAdminCmsPatch(data.updatedStatePatch);
        setAdminSaving(
          applied
            ? `✓ ${data.summary || "Live layout updated"}`
            : `Applied locally: ${data.summary || "done"}`
        );
      } else if (mode === "antigravity-bridge") {
        const copyText = data.wroteTaskFile
          ? "Execute antigravity-task.md"
          : data.antigravityPrompt || "Execute antigravity-task.md";
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          try {
            await navigator.clipboard.writeText(copyText);
          } catch {
            // clipboard blocked
          }
        }
        setAdminSaving(
          data.wroteTaskFile
            ? "🚀 Wrote antigravity-task.md & copied: Execute antigravity-task.md"
            : "🚀 Prompt copied to clipboard"
        );
      }

      setAiOutput({
        summary: data.summary || "Completed",
        prompt: data.antigravityPrompt || "",
        engine: data.engine || "local",
        wroteTaskFile: Boolean(data.wroteTaskFile),
      });
      window.setTimeout(() => setAdminSaving(null), 3200);
    } catch {
      setAdminSaving("AI Architect error");
    } finally {
      setAiBusy(null);
    }
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
    if (typeof document === "undefined") return;
    if (isStealthAdmin && liveEditMode) {
      document.body.classList.add("god-mode-active");
    } else {
      document.body.classList.remove("god-mode-active");
    }
    return () => {
      document.body.classList.remove("god-mode-active");
    };
  }, [isStealthAdmin, liveEditMode]);

  useEffect(() => {
    try {
      const manualOverride = window.localStorage.getItem(VISITOR_THEME_KEY);
      if (manualOverride) return;
      const cfg = cms.layoutConfig as {
        defaultSiteTheme?: string;
        pageBgColor?: string;
      };
      const targetTheme = resolveDefaultThemeId(cfg?.defaultSiteTheme, cfg?.pageBgColor);
      if (targetTheme) {
        document.documentElement.setAttribute("data-theme", targetTheme);
        const isDark = targetTheme === "indigo" || targetTheme === "obsidian";
        document.documentElement.classList.toggle("dark", isDark);
        document.documentElement.style.colorScheme = isDark ? "dark" : "light";
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
        isAdminBarOpen
          ? "sticky top-0 z-[99999] border-b backdrop-blur-md shadow-sm"
          : solid
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
                  className={`relative block whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm transition hover:bg-black/5 ${
                    active ? "font-bold" : "font-medium opacity-85 hover:opacity-100"
                  } ${focusRing}`}
                  style={active ? { color: "var(--accent-text, var(--accent-primary))" } : undefined}
                >
                  {active && (
                    <motion.span
                      layoutId="header-nav-active-pill"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      style={{ backgroundColor: "var(--accent-primary)" }}
                      className="pointer-events-none absolute inset-x-2 -bottom-0.5 h-[2.5px] rounded-full"
                    />
                  )}
                  <span className="relative z-10">{l.title}</span>
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
          className="admin-studio-ui admin-studio-bar-top border-t border-b border-amber-400/50 bg-[#090d16] text-[#f8fafc] shadow-2xl px-4 sm:px-6 lg:px-8 py-4"
        >
          <div className="mx-auto max-w-7xl space-y-4">
            {/* Top Action Row: Master Live Edit Mode + Hidden Items + Vault Link */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  data-admin-active={liveEditMode ? "true" : undefined}
                  onClick={() => setLiveEditMode(!liveEditMode)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition ${
                    liveEditMode
                      ? "admin-pill-active shadow-sm"
                      : "border-amber-400/50 bg-slate-900 text-amber-300 hover:border-amber-400"
                  }`}
                >
                  ✏️ Edit Text &amp; Cards: {liveEditMode ? "ON" : "OFF"}
                </button>
                <span className="admin-label-muted text-[11px] font-medium hidden sm:inline">
                  Drag &amp; dot-grid paused for rock-solid layout stability
                </span>
                {adminSaving && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-xs font-bold text-emerald-200">
                    {adminSaving}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsHiddenDrawerOpen((v) => !v)}
                  data-admin-active={isHiddenDrawerOpen ? "true" : undefined}
                  className={`px-3 py-2 rounded-xl text-xs font-extrabold border transition ${
                    isHiddenDrawerOpen
                      ? "admin-pill-active"
                      : archivedIds.length > 0
                        ? "border-amber-400/70 bg-amber-500/15 text-amber-200"
                        : "border-white/25 bg-slate-900 text-slate-200 hover:border-amber-400/60"
                  }`}
                >
                  👁️ Hide / Unhide &amp; Delete ({archivedIds.length} Hidden)
                </button>
                <Link
                  href="/admin"
                  onClick={() => setIsAdminBarOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 text-[#090d16] text-xs font-extrabold shadow-sm hover:brightness-105 transition"
                >
                  🛡️ Security &amp; Moderation Vault (/admin)
                </Link>
                <button
                  type="button"
                  onClick={() => setIsAdminBarOpen(false)}
                  className="px-3 py-2 rounded-xl border border-white/25 bg-slate-900 text-xs font-bold text-slate-200 hover:text-white"
                >
                  Close ✕
                </button>
              </div>
            </div>

            {/* ⚡ AI Architect & Antigravity Command Bar */}
            <div className="rounded-2xl border border-amber-400/45 bg-slate-900/95 p-3 space-y-2.5 shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                <div className="flex-1 flex items-center gap-2 rounded-xl border border-amber-400/40 bg-[#090d16] px-3 py-2">
                  <span className="text-amber-400 text-sm shrink-0">⚡</span>
                  <input
                    type="text"
                    value={aiCommand}
                    onChange={(e) => setAiCommand(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void runAiArchitect("live-layout");
                      }
                    }}
                    placeholder="Ask AI Architect to redesign this page, shuffle layout, fix alignment, or dispatch a task to Antigravity..."
                    className="w-full bg-transparent text-xs text-white placeholder:text-slate-400 focus:outline-none border-0 p-0"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs shrink-0">
                  <button
                    type="button"
                    disabled={aiBusy !== null}
                    onClick={() => void runAiArchitect("live-layout")}
                    className="px-3 py-2 rounded-xl bg-amber-400 text-[#090d16] font-extrabold hover:bg-amber-300 transition disabled:opacity-50"
                  >
                    {aiBusy === "live-layout" ? "Applying..." : "✨ Apply Live to Page"}
                  </button>
                  <button
                    type="button"
                    disabled={aiBusy !== null}
                    onClick={() => void runAiArchitect("antigravity-bridge")}
                    className="px-3 py-2 rounded-xl border border-sky-400/55 bg-sky-500/20 text-sky-100 font-extrabold hover:bg-sky-500/30 transition disabled:opacity-50"
                  >
                    {aiBusy === "antigravity-bridge"
                      ? "Dispatching..."
                      : "🚀 Send Task to Antigravity"}
                  </button>
                  <button
                    type="button"
                    disabled={aiBusy !== null}
                    onClick={() => void runAiArchitect("live-layout", "shuffle layout")}
                    className="px-3 py-2 rounded-xl border border-amber-400/50 bg-[#090d16] text-amber-300 font-extrabold hover:bg-amber-500/20 transition disabled:opacity-50"
                  >
                    🎲 Magic Layout Shuffle
                  </button>
                </div>
              </div>

              {aiOutput && (
                <div className="rounded-xl border border-amber-400/30 bg-[#090d16]/90 px-3 py-2 text-[11px] flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <p className="font-bold text-amber-300 truncate">
                      ✓ [{aiOutput.engine === "gemini" ? "Gemini AI" : "Local Architect"}]{" "}
                      {aiOutput.summary}
                    </p>
                    {aiOutput.wroteTaskFile && (
                      <p className="text-[10px] text-slate-300 font-mono truncate">
                        Task written to antigravity-task.md — Type in Antigravity: Execute antigravity-task.md
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof navigator !== "undefined" && navigator.clipboard) {
                          void navigator.clipboard.writeText(
                            aiOutput.wroteTaskFile
                              ? "Execute antigravity-task.md"
                              : aiOutput.prompt
                          );
                          setAdminSaving("✓ Copied command to clipboard");
                          window.setTimeout(() => setAdminSaving(null), 1800);
                        }
                      }}
                      className="px-2 py-1 rounded-lg border border-amber-400/45 text-amber-200 text-[10px] font-bold hover:bg-amber-500/20"
                    >
                      📋 Copy Command
                    </button>
                    <button
                      type="button"
                      onClick={() => setAiOutput(null)}
                      className="px-2 py-1 rounded-lg border border-white/20 text-slate-300 text-[10px] hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>

            {isHiddenDrawerOpen && (
              <div
                className="rounded-xl border border-amber-400/35 bg-slate-900/95 p-3 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-amber-300">
                    👁️‍🗨️ Hidden Items ({archivedIds.length}) — Hidden from regular visitors
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsHiddenDrawerOpen(false)}
                    className="admin-label-muted text-[11px] hover:text-white"
                  >
                    Hide Drawer ✕
                  </button>
                </div>
                {archivedIds.length === 0 ? (
                  <p className="admin-label-muted text-[11px]">
                    No hidden cards or articles right now.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-52 overflow-y-auto">
                    {archivedIds.map((hid) => (
                      <div
                        key={hid}
                        className="flex items-center justify-between gap-2 rounded-lg border border-amber-400/30 px-2.5 py-1.5 bg-[#090d16]"
                      >
                        <div className="min-w-0">
                          <p className="font-bold truncate text-white">{resolveHiddenItemLabel(hid)}</p>
                          <p className="admin-label-muted text-[10px] font-mono truncate">{hid}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={async () => {
                              setAdminSaving("Unhiding...");
                              await toggleCmsArchiveItem(cms, hid);
                              setAdminSaving("✓ Restored");
                              window.setTimeout(() => setAdminSaving(null), 1800);
                            }}
                            className="px-2 py-1 rounded bg-emerald-500 text-[#090d16] text-[10px] font-extrabold hover:brightness-110"
                          >
                            Unhide
                          </button>
                          {confirmDrawerDeleteId === hid ? (
                            <button
                              type="button"
                              onClick={async () => {
                                setAdminSaving("Deleting...");
                                await permanentlyDeleteCmsItem(cms, hid);
                                setConfirmDrawerDeleteId(null);
                                setAdminSaving("✓ Deleted Forever");
                                window.setTimeout(() => setAdminSaving(null), 1800);
                              }}
                              className="px-2 py-1 rounded bg-red-600 text-white text-[10px] font-extrabold"
                            >
                              Confirm?
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDrawerDeleteId(hid)}
                              className="px-2 py-1 rounded border border-red-400/50 text-red-300 text-[10px] font-bold hover:bg-red-500/20"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Row 2: Page Transition + Quick Theme Switches + Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <span className="admin-label-muted block text-[11px] font-bold uppercase tracking-wider">
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
                      data-admin-active={(layoutCfg.pageTransition || "fade") === tr.id ? "true" : undefined}
                      onClick={() =>
                        void applyAdminLayoutPatch(
                          { pageTransition: tr.id },
                          `Transition: ${tr.label}`
                        )
                      }
                      className={`px-2.5 py-1.5 rounded-lg border font-semibold transition ${
                        (layoutCfg.pageTransition || "fade") === tr.id
                          ? "admin-pill-active"
                          : "border-white/20 bg-slate-900 text-slate-200 hover:border-amber-400/60"
                      }`}
                    >
                      {tr.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="admin-label-muted block text-[11px] font-bold uppercase tracking-wider">
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
                        "Dark Theme"
                      )
                    }
                    className="px-2.5 py-1.5 rounded-lg border border-amber-400/40 bg-slate-900 text-slate-100 font-semibold hover:border-amber-400"
                  >
                    🌙 Dark
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
                        "Light Theme"
                      )
                    }
                    className="px-2.5 py-1.5 rounded-lg border border-amber-400/40 bg-slate-900 text-slate-100 font-semibold hover:border-amber-400"
                  >
                    ☀️ Light
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void applyAdminLayoutPatch(
                        {
                          defaultSiteTheme: "obsidian",
                          pageBgColor: "#000000",
                          cardBgColor: "#0A0A0A",
                          headingTextColor: "#FFFFFF",
                          bodyTextColor: "#D4D4D8",
                          accentColor: "#F5C451",
                        },
                        "OLED Theme"
                      )
                    }
                    className="px-2.5 py-1.5 rounded-lg border border-amber-400/40 bg-slate-900 text-slate-100 font-semibold hover:border-amber-400"
                  >
                    ⚫ OLED
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
                    className="px-2.5 py-1.5 rounded-lg border border-amber-400/40 bg-slate-900 text-slate-100 font-semibold hover:border-amber-400"
                  >
                    📜 Puratan Parchment
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="admin-label-muted block text-[11px] font-bold uppercase tracking-wider">
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
                    className="rounded-lg border border-amber-400/40 bg-slate-900 text-white px-2 py-1 text-xs font-semibold"
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
                      data-admin-active={(layoutCfg.bodyScale || "md") === sz ? "true" : undefined}
                      onClick={() =>
                        void applyAdminLayoutPatch(
                          { headingScale: sz, bodyScale: sz },
                          `Size: ${sz.toUpperCase()}`
                        )
                      }
                      className={`px-2 py-1 rounded-lg border uppercase font-bold ${
                        (layoutCfg.bodyScale || "md") === sz
                          ? "admin-pill-active"
                          : "border-white/20 bg-slate-900 text-slate-200 hover:border-amber-400/60"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}

                  {(
                    [
                      { id: "editorial", label: "1-Col" },
                      { id: "grid-2", label: "2-Col" },
                      { id: "grid-3", label: "3-Col" },
                    ] as const
                  ).map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      data-admin-active={(layoutCfg.feedLayout || "grid-3") === g.id ? "true" : undefined}
                      onClick={() =>
                        void applyAdminLayoutPatch(
                          { feedLayout: g.id },
                          `Grid: ${g.label}`
                        )
                      }
                      className={`px-2 py-1 rounded-lg border font-semibold ${
                        (layoutCfg.feedLayout || "grid-3") === g.id
                          ? "admin-pill-active"
                          : "border-white/20 bg-slate-900 text-slate-200 hover:border-amber-400/60"
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
                    className="flex items-center justify-between gap-2 rounded-lg border border-amber-400/35 bg-slate-900 px-2.5 py-1.5 text-slate-100"
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
      <GlobalExplorerSidebar isAdmin={isStealthAdmin} />
    </header>
  );
}

export const Navbar = Header;
export default Header;
