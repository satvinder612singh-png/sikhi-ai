"use client";

import React, { useEffect, useMemo, useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import {
  EditableHeritageImage,
  type FrameOrientation,
  type HeritageFrameSettings,
} from "@/components/editable-heritage-image";
import {
  FIVE_KS,
  GURUS,
  PANJ_PYARE,
  SAHIBZAADE,
  MATA_GUJRI,
  SHAHEEDS,
} from "@/lib/sikhi-foundations-data";

type AdminTab = "order" | "topics" | "graphics" | "vault";
type PageKey = "sangat" | "foundations" | "matriarchs";

interface TopicEdit {
  title?: string;
  gurmukhi?: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  source?: string;
}

interface CustomTopic {
  id: string;
  title: string;
  gurmukhi?: string;
  subtitle?: string;
  description: string;
  badge?: string;
  source?: string;
  imageKey?: string;
  createdAt: string;
}

interface LayoutConfig {
  feedLayout?: "grid-3" | "grid-2" | "editorial";
  heroHeight?: "compact" | "standard" | "cinema";
  accentStyle?: "classic-gold" | "minimal" | "museum-frame";
}

interface CustomPostStub {
  id: string;
  title?: string;
  publisher?: string;
  summary?: string;
  subtitle?: string;
  description?: string;
}

interface SiteFramesState {
  frames: Record<string, HeritageFrameSettings>;
  customPosts: {
    links: CustomPostStub[];
    blogs: CustomPostStub[];
    pins: CustomPostStub[];
  };
  deletedIds: string[];
  heroBannerUrl: string | null;
  sectionOrder: Record<string, string[]>;
  pinnedIds: string[];
  archivedIds: string[];
  topicEdits: Record<string, TopicEdit>;
  customTopics: Record<string, CustomTopic[]>;
  layoutConfig: LayoutConfig;
  storageMode?: string;
  updatedAt?: string;
}

const ADMIN_FLAG_KEY = "learnsikhi_founder_admin_v1";
const ADMIN_TOKEN_KEY = "learnsikhi_admin_token_v1";
const ADMIN_EMAIL_KEY = "learnsikhi_active_email_v1";

const BUILTIN_ITEMS: Record<PageKey, { id: string; label: string; sub?: string }[]> = {
  sangat: [
    { id: "seed-bunga-azadi-yt", label: "Bunga Azadi — Sovereignty & Philosophy", sub: "Curated Resource" },
    { id: "seed-ensaaf", label: "Ensaaf — Human Rights Documentation", sub: "Curated Resource" },
    { id: "seed-1984-tribute", label: "1984 Tribute Archive", sub: "Curated Resource" },
    { id: "foundations-pillars-strip", label: "Core Pillars Strip", sub: "Navigation" },
  ],
  foundations: [
    ...FIVE_KS.map((k) => ({ id: k.art.artKey, label: `5 Ks: ${k.name}`, sub: k.gurmukhi })),
    ...GURUS.map((g) => ({ id: g.art.artKey, label: `Guru ${g.n}: ${g.name}`, sub: g.life })),
    ...PANJ_PYARE.map((p) => ({ id: p.art.artKey, label: `Panj Pyare: ${p.name}`, sub: p.from })),
    ...SAHIBZAADE.map((s) => ({ id: s.art.artKey, label: `Sahibzaada: ${s.name}`, sub: s.place })),
    { id: MATA_GUJRI.art.artKey, label: MATA_GUJRI.name, sub: MATA_GUJRI.gurmukhi },
    ...SHAHEEDS.map((s) => ({ id: s.art.artKey, label: `Shaheed: ${s.name}`, sub: s.year })),
  ],
  matriarchs: [
    { id: "bebe-nanaki", label: "Bebe Nanaki Ji", sub: "First Sikh & Guru Nanak's Elder Sister" },
    { id: "mata-khivi", label: "Mata Khivi Ji", sub: "Architect of Guru Ka Langar" },
    { id: "mata-gujri", label: "Mata Gujri Ji", sub: "Steadfast Matrix of Anandpur & Sirhind" },
    { id: "mai-bhago", label: "Mai Bhago Ji (Mata Bhag Kaur)", sub: "Battle of Muktsar, 1705" },
    { id: "bibi-sharan-kaur", label: "Bibi Sharan Kaur Pabla", sub: "Chamkaur Night Seva" },
    { id: "bibi-harsharan-rup-amro", label: "Bibi Amro, Bibi Rup Kaur & Bibi Harsharan Kaur", sub: "Scholars & Defenders" },
    { id: "mata-sahib-kaur", label: "Mata Sahib Kaur Ji & Mata Sundari Ji", sub: "Panthic Stewardship" },
    { id: "bibi-dalair-kaur", label: "Bibi Dalair Kaur Ji", sub: "Defender of Anandpur" },
    { id: "rani-sada-kaur", label: "Sardarni Sada Kaur", sub: "Kanhaiya Misl Leader" },
    { id: "bibi-rajinder-kaur", label: "Bibi Rajinder Kaur of Patiala", sub: "Stateswoman" },
    { id: "maharani-jind-kaur", label: "Maharani Jind Kaur (Mai Jindan)", sub: "Regent of Lahore" },
    { id: "bibi-gulab-kaur", label: "Bibi Gulab Kaur", sub: "Ghadar Party Revolutionary" },
    { id: "bibi-upkar-kaur-1984", label: "Bibi Upkar Kaur & Mothers of 1978–1984", sub: "Modern Panthic Resistance" },
  ],
};

const EMPTY_STATE: SiteFramesState = {
  frames: {},
  customPosts: { links: [], blogs: [], pins: [] },
  deletedIds: [],
  heroBannerUrl: null,
  sectionOrder: {},
  pinnedIds: [],
  archivedIds: [],
  topicEdits: {},
  customTopics: {},
  layoutConfig: {
    feedLayout: "grid-3",
    heroHeight: "standard",
    accentStyle: "classic-gold",
  },
};

export default function AdminStudioPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>("order");
  const [siteState, setSiteState] = useState<SiteFramesState>(EMPTY_STATE);
  const [loadingState, setLoadingState] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{
    kind: "ok" | "err" | "saving";
    text: string;
  } | null>(null);

  // Tab 1: Order & Sequence state
  const [orderPage, setOrderPage] = useState<PageKey>("sangat");

  // Tab 2: Topics & Descriptions CMS state
  const [newTopicPage, setNewTopicPage] = useState<PageKey>("foundations");
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicGurmukhi, setNewTopicGurmukhi] = useState("");
  const [newTopicSubtitle, setNewTopicSubtitle] = useState("");
  const [newTopicBadge, setNewTopicBadge] = useState("");
  const [newTopicDescription, setNewTopicDescription] = useState("");
  const [newTopicSource, setNewTopicSource] = useState("");
  const [newTopicDraftKey] = useState(() => `custom-topic-${Date.now()}`);

  const [editPage, setEditPage] = useState<PageKey>("foundations");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [editTitle, setEditTitle] = useState("");
  const [editGurmukhi, setEditGurmukhi] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editBadge, setEditBadge] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSource, setEditSource] = useState("");

  useEffect(() => {
    try {
      const flag = window.localStorage.getItem(ADMIN_FLAG_KEY) === "true";
      setUnlocked(flag);
    } catch {
      setUnlocked(false);
    } finally {
      setCheckingAuth(false);
    }
  }, []);

  const fetchSiteState = async () => {
    setLoadingState(true);
    try {
      const res = await fetch(`/api/site-frames?t=${Date.now()}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data && typeof data === "object") {
        setSiteState({
          ...EMPTY_STATE,
          ...data,
          frames: data.frames || {},
          customPosts: data.customPosts || EMPTY_STATE.customPosts,
          deletedIds: Array.isArray(data.deletedIds) ? data.deletedIds : [],
          sectionOrder: data.sectionOrder || {},
          pinnedIds: Array.isArray(data.pinnedIds) ? data.pinnedIds : [],
          archivedIds: Array.isArray(data.archivedIds) ? data.archivedIds : [],
          topicEdits: data.topicEdits || {},
          customTopics: data.customTopics || {},
          layoutConfig: {
            ...EMPTY_STATE.layoutConfig,
            ...(data.layoutConfig || {}),
          },
        });
      }
    } catch {
      // ignore fetch errors
    } finally {
      setLoadingState(false);
    }
  };

  useEffect(() => {
    if (unlocked) {
      void fetchSiteState();
    }
  }, [unlocked]);

  const getToken = (): string => {
    try {
      return (
        window.localStorage.getItem(ADMIN_TOKEN_KEY) || "verified_founder_1313"
      );
    } catch {
      return "verified_founder_1313";
    }
  };

  const postStudioUpdate = async (
    payload: Record<string, unknown>,
    successMsg: string
  ) => {
    setStatusBanner({ kind: "saving", text: "Saving changes globally..." });
    try {
      const res = await fetch("/api/site-frames", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `Save failed (${res.status})`);
      }
      setSiteState((prev) => ({
        ...prev,
        ...data,
        frames: data.frames || prev.frames,
        sectionOrder: data.sectionOrder || prev.sectionOrder,
        pinnedIds: data.pinnedIds || prev.pinnedIds,
        archivedIds: data.archivedIds || prev.archivedIds,
        topicEdits: data.topicEdits || prev.topicEdits,
        customTopics: data.customTopics || prev.customTopics,
        layoutConfig: data.layoutConfig || prev.layoutConfig,
      }));
      setStatusBanner({ kind: "ok", text: successMsg });
      window.setTimeout(() => {
        setStatusBanner((c) => (c?.kind === "ok" ? null : c));
      }, 3000);
    } catch (err) {
      setStatusBanner({
        kind: "err",
        text: err instanceof Error ? err.message : "Failed to save state.",
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSubmitting(true);
    try {
      const res = await fetch("/api/site-frames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admin_login",
          email: emailInput.trim(),
          password: passwordInput,
        }),
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok || !data?.adminToken) {
        throw new Error(
          data?.error || "Invalid Founder Admin credentials."
        );
      }
      try {
        window.localStorage.setItem(ADMIN_FLAG_KEY, "true");
        window.localStorage.setItem(ADMIN_TOKEN_KEY, data.adminToken);
        window.localStorage.setItem(
          ADMIN_EMAIL_KEY,
          emailInput.trim().toLowerCase()
        );
        window.dispatchEvent(new Event("learnsikhi-admin-change"));
      } catch {
        // ignore storage errors
      }
      setUnlocked(true);
      setPasswordInput("");
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : "Sign-in failed."
      );
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleSignOutAdmin = () => {
    try {
      window.localStorage.removeItem(ADMIN_FLAG_KEY);
      window.localStorage.removeItem(ADMIN_TOKEN_KEY);
      window.localStorage.removeItem(ADMIN_EMAIL_KEY);
      window.dispatchEvent(new Event("learnsikhi-admin-change"));
    } catch {
      // ignore
    }
    setUnlocked(false);
    setEmailInput("");
    setPasswordInput("");
  };

  // Combine built-in + custom items for any PageKey
  const getItemsForPage = (page: PageKey) => {
    const base = [...BUILTIN_ITEMS[page]];
    if (page === "sangat") {
      for (const l of siteState.customPosts.links || []) {
        base.push({
          id: `link-${l.id}`,
          label: l.title || l.id,
          sub: l.publisher || "Custom Link",
        });
      }
      for (const b of siteState.customPosts.blogs || []) {
        base.push({
          id: `blog-${b.id}`,
          label: b.title || b.id,
          sub: "Custom Essay",
        });
      }
      for (const p of siteState.customPosts.pins || []) {
        base.push({
          id: `pin-${p.id}`,
          label: p.title || p.id,
          sub: "Custom Visual",
        });
      }
    }
    for (const ct of siteState.customTopics[page] || []) {
      base.push({
        id: ct.id,
        label: ct.title,
        sub: ct.badge || ct.subtitle || "Custom Topic",
      });
    }

    const savedOrder = siteState.sectionOrder[page] || [];
    const orderMap = new Map(savedOrder.map((id, idx) => [id, idx]));

    return base.sort((a, b) => {
      const aPinned = siteState.pinnedIds.includes(a.id) ? 0 : 1;
      const bPinned = siteState.pinnedIds.includes(b.id) ? 0 : 1;
      if (aPinned !== bPinned) return aPinned - bPinned;

      const aArch = siteState.archivedIds.includes(a.id) ? 1 : 0;
      const bArch = siteState.archivedIds.includes(b.id) ? 1 : 0;
      if (aArch !== bArch) return aArch - bArch;

      const ai = orderMap.has(a.id) ? orderMap.get(a.id)! : 9999;
      const bi = orderMap.has(b.id) ? orderMap.get(b.id)! : 9999;
      return ai - bi;
    });
  };

  const orderedItems = useMemo(
    () => getItemsForPage(orderPage),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orderPage, siteState]
  );

  const editPageItems = useMemo(
    () => getItemsForPage(editPage),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editPage, siteState]
  );

  useEffect(() => {
    if (!selectedTopicId && editPageItems.length > 0) {
      setSelectedTopicId(editPageItems[0].id);
    }
  }, [editPageItems, selectedTopicId]);

  useEffect(() => {
    if (!selectedTopicId) return;
    const existing = siteState.topicEdits[selectedTopicId] || {};
    const ct = (siteState.customTopics[editPage] || []).find(
      (c) => c.id === selectedTopicId
    );
    const builtin = BUILTIN_ITEMS[editPage].find((b) => b.id === selectedTopicId);
    setEditTitle(existing.title ?? ct?.title ?? builtin?.label ?? "");
    setEditGurmukhi(existing.gurmukhi ?? ct?.gurmukhi ?? "");
    setEditSubtitle(existing.subtitle ?? ct?.subtitle ?? builtin?.sub ?? "");
    setEditBadge(existing.badge ?? ct?.badge ?? "");
    setEditDescription(existing.description ?? ct?.description ?? "");
    setEditSource(existing.source ?? ct?.source ?? "");
  }, [selectedTopicId, editPage, siteState.topicEdits, siteState.customTopics]);

  const applyOrderChange = (nextOrderIds: string[], nextPinned = siteState.pinnedIds, nextArchived = siteState.archivedIds) => {
    void postStudioUpdate(
      {
        sectionOrder: { [orderPage]: nextOrderIds },
        pinnedIds: nextPinned,
        archivedIds: nextArchived,
      },
      "✓ Sequence updated globally"
    );
  };

  const handleMoveItem = (idx: number, direction: "first" | "up" | "down" | "last") => {
    const ids = orderedItems.map((i) => i.id);
    const id = ids[idx];
    if (!id) return;
    const rest = ids.filter((x) => x !== id);
    let nextIds = ids;
    let nextPinned = siteState.pinnedIds.filter((x) => x !== id);
    let nextArchived = siteState.archivedIds.filter((x) => x !== id);

    if (direction === "first") {
      nextIds = [id, ...rest];
      nextPinned = [id, ...nextPinned];
    } else if (direction === "last") {
      nextIds = [...rest, id];
    } else if (direction === "up" && idx > 0) {
      nextIds = [...ids];
      [nextIds[idx - 1], nextIds[idx]] = [nextIds[idx], nextIds[idx - 1]];
    } else if (direction === "down" && idx < ids.length - 1) {
      nextIds = [...ids];
      [nextIds[idx + 1], nextIds[idx]] = [nextIds[idx], nextIds[idx + 1]];
    }
    applyOrderChange(nextIds, nextPinned, nextArchived);
  };

  const handleToggleHideItem = (id: string) => {
    const isHidden = siteState.archivedIds.includes(id);
    const nextArchived = isHidden
      ? siteState.archivedIds.filter((x) => x !== id)
      : [...siteState.archivedIds, id];
    const nextOrder = orderedItems.map((i) => i.id);
    applyOrderChange(nextOrder, siteState.pinnedIds, nextArchived);
  };

  const handleCreateCustomTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicDescription.trim()) return;
    const created: CustomTopic = {
      id: newTopicDraftKey,
      title: newTopicTitle.trim(),
      gurmukhi: newTopicGurmukhi.trim() || undefined,
      subtitle: newTopicSubtitle.trim() || undefined,
      description: newTopicDescription.trim(),
      badge: newTopicBadge.trim() || undefined,
      source: newTopicSource.trim() || undefined,
      imageKey: newTopicDraftKey,
      createdAt: new Date().toISOString(),
    };
    const existingList = siteState.customTopics[newTopicPage] || [];
    await postStudioUpdate(
      {
        customTopics: {
          [newTopicPage]: [created, ...existingList],
        },
      },
      `✓ Created new card "${created.title}" on /${newTopicPage}`
    );
    setNewTopicTitle("");
    setNewTopicGurmukhi("");
    setNewTopicSubtitle("");
    setNewTopicBadge("");
    setNewTopicDescription("");
    setNewTopicSource("");
  };

  const handleSaveTopicEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTopicId) return;
    await postStudioUpdate(
      {
        topicEdits: {
          [selectedTopicId]: {
            title: editTitle.trim() || undefined,
            gurmukhi: editGurmukhi.trim() || undefined,
            subtitle: editSubtitle.trim() || undefined,
            badge: editBadge.trim() || undefined,
            description: editDescription.trim() || undefined,
            source: editSource.trim() || undefined,
          },
        },
      },
      `✓ Saved override for "${selectedTopicId}"`
    );
  };

  const handleVaultOrientation = (imageKey: string, frame: HeritageFrameSettings, orientation: FrameOrientation) => {
    const updated: HeritageFrameSettings = {
      ...frame,
      orientation,
      fitMode: orientation === "natural" ? "contain-museum" : "cover",
    };
    void postStudioUpdate(
      { frames: { [imageKey]: updated } },
      `✓ Updated "${imageKey}" to ${orientation}`
    );
  };

  const handleVaultDelete = (imageKey: string) => {
    void postStudioUpdate(
      { frames: { [imageKey]: null } },
      `✓ Removed "${imageKey}" override`
    );
  };

  return (
    <div
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
      className="min-h-screen flex flex-col"
    >
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {checkingAuth ? (
          <div className="p-12 text-center text-sm opacity-75">
            Checking session...
          </div>
        ) : !unlocked ? (
          <section className="max-w-md mx-auto rounded-3xl border border-[#C59B27]/40 bg-[var(--bg-surface)] p-6 sm:p-8 shadow-xl space-y-5">
            <div className="space-y-1.5 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#C59B27]">
                RESTRICTED WORKSPACE
              </p>
              <h1 className="text-2xl font-serif font-bold">
                Founder Admin Sign-In
              </h1>
              <p className="text-xs opacity-75">
                Sign in with your Founder Admin credentials to manage ordering,
                topics, layout controls, and paintings globally.
              </p>
            </div>

            {authError && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3.5 py-2.5 text-xs font-semibold text-red-600 dark:text-red-300">
                {authError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold">Admin Email</label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Student1313@learnsikhi.com"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#C59B27]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold">Password</label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter password"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#C59B27]"
                />
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-extrabold uppercase tracking-wider shadow-sm hover:brightness-105 transition disabled:opacity-60"
              >
                {authSubmitting ? "Verifying..." : "Unlock Creative Admin Studio"}
              </button>
            </form>
          </section>
        ) : (
          <>
            {/* Studio Header */}
            <section
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
              }}
              className="rounded-3xl border p-6 sm:p-7 shadow-sm space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#C59B27]">
                    CREATIVE ADMIN STUDIO • GLOBAL SYNC
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold">
                    LearnSikhi Global Content &amp; Layout Studio
                  </h1>
                  <p className="text-xs opacity-75 mt-1">
                    Storage mode: <strong>{siteState.storageMode || "connecting"}</strong>
                    {loadingState ? " • Syncing..." : ""}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void fetchSiteState()}
                    className="px-3.5 py-2 rounded-xl border border-[#C59B27]/40 text-xs font-bold hover:border-[#C59B27] transition"
                  >
                    ↻ Refresh State
                  </button>
                  <button
                    type="button"
                    onClick={handleSignOutAdmin}
                    className="px-3.5 py-2 rounded-xl border border-red-500/40 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-500/10 transition"
                  >
                    Lock Admin / Sign Out
                  </button>
                </div>
              </div>

              {statusBanner && (
                <div
                  className={`rounded-xl px-4 py-2.5 text-xs font-bold ${
                    statusBanner.kind === "err"
                      ? "border border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-300"
                      : statusBanner.kind === "ok"
                        ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "border border-[#C59B27]/40 bg-[#C59B27]/15 text-[#9A7418] dark:text-[#E5C158]"
                  }`}
                >
                  {statusBanner.text}
                </div>
              )}

              {/* 4 Studio Tabs */}
              <div
                className="flex flex-wrap gap-2 border-t pt-4"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                {(
                  [
                    { id: "order", label: "1. Order & Sequence" },
                    { id: "topics", label: "2. Topics & Descriptions CMS" },
                    { id: "graphics", label: "3. Graphics & Layout Controls" },
                    {
                      id: "vault",
                      label: `4. Paintings & Media Vault (${Object.keys(siteState.frames).length})`,
                    },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                      activeTab === t.id
                        ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] shadow-sm"
                        : "border border-[#C59B27]/30 opacity-80 hover:opacity-100"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </section>

            {/* TAB 1: ORDER & SEQUENCE */}
            {activeTab === "order" && (
              <section
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-subtle)",
                }}
                className="rounded-3xl border p-6 space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-serif font-bold">
                      Order &amp; Sequence (&ldquo;First to Last&rdquo; Manager)
                    </h2>
                    <p className="text-xs opacity-75">
                      Arrange exact card priority from first to last, pin highlights, or hide items.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        { id: "sangat", label: "Home / Sangat Feed" },
                        { id: "foundations", label: "Foundations Topics" },
                        { id: "matriarchs", label: "Sikh Women Profiles" },
                      ] as const
                    ).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setOrderPage(p.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                          orderPage === p.id
                            ? "border-[#C59B27] bg-[#C59B27]/15 text-[#9A7418] dark:text-[#E5C158]"
                            : "border-transparent opacity-75 hover:opacity-100"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {orderedItems.map((item, idx) => {
                    const isPinned = siteState.pinnedIds.includes(item.id);
                    const isHidden = siteState.archivedIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        style={{ borderColor: "var(--border-subtle)" }}
                        className={`rounded-2xl border px-4 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 ${
                          isHidden ? "opacity-55" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="shrink-0 w-7 h-7 rounded-lg bg-[#C59B27]/15 text-[#C59B27] text-xs font-extrabold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate">
                              {item.label}{" "}
                              {isPinned && (
                                <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-[#C59B27]/20 text-[#9A7418] dark:text-[#E5C158]">
                                  PINNED
                                </span>
                              )}
                              {isHidden && (
                                <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-500">
                                  HIDDEN
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] opacity-65 truncate">
                              ID: {item.id} {item.sub ? `• ${item.sub}` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveItem(idx, "first")}
                            className="px-2.5 py-1.5 rounded-lg border border-[#C59B27]/35 hover:border-[#C59B27]"
                          >
                            ⭐ Pin First
                          </button>
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveItem(idx, "up")}
                            className="px-2.5 py-1.5 rounded-lg border border-[#C59B27]/35 hover:border-[#C59B27] disabled:opacity-40"
                          >
                            ⬆ Move Up
                          </button>
                          <button
                            type="button"
                            disabled={idx === orderedItems.length - 1}
                            onClick={() => handleMoveItem(idx, "down")}
                            className="px-2.5 py-1.5 rounded-lg border border-[#C59B27]/35 hover:border-[#C59B27] disabled:opacity-40"
                          >
                            ⬇ Move Down
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveItem(idx, "last")}
                            className="px-2.5 py-1.5 rounded-lg border border-[#C59B27]/35 hover:border-[#C59B27]"
                          >
                            📥 Move Last
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleHideItem(item.id)}
                            className={`px-2.5 py-1.5 rounded-lg border ${
                              isHidden
                                ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                                : "border-red-500/40 text-red-600 dark:text-red-400"
                            }`}
                          >
                            {isHidden ? "👁️ Restore" : "👁️ Hide"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* TAB 2: TOPICS & DESCRIPTIONS CMS */}
            {activeTab === "topics" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* Create New Topic / Card */}
                <section
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="rounded-3xl border p-6 space-y-4"
                >
                  <div>
                    <h2 className="text-xl font-serif font-bold">
                      Create New Topic / Card
                    </h2>
                    <p className="text-xs opacity-75">
                      Add a new card or historical topic to any pillar page.
                    </p>
                  </div>

                  <form onSubmit={handleCreateCustomTopic} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold mb-1">Target Page</label>
                        <select
                          value={newTopicPage}
                          onChange={(e) => setNewTopicPage(e.target.value as PageKey)}
                          style={{
                            backgroundColor: "var(--bg-primary)",
                            borderColor: "var(--border-subtle)",
                          }}
                          className="w-full rounded-xl border px-3 py-2 text-sm"
                        >
                          <option value="sangat">Home / Sangat</option>
                          <option value="foundations">Foundations</option>
                          <option value="matriarchs">Sikh Women (Matriarchs)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Badge (optional)</label>
                        <input
                          type="text"
                          value={newTopicBadge}
                          onChange={(e) => setNewTopicBadge(e.target.value)}
                          placeholder="e.g. Puratan Archive"
                          style={{
                            backgroundColor: "var(--bg-primary)",
                            borderColor: "var(--border-subtle)",
                          }}
                          className="w-full rounded-xl border px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">Title *</label>
                      <input
                        type="text"
                        required
                        value={newTopicTitle}
                        onChange={(e) => setNewTopicTitle(e.target.value)}
                        placeholder="Topic or personality title"
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          borderColor: "var(--border-subtle)",
                        }}
                        className="w-full rounded-xl border px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold mb-1">Gurmukhi (optional)</label>
                        <input
                          type="text"
                          value={newTopicGurmukhi}
                          onChange={(e) => setNewTopicGurmukhi(e.target.value)}
                          placeholder="ਗੁਰਮੁਖੀ"
                          style={{
                            backgroundColor: "var(--bg-primary)",
                            borderColor: "var(--border-subtle)",
                          }}
                          className="w-full rounded-xl border px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Subtitle / Era</label>
                        <input
                          type="text"
                          value={newTopicSubtitle}
                          onChange={(e) => setNewTopicSubtitle(e.target.value)}
                          placeholder="e.g. 1699 • Anandpur Sahib"
                          style={{
                            backgroundColor: "var(--bg-primary)",
                            borderColor: "var(--border-subtle)",
                          }}
                          className="w-full rounded-xl border px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">Description *</label>
                      <textarea
                        required
                        rows={4}
                        value={newTopicDescription}
                        onChange={(e) => setNewTopicDescription(e.target.value)}
                        placeholder="Concise historical summary or essay..."
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          borderColor: "var(--border-subtle)",
                        }}
                        className="w-full rounded-xl border px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1">Primary Source / Citation</label>
                      <input
                        type="text"
                        value={newTopicSource}
                        onChange={(e) => setNewTopicSource(e.target.value)}
                        placeholder="e.g. Suraj Prakash / Bhai Gurdas Vaaran"
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          borderColor: "var(--border-subtle)",
                        }}
                        className="w-full rounded-xl border px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold">Topic Artwork (Optional)</label>
                      <EditableHeritageImage
                        imageKey={newTopicDraftKey}
                        defaultSrc=""
                        alt={newTopicTitle || "New topic artwork"}
                        defaultOrientation="natural"
                        allowUserEdit={true}
                        fallbackNode={
                          <div className="h-28 w-full rounded-xl border border-dashed border-[#C59B27]/40 flex items-center justify-center text-xs opacity-70">
                            Click &ldquo;⚙️ Upload / Frame Painting&rdquo; to attach artwork
                          </div>
                        }
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-extrabold uppercase tracking-wider"
                    >
                      + Publish Topic Globally
                    </button>
                  </form>
                </section>

                {/* Override Existing Topic / Card */}
                <section
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="rounded-3xl border p-6 space-y-4"
                >
                  <div>
                    <h2 className="text-xl font-serif font-bold">
                      Override Existing Topic / Card
                    </h2>
                    <p className="text-xs opacity-75">
                      Edit the title, subtitle, badge, or description of any existing item.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1">Section</label>
                      <select
                        value={editPage}
                        onChange={(e) => {
                          setEditPage(e.target.value as PageKey);
                          setSelectedTopicId("");
                        }}
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          borderColor: "var(--border-subtle)",
                        }}
                        className="w-full rounded-xl border px-3 py-2 text-sm"
                      >
                        <option value="foundations">Foundations</option>
                        <option value="matriarchs">Sikh Women (Matriarchs)</option>
                        <option value="sangat">Home / Sangat</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Select Item ID</label>
                      <select
                        value={selectedTopicId}
                        onChange={(e) => setSelectedTopicId(e.target.value)}
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          borderColor: "var(--border-subtle)",
                        }}
                        className="w-full rounded-xl border px-3 py-2 text-sm"
                      >
                        {editPageItems.map((it) => (
                          <option key={it.id} value={it.id}>
                            {it.label} ({it.id})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <form onSubmit={handleSaveTopicEdit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold mb-1">Override Title</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          borderColor: "var(--border-subtle)",
                        }}
                        className="w-full rounded-xl border px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold mb-1">Override Gurmukhi</label>
                        <input
                          type="text"
                          value={editGurmukhi}
                          onChange={(e) => setEditGurmukhi(e.target.value)}
                          style={{
                            backgroundColor: "var(--bg-primary)",
                            borderColor: "var(--border-subtle)",
                          }}
                          className="w-full rounded-xl border px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Override Badge</label>
                        <input
                          type="text"
                          value={editBadge}
                          onChange={(e) => setEditBadge(e.target.value)}
                          style={{
                            backgroundColor: "var(--bg-primary)",
                            borderColor: "var(--border-subtle)",
                          }}
                          className="w-full rounded-xl border px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Override Subtitle / Era</label>
                      <input
                        type="text"
                        value={editSubtitle}
                        onChange={(e) => setEditSubtitle(e.target.value)}
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          borderColor: "var(--border-subtle)",
                        }}
                        className="w-full rounded-xl border px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Override Description</label>
                      <textarea
                        rows={4}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          borderColor: "var(--border-subtle)",
                        }}
                        className="w-full rounded-xl border px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Override Source Citation</label>
                      <input
                        type="text"
                        value={editSource}
                        onChange={(e) => setEditSource(e.target.value)}
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          borderColor: "var(--border-subtle)",
                        }}
                        className="w-full rounded-xl border px-3 py-2 text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-extrabold uppercase tracking-wider"
                    >
                      Save Topic Override
                    </button>
                  </form>
                </section>
              </div>
            )}

            {/* TAB 3: GRAPHICS & LAYOUT CONTROLS */}
            {activeTab === "graphics" && (
              <section
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-subtle)",
                }}
                className="rounded-3xl border p-6 space-y-6"
              >
                <div>
                  <h2 className="text-xl font-serif font-bold">
                    Graphics &amp; Layout Controls
                  </h2>
                  <p className="text-xs opacity-75">
                    Configure global grid density, hero banner sizing, visual framing style, and primary banners.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* feedLayout */}
                  <div className="space-y-2">
                    <span className="block text-xs font-bold uppercase tracking-wider text-[#C59B27]">
                      Feed Layout
                    </span>
                    {(
                      [
                        { id: "grid-3", label: "3-Column Grid" },
                        { id: "grid-2", label: "2-Column Large Canvas" },
                        { id: "editorial", label: "Editorial Reading Stack" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          void postStudioUpdate(
                            {
                              layoutConfig: {
                                ...siteState.layoutConfig,
                                feedLayout: opt.id,
                              },
                            },
                            `✓ Feed layout set to ${opt.label}`
                          )
                        }
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-bold transition ${
                          siteState.layoutConfig.feedLayout === opt.id
                            ? "border-[#C59B27] bg-[#C59B27]/15 text-[#9A7418] dark:text-[#E5C158]"
                            : "border-[#C59B27]/25 opacity-80 hover:opacity-100"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* heroHeight */}
                  <div className="space-y-2">
                    <span className="block text-xs font-bold uppercase tracking-wider text-[#C59B27]">
                      Hero Height
                    </span>
                    {(
                      [
                        { id: "compact", label: "Compact" },
                        { id: "standard", label: "Standard" },
                        { id: "cinema", label: "Cinema Wide" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          void postStudioUpdate(
                            {
                              layoutConfig: {
                                ...siteState.layoutConfig,
                                heroHeight: opt.id,
                              },
                            },
                            `✓ Hero height set to ${opt.label}`
                          )
                        }
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-bold transition ${
                          siteState.layoutConfig.heroHeight === opt.id
                            ? "border-[#C59B27] bg-[#C59B27]/15 text-[#9A7418] dark:text-[#E5C158]"
                            : "border-[#C59B27]/25 opacity-80 hover:opacity-100"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* accentStyle */}
                  <div className="space-y-2">
                    <span className="block text-xs font-bold uppercase tracking-wider text-[#C59B27]">
                      Accent &amp; Frame Style
                    </span>
                    {(
                      [
                        { id: "classic-gold", label: "Classic Puratan Gold" },
                        { id: "minimal", label: "Minimal Clean" },
                        { id: "museum-frame", label: "Museum Frame" },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          void postStudioUpdate(
                            {
                              layoutConfig: {
                                ...siteState.layoutConfig,
                                accentStyle: opt.id,
                              },
                            },
                            `✓ Accent style set to ${opt.label}`
                          )
                        }
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-bold transition ${
                          siteState.layoutConfig.accentStyle === opt.id
                            ? "border-[#C59B27] bg-[#C59B27]/15 text-[#9A7418] dark:text-[#E5C158]"
                            : "border-[#C59B27]/25 opacity-80 hover:opacity-100"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Global Hero Banner Uploaders */}
                <div className="pt-4 border-t border-[#C59B27]/20 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-xs font-bold">
                      Home / Sangat Hero Banner (<code>sangat-hero-banner</code>)
                    </p>
                    <EditableHeritageImage
                      imageKey="sangat-hero-banner"
                      defaultSrc="/images/puratan-darbar.jpg"
                      alt="Home Hero Banner"
                      defaultOrientation="landscape"
                      allowUserEdit={true}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold">
                      Foundations Featured Banner (<code>foundations-slide-guru-nanak</code>)
                    </p>
                    <EditableHeritageImage
                      imageKey="foundations-slide-guru-nanak"
                      defaultSrc="https://commons.wikimedia.org/wiki/Special:FilePath/Painting%20of%20Guru%20Nanak%2C%20Mardana%2C%20and%20Bala.jpg?width=1200"
                      alt="Foundations Banner"
                      defaultOrientation="natural"
                      allowUserEdit={true}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* TAB 4: PAINTINGS & MEDIA VAULT */}
            {activeTab === "vault" && (
              <section
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-subtle)",
                }}
                className="rounded-3xl border p-6 space-y-5"
              >
                <div>
                  <h2 className="text-xl font-serif font-bold">
                    Paintings &amp; Media Vault
                  </h2>
                  <p className="text-xs opacity-75">
                    Every uploaded painting and framing override stored globally in <code>/api/site-frames</code>.
                  </p>
                </div>

                {Object.keys(siteState.frames).length === 0 ? (
                  <div className="rounded-2xl border border-[#C59B27]/25 p-8 text-center text-sm opacity-75">
                    No custom uploaded frames stored yet. Upload a painting on any card or in Tab 2/3 to populate the vault.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
                    {Object.entries(siteState.frames).map(([imageKey, frame]) => (
                      <div
                        key={imageKey}
                        style={{ borderColor: "var(--border-subtle)" }}
                        className="rounded-2xl border p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-extrabold truncate text-[#C59B27]">
                            {imageKey}
                          </span>
                          <span className="text-[10px] uppercase px-2 py-0.5 rounded-full border border-[#C59B27]/35">
                            {frame.orientation}
                          </span>
                        </div>

                        <EditableHeritageImage
                          imageKey={imageKey}
                          defaultSrc={frame.src}
                          alt={imageKey}
                          defaultOrientation={frame.orientation}
                          defaultFit={frame.fitMode}
                          allowUserEdit={true}
                        />

                        <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold">
                          {(["natural", "portrait", "landscape", "square"] as const).map(
                            (ori) => (
                              <button
                                key={ori}
                                type="button"
                                onClick={() => handleVaultOrientation(imageKey, frame, ori)}
                                className={`px-2 py-1 rounded-lg border capitalize ${
                                  frame.orientation === ori
                                    ? "border-[#C59B27] bg-[#C59B27]/15 text-[#9A7418] dark:text-[#E5C158]"
                                    : "border-[#C59B27]/25 opacity-75 hover:opacity-100"
                                }`}
                              >
                                {ori}
                              </button>
                            )
                          )}
                          <button
                            type="button"
                            onClick={() => handleVaultDelete(imageKey)}
                            className="ml-auto px-2 py-1 rounded-lg border border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
