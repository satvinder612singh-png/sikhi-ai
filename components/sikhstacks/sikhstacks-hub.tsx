"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Eye,
  ImagePlus,
  PenLine,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { ArticleMarkdownRenderer } from "@/components/articles/markdown-renderer";
import { ThreadedComments } from "@/components/sikhstacks/threaded-comments";
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
  const [posts, setPosts] = useState<ArticleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<string>("All");
  const [selectedPost, setSelectedPost] = useState<ArticleRecord | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

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

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/articles", { cache: "no-store" });
      const data = await res.json();
      if (data?.ok && Array.isArray(data.articles)) {
        setPosts(data.articles as ArticleRecord[]);
      }
    } catch {
      // ignore transient error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const filteredPosts = useMemo(() => {
    if (activeType === "All") return posts;
    return posts.filter(
      (p) =>
        p.category === activeType ||
        (Array.isArray(p.tags) && p.tags.includes(activeType))
    );
  }, [posts, activeType]);

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
      setPosts((prev) => [created, ...prev]);
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

  // In-page full post reader view (never redirects off-site)
  if (selectedPost) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
        className="space-y-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setSelectedPost(null)}
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-subtle)",
            }}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold hover:border-amber-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to SikhStacks
          </button>

          <span
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-subtle)",
              color: "var(--accent-text, var(--accent-primary))",
            }}
            className="rounded-full border px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider"
          >
            {selectedPost.category}
          </span>
        </div>

        <article
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-subtle)",
          }}
          className="rounded-3xl border overflow-hidden shadow-sm"
        >
          {selectedPost.cover_image_url && (
            <div className="w-full max-h-[26rem] overflow-hidden bg-zinc-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPost.cover_image_url}
                alt={selectedPost.title}
                className="w-full h-full max-h-[26rem] object-cover"
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
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--accent-text, var(--accent-primary))",
                  }}
                  className="rounded-full border px-3 py-1 font-bold"
                >
                  {selectedPost.category}
                </span>
                {selectedPost.source_name && (
                  <span
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-subtle)",
                    }}
                    className="rounded-full border px-3 py-1 font-semibold"
                  >
                    Source: {selectedPost.source_name}
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
                className="flex flex-wrap items-center gap-3 text-xs font-medium pt-1"
              >
                <span>By {selectedPost.author_name}</span>
                <span>·</span>
                <span>{formatShortDate(selectedPost.created_at)}</span>
                <span>·</span>
                <span>
                  {estimateReadMinutes(selectedPost.content_markdown)} min read
                </span>
              </div>
            </header>

            <div className="max-w-none">
              <ArticleMarkdownRenderer
                content={selectedPost.content_markdown}
              />
            </div>

            <footer
              style={{
                backgroundColor: "var(--bg-primary)",
                borderColor: "var(--border-subtle)",
              }}
              className="rounded-2xl border p-5 space-y-1.5 text-sm"
            >
              <p
                style={{ color: "var(--accent-text, var(--accent-primary))" }}
                className="text-xs font-extrabold uppercase tracking-[0.18em]"
              >
                ✦ Citations &amp; Source Attribution
              </p>
              <p>
                <strong>Source:</strong>{" "}
                {selectedPost.source_name || "SikhStacks Original"}
              </p>
              {selectedPost.source_url && (
                <p>
                  <a
                    href={selectedPost.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--accent-text, var(--accent-primary))",
                    }}
                    className="font-semibold underline hover:opacity-80"
                  >
                    Reference Link ↗
                  </a>
                </p>
              )}
            </footer>
          </div>
        </article>

        {/* Threaded Reddit-Style Comments underneath every SikhStacks post */}
        <ThreadedComments postId={selectedPost.id} />
      </motion.div>
    );
  }

  return (
    <section id="sikhstacks-hub" className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p
            style={{ color: "var(--accent-text, var(--accent-primary))" }}
            className="text-xs font-extrabold uppercase tracking-[0.2em] inline-flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            SikhStacks • Community Publishing
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
            Essays, Research, Books &amp; Sikh Businesses
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setIsComposerOpen((v) => !v)}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#C59B27] to-[#D97706] px-5 py-2.5 text-sm font-extrabold text-zinc-950 shadow-sm hover:brightness-105 transition-all shrink-0"
        >
          {isComposerOpen ? (
            <>
              <X className="w-4 h-4" />
              Close Editor
            </>
          ) : (
            <>
              <PenLine className="w-4 h-4" />
              Write on SikhStacks
            </>
          )}
        </button>
      </div>

      {/* Embedded Distraction-Free Substack-Style Writing Studio */}
      <AnimatePresence>
        {isComposerOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-subtle)",
            }}
            className="rounded-3xl border p-6 sm:p-8 shadow-lg space-y-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4" style={{ borderColor: "var(--border-subtle)" }}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="font-serif text-xl font-bold">
                  SikhStacks Writing Studio
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewMode((p) => !p)}
                style={{ borderColor: "var(--border-subtle)" }}
                className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold hover:border-amber-500"
              >
                <Eye className="w-3.5 h-3.5" />
                {previewMode ? "Back to Edit" : "Preview"}
              </button>
            </div>

            {/* Post Type Tag Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider opacity-75">
                Post Type
              </label>
              <div className="flex flex-wrap gap-2">
                {SIKHSTACKS_POST_TYPES.map((type) => {
                  const active = postType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPostType(type)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                        active
                          ? "bg-amber-500 text-zinc-950 border-amber-500"
                          : "border-[var(--border-subtle)] hover:border-amber-500/60"
                      }`}
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
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border-subtle)",
                }}
                className="rounded-2xl border p-6 sm:p-8 space-y-5"
              >
                <h2 className="font-serif text-3xl font-bold">
                  {title || "Untitled SikhStacks Essay"}
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
                  content={contentMarkdown || "_Start writing to see your formatted essay here._"}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Headline — e.g., Book Notes on Sri Gur Panth Prakash…"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                  className="w-full rounded-2xl border px-4 py-3 font-serif text-xl sm:text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />

                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="2-line concise summary or subtitle shown on the SikhStacks card…"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                  className="w-full rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    placeholder="Optional source / book / business name"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-subtle)",
                      color: "var(--text-primary)",
                    }}
                    className="rounded-xl border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="Optional reference URL (https://…)"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-subtle)",
                      color: "var(--text-primary)",
                    }}
                    className="rounded-xl border px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                {/* Cover Upload + Markdown Formatting Toolbar */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
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
                    style={{ borderColor: "var(--border-subtle)" }}
                    className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold hover:border-amber-500"
                  >
                    <ImagePlus className="w-3.5 h-3.5" />
                    {uploadingCover
                      ? "Uploading…"
                      : coverImageUrl
                      ? "Change Cover"
                      : "Add Cover Image"}
                  </button>

                  <div className="flex flex-wrap items-center gap-1">
                    {[
                      { label: "H2", before: "## ", after: "" },
                      { label: "Bold", before: "**", after: "**" },
                      { label: "Italic", before: "_", after: "_" },
                      { label: "Quote", before: "> ", after: "" },
                    ].map((tool) => (
                      <button
                        key={tool.label}
                        type="button"
                        onClick={() => insertFormatting(tool.before, tool.after)}
                        style={{ borderColor: "var(--border-subtle)" }}
                        className="rounded-lg border px-2.5 py-1 text-xs font-semibold hover:border-amber-500"
                      >
                        {tool.label}
                      </button>
                    ))}
                  </div>
                </div>

                {coverImageUrl && (
                  <div className="relative rounded-2xl overflow-hidden max-h-52 border" style={{ borderColor: "var(--border-subtle)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverImageUrl}
                      alt="Cover preview"
                      className="w-full h-52 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setCoverImageUrl("")}
                      className="absolute top-2 right-2 rounded-full bg-black/70 text-white px-2.5 py-1 text-xs font-bold"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <textarea
                  ref={textareaRef}
                  rows={10}
                  value={contentMarkdown}
                  onChange={(e) => setContentMarkdown(e.target.value)}
                  placeholder="Write your essay, research notes, book review, or Sikh business story in clean Markdown…"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                  className="w-full rounded-2xl border px-4 py-3.5 text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            )}

            {statusMessage && (
              <p className="text-xs font-semibold text-amber-500">
                {statusMessage}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsComposerOpen(false)}
                style={{ borderColor: "var(--border-subtle)" }}
                className="rounded-full border px-4 py-2 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={publishing}
                onClick={() => void handlePublish()}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#C59B27] to-[#D97706] px-6 py-2.5 text-sm font-extrabold text-zinc-950 hover:brightness-105 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {publishing ? "Publishing…" : "Publish to SikhStacks"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Pills for the 4 Exact Post Types */}
      <div className="flex flex-wrap gap-2">
        {["All", ...SIKHSTACKS_POST_TYPES].map((type) => {
          const active = activeType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setActiveType(type)}
              style={
                active
                  ? undefined
                  : {
                      backgroundColor: "var(--bg-secondary)",
                      borderColor: "var(--border-subtle)",
                    }
              }
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                active
                  ? "bg-amber-500 text-zinc-950 border-amber-500"
                  : "hover:border-amber-500/60"
              }`}
            >
              {type}
            </button>
          );
        })}
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[0, 1].map((idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-subtle)",
              }}
              className="rounded-2xl border p-6 space-y-3 animate-pulse"
            >
              <div className="h-4 w-32 rounded-full bg-current opacity-15" />
              <div className="h-6 w-3/4 rounded bg-current opacity-15" />
              <div className="h-4 w-full rounded bg-current opacity-10" />
            </div>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-subtle)",
          }}
          className="rounded-3xl border p-8 sm:p-10 text-center space-y-3"
        >
          <p className="font-serif text-xl font-bold">
            No SikhStacks posts in this category yet
          </p>
          <p
            style={{ color: "var(--theme-text-muted)" }}
            className="text-sm max-w-lg mx-auto"
          >
            Share your research essay, Gurmat vichaar, favourite Sikh book, or
            community business directly with the Sangat.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsComposerOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#C59B27] to-[#D97706] px-5 py-2.5 text-xs font-extrabold text-zinc-950"
            >
              <PenLine className="w-4 h-4" />
              Write the First Post
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPosts.map((post) => (
            <button
              key={post.id}
              type="button"
              onClick={() => setSelectedPost(post)}
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-subtle)",
              }}
              className="group text-left rounded-3xl border overflow-hidden hover:border-amber-500/70 transition-all shadow-sm flex flex-col"
            >
              {post.cover_image_url && (
                <div className="w-full h-44 overflow-hidden bg-zinc-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2 text-[11px]">
                    <span
                      style={{
                        backgroundColor: "var(--bg-primary)",
                        borderColor: "var(--border-subtle)",
                        color: "var(--accent-text, var(--accent-primary))",
                      }}
                      className="rounded-full border px-2.5 py-0.5 font-extrabold"
                    >
                      {post.category}
                    </span>
                    {post.source_name && (
                      <span
                        style={{ color: "var(--theme-text-muted)" }}
                        className="font-semibold"
                      >
                        Source: {post.source_name}
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif text-xl font-bold leading-snug group-hover:text-amber-500 transition-colors">
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
                  style={{ color: "var(--theme-text-muted)" }}
                  className="flex items-center justify-between text-xs pt-2 border-t"
                >
                  <span>
                    {post.author_name} · {formatShortDate(post.created_at)}
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    Read &amp; Discuss →
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
