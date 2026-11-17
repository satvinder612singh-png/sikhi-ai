"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import {
  useCmsSiteState,
  useAdminEditMode,
  pushAdminCmsPatch,
} from "@/components/editable-heritage-image";
import { useVerifiedLiveEdit } from "@/components/inline-cms-editor";
import { useKirtanAudio } from "@/components/kirtan-audio-context";
import {
  FIVE_KS,
  GURUS,
  PANJ_PYARE,
  SAHIBZAADE,
  SHAHEEDS,
} from "@/lib/sikhi-foundations-data";
import type { SikhiNewsCategory, SikhiNewsItem } from "@/app/api/sikhi-news/route";

export const OPEN_EXPLORER_EVENT = "learnsikhi-open-explorer";
const PENDING_ANCHOR_KEY = "learnsikhi_pending_explorer_anchor_v1";

interface DirectoryTopicItem {
  id: string;
  anchorId: string;
  title: string;
  subtitle?: string;
}

interface DirectoryPageGroup {
  key: string;
  label: string;
  href: string;
  matchPaths: string[];
  badge: string;
  topics: DirectoryTopicItem[];
}

const STATIC_SANGAT_TOPICS: DirectoryTopicItem[] = [
  {
    id: "blog-viyakaran-sahib-singh",
    anchorId: "topic-blog-viyakaran-sahib-singh",
    title: "How One Sihari & Aunkar Transforms the Meaning of Mool Mantar",
    subtitle: "Gurbani Viyakaran Essay",
  },
  {
    id: "blog-panth-prakash-sovereignty",
    anchorId: "topic-blog-panth-prakash-sovereignty",
    title: "Why Shaheed Bhai Rattan Singh Bhangu Wrote Sri Gur Panth Prakash in 1841",
    subtitle: "Itihaas Research Essay",
  },
  {
    id: "blog-tanti-saaj-rabab-dilruba",
    anchorId: "topic-blog-tanti-saaj-rabab-dilruba",
    title: "The Spiritual Physics of Tanti Saaj: Rabab, Saranda & Taus",
    subtitle: "Gurmat Sangeet Essay",
  },
  {
    id: "pin-1",
    anchorId: "topic-pin-1",
    title: "Puratan Larivaar Mul Mantar Folio in Gold & Indigo",
    subtitle: "Chitrakari Pin",
  },
  {
    id: "pin-2",
    anchorId: "topic-pin-2",
    title: "Amrit Vela Reflection at Sachkhand Sri Harmandir Sahib",
    subtitle: "Sanctuary Visual",
  },
  {
    id: "seed-bunga-azadi-yt",
    anchorId: "topic-seed-bunga-azadi-yt",
    title: "Bunga Azadi — Discussions on Sikh Sovereignty & Philosophy",
    subtitle: "Curated Resource",
  },
  {
    id: "seed-ensaaf",
    anchorId: "topic-seed-ensaaf",
    title: "Ensaaf — Human-Rights Documentation of 1984 and After",
    subtitle: "Curated Archive",
  },
  {
    id: "seed-1984-tribute",
    anchorId: "topic-seed-1984-tribute",
    title: "1984 Tribute — Remembering June & November 1984",
    subtitle: "Oral Testimony Archive",
  },
  {
    id: "seed-manglacharan",
    anchorId: "topic-seed-manglacharan",
    title: "Manglacharan — Translations of Classical Sikh Granths",
    subtitle: "Classical Translations",
  },
  {
    id: "seed-gurmatveechar",
    anchorId: "topic-seed-gurmatveechar",
    title: "Gurmat Veechar — Puratan Kirtan, Katha & Pothi Archive",
    subtitle: "Digital Vault",
  },
];

const STATIC_BANI_TOPICS: DirectoryTopicItem[] = [
  { id: "nitnem-hero", anchorId: "topic-nitnem-hero", title: "Daily Bani Hero & Quick Links", subtitle: "Section" },
  { id: "japji-sahib", anchorId: "topic-japji-sahib", title: "Japji Sahib", subtitle: "Morning Nitnem • 38 Pauris" },
  { id: "jaap-sahib", anchorId: "topic-jaap-sahib", title: "Jaap Sahib", subtitle: "Morning Nitnem • 199 Chhands" },
  { id: "tav-prasad-savaiye", anchorId: "topic-tav-prasad-savaiye", title: "Tav-Prasad Savaiye", subtitle: "Morning Nitnem • 10 Savaiyes" },
  { id: "chaupai-sahib", anchorId: "topic-chaupai-sahib", title: "Chaupai Sahib", subtitle: "Morning Nitnem" },
  { id: "anand-sahib", anchorId: "topic-anand-sahib", title: "Anand Sahib", subtitle: "Morning Nitnem • 40 Pauris" },
  { id: "rehras-sahib", anchorId: "topic-rehras-sahib", title: "Rehras Sahib", subtitle: "Evening Nitnem" },
  { id: "kirtan-sohila", anchorId: "topic-kirtan-sohila", title: "Kirtan Sohila", subtitle: "Nighttime Nitnem" },
  { id: "sukhmani-sahib", anchorId: "topic-sukhmani-sahib", title: "Sukhmani Sahib (All 24 Ashtpadis)", subtitle: "Extended Bani" },
  { id: "asa-di-vaar", anchorId: "topic-asa-di-vaar", title: "Asa Di Vaar", subtitle: "Morning Kirtan Bani" },
  { id: "ardas", anchorId: "topic-ardas", title: "Ardas", subtitle: "Daily Prayer" },
];

const STATIC_GRANTH_TOPICS: DirectoryTopicItem[] = [
  { id: "sggs-darpan", anchorId: "topic-sggs-darpan", title: "Sri Guru Granth Sahib Ji Darpan (Prof. Sahib Singh)", subtitle: "Viakhia & Grammar" },
  { id: "panth-prakash", anchorId: "topic-panth-prakash", title: "Sri Gur Panth Prakash (Rattan Singh Bhangu)", subtitle: "Khalsa History (1841)" },
  { id: "suraj-prakash", anchorId: "topic-suraj-prakash", title: "Sri Gur Pratap Suraj Granth (Kavi Santokh Singh)", subtitle: "Classical Itihaas" },
  { id: "puratan-sggs-manuscript", anchorId: "topic-puratan-sggs-manuscript", title: "Puratan Sri Guru Granth Sahib Ji Manuscript (Larivaar)", subtitle: "Scribal Heritage" },
  { id: "pracheen-reet-ratnavli", anchorId: "topic-pracheen-reet-ratnavli", title: "Gurbani Sangeet Pracheen Reet Ratnavli", subtitle: "Puratan Raag Notation" },
  { id: "khalsa-dharam-shastar", anchorId: "topic-khalsa-dharam-shastar", title: "Khalsa Dharam Shastar (Rehit Maryada)", subtitle: "Rehit & Sanskar" },
];

const STATIC_MATRIARCH_TOPICS: DirectoryTopicItem[] = [
  { id: "bebe-nanaki", anchorId: "topic-bebe-nanaki", title: "Bebe Nanaki Ji", subtitle: "First Disciple" },
  { id: "mata-khivi", anchorId: "topic-mata-khivi", title: "Mata Khivi Ji", subtitle: "Architect of Langar" },
  { id: "mata-gujri", anchorId: "topic-mata-gujri", title: "Mata Gujri Ji", subtitle: "Martyr of Thanda Burj" },
  { id: "mai-bhago", anchorId: "topic-mai-bhago", title: "Mai Bhago Ji (Mata Bhag Kaur)", subtitle: "Commander at Muktsar" },
  { id: "bibi-sharan-kaur", anchorId: "topic-bibi-sharan-kaur", title: "Bibi Sharan Kaur Pabla", subtitle: "Martyr of Chamkaur" },
  { id: "bibi-harsharan-rup-amro", anchorId: "topic-bibi-harsharan-rup-amro", title: "Bibi Amro Ji, Bibi Rup Kaur & Bibi Harsharan Kaur", subtitle: "Preservers of Bani" },
  { id: "mata-sahib-kaur", anchorId: "topic-mata-sahib-kaur", title: "Mata Sahib Kaur Ji & Mata Sundari Ji", subtitle: "Mothers of the Khalsa" },
  { id: "bibi-dalair-kaur", anchorId: "topic-bibi-dalair-kaur", title: "Bibi Dalair Kaur Ji", subtitle: "Sikh Garrison Commander" },
  { id: "rani-sada-kaur", anchorId: "topic-rani-sada-kaur", title: "Sardarni Sada Kaur", subtitle: "Kanhaiya Misl Chief" },
  { id: "bibi-rajinder-kaur", anchorId: "topic-bibi-rajinder-kaur", title: "Bibi Rajinder Kaur of Patiala", subtitle: "Stateswoman & Defender" },
  { id: "maharani-jind-kaur", anchorId: "topic-maharani-jind-kaur", title: "Maharani Jind Kaur (Mai Jindan)", subtitle: "Sovereign Regent" },
  { id: "bibi-gulab-kaur", anchorId: "topic-bibi-gulab-kaur", title: "Bibi Gulab Kaur", subtitle: "Ghadar Revolutionary" },
  { id: "bibi-upkar-kaur-1984", anchorId: "topic-bibi-upkar-kaur-1984", title: "Bibi Upkar Kaur & Mothers of 1978–1984", subtitle: "Witness & Steadfastness" },
];

const STATIC_FOUNDATIONS_TOPICS: DirectoryTopicItem[] = [
  ...FIVE_KS.map((k) => ({
    id: k.art.artKey,
    anchorId: "foundations-deck",
    title: `${k.name} — ${k.meaning}`,
    subtitle: "The 5 Ks (Panj Kakaar)",
  })),
  ...GURUS.slice(0, 3).map((g) => ({
    id: g.art.artKey,
    anchorId: "foundations-deck",
    title: `${g.name} (${g.life})`,
    subtitle: "10 Guru Sahibs",
  })),
  ...PANJ_PYARE.map((p) => ({
    id: p.art.artKey,
    anchorId: "foundations-deck",
    title: p.name,
    subtitle: `Panj Pyare • ${p.from}`,
  })),
  ...SAHIBZAADE.map((s) => ({
    id: s.art.artKey,
    anchorId: "foundations-deck",
    title: s.name,
    subtitle: `Chaar Sahibzaade • ${s.place}`,
  })),
  ...SHAHEEDS.map((sh) => ({
    id: sh.art.artKey,
    anchorId: "foundations-deck",
    title: sh.name,
    subtitle: `Shaheed • ${sh.year}`,
  })),
];

function pulseHighlightAnchor(anchorId: string) {
  if (typeof document === "undefined") return false;
  const el =
    document.getElementById(anchorId) ||
    document.getElementById(anchorId.replace(/^topic-/, ""));
  if (!el) return false;

  el.scrollIntoView({ behavior: "smooth", block: "center" });
  const prevBoxShadow = el.style.boxShadow;
  const prevOutline = el.style.outline;
  const prevOutlineOffset = el.style.outlineOffset;
  el.style.outline = "3px solid #d4af37";
  el.style.outlineOffset = "4px";
  el.style.boxShadow = "0 0 36px rgba(212, 175, 55, 0.72)";
  window.setTimeout(() => {
    el.style.outline = prevOutline;
    el.style.outlineOffset = prevOutlineOffset;
    el.style.boxShadow = prevBoxShadow;
  }, 2200);
  return true;
}

function formatRelativeDate(iso: string): string {
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return "Recent";
  const diffMin = Math.max(0, Math.round((Date.now() - ts) / 60000));
  if (diffMin < 60) return `${diffMin || 1}m ago`;
  const diffHrs = Math.round(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function GlobalExplorerSidebar({
  isAdmin = false,
}: {
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const cms = useCmsSiteState();
  const [liveEditMode] = useAdminEditMode();
  const isVerifiedLiveEdit = useVerifiedLiveEdit();
  const { tracks, liveStreams } = useKirtanAudio();

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"map" | "news">("map");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedPages, setExpandedPages] = useState<Record<string, boolean>>({
    sangat: true,
    foundations: true,
    nitnem: true,
    granths: true,
    matriarchs: true,
    games: true,
  });

  // Live Sikhi News Bot state
  const [newsItems, setNewsItems] = useState<SikhiNewsItem[]>([]);
  const [newsUpdatedAt, setNewsUpdatedAt] = useState<string | null>(null);
  const [newsLoading, setNewsLoading] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customSummary, setCustomSummary] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [customSource, setCustomSource] = useState("Learn Sikhi Editorial");
  const [customCategory, setCustomCategory] =
    useState<SikhiNewsCategory>("Community Update");
  const [postingNews, setPostingNews] = useState(false);

  const showArchivedForAdmin = isAdmin && liveEditMode;

  useEffect(() => {
    setMounted(true);
    const onOpenEvent = (e: Event) => {
      const detail = (e as CustomEvent<{ tab?: "map" | "news" }>).detail;
      if (detail?.tab) setActiveTab(detail.tab);
      setIsOpen(true);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener(OPEN_EXPLORER_EVENT, onOpenEvent);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener(OPEN_EXPLORER_EVENT, onOpenEvent);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  // Scroll smoothly and pulse gold highlight when arriving at a hash anchor
  useEffect(() => {
    if (typeof window === "undefined") return;
    let pending = window.sessionStorage.getItem(PENDING_ANCHOR_KEY) || "";
    const hash = window.location.hash.replace(/^#/, "");
    if (!pending && hash.startsWith("topic-")) {
      pending = hash;
    }
    if (!pending) return;

    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      if (pulseHighlightAnchor(pending) || attempts >= 15) {
        window.clearInterval(timer);
        window.sessionStorage.removeItem(PENDING_ANCHOR_KEY);
      }
    }, 150);

    return () => window.clearInterval(timer);
  }, [pathname]);

  const loadNewsFeed = useCallback(async (forceRefresh = false) => {
    setNewsLoading(true);
    try {
      const res = await fetch(
        forceRefresh ? "/api/sikhi-news?refresh=true" : "/api/sikhi-news",
        { cache: forceRefresh ? "no-store" : "default" }
      );
      const data = await res.json();
      if (data?.ok && Array.isArray(data.items)) {
        setNewsItems(data.items);
        setNewsUpdatedAt(data.updatedAt || null);
      }
    } catch {
      // Keep current items if network fails
    } finally {
      setNewsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && activeTab === "news" && newsItems.length === 0 && !newsLoading) {
      void loadNewsFeed(false);
    }
  }, [isOpen, activeTab, newsItems.length, newsLoading, loadNewsFeed]);

  const deletedSet = useMemo(
    () => new Set(cms.deletedIds || []),
    [cms.deletedIds]
  );
  const archivedSet = useMemo(
    () => new Set(cms.archivedIds || []),
    [cms.archivedIds]
  );

  const directoryGroups: DirectoryPageGroup[] = useMemo(() => {
    const filterAndDecorate = (items: DirectoryTopicItem[]): DirectoryTopicItem[] =>
      items
        .filter((item) => {
          if (deletedSet.has(item.id)) return false;
          if (!showArchivedForAdmin && archivedSet.has(item.id)) return false;
          return true;
        })
        .map((item) => {
          const editedTitle = cms.topicEdits?.[item.id]?.title;
          return {
            ...item,
            title: editedTitle || item.title,
          };
        });

    const customByPage = (pageKey: string): DirectoryTopicItem[] =>
      (cms.customTopics?.[pageKey] || []).map((ct) => ({
        id: ct.id,
        anchorId: `topic-${ct.id}`,
        title: ct.title,
        subtitle: ct.badge || ct.subtitle || "Admin Added Topic",
      }));

    const kirtanTopics: DirectoryTopicItem[] = [...liveStreams, ...tracks].map(
      (t) => ({
        id: t.id,
        anchorId: `topic-${t.id}`,
        title: t.title,
        subtitle: `${t.ragi} • ${t.raag}`,
      })
    );

    const groups: DirectoryPageGroup[] = [
      {
        key: "sangat",
        label: "Home & Sangat Hub",
        href: "/sangat",
        matchPaths: ["/", "/sangat"],
        badge: "Essays & Resources",
        topics: filterAndDecorate([
          ...customByPage("sangat"),
          ...STATIC_SANGAT_TOPICS,
        ]),
      },
      {
        key: "foundations",
        label: "Foundations of Sikhi",
        href: "/foundations",
        matchPaths: ["/foundations"],
        badge: "Sikhi 101",
        topics: filterAndDecorate([
          ...customByPage("foundations"),
          ...STATIC_FOUNDATIONS_TOPICS,
        ]),
      },
      {
        key: "nitnem",
        label: "Daily Bani & Nitnem",
        href: "/nitnem",
        matchPaths: ["/nitnem"],
        badge: "10 Sacred Banis",
        topics: filterAndDecorate([
          ...customByPage("nitnem"),
          ...STATIC_BANI_TOPICS,
        ]),
      },
      {
        key: "granths",
        label: "Granths & Puratan Kirtan",
        href: "/granths",
        matchPaths: ["/granths"],
        badge: "Text & Raag",
        topics: filterAndDecorate([
          ...customByPage("granths"),
          ...STATIC_GRANTH_TOPICS,
          ...kirtanTopics,
        ]),
      },
      {
        key: "matriarchs",
        label: "Unsung Sikh Women",
        href: "/matriarchs",
        matchPaths: ["/matriarchs"],
        badge: "13 Profiles",
        topics: filterAndDecorate([
          ...customByPage("matriarchs"),
          ...STATIC_MATRIARCH_TOPICS,
        ]),
      },
      {
        key: "games",
        label: "Vidyala & Sikhi Games",
        href: "/games",
        matchPaths: ["/games"],
        badge: "Interactive",
        topics: [
          {
            id: "games-hero",
            anchorId: "topic-games-hero",
            title: "Vidyala Quiz, Word Builder & Coin Sanctuary",
            subtitle: "Interactive Learning",
          },
        ],
      },
    ];

    const q = searchQuery.trim().toLowerCase();
    if (!q) return groups;

    return groups
      .map((g) => {
        const groupMatch = g.label.toLowerCase().includes(q);
        const matchingTopics = groupMatch
          ? g.topics
          : g.topics.filter(
              (t) =>
                t.title.toLowerCase().includes(q) ||
                (t.subtitle || "").toLowerCase().includes(q)
            );
        return { ...g, topics: matchingTopics };
      })
      .filter((g) => g.topics.length > 0 || g.label.toLowerCase().includes(q));
  }, [
    deletedSet,
    archivedSet,
    showArchivedForAdmin,
    cms.topicEdits,
    cms.customTopics,
    liveStreams,
    tracks,
    searchQuery,
  ]);

  const handleJumpToTopic = (group: DirectoryPageGroup, topic: DirectoryTopicItem) => {
    const isSamePage = group.matchPaths.includes(pathname || "");
    setIsOpen(false);
    if (isSamePage && pulseHighlightAnchor(topic.anchorId)) {
      return;
    }
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(PENDING_ANCHOR_KEY, topic.anchorId);
    }
    router.push(`${group.href}#${topic.anchorId}`);
  };

  const handleCreateCustomNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customUrl.trim()) return;
    setPostingNews(true);

    const existingList = (
      (cms.sectionLayoutMap?.customNewsList as { items?: SikhiNewsItem[] } | undefined)
        ?.items || []
    ).filter(Boolean);

    const created: SikhiNewsItem = {
      id: `custom-news-${Date.now()}`,
      title: customTitle.trim(),
      summary:
        customSummary.trim() || "Admin-featured positive Sikhi community update.",
      url: customUrl.trim(),
      source: customSource.trim() || "Learn Sikhi Editorial",
      publishedAt: new Date().toISOString(),
      category: customCategory,
      isCustom: true,
      pinned: true,
    };

    await pushAdminCmsPatch({
      sectionLayoutMap: {
        ...(cms.sectionLayoutMap || {}),
        customNewsList: { items: [created, ...existingList] },
      },
    });

    setCustomTitle("");
    setCustomSummary("");
    setCustomUrl("");
    setShowPostForm(false);
    setPostingNews(false);
    await loadNewsFeed(true);
  };

  const handleDeleteCustomNews = async (newsId: string) => {
    const existingList = (
      (cms.sectionLayoutMap?.customNewsList as { items?: SikhiNewsItem[] } | undefined)
        ?.items || []
    ).filter((it) => it && it.id !== newsId);

    await pushAdminCmsPatch({
      sectionLayoutMap: {
        ...(cms.sectionLayoutMap || {}),
        customNewsList: { items: existingList },
      },
    });
    await loadNewsFeed(true);
  };

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <>
      {/* Pinned Left-Edge Viewport Trigger Tab */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Global Explore and Hourly Sikhi News Side Panel"
          className="fixed left-0 top-1/3 -translate-y-1/2 z-[80] flex items-center gap-1.5 rounded-r-2xl border border-l-0 border-[#C59B27]/65 bg-[#0F172A]/92 px-2.5 py-2.5 text-[11px] font-extrabold text-[#FAF7F0] shadow-xl shadow-black/35 backdrop-blur-md hover:bg-[#1E293B] hover:pl-3.5 transition-all"
        >
          <span>🧭</span>
          <span className="hidden sm:inline tracking-wide">Explore &amp; News</span>
        </button>
      )}

      {/* Slide-Out Side Panel Drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[96] flex bg-black/50 backdrop-blur-[2px]"
          onClick={() => setIsOpen(false)}
        >
          <aside
            aria-label="Global Topic Explorer & Hourly Sikhi News"
            onClick={(e) => e.stopPropagation()}
            className="h-full w-[92vw] max-w-md bg-[#0B101B] text-[#FAF7F0] border-r-2 border-[#C59B27]/60 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3.5 border-b border-white/10 flex items-center justify-between gap-2 bg-[#111827]">
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#E5C158]">
                  Learn Sikhi Sanctuary
                </p>
                <h2 className="font-serif text-lg font-bold truncate">
                  Explorer &amp; Hourly News Bot
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Side Panel"
                className="h-8 w-8 rounded-full border border-white/20 text-xs font-bold hover:border-[#C59B27] flex items-center justify-center shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="p-2.5 border-b border-white/10 grid grid-cols-2 gap-2 bg-[#0F172A]">
              <button
                type="button"
                onClick={() => setActiveTab("map")}
                className={`py-2 px-2.5 rounded-xl text-xs font-extrabold border transition ${
                  activeTab === "map"
                    ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] border-[#E5C158]"
                    : "border-white/15 bg-white/5 text-[#FAF7F0]/80 hover:text-white"
                }`}
              >
                🗺️ Site &amp; Topic Map
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("news")}
                className={`py-2 px-2.5 rounded-xl text-xs font-extrabold border transition ${
                  activeTab === "news"
                    ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] border-[#E5C158]"
                    : "border-white/15 bg-white/5 text-[#FAF7F0]/80 hover:text-white"
                }`}
              >
                📰 Hourly Sikhi News Bot
              </button>
            </div>

            {/* Tab 1: Site & Topic Map */}
            {activeTab === "map" && (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="p-3 border-b border-white/10">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Jump to any Bani, Granth, Matriarch, or essay..."
                    className="w-full rounded-xl border border-[#C59B27]/40 bg-black/50 px-3 py-2 text-xs text-[#FAF7F0] placeholder:text-zinc-400 focus:outline-none focus:border-[#E5C158]"
                  />
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {directoryGroups.map((group) => {
                    const expanded =
                      searchQuery.trim() !== "" ||
                      expandedPages[group.key] !== false;
                    return (
                      <div
                        key={group.key}
                        className="rounded-xl border border-white/12 bg-white/[0.03] overflow-hidden"
                      >
                        <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-white/[0.04]">
                          <button
                            type="button"
                            onClick={() => {
                              setIsOpen(false);
                              router.push(group.href);
                            }}
                            className="text-left min-w-0 flex-1 hover:text-[#E5C158] transition"
                          >
                            <span className="block font-bold text-xs truncate">
                              {group.label}
                            </span>
                            <span className="block text-[10px] text-zinc-400">
                              {group.badge} • {group.topics.length} items
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedPages((prev) => ({
                                ...prev,
                                [group.key]: !expanded,
                              }))
                            }
                            className="px-2 py-1 rounded border border-white/15 text-[10px] font-bold hover:border-[#C59B27]"
                          >
                            {expanded ? "▲" : "▼"}
                          </button>
                        </div>

                        {expanded && (
                          <ul className="divide-y divide-white/5">
                            {group.topics.map((topic) => {
                              const isHidden = archivedSet.has(topic.id);
                              return (
                                <li key={`${group.key}-${topic.id}`}>
                                  <button
                                    type="button"
                                    onClick={() => handleJumpToTopic(group, topic)}
                                    className="w-full text-left px-3 py-2 hover:bg-[#C59B27]/15 transition flex items-center justify-between gap-2 group"
                                  >
                                    <div className="min-w-0">
                                      <p className="text-xs font-semibold text-[#FAF7F0] group-hover:text-[#E5C158] truncate">
                                        {topic.title}
                                      </p>
                                      {topic.subtitle && (
                                        <p className="text-[10px] text-zinc-400 truncate">
                                          {topic.subtitle}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                      {isHidden && isVerifiedLiveEdit && (
                                        <span className="px-1.5 py-0.5 rounded bg-amber-500/25 text-amber-300 text-[9px] font-bold">
                                          Hidden
                                        </span>
                                      )}
                                      <span className="text-[11px] text-[#E5C158] opacity-70 group-hover:opacity-100">
                                        →
                                      </span>
                                    </div>
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 2: Hourly Sikhi News Bot */}
            {activeTab === "news" && (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="px-3.5 py-2.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 bg-black/25 text-[11px]">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Updated hourly • Live Bot</span>
                    {newsUpdatedAt && (
                      <span className="text-zinc-400 font-normal">
                        ({formatRelativeDate(newsUpdatedAt)})
                      </span>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={newsLoading}
                        onClick={() => void loadNewsFeed(true)}
                        className="px-2 py-1 rounded-lg border border-sky-500/45 bg-sky-500/15 text-sky-200 font-bold text-[10px] hover:bg-sky-500/25 disabled:opacity-50"
                      >
                        {newsLoading ? "Refreshing..." : "🔄 Refresh Bot Now"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPostForm((v) => !v)}
                        className="px-2 py-1 rounded-lg bg-[#C59B27] text-[#18181B] font-extrabold text-[10px]"
                      >
                        + Post Custom News
                      </button>
                    </div>
                  )}
                </div>

                {isAdmin && showPostForm && (
                  <form
                    onSubmit={handleCreateCustomNews}
                    className="p-3 border-b border-white/10 bg-[#111827] space-y-2 text-xs"
                  >
                    <input
                      type="text"
                      required
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="Headline (positive Sikhi update)..."
                      className="w-full rounded-lg border border-white/20 bg-black/50 px-2.5 py-1.5 text-xs text-[#FAF7F0]"
                    />
                    <input
                      type="url"
                      required
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value)}
                      placeholder="Article URL (https://...)"
                      className="w-full rounded-lg border border-white/20 bg-black/50 px-2.5 py-1.5 text-xs text-[#FAF7F0]"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={customSource}
                        onChange={(e) => setCustomSource(e.target.value)}
                        placeholder="Source"
                        className="rounded-lg border border-white/20 bg-black/50 px-2.5 py-1.5 text-xs text-[#FAF7F0]"
                      />
                      <select
                        value={customCategory}
                        onChange={(e) =>
                          setCustomCategory(e.target.value as SikhiNewsCategory)
                        }
                        className="rounded-lg border border-white/20 bg-black/60 px-2 py-1.5 text-xs text-[#FAF7F0]"
                      >
                        <option value="Community Update">Community Update</option>
                        <option value="Seva & Langar">Seva &amp; Langar</option>
                        <option value="Gurdwara Heritage">Gurdwara Heritage</option>
                        <option value="Sikhi Education">Sikhi Education</option>
                        <option value="Kirtan & Culture">Kirtan &amp; Culture</option>
                      </select>
                    </div>
                    <textarea
                      rows={2}
                      value={customSummary}
                      onChange={(e) => setCustomSummary(e.target.value)}
                      placeholder="Brief uplifting summary..."
                      className="w-full rounded-lg border border-white/20 bg-black/50 px-2.5 py-1.5 text-xs text-[#FAF7F0]"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowPostForm(false)}
                        className="px-2.5 py-1 rounded border border-white/20 text-[11px]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={postingNews}
                        className="px-3 py-1 rounded bg-[#C59B27] text-[#18181B] font-extrabold text-[11px]"
                      >
                        {postingNews ? "Publishing..." : "Publish Story"}
                      </button>
                    </div>
                  </form>
                )}

                <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                  {newsLoading && newsItems.length === 0 ? (
                    <div className="rounded-xl border border-white/10 p-4 text-xs text-zinc-300 animate-pulse">
                      Aggregating hourly uplifting Sikhi &amp; Gurdwara heritage updates...
                    </div>
                  ) : (
                    newsItems.map((story) => (
                      <article
                        key={story.id}
                        className="rounded-xl border border-white/12 bg-white/[0.04] p-3 space-y-1.5 hover:border-[#C59B27]/60 transition"
                      >
                        <div className="flex items-center justify-between gap-2 text-[10px]">
                          <span className="px-2 py-0.5 rounded-full bg-[#C59B27]/20 text-[#E5C158] font-bold uppercase tracking-wider">
                            {story.isCustom ? "📌 Pinned • " : ""}
                            {story.category}
                          </span>
                          <span className="text-zinc-400">
                            {formatRelativeDate(story.publishedAt)}
                          </span>
                        </div>
                        <h3 className="font-serif text-sm font-bold leading-snug text-[#FAF7F0]">
                          {story.title}
                        </h3>
                        <p className="text-xs text-zinc-300 leading-relaxed line-clamp-3">
                          {story.summary}
                        </p>
                        <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
                          <span className="text-zinc-400 truncate">{story.source}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            {isAdmin && story.isCustom && (
                              <button
                                type="button"
                                onClick={() => void handleDeleteCustomNews(story.id)}
                                className="text-red-300 hover:underline text-[10px] font-bold"
                              >
                                Remove
                              </button>
                            )}
                            <a
                              href={story.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-[#E5C158] hover:underline"
                            >
                              Read Story ↗
                            </a>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </>,
    document.body
  );
}
