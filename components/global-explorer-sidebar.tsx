"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
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
import type {
  SikhiNewsCategory,
  SikhiNewsItem,
} from "@/app/api/sikhi-news/route";
import { SikhNewsBriefingDeck } from "@/components/news/sikh-news-briefing-deck";

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
    title:
      "Why Shaheed Bhai Rattan Singh Bhangu Wrote Sri Gur Panth Prakash in 1841",
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
  {
    id: "nitnem-hero",
    anchorId: "topic-nitnem-hero",
    title: "Daily Bani Hero & Quick Links",
    subtitle: "Section",
  },
  {
    id: "japji-sahib",
    anchorId: "topic-japji-sahib",
    title: "Japji Sahib",
    subtitle: "Morning Nitnem • 38 Pauris",
  },
  {
    id: "jaap-sahib",
    anchorId: "topic-jaap-sahib",
    title: "Jaap Sahib",
    subtitle: "Morning Nitnem • 199 Chhands",
  },
  {
    id: "tav-prasad-savaiye",
    anchorId: "topic-tav-prasad-savaiye",
    title: "Tav-Prasad Savaiye",
    subtitle: "Morning Nitnem • 10 Savaiyes",
  },
  {
    id: "chaupai-sahib",
    anchorId: "topic-chaupai-sahib",
    title: "Chaupai Sahib",
    subtitle: "Morning Nitnem",
  },
  {
    id: "anand-sahib",
    anchorId: "topic-anand-sahib",
    title: "Anand Sahib",
    subtitle: "Morning Nitnem • 40 Pauris",
  },
  {
    id: "rehras-sahib",
    anchorId: "topic-rehras-sahib",
    title: "Rehras Sahib",
    subtitle: "Evening Nitnem",
  },
  {
    id: "kirtan-sohila",
    anchorId: "topic-kirtan-sohila",
    title: "Kirtan Sohila",
    subtitle: "Nighttime Nitnem",
  },
  {
    id: "sukhmani-sahib",
    anchorId: "topic-sukhmani-sahib",
    title: "Sukhmani Sahib (All 24 Ashtpadis)",
    subtitle: "Extended Bani",
  },
  {
    id: "asa-di-vaar",
    anchorId: "topic-asa-di-vaar",
    title: "Asa Di Vaar",
    subtitle: "Morning Kirtan Bani",
  },
  {
    id: "ardas",
    anchorId: "topic-ardas",
    title: "Ardas",
    subtitle: "Daily Prayer",
  },
];

const STATIC_GRANTH_TOPICS: DirectoryTopicItem[] = [
  {
    id: "sggs-darpan",
    anchorId: "topic-sggs-darpan",
    title: "Sri Guru Granth Sahib Ji Darpan (Prof. Sahib Singh)",
    subtitle: "Viakhia & Grammar",
  },
  {
    id: "panth-prakash",
    anchorId: "topic-panth-prakash",
    title: "Sri Gur Panth Prakash (Rattan Singh Bhangu)",
    subtitle: "Khalsa History (1841)",
  },
  {
    id: "suraj-prakash",
    anchorId: "topic-suraj-prakash",
    title: "Sri Gur Pratap Suraj Granth (Kavi Santokh Singh)",
    subtitle: "Classical Itihaas",
  },
  {
    id: "puratan-sggs-manuscript",
    anchorId: "topic-puratan-sggs-manuscript",
    title: "Puratan Sri Guru Granth Sahib Ji Manuscript (Larivaar)",
    subtitle: "Scribal Heritage",
  },
  {
    id: "pracheen-reet-ratnavli",
    anchorId: "topic-pracheen-reet-ratnavli",
    title: "Gurbani Sangeet Pracheen Reet Ratnavli",
    subtitle: "Puratan Raag Notation",
  },
  {
    id: "khalsa-dharam-shastar",
    anchorId: "topic-khalsa-dharam-shastar",
    title: "Khalsa Dharam Shastar (Rehit Maryada)",
    subtitle: "Rehit & Sanskar",
  },
];

const STATIC_MATRIARCH_TOPICS: DirectoryTopicItem[] = [
  {
    id: "bebe-nanaki",
    anchorId: "topic-bebe-nanaki",
    title: "Bebe Nanaki Ji",
    subtitle: "First Disciple",
  },
  {
    id: "mata-khivi",
    anchorId: "topic-mata-khivi",
    title: "Mata Khivi Ji",
    subtitle: "Architect of Langar",
  },
  {
    id: "mata-gujri",
    anchorId: "topic-mata-gujri",
    title: "Mata Gujri Ji",
    subtitle: "Martyr of Thanda Burj",
  },
  {
    id: "mai-bhago",
    anchorId: "topic-mai-bhago",
    title: "Mai Bhago Ji (Mata Bhag Kaur)",
    subtitle: "Commander at Muktsar",
  },
  {
    id: "bibi-sharan-kaur",
    anchorId: "topic-bibi-sharan-kaur",
    title: "Bibi Sharan Kaur Pabla",
    subtitle: "Martyr of Chamkaur",
  },
  {
    id: "bibi-harsharan-rup-amro",
    anchorId: "topic-bibi-harsharan-rup-amro",
    title: "Bibi Amro Ji, Bibi Rup Kaur & Bibi Harsharan Kaur",
    subtitle: "Preservers of Bani",
  },
  {
    id: "mata-sahib-kaur",
    anchorId: "topic-mata-sahib-kaur",
    title: "Mata Sahib Kaur Ji & Mata Sundari Ji",
    subtitle: "Mothers of the Khalsa",
  },
  {
    id: "bibi-dalair-kaur",
    anchorId: "topic-bibi-dalair-kaur",
    title: "Bibi Dalair Kaur Ji",
    subtitle: "Sikh Garrison Commander",
  },
  {
    id: "rani-sada-kaur",
    anchorId: "topic-rani-sada-kaur",
    title: "Sardarni Sada Kaur",
    subtitle: "Kanhaiya Misl Chief",
  },
  {
    id: "bibi-rajinder-kaur",
    anchorId: "topic-bibi-rajinder-kaur",
    title: "Bibi Rajinder Kaur of Patiala",
    subtitle: "Stateswoman & Defender",
  },
  {
    id: "maharani-jind-kaur",
    anchorId: "topic-maharani-jind-kaur",
    title: "Maharani Jind Kaur (Mai Jindan)",
    subtitle: "Sovereign Regent",
  },
  {
    id: "bibi-gulab-kaur",
    anchorId: "topic-bibi-gulab-kaur",
    title: "Bibi Gulab Kaur",
    subtitle: "Ghadar Revolutionary",
  },
  {
    id: "bibi-upkar-kaur-1984",
    anchorId: "topic-bibi-upkar-kaur-1984",
    title: "Bibi Upkar Kaur & Mothers of 1978–1984",
    subtitle: "Witness & Steadfastness",
  },
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
  const [activeTab, setActiveTab] = useState<"news" | "map">("news");
  const touchStartXRef = useRef<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedPages, setExpandedPages] = useState<Record<string, boolean>>({
    sangat: true,
    foundations: true,
    nitnem: true,
    granths: true,
    matriarchs: true,
    games: true,
  });

  // Live Sikh News Briefing state
  const [newsItems, setNewsItems] = useState<SikhiNewsItem[]>([]);
  const [newsUpdatedAt, setNewsUpdatedAt] = useState<string | null>(null);
  const [newsLoading, setNewsLoading] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [customSummary, setCustomSummary] = useState("");
  const [customKeyPoints, setCustomKeyPoints] = useState("");
  const [customWhyItMatters, setCustomWhyItMatters] = useState("");
  const [customUrl, setCustomUrl] = useState("");
  const [customSource, setCustomSource] = useState("Learn Sikhi Editorial");
  const [customCategory, setCustomCategory] =
    useState<SikhiNewsCategory>("Global Sangat");
  const [postingNews, setPostingNews] = useState(false);

  const showArchivedForAdmin = isAdmin && liveEditMode;

  useEffect(() => {
    setMounted(true);
    const onOpenEvent = (e: Event) => {
      const detail = (e as CustomEvent<{ tab?: "map" | "news" }>).detail;
      setActiveTab(detail?.tab === "map" ? "map" : "news");
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
        { cache: "no-store" }
      );
      const data = await res.json();
      if (data?.ok && Array.isArray(data.items)) {
        setNewsItems(data.items);
        setNewsUpdatedAt(data.updatedAt || new Date().toISOString());
      }
    } catch {
      // Keep current items if network fails
    } finally {
      setNewsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (
      isOpen &&
      activeTab === "news" &&
      newsItems.length === 0 &&
      !newsLoading
    ) {
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
    const filterAndDecorate = (
      items: DirectoryTopicItem[]
    ): DirectoryTopicItem[] =>
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
        label: "Adaptive Sikhi Learning Games",
        href: "/games",
        matchPaths: ["/games"],
        badge: "AI-Adaptive",
        topics: [
          {
            id: "games-hero",
            anchorId: "topic-games-hero",
            title: "Gurmukhi Letter Match, Sikh History Quiz & Concepts Match",
            subtitle: "Self-Paced Learning",
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

  const handleJumpToTopic = (
    group: DirectoryPageGroup,
    topic: DirectoryTopicItem
  ) => {
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
      (
        cms.sectionLayoutMap?.customNewsList as
          | { items?: SikhiNewsItem[] }
          | undefined
      )?.items || []
    ).filter(Boolean);

    const parsedPoints = customKeyPoints
      .split("\n")
      .map((line) => line.replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 4);

    const cleanUrl = customUrl.trim();
    const cleanSource = customSource.trim() || "Learn Sikhi Editorial";

    const created: SikhiNewsItem = {
      id: `custom-news-${Date.now()}`,
      title: customTitle.trim(),
      summary:
        customSummary.trim() ||
        "Admin-featured positive Sikh community editorial briefing.",
      keyPoints:
        parsedPoints.length >= 2
          ? parsedPoints
          : [
              `Curated editorial dispatch from ${cleanSource}.`,
              `Highlighted under ${customCategory} for the global Sangat.`,
              "Full original reporting available via the publisher link below.",
            ],
      whyItMatters:
        customWhyItMatters.trim() ||
        "Spotlights inspiring Sikh community initiatives and heritage updates worth sharing with the Sangat.",
      sourceUrl: cleanUrl,
      url: cleanUrl,
      sourceName: cleanSource,
      source: cleanSource,
      publishedAt: new Date().toISOString(),
      category: customCategory,
      imageUrl: null,
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
    setCustomKeyPoints("");
    setCustomWhyItMatters("");
    setCustomUrl("");
    setShowPostForm(false);
    setPostingNews(false);
    await loadNewsFeed(true);
  };

  const handleDeleteCustomNews = async (newsId: string) => {
    const existingList = (
      (
        cms.sectionLayoutMap?.customNewsList as
          | { items?: SikhiNewsItem[] }
          | undefined
      )?.items || []
    ).filter((it) => it && it.id !== newsId);

    await pushAdminCmsPatch({
      sectionLayoutMap: {
        ...(cms.sectionLayoutMap || {}),
        customNewsList: { items: existingList },
      },
    });
    await loadNewsFeed(true);
  };

  const pinnedSet = useMemo(() => new Set(cms.pinnedIds || []), [cms.pinnedIds]);

  const handleTogglePinNews = async (newsId: string) => {
    const key = `news:${newsId}`;
    const currentPinned = Array.isArray(cms.pinnedIds) ? cms.pinnedIds : [];
    const isPinned = currentPinned.includes(key);
    const nextPinned = isPinned
      ? currentPinned.filter((id) => id !== key)
      : [key, ...currentPinned];
    await pushAdminCmsPatch({ pinnedIds: nextPinned });
  };

  const handleToggleHideNews = async (newsId: string) => {
    const key = `news:${newsId}`;
    const currentArchived = Array.isArray(cms.archivedIds)
      ? cms.archivedIds
      : [];
    const isHidden = currentArchived.includes(key);
    const nextArchived = isHidden
      ? currentArchived.filter((id) => id !== key)
      : [...currentArchived, key];
    await pushAdminCmsPatch({ archivedIds: nextArchived });
  };

  const visibleNewsItems = useMemo(() => {
    return [...newsItems]
      .filter((story) => {
        const key = `news:${story.id}`;
        if (!isAdmin && archivedSet.has(key)) return false;
        return true;
      })
      .sort((a, b) => {
        const aPinned = Boolean(a.isCustom || pinnedSet.has(`news:${a.id}`));
        const bPinned = Boolean(b.isCustom || pinnedSet.has(`news:${b.id}`));
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        return 0;
      });
  }, [newsItems, isAdmin, archivedSet, pinnedSet]);

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <MotionConfig reducedMotion="user">
      {/* Pinned Left-Edge Viewport Trigger Tab */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setActiveTab("news");
            setIsOpen(true);
          }}
          aria-label="Open Explore & Sikh News Briefing"
          className="dark-surface fixed left-0 top-1/3 -translate-y-1/2 z-[80] flex items-center gap-1.5 rounded-r-2xl border border-l-0 border-amber-400/60 bg-[#0d1424]/95 px-2.5 py-2.5 text-[11px] font-extrabold text-amber-50 shadow-xl shadow-black/40 backdrop-blur-md hover:bg-[#172136] hover:pl-3.5 transition-all"
        >
          <span>🧭</span>
          <span className="hidden sm:inline tracking-wide">
            Explore &amp; News
          </span>
        </button>
      )}

      {/* Interactive Overlay: Wide Editorial Slide Briefing for News, Sleek Drawer for Map */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="explorer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`fixed inset-0 z-[96] flex bg-black/70 backdrop-blur-md ${
              activeTab === "news"
                ? "items-center justify-center p-2 sm:p-5"
                : "items-stretch justify-start"
            }`}
            onClick={() => setIsOpen(false)}
          >
            <motion.aside
              key={`explorer-shell-${activeTab}`}
              initial={
                activeTab === "news"
                  ? { opacity: 0, scale: 0.97, y: 14 }
                  : { opacity: 0, x: -32 }
              }
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={
                activeTab === "news"
                  ? { opacity: 0, scale: 0.98, y: 10 }
                  : { opacity: 0, x: -24 }
              }
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              aria-label="Explore Sanctuary & Sikh News Briefing"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => {
                touchStartXRef.current = e.touches[0]?.clientX ?? null;
              }}
              onTouchEnd={(e) => {
                if (activeTab !== "map") return;
                const startX = touchStartXRef.current;
                touchStartXRef.current = null;
                const endX = e.changedTouches[0]?.clientX ?? null;
                if (startX !== null && endX !== null && startX - endX > 60) {
                  setIsOpen(false);
                }
              }}
              className={`dark-surface admin-studio-ui bg-[#090d16] text-amber-50 border-amber-400/50 shadow-2xl flex flex-col overflow-hidden ${
                activeTab === "news"
                  ? "w-[96vw] max-w-6xl max-h-[92vh] rounded-3xl border"
                  : "h-full w-[92vw] max-w-md border-r-2"
              }`}
            >
              {/* Header */}
              <div className="px-4 sm:px-6 py-4 border-b border-white/12 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-[#111827] via-[#0f172a] to-[#111827]">
                <div className="min-w-0">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-amber-300">
                    Learn Sikhi Sanctuary
                  </p>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-white truncate">
                    {activeTab === "news"
                      ? "Sikh News Editorial Briefing"
                      : "Site & Topic Explorer"}
                  </h2>
                </div>

                {/* Mode Switcher Tabs + Full Page Link + Close */}
                <div className="flex flex-wrap items-center gap-2">
                  <div
                    role="tablist"
                    aria-label="Explorer mode"
                    className="flex items-center gap-1 rounded-xl border border-white/15 bg-black/40 p-1"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === "news"}
                      onClick={() => setActiveTab("news")}
                      className={`relative rounded-lg px-3 py-1.5 text-xs font-extrabold transition-colors ${
                        activeTab === "news"
                          ? "text-stone-950"
                          : "text-zinc-200 hover:text-white"
                      }`}
                    >
                      {activeTab === "news" && (
                        <motion.span
                          layoutId="explorer-mode-pill"
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 32,
                          }}
                          className="absolute inset-0 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500"
                        />
                      )}
                      <span className="relative z-10">📰 Sikh News Slides</span>
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={activeTab === "map"}
                      onClick={() => setActiveTab("map")}
                      className={`relative rounded-lg px-3 py-1.5 text-xs font-extrabold transition-colors ${
                        activeTab === "map"
                          ? "text-stone-950"
                          : "text-zinc-200 hover:text-white"
                      }`}
                    >
                      {activeTab === "map" && (
                        <motion.span
                          layoutId="explorer-mode-pill"
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 32,
                          }}
                          className="absolute inset-0 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500"
                        />
                      )}
                      <span className="relative z-10">🗺️ Topic Map</span>
                    </button>
                  </div>

                  {activeTab === "news" && (
                    <Link
                      href="/news"
                      onClick={() => setIsOpen(false)}
                      className="rounded-xl border border-amber-300/45 bg-amber-400/10 px-3 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-400/20 transition"
                    >
                      Full Page ↗
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close Explorer and News"
                    className="h-9 w-9 rounded-full border border-white/25 bg-white/5 text-xs font-bold text-white hover:border-amber-400 flex items-center justify-center shrink-0"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Tab 1: Interactive Slide-Style Sikh News Briefing */}
              {activeTab === "news" && (
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                  {isAdmin && showPostForm && (
                    <form
                      onSubmit={handleCreateCustomNews}
                      className="rounded-2xl border border-amber-400/40 bg-[#111827] p-4 space-y-3 text-xs"
                    >
                      <p className="font-serif text-base font-bold text-amber-200">
                        Publish Featured Editorial Slide
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <input
                          type="text"
                          required
                          value={customTitle}
                          onChange={(e) => setCustomTitle(e.target.value)}
                          placeholder="Headline (positive Sikh update)..."
                          className="dark-input rounded-xl border border-white/20 bg-black/50 px-3 py-2 text-xs text-white"
                        />
                        <input
                          type="url"
                          required
                          value={customUrl}
                          onChange={(e) => setCustomUrl(e.target.value)}
                          placeholder="Original Publisher URL (https://...)"
                          className="dark-input rounded-xl border border-white/20 bg-black/50 px-3 py-2 text-xs text-white"
                        />
                        <input
                          type="text"
                          value={customSource}
                          onChange={(e) => setCustomSource(e.target.value)}
                          placeholder="Publisher / Source Name"
                          className="dark-input rounded-xl border border-white/20 bg-black/50 px-3 py-2 text-xs text-white"
                        />
                        <select
                          value={customCategory}
                          onChange={(e) =>
                            setCustomCategory(
                              e.target.value as SikhiNewsCategory
                            )
                          }
                          className="dark-input rounded-xl border border-white/20 bg-black/60 px-3 py-2 text-xs text-white"
                        >
                          <option value="Global Sangat">Global Sangat</option>
                          <option value="Punjab & Heritage">
                            Punjab &amp; Heritage
                          </option>
                          <option value="Seva & Community">
                            Seva &amp; Community
                          </option>
                          <option value="Youth & Education">
                            Youth &amp; Education
                          </option>
                          <option value="Kirtan & Culture">
                            Kirtan &amp; Culture
                          </option>
                        </select>
                      </div>
                      <textarea
                        rows={2}
                        value={customSummary}
                        onChange={(e) => setCustomSummary(e.target.value)}
                        placeholder="Concise 2-sentence overview..."
                        className="dark-input w-full rounded-xl border border-white/20 bg-black/50 px-3 py-2 text-xs text-white"
                      />
                      <textarea
                        rows={3}
                        value={customKeyPoints}
                        onChange={(e) => setCustomKeyPoints(e.target.value)}
                        placeholder="Key points (one per line, 3–4 bullets)..."
                        className="dark-input w-full rounded-xl border border-white/20 bg-black/50 px-3 py-2 text-xs text-white"
                      />
                      <input
                        type="text"
                        value={customWhyItMatters}
                        onChange={(e) => setCustomWhyItMatters(e.target.value)}
                        placeholder="Why It Matters takeaway..."
                        className="dark-input w-full rounded-xl border border-white/20 bg-black/50 px-3 py-2 text-xs text-white"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowPostForm(false)}
                          className="rounded-lg border border-white/25 px-3 py-1.5 text-xs font-bold text-zinc-200 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={postingNews}
                          className="rounded-lg bg-amber-400 px-4 py-1.5 text-xs font-extrabold text-stone-950 hover:bg-amber-300"
                        >
                          {postingNews ? "Publishing…" : "Publish Briefing Slide"}
                        </button>
                      </div>
                    </form>
                  )}

                  <SikhNewsBriefingDeck
                    items={visibleNewsItems}
                    loading={newsLoading}
                    updatedAt={newsUpdatedAt}
                    surface="dark"
                    keyboardActive={isOpen && activeTab === "news"}
                    isAdmin={isAdmin}
                    pinnedSet={pinnedSet}
                    archivedSet={archivedSet}
                    onRefresh={() => void loadNewsFeed(true)}
                    onTogglePin={(id) => void handleTogglePinNews(id)}
                    onToggleHide={(id) => void handleToggleHideNews(id)}
                    onDeleteCustom={(id) => void handleDeleteCustomNews(id)}
                    headerActions={
                      isAdmin ? (
                        <button
                          type="button"
                          onClick={() => setShowPostForm((v) => !v)}
                          className="sanctuary-interactive rounded-full bg-amber-400 px-3.5 py-1.5 text-xs font-extrabold text-stone-950 hover:bg-amber-300"
                        >
                          {showPostForm ? "✕ Close Form" : "+ Post Story"}
                        </button>
                      ) : null
                    }
                  />
                </div>
              )}

              {/* Tab 2: Site & Topic Map */}
              {activeTab === "map" && (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="p-3 border-b border-white/12">
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Jump to any Bani, Granth, Matriarch, or essay…"
                      className="dark-input w-full rounded-xl border border-amber-400/40 bg-black/55 px-3.5 py-2 text-xs text-white placeholder:text-zinc-400 focus:border-amber-300"
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
                          className="rounded-xl border border-white/15 bg-white/[0.04] overflow-hidden"
                        >
                          <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-white/[0.05]">
                            <button
                              type="button"
                              onClick={() => {
                                setIsOpen(false);
                                router.push(group.href);
                              }}
                              className="text-left min-w-0 flex-1 text-white hover:text-amber-300 transition"
                            >
                              <span className="block font-bold text-xs truncate">
                                {group.label}
                              </span>
                              <span className="block text-[11px] text-zinc-300">
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
                              aria-label={`Toggle ${group.label}`}
                              className="px-2 py-1 rounded border border-white/20 text-[10px] font-bold text-amber-200 hover:border-amber-400"
                            >
                              {expanded ? "▲" : "▼"}
                            </button>
                          </div>

                          {expanded && (
                            <ul className="divide-y divide-white/10">
                              {group.topics.map((topic) => {
                                const isHidden = archivedSet.has(topic.id);
                                return (
                                  <li key={`${group.key}-${topic.id}`}>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleJumpToTopic(group, topic)
                                      }
                                      className="w-full text-left px-3 py-2.5 hover:bg-amber-400/15 transition flex items-center justify-between gap-2 group"
                                    >
                                      <div className="min-w-0">
                                        <p className="text-xs font-semibold text-white group-hover:text-amber-200 truncate">
                                          {topic.title}
                                        </p>
                                        {topic.subtitle && (
                                          <p className="text-[11px] text-zinc-300 truncate">
                                            {topic.subtitle}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0">
                                        {isHidden && isVerifiedLiveEdit && (
                                          <span className="px-1.5 py-0.5 rounded bg-amber-400/25 text-amber-200 text-[9px] font-bold">
                                            Hidden
                                          </span>
                                        )}
                                        <span className="text-xs text-amber-300">
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
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>,
    document.body
  );
}
