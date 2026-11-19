"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MotionConfig } from "framer-motion";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/components/auth-provider";
import {
  checkVerifiedAdminStatus,
  getVerifiedAdminToken,
} from "@/components/editable-heritage-image";
import { ArticleMarkdownRenderer } from "@/components/articles/markdown-renderer";
import type {
  ApprovedSourceRecord,
  ArticleRecord,
  ArticleStatus,
} from "@/lib/articles-store";

const CATEGORIES = [
  "Gurbani Research",
  "Sikh History & Itihaas",
  "Classical Granth Translation",
  "Gurmat Philosophy",
  "Raag & Gurmat Sangeet",
  "Sikh Women & Leadership",
];

export function SubstackPublishingStudio() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [approvedSources, setApprovedSources] = useState<ApprovedSourceRecord[]>(
    []
  );
  const [myArticles, setMyArticles] = useState<ArticleRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  // Editor form state
  const [title, setTitle] = useState("");
  const [summaryShort, setSummaryShort] = useState("");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [sourceName, setSourceName] = useState("Learn Sikhi Original");
  const [sourceUrl, setSourceUrl] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tagsInput, setTagsInput] = useState("");
  const [viewMode, setViewMode] = useState<"write" | "preview">("write");

  // Upload & save status
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState<ArticleStatus | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    tone: "success" | "error";
    text: string;
    slug?: string;
  } | null>(null);

  useEffect(() => {
    let active = true;
    void checkVerifiedAdminStatus().then((ok) => {
      if (active) setIsAdmin(ok);
    });
    if (user?.email && !authorName) {
      setAuthorName(user.email.split("@")[0]);
    }
    return () => {
      active = false;
    };
  }, [user?.email, authorName]);

  const loadStudioMeta = useCallback(async () => {
    const token = await getVerifiedAdminToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      headers["x-admin-token"] = token;
    }

    const [srcRes, artRes] = await Promise.all([
      fetch("/api/approved-sources", { cache: "no-store" }),
      fetch(
        `/api/articles?status=all${user?.id ? `&authorId=${encodeURIComponent(user.id)}` : ""}`,
        { headers, cache: "no-store" }
      ),
    ]);

    const srcJson = (await srcRes.json().catch(() => null)) as {
      ok?: boolean;
      sources?: ApprovedSourceRecord[];
    } | null;
    if (srcJson?.ok && Array.isArray(srcJson.sources)) {
      setApprovedSources(srcJson.sources);
    }

    const artJson = (await artRes.json().catch(() => null)) as {
      ok?: boolean;
      articles?: ArticleRecord[];
    } | null;
    if (artJson?.ok && Array.isArray(artJson.articles)) {
      setMyArticles(artJson.articles);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadStudioMeta();
  }, [loadStudioMeta]);

  const loadArticleIntoEditor = useCallback((art: ArticleRecord) => {
    setEditingId(art.id);
    setEditingSlug(art.slug);
    setTitle(art.title);
    setSummaryShort(art.summary_short);
    setContentMarkdown(art.content_markdown);
    setCoverImageUrl(art.cover_image_url || "");
    setAuthorName(art.author_name);
    setSourceName(art.source_name || "Learn Sikhi Original");
    setSourceUrl(art.source_url || "");
    setCategory(art.category || CATEGORIES[0]);
    setTagsInput((art.tags || []).join(", "));
    setStatusMessage(null);
  }, []);

  useEffect(() => {
    if (!editSlug) return;
    void fetch(`/api/articles/${encodeURIComponent(editSlug)}?preview=true`, {
      cache: "no-store",
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { ok?: boolean; article?: ArticleRecord } | null) => {
        if (data?.ok && data.article) {
          loadArticleIntoEditor(data.article);
        }
      });
  }, [editSlug, loadArticleIntoEditor]);

  const insertSnippet = (snippet: string) => {
    const el = textareaRef.current;
    if (!el) {
      setContentMarkdown((prev) => `${prev}${prev ? "\n\n" : ""}${snippet}`);
      return;
    }
    const start = el.selectionStart ?? contentMarkdown.length;
    const end = el.selectionEnd ?? contentMarkdown.length;
    const next =
      contentMarkdown.slice(0, start) + snippet + contentMarkdown.slice(end);
    setContentMarkdown(next);
    window.requestAnimationFrame(() => {
      el.focus();
      const cursor = start + snippet.length;
      el.setSelectionRange(cursor, cursor);
    });
  };

  const handleCoverUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploadingCover(true);
    setUploadError(null);
    try {
      const token = await getVerifiedAdminToken();
      const form = new FormData();
      form.append("file", file);
      form.append("folder", "article-covers");
      form.append("recordId", editingSlug || title || "essay");

      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        headers["x-admin-token"] = token;
      }

      const res = await fetch("/api/upload-image", {
        method: "POST",
        headers,
        body: form,
        cache: "no-store",
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        publicUrl?: string;
        error?: string;
      } | null;

      if (!res.ok || !data?.ok || !data.publicUrl) {
        const msg =
          data?.error || `Cover image upload failed (HTTP ${res.status}).`;
        console.error("[Studio] Cover upload error:", msg);
        setUploadError(msg);
        return;
      }

      setCoverImageUrl(data.publicUrl);
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Network error uploading cover.";
      console.error("[Studio] Cover upload exception:", err);
      setUploadError(msg);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSave = async (targetStatus: ArticleStatus) => {
    if (!title.trim() || !summaryShort.trim() || !contentMarkdown.trim()) {
      setStatusMessage({
        tone: "error",
        text: "Please complete the Title, Short Summary (2–4 lines), and Essay Body before saving.",
      });
      return;
    }

    setSavingStatus(targetStatus);
    setStatusMessage(null);
    try {
      const token = await getVerifiedAdminToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        headers["x-admin-token"] = token;
      }

      const res = await fetch("/api/articles", {
        method: "POST",
        headers,
        cache: "no-store",
        body: JSON.stringify({
          id: editingId,
          slug: editingSlug,
          title: title.trim(),
          summary_short: summaryShort.trim(),
          content_markdown: contentMarkdown.trim(),
          cover_image_url: coverImageUrl.trim() || null,
          author_id: user?.id || null,
          author_name: authorName.trim() || "Learn Sikhi Contributor",
          source_name: sourceName.trim() || "Learn Sikhi Original",
          source_url: sourceUrl.trim() || null,
          category,
          tags: tagsInput,
          status: targetStatus,
        }),
      });

      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        article?: ArticleRecord;
        error?: string;
      } | null;

      if (!res.ok || !data?.ok || !data.article) {
        setStatusMessage({
          tone: "error",
          text: data?.error || `Could not save article (HTTP ${res.status}).`,
        });
        return;
      }

      setEditingId(data.article.id);
      setEditingSlug(data.article.slug);
      setStatusMessage({
        tone: "success",
        text:
          targetStatus === "published"
            ? "✓ Published live on Learn Sikhi!"
            : targetStatus === "pending_review"
              ? "✓ Submitted for editorial review."
              : "✓ Draft saved cleanly.",
        slug: data.article.slug,
      });

      await loadStudioMeta();
      router.refresh();
    } catch (err) {
      setStatusMessage({
        tone: "error",
        text: err instanceof Error ? err.message : "Failed to save article.",
      });
    } finally {
      setSavingStatus(null);
    }
  };

  const resetForNewEssay = () => {
    setEditingId(null);
    setEditingSlug(null);
    setTitle("");
    setSummaryShort("");
    setContentMarkdown("");
    setCoverImageUrl("");
    setSourceName("Learn Sikhi Original");
    setSourceUrl("");
    setTagsInput("");
    setStatusMessage(null);
    setUploadError(null);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div
        style={{
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
        className="min-h-screen flex flex-col"
      >
        <Header solid />

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 pb-28 space-y-8">
          {/* Top Studio Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p
                style={{ color: "var(--accent-text, var(--accent-primary))" }}
                className="text-xs font-extrabold uppercase tracking-[0.22em]"
              >
                Learn Sikhi Publishing Studio
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
                Write &amp; Publish Sikh Research
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/"
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-subtle)",
                }}
                className="sanctuary-interactive rounded-[var(--radius-control)] border px-4 py-2 text-xs sm:text-sm font-semibold hover:border-[#C59B27]"
              >
                ← Back to SikhStacks
              </Link>
              <button
                type="button"
                onClick={resetForNewEssay}
                style={{ borderColor: "var(--border-subtle)" }}
                className="sanctuary-interactive rounded-[var(--radius-control)] border px-4 py-2 text-xs sm:text-sm font-semibold hover:border-[#C59B27]"
              >
                + New Blank Essay
              </button>
            </div>
          </div>

          {statusMessage && (
            <div
              role="status"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor:
                  statusMessage.tone === "success" ? "#10B981" : "#DC2626",
              }}
              className="rounded-2xl border-2 px-5 py-4 flex flex-wrap items-center justify-between gap-3"
            >
              <p className="text-sm font-bold">{statusMessage.text}</p>
              {statusMessage.slug && (
                <Link
                  href={`/articles/${encodeURIComponent(statusMessage.slug)}`}
                  className="rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] px-4 py-2 text-xs font-extrabold text-[#18181B]"
                >
                  Open In-Page Reader →
                </Link>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Substack-Style Editor Column */}
            <div className="lg:col-span-8 space-y-6">
              <div
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-subtle)",
                }}
                className="sanctuary-glass rounded-[var(--radius-card)] border p-6 sm:p-8 space-y-6"
              >
                {/* Write / Live Preview Switcher */}
                <div
                  className="flex flex-wrap items-center justify-between gap-3 border-b pb-4"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewMode("write")}
                      className={`rounded-xl px-4 py-2 text-xs font-extrabold transition ${
                        viewMode === "write"
                          ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B]"
                          : "border hover:border-[#C59B27]"
                      }`}
                    >
                      ✎ Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("preview")}
                      className={`rounded-xl px-4 py-2 text-xs font-extrabold transition ${
                        viewMode === "preview"
                          ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B]"
                          : "border hover:border-[#C59B27]"
                      }`}
                    >
                      👁 Live Reader Preview
                    </button>
                  </div>
                  <span
                    style={{ color: "var(--theme-text-muted)" }}
                    className="text-xs font-semibold"
                  >
                    Supports Markdown, Gurbani Pankti blockquotes &amp; Gurmukhi
                    Unicode
                  </span>
                </div>

                {viewMode === "write" ? (
                  <div className="space-y-5">
                    {/* Cover Image Uploader (Supabase Storage site-media + cache busting) */}
                    <div
                      style={{
                        backgroundColor: "var(--theme-card-darker)",
                        borderColor: "var(--border-subtle)",
                      }}
                      className="rounded-2xl border p-4 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider">
                          Cover Artwork / Photograph
                        </span>
                        <label className="sanctuary-interactive cursor-pointer rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] px-3.5 py-1.5 text-xs font-extrabold text-[#18181B]">
                          {uploadingCover
                            ? "Uploading to Storage…"
                            : "⬆ Upload Cover Image"}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                            className="hidden"
                            disabled={uploadingCover}
                            onChange={(e) => {
                              void handleCoverUpload(e.target.files?.[0]);
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </div>

                      {uploadError && (
                        <p
                          role="alert"
                          className="rounded-xl border border-red-500/50 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-700 dark:text-red-300"
                        >
                          {uploadError}
                        </p>
                      )}

                      {coverImageUrl && (
                        <div className="relative rounded-xl overflow-hidden border">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            key={coverImageUrl}
                            src={coverImageUrl}
                            alt="Cover preview"
                            className="w-full max-h-56 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setCoverImageUrl("")}
                            className="absolute top-2 right-2 rounded-lg bg-black/75 px-2.5 py-1 text-xs font-bold text-white"
                          >
                            ✕ Remove
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Essay or Research Title…"
                      className="w-full bg-transparent font-serif text-3xl sm:text-4xl font-bold placeholder:opacity-50 focus:outline-none border-b pb-3"
                      style={{ borderColor: "var(--border-subtle)" }}
                    />

                    {/* Concise 2–4 line summary */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="studio-summary"
                        style={{ color: "var(--theme-text-muted)" }}
                        className="block text-xs font-extrabold uppercase tracking-wider"
                      >
                        Concise Summary (2–4 Lines — shown on article cards)
                      </label>
                      <textarea
                        id="studio-summary"
                        rows={3}
                        maxLength={420}
                        value={summaryShort}
                        onChange={(e) => setSummaryShort(e.target.value)}
                        placeholder="Write a crisp 2–4 line summary capturing the core thesis and Sikh historical or Gurbani context…"
                        style={{
                          backgroundColor: "var(--theme-card-darker)",
                          borderColor: "var(--border-subtle)",
                        }}
                        className="w-full rounded-xl border px-4 py-3 text-sm sm:text-base leading-relaxed focus:outline-none focus:border-[#C59B27]"
                      />
                    </div>

                    {/* Formatting & Gurmukhi Toolbar */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => insertSnippet("\n## Section Heading\n")}
                          style={{ borderColor: "var(--border-subtle)" }}
                          className="rounded-lg border px-2.5 py-1 text-xs font-bold hover:border-[#C59B27]"
                        >
                          H2 Heading
                        </button>
                        <button
                          type="button"
                          onClick={() => insertSnippet("\n### Subheading\n")}
                          style={{ borderColor: "var(--border-subtle)" }}
                          className="rounded-lg border px-2.5 py-1 text-xs font-bold hover:border-[#C59B27]"
                        >
                          H3
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            insertSnippet(
                              "\n> ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ॥\n> Translation & Ang citation here.\n"
                            )
                          }
                          style={{ borderColor: "var(--border-subtle)" }}
                          className="rounded-lg border px-2.5 py-1 text-xs font-bold hover:border-[#C59B27]"
                        >
                          ✦ Gurbani Pankti Quote
                        </button>
                        <button
                          type="button"
                          onClick={() => insertSnippet("**bold emphasis**")}
                          style={{ borderColor: "var(--border-subtle)" }}
                          className="rounded-lg border px-2.5 py-1 text-xs font-bold hover:border-[#C59B27]"
                        >
                          Bold
                        </button>
                        <button
                          type="button"
                          onClick={() => insertSnippet("\n- Key point\n")}
                          style={{ borderColor: "var(--border-subtle)" }}
                          className="rounded-lg border px-2.5 py-1 text-xs font-bold hover:border-[#C59B27]"
                        >
                          • List
                        </button>
                        {["ੴ", "॥", "ਵਾਹਿਗੁਰੂ"].map((glyph) => (
                          <button
                            key={glyph}
                            type="button"
                            lang="pa"
                            onClick={() => insertSnippet(glyph)}
                            style={{ borderColor: "var(--border-subtle)" }}
                            className="font-gurmukhi rounded-lg border px-2.5 py-1 text-xs font-bold hover:border-[#C59B27]"
                          >
                            {glyph}
                          </button>
                        ))}
                      </div>

                      <textarea
                        ref={textareaRef}
                        rows={16}
                        value={contentMarkdown}
                        onChange={(e) => setContentMarkdown(e.target.value)}
                        placeholder={
                          "Write your complete essay here using Markdown…\n\n> Use blockquotes (>) for Gurbani Panktis so they render in styled golden callout frames."
                        }
                        style={{
                          backgroundColor: "var(--theme-card-darker)",
                          borderColor: "var(--border-subtle)",
                        }}
                        className="w-full rounded-2xl border px-4 py-4 text-base leading-relaxed font-sans focus:outline-none focus:border-[#C59B27]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {coverImageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={coverImageUrl}
                        alt={title || "Cover"}
                        className="w-full max-h-72 object-cover rounded-2xl"
                      />
                    )}
                    <div className="space-y-2 border-b pb-5" style={{ borderColor: "var(--border-subtle)" }}>
                      <span
                        style={{
                          color: "var(--accent-text, var(--accent-primary))",
                        }}
                        className="text-xs font-extrabold uppercase tracking-wider"
                      >
                        Source: {sourceName} • {category}
                      </span>
                      <h2 className="font-serif text-3xl sm:text-4xl font-bold">
                        {title || "Untitled Essay"}
                      </h2>
                      <p
                        style={{ color: "var(--theme-text-muted)" }}
                        className="text-base sm:text-lg"
                      >
                        {summaryShort || "Your 2–4 line summary will appear here."}
                      </p>
                    </div>
                    <ArticleMarkdownRenderer
                      content={
                        contentMarkdown ||
                        "Start writing in the Editor tab to see your formatted essay and Gurbani Pankti blockquotes."
                      }
                    />
                  </div>
                )}

                {/* Save / Submit / Publish Footer */}
                <div
                  className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <button
                    type="button"
                    disabled={savingStatus !== null}
                    onClick={() => void handleSave("draft")}
                    style={{ borderColor: "var(--border-subtle)" }}
                    className="sanctuary-interactive rounded-[var(--radius-control)] border px-5 py-2.5 text-sm font-bold hover:border-[#C59B27] disabled:opacity-50"
                  >
                    {savingStatus === "draft" ? "Saving…" : "Save as Draft"}
                  </button>
                  <button
                    type="button"
                    disabled={savingStatus !== null}
                    onClick={() => void handleSave("pending_review")}
                    style={{
                      backgroundColor: "var(--theme-card-darker)",
                      borderColor: "#C59B27",
                    }}
                    className="sanctuary-interactive rounded-[var(--radius-control)] border px-5 py-2.5 text-sm font-bold disabled:opacity-50"
                  >
                    {savingStatus === "pending_review"
                      ? "Submitting…"
                      : "Submit for Review"}
                  </button>
                  <button
                    type="button"
                    disabled={savingStatus !== null}
                    onClick={() => void handleSave("published")}
                    className="sanctuary-interactive rounded-[var(--radius-control)] bg-gradient-to-r from-[#C59B27] to-[#D97706] px-6 py-2.5 text-sm font-extrabold text-[#18181B] shadow-md hover:brightness-105 disabled:opacity-50"
                  >
                    {savingStatus === "published"
                      ? "Publishing…"
                      : isAdmin
                        ? "Publish Live Now"
                        : "Publish to Sanctuary"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Sidebar: Verified Citation Metadata + Writer's Drafts */}
            <aside className="lg:col-span-4 space-y-6">
              <div
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-subtle)",
                }}
                className="sanctuary-glass rounded-[var(--radius-card)] border p-6 space-y-4"
              >
                <h2 className="font-serif text-xl font-bold">
                  Attribution &amp; Verified Source
                </h2>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider">
                    Author / Scholar Name
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g., Dr. Gurpreet Kaur"
                    style={{
                      backgroundColor: "var(--theme-card-darker)",
                      borderColor: "var(--border-subtle)",
                    }}
                    className="w-full rounded-xl border px-3.5 py-2 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider">
                    Verified Sikh Source Citation
                  </label>
                  <select
                    value={sourceName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSourceName(val);
                      const matched = approvedSources.find(
                        (s) => s.name === val
                      );
                      if (matched) setSourceUrl(matched.url);
                    }}
                    style={{
                      backgroundColor: "var(--theme-card-darker)",
                      borderColor: "var(--border-subtle)",
                    }}
                    className="w-full rounded-xl border px-3.5 py-2 text-sm font-semibold"
                  >
                    <option value="Learn Sikhi Original">
                      Learn Sikhi Original Research
                    </option>
                    {approvedSources.map((src) => (
                      <option key={src.id} value={src.name}>
                        {src.name} ({src.domain})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider">
                    Optional Reference URL (shown in Citations footer)
                  </label>
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://manglacharan.com/..."
                    style={{
                      backgroundColor: "var(--theme-card-darker)",
                      borderColor: "var(--border-subtle)",
                    }}
                    className="w-full rounded-xl border px-3.5 py-2 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      backgroundColor: "var(--theme-card-darker)",
                      borderColor: "var(--border-subtle)",
                    }}
                    className="w-full rounded-xl border px-3.5 py-2 text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Gurbani, Viyakaran, Suraj Prakash"
                    style={{
                      backgroundColor: "var(--theme-card-darker)",
                      borderColor: "var(--border-subtle)",
                    }}
                    className="w-full rounded-xl border px-3.5 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Saved Drafts & Published Essays */}
              <div
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-subtle)",
                }}
                className="sanctuary-glass rounded-[var(--radius-card)] border p-6 space-y-3"
              >
                <h2 className="font-serif text-xl font-bold">
                  Recent Drafts &amp; Essays ({myArticles.length})
                </h2>
                {myArticles.length === 0 ? (
                  <p
                    style={{ color: "var(--theme-text-muted)" }}
                    className="text-xs leading-relaxed"
                  >
                    Your saved drafts, submissions, and published essays will
                    appear here.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {myArticles.map((art) => (
                      <button
                        key={art.id}
                        type="button"
                        onClick={() => loadArticleIntoEditor(art)}
                        style={{
                          backgroundColor: "var(--theme-card-darker)",
                          borderColor:
                            editingId === art.id
                              ? "#C59B27"
                              : "var(--border-subtle)",
                        }}
                        className="w-full rounded-xl border p-3 text-left space-y-1 hover:border-[#C59B27] transition"
                      >
                        <div className="flex items-center justify-between gap-2 text-[10px] font-extrabold uppercase">
                          <span
                            style={{
                              color:
                                "var(--accent-text, var(--accent-primary))",
                            }}
                          >
                            {art.status.replace("_", " ")}
                          </span>
                          <span style={{ color: "var(--theme-text-muted)" }}>
                            {art.source_name}
                          </span>
                        </div>
                        <p className="font-serif text-sm font-bold truncate">
                          {art.title}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}
