"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Code2,
  Eye,
  ImagePlus,
  Link2,
  LogIn,
  MessageSquare,
  PenLine,
  Repeat2,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { isStealthAdminEmail } from "@/components/editable-heritage-image";
import { ArticleMarkdownRenderer } from "@/components/articles/markdown-renderer";
import { ThreadedComments } from "@/components/sikhstacks/threaded-comments";
import {
  ReshareModal,
  type ReshareTarget,
} from "@/components/social/reshare-modal";
import type { ArticleRecord } from "@/lib/articles-store";

export const SIKHSTACKS_POST_TYPES = [
  "Research & Essay",
  "Philosophy & Vichaar",
  "Book Showcase",
  "Sikh Business / Community",
] as const;

export type SikhStacksPostType = (typeof SIKHSTACKS_POST_TYPES)[number];

function estimateReadMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function formatShortDate(iso: string): string {
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return "";
  return new Date(ts).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function SikhStacksHub() {
  const { user } = useAuth();
  const [dbPosts, setDbPosts] = useState<ArticleRecord[]>([]);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<string>("All");
  const [selectedPost, setSelectedPost] = useState<ArticleRecord | null>(null);
  const [reshareTarget, setReshareTarget] = useState<ReshareTarget | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);

  // Auto-open composer when returning from sign-in with ?compose=1
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("compose") === "1" && user) {
      setIsComposerOpen(true);
      setShowSignInPrompt(false);
    }
  }, [user]);

  const handleOpenComposer = () => {
    if (isComposerOpen) {
      setIsComposerOpen(false);
      return;
    }
    if (!user) {
      setShowSignInPrompt((prev) => !prev);
      return;
    }
    setShowSignInPrompt(false);
    setIsComposerOpen(true);
  };

  // Composer state
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [postType, setPostType] = useState<SikhStacksPostType>("Research & Essay");
  const [sourceName, setSourceName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const loadPostsAndCounts = useCallback(async () => {
    setLoading(true);
    try {
      const [articlesRes, countsRes] = await Promise.all([
        fetch("/api/articles", { cache: "no-store" }),
        fetch("/api/post-comments?counts=true", { cache: "no-store" }),
      ]);
      const articlesData = await articlesRes.json().catch(() => null);
      const countsData = await countsRes.json().catch(() => null);

      if (articlesData?.ok && Array.isArray(articlesData.articles)) {
        setDbPosts(
          (articlesData.articles as ArticleRecord[]).filter((p) =>
            Boolean(p?.id)
          )
        );
      }
      if (countsData?.ok && countsData.counts && typeof countsData.counts === "object") {
        setCommentCounts(countsData.counts as Record<string, number>);
      }
    } catch {
      // ignore transient error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPostsAndCounts();
  }, [loadPostsAndCounts]);

  const handleCommentCountChange = useCallback((postId: string, count: number) => {
    setCommentCounts((prev) =>
      prev[postId] === count ? prev : { ...prev, [postId]: count }
    );
  }, []);

  const allPosts = useMemo(() => dbPosts, [dbPosts]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const canDeletePost = useCallback(
    (post: ArticleRecord) => {
      if (isStealthAdminEmail(user?.email)) return true;
      if (typeof window !== "undefined") {
        const hasAdminToken = Boolean(
          window.localStorage.getItem("learnsikhi_admin_token_v1") ||
            window.localStorage.getItem("learnsikhi_founder_admin_v1") === "true"
        );
        if (hasAdminToken) return true;
      }
      return Boolean(user?.id && post.author_id && user.id === post.author_id);
    },
    [user]
  );

  const handleDeletePost = async (post: ArticleRecord, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm(`Permanently delete "${post.title}" for all visitors?`)) {
      return;
    }
    setDeletingId(post.id);
    try {
      const headers: Record<string, string> = {};
      if (typeof window !== "undefined") {
        const token =
          window.localStorage.getItem("learnsikhi_admin_token_v1") ||
          (window.localStorage.getItem("learnsikhi_founder_admin_v1") === "true"
            ? "verified_founder_1313"
            : "");
        if (token) headers["x-admin-token"] = token;
      }
      const res = await fetch(
        `/api/articles/${encodeURIComponent(post.id)}`,
        {
          method: "DELETE",
          headers,
          cache: "no-store",
        }
      );
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Could not delete post.");
      }
      setDbPosts((prev) => prev.filter((p) => p.id !== post.id));
      if (selectedPost?.id === post.id) {
        setSelectedPost(null);
      }
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : "Could not delete post."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredPosts = useMemo(() => {
    const valid = allPosts.filter((p) => Boolean(p?.id));
    if (activeType === "All") return valid;
    return valid.filter(
      (p) =>
        p?.category === activeType ||
        (Array.isArray(p?.tags) && p.tags.includes(activeType))
    );
  }, [allPosts, activeType]);

  const insertFormatting = (before: string, after = "") => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = contentMarkdown.slice(start, end) || "text";
    const next =
      contentMarkdown.slice(0, start) +
      before +
      selected +
      after +
      contentMarkdown.slice(end);
    setContentMarkdown(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(
        start + before.length,
        start + before.length + selected.length
      );
    });
  };

  const handleUploadCover = async (file: File) => {
    setUploadingCover(true);
    setStatusMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data?.url) {
        throw new Error(data?.error || "Cover upload failed.");
      }
      setCoverImageUrl(data.url);
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : "Could not upload cover image."
      );
    } finally {
      setUploadingCover(false);
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !contentMarkdown.trim()) {
      setStatusMessage("Please add a title and essay body before publishing.");
      return;
    }

    setPublishing(true);
    setStatusMessage(null);
    try {
      const authorName =
        user?.email?.split("@")[0] || "Sangat Contributor";

      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          summary_short:
            summary.trim() ||
            contentMarkdown.replace(/[#>*_`[\]()]/g, "").trim().slice(0, 200),
          content_markdown: contentMarkdown.trim(),
          cover_image_url: coverImageUrl.trim() || null,
          author_id: user?.id || null,
          author_name: authorName,
          source_name: sourceName.trim() || "SikhStacks Original",
          source_url: sourceUrl.trim() || null,
          category: postType,
          tags: [postType],
          status: "published",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok || !data.article) {
        throw new Error(data?.error || "Could not publish post.");
      }

      const created = data.article as ArticleRecord;
      setDbPosts((prev) => [created, ...prev]);
      setTitle("");
      setSummary("");
      setSourceName("");
      setSourceUrl("");
      setCoverImageUrl("");
      setContentMarkdown("");
      setPreviewMode(false);
      setIsComposerOpen(false);
      setSelectedPost(created);
    } catch (err) {
      setStatusMessage(
        err instanceof Error ? err.message : "Could not publish post."
      );
    } finally {
      setPublishing(false);
    }
  };

  // In-page full post reader view (generous editorial margins, zero off-site redirects)
  if (selectedPost) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="max-w-3xl mx-auto space-y-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setSelectedPost(null)}
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
            }}
            className="inline-flex items-center gap-2 rounded-lg border px-3.5 py-1.5 text-xs sm:text-sm font-medium hover:border-[var(--accent-primary)] transition-colors duration-150"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to SikhStacks
          </button>

          <div className="flex items-center gap-2">
            <span
              style={{
                backgroundColor: "var(--bg-tertiary)",
                borderColor: "var(--border-subtle)",
                color: "var(--accent-text)",
              }}
              className="rounded-md border px-2.5 py-1 text-xs font-semibold"
            >
              {selectedPost.category}
            </span>
            {canDeletePost(selectedPost) && (
              <button
                type="button"
                disabled={deletingId === selectedPost.id}
                onClick={(e) => void handleDeletePost(selectedPost, e)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 px-3 py-1 text-xs font-semibold text-red-500 hover:bg-red-500/10 disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {deletingId === selectedPost.id ? "Deleting…" : "Delete Post"}
              </button>
            )}
          </div>
        </div>

        <article
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
          className="rounded-2xl border overflow-hidden"
        >
          {selectedPost.cover_image_url && (
            <div
              className="w-full max-h-[24rem] overflow-hidden border-b"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPost.cover_image_url}
                alt={selectedPost.title}
                className="w-full h-full max-h-[24rem] object-cover"
              />
            </div>
          )}

          <div className="p-6 sm:p-10 md:p-12 space-y-8">
            <header
              style={{ borderColor: "var(--border-subtle)" }}
              className="space-y-4 border-b pb-6"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span
                  style={{
                    backgroundColor: "var(--bg-tertiary)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--accent-text)",
                  }}
                  className="rounded-md border px-2.5 py-0.5 font-semibold"
                >
                  {selectedPost.category}
                </span>
                {selectedPost.source_name && (
                  <span
                    style={{
                      color: "var(--theme-text-muted)",
                    }}
                    className="font-medium"
                  >
                    · Source: {selectedPost.source_name}
                  </span>
                )}
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
                {selectedPost.title}
              </h2>

              {selectedPost.summary_short && (
                <p
                  style={{ color: "var(--theme-text-muted)" }}
                  className="text-base sm:text-lg leading-relaxed"
                >
                  {selectedPost.summary_short}
                </p>
              )}

              <div
                style={{ color: "var(--theme-text-muted)" }}
                className="flex flex-wrap items-center justify-between gap-2.5 text-xs font-medium pt-1"
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  <Link
                    href={`/u/${encodeURIComponent(
                      selectedPost.author_id || selectedPost.author_name
                    )}`}
                    style={{ color: "var(--text-primary)" }}
                    className="font-semibold hover:underline"
                  >
                    {selectedPost.author_name}
                  </Link>
                  <span>·</span>
                  <span>{formatShortDate(selectedPost.created_at)}</span>
                  <span>·</span>
                  <span>
                    {estimateReadMinutes(selectedPost.content_markdown)} min read
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setReshareTarget({
                      target_type: "sikhstacks",
                      target_id: selectedPost.id,
                      target_title: selectedPost.title,
                      target_summary: selectedPost.summary_short,
                      target_image_url: selectedPost.cover_image_url,
                      target_author_name: selectedPost.author_name,
                      target_author_id: selectedPost.author_id,
                      target_category: selectedPost.category,
                    })
                  }
                  style={{
                    backgroundColor: "var(--bg-tertiary)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold hover:border-[var(--accent-primary)] transition-colors duration-150"
                >
                  <Repeat2 className="w-3.5 h-3.5" />
                  Reshare
                </button>
              </div>

              {selectedPost.source_url && (
                <div className="pt-2">
                  <a
                    href={selectedPost.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: "var(--bg-tertiary)",
                      borderColor: "var(--border-subtle)",
                      color: "var(--accent-text)",
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150 hover:border-[var(--accent-primary)]"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>
                      {selectedPost.source_name &&
                      selectedPost.source_name !== "SikhStacks Original"
                        ? selectedPost.source_name
                        : "Visit External Link"}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </header>

            <div className="max-w-none">
              <ArticleMarkdownRenderer
                content={selectedPost.content_markdown}
              />
            </div>

            <footer
              style={{
                backgroundColor: "var(--bg-tertiary)",
                borderColor: "var(--border-subtle)",
              }}
              className="rounded-xl border p-4 sm:p-5 space-y-1 text-xs sm:text-sm"
            >
              <p
                style={{ color: "var(--theme-text-muted)" }}
                className="text-[11px] font-semibold uppercase tracking-[0.16em]"
              >
                Source &amp; Attribution
              </p>
              <p>
                <strong>Cited Reference:</strong>{" "}
                {selectedPost.source_name || "SikhStacks Original"}
              </p>
              {selectedPost.source_url && (
                <div className="pt-2">
                  <a
                    href={selectedPost.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      borderColor: "var(--border-subtle)",
                      color: "var(--accent-text)",
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150 hover:border-[var(--accent-primary)]"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>
                      {selectedPost.source_name &&
                      selectedPost.source_name !== "SikhStacks Original"
                        ? selectedPost.source_name
                        : "Open External Link"}
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </footer>
          </div>
        </article>

        {/* Threaded Reddit-Style Discussion beneath every SikhStacks post */}
        <ThreadedComments
          postId={selectedPost.id}
          onCountChange={(count) =>
            handleCommentCountChange(selectedPost.id, count)
          }
        />

        <ReshareModal
          target={reshareTarget}
          onClose={() => setReshareTarget(null)}
        />
      </motion.div>
    );
  }

  return (
    <section id="sikhstacks-hub" className="space-y-6">
      {/* Editorial Section Header + Open Community "+ Contribute / Write on SikhStacks" CTA */}
      <div
        className="flex flex-col gap-4 border-b pb-4"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight">
              SikhStacks Community Publishing
            </h2>
            <p
              style={{ color: "var(--theme-text-muted)" }}
              className="text-xs sm:text-sm"
            >
              Open to all learners, scholars, authors, and builders—share essays,
              research, books, Sikh businesses, or open-source resources.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenComposer}
            style={
              isComposerOpen
                ? {
                    backgroundColor: "var(--bg-tertiary)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-primary)",
                  }
                : {
                    backgroundColor: "var(--accent-primary)",
                    color: "var(--cta-text)",
                  }
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs sm:text-sm font-semibold border border-transparent transition-opacity duration-150 hover:opacity-95 shrink-0"
          >
            {isComposerOpen ? (
              <>
                <X className="w-4 h-4" />
                Close Studio
              </>
            ) : (
              <>
                <PenLine className="w-4 h-4" />
                + Contribute / Write on SikhStacks
              </>
            )}
          </button>
        </div>

        {/* Smooth Sign-In Prompt for Signed-Out Visitors */}
        <AnimatePresence>
          {showSignInPrompt && !user && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
              }}
              className="rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-0.5">
                <p className="text-sm font-semibold">
                  Sign in to publish on SikhStacks
                </p>
                <p
                  style={{ color: "var(--theme-text-muted)" }}
                  className="text-xs"
                >
                  Anyone can contribute essays, book notes, Sikh businesses, or
                  open-source links. Sign in once and we&apos;ll open the writer
                  studio right away.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/login?next=%2F%3Fcompose%3D1"
                  style={{
                    backgroundColor: "var(--accent-primary)",
                    color: "var(--cta-text)",
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold hover:opacity-95"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In to Write
                </Link>
                <button
                  type="button"
                  onClick={() => setShowSignInPrompt(false)}
                  style={{ borderColor: "var(--border-subtle)" }}
                  className="rounded-lg border px-3 py-2 text-xs font-medium"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap items-center gap-1.5">
          {["All", ...SIKHSTACKS_POST_TYPES].map((type) => {
            const active = activeType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setActiveType(type)}
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
                className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors duration-150 hover:text-[var(--text-primary)]"
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Distraction-Free SikhStacks Writer Studio */}
      <AnimatePresence>
        {isComposerOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
            }}
            className="max-w-3xl mx-auto rounded-2xl border p-6 sm:p-10 space-y-6"
          >
            <div
              className="flex flex-wrap items-center justify-between gap-3 border-b pb-4"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <div className="space-y-0.5">
                <p
                  style={{ color: "var(--theme-text-muted)" }}
                  className="text-[11px] font-semibold uppercase tracking-[0.16em]"
                >
                  SikhStacks Writer Studio
                </p>
                <h3 className="font-serif text-xl font-bold">
                  Publish an Essay, Book Note, or Showcase
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewMode((p) => !p)}
                style={{
                  borderColor: "var(--border-subtle)",
                  backgroundColor: "var(--bg-tertiary)",
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium hover:border-[var(--accent-primary)]"
              >
                <Eye className="w-3.5 h-3.5" />
                {previewMode ? "Edit Markdown" : "Preview"}
              </button>
            </div>

            {/* Post Category Selector */}
            <div className="space-y-2">
              <label
                style={{ color: "var(--theme-text-muted)" }}
                className="text-xs font-medium"
              >
                Category
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SIKHSTACKS_POST_TYPES.map((type) => {
                  const active = postType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPostType(type)}
                      style={
                        active
                          ? {
                              backgroundColor: "var(--text-primary)",
                              color: "var(--bg-primary)",
                              borderColor: "var(--text-primary)",
                            }
                          : {
                              backgroundColor: "var(--bg-tertiary)",
                              borderColor: "var(--border-subtle)",
                              color: "var(--theme-text-muted)",
                            }
                      }
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors duration-150"
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {previewMode ? (
              <div
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  borderColor: "var(--border-subtle)",
                }}
                className="rounded-xl border p-6 sm:p-8 space-y-5"
              >
                <h2 className="font-serif text-3xl font-bold">
                  {title || "Untitled Essay"}
                </h2>
                {summary && (
                  <p
                    style={{ color: "var(--theme-text-muted)" }}
                    className="text-base"
                  >
                    {summary}
                  </p>
                )}
                <ArticleMarkdownRenderer
                  content={
                    contentMarkdown ||
                    "_Start writing to preview your formatted essay._"
                  }
                />
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title…"
                  style={{
                    backgroundColor: "var(--bg-tertiary)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                  className="w-full rounded-xl border px-4 py-3 font-serif text-xl sm:text-2xl font-bold focus:outline-none"
                />

                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Short subtitle or 2-line preview…"
                  style={{
                    backgroundColor: "var(--bg-tertiary)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label
                      style={{ color: "var(--theme-text-muted)" }}
                      className="block text-[11px] font-medium"
                    >
                      External Link (Website, Book, Substack, or Repo) — optional
                    </label>
                    <input
                      type="url"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      placeholder="https://…"
                      style={{
                        backgroundColor: "var(--bg-tertiary)",
                        borderColor: "var(--border-subtle)",
                        color: "var(--text-primary)",
                      }}
                      className="w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      style={{ color: "var(--theme-text-muted)" }}
                      className="block text-[11px] font-medium"
                    >
                      Link Label / Source Name — optional
                    </label>
                    <input
                      type="text"
                      value={sourceName}
                      onChange={(e) => setSourceName(e.target.value)}
                      placeholder="e.g., My Substack, GitHub Repo, Book Title"
                      style={{
                        backgroundColor: "var(--bg-tertiary)",
                        borderColor: "var(--border-subtle)",
                        color: "var(--text-primary)",
                      }}
                      className="w-full rounded-lg border px-3.5 py-2 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                {/* Minimal Formatting Bar */}
                <div
                  className="flex flex-wrap items-center justify-between gap-2 border-y py-2"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <div className="flex flex-wrap items-center gap-1">
                    {[
                      { label: "Heading", before: "## ", after: "" },
                      { label: "Bold", before: "**", after: "**" },
                      { label: "Italic", before: "_", after: "_" },
                      { label: "Quote", before: "> ", after: "" },
                      { label: "Gurmukhi", before: "> **", after: "**" },
                    ].map((tool) => (
                      <button
                        key={tool.label}
                        type="button"
                        onClick={() => insertFormatting(tool.before, tool.after)}
                        style={{
                          borderColor: "var(--border-subtle)",
                          backgroundColor: "var(--bg-tertiary)",
                        }}
                        className="rounded-md border px-2.5 py-1 text-xs font-medium hover:border-[var(--accent-primary)]"
                      >
                        {tool.label}
                      </button>
                    ))}
                  </div>

                  <div>
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleUploadCover(file);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      disabled={uploadingCover}
                      style={{
                        borderColor: "var(--border-subtle)",
                        backgroundColor: "var(--bg-tertiary)",
                      }}
                      className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium hover:border-[var(--accent-primary)]"
                    >
                      <ImagePlus className="w-3.5 h-3.5" />
                      {uploadingCover
                        ? "Uploading…"
                        : coverImageUrl
                        ? "Change Cover"
                        : "Cover Image"}
                    </button>
                  </div>
                </div>

                {coverImageUrl && (
                  <div
                    className="relative rounded-xl overflow-hidden max-h-52 border"
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverImageUrl}
                      alt="Cover preview"
                      className="w-full h-52 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setCoverImageUrl("")}
                      className="absolute top-2 right-2 rounded-md bg-black/75 text-white px-2.5 py-1 text-xs font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <textarea
                  ref={textareaRef}
                  rows={12}
                  value={contentMarkdown}
                  onChange={(e) => setContentMarkdown(e.target.value)}
                  placeholder="Write in clean Markdown or Gurmukhi…"
                  style={{
                    backgroundColor: "var(--bg-tertiary)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                  className="w-full rounded-xl border px-4 py-3.5 text-base leading-relaxed focus:outline-none"
                />
              </div>
            )}

            {statusMessage && (
              <p
                style={{ color: "var(--accent-text)" }}
                className="text-xs font-medium"
              >
                {statusMessage}
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIsComposerOpen(false)}
                style={{ borderColor: "var(--border-subtle)" }}
                className="rounded-lg border px-4 py-2 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={publishing}
                onClick={() => void handlePublish()}
                style={{
                  backgroundColor: "var(--accent-primary)",
                  color: "var(--cta-text)",
                }}
                className="inline-flex items-center gap-2 rounded-lg px-5 py-2 text-xs sm:text-sm font-semibold disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {publishing ? "Publishing…" : "Publish Post"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Substack-Style Editorial Feed */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1].map((idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
              }}
              className="rounded-xl border p-6 space-y-3 animate-pulse"
            >
              <div className="h-3.5 w-28 rounded bg-current opacity-10" />
              <div className="h-6 w-3/4 rounded bg-current opacity-10" />
              <div className="h-4 w-full rounded bg-current opacity-10" />
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
          className="rounded-2xl border p-8 sm:p-10 text-center space-y-3"
        >
          <p className="font-serif text-xl font-bold">
            No posts yet — click Start Writing to create the first one
          </p>
          <p
            style={{ color: "var(--theme-text-muted)" }}
            className="text-sm max-w-md mx-auto"
          >
            Share an essay, Gurmat vichaar, book showcase, or Sikh community
            initiative directly with the Sangat.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleOpenComposer}
              style={{
                backgroundColor: "var(--accent-primary)",
                color: "var(--cta-text)",
              }}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold"
            >
              <PenLine className="w-4 h-4" />
              + Contribute / Write on SikhStacks
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPosts.map((post) => {
            if (!post?.id) return null;
            const count = commentCounts[post.id] || 0;
            const readMins = estimateReadMinutes(post.content_markdown || "");
            return (
              <div
                key={post.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedPost(post)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedPost(post);
                  }
                }}
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-subtle)",
                }}
                className="group cursor-pointer text-left rounded-xl border overflow-hidden hover:border-[var(--accent-primary)] transition-colors duration-150 flex flex-col justify-between"
              >
                {post.cover_image_url && (
                  <div
                    className="w-full h-44 overflow-hidden border-b"
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.01]"
                    />
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col justify-between gap-5">
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        style={{
                          backgroundColor: "var(--bg-tertiary)",
                          borderColor: "var(--border-subtle)",
                          color: "var(--accent-text)",
                        }}
                        className="rounded-md border px-2 py-0.5 font-medium"
                      >
                        {post.category}
                      </span>
                      <Link
                        href={`/u/${encodeURIComponent(
                          post.author_id || post.author_name
                        )}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{ color: "var(--theme-text-muted)" }}
                        className="truncate hover:underline hover:text-[var(--text-primary)]"
                      >
                        {post.author_name}
                      </Link>
                      <span style={{ color: "var(--theme-text-muted)" }}>·</span>
                      <span style={{ color: "var(--theme-text-muted)" }}>
                        {formatShortDate(post.created_at)}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl sm:text-2xl font-bold leading-snug group-hover:text-[var(--accent-text)] transition-colors duration-150">
                      {post.title}
                    </h3>

                    <p
                      style={{ color: "var(--theme-text-muted)" }}
                      className="text-sm leading-relaxed line-clamp-3"
                    >
                      {post.summary_short}
                    </p>
                  </div>

                  <div
                    style={{
                      borderColor: "var(--border-subtle)",
                      color: "var(--theme-text-muted)",
                    }}
                    className="flex items-center justify-between text-xs pt-3 border-t"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        {readMins} min read
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {count} {count === 1 ? "comment" : "comments"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReshareTarget({
                            target_type: "sikhstacks",
                            target_id: post.id,
                            target_title: post.title,
                            target_summary: post.summary_short,
                            target_image_url: post.cover_image_url,
                            target_author_name: post.author_name,
                            target_author_id: post.author_id,
                            target_category: post.category,
                          });
                        }}
                        className="inline-flex items-center gap-1 hover:text-[var(--accent-text)] font-medium transition-colors"
                      >
                        <Repeat2 className="w-3.5 h-3.5" />
                        Reshare
                      </button>
                      {canDeletePost(post) && (
                        <button
                          type="button"
                          disabled={deletingId === post.id}
                          onClick={(e) => void handleDeletePost(post, e)}
                          className="inline-flex items-center gap-1 text-red-500 hover:underline font-medium disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      )}
                      <span
                        style={{ color: "var(--text-primary)" }}
                        className="font-semibold group-hover:underline"
                      >
                        Read →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Minimalistic Open-Source Community Platform Note */}
      <div
        style={{
          borderColor: "var(--border-subtle)",
          color: "var(--theme-text-muted)",
        }}
        className="flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-xs"
      >
        <span className="inline-flex items-center gap-1.5">
          <Code2 className="w-3.5 h-3.5" style={{ color: "var(--accent-text)" }} />
          <span>
            <strong style={{ color: "var(--text-primary)" }} className="font-semibold">
              Open-Source Community Platform
            </strong>{" "}
            — Built in the open for Sikhs, scholars, writers, and developers to share knowledge together.
          </span>
        </span>
        <a
          href="https://github.com/satvinder612singh-png/sikhi-ai"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--accent-text)" }}
          className="inline-flex items-center gap-1 font-medium hover:underline shrink-0"
        >
          Contribute on GitHub
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
      <ReshareModal
        target={reshareTarget}
        onClose={() => setReshareTarget(null)}
      />
    </section>
  );
}
