"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  AtSign,
  BookOpen,
  Briefcase,
  Edit3,
  Globe,
  Image as ImageIcon,
  Repeat2,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/components/auth-provider";
import type { UserProfileRecord } from "@/app/api/profiles/route";
import type { ReshareRecord } from "@/app/api/reshares/route";
import type { ArticleRecord } from "@/lib/articles-store";

interface PinSummary {
  id: string;
  title: string;
  description?: string;
  category?: string;
  authorName?: string;
  authorHandle?: string;
  imageDataUrl?: string | null;
  imageUrl?: string | null;
  createdAt?: string;
}

type ProfileTab = "sikhstacks" | "sikhinterest" | "reshares";

export function UserProfileView({ profileId }: { profileId?: string }) {
  const { user } = useAuth();
  const effectiveLookup = profileId || user?.id || "";

  const [profile, setProfile] = useState<UserProfileRecord | null>(null);
  const [articles, setArticles] = useState<ArticleRecord[]>([]);
  const [pins, setPins] = useState<PinSummary[]>([]);
  const [reshares, setReshares] = useState<ReshareRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>("sikhstacks");

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [xUrl, setXUrl] = useState("");
  const [substackUrl, setSubstackUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  const isOwnProfile = Boolean(
    user && (!profileId || profileId === user.id || profile?.id === user.id)
  );

  const loadProfileData = useCallback(async () => {
    if (!effectiveLookup) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const profRes = await fetch(
        `/api/profiles?id=${encodeURIComponent(effectiveLookup)}`,
        { cache: "no-store" }
      );
      const profData = await profRes.json().catch(() => null);
      const loadedProf: UserProfileRecord | null = profData?.ok
        ? profData.profile
        : null;
      setProfile(loadedProf);

      if (loadedProf) {
        setDisplayName(loadedProf.display_name || "");
        setUsername(loadedProf.username || "");
        setBio(loadedProf.bio || "");
        setInstagramUrl(loadedProf.instagram_url || "");
        setLinkedinUrl(loadedProf.linkedin_url || "");
        setXUrl(loadedProf.x_url || "");
        setSubstackUrl(loadedProf.substack_url || "");
        setWebsiteUrl(loadedProf.website_url || "");
      }

      const resolvedId = loadedProf?.id || effectiveLookup;
      const resolvedName = (loadedProf?.display_name || "").toLowerCase();
      const resolvedUsername = (loadedProf?.username || "").toLowerCase();

      const [articlesRes, sikhinterestRes, framesRes, resharesRes] = await Promise.all([
        fetch("/api/articles", { cache: "no-store" }),
        fetch("/api/sikhinterest", { cache: "no-store" }),
        fetch(`/api/site-frames?t=${Date.now()}`, { cache: "no-store" }),
        fetch(`/api/reshares?userId=${encodeURIComponent(resolvedId)}`, {
          cache: "no-store",
        }),
      ]);

      const articlesJson = await articlesRes.json().catch(() => null);
      if (articlesJson?.ok && Array.isArray(articlesJson.articles)) {
        const mine = (articlesJson.articles as ArticleRecord[]).filter((a) => {
          if (a.author_id && a.author_id === resolvedId) return true;
          const an = (a.author_name || "").trim().toLowerCase();
          return (
            Boolean(an) &&
            (an === resolvedName ||
              an === resolvedUsername ||
              an === effectiveLookup.toLowerCase())
          );
        });
        setArticles(mine);
      }

      const sikhinterestJson = await sikhinterestRes.json().catch(() => null);
      const dbPins: PinSummary[] = Array.isArray(sikhinterestJson?.posts)
        ? sikhinterestJson.posts
            .filter((row: Record<string, unknown>) => {
              if (row.author_id && String(row.author_id) === resolvedId) return true;
              const handle = String(row.author_handle || "").trim().toLowerCase();
              const an = String(row.author_name || "").trim().toLowerCase();
              return (
                (handle &&
                  (handle === resolvedUsername ||
                    handle === effectiveLookup.toLowerCase())) ||
                (an && (an === resolvedName || an === effectiveLookup.toLowerCase()))
              );
            })
            .map((row: Record<string, unknown>) => ({
              id: String(row.id || ""),
              title: String(row.title || "Untitled Visual"),
              category: String(row.category || "Sikh Art"),
              caption: String(row.description || ""),
              gurmukhiCalligraphy: String(row.gurmukhi_calligraphy || ""),
              authorName: String(row.author_name || "Sangat Artist"),
              authorHandle: String(row.author_handle || ""),
              imageDataUrl: typeof row.image_url === "string" ? row.image_url : undefined,
              likes: Number(row.likes_count || 0),
            }))
        : [];

      const framesJson = await framesRes.json().catch(() => null);
      const rawPins: PinSummary[] = Array.isArray(framesJson?.customPosts?.pins)
        ? framesJson.customPosts.pins
        : [];
      const legacyPins = rawPins.filter((p) => {
        const handle = (p.authorHandle || "").trim().toLowerCase();
        const an = (p.authorName || "").trim().toLowerCase();
        return (
          (handle &&
            (handle === resolvedUsername ||
              handle === effectiveLookup.toLowerCase())) ||
          (an && (an === resolvedName || an === effectiveLookup.toLowerCase()))
        );
      });
      const seenPinIds = new Set(dbPins.map((p) => p.id));
      setPins([...dbPins, ...legacyPins.filter((p) => !seenPinIds.has(p.id))]);

      const resharesJson = await resharesRes.json().catch(() => null);
      if (resharesJson?.ok && Array.isArray(resharesJson.reshares)) {
        setReshares(resharesJson.reshares as ReshareRecord[]);
      }
    } catch {
      // ignore transient errors
    } finally {
      setLoading(false);
    }
  }, [effectiveLookup]);

  useEffect(() => {
    void loadProfileData();
  }, [loadProfileData]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName,
          username,
          bio,
          instagram_url: instagramUrl,
          linkedin_url: linkedinUrl,
          x_url: xUrl,
          substack_url: substackUrl,
          website_url: websiteUrl,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok || !data.profile) {
        throw new Error(data?.error || "Could not save profile.");
      }
      setProfile(data.profile as UserProfileRecord);
      setIsEditing(false);
      setSaveMessage("Profile saved.");
      window.setTimeout(() => setSaveMessage(null), 2500);
    } catch (err) {
      setSaveMessage(
        err instanceof Error ? err.message : "Could not save profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReshare = async (id: string) => {
    try {
      const res = await fetch(`/api/reshares?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setReshares((prev) => prev.filter((r) => r.id !== id));
      }
    } catch {
      // ignore
    }
  };

  const socialPills = useMemo(() => {
    if (!profile) return [];
    const list: { label: string; url: string; icon: React.ReactNode }[] = [];
    if (profile.instagram_url) {
      list.push({
        label: "Instagram",
        url: profile.instagram_url,
        icon: <AtSign className="w-3.5 h-3.5" />,
      });
    }
    if (profile.linkedin_url) {
      list.push({
        label: "LinkedIn",
        url: profile.linkedin_url,
        icon: <Briefcase className="w-3.5 h-3.5" />,
      });
    }
    if (profile.x_url) {
      list.push({
        label: "X",
        url: profile.x_url,
        icon: <span className="font-bold text-xs leading-none">𝕏</span>,
      });
    }
    if (profile.substack_url) {
      list.push({
        label: "Substack",
        url: profile.substack_url,
        icon: <BookOpen className="w-3.5 h-3.5" />,
      });
    }
    if (profile.website_url) {
      list.push({
        label: "Website",
        url: profile.website_url,
        icon: <Globe className="w-3.5 h-3.5" />,
      });
    }
    return list;
  }, [profile]);

  return (
    <div
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
      className="min-h-screen flex flex-col"
    >
      <Header solid />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-28 space-y-8">
        {!effectiveLookup ? (
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
            }}
            className="rounded-2xl border p-10 text-center space-y-4"
          >
            <h1 className="font-serif text-3xl font-bold">Your Profile</h1>
            <p style={{ color: "var(--theme-text-muted)" }} className="text-sm">
              Sign in to customize your profile, add your social links, and view
              your SikhStacks essays, SikhInterest uploads, and Reshares.
            </p>
            <Link
              href="/login?next=%2Fprofile"
              style={{
                backgroundColor: "var(--accent-primary)",
                color: "var(--cta-text)",
              }}
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold"
            >
              Sign In
            </Link>
          </div>
        ) : loading ? (
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
            }}
            className="rounded-2xl border p-8 space-y-4 animate-pulse"
          >
            <div className="h-7 w-48 rounded bg-current opacity-15" />
            <div className="h-4 w-72 rounded bg-current opacity-10" />
          </div>
        ) : (
          <>
            {/* Profile Header Card */}
            <section
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
              }}
              className="rounded-2xl border p-6 sm:p-8 space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div
                    style={{
                      backgroundColor: "var(--bg-tertiary)",
                      borderColor: "var(--border-subtle)",
                      color: "var(--accent-text)",
                    }}
                    className="h-14 w-14 rounded-full border flex items-center justify-center font-serif text-2xl font-bold shrink-0"
                  >
                    {(profile?.display_name || "S").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="space-y-1">
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                      {profile?.display_name || "Sangat Member"}
                    </h1>
                    {profile?.username && (
                      <p
                        style={{ color: "var(--theme-text-muted)" }}
                        className="text-xs sm:text-sm font-medium"
                      >
                        @{profile.username}
                      </p>
                    )}
                    {profile?.bio && (
                      <p
                        style={{ color: "var(--theme-text-muted)" }}
                        className="text-sm leading-relaxed max-w-xl pt-1"
                      >
                        {profile.bio}
                      </p>
                    )}
                  </div>
                </div>

                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => setIsEditing((v) => !v)}
                    style={{
                      backgroundColor: "var(--bg-tertiary)",
                      borderColor: "var(--border-subtle)",
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold hover:border-[var(--accent-primary)] shrink-0"
                  >
                    {isEditing ? (
                      <>
                        <X className="w-3.5 h-3.5" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit Profile
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Active Social Links */}
              {socialPills.length > 0 && !isEditing && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {socialPills.map((s) => (
                    <a
                      key={s.label}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: "var(--bg-tertiary)",
                        borderColor: "var(--border-subtle)",
                        color: "var(--text-primary)",
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium hover:border-[var(--accent-primary)] transition-colors duration-150"
                    >
                      {s.icon}
                      <span>{s.label}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-60" />
                    </a>
                  ))}
                </div>
              )}

              {saveMessage && (
                <p
                  style={{ color: "var(--accent-text)" }}
                  className="text-xs font-medium"
                >
                  {saveMessage}
                </p>
              )}

              {/* Inline Edit Profile Form */}
              {isEditing && isOwnProfile && (
                <form
                  onSubmit={handleSaveProfile}
                  className="pt-4 border-t space-y-4"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium opacity-80">
                        Display Name
                      </label>
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        style={{
                          backgroundColor: "var(--bg-tertiary)",
                          borderColor: "var(--border-subtle)",
                          color: "var(--text-primary)",
                        }}
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium opacity-80">
                        Username
                      </label>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="your_handle"
                        style={{
                          backgroundColor: "var(--bg-tertiary)",
                          borderColor: "var(--border-subtle)",
                          color: "var(--text-primary)",
                        }}
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium opacity-80">Bio</label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell the Sangat what you study, write, or create..."
                      style={{
                        backgroundColor: "var(--bg-tertiary)",
                        borderColor: "var(--border-subtle)",
                        color: "var(--text-primary)",
                      }}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="url"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="Instagram URL (https://instagram.com/...)"
                      style={{
                        backgroundColor: "var(--bg-tertiary)",
                        borderColor: "var(--border-subtle)",
                        color: "var(--text-primary)",
                      }}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                    />
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="LinkedIn URL (https://linkedin.com/in/...)"
                      style={{
                        backgroundColor: "var(--bg-tertiary)",
                        borderColor: "var(--border-subtle)",
                        color: "var(--text-primary)",
                      }}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                    />
                    <input
                      type="url"
                      value={xUrl}
                      onChange={(e) => setXUrl(e.target.value)}
                      placeholder="X URL (https://x.com/...)"
                      style={{
                        backgroundColor: "var(--bg-tertiary)",
                        borderColor: "var(--border-subtle)",
                        color: "var(--text-primary)",
                      }}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                    />
                    <input
                      type="url"
                      value={substackUrl}
                      onChange={(e) => setSubstackUrl(e.target.value)}
                      placeholder="Substack URL (https://substack.com/@...)"
                      style={{
                        backgroundColor: "var(--bg-tertiary)",
                        borderColor: "var(--border-subtle)",
                        color: "var(--text-primary)",
                      }}
                      className="w-full rounded-lg border px-3 py-2 text-sm"
                    />
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="Website URL (optional)"
                      style={{
                        backgroundColor: "var(--bg-tertiary)",
                        borderColor: "var(--border-subtle)",
                        color: "var(--text-primary)",
                      }}
                      className="w-full rounded-lg border px-3 py-2 text-sm sm:col-span-2"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="submit"
                      disabled={saving}
                      style={{
                        backgroundColor: "var(--accent-primary)",
                        color: "var(--cta-text)",
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {saving ? "Saving…" : "Save Profile"}
                    </button>
                  </div>
                </form>
              )}
            </section>

            {/* 3 Clean Profile Tabs: SikhStacks | SikhInterest | Reshares */}
            <div
              className="flex flex-wrap items-center gap-2 border-b pb-3"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              {(
                [
                  {
                    id: "sikhstacks",
                    label: "SikhStacks",
                    count: articles.length,
                    icon: <BookOpen className="w-3.5 h-3.5" />,
                  },
                  {
                    id: "sikhinterest",
                    label: "SikhInterest",
                    count: pins.length,
                    icon: <ImageIcon className="w-3.5 h-3.5" />,
                  },
                  {
                    id: "reshares",
                    label: "Reshares",
                    count: reshares.length,
                    icon: <Repeat2 className="w-3.5 h-3.5" />,
                  },
                ] as const
              ).map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
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
                    className="inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors duration-150"
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    <span className="opacity-70">({tab.count})</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Panel Content */}
            {activeTab === "sikhstacks" && (
              <div className="space-y-4">
                {articles.length === 0 ? (
                  <div
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      borderColor: "var(--border-subtle)",
                      color: "var(--theme-text-muted)",
                    }}
                    className="rounded-2xl border p-8 text-center text-sm"
                  >
                    No SikhStacks essays published yet.
                  </div>
                ) : (
                  articles.map((art) => (
                    <Link
                      key={art.id}
                      href={`/articles/${art.slug}`}
                      style={{
                        backgroundColor: "var(--bg-surface)",
                        borderColor: "var(--border-subtle)",
                      }}
                      className="block rounded-xl border p-5 space-y-2 hover:border-[var(--accent-primary)] transition-colors duration-150"
                    >
                      <span
                        style={{ color: "var(--accent-text)" }}
                        className="text-xs font-semibold"
                      >
                        {art.category}
                      </span>
                      <h3 className="font-serif text-xl font-bold">
                        {art.title}
                      </h3>
                      <p
                        style={{ color: "var(--theme-text-muted)" }}
                        className="text-sm line-clamp-2"
                      >
                        {art.summary_short}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            )}

            {activeTab === "sikhinterest" && (
              <div>
                {pins.length === 0 ? (
                  <div
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      borderColor: "var(--border-subtle)",
                      color: "var(--theme-text-muted)",
                    }}
                    className="rounded-2xl border p-8 text-center text-sm"
                  >
                    No SikhInterest artwork uploaded yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {pins.map((pin) => {
                      const img = pin.imageDataUrl || pin.imageUrl;
                      return (
                        <div
                          key={pin.id}
                          style={{
                            backgroundColor: "var(--bg-surface)",
                            borderColor: "var(--border-subtle)",
                          }}
                          className="rounded-xl border overflow-hidden"
                        >
                          {img && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={img}
                              alt={pin.title}
                              className="w-full h-48 object-cover"
                            />
                          )}
                          <div className="p-4 space-y-1.5">
                            <h3 className="font-serif text-lg font-bold">
                              {pin.title}
                            </h3>
                            {pin.description && (
                              <p
                                style={{ color: "var(--theme-text-muted)" }}
                                className="text-xs line-clamp-2"
                              >
                                {pin.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === "reshares" && (
              <div className="space-y-4">
                {reshares.length === 0 ? (
                  <div
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      borderColor: "var(--border-subtle)",
                      color: "var(--theme-text-muted)",
                    }}
                    className="rounded-2xl border p-8 text-center text-sm"
                  >
                    No reshares yet. Use the Reshare button on any SikhStacks
                    essay or SikhInterest artwork to share it with your
                    commentary.
                  </div>
                ) : (
                  reshares.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        backgroundColor: "var(--bg-surface)",
                        borderColor: "var(--border-subtle)",
                      }}
                      className="rounded-2xl border p-5 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span
                          style={{ color: "var(--theme-text-muted)" }}
                          className="inline-flex items-center gap-1.5 font-medium"
                        >
                          <Repeat2
                            className="w-3.5 h-3.5"
                            style={{ color: "var(--accent-text)" }}
                          />
                          {profile?.display_name || r.user_name} reshared
                        </span>
                        {isOwnProfile && (
                          <button
                            type="button"
                            onClick={() => void handleDeleteReshare(r.id)}
                            className="inline-flex items-center gap-1 text-red-500 hover:underline text-xs"
                          >
                            <Trash2 className="w-3 h-3" />
                            Remove
                          </button>
                        )}
                      </div>

                      {r.comment && (
                        <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                          {r.comment}
                        </p>
                      )}

                      {/* Embedded Original Post Preview */}
                      <div
                        style={{
                          backgroundColor: "var(--bg-tertiary)",
                          borderColor: "var(--border-subtle)",
                        }}
                        className="rounded-xl border p-4 space-y-1.5"
                      >
                        <div className="flex items-center gap-2 text-[11px]">
                          <span
                            style={{ color: "var(--accent-text)" }}
                            className="font-semibold uppercase tracking-wider"
                          >
                            {r.target_type === "sikhstacks"
                              ? "SikhStacks"
                              : "SikhInterest"}
                          </span>
                          {r.target_author_name && (
                            <span style={{ color: "var(--theme-text-muted)" }}>
                              · {r.target_author_name}
                            </span>
                          )}
                        </div>
                        <p className="font-serif text-lg font-bold">
                          {r.target_title}
                        </p>
                        {r.target_summary && (
                          <p
                            style={{ color: "var(--theme-text-muted)" }}
                            className="text-xs line-clamp-2"
                          >
                            {r.target_summary}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
