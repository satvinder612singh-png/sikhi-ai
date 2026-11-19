"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import {
  EditableHeritageImage,
  useAdminEditMode,
  writeCmsCache,
  type CmsCustomTopic,
  type CmsSecurityConfig,
  type FrameOrientation,
  type HeritageFrameSettings,
} from "@/components/editable-heritage-image";

type AdminTab = "security" | "moderation" | "vault";

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
  archivedIds: string[];
  customTopics: Record<string, CmsCustomTopic[]>;
  securityConfig: CmsSecurityConfig;
  kirtanTracks: KirtanTrackRecord[];
  kirtanEdits: Record<string, KirtanTrackEdit>;
  pendingSubmissions: PendingSubmission[];
  storageMode?: string;
  updatedAt?: string;
}

const ADMIN_FLAG_KEY = "learnsikhi_founder_admin_v1";
const ADMIN_TOKEN_KEY = "learnsikhi_admin_token_v1";
const ADMIN_EMAIL_KEY = "learnsikhi_active_email_v1";

const DEFAULT_SECURITY_CONFIG: Required<CmsSecurityConfig> = {
  requireEmailVerification: false,
  requireSignInForSubmissions: false,
  requireAdminApproval: true,
  allowGuestKirtanPlay: true,
  readOnlyMaintenanceMode: false,
  hideSubmitterIdentity: false,
};

const EMPTY_STATE: SiteFramesState = {
  frames: {},
  customPosts: { links: [], blogs: [], pins: [] },
  deletedIds: [],
  archivedIds: [],
  customTopics: {},
  securityConfig: { ...DEFAULT_SECURITY_CONFIG },
  kirtanTracks: [],
  kirtanEdits: {},
  pendingSubmissions: [],
};

const SECURITY_CONTROLS: {
  key: keyof CmsSecurityConfig;
  title: string;
  description: string;
  danger?: boolean;
}[] = [
  {
    key: "requireEmailVerification",
    title: "Require Email Verification",
    description:
      "Users must have a verified Supabase email address before they can submit articles, comments, or Kirtan suggestions.",
  },
  {
    key: "requireSignInForSubmissions",
    title: "Require Account Sign-In to Post",
    description:
      "Block anonymous guest submissions across /sangat and /granths unless signed in.",
  },
  {
    key: "requireAdminApproval",
    title: "Mandatory Admin Approval Queue",
    description:
      "Hold all non-Admin articles, PDFs, and Kirtan links in the Moderation Queue for your review before publishing.",
  },
  {
    key: "allowGuestKirtanPlay",
    title: "Allow Users to Play Custom Kirtan Links",
    description:
      "Toggle whether visitors can load local MP3s or external audio links into their local session player on /granths.",
  },
  {
    key: "hideSubmitterIdentity",
    title: "Privacy Shield (hideSubmitterIdentity)",
    description:
      'Strip personal contributor names and emails from public cards and display "Sangat Contributor" instead.',
  },
  {
    key: "readOnlyMaintenanceMode",
    title: "Read-Only Site Lock (readOnlyMaintenanceMode)",
    description:
      "Pause all community submissions and non-Admin POST writes site-wide during maintenance.",
    danger: true,
  },
];

function resolveStreamPreviewUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "";
  if (
    trimmed.includes("drive.google.com") ||
    trimmed.includes("docs.google.com") ||
    trimmed.includes("archive.org")
  ) {
    return `/api/media-stream?url=${encodeURIComponent(trimmed)}`;
  }
  return trimmed;
}

export default function AdminControlCenterPage() {
  const [liveEditMode, setLiveEditMode] = useAdminEditMode();
  const [unlocked, setUnlocked] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>("security");
  const [siteState, setSiteState] = useState<SiteFramesState>(EMPTY_STATE);
  const [loadingState, setLoadingState] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{
    kind: "ok" | "err" | "saving";
    text: string;
  } | null>(null);

  // Kirtan & 5TB Drive Manager state
  const [newShabadTitle, setNewShabadTitle] = useState("");
  const [newShabadGurmukhi, setNewShabadGurmukhi] = useState("");
  const [newShabadRagi, setNewShabadRagi] = useState("");
  const [newShabadRaag, setNewShabadRaag] = useState("");
  const [newShabadUrl, setNewShabadUrl] = useState("");
  const [newShabadDuration, setNewShabadDuration] = useState("");
  const [newShabadArtKey, setNewShabadArtKey] = useState(
    () => `kirtan-art-${Date.now()}`
  );
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [trackDraftTitle, setTrackDraftTitle] = useState("");
  const [trackDraftRagi, setTrackDraftRagi] = useState("");
  const [trackDraftRaag, setTrackDraftRaag] = useState("");
  const [trackDraftUrl, setTrackDraftUrl] = useState("");
  const [testingTrackId, setTestingTrackId] = useState<string | null>(null);

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
        writeCmsCache(data);
        setSiteState({
          ...EMPTY_STATE,
          ...data,
          frames: data.frames || {},
          customPosts: data.customPosts || EMPTY_STATE.customPosts,
          deletedIds: Array.isArray(data.deletedIds) ? data.deletedIds : [],
          archivedIds: Array.isArray(data.archivedIds) ? data.archivedIds : [],
          customTopics: data.customTopics || {},
          securityConfig: {
            ...DEFAULT_SECURITY_CONFIG,
            ...(data.securityConfig || {}),
          },
          kirtanTracks: Array.isArray(data.kirtanTracks) ? data.kirtanTracks : [],
          kirtanEdits: data.kirtanEdits || {},
          pendingSubmissions: Array.isArray(data.pendingSubmissions)
            ? data.pendingSubmissions
            : [],
        });
      }
    } catch {
      // ignore offline errors
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
        customPosts: data.customPosts || prev.customPosts,
        deletedIds: Array.isArray(data.deletedIds) ? data.deletedIds : prev.deletedIds,
        archivedIds: Array.isArray(data.archivedIds)
          ? data.archivedIds
          : prev.archivedIds,
        customTopics: data.customTopics || prev.customTopics,
        securityConfig: {
          ...DEFAULT_SECURITY_CONFIG,
          ...(data.securityConfig || prev.securityConfig),
        },
        kirtanTracks: data.kirtanTracks || prev.kirtanTracks,
        kirtanEdits: data.kirtanEdits || prev.kirtanEdits,
        pendingSubmissions: data.pendingSubmissions || prev.pendingSubmissions,
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

  const handleToggleSecurityKey = async (key: keyof CmsSecurityConfig) => {
    const currentVal = Boolean(siteState.securityConfig?.[key]);
    const nextConfig: CmsSecurityConfig = {
      ...DEFAULT_SECURITY_CONFIG,
      ...(siteState.securityConfig || {}),
      [key]: !currentVal,
    };
    setSiteState((prev) => ({ ...prev, securityConfig: nextConfig }));
    await postStudioUpdate(
      { securityConfig: { [key]: !currentVal } },
      `✓ Updated security rule: ${key} = ${!currentVal ? "ON" : "OFF"}`
    );
  };

  const handleApproveSubmission = async (sub: PendingSubmission) => {
    const remaining = (siteState.pendingSubmissions || []).filter(
      (s) => s.id !== sub.id
    );
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
          customPosts: { links: [newLink] },
        },
        `✓ Approved & published "${sub.title}"`
      );
    }
  };

  const handleRejectSubmission = async (subId: string) => {
    const remaining = (siteState.pendingSubmissions || []).filter(
      (s) => s.id !== subId
    );
    await postStudioUpdate(
      { pendingSubmissions: remaining },
      "✓ Submission rejected & removed from queue"
    );
  };

  const handleRestoreArchived = async (id: string) => {
    const remaining = (siteState.archivedIds || []).filter((x) => x !== id);
    await postStudioUpdate(
      { archivedIds: remaining },
      `✓ Restored hidden item "${id}"`
    );
  };

  const handleRestoreDeleted = async (id: string) => {
    const remaining = (siteState.deletedIds || []).filter((x) => x !== id);
    await postStudioUpdate(
      { deletedIds: remaining, replaceDeletedIds: true },
      `✓ Restored deleted item "${id}"`
    );
  };

  const handleDeleteOrHidePost = async (compositeKey: string) => {
    await postStudioUpdate(
      { deletedIds: [...(siteState.deletedIds || []), compositeKey] },
      `✓ Removed item "${compositeKey}" from public feeds`
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

  const handleVaultOrientation = (
    imageKey: string,
    frame: HeritageFrameSettings,
    orientation: FrameOrientation
  ) => {
    void postStudioUpdate(
      { frames: { [imageKey]: { ...frame, orientation } } },
      `✓ Updated "${imageKey}" frame orientation to ${orientation}`
    );
  };

  const handleVaultDelete = (imageKey: string) => {
    void postStudioUpdate(
      { frames: { [imageKey]: null } },
      `✓ Removed "${imageKey}" frame override`
    );
  };

  const secCfg: Required<CmsSecurityConfig> = {
    ...DEFAULT_SECURITY_CONFIG,
    ...(siteState.securityConfig || {}),
  };

  const communityPostsList = [
    ...(siteState.customPosts.links || []).map((l) => ({
      compositeId: `link:${l.id}`,
      kind: "Curated Link",
      title: l.title || l.id,
      sub: l.publisher || "",
    })),
    ...(siteState.customPosts.blogs || []).map((b) => ({
      compositeId: `essay:${b.id}`,
      kind: "SikhStack Essay",
      title: b.title || b.id,
      sub: b.subtitle || "",
    })),
    ...(siteState.customPosts.pins || []).map((p) => ({
      compositeId: `visual:${p.id}`,
      kind: "SikhInterest Pin",
      title: p.title || p.id,
      sub: p.description || "",
    })),
  ].filter((item) => !(siteState.deletedIds || []).includes(item.compositeId));

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
                Founder Admin Control Center
              </h1>
              <p className="text-xs opacity-75">
                Sign in with your Founder Admin credentials to manage Security,
                Privacy, Moderation Queue, and the 5TB Media Vault.
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
                {authSubmitting ? "Verifying..." : "Unlock Control Center"}
              </button>
            </form>
          </section>
        ) : (
          <>
            {/* Live On-Page Edit Info Banner */}
            <div className="rounded-2xl border border-[#C59B27]/50 bg-[#C59B27]/12 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <strong className="text-[#9A7418] dark:text-[#E5C158]">
                  ✨ Live On-Page Creative Controls Moved:
                </strong>{" "}
                <span className="opacity-85">
                  Text, font, color, transition, section alignment, and card
                  reordering tools now live directly on every page via the top{" "}
                  <strong>Admin</strong> navbar dropdown button (
                  <code>Live On-Page Edit Mode</code>).
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLiveEditMode(!liveEditMode)}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-extrabold border transition ${
                  liveEditMode
                    ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                    : "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] border-[#C59B27]"
                }`}
              >
                ✏️ Live Page Edit Mode: {liveEditMode ? "ON" : "OFF"}
              </button>
            </div>

            {/* Header & 3 Streamlined Tabs */}
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
                    FOUNDER ADMIN • OPERATIONS CONTROL CENTER
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold">
                    Security, Privacy &amp; Moderation Control Center
                  </h1>
                  <p className="text-xs opacity-75 mt-1">
                    Storage mode:{" "}
                    <strong>{siteState.storageMode || "connecting"}</strong>
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

              <div
                className="flex flex-wrap gap-2 border-t pt-4"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                {(
                  [
                    {
                      id: "security",
                      label: "🛡️ Security & Privacy Controls",
                    },
                    {
                      id: "moderation",
                      label: `✅ Moderation & Approval Queue (${(siteState.pendingSubmissions || []).length})`,
                    },
                    {
                      id: "vault",
                      label: `☁️ 5TB Drive Kirtan & Media Vault (${(siteState.kirtanTracks || []).length} / ${Object.keys(siteState.frames || {}).length})`,
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

            {/* TAB 1: SECURITY, PRIVACY & USER INTERACTION CONTROLS */}
            {activeTab === "security" && (
              <section
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-subtle)",
                }}
                className="rounded-3xl border p-6 space-y-5"
              >
                <div>
                  <h2 className="text-xl font-serif font-bold">
                    🛡️ Security, Privacy &amp; User Interaction Controls
                  </h2>
                  <p className="text-xs opacity-75 mt-1">
                    Every toggle saves immediately to global <code>securityConfig</code> in{" "}
                    <code>/api/site-frames</code> and applies live across <code>/sangat</code> and{" "}
                    <code>/granths</code>.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SECURITY_CONTROLS.map((ctrl) => {
                    const enabled = Boolean(secCfg[ctrl.key]);
                    return (
                      <div
                        key={ctrl.key}
                        style={{ borderColor: "var(--border-subtle)" }}
                        className={`rounded-2xl border p-5 flex items-start justify-between gap-4 transition ${
                          ctrl.danger && enabled
                            ? "border-red-500/60 bg-red-500/5"
                            : enabled
                              ? "border-[#C59B27]/60 bg-[#C59B27]/5"
                              : ""
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold">{ctrl.title}</h3>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                                enabled
                                  ? ctrl.danger
                                    ? "bg-red-500/20 text-red-500"
                                    : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300"
                                  : "bg-zinc-500/15 opacity-70"
                              }`}
                            >
                              {enabled ? "ON" : "OFF"}
                            </span>
                          </div>
                          <p className="text-xs opacity-75 leading-relaxed">
                            {ctrl.description}
                          </p>
                        </div>

                        <button
                          type="button"
                          role="switch"
                          aria-checked={enabled}
                          aria-label={ctrl.title}
                          onClick={() => void handleToggleSecurityKey(ctrl.key)}
                          className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${
                            enabled
                              ? ctrl.danger
                                ? "bg-red-600"
                                : "bg-[#C59B27]"
                              : "bg-zinc-600/50"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                              enabled ? "translate-x-5" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* TAB 2: MODERATION & APPROVAL QUEUE */}
            {activeTab === "moderation" && (
              <div className="space-y-6">
                <section
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="rounded-3xl border p-6 space-y-5"
                >
                  <div>
                    <h2 className="text-xl font-serif font-bold">
                      ✅ Community Approval Queue
                    </h2>
                    <p className="text-xs opacity-75">
                      Review user-submitted articles, Kirtan tracks, and PDFs before publishing them publicly.
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
                              <p className="text-xs font-semibold opacity-80">
                                {sub.subtitle}
                              </p>
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

                {/* Archived & Deleted Restoration + Community Post Moderation */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                  <section
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      borderColor: "var(--border-subtle)",
                    }}
                    className="rounded-3xl border p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-serif font-bold">
                          Hidden &amp; Deleted Items (Restore)
                        </h3>
                        <p className="text-xs opacity-75">
                          Restore any card hidden with 👁️ Hide or deleted from community feeds.
                        </p>
                      </div>
                      {((siteState.archivedIds || []).length > 0 ||
                        (siteState.deletedIds || []).length > 0) && (
                        <button
                          type="button"
                          onClick={() =>
                            void postStudioUpdate(
                              {
                                archivedIds: [],
                                deletedIds: [],
                                replaceDeletedIds: true,
                              },
                              "✓ Restored all hidden & deleted items"
                            )
                          }
                          className="px-3 py-1.5 rounded-lg border border-[#C59B27]/50 text-[11px] font-bold text-[#9A7418] dark:text-[#E5C158]"
                        >
                          Restore All
                        </button>
                      )}
                    </div>

                    {(siteState.archivedIds || []).length === 0 &&
                    (siteState.deletedIds || []).length === 0 ? (
                      <p className="text-xs opacity-70 py-4">
                        No hidden or deleted items right now.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {(siteState.archivedIds || []).map((id) => (
                          <div
                            key={`arch-${id}`}
                            style={{ borderColor: "var(--border-subtle)" }}
                            className="rounded-xl border px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs"
                          >
                            <span className="truncate font-mono">
                              [Hidden] {id}
                            </span>
                            <button
                              type="button"
                              onClick={() => void handleRestoreArchived(id)}
                              className="px-2.5 py-1 rounded-lg bg-[#C59B27]/20 text-[#9A7418] dark:text-[#E5C158] font-bold shrink-0"
                            >
                              Restore
                            </button>
                          </div>
                        ))}
                        {(siteState.deletedIds || []).map((id) => (
                          <div
                            key={`del-${id}`}
                            style={{ borderColor: "var(--border-subtle)" }}
                            className="rounded-xl border px-3.5 py-2.5 flex items-center justify-between gap-2 text-xs"
                          >
                            <span className="truncate font-mono">
                              [Deleted] {id}
                            </span>
                            <button
                              type="button"
                              onClick={() => void handleRestoreDeleted(id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold shrink-0"
                            >
                              Restore
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  <section
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      borderColor: "var(--border-subtle)",
                    }}
                    className="rounded-3xl border p-6 space-y-4"
                  >
                    <div>
                      <h3 className="text-lg font-serif font-bold">
                        Published Community Posts ({communityPostsList.length})
                      </h3>
                      <p className="text-xs opacity-75">
                        Remove or delete published guest posts from the global feed.
                      </p>
                    </div>

                    {communityPostsList.length === 0 ? (
                      <p className="text-xs opacity-70 py-4">
                        No active custom community posts found.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                        {communityPostsList.map((post) => (
                          <div
                            key={post.compositeId}
                            style={{ borderColor: "var(--border-subtle)" }}
                            className="rounded-xl border px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold uppercase text-[#C59B27]">
                                {post.kind}
                              </p>
                              <p className="font-bold truncate">{post.title}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                void handleDeleteOrHidePost(post.compositeId)
                              }
                              className="px-2.5 py-1 rounded-lg border border-red-500/40 text-red-600 dark:text-red-400 font-bold shrink-0"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              </div>
            )}

            {/* TAB 3: 5TB GOOGLE DRIVE KIRTAN, PDF & MEDIA VAULT */}
            {activeTab === "vault" && (
              <div className="space-y-6">
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
                        Add New Shabad / 5TB Drive Media Track
                      </h2>
                      <p className="text-xs opacity-75">
                        Paste any 5TB Google Drive share link or direct MP3 URL. Streams through{" "}
                        <code>/api/media-stream</code> with zero Supabase storage cost.
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
                          <label className="block text-xs font-bold mb-1">
                            Shabad Name *
                          </label>
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
                          <label className="block text-xs font-bold mb-1">
                            Ragi / Jatha
                          </label>
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
                          <label className="block text-xs font-bold mb-1">
                            Duration
                          </label>
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
                          Optional Artwork for this Shabad (leave blank for clean text card)
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
                        Manage &amp; Test Existing Drive Shabads
                      </h2>
                      <p className="text-xs opacity-75">
                        Test live audio streams through <code>/api/media-stream</code>, rename Shabads, update Drive URLs, or delete tracks.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {[
                        ...(siteState.kirtanTracks || []),
                        {
                          id: "live-harmandir-sahib-amritsar",
                          title:
                            siteState.kirtanEdits?.["live-harmandir-sahib-amritsar"]
                              ?.title ||
                            "Sri Harmandir Sahib (Darbar Sahib) Live 24/7 Stream",
                          ragi:
                            siteState.kirtanEdits?.["live-harmandir-sahib-amritsar"]
                              ?.ragi || "Hazoori Ragi Jathas • SGPC",
                          raag:
                            siteState.kirtanEdits?.["live-harmandir-sahib-amritsar"]
                              ?.raag || "Live 24/7 Kirtan",
                          sourceUrl:
                            siteState.kirtanEdits?.["live-harmandir-sahib-amritsar"]
                              ?.sourceUrl || "https://live.sgpc.net:8443/;nocache=1",
                        },
                      ].map((tr) => {
                        const isEditingTrack = editingTrackId === tr.id;
                        const isDeleted = siteState.kirtanEdits?.[tr.id]?.deleted;
                        if (isDeleted) return null;
                        const isTesting = testingTrackId === tr.id;
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
                                    ("imageKey" in tr && tr.imageKey) ||
                                    `kirtan-art-${tr.id}`
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
                              <>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="text-sm font-bold truncate">
                                      {tr.title}
                                    </p>
                                    <p className="text-[11px] opacity-75 truncate">
                                      {tr.ragi} • {tr.raag || "Kirtan"}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setTestingTrackId(isTesting ? null : tr.id)
                                      }
                                      className="px-2.5 py-1 rounded-lg border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 text-xs font-bold"
                                    >
                                      {isTesting ? "Close Stream" : "▶ Test Stream"}
                                    </button>
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

                                {isTesting && (
                                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                                    <audio
                                      controls
                                      autoPlay
                                      src={resolveStreamPreviewUrl(tr.sourceUrl)}
                                      className="w-full h-9"
                                    />
                                    <p className="text-[10px] opacity-65 break-all">
                                      Stream source: {resolveStreamPreviewUrl(tr.sourceUrl)}
                                    </p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </div>

                {/* Uploaded Paintings & Media Vault */}
                <section
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="rounded-3xl border p-6 space-y-5"
                >
                  <div>
                    <h2 className="text-xl font-serif font-bold">
                      Uploaded Paintings &amp; Media Frames ({Object.keys(siteState.frames).length})
                    </h2>
                    <p className="text-xs opacity-75">
                      Every uploaded <code>&lt;EditableHeritageImage /&gt;</code> asset and framing override stored globally in{" "}
                      <code>/api/site-frames</code>.
                    </p>
                  </div>

                  {Object.keys(siteState.frames).length === 0 ? (
                    <div className="rounded-2xl border border-[#C59B27]/25 p-8 text-center text-sm opacity-75">
                      No custom uploaded frames stored yet. Upload a painting directly on any page while Live Edit Mode is ON.
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
                                  onClick={() =>
                                    handleVaultOrientation(imageKey, frame, ori)
                                  }
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
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
