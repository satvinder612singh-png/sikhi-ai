"use client";

import React, { useState, useRef } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type AvatarPresetId =
  | "khanda-crest"
  | "ik-onkar-medallion"
  | "rabab-scholar"
  | "nihang-shield"
  | "lotus-amritsar"
  | "parchment-quill"
  | "sovereign-baaj"
  | "darbar-lantern";

export type RoleBadgeOption =
  | "Independent Sikh Researcher"
  | "Gurbani Learner"
  | "Visual Artist"
  | "Sangat Member"
  | "Itihaas Archivist"
  | "Raag & Tanti Saaj Student";

export type SangatUserProfile = {
  displayName: string;
  handle: string;
  roleBadge: RoleBadgeOption;
  bio: string;
  avatarPreset: AvatarPresetId;
  customAvatarDataUrl: string | null;
  interests: string[];
};

export const DEFAULT_SANGAT_PROFILE: SangatUserProfile = {
  displayName: "Sangat Researcher",
  handle: "khalsa_seeker",
  roleBadge: "Independent Sikh Researcher",
  bio: "Exploring Gurbani Viyakaran, classical Sikh manuscripts, Puratan Raag Kirtan, and sovereign Panthic history.",
  avatarPreset: "khanda-crest",
  customAvatarDataUrl: null,
  interests: [
    "Gurbani Research",
    "Sikh History",
    "Puratan Kirtan",
    "Gurmukhi Calligraphy",
  ],
};

export const SIKH_HERITAGE_AVATARS: {
  id: AvatarPresetId;
  name: string;
  gurmukhi: string;
  subtitle: string;
  bgGradient: string;
}[] = [
  {
    id: "khanda-crest",
    name: "Khanda Crest",
    gurmukhi: "ਖੰਡਾ ਸਾਹਿਬ",
    subtitle: "Sovereign Miri-Piri Emblem",
    bgGradient: "from-[#1B2A20] via-[#121C15] to-[#C59B27]/40",
  },
  {
    id: "ik-onkar-medallion",
    name: "Ik Onkar Medallion",
    gurmukhi: "ੴ ਮੋਹਰ",
    subtitle: "Non-Dual Divine Seal",
    bgGradient: "from-[#7C2D12] via-[#451A03] to-[#D97706]/50",
  },
  {
    id: "rabab-scholar",
    name: "Rabab Scholar",
    gurmukhi: "ਰਬਾਬੀ ਵਿਦਵਾਨ",
    subtitle: "Bhai Mardana Ji Lineage",
    bgGradient: "from-[#1E293B] via-[#0F172A] to-[#C59B27]/45",
  },
  {
    id: "nihang-shield",
    name: "Nihang Dhal Shield",
    gurmukhi: "ਨਿਹੰਗ ਢਾਲ",
    subtitle: "Akal SenaChakram & Shield",
    bgGradient: "from-[#1E3A8A] via-[#172554] to-[#E5C158]/40",
  },
  {
    id: "lotus-amritsar",
    name: "Lotus of Amritsar",
    gurmukhi: "ਅੰਮ੍ਰਿਤਸਰ ਕਮਲ",
    subtitle: "Untouched in the World-Ocean",
    bgGradient: "from-[#134E4A] via-[#042F2E] to-[#C59B27]/40",
  },
  {
    id: "parchment-quill",
    name: "Parchment & Kalam",
    gurmukhi: "ਪੁਰਾਤਨ ਕਲਮ",
    subtitle: "Bhai Gurdas Scribal Quill",
    bgGradient: "from-[#422006] via-[#271203] to-[#E5C158]/45",
  },
  {
    id: "sovereign-baaj",
    name: "Sovereign Baaj",
    gurmukhi: "ਚਿੱਟਾ ਬਾਜ਼",
    subtitle: "Tenth Master's White Falcon",
    bgGradient: "from-[#312E81] via-[#1E1B4B] to-[#C59B27]/40",
  },
  {
    id: "darbar-lantern",
    name: "Darbar Dome Lantern",
    gurmukhi: "ਹਰਿਮੰਦਰ ਜੋਤਿ",
    subtitle: "Golden Sanctuary Lamp",
    bgGradient: "from-[#3F2E1E] via-[#1C140D] to-[#F59E0B]/45",
  },
];

export const ROLE_BADGE_OPTIONS: RoleBadgeOption[] = [
  "Independent Sikh Researcher",
  "Gurbani Learner",
  "Visual Artist",
  "Sangat Member",
  "Itihaas Archivist",
  "Raag & Tanti Saaj Student",
];

export const SUGGESTED_INTEREST_TAGS: string[] = [
  "Gurbani Research",
  "Sikh History",
  "Puratan Kirtan",
  "Gurmukhi Calligraphy",
  "Suraj Prakash & Panth Prakash",
  "Matriarchs of the Panth",
  "Sikh Architecture",
  "Larivaar Santhiya",
  "Seva & Ecology",
];

/**
 * Renders either the user's custom uploaded avatar image OR one of the 8
 * curated regal Sikh heritage SVG emblems.
 */
export function SikhHeritageAvatar({
  preset = "khanda-crest",
  customDataUrl = null,
  size = "md",
  className = "",
}: {
  preset?: AvatarPresetId | string;
  customDataUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const dims =
    size === "sm"
      ? "h-8 w-8 text-xs"
      : size === "md"
      ? "h-11 w-11 text-sm"
      : size === "lg"
      ? "h-16 w-16 text-lg"
      : "h-24 w-24 text-2xl";

  if (customDataUrl) {
    return (
      <div
        className={`${dims} rounded-2xl overflow-hidden border-2 border-[#C59B27] shadow-sm shrink-0 bg-[#121C15] ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={customDataUrl}
          alt="User profile avatar"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  const found =
    SIKH_HERITAGE_AVATARS.find((a) => a.id === preset) ||
    SIKH_HERITAGE_AVATARS[0];

  return (
    <div
      className={`${dims} rounded-2xl border-2 border-[#C59B27] bg-gradient-to-br ${found.bgGradient} flex items-center justify-center shrink-0 shadow-sm text-[#E5C158] select-none ${className}`}
      title={found.name}
    >
      {preset === "ik-onkar-medallion" && (
        <span lang="pa" className="font-gurmukhi font-bold leading-none">
          ੴ
        </span>
      )}
      {preset === "khanda-crest" && (
        <svg
          viewBox="0 0 36 36"
          className="w-3/5 h-3/5 fill-current"
          aria-hidden="true"
        >
          <path d="M18 3l2.2 6.5V27l1.8 3h-8l1.8-3V9.5L18 3zm0 7a7.5 7.5 0 100 15 7.5 7.5 0 000-15zm0 2.5a5 5 0 110 10 5 5 0 010-10zM9.5 9C6 12.2 5 17.5 7.8 22.5l1.9-1.2C7.6 17.2 8.4 13.2 11 10.6L9.5 9zm17 0l-1.5 1.6c2.6 2.6 3.4 6.6 1.3 10.7l1.9 1.2c2.8-5 1.8-10.3-1.7-13.5z" />
        </svg>
      )}
      {preset === "rabab-scholar" && (
        <svg
          viewBox="0 0 36 36"
          className="w-3/5 h-3/5 fill-current"
          aria-hidden="true"
        >
          <path d="M25.5 4l3.5 3.5-2.5 2.5-1.4-1.4-6.8 6.8a6.5 6.5 0 11-2.8-2.8l6.8-6.8-1.3-1.3L25.5 4zM14 19a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      )}
      {preset === "nihang-shield" && (
        <svg
          viewBox="0 0 36 36"
          className="w-3/5 h-3/5 fill-current"
          aria-hidden="true"
        >
          <path d="M18 4a14 14 0 100 28 14 14 0 000-28zm0 3.5a10.5 10.5 0 110 21 10.5 10.5 0 010-21zm-4 6.5a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4zm-8 8a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
      )}
      {preset === "lotus-amritsar" && (
        <svg
          viewBox="0 0 36 36"
          className="w-3/5 h-3/5 fill-current"
          aria-hidden="true"
        >
          <path d="M18 6c2.5 4.2 3.8 8.2 3.2 12.2 2.8-2.6 5.8-3.8 8.8-3.2-.8 4.8-3.8 8.2-8.2 10H14.2c-4.4-1.8-7.4-5.2-8.2-10 3-.6 6 .6 8.8 3.2-.6-4 .7-8 3.2-12.2zM8 27h20v2.5H8V27z" />
        </svg>
      )}
      {preset === "parchment-quill" && (
        <svg
          viewBox="0 0 36 36"
          className="w-3/5 h-3/5 fill-current"
          aria-hidden="true"
        >
          <path d="M28 5c-7 1-13 5.5-16.5 13L9 27l2 2 9-2.5C27.5 23 32 17 33 10l-5-5zm-14.2 17.8l-1.6-1.6 8.5-8.5 1.6 1.6-8.5 8.5z" />
        </svg>
      )}
      {preset === "sovereign-baaj" && (
        <svg
          viewBox="0 0 36 36"
          className="w-3/5 h-3/5 fill-current"
          aria-hidden="true"
        >
          <path d="M29 7c-4.5 0-8.2 2.2-10.5 5.6L7 10l4.5 7.5L8 23l8.5-1.5L19 29l4.5-7.5c3.5-2.2 5.5-6.2 5.5-11.5V7z" />
        </svg>
      )}
      {preset === "darbar-lantern" && (
        <svg
          viewBox="0 0 36 36"
          className="w-3/5 h-3/5 fill-current"
          aria-hidden="true"
        >
          <path d="M18 4l4 5h-8l4-5zm-6 7h12l2 4v9l-3 4H13l-3-4v-9l2-4zm3 4v8h6v-8h-6z" />
        </svg>
      )}
    </div>
  );
}

export type PublishedSummaryItem = {
  id: string;
  type: "blog" | "pin" | "dil";
  title: string;
  subtitleOrCategory: string;
  createdAt: string;
  onDelete?: (id: string) => void;
};

export function ProfileStudioModal({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  userEmail,
  myBlogsCount,
  myPinsCount,
  myDilPostsCount,
  savedPinsCount,
  publishedItems,
}: {
  isOpen: boolean;
  onClose: () => void;
  profile: SangatUserProfile;
  onSaveProfile: (updated: SangatUserProfile) => void;
  userEmail?: string | null;
  myBlogsCount: number;
  myPinsCount: number;
  myDilPostsCount: number;
  savedPinsCount: number;
  publishedItems: PublishedSummaryItem[];
}) {
  const [activeTab, setActiveTab] = useState<"studio" | "dashboard">("studio");
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [handle, setHandle] = useState(profile.handle);
  const [roleBadge, setRoleBadge] = useState<RoleBadgeOption>(
    profile.roleBadge
  );
  const [bio, setBio] = useState(profile.bio);
  const [avatarPreset, setAvatarPreset] = useState<AvatarPresetId>(
    profile.avatarPreset
  );
  const [customAvatarDataUrl, setCustomAvatarDataUrl] = useState<string | null>(
    profile.customAvatarDataUrl
  );
  const [interests, setInterests] = useState<string[]>(profile.interests);
  const [customTagInput, setCustomTagInput] = useState("");
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleUploadAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCustomAvatarDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleInterestTag = (tag: string) => {
    if (interests.includes(tag)) {
      setInterests(interests.filter((t) => t !== tag));
    } else {
      setInterests([...interests, tag]);
    }
  };

  const handleAddCustomInterest = () => {
    const trimmed = customTagInput.trim();
    if (!trimmed) return;
    if (!interests.includes(trimmed)) {
      setInterests([...interests, trimmed]);
    }
    setCustomTagInput("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedHandle = handle
      .trim()
      .replace(/^@+/, "")
      .replace(/\s+/g, "_")
      .toLowerCase();

    const updated: SangatUserProfile = {
      displayName: displayName.trim() || "Sangat Researcher",
      handle: cleanedHandle || "khalsa_seeker",
      roleBadge,
      bio: bio.trim(),
      avatarPreset,
      customAvatarDataUrl,
      interests,
    };

    onSaveProfile(updated);

    // Sync to Supabase user_metadata & public.sangat_profiles if signed in
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      try {
        await supabase.auth.updateUser({
          data: {
            display_name: updated.displayName,
            handle: updated.handle,
            role_badge: updated.roleBadge,
            bio: updated.bio,
            avatar_preset: updated.avatarPreset,
          },
        });
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          await supabase.from("sangat_profiles").upsert({
            user_id: user.id,
            display_name: updated.displayName,
            handle: updated.handle,
            role_badge: updated.roleBadge,
            bio: updated.bio,
            avatar_preset: updated.avatarPreset,
            custom_avatar_data_url: updated.customAvatarDataUrl,
            interests: updated.interests,
            updated_at: new Date().toISOString(),
          });
        }
      } catch {
        // LocalStorage already persisted
      }
    }

    setSaveBanner("Profile Studio saved and synced across SikhInterest & Vichaar!");
    window.setTimeout(() => setSaveBanner(null), 3500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Researcher & Sangat Profile Studio"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-5 backdrop-blur-sm overflow-y-auto"
    >
      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--accent-primary)",
          color: "var(--text-primary)",
        }}
        className="w-full max-w-4xl rounded-3xl border-2 p-6 sm:p-8 shadow-2xl space-y-6 my-6 max-h-[92vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#C59B27]/25 pb-4">
          <div className="flex items-center gap-4">
            <SikhHeritageAvatar
              preset={avatarPreset}
              customDataUrl={customAvatarDataUrl}
              size="lg"
            />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C59B27]">
                SIKHINTEREST &amp; VICHAAR • PROFILE STUDIO
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold mt-0.5">
                {displayName || "Sangat Researcher"}{" "}
                <span className="text-xs font-sans font-normal text-[#C59B27]">
                  @{handle.replace(/^@/, "")}
                </span>
              </h2>
              <p
                style={{ color: "var(--theme-text-muted)" }}
                className="text-xs"
              >
                {roleBadge} {userEmail ? `• ${userEmail}` : "• Preview Mode"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("studio")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "studio"
                  ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B]"
                  : "border border-[#C59B27]/40"
              }`}
            >
              ੧ · Avatar &amp; Identity Studio
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("dashboard")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === "dashboard"
                  ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B]"
                  : "border border-[#C59B27]/40"
              }`}
            >
              ੨ · My Blogs, Pins &amp; Saved ({publishedItems.length})
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl border border-[#C59B27]/45 text-xs font-bold hover:border-[#C59B27]"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {saveBanner && (
          <div className="p-3.5 rounded-2xl border border-[#C59B27] bg-[#C59B27]/15 text-xs font-bold text-[#C59B27]">
            ✓ {saveBanner}
          </div>
        )}

        {/* TAB 1: AVATAR & IDENTITY STUDIO */}
        {activeTab === "studio" && (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Avatar Selector Section */}
            <div
              style={{
                backgroundColor: "var(--bg-primary)",
                borderColor: "var(--border-subtle)",
              }}
              className="p-5 rounded-2xl border space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-serif font-bold">
                    1. Choose Your Regal Sikh Heritage Emblem or Upload Custom Photo
                  </h3>
                  <p
                    style={{ color: "var(--theme-text-muted)" }}
                    className="text-xs"
                  >
                    Pick from 8 curated Panthic heritage medallions or upload your own
                    portrait/artwork.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadAvatarFile}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold"
                  >
                    📷 Upload Custom Image
                  </button>
                  {customAvatarDataUrl && (
                    <button
                      type="button"
                      onClick={() => setCustomAvatarDataUrl(null)}
                      className="px-3 py-2 rounded-xl border border-[#C59B27]/40 text-xs font-bold text-[#C59B27]"
                    >
                      Use Heritage Emblem Instead
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SIKH_HERITAGE_AVATARS.map((av) => {
                  const selected =
                    !customAvatarDataUrl && avatarPreset === av.id;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        setCustomAvatarDataUrl(null);
                        setAvatarPreset(av.id);
                      }}
                      style={{
                        backgroundColor: "var(--bg-surface)",
                      }}
                      className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                        selected
                          ? "border-2 border-[#C59B27] shadow-md"
                          : "border-[#C59B27]/30 hover:border-[#C59B27]"
                      }`}
                    >
                      <SikhHeritageAvatar preset={av.id} size="md" />
                      <div className="min-w-0">
                        <p
                          lang="pa"
                          className="font-gurmukhi text-xs font-bold text-[#C59B27] truncate"
                        >
                          {av.gurmukhi}
                        </p>
                        <p className="text-xs font-bold truncate">{av.name}</p>
                        <p
                          style={{ color: "var(--theme-text-muted)" }}
                          className="text-[10px] truncate"
                        >
                          {av.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Identity Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1">
                  Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g., Dr. Kirpal Singh"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#C59B27]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  @handle *
                </label>
                <input
                  type="text"
                  required
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="e.g., kirpal_singh"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#C59B27]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  Role / Title Badge
                </label>
                <select
                  value={roleBadge}
                  onChange={(e) =>
                    setRoleBadge(e.target.value as RoleBadgeOption)
                  }
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#C59B27]"
                >
                  {ROLE_BADGE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">
                Researcher &amp; Sangat Bio
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your research interests, favorite Banis, or artistic focus..."
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border-subtle)",
                }}
                className="w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#C59B27]"
              />
            </div>

            {/* Interests Tags */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold">
                Personal Research &amp; Sangati Interests
              </label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_INTEREST_TAGS.map((tag) => {
                  const active = interests.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleInterestTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                        active
                          ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] border-[#C59B27]"
                          : "border-[#C59B27]/35 text-[#C59B27]"
                      }`}
                    >
                      {active ? `✓ ${tag}` : `+ ${tag}`}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-1 max-w-md">
                <input
                  type="text"
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  placeholder="Add custom interest tag..."
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="flex-1 rounded-xl border px-3 py-1.5 text-xs focus:outline-none focus:border-[#C59B27]"
                />
                <button
                  type="button"
                  onClick={handleAddCustomInterest}
                  className="px-3.5 py-1.5 rounded-xl border border-[#C59B27]/50 text-xs font-bold text-[#C59B27]"
                >
                  + Add Tag
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-[#C59B27]/25">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#C59B27]/40 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider shadow-sm hover:brightness-105 transition"
              >
                Save Profile Studio →
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: MY PUBLISHED BLOGS, PINS & SAVED COLLECTION DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Published Essays", count: myBlogsCount },
                { label: "SikhInterest Pins", count: myPinsCount },
                { label: "Dil Di Baat Posts", count: myDilPostsCount },
                { label: "Saved Collection", count: savedPinsCount },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="p-4 rounded-2xl border text-center"
                >
                  <p className="text-2xl font-serif font-bold text-[#C59B27]">
                    {stat.count}
                  </p>
                  <p
                    style={{ color: "var(--theme-text-muted)" }}
                    className="text-xs font-semibold mt-0.5"
                  >
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-serif font-bold">
                Your Published Essays, Pins &amp; Dil Di Baat Reflections
              </h3>

              {publishedItems.length === 0 ? (
                <div
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--theme-text-muted)",
                  }}
                  className="p-8 rounded-2xl border text-center text-xs sm:text-sm"
                >
                  You haven&apos;t published any custom blogs, pins, or reflections yet. Use
                  the buttons on <code>/sangat</code> to share your first contribution!
                </div>
              ) : (
                <div className="space-y-2.5">
                  {publishedItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: "var(--bg-primary)",
                        borderColor: "var(--border-subtle)",
                      }}
                      className="p-4 rounded-2xl border flex items-center justify-between gap-4"
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#C59B27]">
                          {item.type === "blog"
                            ? "📜 Research Blog"
                            : item.type === "pin"
                            ? "📌 SikhInterest Pin"
                            : "💛 Dil Di Baat"}
                          {" • "}
                          {item.subtitleOrCategory}
                        </span>
                        <h4 className="text-sm sm:text-base font-serif font-bold mt-0.5">
                          {item.title}
                        </h4>
                        <p
                          style={{ color: "var(--theme-text-muted)" }}
                          className="text-[11px]"
                        >
                          Published {item.createdAt}
                        </p>
                      </div>

                      {item.onDelete && (
                        <button
                          type="button"
                          onClick={() => item.onDelete?.(item.id)}
                          className="px-3 py-1.5 rounded-xl border border-red-500/40 text-xs font-bold text-red-500 hover:bg-red-500/10"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Public Researcher Profile Card Modal when clicking any author's name on /sangat.
 */
export function PublicResearcherProfileModal({
  author,
  onClose,
}: {
  author: {
    name: string;
    handle: string;
    role: string;
    bio: string;
    avatarPreset: AvatarPresetId | string;
    customAvatar?: string | null;
    interests: string[];
    contributionsCount: number;
  } | null;
  onClose: () => void;
}) {
  if (!author) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Researcher Profile: ${author.name}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
    >
      <div
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--accent-primary)",
          color: "var(--text-primary)",
        }}
        className="w-full max-w-lg rounded-3xl border-2 p-6 sm:p-8 shadow-2xl space-y-5"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <SikhHeritageAvatar
              preset={author.avatarPreset}
              customDataUrl={author.customAvatar}
              size="lg"
            />
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#C59B27]/15 border border-[#C59B27]/40 text-[10px] font-bold uppercase tracking-wider text-[#C59B27]">
                {author.role}
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold mt-1">
                {author.name}
              </h3>
              <p className="text-xs font-mono text-[#C59B27]">
                @{author.handle.replace(/^@/, "")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl border border-[#C59B27]/40 text-xs font-bold"
          >
            ✕
          </button>
        </div>

        <p
          style={{ color: "var(--theme-text-muted)" }}
          className="text-sm leading-relaxed"
        >
          {author.bio}
        </p>

        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C59B27]">
            Focus Areas &amp; Interests
          </span>
          <div className="flex flex-wrap gap-1.5">
            {author.interests.map((tag) => (
              <span
                key={tag}
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border-subtle)",
                }}
                className="px-2.5 py-1 rounded-full border text-xs font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-[#C59B27]/25 flex items-center justify-between text-xs">
          <span className="font-bold text-[#C59B27]">
            {author.contributionsCount} Published Contributions on /sangat
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
