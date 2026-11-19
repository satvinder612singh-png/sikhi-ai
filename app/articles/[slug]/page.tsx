"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MotionConfig, motion } from "framer-motion";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ArticleMarkdownRenderer } from "@/components/articles/markdown-renderer";
import { ThreadedComments } from "@/components/sikhstacks/threaded-comments";
import type { ArticleRecord } from "@/lib/articles-store";

function formatLongDate(iso: string): string {
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return "";
  return new Date(ts).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function ArticleReaderPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "";
  const [article, setArticle] = useState<ArticleRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setLoading(true);
    setError(null);

    void fetch(`/api/articles/${encodeURIComponent(slug)}?preview=true`, {
      cache: "no-store",
    })
      .then(async (res) => {
        const data = (await res.json().catch(() => null)) as {
          ok?: boolean;
          article?: ArticleRecord;
          error?: string;
        } | null;
        if (!active) return;
        if (!res.ok || !data?.ok || !data.article) {
          setError(data?.error || "Article not found.");
          setArticle(null);
        } else {
          setArticle(data.article);
        }
      })
      .catch(() => {
        if (active) setError("Unable to load article.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

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

        <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 pb-28 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href="/"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
              }}
              className="sanctuary-interactive inline-flex items-center gap-2 rounded-[var(--radius-control)] border px-4 py-2 text-sm font-semibold hover:border-[#C59B27]"
            >
              <span aria-hidden="true">←</span>
              <span>Back to SikhStacks</span>
            </Link>

            {article && (
              <Link
                href={`/studio?edit=${encodeURIComponent(article.slug)}`}
                style={{ borderColor: "var(--border-subtle)" }}
                className="sanctuary-interactive rounded-[var(--radius-control)] border px-4 py-2 text-xs font-bold hover:border-[#C59B27]"
              >
                ✎ Edit in Studio
              </Link>
            )}
          </div>

          {loading ? (
            <div
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
              }}
              className="rounded-[var(--radius-card)] border p-8 sm:p-12 space-y-5 animate-pulse"
            >
              <div className="h-5 w-44 rounded-full bg-current opacity-15" />
              <div className="h-10 w-5/6 rounded-xl bg-current opacity-15" />
              <div className="h-60 w-full rounded-2xl bg-current opacity-10" />
              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-current opacity-10" />
                <div className="h-4 w-11/12 rounded bg-current opacity-10" />
                <div className="h-4 w-4/5 rounded bg-current opacity-10" />
              </div>
            </div>
          ) : error || !article ? (
            <div
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
              }}
              className="sanctuary-glass rounded-[var(--radius-card)] border p-10 text-center space-y-4"
            >
              <h1 className="font-serif text-3xl font-bold">
                {error || "Article Not Found"}
              </h1>
              <p style={{ color: "var(--theme-text-muted)" }} className="text-base">
                This essay may be unpublished or moved. Return to the Articles
                Sanctuary or write a new essay in the Studio.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Link
                  href="/"
                  className="sanctuary-interactive rounded-[var(--radius-control)] bg-gradient-to-r from-[#C59B27] to-[#D97706] px-6 py-2.5 text-sm font-extrabold text-[#18181B]"
                >
                  Back to SikhStacks
                </Link>
              </div>
            </div>
          ) : (
            <motion.article
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
              }}
              className="sanctuary-glass rounded-[var(--radius-card)] border overflow-hidden"
            >
              {article.cover_image_url && (
                <div className="w-full max-h-[26rem] overflow-hidden bg-zinc-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={article.cover_image_url}
                    alt={article.title}
                    className="w-full h-full max-h-[26rem] object-cover"
                  />
                </div>
              )}

              <div className="p-6 sm:p-10 md:p-12 space-y-8">
                {/* Article Header Metadata */}
                <header
                  className="space-y-4 border-b pb-6"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <div className="flex flex-wrap items-center gap-2.5 text-xs">
                    <span
                      style={{
                        backgroundColor: "var(--theme-card-darker)",
                        borderColor: "var(--border-subtle)",
                        color: "var(--accent-text, var(--accent-primary))",
                      }}
                      className="rounded-full border px-3 py-1 font-extrabold uppercase tracking-wider"
                    >
                      Source: {article.source_name || "Learn Sikhi Original"}
                    </span>
                    <span
                      style={{
                        backgroundColor: "var(--theme-card-darker)",
                        borderColor: "var(--border-subtle)",
                      }}
                      className="rounded-full border px-3 py-1 font-bold"
                    >
                      {article.category}
                    </span>
                    {article.status !== "published" && (
                      <span className="rounded-full bg-amber-500/20 border border-amber-500 px-3 py-1 font-extrabold uppercase">
                        Status: {article.status.replace("_", " ")}
                      </span>
                    )}
                  </div>

                  <h1 className="font-serif text-3xl sm:text-5xl font-bold leading-tight tracking-tight">
                    {article.title}
                  </h1>

                  <p
                    style={{ color: "var(--theme-text-muted)" }}
                    className="text-lg sm:text-xl leading-relaxed"
                  >
                    {article.summary_short}
                  </p>

                  <div
                    style={{ color: "var(--theme-text-muted)" }}
                    className="flex flex-wrap items-center gap-3 text-sm font-medium pt-1"
                  >
                    <span>By {article.author_name}</span>
                    <span>•</span>
                    <span>{formatLongDate(article.created_at)}</span>
                  </div>
                </header>

                {/* Full In-Page Formatted Essay Content */}
                <ArticleMarkdownRenderer content={article.content_markdown} />

                {/* Tags */}
                {article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-4">
                    {article.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          backgroundColor: "var(--theme-card-darker)",
                          borderColor: "var(--border-subtle)",
                        }}
                        className="rounded-full border px-3 py-1 text-xs font-semibold"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Structured Citations & References Footer */}
                <footer
                  style={{
                    backgroundColor: "var(--theme-card-darker)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="rounded-2xl border border-l-4 border-l-[#C59B27] p-6 space-y-3"
                >
                  <p
                    style={{ color: "var(--accent-text, var(--accent-primary))" }}
                    className="text-xs font-extrabold uppercase tracking-[0.2em]"
                  >
                    ✦ Citations &amp; References
                  </p>
                  <div className="space-y-1.5 text-sm leading-relaxed">
                    <p>
                      <strong>Primary Source Attribution:</strong>{" "}
                      {article.source_name || "Learn Sikhi Original"}
                    </p>
                    <p style={{ color: "var(--theme-text-muted)" }}>
                      Author / Contributor: {article.author_name} • Published on
                      Learn Sikhi ({formatLongDate(article.created_at)})
                    </p>
                    {article.source_url && (
                      <p className="pt-1">
                        <a
                          href={article.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "var(--accent-text, var(--accent-primary))",
                          }}
                          className="font-bold underline hover:opacity-85"
                        >
                          Optional Original Reference Link (
                          {article.source_name}) ↗
                        </a>
                      </p>
                    )}
                  </div>
                </footer>
              </div>
            </motion.article>
          )}

          {article && <ThreadedComments postId={article.id} />}
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}
