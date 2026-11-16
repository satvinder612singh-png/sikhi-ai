"use client";

import React, { useEffect, useMemo, useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import {
  EditableHeritageImage,
  writeCmsCache,
  resolveCmsFontFamily,
  resolveCmsHeadingClass,
  resolveCmsBodyClass,
  resolveCmsGurmukhiClass,
  type CmsFontFamily,
  type CmsFontScale,
  type CmsLayoutConfig,
  type CmsTopicEdit,
  type CmsCustomTopic,
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

type AdminTab = "order" | "topics" | "graphics" | "kirtan" | "queue" | "vault";
type PageKey = "sangat" | "foundations" | "matriarchs";

interface KirtanTrackRecord {
  id: string;
  title: string;
  gurmukhi?: string;
  ragi: string;
  raag?: string;
  sourceUrl: string;
  duration?: string;
  imageUrl?: string;
  imageKey?: string;
  createdAt: string;
}

interface KirtanTrackEdit {
  title?: string;
  gurmukhi?: string;
  ragi?: string;
  raag?: string;
  sourceUrl?: string;
  imageUrl?: string;
  deleted?: boolean;
}

interface PendingSubmission {
  id: string;
  type: "post" | "kirtan" | "pdf";
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  image?: string;
  submittedBy: string;
  createdAt: string;
}

interface SectionLayoutEntry {
  page?: string;
  positionOrder?: number;
  titleAlign?: "left" | "center" | "right";
  widthMode?: "full" | "contained" | "compact";
  customTitle?: string;
  customSubtitle?: string;
  hidden?: boolean;
}

type TopicEdit = CmsTopicEdit;
type CustomTopic = CmsCustomTopic;
type LayoutConfig = CmsLayoutConfig;

const COLOR_PRESETS: {
  id: string;
  label: string;
  patch: Partial<LayoutConfig>;
}[] = [
  {
    id: "midnight-darbar",
    label: "Midnight Darbar",
    patch: {
      pageBgColor: "#0B101B",
      cardBgColor: "#141B2D",
      headingTextColor: "#FAF7F0",
      bodyTextColor: "#D6D3CD",
      accentColor: "#E5C158",
    },
  },
  {
    id: "sunlit-ivory",
    label: "Sunlit Ivory",
    patch: {
      pageBgColor: "#FAF7F0",
      cardBgColor: "#FFFFFF",
      headingTextColor: "#18181B",
      bodyTextColor: "#3F3F46",
      accentColor: "#9A7418",
    },
  },
  {
    id: "puratan-parchment",
    label: "Puratan Parchment",
    patch: {
      pageBgColor: "#F2E9D8",
      cardBgColor: "#FBF6EC",
      headingTextColor: "#2C1D0C",
      bodyTextColor: "#4A3621",
      accentColor: "#B45309",
    },
  },
  {
    id: "royal-maroon",
    label: "Royal Maroon",
    patch: {
      pageBgColor: "#240B14",
      cardBgColor: "#34121E",
      headingTextColor: "#FAF7F0",
      bodyTextColor: "#E7DCE0",
      accentColor: "#E5C158",
    },
  },
  {
    id: "reset-default",
    label: "Reset Default",
    patch: {
      pageBgColor: "",
      cardBgColor: "",
      headingTextColor: "",
      bodyTextColor: "",
      accentColor: "",
    },
  },
];

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
  kirtanTracks: KirtanTrackRecord[];
  kirtanEdits: Record<string, KirtanTrackEdit>;
  pendingSubmissions: PendingSubmission[];
  sectionLayoutMap: Record<string, SectionLayoutEntry>;
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

const SECTION_LOCATOR_IDS: { id: string; label: string }[] = [
  { id: "granths-kirtan-hub", label: "Granths & Kirtan Hub" },
  { id: "granths-shabad-list", label: "Granths Shabad Playlist" },
  { id: "granths-pothi-library", label: "Granths Pothi & PDF Library" },
  { id: "sangat-hero", label: "Home / Sangat Hero" },
  { id: "foundations-deck", label: "Foundations Slide Deck" },
  { id: "matriarchs-archive", label: "Sikh Women Archive" },
];

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
  kirtanTracks: [],
  kirtanEdits: {},
  pendingSubmissions: [],
  sectionLayoutMap: {},
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
  const [newTopicBgColor, setNewTopicBgColor] = useState("");
  const [newTopicTextColor, setNewTopicTextColor] = useState("");
  const [newTopicBorderColor, setNewTopicBorderColor] = useState("");
  const [newTopicFontScale, setNewTopicFontScale] = useState<CmsFontScale>("md");
  const [newTopicDraftKey] = useState(() => `custom-topic-${Date.now()}`);

  const [editPage, setEditPage] = useState<PageKey>("foundations");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [editTitle, setEditTitle] = useState("");
  const [editGurmukhi, setEditGurmukhi] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editBadge, setEditBadge] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSource, setEditSource] = useState("");
  const [editBgColor, setEditBgColor] = useState("");
  const [editTextColor, setEditTextColor] = useState("");
  const [editBorderColor, setEditBorderColor] = useState("");
  const [editFontScale, setEditFontScale] = useState<CmsFontScale>("md");

  // Tab 5: Kirtan & 5TB Drive Manager state
  const [newShabadTitle, setNewShabadTitle] = useState("");
  const [newShabadGurmukhi, setNewShabadGurmukhi] = useState("");
  const [newShabadRagi, setNewShabadRagi] = useState("");
  const [newShabadRaag, setNewShabadRaag] = useState("");
  const [newShabadUrl, setNewShabadUrl] = useState("");
  const [newShabadDuration, setNewShabadDuration] = useState("");
  const [newShabadArtKey, setNewShabadArtKey] = useState(() => `kirtan-art-${Date.now()}`);
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [trackDraftTitle, setTrackDraftTitle] = useState("");
  const [trackDraftRagi, setTrackDraftRagi] = useState("");
  const [trackDraftRaag, setTrackDraftRaag] = useState("");
  const [trackDraftUrl, setTrackDraftUrl] = useState("");

  // Section Title Alignment & Locator state
  const [selectedSectionId, setSelectedSectionId] = useState("granths-kirtan-hub");
  const [secAlign, setSecAlign] = useState<"left" | "center" | "right">("left");
  const [secWidth, setSecWidth] = useState<"full" | "contained" | "compact">("full");
  const [secOrderNum, setSecOrderNum] = useState<number>(1);
  const [secCustomTitle, setSecCustomTitle] = useState("");
  const [secCustomSubtitle, setSecCustomSubtitle] = useState("");
  const [secHidden, setSecHidden] = useState(false);

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
          kirtanTracks: Array.isArray(data.kirtanTracks) ? data.kirtanTracks : [],
          kirtanEdits: data.kirtanEdits || {},
          pendingSubmissions: Array.isArray(data.pendingSubmissions)
            ? data.pendingSubmissions
            : [],
          sectionLayoutMap: data.sectionLayoutMap || {},
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
          "x-admin-token": getToken(),
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || `Save failed (${res.status})`);
      }
      writeCmsCache(data);
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
        kirtanTracks: data.kirtanTracks || prev.kirtanTracks,
        kirtanEdits: data.kirtanEdits || prev.kirtanEdits,
        pendingSubmissions: data.pendingSubmissions || prev.pendingSubmissions,
        sectionLayoutMap: data.sectionLayoutMap || prev.sectionLayoutMap,
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
    setEditBgColor(existing.bgColor ?? ct?.bgColor ?? "");
    setEditTextColor(existing.textColor ?? ct?.textColor ?? "");
    setEditBorderColor(existing.borderColor ?? ct?.borderColor ?? "");
    setEditFontScale(existing.fontScale ?? ct?.fontScale ?? "md");
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
      bgColor: newTopicBgColor.trim() || undefined,
      textColor: newTopicTextColor.trim() || undefined,
      borderColor: newTopicBorderColor.trim() || undefined,
      fontScale: newTopicFontScale,
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
    setNewTopicBgColor("");
    setNewTopicTextColor("");
    setNewTopicBorderColor("");
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
            bgColor: editBgColor.trim() || undefined,
            textColor: editTextColor.trim() || undefined,
            borderColor: editBorderColor.trim() || undefined,
            fontScale: editFontScale,
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

  useEffect(() => {
    const entry = siteState.sectionLayoutMap?.[selectedSectionId] || {};
    setSecAlign(entry.titleAlign || "left");
    setSecWidth(entry.widthMode || "full");
    setSecOrderNum(typeof entry.positionOrder === "number" ? entry.positionOrder : 1);
    setSecCustomTitle(entry.customTitle || "");
    setSecCustomSubtitle(entry.customSubtitle || "");
    setSecHidden(Boolean(entry.hidden));
  }, [selectedSectionId, siteState.sectionLayoutMap]);

  const handleSaveSectionLocator = async (e: React.FormEvent) => {
    e.preventDefault();
    await postStudioUpdate(
      {
        sectionLayoutMap: {
          [selectedSectionId]: {
            titleAlign: secAlign,
            widthMode: secWidth,
            positionOrder: secOrderNum,
            customTitle: secCustomTitle.trim() || undefined,
            customSubtitle: secCustomSubtitle.trim() || undefined,
            hidden: secHidden,
          },
        },
      },
      `✓ Saved layout & alignment for "${selectedSectionId}"`
    );
  };

  const handleAddShabadTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShabadTitle.trim() || !newShabadUrl.trim()) return;
    const id = `kirtan-${Date.now()}`;
    const uploadedImg = siteState.frames?.[newShabadArtKey]?.src || undefined;
    const created: KirtanTrackRecord = {
      id,
      title: newShabadTitle.trim(),
      gurmukhi: newShabadGurmukhi.trim() || undefined,
      ragi: newShabadRagi.trim() || "Puratan Hazoori Ragi",
      raag: newShabadRaag.trim() || "Gurmat Kirtan",
      sourceUrl: newShabadUrl.trim(),
      duration: newShabadDuration.trim() || undefined,
      imageUrl: uploadedImg,
      imageKey: uploadedImg ? newShabadArtKey : undefined,
      createdAt: new Date().toISOString(),
    };
    await postStudioUpdate(
      { kirtanTracks: [created, ...(siteState.kirtanTracks || [])] },
      `✓ Published Shabad "${created.title}" to Granths & Kirtan`
    );
    setNewShabadTitle("");
    setNewShabadGurmukhi("");
    setNewShabadRagi("");
    setNewShabadRaag("");
    setNewShabadUrl("");
    setNewShabadDuration("");
    setNewShabadArtKey(`kirtan-art-${Date.now()}`);
  };

  const handleSaveTrackEdit = async (trackId: string) => {
    const isCustom = siteState.kirtanTracks.some((t) => t.id === trackId);
    if (isCustom) {
      const nextTracks = siteState.kirtanTracks.map((t) =>
        t.id === trackId
          ? {
              ...t,
              title: trackDraftTitle.trim() || t.title,
              ragi: trackDraftRagi.trim() || t.ragi,
              raag: trackDraftRaag.trim() || t.raag,
              sourceUrl: trackDraftUrl.trim() || t.sourceUrl,
            }
          : t
      );
      await postStudioUpdate(
        { kirtanTracks: nextTracks },
        `✓ Updated track "${trackDraftTitle || trackId}"`
      );
    } else {
      await postStudioUpdate(
        {
          kirtanEdits: {
            [trackId]: {
              title: trackDraftTitle.trim() || undefined,
              ragi: trackDraftRagi.trim() || undefined,
              raag: trackDraftRaag.trim() || undefined,
              sourceUrl: trackDraftUrl.trim() || undefined,
            },
          },
        },
        `✓ Saved track override for "${trackId}"`
      );
    }
    setEditingTrackId(null);
  };

  const handleDeleteTrack = async (trackId: string) => {
    const isCustom = siteState.kirtanTracks.some((t) => t.id === trackId);
    if (isCustom) {
      await postStudioUpdate(
        { kirtanTracks: siteState.kirtanTracks.filter((t) => t.id !== trackId) },
        `✓ Deleted track "${trackId}"`
      );
    } else {
      await postStudioUpdate(
        { kirtanEdits: { [trackId]: { deleted: true } } },
        `✓ Hid track "${trackId}"`
      );
    }
  };

  const handleApproveSubmission = async (sub: PendingSubmission) => {
    const remaining = (siteState.pendingSubmissions || []).filter((s) => s.id !== sub.id);
    if (sub.type === "kirtan") {
      const track: KirtanTrackRecord = {
        id: `kirtan-${Date.now()}`,
        title: sub.title,
        ragi: sub.subtitle || sub.submittedBy || "Community Kirtan",
        raag: "Approved Community Recording",
        sourceUrl: sub.url,
        imageUrl: sub.image || undefined,
        createdAt: new Date().toISOString(),
      };
      await postStudioUpdate(
        {
          pendingSubmissions: remaining,
          kirtanTracks: [track, ...(siteState.kirtanTracks || [])],
        },
        `✓ Approved & published Kirtan "${sub.title}"`
      );
    } else {
      const newLink = {
        id: `link-${Date.now()}`,
        url: sub.url,
        title: sub.title,
        publisher: sub.subtitle || sub.submittedBy || "Approved Source",
        summary: sub.description || sub.title,
        category: "essays",
        curatedBy: sub.submittedBy || "Sangat Member",
        createdAt: "Approved",
        imageUrl: sub.image || null,
        isUserCreated: true,
      };
      await postStudioUpdate(
        {
          pendingSubmissions: remaining,
          customPosts: {
            links: [newLink],
          },
        },
        `✓ Approved & published "${sub.title}"`
      );
    }
  };

  const handleRejectSubmission = async (subId: string) => {
    const remaining = (siteState.pendingSubmissions || []).filter((s) => s.id !== subId);
    await postStudioUpdate(
      { pendingSubmissions: remaining },
      "✓ Submission rejected & removed from queue"
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
                    { id: "graphics", label: "3. Graphics, Typography & Colors" },
                    {
                      id: "kirtan",
                      label: `4. Kirtan & 5TB Drive (${(siteState.kirtanTracks || []).length})`,
                    },
                    {
                      id: "queue",
                      label: `5. Approval Queue (${(siteState.pendingSubmissions || []).length})`,
                    },
                    {
                      id: "vault",
                      label: `6. Paintings Vault (${Object.keys(siteState.frames).length})`,
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

                    {/* Per-Card Colors & Text Size */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Card BG Color</label>
                        <input
                          type="text"
                          value={newTopicBgColor}
                          onChange={(e) => setNewTopicBgColor(e.target.value)}
                          placeholder="#141B2D"
                          style={{
                            backgroundColor: "var(--bg-primary)",
                            borderColor: "var(--border-subtle)",
                          }}
                          className="w-full rounded-lg border px-2.5 py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Card Text Color</label>
                        <input
                          type="text"
                          value={newTopicTextColor}
                          onChange={(e) => setNewTopicTextColor(e.target.value)}
                          placeholder="#FAF7F0"
                          style={{
                            backgroundColor: "var(--bg-primary)",
                            borderColor: "var(--border-subtle)",
                          }}
                          className="w-full rounded-lg border px-2.5 py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Border Color</label>
                        <input
                          type="text"
                          value={newTopicBorderColor}
                          onChange={(e) => setNewTopicBorderColor(e.target.value)}
                          placeholder="#C59B27"
                          style={{
                            backgroundColor: "var(--bg-primary)",
                            borderColor: "var(--border-subtle)",
                          }}
                          className="w-full rounded-lg border px-2.5 py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Text Size</label>
                        <select
                          value={newTopicFontScale}
                          onChange={(e) => setNewTopicFontScale(e.target.value as CmsFontScale)}
                          style={{
                            backgroundColor: "var(--bg-primary)",
                            borderColor: "var(--border-subtle)",
                          }}
                          className="w-full rounded-lg border px-2 py-1.5 text-xs"
                        >
                          <option value="sm">SM</option>
                          <option value="md">MD</option>
                          <option value="lg">LG</option>
                          <option value="xl">XL</option>
                        </select>
                      </div>
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

                    {/* Per-Card Colors & Text Size */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Card BG Color</label>
                        <input
                          type="text"
                          value={editBgColor}
                          onChange={(e) => setEditBgColor(e.target.value)}
                          placeholder="#141B2D"
                          style={{
                            backgroundColor: "var(--bg-primary)",
                            borderColor: "var(--border-subtle)",
                          }}
                          className="w-full rounded-lg border px-2.5 py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Card Text Color</label>
                        <input
                          type="text"
                          value={editTextColor}
                          onChange={(e) => setEditTextColor(e.target.value)}
                          placeholder="#FAF7F0"
                          style={{
                            backgroundColor: "var(--bg-primary)",
                            borderColor: "var(--border-subtle)",
                          }}
                          className="w-full rounded-lg border px-2.5 py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Border Color</label>
                        <input
                          type="text"
                          value={editBorderColor}
                          onChange={(e) => setEditBorderColor(e.target.value)}
                          placeholder="#C59B27"
                          style={{
                            backgroundColor: "var(--bg-primary)",
                            borderColor: "var(--border-subtle)",
                          }}
                          className="w-full rounded-lg border px-2.5 py-1.5 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold mb-1">Text Size</label>
                        <select
                          value={editFontScale}
                          onChange={(e) => setEditFontScale(e.target.value as CmsFontScale)}
                          style={{
                            backgroundColor: "var(--bg-primary)",
                            borderColor: "var(--border-subtle)",
                          }}
                          className="w-full rounded-lg border px-2 py-1.5 text-xs"
                        >
                          <option value="sm">SM</option>
                          <option value="md">MD</option>
                          <option value="lg">LG</option>
                          <option value="xl">XL</option>
                        </select>
                      </div>
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

                {/* Typography: Font Family & Text Size Controls */}
                <div className="pt-4 border-t border-[#C59B27]/20 space-y-5">
                  <div>
                    <h3 className="text-base font-serif font-bold">
                      Typography &amp; Script Scale
                    </h3>
                    <p className="text-xs opacity-75">
                      Control global fonts and proportional sizing across headings, English prose, and Gurmukhi.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <span className="block text-xs font-bold uppercase tracking-wider text-[#C59B27]">
                        Font Family
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(
                          [
                            { id: "serif-heritage", label: "Heritage Serif" },
                            { id: "sans-modern", label: "Modern Editorial Sans" },
                            { id: "manuscript", label: "Puratan Manuscript" },
                            { id: "mono-clean", label: "Clean Monospace" },
                          ] as { id: CmsFontFamily; label: string }[]
                        ).map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              void postStudioUpdate(
                                {
                                  layoutConfig: {
                                    ...siteState.layoutConfig,
                                    fontFamily: opt.id,
                                  },
                                },
                                `✓ Font family set to ${opt.label}`
                              )
                            }
                            style={{ fontFamily: resolveCmsFontFamily(opt.id) }}
                            className={`px-3.5 py-2.5 rounded-xl border text-left text-xs font-bold transition ${
                              (siteState.layoutConfig.fontFamily || "serif-heritage") === opt.id
                                ? "border-[#C59B27] bg-[#C59B27]/15 text-[#9A7418] dark:text-[#E5C158]"
                                : "border-[#C59B27]/25 opacity-80 hover:opacity-100"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {(
                        [
                          { key: "headingScale", label: "Headings Size" },
                          { key: "bodyScale", label: "Body Text Size" },
                          { key: "gurmukhiScale", label: "Gurmukhi Script Size" },
                        ] as const
                      ).map((row) => (
                        <div key={row.key} className="flex items-center justify-between gap-3">
                          <span className="text-xs font-bold">{row.label}</span>
                          <div className="flex gap-1.5">
                            {(["sm", "md", "lg", "xl"] as const).map((sz) => (
                              <button
                                key={sz}
                                type="button"
                                onClick={() =>
                                  void postStudioUpdate(
                                    {
                                      layoutConfig: {
                                        ...siteState.layoutConfig,
                                        [row.key]: sz,
                                      },
                                    },
                                    `✓ ${row.label} set to ${sz.toUpperCase()}`
                                  )
                                }
                                className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold uppercase ${
                                  (siteState.layoutConfig[row.key] || "md") === sz
                                    ? "border-[#C59B27] bg-[#C59B27]/15 text-[#9A7418] dark:text-[#E5C158]"
                                    : "border-[#C59B27]/25 opacity-75 hover:opacity-100"
                                }`}
                              >
                                {sz}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Color Palette Presets, Color Pickers & Live Preview */}
                <div className="pt-4 border-t border-[#C59B27]/20 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-serif font-bold">
                        Global Color Palette &amp; Presets
                      </h3>
                      <p className="text-xs opacity-75">
                        Apply a curated palette preset or tune individual page, card, text, and accent hex colors.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {COLOR_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() =>
                            void postStudioUpdate(
                              {
                                layoutConfig: {
                                  ...siteState.layoutConfig,
                                  ...preset.patch,
                                },
                              },
                              `✓ Applied "${preset.label}" color palette`
                            )
                          }
                          className="px-3 py-1.5 rounded-xl border border-[#C59B27]/35 text-xs font-bold hover:border-[#C59B27] transition"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {(
                      [
                        { key: "pageBgColor", label: "Page Background", fallback: "#0B101B" },
                        { key: "cardBgColor", label: "Card Background", fallback: "#141B2D" },
                        { key: "headingTextColor", label: "Heading Text", fallback: "#FAF7F0" },
                        { key: "bodyTextColor", label: "Body Text", fallback: "#D6D3CD" },
                        { key: "accentColor", label: "Gold / Border Accent", fallback: "#C59B27" },
                      ] as const
                    ).map((field) => {
                      const val = siteState.layoutConfig[field.key] || "";
                      return (
                        <div
                          key={field.key}
                          style={{ borderColor: "var(--border-subtle)" }}
                          className="rounded-2xl border p-3 space-y-2"
                        >
                          <label className="block text-[11px] font-bold">{field.label}</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={/^#[0-9a-f]{6}$/i.test(val) ? val : field.fallback}
                              onChange={(e) =>
                                setSiteState((prev) => ({
                                  ...prev,
                                  layoutConfig: {
                                    ...prev.layoutConfig,
                                    [field.key]: e.target.value,
                                  },
                                }))
                              }
                              className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent p-0"
                            />
                            <input
                              type="text"
                              value={val}
                              placeholder={field.fallback}
                              onChange={(e) =>
                                setSiteState((prev) => ({
                                  ...prev,
                                  layoutConfig: {
                                    ...prev.layoutConfig,
                                    [field.key]: e.target.value,
                                  },
                                }))
                              }
                              style={{
                                backgroundColor: "var(--bg-primary)",
                                borderColor: "var(--border-subtle)",
                              }}
                              className="w-full min-w-0 rounded-lg border px-2 py-1 text-xs"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        void postStudioUpdate(
                          { layoutConfig: siteState.layoutConfig },
                          "✓ Saved global color & typography palette"
                        )
                      }
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-extrabold uppercase tracking-wider"
                    >
                      Save Colors &amp; Typography
                    </button>
                  </div>

                  {/* Live Preview Card */}
                  <div
                    style={{
                      backgroundColor: siteState.layoutConfig.pageBgColor || "var(--bg-primary)",
                      fontFamily: resolveCmsFontFamily(siteState.layoutConfig.fontFamily),
                      borderColor: siteState.layoutConfig.accentColor || "var(--border-subtle)",
                    }}
                    className="rounded-2xl border p-5 space-y-3"
                  >
                    <p
                      style={{ color: siteState.layoutConfig.accentColor || "#C59B27" }}
                      className="text-[11px] font-bold uppercase tracking-widest"
                    >
                      LIVE PREVIEW CARD
                    </p>
                    <div
                      style={{
                        backgroundColor: siteState.layoutConfig.cardBgColor || "var(--bg-surface)",
                        borderColor: siteState.layoutConfig.accentColor || "rgba(197,155,39,0.4)",
                      }}
                      className="rounded-2xl border p-5 space-y-2"
                    >
                      <p
                        style={{ color: siteState.layoutConfig.accentColor || "#C59B27" }}
                        className={`font-semibold ${resolveCmsGurmukhiClass(siteState.layoutConfig.gurmukhiScale)}`}
                      >
                        ੴ ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ ॥
                      </p>
                      <h4
                        style={{ color: siteState.layoutConfig.headingTextColor || "var(--text-primary)" }}
                        className={`font-bold ${resolveCmsHeadingClass(siteState.layoutConfig.headingScale)}`}
                      >
                        SikhStack &amp; Heritage Typography Preview
                      </h4>
                      <p
                        style={{ color: siteState.layoutConfig.bodyTextColor || "var(--theme-text-muted)" }}
                        className={`leading-relaxed ${resolveCmsBodyClass(siteState.layoutConfig.bodyScale)}`}
                      >
                        This live card reflects your active font family, heading/body/Gurmukhi sizes, and custom color palette.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section Title Alignment & Locator Controls */}
                <form
                  onSubmit={handleSaveSectionLocator}
                  className="pt-4 border-t border-[#C59B27]/20 space-y-4"
                >
                  <div>
                    <h3 className="text-base font-serif font-bold">
                      Section Title Alignment &amp; Locator
                    </h3>
                    <p className="text-xs opacity-75">
                      Control title alignment, container width, custom headers, and section visibility across pages.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold mb-1">Target Section</label>
                      <select
                        value={selectedSectionId}
                        onChange={(e) => setSelectedSectionId(e.target.value)}
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          borderColor: "var(--border-subtle)",
                        }}
                        className="w-full rounded-xl border px-3 py-2 text-xs font-semibold"
                      >
                        {SECTION_LOCATOR_IDS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold mb-1">Title Alignment</label>
                      <div className="flex gap-1.5">
                        {(["left", "center", "right"] as const).map((al) => (
                          <button
                            key={al}
                            type="button"
                            onClick={() => setSecAlign(al)}
                            className={`flex-1 py-2 rounded-lg border text-[11px] font-bold capitalize ${
                              secAlign === al
                                ? "border-[#C59B27] bg-[#C59B27]/15 text-[#9A7418] dark:text-[#E5C158]"
                                : "border-[#C59B27]/25 opacity-75"
                            }`}
                          >
                            {al}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold mb-1">Width Mode</label>
                      <select
                        value={secWidth}
                        onChange={(e) =>
                          setSecWidth(e.target.value as "full" | "contained" | "compact")
                        }
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          borderColor: "var(--border-subtle)",
                        }}
                        className="w-full rounded-xl border px-3 py-2 text-xs font-semibold"
                      >
                        <option value="full">Full Width</option>
                        <option value="contained">Contained</option>
                        <option value="compact">Compact</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold mb-1">Position Order</label>
                      <input
                        type="number"
                        value={secOrderNum}
                        onChange={(e) => setSecOrderNum(Number(e.target.value))}
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          borderColor: "var(--border-subtle)",
                        }}
                        className="w-full rounded-xl border px-3 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold mb-1">
                        Custom Section Title (Optional)
                      </label>
                      <input
                        type="text"
                        value={secCustomTitle}
                        onChange={(e) => setSecCustomTitle(e.target.value)}
                        placeholder="Override default heading..."
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          borderColor: "var(--border-subtle)",
                        }}
                        className="w-full rounded-xl border px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold mb-1">
                        Custom Subtitle (Optional)
                      </label>
                      <input
                        type="text"
                        value={secCustomSubtitle}
                        onChange={(e) => setSecCustomSubtitle(e.target.value)}
                        placeholder="Override default subtitle..."
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          borderColor: "var(--border-subtle)",
                        }}
                        className="w-full rounded-xl border px-3 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={secHidden}
                        onChange={(e) => setSecHidden(e.target.checked)}
                        className="accent-[#C59B27]"
                      />
                      Hide this section from public view
                    </label>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-extrabold uppercase tracking-wider"
                    >
                      Save Section Alignment &amp; Locator
                    </button>
                  </div>
                </form>

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

            {/* TAB 4: KIRTAN & 5TB DRIVE MANAGER */}
            {activeTab === "kirtan" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <section
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="rounded-3xl border p-6 space-y-4"
                >
                  <div>
                    <h2 className="text-xl font-serif font-bold">
                      Add New Shabad / Kirtan Track
                    </h2>
                    <p className="text-xs opacity-75">
                      Paste any 5TB Google Drive share link or direct MP3 URL. Instant range-streaming via <code>/api/media-stream</code> uses zero Supabase storage.
                    </p>
                  </div>

                  <form onSubmit={handleAddShabadTrack} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold mb-1">
                        Google Drive Share Link or MP3 URL *
                      </label>
                      <input
                        type="url"
                        required
                        value={newShabadUrl}
                        onChange={(e) => setNewShabadUrl(e.target.value)}
                        placeholder="https://drive.google.com/file/d/.../view"
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          borderColor: "var(--border-subtle)",
                        }}
                        className="w-full rounded-xl border px-3 py-2 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold mb-1">Shabad Name *</label>
                        <input
                          type="text"
                          required
                          value={newShabadTitle}
                          onChange={(e) => setNewShabadTitle(e.target.value)}
                          placeholder="e.g. Asa Di Vaar — Pauri 1"
                          style={{
                            backgroundColor: "var(--bg-primary)",
                            borderColor: "var(--border-subtle)",
                          }}
                          className="w-full rounded-xl border px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">
                          Gurmukhi Title (optional)
                        </label>
                        <input
                          type="text"
                          value={newShabadGurmukhi}
                          onChange={(e) => setNewShabadGurmukhi(e.target.value)}
                          placeholder="ਆਸਾ ਕੀ ਵਾਰ"
                          style={{
                            backgroundColor: "var(--bg-primary)",
                            borderColor: "var(--border-subtle)",
                          }}
                          className="w-full rounded-xl border px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold mb-1">Ragi / Jatha</label>
                        <input
                          type="text"
                          value={newShabadRagi}
                          onChange={(e) => setNewShabadRagi(e.target.value)}
                          placeholder="Bhai Avtar Singh Ji"
                          style={{
                            backgroundColor: "var(--bg-primary)",
                            borderColor: "var(--border-subtle)",
                          }}
                          className="w-full rounded-xl border px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Raag</label>
                        <input
                          type="text"
                          value={newShabadRaag}
                          onChange={(e) => setNewShabadRaag(e.target.value)}
                          placeholder="Raag Asa"
                          style={{
                            backgroundColor: "var(--bg-primary)",
                            borderColor: "var(--border-subtle)",
                          }}
                          className="w-full rounded-xl border px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold mb-1">Duration</label>
                        <input
                          type="text"
                          value={newShabadDuration}
                          onChange={(e) => setNewShabadDuration(e.target.value)}
                          placeholder="14:20"
                          style={{
                            backgroundColor: "var(--bg-primary)",
                            borderColor: "var(--border-subtle)",
                          }}
                          className="w-full rounded-xl border px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold">
                        Optional Artwork / Picture for this Shabad (leave blank for clean text-only card)
                      </label>
                      <EditableHeritageImage
                        imageKey={newShabadArtKey}
                        defaultSrc=""
                        alt={newShabadTitle || "Shabad artwork"}
                        defaultOrientation="natural"
                        allowUserEdit={true}
                        fallbackNode={
                          <div className="h-24 w-full rounded-xl border border-dashed border-[#C59B27]/40 flex items-center justify-center text-xs opacity-70">
                            Optional: Click &ldquo;⚙️ Upload / Frame Painting&rdquo;
                          </div>
                        }
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-extrabold uppercase tracking-wider"
                    >
                      + Publish Shabad to Granths &amp; Kirtan
                    </button>
                  </form>
                </section>

                <section
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="rounded-3xl border p-6 space-y-4"
                >
                  <div>
                    <h2 className="text-xl font-serif font-bold">
                      Manage Existing Shabads
                    </h2>
                    <p className="text-xs opacity-75">
                      Rename Shabads, update Ragi/Raag, swap Google Drive links, attach/remove artwork, or delete.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      ...(siteState.kirtanTracks || []),
                      {
                        id: "live-harmandir-sahib-amritsar",
                        title:
                          siteState.kirtanEdits?.["live-harmandir-sahib-amritsar"]?.title ||
                          "Sri Harmandir Sahib (Darbar Sahib) Live 24/7 Stream",
                        ragi:
                          siteState.kirtanEdits?.["live-harmandir-sahib-amritsar"]?.ragi ||
                          "Hazoori Ragi Jathas • SGPC",
                        raag:
                          siteState.kirtanEdits?.["live-harmandir-sahib-amritsar"]?.raag ||
                          "Live 24/7 Kirtan",
                        sourceUrl:
                          siteState.kirtanEdits?.["live-harmandir-sahib-amritsar"]?.sourceUrl ||
                          "https://live.sgpc.net:8443/;nocache=1",
                      },
                    ].map((tr) => {
                      const isEditingTrack = editingTrackId === tr.id;
                      const isDeleted = siteState.kirtanEdits?.[tr.id]?.deleted;
                      if (isDeleted) return null;
                      return (
                        <div
                          key={tr.id}
                          style={{ borderColor: "var(--border-subtle)" }}
                          className="rounded-2xl border p-4 space-y-3"
                        >
                          {isEditingTrack ? (
                            <div className="space-y-2.5">
                              <input
                                type="text"
                                value={trackDraftTitle}
                                onChange={(e) => setTrackDraftTitle(e.target.value)}
                                placeholder="Shabad Title"
                                style={{
                                  backgroundColor: "var(--bg-primary)",
                                  borderColor: "var(--border-subtle)",
                                }}
                                className="w-full rounded-lg border px-2.5 py-1.5 text-xs"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={trackDraftRagi}
                                  onChange={(e) => setTrackDraftRagi(e.target.value)}
                                  placeholder="Ragi"
                                  style={{
                                    backgroundColor: "var(--bg-primary)",
                                    borderColor: "var(--border-subtle)",
                                  }}
                                  className="w-full rounded-lg border px-2.5 py-1.5 text-xs"
                                />
                                <input
                                  type="text"
                                  value={trackDraftRaag}
                                  onChange={(e) => setTrackDraftRaag(e.target.value)}
                                  placeholder="Raag"
                                  style={{
                                    backgroundColor: "var(--bg-primary)",
                                    borderColor: "var(--border-subtle)",
                                  }}
                                  className="w-full rounded-lg border px-2.5 py-1.5 text-xs"
                                />
                              </div>
                              <input
                                type="url"
                                value={trackDraftUrl}
                                onChange={(e) => setTrackDraftUrl(e.target.value)}
                                placeholder="Google Drive / MP3 URL"
                                style={{
                                  backgroundColor: "var(--bg-primary)",
                                  borderColor: "var(--border-subtle)",
                                }}
                                className="w-full rounded-lg border px-2.5 py-1.5 text-xs"
                              />
                              <EditableHeritageImage
                                imageKey={
                                  ("imageKey" in tr && tr.imageKey) || `kirtan-art-${tr.id}`
                                }
                                defaultSrc={("imageUrl" in tr && tr.imageUrl) || ""}
                                alt={tr.title}
                                defaultOrientation="natural"
                                allowUserEdit={true}
                                fallbackNode={
                                  <div className="h-20 w-full rounded-lg border border-dashed border-[#C59B27]/40 flex items-center justify-center text-[11px] opacity-70">
                                    Optional Picture
                                  </div>
                                }
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => void handleSaveTrackEdit(tr.id)}
                                  className="px-3 py-1.5 rounded-lg bg-[#C59B27] text-[#18181B] text-xs font-bold"
                                >
                                  Save Changes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingTrackId(null)}
                                  className="px-3 py-1.5 rounded-lg border text-xs font-bold"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-bold truncate">{tr.title}</p>
                                <p className="text-[11px] opacity-75 truncate">
                                  {tr.ragi} • {tr.raag || "Kirtan"}
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingTrackId(tr.id);
                                    setTrackDraftTitle(tr.title);
                                    setTrackDraftRagi(tr.ragi);
                                    setTrackDraftRaag(tr.raag || "");
                                    setTrackDraftUrl(tr.sourceUrl);
                                  }}
                                  className="px-2.5 py-1 rounded-lg border border-[#C59B27]/40 text-xs font-bold"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleDeleteTrack(tr.id)}
                                  className="px-2.5 py-1 rounded-lg border border-red-500/40 text-red-600 dark:text-red-400 text-xs font-bold"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>
            )}

            {/* TAB 5: APPROVAL QUEUE */}
            {activeTab === "queue" && (
              <section
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-subtle)",
                }}
                className="rounded-3xl border p-6 space-y-5"
              >
                <div>
                  <h2 className="text-xl font-serif font-bold">
                    Community Approval Queue
                  </h2>
                  <p className="text-xs opacity-75">
                    Review Kirtan Shabads, PDFs, and curated resources submitted by the Sangat.
                  </p>
                </div>

                {(siteState.pendingSubmissions || []).length === 0 ? (
                  <div className="rounded-2xl border border-[#C59B27]/25 p-8 text-center text-sm opacity-75">
                    No pending submissions in the queue.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {siteState.pendingSubmissions.map((sub) => (
                      <div
                        key={sub.id}
                        style={{ borderColor: "var(--border-subtle)" }}
                        className="rounded-2xl border p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#C59B27]">
                            <span>{sub.type}</span>
                            <span>•</span>
                            <span>Submitted by {sub.submittedBy}</span>
                          </div>
                          <h3 className="text-base font-bold">{sub.title}</h3>
                          {sub.subtitle && (
                            <p className="text-xs font-semibold opacity-80">{sub.subtitle}</p>
                          )}
                          {sub.description && (
                            <p className="text-xs opacity-75">{sub.description}</p>
                          )}
                          <a
                            href={sub.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-xs text-[#9A7418] dark:text-[#E5C158] underline break-all"
                          >
                            {sub.url} ↗
                          </a>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => void handleApproveSubmission(sub)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
                          >
                            ✅ Approve &amp; Publish
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleRejectSubmission(sub.id)}
                            className="px-4 py-2 rounded-xl border border-red-500/50 text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-500/10 transition"
                          >
                            ❌ Reject &amp; Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* TAB 6: PAINTINGS & MEDIA VAULT */}
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
