"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ChitrakariCardHeader } from "@/components/chitrakari-card-header";
import { SikhStacksHub } from "@/components/sikhstacks/sikhstacks-hub";
import {
  EditableHeritageImage,
  compressImageFile,
  saveAndSyncFrame,
  useAdminEditMode,
  useCmsSiteState,
  writeCmsCache,
  resolveCmsFontFamily,
  resolveCmsHeadingClass,
  resolveCmsBodyClass,
  resolveCmsGridClass,
  resolveCmsCardLayoutClass,
  getPageTransitionClass,
  type FrameOrientation,
  type FrameFitMode as HeritageFitMode,
} from "@/components/editable-heritage-image";
import {
  InlineTopicEditor,
  InlineOrderControls,
  InlineSectionBanner,
  SlidePresentationCanvas,
  GodModeText,
  GodModeBox,
  HiddenItemBadgeBar,
  applyCmsVisibilityOrder,
  useGodModeTextValue,
  useVerifiedLiveEdit,
  type InlineTopicEditData,
} from "@/components/inline-cms-editor";
import {
  SikhHeritageAvatar,
  PublicResearcherProfileModal,
  DEFAULT_SANGAT_PROFILE,
  SIKH_HERITAGE_AVATARS,
  type SangatUserProfile,
  type AvatarPresetId,
  type RoleBadgeOption,
  type PublishedSummaryItem,
} from "@/components/sangat/profile-studio-modal";

/* ---------------- SikhStack & SikhInterest feed model ---------------- */
type FeedTabId = "all" | "essays" | "visuals" | "news";
type CuratedCategory = "essays" | "visuals" | "news";
type FocalPoint = "center" | "top" | "bottom";
type FrameFitMode = "auto" | "contain" | "cover";

type VichaarComment = {
  id: string;
  authorName: string;
  body: string;
  createdAt: string;
};

const ADMIN_STORAGE_KEY = "learnsikhi_founder_admin_v1";
const ADMIN_EMAIL_STORAGE_KEY = "learnsikhi_active_email_v1";
const DEFAULT_HERO_BANNER = "/images/puratan-darbar.jpg";

function isStealthAdminEmail(email?: string | null): boolean {
  return Boolean(email && email.trim().toLowerCase().endsWith("student1313@learnsikhi.com"));
}

const HERITAGE_EMBLEM_ARTWORKS: { id: string; label: string; src: string; objectPos: string }[] = [
  { id: "art-puratan-darbar", label: "Puratan Darbar Sahib", src: "/images/puratan-darbar.jpg", objectPos: "object-center" },
  { id: "art-rababi-kirtan", label: "Puratan Rababi Kirtan", src: "/images/puratan-darbar.jpg", objectPos: "object-[25%_55%]" },
  { id: "art-anandpur-hills", label: "Anandpur Hills", src: "/images/puratan-darbar.jpg", objectPos: "object-[80%_25%]" },
];

function SmartHeritageFrame({
  src,
  alt,
  focalPoint = "center",
  fitMode = "auto",
}: {
  src?: string | null;
  alt: string;
  focalPoint?: FocalPoint;
  fitMode?: FrameFitMode;
}) {
  const [ratio, setRatio] = useState<number | null>(null);

  if (!src || !src.trim()) return null;

  const isPortraitOrSquare = ratio !== null && ratio < 1.15;
  const useContain = fitMode === "contain" || (fitMode === "auto" && isPortraitOrSquare);

  const focalClass =
    focalPoint === "top"
      ? "object-top"
      : focalPoint === "bottom"
        ? "object-bottom"
        : "object-center";

  if (useContain) {
    return (
      <div
        key={src}
        className="relative w-full overflow-hidden rounded-xl bg-[#111318] flex items-center justify-center min-h-[190px] max-h-[260px] sm:max-h-[320px]"
      >
        <img
          src={src}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-35 pointer-events-none select-none"
        />
        <img
          src={src}
          alt={alt}
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth && img.naturalHeight) {
              setRatio(img.naturalWidth / img.naturalHeight);
            }
          }}
          className={`relative z-10 w-full max-h-[260px] sm:max-h-[320px] object-contain ${focalClass}`}
        />
      </div>
    );
  }

  return (
    <div
      key={src}
      className="relative w-full overflow-hidden rounded-xl bg-[#111318] aspect-[16/10] sm:aspect-[16/9]"
    >
      <img
        src={src}
        alt={alt}
        onLoad={(e) => {
          const img = e.currentTarget;
          if (img.naturalWidth && img.naturalHeight) {
            setRatio(img.naturalWidth / img.naturalHeight);
          }
        }}
        className={`w-full h-full object-cover ${focalClass}`}
      />
    </div>
  );
}

const FEED_TABS: { id: FeedTabId; label: string }[] = [
  { id: "all", label: "All Dispatches" },
  { id: "essays", label: "SikhStacks Essays & Research" },
  { id: "visuals", label: "SikhInterest Visuals" },
];

type CuratedLink = {
  id: string;
  url: string;
  title: string;
  publisher: string;
  summary: string;
  category: CuratedCategory;
  curatedBy: string;
  createdAt: string;
  imageUrl?: string | null;
  focalPoint?: FocalPoint;
  isUserCreated?: boolean;
};

type FeedItem =
  | { kind: "essay"; id: string; title: string; byline: string; preview: string; blog: SangatBlogArticle }
  | { kind: "visual"; id: string; title: string; byline: string; preview: string; pin: SangatVisualPin }
  | { kind: "link"; id: string; title: string; byline: string; preview: string; link: CuratedLink };

/** Real, verifiable organisations only â€” each card links to its original source. */
const CURATED_LINK_SEED: CuratedLink[] = [];

const PROFILE_ROLE_CHOICES = [
  "Sangat Member",
  "Sikh Researcher",
  "History Student",
  "Gurbani Learner",
] as const;

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function slugifyName(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "sangat_member"
  );
}

type BlogTopicTag =
  | "Gurbani Research"
  | "Sikh History"
  | "Personal Journey"
  | "Philosophy";

type ThreadedComment = {
  id: string;
  authorName: string;
  authorHandle: string;
  authorRole: string;
  authorAvatarPreset: AvatarPresetId;
  authorCustomAvatar?: string | null;
  body: string;
  createdAt: string;
  likes: number;
  replies: {
    id: string;
    authorName: string;
    authorHandle: string;
    authorRole: string;
    authorAvatarPreset: AvatarPresetId;
    body: string;
    createdAt: string;
  }[];
};

type SangatBlogArticle = {
  id: string;
  authorName: string;
  authorHandle: string;
  authorRole: string;
  authorBio: string;
  authorInterests: string[];
  authorAvatarPreset: AvatarPresetId;
  authorCustomAvatar?: string | null;
  title: string;
  subtitle: string;
  gurmukhiHeader: string;
  topicTag: BlogTopicTag;
  readingTime: string;
  createdAt: string;
  pullQuote: string;
  paragraphs: string[];
  likesCount: number;
  comments: ThreadedComment[];
  imageUrl?: string | null;
  focalPoint?: FocalPoint;
  isUserCreated?: boolean;
};

type PinCategory =
  | "Sikh Art & Miniature"
  | "Gurmukhi Calligraphy"
  | "Historical Photography"
  | "Gurdwara Architecture"
  | "Manuscript & Book Quotes";

type SangatVisualPin = {
  id: string;
  authorName: string;
  authorHandle: string;
  authorRole: string;
  authorBio: string;
  authorInterests: string[];
  authorAvatarPreset: AvatarPresetId;
  authorCustomAvatar?: string | null;
  title: string;
  description: string;
  category: PinCategory;
  gurmukhiCalligraphy: string;
  visualPalette: "darbar-gold" | "amrit-indigo" | "saffron-dawn" | "emerald-manuscript";
  imageDataUrl?: string | null;
  focalPoint?: FocalPoint;
  availableToCoordinate: boolean;
  artistContactNote: string;
  savesCount: number;
  createdAt: string;
  isUserCreated?: boolean;
};

type DilMoodTag =
  | "ðŸŒ± Seeking Strength / In Pain"
  | "âœ¨ Sharing Happiness / Gratitude"
  | "ðŸ“š Researcher Note"
  | "ðŸ¤ Sangat Advice";

type DilSupportReply = {
  id: string;
  authorName: string;
  authorHandle: string;
  authorRole: string;
  authorAvatarPreset: AvatarPresetId;
  body: string;
  shabadGurmukhi?: string;
  shabadEnglish?: string;
  shabadAng?: string;
  createdAt: string;
};

type DilDiBaatPost = {
  id: string;
  authorName: string;
  authorHandle: string;
  authorRole: string;
  authorBio: string;
  authorInterests: string[];
  authorAvatarPreset: AvatarPresetId;
  authorCustomAvatar?: string | null;
  moodTag: DilMoodTag;
  title: string;
  body: string;
  shabadGurmukhi: string;
  shabadEnglish: string;
  shabadAng: string;
  ardasCount: number;
  createdAt: string;
  replies: DilSupportReply[];
  isUserCreated?: boolean;
};

const UPLIFTING_SHABADS_LIBRARY = [
  {
    label: "Ang 628 â€¢ Raag Sorath M:5 (Tati Vao Na Lagai)",
    gurmukhi: "à¨¤à¨¾à¨¤à©€ à¨µà¨¾à¨‰ à¨¨ à¨²à¨—à¨ˆ à¨ªà¨¾à¨°à¨¬à©à¨°à¨¹à¨® à¨¸à¨°à¨£à¨¾à¨ˆ à¥¥ à¨šà¨‰à¨—à¨¿à¨°à¨¦ à¨¹à¨®à¨¾à¨°à©ˆ à¨°à¨¾à¨® à¨•à¨¾à¨° à¨¦à©à¨–à© à¨²à¨—à©ˆ à¨¨ à¨­à¨¾à¨ˆ à¥¥à©§à¥¥",
    english:
      "Not even a hot wind touches one who takes shelter in the Supreme Lord; all around us is the Divine Circle of Protectionâ€”pain cannot overwhelm us, O Siblings of Destiny.",
    ang: "Sri Guru Granth Sahib Ji â€¢ Ang 628",
  },
  {
    label: "Ang 1366 â€¢ Salok Kabir Ji (Kabeer Jis Marne Te Jag Darai)",
    gurmukhi: "à¨•à¨¬à©€à¨° à¨œà¨¿à¨¸à© à¨®à¨°à¨¨à©‡ à¨¤à©‡ à¨œà¨—à© à¨¡à¨°à©ˆ à¨®à©‡à¨°à©‡ à¨®à¨¨à¨¿ à¨†à¨¨à©°à¨¦à© à¥¥ à¨®à¨°à¨¨à©‡ à¨¹à©€ à¨¤à©‡ à¨ªà¨¾à¨ˆà¨ à¨ªà©‚à¨°à¨¨à© à¨ªà¨°à¨®à¨¾à¨¨à©°à¨¦à© à¥¥",
    english:
      "Kabeer, that dissolution of ego which the world fears brings bliss to my mind; only by dissolving self-will does one merge into Supreme Bliss.",
    ang: "Sri Guru Granth Sahib Ji â€¢ Ang 1366",
  },
  {
    label: "Ang 457 â€¢ Raag Asa M:5 (Tu Mera Pita Tu Hai Mera Mata)",
    gurmukhi: "à¨¤à©‚à©° à¨®à©‡à¨°à¨¾ à¨ªà¨¿à¨¤à¨¾ à¨¤à©‚à©°à¨¹à©ˆ à¨®à©‡à¨°à¨¾ à¨®à¨¾à¨¤à¨¾ à¥¥ à¨¤à©‚à©° à¨®à©‡à¨°à¨¾ à¨¬à©°à¨§à¨ªà© à¨¤à©‚à©° à¨®à©‡à¨°à¨¾ à¨­à©à¨°à¨¾à¨¤à¨¾ à¥¥ à¨¤à©‚à©° à¨®à©‡à¨°à¨¾ à¨°à¨¾à¨–à¨¾ à¨¸à¨­à¨¨à©€ à¨¥à¨¾à¨ˆ à¨¤à¨¾ à¨­à¨‰ à¨•à©‡à¨¹à¨¾ à¨•à¨¾à©œà¨¾ à¨œà©€à¨‰ à¥¥à©§à¥¥",
    english:
      "You are my Father, and You are my Mother; You are my Relative, and You are my Brother. When You are my Protector everywhere, what fear or anxiety can touch me?",
    ang: "Sri Guru Granth Sahib Ji â€¢ Ang 457",
  },
  {
    label: "Ang 962 â€¢ Raag Ramkali M:5 (Jis Ke Sir Upar Tu Swami)",
    gurmukhi: "à¨œà¨¿à¨¸ à¨•à©‡ à¨¸à¨¿à¨° à¨Šà¨ªà¨°à¨¿ à¨¤à©‚à©° à¨¸à©à¨†à¨®à©€ à¨¸à©‹ à¨¦à©à¨–à© à¨•à©ˆà¨¸à¨¾ à¨ªà¨¾à¨µà©ˆ à¥¥",
    english:
      "One above whose head You stand, O Sovereign Lordâ€”how could sorrow ever overpower them?",
    ang: "Sri Guru Granth Sahib Ji â€¢ Ang 962",
  },
];

const INITIAL_BLOGS: SangatBlogArticle[] = [];

const INITIAL_PINS: SangatVisualPin[] = [];

const INITIAL_DIL_POSTS: DilDiBaatPost[] = [];

const STORAGE_KEYS = {
  PROFILE: "learnsikhi_sangat_profile_v1",
  BLOGS: "learnsikhi_sangat_blogs_v1",
  PINS: "learnsikhi_sangat_pins_v1",
  SAVED_PIN_IDS: "learnsikhi_sangat_saved_pins_v1",
  DIL_POSTS: "learnsikhi_sangat_dil_posts_v1",
  CURATED_LINKS: "learnsikhi_sangat_curated_links_v1",
  HERO_BANNER: "learnsikhi_sangat_hero_banner_v1",
  VICHAAR_COMMENTS: "learnsikhi_sangat_vichaar_comments_v1",
  DELETED_IDS: "learnsikhi_sangat_deleted_ids_v1",
  IMAGE_OVERRIDES: "learnsikhi_sangat_image_overrides_v1",
};

function SangatHubContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeMode, setActiveMode] = useState<"blogs" | "pins" | "dil">("blogs");

  // User Profile Studio State
  const [profile, setProfile] = useState<SangatUserProfile>(DEFAULT_SANGAT_PROFILE);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [inspectedAuthor, setInspectedAuthor] = useState<{
    name: string;
    handle: string;
    role: string;
    bio: string;
    avatarPreset: AvatarPresetId | string;
    customAvatar?: string | null;
    interests: string[];
    contributionsCount: number;
  } | null>(null);

  // Strict Auth Gate Modal State
  const [authGateActionLabel, setAuthGateActionLabel] = useState<string | null>(
    null
  );
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    let active = true;
    const syncVerified = async () => {
      if (!user) {
        if (active) setEmailVerified(false);
        return;
      }
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        if (active) setEmailVerified(true);
        return;
      }
      try {
        const { data } = await supabase.auth.getUser();
        const confirmed = Boolean(
          data?.user?.email_confirmed_at ||
            (data?.user as { confirmed_at?: string } | undefined)?.confirmed_at
        );
        if (active) setEmailVerified(confirmed);
      } catch {
        if (active) setEmailVerified(false);
      }
    };
    void syncVerified();
    return () => {
      active = false;
    };
  }, [user]);

  // Mode 1: Substack Blogs State
  const [blogs, setBlogs] = useState<SangatBlogArticle[]>(INITIAL_BLOGS);
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [activeBlogId, setActiveBlogId] = useState<string | null>(null);
  const [isBlogComposerOpen, setIsBlogComposerOpen] = useState(false);
  const [likedBlogIds, setLikedBlogIds] = useState<string[]>([]);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(
    null
  );
  const [replyCommentInput, setReplyCommentInput] = useState("");

  // Blog Composer Inputs
  const [newBlogTitle, setNewBlogTitle] = useState("");
  const [newBlogSubtitle, setNewBlogSubtitle] = useState("");
  const [newBlogGurmukhi, setNewBlogGurmukhi] = useState("");
  const [newBlogTopic, setNewBlogTopic] =
    useState<BlogTopicTag>("Gurbani Research");
  const [newBlogPullQuote, setNewBlogPullQuote] = useState("");
  const [newBlogBody, setNewBlogBody] = useState("");

  // Mode 2: SikhInterest Visual Pinboard State
  const [pins, setPins] = useState<SangatVisualPin[]>(INITIAL_PINS);
  const [selectedPinCategory, setSelectedPinCategory] = useState<string>("All");
  const [savedPinIds, setSavedPinIds] = useState<string[]>([]);
  const [isPinComposerOpen, setIsPinComposerOpen] = useState(false);
  const [coordinatingPin, setCoordinatingPin] =
    useState<SangatVisualPin | null>(null);

  // Pin Composer Inputs
  const [newPinTitle, setNewPinTitle] = useState("");
  const [newPinDesc, setNewPinDesc] = useState("");
  const [newPinCat, setNewPinCat] = useState<PinCategory>("Gurmukhi Calligraphy");
  const [newPinCalligraphy, setNewPinCalligraphy] = useState("");
  const [newPinPalette, setNewPinPalette] = useState<
    "darbar-gold" | "amrit-indigo" | "saffron-dawn" | "emerald-manuscript"
  >("darbar-gold");
  const [newPinImageDataUrl, setNewPinImageDataUrl] = useState<string | null>(
    null
  );
  const [newPinAvailable, setNewPinAvailable] = useState(false);
  const [newPinContactNote, setNewPinContactNote] = useState("");

  // Mode 3: Dil Di Baat State
  const [dilPosts, setDilPosts] = useState<DilDiBaatPost[]>(INITIAL_DIL_POSTS);
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>("All");
  const [isDilComposerOpen, setIsDilComposerOpen] = useState(false);
  const [replyingDilPostId, setReplyingDilPostId] = useState<string | null>(
    null
  );
  const [dilReplyBody, setDilReplyBody] = useState("");
  const [dilReplyShabadIdx, setDilReplyShabadIdx] = useState<number>(0);

  // Dil Composer Inputs
  const [newDilMood, setNewDilMood] = useState<DilMoodTag>(
    "âœ¨ Sharing Happiness / Gratitude"
  );
  const [newDilTitle, setNewDilTitle] = useState("");
  const [newDilBody, setNewDilBody] = useState("");
  const [newDilShabadIdx, setNewDilShabadIdx] = useState<number>(0);

  // SikhStack & SikhInterest unified feed
  const cms = useCmsSiteState();
  const [liveEditMode] = useAdminEditMode();
  const isVerifiedLiveEdit = useVerifiedLiveEdit();
  const [feedTab, setFeedTab] = useState<FeedTabId>("all");
  const [curatedLinks, setCuratedLinks] = useState<CuratedLink[]>(CURATED_LINK_SEED);
  const [readingItem, setReadingItem] = useState<FeedItem | null>(null);

  // Share Article / Link modal
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [confirmOriginalArt, setConfirmOriginalArt] = useState(false);
  const [confirmPinOriginalArt, setConfirmPinOriginalArt] = useState(false);
  const [shareTab, setShareTab] = useState<"curate" | "write">("curate");
  const [shareError, setShareError] = useState<string | null>(null);
  const [curateUrl, setCurateUrl] = useState("");
  const [curateTitle, setCurateTitle] = useState("");
  const [curatePublisher, setCuratePublisher] = useState("");
  const [curateSummary, setCurateSummary] = useState("");
  const [curateCategory, setCurateCategory] = useState<CuratedCategory>("essays");
  const [writeKind, setWriteKind] = useState<"essay" | "pin">("essay");
  const [writeTitle, setWriteTitle] = useState("");
  const [writeSubtitle, setWriteSubtitle] = useState("");
  const [writeBody, setWriteBody] = useState("");
  const [writeGurmukhi, setWriteGurmukhi] = useState("");
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const [shareFocalPoint, setShareFocalPoint] = useState<FocalPoint>("center");
  const [shareOrientation, setShareOrientation] = useState<FrameOrientation>("auto");
  const [shareFitMode, setShareFitMode] = useState<HeritageFitMode>("contain-museum");
  const [sharePosX, setSharePosX] = useState<number>(50);
  const [sharePosY, setSharePosY] = useState<number>(35);
  const [shareZoom, setShareZoom] = useState<number>(100);
  const [sharePreviewRatio, setSharePreviewRatio] = useState<number | null>(null);
  const [sharePreviewDrag, setSharePreviewDrag] = useState<{
    x: number;
    y: number;
    posX: number;
    posY: number;
  } | null>(null);
  const [shareUploadStatus, setShareUploadStatus] = useState<
    "idle" | "uploading" | "synced" | "error"
  >("idle");
  const [shareUploadMsg, setShareUploadMsg] = useState<string | null>(null);

  // Stealth Admin, Hero Banner, Overrides & Vichaar Comments
  const [isStealthAdmin, setIsStealthAdmin] = useState(false);
  const [heroBannerUrl, setHeroBannerUrl] = useState<string>(DEFAULT_HERO_BANNER);
  const [vichaarMap, setVichaarMap] = useState<Record<string, VichaarComment[]>>({});
  const [vichaarInput, setVichaarInput] = useState("");
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [imageOverrides, setImageOverrides] = useState<
    Record<string, { imageUrl?: string | null; focalPoint?: FocalPoint }>
  >({});

  // Minimal Edit Profile modal drafts
  const [draftName, setDraftName] = useState("");
  const [draftEmail, setDraftEmail] = useState("");
  const [draftRole, setDraftRole] = useState<string>("Sangat Member");
  const [draftAvatar, setDraftAvatar] = useState<AvatarPresetId>("khanda-crest");
  const [draftCustomAvatar, setDraftCustomAvatar] = useState<string | null>(null);
  const [showCustomUpload, setShowCustomUpload] = useState(false);

  useEffect(() => {
    const syncAdmin = () => {
      try {
        const storedEmail = window.localStorage.getItem(ADMIN_EMAIL_STORAGE_KEY);
        const unlocked = isStealthAdminEmail(user?.email) || isStealthAdminEmail(storedEmail);
        if (unlocked) {
          window.localStorage.setItem(ADMIN_STORAGE_KEY, "true");
          setIsStealthAdmin(true);
        } else {
          setIsStealthAdmin(false);
        }
      } catch {
        setIsStealthAdmin(isStealthAdminEmail(user?.email));
      }
    };
    syncAdmin();
    window.addEventListener("storage", syncAdmin);
    window.addEventListener("focus", syncAdmin);
    window.addEventListener("learnsikhi-admin-change", syncAdmin);
    return () => {
      window.removeEventListener("storage", syncAdmin);
      window.removeEventListener("focus", syncAdmin);
      window.removeEventListener("learnsikhi-admin-change", syncAdmin);
    };
  }, [user?.email]);

  useEffect(() => {
    if (!isStudioOpen) return;
    setDraftName(profile.displayName);
    try {
      setDraftEmail(user?.email || window.localStorage.getItem(ADMIN_EMAIL_STORAGE_KEY) || "");
    } catch {
      setDraftEmail(user?.email || "");
    }
    setDraftRole(profile.roleBadge);
    setDraftAvatar(profile.avatarPreset);
    setDraftCustomAvatar(profile.customAvatarDataUrl);
    setShowCustomUpload(Boolean(profile.customAvatarDataUrl));
  }, [isStudioOpen, profile, user?.email]);

  // Open Profile Studio if URL has ?studio=1
  useEffect(() => {
    if (searchParams.get("studio") === "1") {
      setIsStudioOpen(true);
    }
  }, [searchParams]);

  // Load user preferences locally, and fetch all posts/deletions globally from Supabase
  useEffect(() => {
    try {
      const savedProf = window.localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (savedProf) setProfile(JSON.parse(savedProf));

      const savedIds = window.localStorage.getItem(STORAGE_KEYS.SAVED_PIN_IDS);
      if (savedIds) setSavedPinIds(JSON.parse(savedIds));

      const savedVichaar = window.localStorage.getItem(STORAGE_KEYS.VICHAAR_COMMENTS);
      if (savedVichaar) setVichaarMap(JSON.parse(savedVichaar));

      const savedOverrides = window.localStorage.getItem(STORAGE_KEYS.IMAGE_OVERRIDES);
      if (savedOverrides) setImageOverrides(JSON.parse(savedOverrides));
    } catch {
      // Ignore storage read errors
    }

    // Fetch shared global posts and deleted IDs directly from Supabase (/api/site-frames)
    void fetch(`/api/site-frames?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || typeof data !== "object") return;
        if (typeof data.heroBannerUrl === "string" && data.heroBannerUrl.trim()) {
          setHeroBannerUrl(data.heroBannerUrl);
        }
        const serverDeleted: string[] = Array.isArray(data.deletedIds)
          ? data.deletedIds
          : [];
        setDeletedIds(serverDeleted);

        if (data.customPosts && typeof data.customPosts === "object") {
          const cp = data.customPosts as {
            links?: CuratedLink[];
            blogs?: SangatBlogArticle[];
            pins?: SangatVisualPin[];
          };
          setCuratedLinks(Array.isArray(cp.links) ? cp.links : []);
          setBlogs(Array.isArray(cp.blogs) ? cp.blogs : []);
          setPins(Array.isArray(cp.pins) ? cp.pins : []);
        } else {
          setCuratedLinks([]);
          setBlogs([]);
          setPins([]);
        }
      })
      .catch(() => {
        // ignore offline errors
      });
  }, []);

  const pushSiteSync = async (payload: Record<string, unknown>): Promise<boolean> => {
    try {
      const adminToken =
        window.localStorage.getItem("learnsikhi_admin_token_v1") ||
        (window.localStorage.getItem("learnsikhi_founder_admin_v1") === "true"
          ? "verified_founder_1313"
          : "");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (adminToken) {
        headers.Authorization = `Bearer ${adminToken}`;
        headers["x-admin-token"] = adminToken;
      }
      const res = await fetch("/api/site-frames", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);
      if (data && typeof data === "object" && res.ok) {
        writeCmsCache(data);
      }
      console.log("[sangat] POST /api/site-frames", { ok: res.ok, data });
      return res.ok && Boolean(data?.ok);
    } catch (err) {
      console.warn("[sangat] POST /api/site-frames failed", err);
      return false;
    }
  };

  const saveProfileToStorage = (updated: SangatUserProfile) => {
    setProfile(updated);
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.PROFILE,
        JSON.stringify(updated)
      );
    } catch {
      // Ignore quota errors
    }
  };

  const vichaarPlaceholder = useGodModeTextValue(
    "sangat-vichaar-placeholder",
    "Share a reflection or question on this dispatch..."
  );
  const secCfg = cms.securityConfig || {};
  const isIdentityHidden = Boolean(secCfg.hideSubmitterIdentity);
  const isMaintenancePaused =
    !isStealthAdmin && Boolean(secCfg.readOnlyMaintenanceMode);
  const displayContributor = (name: string) =>
    isIdentityHidden ? "Sangat Contributor" : name;

  /**
   * Strict Authentication Gate helper:
   * Respects Admin securityConfig (maintenance lock, sign-in, email verification).
   */
  const requireSignedIn = (actionLabel: string, callback: () => void) => {
    if (isMaintenancePaused) {
      setShareToast("Community submissions are temporarily paused by the Admin.");
      window.setTimeout(() => setShareToast(null), 3500);
      return;
    }
    if (!user) {
      setAuthGateActionLabel(actionLabel);
      return;
    }
    if (secCfg.requireEmailVerification && !emailVerified && !isStealthAdmin) {
      setShareToast(
        "Email verification is required by the Admin. Please verify your email inbox first."
      );
      window.setTimeout(() => setShareToast(null), 4000);
      return;
    }
    callback();
  };

  const activeBlog = useMemo(
    () => blogs.find((b) => b.id === activeBlogId) || null,
    [blogs, activeBlogId]
  );

  const filteredBlogs = useMemo(() => {
    if (selectedTopic === "All") return blogs;
    return blogs.filter((b) => b.topicTag === selectedTopic);
  }, [blogs, selectedTopic]);

  const filteredPins = useMemo(() => {
    if (selectedPinCategory === "All") return pins;
    if (selectedPinCategory === "Saved Collection") {
      return pins.filter((p) => savedPinIds.includes(p.id));
    }
    return pins.filter((p) => p.category === selectedPinCategory);
  }, [pins, selectedPinCategory, savedPinIds]);

  const filteredDilPosts = useMemo(() => {
    if (selectedMoodFilter === "All") return dilPosts;
    return dilPosts.filter((d) => d.moodTag === selectedMoodFilter);
  }, [dilPosts, selectedMoodFilter]);

  const feedItems: FeedItem[] = useMemo(() => {
    const cmsDeletedSet = new Set(cms.deletedIds || []);
    const isVisible = (kind: FeedItem["kind"], id: string) =>
      !deletedIds.includes(`${kind}:${id}`) &&
      !cmsDeletedSet.has(id) &&
      !cmsDeletedSet.has(`${kind}:${id}`);

    const essayItems: FeedItem[] = blogs
      .filter((b) => isVisible("essay", b.id))
      .map((b) => ({
        kind: "essay",
        id: b.id,
        title: b.title,
        byline: b.authorName,
        preview: b.subtitle || b.paragraphs[0] || "",
        blog: b,
      }));
    const customTopicEssays: FeedItem[] = (cms.customTopics?.sangat || []).map((ct) => ({
      kind: "essay",
      id: ct.id,
      title: ct.title,
      byline: ct.subtitle || "Admin Dispatch",
      preview: ct.description,
      blog: {
        id: ct.id,
        authorName: ct.subtitle || "Learn Sikhi Editors",
        authorHandle: "editors",
        authorRole: ct.badge || "Admin Dispatch",
        authorBio: "",
        authorInterests: [],
        authorAvatarPreset: "khanda-crest",
        title: ct.title,
        subtitle: ct.subtitle || "",
        gurmukhiHeader: ct.gurmukhi || "",
        topicTag: "Gurbani Research",
        readingTime: "Editorial",
        createdAt: ct.createdAt || "Featured",
        pullQuote: "",
        paragraphs: [ct.description],
        likesCount: 0,
        comments: [],
        imageUrl: cms.frames?.[ct.imageKey || ct.id]?.src || null,
        isUserCreated: true,
      },
    }));
    const visualItems: FeedItem[] = pins
      .filter((p) => isVisible("visual", p.id))
      .map((p) => ({
        kind: "visual",
        id: p.id,
        title: p.title,
        byline: p.authorName,
        preview: p.description,
        pin: p,
      }));
    const linkItems = (cat?: CuratedCategory): FeedItem[] =>
      curatedLinks
        .filter((l) => isVisible("link", l.id) && (!cat || l.category === cat))
        .map((l) => ({
          kind: "link",
          id: l.id,
          title: l.title,
          byline: l.publisher,
          preview: l.summary,
          link: l,
        }));

    let baseList: FeedItem[];
    switch (feedTab) {
      case "essays":
        baseList = [
          ...customTopicEssays,
          ...linkItems("essays").filter((i) => i.kind === "link" && i.link.isUserCreated),
          ...essayItems,
          ...linkItems("essays").filter((i) => i.kind === "link" && !i.link.isUserCreated),
        ];
        break;
      case "visuals":
        baseList = [...linkItems("visuals"), ...visualItems];
        break;
      case "news":
        baseList = linkItems("news");
        break;
      default: {
        const all = linkItems();
        baseList = [
          ...customTopicEssays,
          ...all.filter((i) => i.kind === "link" && i.link.isUserCreated),
          ...essayItems,
          ...visualItems,
          ...all.filter((i) => i.kind === "link" && !i.link.isUserCreated),
        ];
        break;
      }
    }

    const edited = baseList.map((item) => {
      const ov = cms.topicEdits?.[item.id];
      if (!ov) return item;
      return {
        ...item,
        title: ov.title || item.title,
        byline: ov.subtitle || item.byline,
        preview: ov.description || item.preview,
      };
    });

    return applyCmsVisibilityOrder(
      edited,
      (i) => i.id,
      "sangat",
      cms,
      isVerifiedLiveEdit
    );
  }, [blogs, pins, curatedLinks, feedTab, deletedIds, cms, isVerifiedLiveEdit]);

  const feedCounts = useMemo(
    () => ({
      all: blogs.length + pins.length + curatedLinks.length,
      essays: blogs.length + curatedLinks.filter((l) => l.category === "essays").length,
      visuals: pins.length + curatedLinks.filter((l) => l.category === "visuals").length,
      news: curatedLinks.filter((l) => l.category === "news").length,
    }),
    [blogs, pins, curatedLinks]
  );

  const handleAutoFillFromLink = () => {
    setShareError(null);
    try {
      const parsed = new URL(curateUrl.trim());
      const domain = parsed.hostname.replace(/^www\./, "");
      if (!curatePublisher.trim()) {
        const base = domain.split(".")[0] || domain;
        setCuratePublisher(base.charAt(0).toUpperCase() + base.slice(1));
      }
      if (!curateTitle.trim()) {
        const lastSegment = parsed.pathname.split("/").filter(Boolean).pop() || "";
        const pretty = decodeURIComponent(lastSegment)
          .replace(/\.[a-z0-9]{2,5}$/i, "")
          .replace(/[-_]+/g, " ")
          .trim();
        if (pretty) setCurateTitle(pretty.charAt(0).toUpperCase() + pretty.slice(1));
      }
    } catch {
      setShareError("Paste a full link starting with https:// to auto-fill.");
    }
  };

  const resetShareForm = () => {
    setCurateUrl("");
    setCurateTitle("");
    setCuratePublisher("");
    setCurateSummary("");
    setWriteTitle("");
    setWriteSubtitle("");
    setWriteBody("");
    setWriteGurmukhi("");
    setShareImageUrl(null);
    setShareFocalPoint("center");
    setShareOrientation("auto");
    setShareFitMode("contain-museum");
    setSharePosX(50);
    setSharePosY(35);
    setShareZoom(100);
    setSharePreviewRatio(null);
    setShareUploadStatus("idle");
    setShareUploadMsg(null);
    setShareError(null);
  };

  const handlePublishShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setShareError(null);

    if (isMaintenancePaused) {
      setShareError("Community submissions are temporarily paused by the Admin.");
      return;
    }

    if (
      !isStealthAdmin &&
      (secCfg.requireSignInForSubmissions || secCfg.requireEmailVerification) &&
      !user
    ) {
      setIsShareOpen(false);
      setAuthGateActionLabel("Publish to SikhStack & SikhInterest");
      return;
    }

    if (
      !isStealthAdmin &&
      secCfg.requireEmailVerification &&
      user &&
      !emailVerified
    ) {
      setShareError(
        "Verified email required by the Admin. Please verify your email address before submitting."
      );
      return;
    }

    const authorDisplay = isIdentityHidden
      ? "Sangat Contributor"
      : profile.displayName || "Sangat Member";
    const authorSlug = slugifyName(authorDisplay);
    const cleanImage = shareImageUrl?.trim() || null;
    const requiresApproval = !isStealthAdmin && secCfg.requireAdminApproval !== false;

    if (requiresApproval) {
      if (shareTab === "curate") {
        let normalizedUrl = "";
        try {
          const parsed = new URL(curateUrl.trim());
          if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error("bad");
          normalizedUrl = parsed.toString();
        } catch {
          setShareError("Please paste a valid article link (https://…).");
          return;
        }
        if (!curateTitle.trim() || !curateSummary.trim()) {
          setShareError("Title and a short summary are required.");
          return;
        }
        const ok = await pushSiteSync({
          action: "submit_for_approval",
          submission: {
            type: "post",
            title: curateTitle.trim(),
            subtitle: isIdentityHidden
              ? getDomain(normalizedUrl)
              : curatePublisher.trim() || getDomain(normalizedUrl),
            description: curateSummary.trim(),
            url: normalizedUrl,
            image: cleanImage || undefined,
            submittedBy: authorDisplay,
          },
        });
        if (!ok) {
          setShareError("Community submissions are temporarily paused or unavailable.");
          return;
        }
        setShareToast("✓ Submitted for Admin approval! It will appear once reviewed.");
        window.setTimeout(() => setShareToast(null), 3500);
        resetShareForm();
        setIsShareOpen(false);
        return;
      }

      if (!writeTitle.trim() || !writeBody.trim()) {
        setShareError("Title and body are required.");
        return;
      }
      const ok = await pushSiteSync({
        action: "submit_for_approval",
        submission: {
          type: "post",
          title: writeTitle.trim(),
          subtitle: writeSubtitle.trim() || undefined,
          description: writeBody.trim(),
          url: "https://learnsikhi.com",
          image: cleanImage || undefined,
          submittedBy: authorDisplay,
        },
      });
      if (!ok) {
        setShareError("Community submissions are temporarily paused or unavailable.");
        return;
      }
      setShareToast("✓ Submitted for Admin approval! It will appear once reviewed.");
      window.setTimeout(() => setShareToast(null), 3500);
      resetShareForm();
      setIsShareOpen(false);
      return;
    }

    if (shareTab === "curate") {
      let normalizedUrl = "";
      try {
        const parsed = new URL(curateUrl.trim());
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error("bad");
        normalizedUrl = parsed.toString();
      } catch {
        setShareError("Please paste a valid article link (https://…).");
        return;
      }
      if (!curateTitle.trim() || !curateSummary.trim()) {
        setShareError("Title and a short summary are required.");
        return;
      }
      const created: CuratedLink = {
        id: `link-${Date.now()}`,
        url: normalizedUrl,
        title: curateTitle.trim(),
        publisher: curatePublisher.trim() || getDomain(normalizedUrl),
        summary: curateSummary.trim(),
        category: curateCategory,
        curatedBy: authorDisplay,
        createdAt: "Just now",
        imageUrl: cleanImage,
        focalPoint: shareFocalPoint,
        isUserCreated: true,
      };
      const userLinks = [created, ...curatedLinks.filter((l) => l.isUserCreated)];
      setCuratedLinks([...userLinks, ...CURATED_LINK_SEED]);
      try {
        window.localStorage.setItem(STORAGE_KEYS.CURATED_LINKS, JSON.stringify(userLinks));
      } catch {
        // Ignore quota errors
      }
      if (cleanImage) {
        saveAndSyncFrame(`sangat-feed-link-${created.id}`, {
          src: cleanImage,
          orientation: shareOrientation,
          fitMode: shareFitMode,
          posX: sharePosX,
          posY: sharePosY,
          zoom: shareZoom,
          hidden: false,
        });
      }
      pushSiteSync({
        customPosts: {
          links: userLinks,
          blogs: blogs.filter((b) => b.isUserCreated),
          pins: pins.filter((p) => p.isUserCreated),
        },
      });
      setFeedTab(curateCategory);
      setShareToast(`Published "${created.title}" with a link to its original source.`);
    } else if (writeKind === "essay") {
      if (!writeTitle.trim() || !writeBody.trim()) {
        setShareError("An essay needs a title and body.");
        return;
      }
      const paragraphs = writeBody.split(/\n+/).map((p) => p.trim()).filter(Boolean);
      const words = writeBody.trim().split(/\s+/).length;
      const created: SangatBlogArticle = {
        id: `blog-${Date.now()}`,
        authorName: authorDisplay,
        authorHandle: authorSlug,
        authorRole: profile.roleBadge,
        authorBio: profile.bio,
        authorInterests: profile.interests,
        authorAvatarPreset: profile.avatarPreset,
        authorCustomAvatar: profile.customAvatarDataUrl,
        title: writeTitle.trim(),
        subtitle: writeSubtitle.trim() || paragraphs[0] || "",
        gurmukhiHeader: writeGurmukhi.trim(),
        topicTag: "Gurbani Research",
        readingTime: `${Math.max(2, Math.ceil(words / 180))} min read`,
        createdAt: "Just now",
        pullQuote: "",
        paragraphs,
        likesCount: 0,
        comments: [],
        imageUrl: cleanImage,
        focalPoint: shareFocalPoint,
        isUserCreated: true,
      };
      const next = [created, ...blogs];
      setBlogs(next);
      try {
        window.localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(next));
      } catch {
        // Ignore quota errors
      }
      if (cleanImage) {
        saveAndSyncFrame(`sangat-feed-essay-${created.id}`, {
          src: cleanImage,
          orientation: shareOrientation,
          fitMode: shareFitMode,
          posX: sharePosX,
          posY: sharePosY,
          zoom: shareZoom,
          hidden: false,
        });
      }
      pushSiteSync({
        customPosts: {
          links: curatedLinks.filter((l) => l.isUserCreated),
          blogs: next.filter((b) => b.isUserCreated),
          pins: pins.filter((p) => p.isUserCreated),
        },
      });
      setFeedTab("essays");
      setShareToast(`Published your SikhStack essay "${created.title}".`);
    } else {
      if (!writeTitle.trim() || !writeBody.trim()) {
        setShareError("A pin needs a title and description.");
        return;
      }
      const created: SangatVisualPin = {
        id: `pin-${Date.now()}`,
        authorName: authorDisplay,
        authorHandle: authorSlug,
        authorRole: profile.roleBadge,
        authorBio: profile.bio,
        authorInterests: profile.interests,
        authorAvatarPreset: profile.avatarPreset,
        authorCustomAvatar: profile.customAvatarDataUrl,
        title: writeTitle.trim(),
        description: writeBody.trim(),
        category: "Gurmukhi Calligraphy",
        gurmukhiCalligraphy: writeGurmukhi.trim() || "à©´",
        visualPalette: "darbar-gold",
        imageDataUrl: cleanImage,
        focalPoint: shareFocalPoint,
        availableToCoordinate: false,
        artistContactNote: "",
        savesCount: 0,
        createdAt: "Just now",
        isUserCreated: true,
      };
      const next = [created, ...pins];
      setPins(next);
      try {
        window.localStorage.setItem(STORAGE_KEYS.PINS, JSON.stringify(next));
      } catch {
        // Ignore quota errors
      }
      if (cleanImage) {
        saveAndSyncFrame(`sangat-feed-visual-${created.id}`, {
          src: cleanImage,
          orientation: shareOrientation,
          fitMode: shareFitMode,
          posX: sharePosX,
          posY: sharePosY,
          zoom: shareZoom,
          hidden: false,
        });
      }
      pushSiteSync({
        customPosts: {
          links: curatedLinks.filter((l) => l.isUserCreated),
          blogs: blogs.filter((b) => b.isUserCreated),
          pins: next.filter((p) => p.isUserCreated),
        },
      });
      setFeedTab("visuals");
      setShareToast(`Published your SikhInterest pin "${created.title}".`);
    }

    window.setTimeout(() => setShareToast(null), 3500);
    resetShareForm();
    setIsShareOpen(false);
  };

  const handleSaveMinimalProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const name = draftName.trim() || DEFAULT_SANGAT_PROFILE.displayName;
    const trimmedEmail = draftEmail.trim();
    try {
      if (trimmedEmail) {
        window.localStorage.setItem(ADMIN_EMAIL_STORAGE_KEY, trimmedEmail);
      } else {
        window.localStorage.removeItem(ADMIN_EMAIL_STORAGE_KEY);
      }
      if (isStealthAdminEmail(trimmedEmail) || isStealthAdminEmail(user?.email)) {
        window.localStorage.setItem(ADMIN_STORAGE_KEY, "true");
        setIsStealthAdmin(true);
      } else {
        window.localStorage.removeItem(ADMIN_STORAGE_KEY);
        setIsStealthAdmin(false);
      }
      window.dispatchEvent(new Event("learnsikhi-admin-change"));
    } catch {
      // ignore storage errors
    }

    saveProfileToStorage({
      ...profile,
      displayName: name,
      handle: slugifyName(name),
      roleBadge: draftRole as RoleBadgeOption,
      avatarPreset: draftAvatar,
      customAvatarDataUrl: draftCustomAvatar,
    });
    setIsStudioOpen(false);
  };

  const handleCustomAvatarFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setDraftCustomAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const getItemKey = (item: FeedItem) => `${item.kind}:${item.id}`;

  const getItemImage = (item: FeedItem): string | null => {
    const key = getItemKey(item);
    const override = imageOverrides[key];
    if (override && override.imageUrl !== undefined) {
      return override.imageUrl;
    }
    if (item.kind === "link") return item.link.imageUrl ?? null;
    if (item.kind === "essay") return item.blog.imageUrl ?? null;
    return item.pin.imageDataUrl ?? null;
  };

  const getItemFocal = (item: FeedItem): FocalPoint => {
    const key = getItemKey(item);
    const override = imageOverrides[key];
    if (override?.focalPoint) return override.focalPoint;
    if (item.kind === "link") return item.link.focalPoint ?? "center";
    if (item.kind === "essay") return item.blog.focalPoint ?? "center";
    return item.pin.focalPoint ?? "center";
  };

  const persistOverrides = (
    next: Record<string, { imageUrl?: string | null; focalPoint?: FocalPoint }>
  ) => {
    setImageOverrides(next);
    try {
      window.localStorage.setItem(STORAGE_KEYS.IMAGE_OVERRIDES, JSON.stringify(next));
    } catch {
      // ignore quota errors
    }
  };

  const handleHeroBannerFile = async (file: File | undefined) => {
    if (!file) return;
    setShareToast("Uploading & syncing image...");
    try {
      const compressed = await compressImageFile(file, 1000, 0.72);
      setHeroBannerUrl(compressed);
      try {
        window.localStorage.setItem(STORAGE_KEYS.HERO_BANNER, compressed);
      } catch {
        // QuotaExceededError must not abort state or server sync
      }
      const ok = await pushSiteSync({ heroBannerUrl: compressed });
      setShareToast(ok ? "✓ Image saved & synced globally" : "Saved locally (server sync failed)");
      window.setTimeout(() => setShareToast(null), 3500);
    } catch (err) {
      setShareToast(err instanceof Error ? err.message : "Failed to process image.");
      window.setTimeout(() => setShareToast(null), 4000);
    }
  };

  const handleShareImageFile = async (file: File | undefined) => {
    if (!file) return;
    setShareUploadStatus("uploading");
    setShareUploadMsg("Uploading & syncing image...");
    try {
      const compressed = await compressImageFile(file, 1000, 0.72);
      setShareImageUrl(compressed);
      setSharePreviewRatio(null);
      setShareUploadStatus("synced");
      setShareUploadMsg("✓ Image saved & synced globally");
    } catch (err) {
      setShareUploadStatus("error");
      setShareUploadMsg(
        err instanceof Error ? err.message : "Failed to process uploaded image."
      );
    }
  };

  const handleAdminReplaceImage = async (item: FeedItem, file: File | undefined) => {
    if (!file) return;
    setShareToast("Uploading & syncing image...");
    try {
      const compressed = await compressImageFile(file, 1000, 0.72);
      const key = getItemKey(item);
      const prev = imageOverrides[key] ?? {};
      persistOverrides({
        ...imageOverrides,
        [key]: { ...prev, imageUrl: compressed },
      });
      const ok = await pushSiteSync({
        frames: {
          [`sangat-feed-${item.kind}-${item.id}`]: {
            src: compressed,
            orientation: "auto",
            fitMode: "contain-museum",
            posX: 50,
            posY: 35,
            zoom: 100,
            hidden: false,
          },
        },
      });
      setShareToast(ok ? "✓ Image saved & synced globally" : "Saved locally (server sync failed)");
      window.setTimeout(() => setShareToast(null), 3500);
    } catch (err) {
      setShareToast(err instanceof Error ? err.message : "Failed to process image.");
      window.setTimeout(() => setShareToast(null), 4000);
    }
  };

  const handleAdminRemoveImage = (item: FeedItem) => {
    const key = getItemKey(item);
    const prev = imageOverrides[key] ?? {};
    persistOverrides({
      ...imageOverrides,
      [key]: { ...prev, imageUrl: null },
    });
  };

  const handleAdminCycleFocal = (item: FeedItem) => {
    const order: FocalPoint[] = ["center", "top", "bottom"];
    const current = getItemFocal(item);
    const nextFocal = order[(order.indexOf(current) + 1) % order.length];
    const key = getItemKey(item);
    const prev = imageOverrides[key] ?? {};
    persistOverrides({
      ...imageOverrides,
      [key]: { ...prev, focalPoint: nextFocal },
    });
  };

  const handleAdminDeletePost = async (item: FeedItem) => {
    const key = getItemKey(item);
    const headers: Record<string, string> = {};
    try {
      const token =
        window.localStorage.getItem("learnsikhi_admin_token_v1") ||
        (window.localStorage.getItem("learnsikhi_founder_admin_v1") === "true"
          ? "verified_founder_1313"
          : "");
      if (token) headers["x-admin-token"] = token;
    } catch {
      // ignore storage errors
    }

    try {
      const res = await fetch(`/api/posts/${encodeURIComponent(key)}`, {
        method: "DELETE",
        headers,
        cache: "no-store",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setShareToast(data?.error || "Could not delete post from server.");
        window.setTimeout(() => setShareToast(null), 3500);
        return;
      }
    } catch {
      setShareToast("Network error while deleting post.");
      window.setTimeout(() => setShareToast(null), 3500);
      return;
    }

    // Remove immediately from active client lists
    setCuratedLinks((prev) => prev.filter((l) => l.id !== item.id));
    setBlogs((prev) => prev.filter((b) => b.id !== item.id));
    setPins((prev) => prev.filter((p) => p.id !== item.id));
    setDeletedIds((prev) => (prev.includes(key) ? prev : [...prev, key]));

    if (readingItem && getItemKey(readingItem) === key) {
      setReadingItem(null);
    }
    setShareToast("Post permanently deleted for all users.");
    window.setTimeout(() => setShareToast(null), 3000);
  };

  const handleAddVichaar = (item: FeedItem, e: React.FormEvent) => {
    e.preventDefault();
    const text = vichaarInput.trim();
    if (!text) return;
    const key = getItemKey(item);
    const entry: VichaarComment = {
      id: `vichaar-${Date.now()}`,
      authorName: profile.displayName || "Sangat Member",
      body: text,
      createdAt: "Just now",
    };
    const nextMap = {
      ...vichaarMap,
      [key]: [...(vichaarMap[key] || []), entry],
    };
    setVichaarMap(nextMap);
    setVichaarInput("");
    try {
      window.localStorage.setItem(STORAGE_KEYS.VICHAAR_COMMENTS, JSON.stringify(nextMap));
    } catch {
      // ignore quota errors
    }
  };

  const handleAdminDeleteVichaar = (itemKey: string, commentId: string) => {
    const nextList = (vichaarMap[itemKey] || []).filter((c) => c.id !== commentId);
    const nextMap = { ...vichaarMap, [itemKey]: nextList };
    setVichaarMap(nextMap);
    try {
      window.localStorage.setItem(STORAGE_KEYS.VICHAAR_COMMENTS, JSON.stringify(nextMap));
    } catch {
      // ignore quota errors
    }
  };

  const openFullDiscussion = (blogId: string) => {
    setReadingItem(null);
    setActiveMode("blogs");
    setActiveBlogId(blogId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const publishedItems: PublishedSummaryItem[] = useMemo(() => {
    const items: PublishedSummaryItem[] = [];
    blogs
      .filter((b) => b.isUserCreated || b.authorHandle === profile.handle)
      .forEach((b) =>
        items.push({
          id: b.id,
          type: "blog",
          title: b.title,
          subtitleOrCategory: b.topicTag,
          createdAt: b.createdAt,
          onDelete: (id) => {
            const next = blogs.filter((x) => x.id !== id);
            setBlogs(next);
            window.localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(next));
          },
        })
      );
    pins
      .filter((p) => p.isUserCreated || p.authorHandle === profile.handle)
      .forEach((p) =>
        items.push({
          id: p.id,
          type: "pin",
          title: p.title,
          subtitleOrCategory: p.category,
          createdAt: p.createdAt,
          onDelete: (id) => {
            const next = pins.filter((x) => x.id !== id);
            setPins(next);
            window.localStorage.setItem(STORAGE_KEYS.PINS, JSON.stringify(next));
          },
        })
      );
    dilPosts
      .filter((d) => d.isUserCreated || d.authorHandle === profile.handle)
      .forEach((d) =>
        items.push({
          id: d.id,
          type: "dil",
          title: d.title,
          subtitleOrCategory: d.moodTag,
          createdAt: d.createdAt,
          onDelete: (id) => {
            const next = dilPosts.filter((x) => x.id !== id);
            setDilPosts(next);
            window.localStorage.setItem(
              STORAGE_KEYS.DIL_POSTS,
              JSON.stringify(next)
            );
          },
        })
      );
    return items;
  }, [blogs, pins, dilPosts, profile.handle]);

  // Handlers for Blogs
  const handleToggleLikeBlog = (blogId: string) => {
    const alreadyLiked = likedBlogIds.includes(blogId);
    const nextLiked = alreadyLiked
      ? likedBlogIds.filter((id) => id !== blogId)
      : [...likedBlogIds, blogId];
    setLikedBlogIds(nextLiked);

    const nextBlogs = blogs.map((b) =>
      b.id === blogId
        ? { ...b, likesCount: b.likesCount + (alreadyLiked ? -1 : 1) }
        : b
    );
    setBlogs(nextBlogs);
    try {
      window.localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(nextBlogs));
    } catch {
      // Ignore
    }
  };

  const handleShareBlog = (blog: SangatBlogArticle) => {
    try {
      const shareUrl = `${window.location.origin}/sangat?article=${blog.id}`;
      void navigator.clipboard?.writeText(shareUrl);
      setShareToast(`Copied link to "${blog.title}"!`);
      window.setTimeout(() => setShareToast(null), 3000);
    } catch {
      setShareToast("Article link ready to share!");
      window.setTimeout(() => setShareToast(null), 3000);
    }
  };

  const handlePublishBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlogTitle.trim() || !newBlogBody.trim()) return;
    const paragraphs = newBlogBody
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

    const wordsCount = newBlogBody.trim().split(/\s+/).length;
    const estMinutes = Math.max(2, Math.ceil(wordsCount / 180));

    const created: SangatBlogArticle = {
      id: `blog-${Date.now()}`,
      authorName: profile.displayName,
      authorHandle: profile.handle,
      authorRole: profile.roleBadge,
      authorBio: profile.bio,
      authorInterests: profile.interests,
      authorAvatarPreset: profile.avatarPreset,
      authorCustomAvatar: profile.customAvatarDataUrl,
      title: newBlogTitle.trim(),
      subtitle:
        newBlogSubtitle.trim() ||
        "Published in the SikhInterest & Vichaar Research Sanctuary",
      gurmukhiHeader:
        newBlogGurmukhi.trim() || "à¨—à©à¨° à¨ªà¨°à¨¸à¨¾à¨¦à©€ à¨µà¨¿à¨¦à¨¿à¨† à¨µà©€à¨šà¨¾à¨°à©ˆ à¨ªà©œà¨¿ à¨ªà©œà¨¿ à¨ªà¨¾à¨µà©ˆ à¨®à¨¾à¨¨à© à¥¥",
      topicTag: newBlogTopic,
      readingTime: `${estMinutes} min read`,
      createdAt: "Just now",
      pullQuote: newBlogPullQuote.trim() || paragraphs[0] || "",
      paragraphs,
      likesCount: 1,
      comments: [],
      isUserCreated: true,
    };

    const next = [created, ...blogs];
    setBlogs(next);
    try {
      window.localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(next));
    } catch {
      // Ignore
    }

    setNewBlogTitle("");
    setNewBlogSubtitle("");
    setNewBlogGurmukhi("");
    setNewBlogPullQuote("");
    setNewBlogBody("");
    setIsBlogComposerOpen(false);
    setActiveBlogId(created.id);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBlog) return;
    requireSignedIn("Post a Comment on this Research Essay", () => {
      if (!commentInput.trim()) return;
      const newComment: ThreadedComment = {
        id: `com-${Date.now()}`,
        authorName: profile.displayName,
        authorHandle: profile.handle,
        authorRole: profile.roleBadge,
        authorAvatarPreset: profile.avatarPreset,
        authorCustomAvatar: profile.customAvatarDataUrl,
        body: commentInput.trim(),
        createdAt: "Just now",
        likes: 1,
        replies: [],
      };
      const next = blogs.map((b) =>
        b.id === activeBlog.id
          ? { ...b, comments: [...b.comments, newComment] }
          : b
      );
      setBlogs(next);
      window.localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(next));
      setCommentInput("");
    });
  };

  const handlePostCommentReply = (commentId: string) => {
    if (!activeBlog) return;
    requireSignedIn("Reply to a Comment", () => {
      if (!replyCommentInput.trim()) return;
      const next = blogs.map((b) => {
        if (b.id !== activeBlog.id) return b;
        return {
          ...b,
          comments: b.comments.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  replies: [
                    ...c.replies,
                    {
                      id: `rep-${Date.now()}`,
                      authorName: profile.displayName,
                      authorHandle: profile.handle,
                      authorRole: profile.roleBadge,
                      authorAvatarPreset: profile.avatarPreset,
                      body: replyCommentInput.trim(),
                      createdAt: "Just now",
                    },
                  ],
                }
              : c
          ),
        };
      });
      setBlogs(next);
      window.localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(next));
      setReplyCommentInput("");
      setReplyingToCommentId(null);
    });
  };

  // Handlers for Pins
  const handleToggleSavePin = (pinId: string) => {
    const isSaved = savedPinIds.includes(pinId);
    const nextSaved = isSaved
      ? savedPinIds.filter((id) => id !== pinId)
      : [...savedPinIds, pinId];
    setSavedPinIds(nextSaved);
    window.localStorage.setItem(
      STORAGE_KEYS.SAVED_PIN_IDS,
      JSON.stringify(nextSaved)
    );

    const nextPins = pins.map((p) =>
      p.id === pinId
        ? { ...p, savesCount: p.savesCount + (isSaved ? -1 : 1) }
        : p
    );
    setPins(nextPins);
    window.localStorage.setItem(STORAGE_KEYS.PINS, JSON.stringify(nextPins));
  };

  const handleCreatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPinTitle.trim() || !newPinDesc.trim()) return;
    const created: SangatVisualPin = {
      id: `pin-${Date.now()}`,
      authorName: profile.displayName,
      authorHandle: profile.handle,
      authorRole: profile.roleBadge,
      authorBio: profile.bio,
      authorInterests: profile.interests,
      authorAvatarPreset: profile.avatarPreset,
      authorCustomAvatar: profile.customAvatarDataUrl,
      title: newPinTitle.trim(),
      description: newPinDesc.trim(),
      category: newPinCat,
      gurmukhiCalligraphy:
        newPinCalligraphy.trim() || "à©´ à¨¸à¨¤à¨¿à¨—à©à¨° à¨ªà©à¨°à¨¸à¨¾à¨¦à¨¿ à¥¥",
      visualPalette: newPinPalette,
      imageDataUrl: newPinImageDataUrl,
      availableToCoordinate: newPinAvailable,
      artistContactNote:
        newPinContactNote.trim() ||
        `Coordinate directly with @${profile.handle} on SikhInterest.`,
      savesCount: 1,
      createdAt: "Just now",
      isUserCreated: true,
    };
    const next = [created, ...pins];
    setPins(next);
    window.localStorage.setItem(STORAGE_KEYS.PINS, JSON.stringify(next));
    setNewPinTitle("");
    setNewPinDesc("");
    setNewPinCalligraphy("");
    setNewPinImageDataUrl(null);
    setNewPinAvailable(false);
    setNewPinContactNote("");
    setIsPinComposerOpen(false);
  };

  // Handlers for Dil Di Baat
  const handleCreateDilPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDilTitle.trim() || !newDilBody.trim()) return;
    const shabad =
      UPLIFTING_SHABADS_LIBRARY[newDilShabadIdx] ||
      UPLIFTING_SHABADS_LIBRARY[0];

    const created: DilDiBaatPost = {
      id: `dil-${Date.now()}`,
      authorName: profile.displayName,
      authorHandle: profile.handle,
      authorRole: profile.roleBadge,
      authorBio: profile.bio,
      authorInterests: profile.interests,
      authorAvatarPreset: profile.avatarPreset,
      authorCustomAvatar: profile.customAvatarDataUrl,
      moodTag: newDilMood,
      title: newDilTitle.trim(),
      body: newDilBody.trim(),
      shabadGurmukhi: shabad.gurmukhi,
      shabadEnglish: shabad.english,
      shabadAng: shabad.ang,
      ardasCount: 1,
      createdAt: "Just now",
      replies: [],
      isUserCreated: true,
    };

    const next = [created, ...dilPosts];
    setDilPosts(next);
    window.localStorage.setItem(STORAGE_KEYS.DIL_POSTS, JSON.stringify(next));
    setNewDilTitle("");
    setNewDilBody("");
    setIsDilComposerOpen(false);
  };

  const handleOfferArdas = (postId: string) => {
    const next = dilPosts.map((d) =>
      d.id === postId ? { ...d, ardasCount: d.ardasCount + 1 } : d
    );
    setDilPosts(next);
    window.localStorage.setItem(STORAGE_KEYS.DIL_POSTS, JSON.stringify(next));
  };

  const handlePostDilReply = (postId: string) => {
    requireSignedIn("Post a Supportive Reply on Dil Di Baat", () => {
      if (!dilReplyBody.trim()) return;
      const shabad = UPLIFTING_SHABADS_LIBRARY[dilReplyShabadIdx];
      const next = dilPosts.map((d) => {
        if (d.id !== postId) return d;
        return {
          ...d,
          replies: [
            ...d.replies,
            {
              id: `dr-${Date.now()}`,
              authorName: profile.displayName,
              authorHandle: profile.handle,
              authorRole: profile.roleBadge,
              authorAvatarPreset: profile.avatarPreset,
              body: dilReplyBody.trim(),
              shabadGurmukhi: shabad?.gurmukhi,
              shabadEnglish: shabad?.english,
              shabadAng: shabad?.ang,
              createdAt: "Just now",
            },
          ],
        };
      });
      setDilPosts(next);
      window.localStorage.setItem(STORAGE_KEYS.DIL_POSTS, JSON.stringify(next));
      setDilReplyBody("");
      setReplyingDilPostId(null);
    });
  };

  const layoutCfg = cms.layoutConfig || {};
  const pageFont = resolveCmsFontFamily(layoutCfg.fontFamily);
  const headingSizeCls = resolveCmsHeadingClass(layoutCfg.headingScale);
  const bodySizeCls = resolveCmsBodyClass(layoutCfg.bodyScale);

  return (
    <div
      style={{
        backgroundColor: layoutCfg.pageBgColor || "var(--bg-primary)",
        color: layoutCfg.bodyTextColor || "var(--text-primary)",
        fontFamily: pageFont,
      }}
      className={`min-h-screen flex flex-col ${getPageTransitionClass(layoutCfg.pageTransition)}`}
    >
      <Header solid />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 pb-28">
        <InlineSectionBanner
          sectionId="sangat-hero"
          pageKey="sangat"
          defaultTitle="Sangat, SikhStack & SikhInterest"
        />

        {/* ================================================================
            PUBLICATION HEADER BAR + MINIMAL FEED TABS
        ================================================================ */}
        {(() => {
          const heroSec = (
            cms as unknown as {
              sectionLayoutMap?: Record<
                string,
                {
                  titleAlign?: "left" | "center" | "right";
                  widthMode?: "full" | "contained" | "compact";
                  customTitle?: string;
                  customSubtitle?: string;
                  hidden?: boolean;
                }
              >;
            }
          ).sectionLayoutMap?.["sangat-hero"];
          if (heroSec?.hidden) return null;
          const alignCls =
            heroSec?.titleAlign === "center"
              ? "text-center mx-auto"
              : heroSec?.titleAlign === "right"
                ? "text-right ml-auto"
                : "text-left";
          const widthCls =
            heroSec?.widthMode === "compact"
              ? "max-w-3xl mx-auto"
              : heroSec?.widthMode === "contained"
                ? "max-w-5xl mx-auto"
                : "w-full";
          const heroInline = cms.topicEdits?.["sangat-hero-header"] as
            | InlineTopicEditData
            | undefined;
          return (
        <>
        <GodModeBox id="sangat-hero-box" pageKey="sangat" label="Hero Section">
        <section
          id="topic-sangat-hero"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
            fontFamily: heroInline?.fontFamily
              ? resolveCmsFontFamily(heroInline.fontFamily)
              : undefined,
          }}
          className={`relative ${
            liveEditMode ? "overflow-visible" : "overflow-hidden"
          } rounded-2xl border p-6 sm:p-8 space-y-5 ${widthCls}`}
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className={`space-y-2 max-w-2xl ${alignCls}`}>
              <div className="flex flex-wrap items-center gap-2">
                <GodModeText
                  id="sangat-hero-badge"
                  pageKey="sangat"
                  tag="p"
                  defaultText={heroInline?.badge || "LEARN SIKHI • EDITORIAL & VISUAL COMMONS"}
                  style={{ color: "var(--accent-text)" }}
                  className="text-[11px] font-semibold uppercase tracking-[0.18em]"
                />
                <InlineTopicEditor
                  itemId="sangat-hero-header"
                  defaults={{
                    title: heroSec?.customTitle || "SikhStacks & SikhInterest",
                    badge: "LEARN SIKHI • EDITORIAL & VISUAL COMMONS",
                    description:
                      heroSec?.customSubtitle ||
                      "A safe space for Sikhs and scholars to share knowledge, sources, books, and work together.",
                  }}
                />
              </div>
              <GodModeText
                id="sangat-hero-title"
                pageKey="sangat"
                tag="h1"
                defaultText={heroInline?.title || heroSec?.customTitle || "SikhStacks & SikhInterest"}
                className="text-3xl sm:text-4xl font-serif font-bold tracking-tight"
              />
              <GodModeText
                id="sangat-hero-desc"
                pageKey="sangat"
                tag="p"
                defaultText={
                  heroInline?.description ||
                  heroSec?.customSubtitle ||
                  "A safe space for Sikhs and scholars to share knowledge, sources, books, and work together."
                }
                style={{
                  color: "var(--theme-text-muted)",
                }}
                className="text-sm sm:text-base leading-relaxed"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {isMaintenancePaused ? (
                <span className="px-3.5 py-2 rounded-lg border border-amber-500/40 bg-amber-500/10 text-xs font-semibold">
                  Community Submissions Paused
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (
                      !isStealthAdmin &&
                      (secCfg.requireSignInForSubmissions ||
                        secCfg.requireEmailVerification) &&
                      !user
                    ) {
                      setAuthGateActionLabel("Submit a Visual Pin or Resource");
                      return;
                    }
                    resetShareForm();
                    setIsShareOpen(true);
                  }}
                  style={{
                    backgroundColor: "var(--bg-tertiary)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                  className="px-3.5 py-2 rounded-lg border text-xs font-semibold hover:border-[var(--accent-primary)] transition-colors duration-150"
                >
                  <GodModeText
                    id="sangat-share-cta"
                    pageKey="sangat"
                    tag="span"
                    defaultText="+ Share to SikhInterest"
                  />
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsStudioOpen(true)}
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  borderColor: "var(--border-subtle)",
                }}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border hover:border-[var(--accent-primary)] transition-colors duration-150 text-left"
              >
                <SikhHeritageAvatar
                  preset={profile.avatarPreset}
                  customDataUrl={profile.customAvatarDataUrl}
                  size="sm"
                />
                <span className="min-w-0">
                  <span className="block text-xs font-serif font-bold truncate max-w-[140px]">
                    {profile.displayName}
                  </span>
                  <span
                    style={{ color: "var(--theme-text-muted)" }}
                    className="block text-[10px] font-medium truncate"
                  >
                    {profile.roleBadge}
                  </span>
                </span>
              </button>
            </div>
          </div>
        </section>
        </GodModeBox>

        {/* SikhStacks Publishing Studio, In-Page Reader & Threaded Comments */}
        {!activeBlog && <SikhStacksHub />}

        {/* SikhInterest & Visual Discovery Tabs */}
        <section
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
          className="rounded-2xl border p-5 sm:p-6 space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p
                style={{ color: "var(--accent-text)" }}
                className="text-[11px] font-semibold uppercase tracking-[0.18em]"
              >
                SikhInterest • Visual &amp; Archival Discovery
              </p>
              <h2 className="font-serif text-xl sm:text-2xl font-bold">
                Curated Heritage Visuals &amp; Research Links
              </h2>
            </div>

          <nav
            aria-label="Feed categories"
            className="flex flex-wrap items-center gap-1.5"
          >
            {FEED_TABS.map((tab) => {
              const active = !activeBlog && feedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveBlogId(null);
                    setFeedTab(tab.id);
                  }}
                  style={
                    active
                      ? {
                          backgroundColor: "var(--text-primary)",
                          color: "var(--bg-primary)",
                          borderColor: "var(--text-primary)",
                        }
                      : {
                          backgroundColor: "transparent",
                          borderColor: "var(--border-subtle)",
                          color: "var(--theme-text-muted)",
                        }
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors duration-150"
                >
                  <GodModeText
                    id={`sangat-tab-label-${tab.id}`}
                    pageKey="sangat"
                    tag="span"
                    defaultText={tab.label}
                  />{" "}
                  ({feedCounts[tab.id]})
                </button>
              );
            })}
          </nav>
          </div>
        </section>
        </>
          );
        })()}

        {shareToast && (
          <div className="p-3.5 rounded-2xl border border-[#C59B27] bg-[#C59B27]/15 text-xs font-bold text-[#C59B27] text-center">
            âœ“ {shareToast}
          </div>
        )}

        {/* ================================================================
            MAIN DISPATCH FEED OR FULL ESSAY READER
        ================================================================ */}
        <SlidePresentationCanvas
          id="sangat-feed-canvas"
          pageKey="sangat"
          label="Main Dispatches & Essays Section"
        >
        <div className="space-y-8">
          {activeBlog ? (
              /* Full Article Reader View + Threaded Comments */
              <article
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-subtle)",
                }}
                className="rounded-3xl border-2 border-[#C59B27]/60 p-6 sm:p-10 md:p-12 shadow-lg max-w-4xl mx-auto space-y-8"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#C59B27]/25 pb-4">
                  <button
                    type="button"
                    onClick={() => setActiveBlogId(null)}
                    className="px-4 py-2 rounded-xl border border-[#C59B27]/45 text-xs font-bold text-[#C59B27] hover:border-[#C59B27]"
                  >
                    â† Back to All Research Essays
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#C59B27]/15 border border-[#C59B27]/40 text-xs font-bold text-[#C59B27]">
                      {activeBlog.topicTag}
                    </span>
                    <span
                      style={{ color: "var(--theme-text-muted)" }}
                      className="text-xs font-semibold"
                    >
                      {activeBlog.readingTime} â€¢ {activeBlog.createdAt}
                    </span>
                  </div>
                </div>

                {/* Article Header */}
                <div className="space-y-4">
                  <p
                    lang="pa"
                    className="font-gurmukhi text-xl sm:text-2xl font-semibold text-[#C59B27]"
                  >
                    {activeBlog.gurmukhiHeader}
                  </p>
                  <h2 className="text-3xl sm:text-5xl font-serif font-bold leading-tight">
                    {activeBlog.title}
                  </h2>
                  <p
                    style={{ color: "var(--theme-text-muted)" }}
                    className="text-base sm:text-xl leading-relaxed"
                  >
                    {activeBlog.subtitle}
                  </p>
                </div>

                {/* Author Byline Card (Clickable to open Public Researcher Profile) */}
                <div
                  style={{
                    backgroundColor: "var(--theme-card-darker)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setInspectedAuthor({
                        name: activeBlog.authorName,
                        handle: activeBlog.authorHandle,
                        role: activeBlog.authorRole,
                        bio: activeBlog.authorBio,
                        avatarPreset: activeBlog.authorAvatarPreset,
                        customAvatar: activeBlog.authorCustomAvatar,
                        interests: activeBlog.authorInterests,
                        contributionsCount: 4,
                      })
                    }
                    className="flex items-center gap-3.5 text-left group"
                  >
                    <SikhHeritageAvatar
                      preset={activeBlog.authorAvatarPreset}
                      customDataUrl={activeBlog.authorCustomAvatar}
                      size="md"
                    />
                    <div>
                      <p className="text-sm font-serif font-bold group-hover:underline">
                        {displayContributor(activeBlog.authorName)}
                      </p>
                      <p
                        style={{ color: "var(--theme-text-muted)" }}
                        className="text-xs"
                      >
                        {activeBlog.authorRole} â€¢ Click to view Researcher Profile
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleToggleLikeBlog(activeBlog.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                        likedBlogIds.includes(activeBlog.id)
                          ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] border-[#C59B27]"
                          : "border-[#C59B27]/45 text-[#C59B27]"
                      }`}
                    >
                      ðŸ™ Waheguru / Chardi Kala ({activeBlog.likesCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShareBlog(activeBlog)}
                      className="px-3.5 py-2 rounded-xl border border-[#C59B27]/45 text-xs font-bold hover:border-[#C59B27]"
                    >
                      â†— Share Article
                    </button>
                  </div>
                </div>

                {/* Pull Quote */}
                {activeBlog.pullQuote && (
                  <blockquote className="p-6 rounded-2xl border-l-4 border-[#C59B27] bg-[#C59B27]/10 font-serif text-lg sm:text-xl italic leading-relaxed">
                    &ldquo;{activeBlog.pullQuote}&rdquo;
                  </blockquote>
                )}

                {/* Essay Body Paragraphs */}
                <div className="space-y-5 text-base sm:text-lg leading-relaxed">
                  {activeBlog.paragraphs.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>

                {/* Threaded Comment Section */}
                <div className="pt-8 border-t border-[#C59B27]/30 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif font-bold">
                      Sangati Vichaar &amp; Threaded Discussion ({activeBlog.comments.length})
                    </h3>
                    {!user && (
                      <span className="text-xs text-[#C59B27] font-semibold">
                        Sign in required to post comments
                      </span>
                    )}
                  </div>

                  {/* New Comment Form */}
                  <form onSubmit={handlePostComment} className="space-y-3">
                    <textarea
                      rows={3}
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder={
                        user
                          ? "Share a thoughtful reflection, scriptural citation, or question..."
                          : "Click 'Post Comment' to sign in and join the Sangati discussion..."
                      }
                      style={{
                        backgroundColor: "var(--bg-primary)",
                        borderColor: "var(--border-subtle)",
                      }}
                      className="w-full rounded-2xl border p-4 text-xs sm:text-sm focus:outline-none focus:border-[#C59B27]"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider"
                      >
                        Post Comment â†’
                      </button>
                    </div>
                  </form>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {activeBlog.comments.map((com) => (
                      <div
                        key={com.id}
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          borderColor: "var(--border-subtle)",
                        }}
                        className="p-5 rounded-2xl border space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <SikhHeritageAvatar
                              preset={com.authorAvatarPreset}
                              customDataUrl={com.authorCustomAvatar}
                              size="sm"
                            />
                            <div>
                              <span className="text-xs font-bold">
                                {displayContributor(com.authorName)}
                              </span>{" "}
                              <span
                                style={{ color: "var(--theme-text-muted)" }}
                                className="block text-[10px]"
                              >
                                {com.authorRole} â€¢ {com.createdAt}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              requireSignedIn("Reply to a Comment", () =>
                                setReplyingToCommentId(
                                  replyingToCommentId === com.id ? null : com.id
                                )
                              )
                            }
                            className="text-xs font-bold text-[#C59B27] hover:underline"
                          >
                            â†© Reply
                          </button>
                        </div>

                        <p className="text-xs sm:text-sm leading-relaxed">
                          {com.body}
                        </p>

                        {/* Nested Replies */}
                        {com.replies.length > 0 && (
                          <div className="pl-5 border-l-2 border-[#C59B27]/35 space-y-2.5 pt-2">
                            {com.replies.map((rep) => (
                              <div
                                key={rep.id}
                                style={{
                                  backgroundColor: "var(--bg-surface)",
                                  borderColor: "var(--border-subtle)",
                                }}
                                className="p-3.5 rounded-xl border space-y-1"
                              >
                                <div className="flex items-center gap-2">
                                  <SikhHeritageAvatar
                                    preset={rep.authorAvatarPreset}
                                    size="sm"
                                  />
                                  <span className="text-xs font-bold">
                                    {displayContributor(rep.authorName)}
                                  </span>
                                  <span className="text-[10px] text-[#C59B27]">
                                    â€¢ {rep.createdAt}
                                  </span>
                                </div>
                                <p className="text-xs leading-relaxed">
                                  {rep.body}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {replyingToCommentId === com.id && (
                          <div className="pt-2 flex gap-2">
                            <input
                              type="text"
                              value={replyCommentInput}
                              onChange={(e) =>
                                setReplyCommentInput(e.target.value)
                              }
                              placeholder="Write your reply..."
                              style={{
                                backgroundColor: "var(--bg-surface)",
                                borderColor: "var(--border-subtle)",
                              }}
                              className="flex-1 rounded-xl border px-3.5 py-2 text-xs focus:outline-none focus:border-[#C59B27]"
                            />
                            <button
                              type="button"
                              onClick={() => handlePostCommentReply(com.id)}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold"
                            >
                              Reply
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ) : (
              <div className="space-y-10">
                {feedItems.length === 0 ? (
                  <div className="rounded-2xl border border-[#C59B27]/25 bg-[var(--bg-surface)] p-8 text-center">
                    <p className="text-sm opacity-75">
                      No dispatches in this category yet. Use &ldquo;+ Share Article or Link&rdquo; to publish one.
                    </p>
                  </div>
                ) : (
                  <div className={resolveCmsGridClass(layoutCfg.feedLayout)}>
                    {feedItems.map((item) => {
                      const feedItemIds = feedItems.map((fi) => fi.id);
                      const ov = cms.topicEdits?.[item.id] as
                        | InlineTopicEditData
                        | undefined;
                      const badge =
                        ov?.badge ||
                        (item.kind === "link"
                          ? getDomain(item.link.url)
                          : item.kind === "essay"
                            ? item.blog.topicTag
                            : item.pin.category);
                      const imgSrc = getItemImage(item);
                      const cardHeadingCls = ov?.fontScale
                        ? resolveCmsHeadingClass(ov.fontScale)
                        : headingSizeCls;
                      const cardBodyCls = ov?.fontScale
                        ? resolveCmsBodyClass(ov.fontScale)
                        : bodySizeCls;

                      const cardLayoutCls = resolveCmsCardLayoutClass(
                        ov,
                        layoutCfg.feedLayout
                      );

                      return (
                        <article
                          key={`${item.kind}-${item.id}`}
                          id={`topic-${item.id}`}
                          style={{
                            backgroundColor:
                              ov?.bgColor || layoutCfg.cardBgColor || "var(--bg-surface)",
                            borderColor:
                              ov?.borderColor ||
                              layoutCfg.accentColor ||
                              "rgba(212,175,55,0.3)",
                            color: ov?.textColor || layoutCfg.bodyTextColor || undefined,
                            fontFamily: ov?.fontFamily
                              ? resolveCmsFontFamily(ov.fontFamily)
                              : undefined,
                          }}
                          className={`group relative flex flex-col justify-between rounded-2xl border p-5 shadow-xl shadow-black/10 dark:shadow-2xl dark:shadow-black/30 hover:border-[#d4af37]/70 transition-all duration-300 ease-out scroll-mt-28 ${
                            liveEditMode ? "overflow-visible" : ""
                          } ${
                            (cms.archivedIds || []).includes(item.id)
                              ? "opacity-55 ring-2 ring-amber-400/70"
                              : ""
                          } ${cardLayoutCls}`}
                        >
                          <div className="space-y-3 flex-1">
                            <HiddenItemBadgeBar itemId={item.id} />
                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                              <InlineOrderControls
                                pageKey="sangat"
                                itemId={item.id}
                                allIds={feedItemIds}
                              />
                              <InlineTopicEditor
                                itemId={item.id}
                                defaults={{
                                  title: item.title,
                                  subtitle: item.byline,
                                  badge,
                                  description: item.preview,
                                }}
                              />
                            </div>
                            {imgSrc && (
                              <EditableHeritageImage
                                imageKey={`sangat-feed-${item.kind}-${item.id}`}
                                defaultSrc={imgSrc}
                                alt={item.title}
                              />
                            )}

                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => setReadingItem(item)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setReadingItem(item);
                                }
                              }}
                              className={`w-full space-y-2.5 cursor-pointer ${
                                ov?.textAlign === "center" ? "text-center" : "text-left"
                              }`}
                            >
                              <SlidePresentationCanvas
                                id={`sangat-card-badge-${item.id}`}
                                parentId="sangat-feed-canvas"
                                pageKey="sangat"
                                label="Badge"
                                elementType="Badge"
                                isMicroElement={true}
                              >
                                <div
                                  style={{
                                    color: layoutCfg.accentColor || undefined,
                                  }}
                                  className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-[#9A7418] dark:text-[#E5C158] ${
                                    ov?.textAlign === "center" ? "justify-center" : "justify-between"
                                  }`}
                                >
                                  <span className="truncate">{badge}</span>
                                  {item.kind === "essay" && (
                                    <span className="shrink-0 opacity-75">{item.blog.readingTime}</span>
                                  )}
                                </div>
                              </SlidePresentationCanvas>

                              <SlidePresentationCanvas
                                id={`sangat-card-title-${item.id}`}
                                parentId="sangat-feed-canvas"
                                pageKey="sangat"
                                label="Title"
                                elementType="Text"
                                isMicroElement={true}
                              >
                                <h3
                                  style={{
                                    color: ov?.textColor || layoutCfg.headingTextColor || undefined,
                                  }}
                                  className={`${cardHeadingCls} font-extrabold leading-snug group-hover:text-[#9A7418] dark:group-hover:text-[#E5C158] transition`}
                                >
                                  {item.title}
                                </h3>
                              </SlidePresentationCanvas>

                              <SlidePresentationCanvas
                                id={`sangat-card-byline-${item.id}`}
                                parentId="sangat-feed-canvas"
                                pageKey="sangat"
                                label="Byline"
                                elementType="Text"
                                isMicroElement={true}
                              >
                                <p className="text-xs font-semibold opacity-75">
                                  By {displayContributor(item.byline)}
                                </p>
                              </SlidePresentationCanvas>

                              <SlidePresentationCanvas
                                id={`sangat-card-desc-${item.id}`}
                                parentId="sangat-feed-canvas"
                                pageKey="sangat"
                                label="Summary"
                                elementType="Text"
                                isMicroElement={true}
                              >
                                <p className={`${cardBodyCls} opacity-80 leading-relaxed line-clamp-2`}>
                                  {item.preview}
                                </p>
                              </SlidePresentationCanvas>
                            </div>
                          </div>

                          <div className="pt-4 mt-4 border-t border-[#C59B27]/15 space-y-2.5">
                            <div className="flex items-center justify-between gap-2 text-xs">
                              <SlidePresentationCanvas
                                id={`sangat-card-cta-${item.id}`}
                                parentId="sangat-feed-canvas"
                                pageKey="sangat"
                                label="Read CTA"
                                elementType="Badge"
                                isMicroElement={true}
                                className="inline-block w-fit"
                              >
                                <button
                                  type="button"
                                  onClick={() => setReadingItem(item)}
                                  className="font-bold text-[#9A7418] dark:text-[#E5C158] hover:underline"
                                >
                                  Read Summary →
                                </button>
                              </SlidePresentationCanvas>

                              {item.kind === "link" && (
                                <a
                                  href={item.link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold opacity-80 hover:opacity-100 hover:underline truncate max-w-[160px]"
                                >
                                  {getDomain(item.link.url)} ↗
                                </a>
                              )}
                            </div>

                            {isStealthAdmin && (
                              <div className="pt-2 border-t border-[#C59B27]/15 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
                                <label className="cursor-pointer px-2 py-1 rounded-lg border border-[#C59B27]/40 hover:border-[#C59B27] transition">
                                  <span>Edit / Replace Image</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) =>
                                      handleAdminReplaceImage(item, e.target.files?.[0])
                                    }
                                  />
                                </label>
                                {imgSrc && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleAdminCycleFocal(item)}
                                      className="px-2 py-1 rounded-lg border border-[#C59B27]/40 hover:border-[#C59B27] transition"
                                    >
                                      Change Focal Point ({getItemFocal(item)})
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleAdminRemoveImage(item)}
                                      className="px-2 py-1 rounded-lg border border-[#C59B27]/40 hover:border-[#C59B27] transition opacity-80"
                                    >
                                      Remove Image
                                    </button>
                                  </>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleAdminDeletePost(item)}
                                  className="px-2 py-1 rounded-lg border border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition"
                                >
                                  Delete Post
                                </button>
                              </div>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}

                {/* Compact secondary exploration strip */}
                <GodModeBox id="sangat-pillars-box" pageKey="sangat" label="Explore Core Pillars Bar">
                <section className="rounded-2xl border border-[#d4af37]/30 bg-[var(--bg-surface)] px-5 py-4 flex flex-wrap items-center justify-between gap-3 shadow-xl shadow-black/10 dark:shadow-2xl dark:shadow-black/30">
                  <GodModeText
                    id="sangat-pillars-heading"
                    pageKey="sangat"
                    tag="span"
                    defaultText="Explore Core Pillars"
                    className="text-xs font-semibold uppercase tracking-wider opacity-70"
                  />
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                    <a
                      href="/foundations"
                      className="px-3 py-1.5 rounded-lg border border-[#C59B27]/30 hover:border-[#C59B27] transition"
                    >
                      Foundations of Sikhi →
                    </a>
                    <a
                      href="/granths"
                      className="px-3 py-1.5 rounded-lg border border-[#C59B27]/30 hover:border-[#C59B27] transition"
                    >
                      Granths &amp; Kirtan →
                    </a>
                    <a
                      href="/matriarchs"
                      className="px-3 py-1.5 rounded-lg border border-[#C59B27]/30 hover:border-[#C59B27] transition"
                    >
                      Sikh Women →
                    </a>
                    <a
                      href="/games"
                      className="px-3 py-1.5 rounded-lg border border-[#C59B27]/30 hover:border-[#C59B27] transition"
                    >
                      Sikhi Games →
                    </a>
                    <a
                      href="/news"
                      className="px-3 py-1.5 rounded-lg border border-[#C59B27]/30 hover:border-[#C59B27] transition"
                    >
                      Explore &amp; News →
                    </a>
                  </div>
                </section>
                </GodModeBox>
              </div>
            )}
          </div>
        </SlidePresentationCanvas>
      </main>

      {/* ================================================================
          CLICK-TO-READ SUMMARY & SOURCE ATTRIBUTION MODAL
      ================================================================ */}
      {readingItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 overflow-hidden"
          onClick={() => setReadingItem(null)}
        >
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
              color: "var(--text-primary)",
            }}
            className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 px-6 py-4 border-b border-[#C59B27]/25 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#9A7418] dark:text-[#E5C158]">
                  {readingItem.kind === "link"
                    ? `Curated Source • ${readingItem.link.publisher}`
                    : readingItem.kind === "essay"
                      ? `SikhStack Essay • ${readingItem.blog.topicTag}`
                      : `SikhInterest Visual • ${readingItem.pin.category}`}
                </p>
                <h2 className="text-lg sm:text-xl font-extrabold leading-snug mt-0.5">
                  {readingItem.title}
                </h2>
                <p className="text-xs opacity-75 mt-1">
                  By {displayContributor(readingItem.byline)}
                  {readingItem.kind === "link"
                    ? ` • Shared by ${displayContributor(readingItem.link.curatedBy)}`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReadingItem(null)}
                className="shrink-0 px-3 py-1.5 rounded-lg border border-[#C59B27]/35 text-xs font-bold hover:border-[#C59B27]"
              >
                Close ✕
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5 text-sm leading-relaxed">
              {getItemImage(readingItem) && (
                <EditableHeritageImage
                  imageKey={`sangat-feed-${readingItem.kind}-${readingItem.id}`}
                  defaultSrc={getItemImage(readingItem) || ""}
                  alt={readingItem.title}
                  defaultFit="contain-museum"
                />
              )}

              {readingItem.kind === "link" && (
                <>
                  <p className="opacity-90">{readingItem.link.summary}</p>
                  <div className="rounded-xl border border-[#C59B27]/30 bg-[#C59B27]/10 p-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs">
                      <p className="font-bold">Original Publication</p>
                      <p className="opacity-75 truncate max-w-xs">{readingItem.link.url}</p>
                    </div>
                    <a
                      href={readingItem.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-extrabold shadow-sm hover:opacity-95 transition"
                    >
                      Read Original Source at {readingItem.link.publisher || getDomain(readingItem.link.url)} ↗
                    </a>
                  </div>
                </>
              )}

              {readingItem.kind === "essay" && (
                <>
                  {readingItem.blog.subtitle && (
                    <p className="font-semibold opacity-85">{readingItem.blog.subtitle}</p>
                  )}
                  {(readingItem.blog.gurmukhiHeader || readingItem.blog.pullQuote) && (
                    <blockquote className="rounded-xl border-l-4 border-[#C59B27] bg-[#C59B27]/10 px-4 py-3 text-sm font-semibold">
                      {readingItem.blog.gurmukhiHeader || readingItem.blog.pullQuote}
                    </blockquote>
                  )}
                  <div className="space-y-3 opacity-90">
                    {readingItem.blog.paragraphs.slice(0, 3).map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => openFullDiscussion(readingItem.blog.id)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-extrabold"
                    >
                      Open Full Essay &amp; Discussion →
                    </button>
                  </div>
                </>
              )}

              {readingItem.kind === "visual" && (
                <>
                  {readingItem.pin.gurmukhiCalligraphy && (
                    <blockquote className="rounded-xl border-l-4 border-[#C59B27] bg-[#C59B27]/10 px-4 py-3 text-sm font-semibold">
                      {readingItem.pin.gurmukhiCalligraphy}
                    </blockquote>
                  )}
                  <p className="opacity-90">{readingItem.pin.description}</p>
                  {readingItem.pin.artistContactNote && (
                    <p className="text-xs opacity-70">{readingItem.pin.artistContactNote}</p>
                  )}
                </>
              )}

              {/* Vichaar (Comments & Discussion) */}
              <div className="pt-5 border-t border-[#C59B27]/25 space-y-4">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#9A7418] dark:text-[#E5C158]">
                  Vichaar (Comments &amp; Discussion)
                </h3>

                <form
                  onSubmit={(e) => handleAddVichaar(readingItem, e)}
                  className="flex flex-col sm:flex-row gap-2"
                >
                  <input
                    type="text"
                    value={vichaarInput}
                    onChange={(e) => setVichaarInput(e.target.value)}
                    placeholder={vichaarPlaceholder}
                    className="flex-1 min-w-0 rounded-xl border border-[#C59B27]/35 bg-transparent px-3.5 py-2 text-sm focus:outline-none focus:border-[#C59B27]"
                  />
                  <button
                    type="submit"
                    className="shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-extrabold"
                  >
                    Post Vichaar
                  </button>
                </form>

                {(() => {
                  const key = getItemKey(readingItem);
                  const list = vichaarMap[key] || [];
                  if (list.length === 0) {
                    return (
                      <p
                        style={{ color: "var(--theme-text-muted)" }}
                        className="text-xs font-medium"
                      >
                        No Vichaar comments yet. Start the discussion above.
                      </p>
                    );
                  }
                  return (
                    <div className="space-y-2.5">
                      {list.map((c) => (
                        <div
                          key={c.id}
                          className="rounded-xl border border-[#C59B27]/25 bg-black/5 dark:bg-white/5 px-3.5 py-2.5 flex items-start justify-between gap-3"
                        >
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-xs font-bold">
                              {c.authorName}{" "}
                              <span
                                style={{ color: "var(--theme-text-muted)" }}
                                className="font-medium"
                              >
                                • {c.createdAt}
                              </span>
                            </p>
                            <p className="text-xs sm:text-sm leading-relaxed">{c.body}</p>
                          </div>
                          {isStealthAdmin && (
                            <button
                              type="button"
                              onClick={() => handleAdminDeleteVichaar(key, c.id)}
                              className="shrink-0 px-2 py-1 rounded-lg border border-red-500/40 text-[11px] font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10"
                            >
                              Delete Comment
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          + SHARE ARTICLE OR LINK MODAL
      ================================================================ */}
      {isShareOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 overflow-hidden"
          onClick={() => setIsShareOpen(false)}
        >
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
              color: "var(--text-primary)",
            }}
            className="w-full max-w-xl max-h-[88vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 px-6 py-4 border-b border-[#C59B27]/25 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold">Share Article or Link</h2>
                <p className="text-xs opacity-75">
                  Curate an external article with source attribution or write an original dispatch.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetShareForm();
                  setIsShareOpen(false);
                }}
                className="px-3 py-1.5 rounded-lg border border-[#C59B27]/35 text-xs font-bold hover:border-[#C59B27]"
              >
                Close ✕
              </button>
            </div>

            <div className="shrink-0 px-6 pt-3 flex gap-2 border-b border-[#C59B27]/15">
              <button
                type="button"
                onClick={() => {
                  setShareError(null);
                  setShareTab("curate");
                }}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 -mb-px transition ${
                  shareTab === "curate"
                    ? "border-[#C59B27] text-[#9A7418] dark:text-[#E5C158]"
                    : "border-transparent opacity-65 hover:opacity-100"
                }`}
              >
                Curate External Link / Article
              </button>
              <button
                type="button"
                onClick={() => {
                  setShareError(null);
                  setShareTab("write");
                }}
                className={`px-3.5 py-2 text-xs font-bold border-b-2 -mb-px transition ${
                  shareTab === "write"
                    ? "border-[#C59B27] text-[#9A7418] dark:text-[#E5C158]"
                    : "border-transparent opacity-65 hover:opacity-100"
                }`}
              >
                Write Original Essay / Pin
              </button>
            </div>

            <form onSubmit={handlePublishShare} className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
              {!isStealthAdmin && secCfg.requireEmailVerification && user && !emailVerified && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
                  Verified email required by the Admin before submitting. Please confirm your email address via Supabase auth.
                </div>
              )}
              {isIdentityHidden && (
                <div className="rounded-xl border border-[#C59B27]/35 bg-[#C59B27]/10 px-3.5 py-2 text-[11px] font-semibold">
                  Privacy Shield Active: Contributor names are displayed publicly as &ldquo;Sangat Contributor&rdquo;.
                </div>
              )}
              {shareError && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-700 dark:text-red-300">
                  {shareError}
                </div>
              )}

              {shareTab === "curate" ? (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold">Original Article URL *</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        required
                        value={curateUrl}
                        onChange={(e) => setCurateUrl(e.target.value)}
                        placeholder="https://example.org/article"
                        className="flex-1 min-w-0 rounded-xl border border-[#C59B27]/35 bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-[#C59B27]"
                      />
                      <button
                        type="button"
                        onClick={handleAutoFillFromLink}
                        className="shrink-0 px-3 py-2 rounded-xl border border-[#C59B27]/40 text-xs font-bold hover:border-[#C59B27]"
                      >
                        Auto-fill
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold">Original Publisher / Author *</label>
                      <input
                        type="text"
                        value={curatePublisher}
                        onChange={(e) => setCuratePublisher(e.target.value)}
                        placeholder="e.g. Ensaaf, Bunga Azadi"
                        className="w-full rounded-xl border border-[#C59B27]/35 bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-[#C59B27]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold">Feed Section</label>
                      <select
                        value={curateCategory}
                        onChange={(e) => setCurateCategory(e.target.value as CuratedCategory)}
                        className="w-full rounded-xl border border-[#C59B27]/35 bg-[#FAF7F0] dark:bg-[#111318] px-3 py-2 text-sm focus:outline-none focus:border-[#C59B27]"
                      >
                        <option value="essays">SikhStacks Essays &amp; Research</option>
                        <option value="visuals">SikhInterest Visuals</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold">Article Title *</label>
                    <input
                      type="text"
                      required
                      value={curateTitle}
                      onChange={(e) => setCurateTitle(e.target.value)}
                      placeholder="Clear headline for the shared dispatch"
                      className="w-full rounded-xl border border-[#C59B27]/35 bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-[#C59B27]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold">Why it matters (2-3 line summary) *</label>
                    <textarea
                      required
                      rows={3}
                      value={curateSummary}
                      onChange={(e) => setCurateSummary(e.target.value)}
                      placeholder="Summarize the key takeaway while crediting the original source..."
                      className="w-full rounded-xl border border-[#C59B27]/35 bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-[#C59B27]"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setWriteKind("essay")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                        writeKind === "essay"
                          ? "border-[#C59B27] bg-[#C59B27]/15"
                          : "border-[#C59B27]/25 opacity-75"
                      }`}
                    >
                      SikhStack Essay
                    </button>
                    <button
                      type="button"
                      onClick={() => setWriteKind("pin")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                        writeKind === "pin"
                          ? "border-[#C59B27] bg-[#C59B27]/15"
                          : "border-[#C59B27]/25 opacity-75"
                      }`}
                    >
                      SikhInterest Visual Note
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold">Title *</label>
                    <input
                      type="text"
                      required
                      value={writeTitle}
                      onChange={(e) => setWriteTitle(e.target.value)}
                      placeholder={writeKind === "essay" ? "Essay title" : "Visual or archive title"}
                      className="w-full rounded-xl border border-[#C59B27]/35 bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-[#C59B27]"
                    />
                  </div>

                  {writeKind === "essay" && (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold">Subtitle</label>
                      <input
                        type="text"
                        value={writeSubtitle}
                        onChange={(e) => setWriteSubtitle(e.target.value)}
                        placeholder="Optional one-line thesis"
                        className="w-full rounded-xl border border-[#C59B27]/35 bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-[#C59B27]"
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold">Gurmukhi Quote / Inscription (optional)</label>
                    <input
                      type="text"
                      value={writeGurmukhi}
                      onChange={(e) => setWriteGurmukhi(e.target.value)}
                      placeholder="Optional Gurmukhi pangti or inscription"
                      className="w-full rounded-xl border border-[#C59B27]/35 bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-[#C59B27]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold">
                      {writeKind === "essay" ? "Essay Body *" : "Description & Context *"}
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={writeBody}
                      onChange={(e) => setWriteBody(e.target.value)}
                      placeholder="Write clearly..."
                      className="w-full rounded-xl border border-[#C59B27]/35 bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-[#C59B27]"
                    />
                  </div>
                </>
              )}

              {/* Unified Artwork / Visual Attachment (Works for Articles, Visuals, and Curated Links) */}
              <div className="rounded-xl border border-[#C59B27]/25 p-3.5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold">
                    Attach Heritage Artwork or Photo (Optional)
                  </label>
                  {shareImageUrl && (
                    <button
                      type="button"
                      onClick={() => setShareImageUrl(null)}
                      className="text-[11px] font-semibold text-red-600 dark:text-red-400 hover:underline"
                    >
                      Remove image
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-center">
                  <label className="cursor-pointer px-3 py-2 rounded-xl border border-[#C59B27]/35 text-xs font-semibold text-center hover:border-[#C59B27] transition">
                    <span>Upload Image File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => handleShareImageFile(e.target.files?.[0])}
                    />
                  </label>
                  <input
                    type="url"
                    value={shareImageUrl && !shareImageUrl.startsWith("data:") ? shareImageUrl : ""}
                    onChange={(e) => setShareImageUrl(e.target.value || null)}
                    placeholder="Or paste image URL (https://...)"
                    className="w-full rounded-xl border border-[#C59B27]/35 bg-transparent px-3 py-2 text-xs focus:outline-none focus:border-[#C59B27]"
                  />
                </div>

                {shareUploadStatus !== "idle" && shareUploadMsg && (
                  <div
                    className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                      shareUploadStatus === "error"
                        ? "border border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300"
                        : shareUploadStatus === "synced"
                          ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : "border border-[#C59B27]/40 bg-[#C59B27]/10 text-[#9A7418] dark:text-[#E5C158]"
                    }`}
                  >
                    {shareUploadMsg}
                  </div>
                )}

                {shareImageUrl && (() => {
                  const isAutoPort =
                    shareOrientation === "auto" &&
                    sharePreviewRatio !== null &&
                    sharePreviewRatio < 1.05;
                  const resolvedOri =
                    shareOrientation === "auto"
                      ? isAutoPort
                        ? "portrait"
                        : "landscape"
                      : shareOrientation;
                  const resolvedFit: HeritageFitMode =
                    shareOrientation === "auto" && isAutoPort
                      ? "contain-museum"
                      : shareFitMode;
                  const aspectCls =
                    resolvedOri === "portrait"
                      ? "aspect-[3/4] sm:aspect-[4/5] max-h-[340px] mx-auto"
                      : resolvedOri === "square"
                        ? "aspect-square max-h-[300px] mx-auto"
                        : "aspect-[16/10] sm:aspect-[16/9]";
                  const zScale = Math.max(100, Math.min(150, shareZoom)) / 100;

                  return (
                    <div className="space-y-3 pt-1">
                      <div
                        className={`relative w-full overflow-hidden rounded-xl bg-[#111318] flex items-center justify-center ${aspectCls}`}
                      >
                        {resolvedFit === "contain-museum" ? (
                          <>
                            <img
                              src={shareImageUrl}
                              alt=""
                              aria-hidden="true"
                              className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-35 pointer-events-none select-none"
                            />
                            <img
                              src={shareImageUrl}
                              alt="Artwork preview"
                              onLoad={(e) => {
                                const img = e.currentTarget;
                                if (img.naturalWidth && img.naturalHeight) {
                                  setSharePreviewRatio(img.naturalWidth / img.naturalHeight);
                                }
                              }}
                              style={{
                                objectPosition: `${sharePosX}% ${sharePosY}%`,
                                transform: `scale(${zScale})`,
                              }}
                              className="relative z-10 w-full h-full object-contain"
                            />
                          </>
                        ) : (
                          <img
                            src={shareImageUrl}
                            alt="Artwork preview"
                            draggable={false}
                            onLoad={(e) => {
                              const img = e.currentTarget;
                              if (img.naturalWidth && img.naturalHeight) {
                                setSharePreviewRatio(img.naturalWidth / img.naturalHeight);
                              }
                            }}
                            onPointerDown={(e) => {
                              e.currentTarget.setPointerCapture(e.pointerId);
                              setSharePreviewDrag({
                                x: e.clientX,
                                y: e.clientY,
                                posX: sharePosX,
                                posY: sharePosY,
                              });
                            }}
                            onPointerMove={(e) => {
                              if (!sharePreviewDrag) return;
                              const rect = e.currentTarget.getBoundingClientRect();
                              const dx =
                                ((e.clientX - sharePreviewDrag.x) / Math.max(1, rect.width)) * 100;
                              const dy =
                                ((e.clientY - sharePreviewDrag.y) / Math.max(1, rect.height)) * 100;
                              setSharePosX(
                                Math.round(Math.max(0, Math.min(100, sharePreviewDrag.posX - dx)))
                              );
                              setSharePosY(
                                Math.round(Math.max(0, Math.min(100, sharePreviewDrag.posY - dy)))
                              );
                            }}
                            onPointerUp={() => setSharePreviewDrag(null)}
                            onPointerCancel={() => setSharePreviewDrag(null)}
                            style={{
                              objectPosition: `${sharePosX}% ${sharePosY}%`,
                              transform: `scale(${zScale})`,
                            }}
                            className="w-full h-full object-cover cursor-grab active:cursor-grabbing select-none"
                          />
                        )}
                      </div>

                      {/* Orientation Selector */}
                      <div className="space-y-1">
                        <span className="block text-[11px] font-bold uppercase tracking-wider opacity-75">
                          Orientation
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                          {(
                            [
                              { id: "auto", label: "Auto" },
                              { id: "landscape", label: "Landscape (16:9)" },
                              { id: "portrait", label: "Portrait (3:4)" },
                              { id: "square", label: "Square (1:1)" },
                            ] as const
                          ).map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setShareOrientation(opt.id)}
                              className={`px-2 py-1.5 rounded-lg border text-[11px] font-semibold transition ${
                                shareOrientation === opt.id
                                  ? "border-[#C59B27] bg-[#C59B27]/20 text-[#9A7418] dark:text-[#E5C158]"
                                  : "border-[#C59B27]/25 opacity-80 hover:opacity-100"
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Fit Mode Toggle */}
                      <div className="space-y-1">
                        <span className="block text-[11px] font-bold uppercase tracking-wider opacity-75">
                          Fit Mode
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setShareFitMode("contain-museum")}
                            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition ${
                              shareFitMode === "contain-museum"
                                ? "border-[#C59B27] bg-[#C59B27]/20 text-[#9A7418] dark:text-[#E5C158]"
                                : "border-[#C59B27]/25 opacity-80 hover:opacity-100"
                            }`}
                          >
                            Full Painting (Zero Crop / Museum Blur)
                          </button>
                          <button
                            type="button"
                            onClick={() => setShareFitMode("cover")}
                            className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition ${
                              shareFitMode === "cover"
                                ? "border-[#C59B27] bg-[#C59B27]/20 text-[#9A7418] dark:text-[#E5C158]"
                                : "border-[#C59B27]/25 opacity-80 hover:opacity-100"
                            }`}
                          >
                            Fill Frame (Cover{shareFitMode === "cover" ? " — Drag to pan" : ""})
                          </button>
                        </div>
                      </div>

                      {/* Position & Zoom Sliders */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                        <label className="block">
                          <span className="flex justify-between opacity-80 mb-0.5">
                            <span>Horizontal (X)</span>
                            <span>{sharePosX}%</span>
                          </span>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={sharePosX}
                            onChange={(e) => setSharePosX(Number(e.target.value))}
                            className="w-full accent-[#C59B27]"
                          />
                        </label>
                        <label className="block">
                          <span className="flex justify-between opacity-80 mb-0.5">
                            <span>Vertical (Y)</span>
                            <span>{sharePosY}%</span>
                          </span>
                          <input
                            type="range"
                            min={0}
                            max={100}
                            value={sharePosY}
                            onChange={(e) => setSharePosY(Number(e.target.value))}
                            className="w-full accent-[#C59B27]"
                          />
                        </label>
                        <label className="block">
                          <span className="flex justify-between opacity-80 mb-0.5">
                            <span>Zoom</span>
                            <span>{shareZoom}%</span>
                          </span>
                          <input
                            type="range"
                            min={100}
                            max={150}
                            value={shareZoom}
                            onChange={(e) => setShareZoom(Number(e.target.value))}
                            className="w-full accent-[#C59B27]"
                          />
                        </label>
                      </div>
                    </div>
                  );
                })()}
              </div>

              <label
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  borderColor: "var(--border-subtle)",
                }}
                className="flex items-start gap-2.5 rounded-xl border p-3 text-xs leading-relaxed cursor-pointer"
              >
                <input
                  type="checkbox"
                  required
                  checked={confirmOriginalArt}
                  onChange={(e) => setConfirmOriginalArt(e.target.checked)}
                  className="mt-0.5 accent-[#C59B27]"
                />
                <span>
                  I confirm this is my original artwork or I have permission from
                  the creator to share it.
                </span>
              </label>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetShareForm();
                    setConfirmOriginalArt(false);
                    setIsShareOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl border border-[#C59B27]/30 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!confirmOriginalArt}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-extrabold shadow-sm disabled:opacity-50"
                >
                  Publish Art / Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================
          STRICT AUTHENTICATION GATE MODAL FOR POSTING & COMMENTING
      ================================================================ */}
      {authGateActionLabel && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Sign In Required to Contribute"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--accent-primary)",
              color: "var(--text-primary)",
            }}
            className="w-full max-w-md rounded-3xl border-2 p-6 sm:p-8 shadow-2xl space-y-5 text-center"
          >
            <div className="mx-auto flex justify-center">
              <SikhHeritageAvatar preset="khanda-crest" size="lg" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C59B27]">
                AUTHENTICATED SANGAT CONTRIBUTION
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold">
                Sign In to {authGateActionLabel}
              </h3>
              <p
                style={{ color: "var(--theme-text-muted)" }}
                className="text-xs sm:text-sm leading-relaxed"
              >
                Anyone can read research essays, explore SikhInterest pins, and read Dil Di
                Baat reflections publicly. To publish articles, create pins, or post
                comments, please sign in with your Learn Sikhi account.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => router.push("/auth?next=/sangat")}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider shadow-sm hover:brightness-105 transition"
              >
                Continue to Sign In / Sign Up (/auth) â†’
              </button>
              <button
                type="button"
                onClick={() => setAuthGateActionLabel(null)}
                className="w-full py-2.5 rounded-xl border border-[#C59B27]/40 text-xs font-bold"
              >
                Continue Browsing Publicly
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          MODAL: PUBLISH A BLOG / RESEARCH ESSAY
      ================================================================ */}
      {isBlogComposerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Publish a Blog or Research Essay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm overflow-y-auto"
        >
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--accent-primary)",
              color: "var(--text-primary)",
            }}
            className="w-full max-w-2xl rounded-3xl border-2 p-6 sm:p-8 shadow-2xl space-y-4 my-6"
          >
            <div className="flex items-center justify-between border-b border-[#C59B27]/25 pb-3">
              <h3 className="text-xl font-serif font-bold">
                Publish a Substack-Style Research Essay
              </h3>
              <button
                type="button"
                onClick={() => setIsBlogComposerOpen(false)}
                className="px-3 py-1 rounded-xl border border-[#C59B27]/40 text-xs font-bold"
              >
                âœ•
              </button>
            </div>

            <form onSubmit={handlePublishBlog} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Essay Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBlogTitle}
                    onChange={(e) => setNewBlogTitle(e.target.value)}
                    placeholder="e.g., Ecological Ethics in Guru Har Rai Ji's Naulakha Bagh"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-subtle)",
                    }}
                    className="w-full rounded-xl border px-3.5 py-2 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Topic Tag
                  </label>
                  <select
                    value={newBlogTopic}
                    onChange={(e) =>
                      setNewBlogTopic(e.target.value as BlogTopicTag)
                    }
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-subtle)",
                    }}
                    className="w-full rounded-xl border px-3.5 py-2 text-xs sm:text-sm"
                  >
                    <option value="Gurbani Research">Gurbani Research</option>
                    <option value="Sikh History">Sikh History</option>
                    <option value="Personal Journey">Personal Journey</option>
                    <option value="Philosophy">Philosophy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  Subtitle / Summary
                </label>
                <input
                  type="text"
                  value={newBlogSubtitle}
                  onChange={(e) => setNewBlogSubtitle(e.target.value)}
                  placeholder="A concise thesis statement or summary..."
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="w-full rounded-xl border px-3.5 py-2 text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Gurmukhi Opening Pangti (Optional)
                  </label>
                  <input
                    type="text"
                    value={newBlogGurmukhi}
                    onChange={(e) => setNewBlogGurmukhi(e.target.value)}
                    placeholder="à¨ªà¨µà¨£à© à¨—à©à¨°à©‚ à¨ªà¨¾à¨£à©€ à¨ªà¨¿à¨¤à¨¾..."
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-subtle)",
                    }}
                    className="w-full rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-gurmukhi"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Key Pull-Quote (Optional)
                  </label>
                  <input
                    type="text"
                    value={newBlogPullQuote}
                    onChange={(e) => setNewBlogPullQuote(e.target.value)}
                    placeholder="Highlighted quote inside your article..."
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-subtle)",
                    }}
                    className="w-full rounded-xl border px-3.5 py-2 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  Essay Paragraphs (Separate paragraphs with a new line) *
                </label>
                <textarea
                  rows={6}
                  required
                  value={newBlogBody}
                  onChange={(e) => setNewBlogBody(e.target.value)}
                  placeholder="Write your full research essay or reflection here..."
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="w-full rounded-xl border p-3.5 text-xs sm:text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider"
              >
                Publish Research Essay â†’
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================
          MODAL: CREATE A SIKHINTEREST VISUAL PIN
      ================================================================ */}
      {isPinComposerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Create a SikhInterest Pin"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm overflow-y-auto"
        >
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--accent-primary)",
              color: "var(--text-primary)",
            }}
            className="w-full max-w-xl rounded-3xl border-2 p-6 sm:p-8 shadow-2xl space-y-4 my-6"
          >
            <div className="flex items-center justify-between border-b border-[#C59B27]/25 pb-3">
              <h3 className="text-xl font-serif font-bold">
                Create a SikhInterest Visual Pin
              </h3>
              <button
                type="button"
                onClick={() => setIsPinComposerOpen(false)}
                className="px-3 py-1 rounded-xl border border-[#C59B27]/40 text-xs font-bold"
              >
                âœ•
              </button>
            </div>

            <form onSubmit={handleCreatePin} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Pin Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPinTitle}
                    onChange={(e) => setNewPinTitle(e.target.value)}
                    placeholder="e.g., Puratan Gurmukhi Calligraphy Folio"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-subtle)",
                    }}
                    className="w-full rounded-xl border px-3.5 py-2 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Category
                  </label>
                  <select
                    value={newPinCat}
                    onChange={(e) =>
                      setNewPinCat(e.target.value as PinCategory)
                    }
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-subtle)",
                    }}
                    className="w-full rounded-xl border px-3.5 py-2 text-xs sm:text-sm"
                  >
                    <option value="Sikh Art & Miniature">
                      Sikh Art &amp; Miniature
                    </option>
                    <option value="Gurmukhi Calligraphy">
                      Gurmukhi Calligraphy
                    </option>
                    <option value="Historical Photography">
                      Historical Photography
                    </option>
                    <option value="Gurdwara Architecture">
                      Gurdwara Architecture
                    </option>
                    <option value="Manuscript & Book Quotes">
                      Manuscript &amp; Book Quotes
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Gurmukhi Calligraphy / Quote on Canvas
                  </label>
                  <input
                    type="text"
                    value={newPinCalligraphy}
                    onChange={(e) => setNewPinCalligraphy(e.target.value)}
                    placeholder="à©´ à¨¸à¨¤à¨¿à¨—à©à¨° à¨ªà©à¨°à¨¸à¨¾à¨¦à¨¿ à¥¥"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-subtle)",
                    }}
                    className="w-full rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-gurmukhi"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Canvas Palette (or Upload Artwork Image)
                  </label>
                  <select
                    value={newPinPalette}
                    onChange={(e) =>
                      setNewPinPalette(
                        e.target.value as
                          | "darbar-gold"
                          | "amrit-indigo"
                          | "saffron-dawn"
                          | "emerald-manuscript"
                      )
                    }
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-subtle)",
                    }}
                    className="w-full rounded-xl border px-3.5 py-2 text-xs sm:text-sm"
                  >
                    <option value="darbar-gold">Darbar Gold &amp; Walnut</option>
                    <option value="amrit-indigo">Amrit Vela Indigo</option>
                    <option value="saffron-dawn">Basanti / Saffron Dawn</option>
                    <option value="emerald-manuscript">
                      Emerald Manuscript Leaf
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  Upload Artwork / Photography Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === "string") {
                        setNewPinImageDataUrl(reader.result);
                      }
                    };
                    reader.readAsDataURL(f);
                  }}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  Description &amp; Historical / Artistic Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newPinDesc}
                  onChange={(e) => setNewPinDesc(e.target.value)}
                  placeholder="Describe the medium, inspiration, or manuscript source..."
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="w-full rounded-xl border p-3 text-xs sm:text-sm"
                />
              </div>

              <div className="p-3.5 rounded-xl border border-[#C59B27]/40 space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPinAvailable}
                    onChange={(e) => setNewPinAvailable(e.target.checked)}
                    className="accent-[#C59B27]"
                  />
                  Mark Original Artwork as &ldquo;Available â€” Coordinate with
                  Artist&rdquo;
                </label>
                {newPinAvailable && (
                  <input
                    type="text"
                    value={newPinContactNote}
                    onChange={(e) => setNewPinContactNote(e.target.value)}
                    placeholder="How can collectors or Gurdwaras reach you? (e.g., @handle or email)"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-subtle)",
                    }}
                    className="w-full rounded-xl border px-3 py-2 text-xs"
                  />
                )}
              </div>

              <label
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  borderColor: "var(--border-subtle)",
                }}
                className="flex items-start gap-2.5 rounded-xl border p-3 text-xs leading-relaxed cursor-pointer"
              >
                <input
                  type="checkbox"
                  required
                  checked={confirmPinOriginalArt}
                  onChange={(e) => setConfirmPinOriginalArt(e.target.checked)}
                  className="mt-0.5 accent-[#C59B27]"
                />
                <span>
                  I confirm this is my original artwork or I have permission from
                  the creator to share it.
                </span>
              </label>

              <button
                type="submit"
                disabled={!confirmPinOriginalArt}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider disabled:opacity-50"
              >
                Publish Art →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================
          MODAL: COORDINATE WITH ARTIST
      ================================================================ */}
      {coordinatingPin && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Coordinate with Artist"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--accent-primary)",
              color: "var(--text-primary)",
            }}
            className="w-full max-w-md rounded-3xl border-2 p-6 sm:p-8 shadow-2xl space-y-4"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C59B27]">
              SIKHINTEREST ARTIST COORDINATION
            </span>
            <h3 className="text-xl font-serif font-bold">
              {coordinatingPin.title}
            </h3>
            <p className="text-xs font-semibold text-[#C59B27]">
              By {coordinatingPin.authorName} (@{coordinatingPin.authorHandle})
            </p>
            <p
              style={{ color: "var(--theme-text-muted)" }}
              className="text-sm leading-relaxed"
            >
              {coordinatingPin.artistContactNote}
            </p>
            <button
              type="button"
              onClick={() => setCoordinatingPin(null)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ================================================================
          MODAL: DIL DI BAAT COMPOSER
      ================================================================ */}
      {isDilComposerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Share What's on Your Heart (Dil Di Baat)"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm overflow-y-auto"
        >
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--accent-primary)",
              color: "var(--text-primary)",
            }}
            className="w-full max-w-xl rounded-3xl border-2 p-6 sm:p-8 shadow-2xl space-y-4 my-6"
          >
            <div className="flex items-center justify-between border-b border-[#C59B27]/25 pb-3">
              <h3 className="text-xl font-serif font-bold">
                Dil Di Baat â€” Share Joy, Sorrow, Questions or Gratitude
              </h3>
              <button
                type="button"
                onClick={() => setIsDilComposerOpen(false)}
                className="px-3 py-1 rounded-xl border border-[#C59B27]/40 text-xs font-bold"
              >
                âœ•
              </button>
            </div>

            <form onSubmit={handleCreateDilPost} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold mb-1">
                  Mood / Intent Tag
                </label>
                <select
                  value={newDilMood}
                  onChange={(e) =>
                    setNewDilMood(e.target.value as DilMoodTag)
                  }
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm"
                >
                  <option value="ðŸŒ± Seeking Strength / In Pain">
                    ðŸŒ± Seeking Strength / In Pain
                  </option>
                  <option value="âœ¨ Sharing Happiness / Gratitude">
                    âœ¨ Sharing Happiness / Gratitude
                  </option>
                  <option value="ðŸ“š Researcher Note">ðŸ“š Researcher Note</option>
                  <option value="ðŸ¤ Sangat Advice">ðŸ¤ Sangat Advice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  Title / Summary *
                </label>
                <input
                  type="text"
                  required
                  value={newDilTitle}
                  onChange={(e) => setNewDilTitle(e.target.value)}
                  placeholder="Share what is on your heart..."
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  Your Reflection *
                </label>
                <textarea
                  rows={4}
                  required
                  value={newDilBody}
                  onChange={(e) => setNewDilBody(e.target.value)}
                  placeholder="Write openly to the Sangat..."
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="w-full rounded-xl border p-3.5 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  Attach an Uplifting Gurbani Shabad
                </label>
                <select
                  value={newDilShabadIdx}
                  onChange={(e) => setNewDilShabadIdx(Number(e.target.value))}
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm"
                >
                  {UPLIFTING_SHABADS_LIBRARY.map((s, idx) => (
                    <option key={s.label} value={idx}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider"
              >
                Share with the Sangat â†’
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================
          MODAL: MINIMAL EDIT PROFILE (DISPLAY NAME, ROLE, 6 EMBLEMS)
      ================================================================ */}
      {isStudioOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Edit Profile"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsStudioOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 overflow-hidden"
        >
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--accent-primary)",
              color: "var(--text-primary)",
            }}
            className="w-full max-w-md max-h-[85vh] flex flex-col rounded-2xl border-2 shadow-2xl overflow-hidden"
          >
            <div
              className="shrink-0 px-6 py-4 border-b flex items-center justify-between gap-4"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <h2 className="text-xl font-serif font-bold">Edit Profile</h2>
              <button
                type="button"
                onClick={() => setIsStudioOpen(false)}
                className="px-3 py-1.5 rounded-xl border text-xs font-bold hover:border-[#C59B27]"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                âœ• Close
              </button>
            </div>

            <form
              onSubmit={handleSaveMinimalProfile}
              className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5"
            >
              <div>
                <label className="block text-xs font-bold mb-1.5">Display Name</label>
                <input
                  type="text"
                  required
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="Your name"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#C59B27]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">
                  Account Email (Optional)
                </label>
                <input
                  type="email"
                  value={draftEmail}
                  onChange={(e) => setDraftEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#C59B27]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5">
                  Role / Focus Tag
                </label>
                <select
                  value={draftRole}
                  onChange={(e) => setDraftRole(e.target.value)}
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="w-full rounded-xl border px-3.5 py-2.5 text-sm"
                >
                  {PROFILE_ROLE_CHOICES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                  {!PROFILE_ROLE_CHOICES.includes(
                    draftRole as (typeof PROFILE_ROLE_CHOICES)[number]
                  ) && <option value={draftRole}>{draftRole}</option>}
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold">Heritage Emblem</label>
                <div className="grid grid-cols-6 gap-2">
                  {SIKH_HERITAGE_AVATARS.slice(0, 6).map((av) => {
                    const selected = !draftCustomAvatar && draftAvatar === av.id;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        title={av.name}
                        onClick={() => {
                          setDraftAvatar(av.id);
                          setDraftCustomAvatar(null);
                        }}
                        className={`p-1.5 rounded-xl border flex items-center justify-center transition ${
                          selected
                            ? "border-2 border-[#C59B27] bg-[#C59B27]/15"
                            : "border-transparent hover:border-[#C59B27]/50"
                        }`}
                      >
                        <SikhHeritageAvatar preset={av.id} size="sm" />
                      </button>
                    );
                  })}
                </div>

                {/* Heritage Painting Crops & Uploaded Artwork */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-semibold opacity-75">
                    Puratan Heritage Paintings
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {HERITAGE_EMBLEM_ARTWORKS.map((art) => {
                      const selected = draftCustomAvatar === art.src && draftAvatar === art.id;
                      return (
                        <button
                          key={art.id}
                          type="button"
                          onClick={() => {
                            setDraftAvatar(art.id as AvatarPresetId);
                            setDraftCustomAvatar(art.src);
                          }}
                          className={`rounded-xl border p-1.5 text-left transition ${
                            selected
                              ? "border-2 border-[#C59B27] bg-[#C59B27]/15"
                              : "border-[#C59B27]/25 hover:border-[#C59B27]/60"
                          }`}
                        >
                          <div className="h-10 w-full overflow-hidden rounded-lg bg-[#111318]">
                            <img
                              src={art.src}
                              alt={art.label}
                              className={`w-full h-full object-cover ${art.objectPos}`}
                            />
                          </div>
                          <span className="mt-1 block text-[10px] font-semibold truncate">
                            {art.label}
                          </span>
                        </button>
                      );
                    })}
                    {heroBannerUrl && heroBannerUrl !== DEFAULT_HERO_BANNER && (
                      <button
                        type="button"
                        onClick={() => setDraftCustomAvatar(heroBannerUrl)}
                        className={`rounded-xl border p-1.5 text-left transition ${
                          draftCustomAvatar === heroBannerUrl
                            ? "border-2 border-[#C59B27] bg-[#C59B27]/15"
                            : "border-[#C59B27]/25 hover:border-[#C59B27]/60"
                        }`}
                      >
                        <div className="h-10 w-full overflow-hidden rounded-lg bg-[#111318]">
                          <img
                            src={heroBannerUrl}
                            alt="Uploaded Heritage Artwork"
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                        <span className="mt-1 block text-[10px] font-semibold truncate">
                          Uploaded Artwork
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setShowCustomUpload((v) => !v)}
                    className="text-xs text-[#C59B27] hover:underline font-medium"
                  >
                    {showCustomUpload
                      ? "Hide custom photo upload"
                      : "Upload custom photo instead"}
                  </button>
                  {showCustomUpload && (
                    <div className="mt-2 space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleCustomAvatarFile(e.target.files?.[0])}
                        className="w-full text-xs"
                      />
                      {draftCustomAvatar && (
                        <button
                          type="button"
                          onClick={() => setDraftCustomAvatar(null)}
                          className="text-xs underline opacity-75"
                        >
                          Remove custom photo
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider"
              >
                Save Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================
          MODAL: PUBLIC RESEARCHER PROFILE CARD
      ================================================================ */}
      <PublicResearcherProfileModal
        author={inspectedAuthor}
        onClose={() => setInspectedAuthor(null)}
      />

      <GodModeBox id="sangat-footer-box" pageKey="sangat" label="Page Footer">
        <div className="max-w-7xl mx-auto px-4 pt-4 text-center">
          <GodModeText
            id="sangat-footer-caption"
            pageKey="sangat"
            tag="p"
            defaultText="Learn Sikhi • Independent Gurbani, History & Visual Heritage Sanctuary"
            className="text-xs font-semibold opacity-70"
          />
        </div>
        <Footer />
      </GodModeBox>
    </div>
  );
}

export default function SangatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-12 font-serif text-xl">
          Opening SikhInterest &amp; Vichaar Sanctuaryâ€¦
        </div>
      }
    >
      <SangatHubContent />
    </Suspense>
  );
}
