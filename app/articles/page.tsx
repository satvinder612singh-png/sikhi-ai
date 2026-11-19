"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MotionConfig, motion } from "framer-motion";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import type {
  ApprovedSourceRecord,
  ArticleRecord,
} from "@/lib/articles-store";

function formatArticleDate(iso: string): string {
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return "";
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<ArticleRecord[]>([]);
  const [sources, setSources] = useState<ApprovedSourceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState<string>("All");
  const [query, setQuery] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [artRes, srcRes] = await Promise.all([
        fetch("/api/articles", { cache: "no-store" }),
        fetch("/api/approved-sources", { cache: "no-store" }),
      ]);
      const artJson = (await artRes.json().catch(() => null)) as {
        ok?: boolean;
        articles?: ArticleRecord[];
      } | null;
      const srcJson = (await srcRes.json().catch(() => null)) as {
        ok?: boolean;
        sources?: ApprovedSourceRecord[];
      } | null;

      if (artJson?.ok && Array.isArray(artJson.articles)) {
        setArticles(artJson.articles);
      }
      if (srcJson?.ok && Array.isArray(srcJson.sources)) {
        setSources(srcJson.sources);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredArticles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      if (selectedSource !== "All" && a.source_name !== selectedSource) {
        return false;
      }
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.summary_short.toLowerCase().includes(q) ||
        a.source_name.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [articles, selectedSource, query]);

  const sourceFilterOptions = useMemo(() => {
    const set = new Set<string>(["All"]);
    for (const s of sources) set.add(s.name);
    for (const a of articles) if (a.source_name) set.add(a.source_name);
    return Array.from(set);
  }, [sources, articles]);

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

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 pb-28 space-y-10">
          {/* Editorial Hero Header */}
          <header className="sanctuary-hero-glow flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="relative z-10 max-w-2xl space-y-3">
              <p
                style={{ color: "var(--accent-text, var(--accent-primary))" }}
                className="text-xs font-extrabold uppercase tracking-[0.22em]"
              >
                In-Page Sikh Research &amp; Essays
              </p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight">
                Articles &amp; Gurmat Scholarship
              </h1>
              <p
                style={{ color: "var(--theme-text-muted)" }}
                className="text-base sm:text-lg leading-relaxed"
              >
                Read complete essays, translations, and reflections directly
                inside Learn Sikhi—grounded in verified Sikh educational
                sources with full citations and zero off-site redirects.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/studio"
                className="sanctuary-interactive inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-gradient-to-r from-[#C59B27] to-[#D97706] px-6 py-3 text-sm sm:text-base font-extrabold text-[#18181B] shadow-md hover:brightness-105"
              >
                <span>✎ Open Writing Studio</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </header>

          {/* Search & Source Citation Filter */}
          <section
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
            }}
            className="sanctuary-glass rounded-[var(--radius-card)] border p-5 space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search essays, Gurbani topics, tags, or Sikh sources…"
                aria-label="Search articles"
                style={{
                  backgroundColor: "var(--theme-card-darker)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
                className="flex-1 rounded-xl border px-4 py-2.5 text-sm focus:outline-none focus:border-[#C59B27]"
              />
              <button
                type="button"
                onClick={() => void loadData()}
                style={{ borderColor: "var(--border-subtle)" }}
                className="sanctuary-interactive rounded-xl border px-4 py-2.5 text-xs font-bold hover:border-[#C59B27]"
              >
                ↻ Refresh
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {sourceFilterOptions.map((src) => {
                const active = selectedSource === src;
                return (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setSelectedSource(src)}
                    style={
                      active
                        ? undefined
                        : {
                            backgroundColor: "var(--theme-card-darker)",
                            borderColor: "var(--border-subtle)",
                          }
                    }
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                      active
                        ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B]"
                        : "border hover:border-[#C59B27]"
                    }`}
                  >
                    {src === "All" ? "All Sources" : `Source: ${src}`}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Articles Grid (Opens in-page at /articles/[slug]) */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="h-72 rounded-[var(--radius-card)] border p-6 animate-pulse"
                />
              ))}
            </div>
          ) : filteredArticles.length === 0 ? (
            <div
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
              }}
              className="sanctuary-glass rounded-[var(--radius-card)] border p-10 sm:p-14 text-center space-y-5"
            >
              <p
                style={{ color: "var(--accent-text, var(--accent-primary))" }}
                className="text-xs font-extrabold uppercase tracking-[0.22em]"
              >
                Clean Sanctuary • Ready for Original Publishing
              </p>
              <h2 className="font-serif text-3xl font-bold">
                {articles.length === 0
                  ? "No Published Articles Yet"
                  : "No Articles Match This Filter"}
              </h2>
              <p
                style={{ color: "var(--theme-text-muted)" }}
                className="max-w-xl mx-auto text-base leading-relaxed"
              >
                {articles.length === 0
                  ? "Seeded and scraped entries have been cleared so every essay on Learn Sikhi is intentionally authored, cited, and readable directly on the platform."
                  : "Try selecting All Sources or clearing your search query."}
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <Link
                  href="/studio"
                  className="sanctuary-interactive rounded-[var(--radius-control)] bg-gradient-to-r from-[#C59B27] to-[#D97706] px-6 py-3 text-sm sm:text-base font-extrabold text-[#18181B] shadow-md hover:brightness-105"
                >
                  ✎ Write the First Article →
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {filteredArticles.map((article, idx) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.26,
                    delay: Math.min(idx * 0.05, 0.2),
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                  className="sanctuary-glass sanctuary-interactive h-full rounded-[var(--radius-card)] border overflow-hidden flex flex-col justify-between"
                >
                  <Link
                    href={`/articles/${encodeURIComponent(article.slug)}`}
                    className="block flex-1 group"
                  >
                    {/* Cover Image or Heritage Gradient Banner */}
                    {article.cover_image_url ? (
                      <div className="aspect-[16/9] w-full overflow-hidden bg-zinc-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={article.cover_image_url}
                          alt={article.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[16/8] w-full bg-gradient-to-br from-[#17241c] via-[#1d2d22] to-[#111927] p-5 flex items-end justify-between">
                        <span
                          lang="pa"
                          className="font-gurmukhi text-3xl font-bold text-amber-300/90"
                        >
                          ੴ
                        </span>
                        <span className="rounded-full border border-amber-300/45 bg-black/40 px-2.5 py-0.5 text-[11px] font-bold text-amber-200">
                          {article.category}
                        </span>
                      </div>
                    )}

                    <div className="p-6 space-y-3">
                      {/* Explicit Source Citation Badge */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span
                          style={{
                            backgroundColor: "var(--theme-card-darker)",
                            borderColor: "var(--border-subtle)",
                            color: "var(--accent-text, var(--accent-primary))",
                          }}
                          className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-extrabold"
                        >
                          Source: {article.source_name || "Learn Sikhi Original"}
                        </span>
                        <span
                          style={{ color: "var(--theme-text-muted)" }}
                          className="font-semibold"
                        >
                          {formatArticleDate(article.created_at)}
                        </span>
                      </div>

                      <h2 className="font-serif text-2xl font-bold leading-snug group-hover:underline">
                        {article.title}
                      </h2>

                      {/* 2–4 line concise summary/excerpt */}
                      <p
                        style={{ color: "var(--theme-text-muted)" }}
                        className="text-sm sm:text-base leading-relaxed line-clamp-3"
                      >
                        {article.summary_short}
                      </p>

                      {article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {article.tags.slice(0, 4).map((tag) => (
                            <span
                              key={tag}
                              style={{
                                backgroundColor: "var(--theme-card-darker)",
                                borderColor: "var(--border-subtle)",
                              }}
                              className="rounded-lg border px-2 py-0.5 text-[11px] font-semibold"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>

                  <div
                    className="px-6 py-3.5 border-t flex items-center justify-between gap-2 text-xs"
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    <span
                      style={{ color: "var(--theme-text-muted)" }}
                      className="font-semibold truncate"
                    >
                      By {article.author_name}
                    </span>
                    <Link
                      href={`/articles/${encodeURIComponent(article.slug)}`}
                      style={{
                        color: "var(--accent-text, var(--accent-primary))",
                      }}
                      className="font-extrabold hover:underline shrink-0"
                    >
                      Read Full Essay →
                    </Link>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          {/* Verified Sikh Educational Sources Whitelist Footer */}
          {sources.length > 0 && (
            <section
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
              }}
              className="sanctuary-glass rounded-[var(--radius-card)] border p-6 sm:p-8 space-y-4"
            >
              <div className="space-y-1">
                <p
                  style={{ color: "var(--accent-text, var(--accent-primary))" }}
                  className="text-xs font-extrabold uppercase tracking-[0.2em]"
                >
                  Verified Sikh Educational Whitelist
                </p>
                <h2 className="font-serif text-2xl font-bold">
                  Approved Scholarly &amp; Educational Sources
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sources.map((src) => (
                  <div
                    key={src.id}
                    style={{
                      backgroundColor: "var(--theme-card-darker)",
                      borderColor: "var(--border-subtle)",
                    }}
                    className="rounded-2xl border p-4 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-serif text-base font-bold">
                        {src.name}
                      </h3>
                      <span
                        style={{
                          color: "var(--accent-text, var(--accent-primary))",
                        }}
                        className="text-[11px] font-bold"
                      >
                        {src.domain}
                      </span>
                    </div>
                    <p
                      style={{ color: "var(--theme-text-muted)" }}
                      className="text-xs leading-relaxed"
                    >
                      {src.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}
