"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Eye,
  ImagePlus,
  MessageSquare,
  PenLine,
  Send,
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

/**
 * Curated foundational SikhStacks entries so the editorial feed always
 * showcases clean examples across all 4 categories (and opens in-page
 * with full threaded comments).
 */
const DEFAULT_SIKHSTACKS_POSTS: ArticleRecord[] = [
  {
    id: "sikhstacks-viyakaran-mool-mantar",
    slug: "gurbani-viyakaran-mool-mantar",
    title: "How One Sihari & Aunkar Transforms the Meaning of Mool Mantar",
    summary_short:
      "A clear walkthrough of Professor Sahib Singh's Gurbani Viyakaran showing how morphological case endings in Gurmukhi preserve exact philosophical meaning.",
    content_markdown: `## Why Gurbani Grammar Matters

In classical Gurmukhi, vowel markers such as the final *Aunkar* (\`ੁ\`) and *Sihari* (\`ਿ\`) are not decorative—they encode grammatical case, number, and syntactic relationship.

> **ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ ॥**

### Key Grammatical Observations

1. **ਸਤਿ ਨਾਮੁ (Sati Nāmu):** The *Sihari* on \`ਸਤਿ\` derives from the Sanskrit *Satya* (Ever-Stable Reality), while the *Aunkar* on \`ਨਾਮੁ\` marks a singular masculine noun in the nominative case.
2. **ਗੁਰ ਪ੍ਰਸਾਦਿ (Gur Prasādi):** The final *Sihari* on \`ਪ੍ਰਸਾਦਿ\` is an instrumental/locative marker meaning *"by the grace of the Guru"* rather than a noun in isolation.

Studying Gurbani through its internal grammar removes arbitrary speculation and anchors interpretation directly in the Guru's words.`,
    cover_image_url: null,
    author_id: null,
    author_name: "Gurbani Viyakaran Study Circle",
    source_name: "Gurbani Viyakaran (Prof. Sahib Singh)",
    source_url: null,
    category: "Research & Essay",
    tags: ["Research & Essay"],
    status: "published",
    created_at: "2026-02-10T10:00:00.000Z",
    updated_at: "2026-02-10T10:00:00.000Z",
  },
  {
    id: "sikhstacks-miri-piri-sovereignty",
    slug: "miri-piri-temporal-spiritual-sovereignty",
    title: "Hukam, Haumai, and the Architecture of Miri-Piri",
    summary_short:
      "Why Sikh philosophy refuses to separate inward contemplative discipline (Naam) from outward ethical responsibility and sovereignty in the world.",
    content_markdown: `## Beyond Monastic Withdrawal

From Guru Nanak Dev Ji's *Siddh Gosht* to Guru Hargobind Sahib Ji donning the twin swords of **Miri** and **Piri**, Gurmat establishes that spiritual realization must stand upright within society.

> **ਹੁਕਮਿ ਰਜਾਈ ਚਲਣਾ ਨਾਨਕ ਲਿਖਿਆ ਨਾਲਿ ॥**
> *To walk in harmony with Divine Command, O Nanak, is inscribed within our very being.* (Ang 1)

### The Twin Pillars

- **Piri (Spiritual Anchor):** Dissolving ego (*Haumai*) through *Simran*, *Kirtan*, and *Sangat*.
- **Miri (Temporal Responsibility):** Standing firm for justice (*Dharam*), feeding the hungry through *Langar*, and defending human dignity without malice (*Nirvair*).`,
    cover_image_url: null,
    author_id: null,
    author_name: "Sangat Philosophy Collective",
    source_name: "Sri Guru Granth Sahib Ji • Ang 1",
    source_url: null,
    category: "Philosophy & Vichaar",
    tags: ["Philosophy & Vichaar"],
    status: "published",
    created_at: "2026-02-08T10:00:00.000Z",
    updated_at: "2026-02-08T10:00:00.000Z",
  },
  {
    id: "sikhstacks-book-panth-prakash",
    slug: "book-showcase-sri-gur-panth-prakash",
    title: "Book Notes: Sri Gur Panth Prakash (1841) by Bhai Rattan Singh Bhangu",
    summary_short:
      "How an 18th-century Sikh historian recorded oral testimonies of the Khalsa's rise to answer colonial questions about Sikh sovereignty.",
    content_markdown: `## About the Work

Completed in **1841 CE**, *Sri Gur Panth Prakash* by Shaheed Bhai Rattan Singh Bhangu (grandson of Shaheed Bhai Mehtab Singh Mirankotia) is one of the most vital primary sources on 18th-century Khalsa history.

### Why Bhangu Wrote This Granth

When British East India Company officials asked how the Sikhs had legitimately acquired sovereignty over Punjab, Bhai Rattan Singh Bhangu compiled firsthand family and Panthic oral accounts to show that the Khalsa's sovereignty was bestowed directly by Guru Nanak Dev Ji and Guru Gobind Singh Ji—and sealed through decades of sacrifice.

### Recommended Editions

- **Gurmukhi Critical Text:** Edited by Bhai Vir Singh Ji and Dr. Balwant Singh Dhillon.
- **English Translation:** *Sri Gur Panth Prakash* (2 Volumes, translated by Prof. Kulwant Singh, Institute of Sikh Studies).`,
    cover_image_url: null,
    author_id: null,
    author_name: "Panthic Library Showcase",
    source_name: "Sri Gur Panth Prakash (1841)",
    source_url: null,
    category: "Book Showcase",
    tags: ["Book Showcase"],
    status: "published",
    created_at: "2026-02-05T10:00:00.000Z",
    updated_at: "2026-02-05T10:00:00.000Z",
  },
  {
    id: "sikhstacks-community-pothi-bindery",
    slug: "sikh-business-puratan-pothi-tanti-saaj-workshops",
    title: "Sikh Makers & Community Initiatives: Handcrafted Tanti Saaj & Pothi Conservation",
    summary_short:
      "Highlighting independent Sikh artisans, manuscript conservation labs, and community book clubs preserving Gurmat Sangeet and heritage publishing.",
    content_markdown: `## Supporting Independent Sikh Artisans & Initiatives

Across Punjab and the global diaspora, independent Sikh craftspeople and educators are reviving classical disciplines:

- **Tanti Saaj Luthiers:** Luthier workshops hand-carving seasoned *Tun* and *Mulberry* wood into authentic *Rababs*, *Sarandas*, *Taus*, and *Dilrubas* for Gurmat Sangeet students.
- **Manuscript & Pothi Conservation:** Archival initiatives digitizing and stabilizing historical Gurmukhi manuscripts while training youth in calligraphic preservation.
- **Independent Sikh Publishers & Bookstores:** Community-run presses printing high-contrast, acid-free editions of classical Sikh literature.

Have a Sikh business, book project, or community initiative to share? Click **Start Writing** above and tag your post under **Sikh Business / Community**.`,
    cover_image_url: null,
    author_id: null,
    author_name: "Sikh Commons Directory",
    source_name: "SikhStacks Community Showcase",
    source_url: null,
    category: "Sikh Business / Community",
    tags: ["Sikh Business / Community"],
    status: "published",
    created_at: "2026-02-02T10:00:00.000Z",
    updated_at: "2026-02-02T10:00:00.000Z",
  },
];

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
        setDbPosts(articlesData.articles as ArticleRecord[]);
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

  const allPosts = useMemo(() => {
    const seenIds = new Set(dbPosts.map((p) => p.id));
    const defaults = DEFAULT_SIKHSTACKS_POSTS.filter((d) => !seenIds.has(d.id));
    return [...dbPosts, ...defaults];
  }, [dbPosts]);

  const filteredPosts = useMemo(() => {
    if (activeType === "All") return allPosts;
    return allPosts.filter(
      (p) =>
        p.category === activeType ||
        (Array.isArray(p.tags) && p.tags.includes(activeType))
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
                className="flex flex-wrap items-center gap-2.5 text-xs font-medium pt-1"
              >
                <span style={{ color: "var(--text-primary)" }} className="font-semibold">
                  {selectedPost.author_name}
                </span>
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
                <p className="pt-0.5">
                  <a
                    href={selectedPost.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--accent-text)",
                    }}
                    className="font-medium underline hover:opacity-80"
                  >
                    View Reference Link ↗
                  </a>
                </p>
              )}
            </footer>
          </div>
        </article>

        {/* Threaded Reddit-Style Discussion beneath every SikhStacks post */}
        <ThreadedComments
          postId={selectedPost.id}
          onCountChange={(count) =>
            setCommentCounts((prev) => ({ ...prev, [selectedPost.id]: count }))
          }
        />
      </motion.div>
    );
  }

  return (
    <section id="sikhstacks-hub" className="space-y-6">
      {/* Editorial Section Header + "Start Writing" CTA */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4"
        style={{ borderColor: "var(--border-subtle)" }}
      >
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

        <button
          type="button"
          onClick={() => setIsComposerOpen((v) => !v)}
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
          className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold border border-transparent transition-opacity duration-150 hover:opacity-95 shrink-0"
        >
          {isComposerOpen ? (
            <>
              <X className="w-4 h-4" />
              Close Studio
            </>
          ) : (
            <>
              <PenLine className="w-4 h-4" />
              Start Writing
            </>
          )}
        </button>
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
                  <input
                    type="text"
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    placeholder="Source / Book / Business citation (optional)"
                    style={{
                      backgroundColor: "var(--bg-tertiary)",
                      borderColor: "var(--border-subtle)",
                      color: "var(--text-primary)",
                    }}
                    className="rounded-lg border px-3.5 py-2 text-sm focus:outline-none"
                  />
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="Reference link https://… (optional)"
                    style={{
                      backgroundColor: "var(--bg-tertiary)",
                      borderColor: "var(--border-subtle)",
                      color: "var(--text-primary)",
                    }}
                    className="rounded-lg border px-3.5 py-2 text-sm focus:outline-none"
                  />
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPosts.map((post) => {
            const count = commentCounts[post.id] || 0;
            const readMins = estimateReadMinutes(post.content_markdown);
            return (
              <button
                key={post.id}
                type="button"
                onClick={() => setSelectedPost(post)}
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-subtle)",
                }}
                className="group text-left rounded-xl border overflow-hidden hover:border-[var(--accent-primary)] transition-colors duration-150 flex flex-col justify-between"
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
                      <span
                        style={{ color: "var(--theme-text-muted)" }}
                        className="truncate"
                      >
                        {post.author_name}
                      </span>
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
                    <span
                      style={{ color: "var(--text-primary)" }}
                      className="font-semibold group-hover:underline"
                    >
                      Read →
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
