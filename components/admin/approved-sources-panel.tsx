"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getVerifiedAdminToken } from "@/components/editable-heritage-image";
import type {
  ApprovedSourceRecord,
  ArticleRecord,
} from "@/lib/articles-store";

export function ApprovedSourcesAdminPanel() {
  const [sources, setSources] = useState<ApprovedSourceRecord[]>([]);
  const [articles, setArticles] = useState<ArticleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // Add Source Form
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newRssUrl, setNewRssUrl] = useState("");
  const [newCategory, setNewCategory] = useState("Sikh Scholarship");
  const [newDescription, setNewDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const authHeaders = async (): Promise<Record<string, string>> => {
    const token = await getVerifiedAdminToken();
    const h: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      h.Authorization = `Bearer ${token}`;
      h["x-admin-token"] = token;
    }
    return h;
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await authHeaders();
      const [srcRes, artRes] = await Promise.all([
        fetch("/api/approved-sources", { cache: "no-store" }),
        fetch("/api/articles?status=all", { headers, cache: "no-store" }),
      ]);
      const srcJson = (await srcRes.json().catch(() => null)) as {
        ok?: boolean;
        sources?: ApprovedSourceRecord[];
      } | null;
      const artJson = (await artRes.json().catch(() => null)) as {
        ok?: boolean;
        articles?: ArticleRecord[];
      } | null;

      if (srcJson?.ok && Array.isArray(srcJson.sources)) {
        setSources(srcJson.sources);
      }
      if (artJson?.ok && Array.isArray(artJson.articles)) {
        setArticles(artJson.articles);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUrl.trim()) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const headers = await authHeaders();
      const res = await fetch("/api/approved-sources", {
        method: "POST",
        headers,
        cache: "no-store",
        body: JSON.stringify({
          name: newName.trim(),
          url: newUrl.trim(),
          rss_url: newRssUrl.trim() || null,
          category: newCategory.trim() || "Sikh Scholarship",
          description: newDescription.trim(),
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;
      if (!res.ok || !data?.ok) {
        setMessage(data?.error || "Could not add approved Sikh source.");
        return;
      }
      setNewName("");
      setNewUrl("");
      setNewRssUrl("");
      setNewDescription("");
      setMessage("✓ Verified Sikh source added to approved_sources whitelist.");
      await loadAll();
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveSource = async (id: string) => {
    const headers = await authHeaders();
    await fetch(`/api/approved-sources?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers,
      cache: "no-store",
    });
    setMessage("Removed source from active whitelist.");
    await loadAll();
  };

  const handleArticleStatus = async (
    slug: string,
    status: "published" | "draft" | "pending_review"
  ) => {
    const headers = await authHeaders();
    await fetch(`/api/articles/${encodeURIComponent(slug)}`, {
      method: "PATCH",
      headers,
      cache: "no-store",
      body: JSON.stringify({ status }),
    });
    setMessage(`✓ Article status updated to "${status}".`);
    await loadAll();
  };

  const handleDeleteArticle = async (slug: string) => {
    const headers = await authHeaders();
    await fetch(`/api/articles/${encodeURIComponent(slug)}`, {
      method: "DELETE",
      headers,
      cache: "no-store",
    });
    setMessage("Article deleted permanently.");
    await loadAll();
  };

  const handleWipeAllArticles = async () => {
    const headers = await authHeaders();
    const res = await fetch("/api/articles?wipe=true", {
      method: "DELETE",
      headers,
      cache: "no-store",
    });
    if (res.ok) {
      setMessage("✓ Cleared all seeded/scraped articles & cached feeds cleanly.");
      await loadAll();
    }
  };

  return (
    <div className="space-y-6">
      {message && (
        <div className="rounded-2xl border border-[#C59B27]/50 bg-[#C59B27]/10 px-4 py-3 text-xs sm:text-sm font-bold">
          {message}
        </div>
      )}

      {/* 1. Approved Sikh Sources Whitelist Manager */}
      <section
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
        }}
        className="rounded-3xl border p-6 space-y-5"
      >
        <div className="space-y-1">
          <h2 className="text-xl font-serif font-bold">
            📚 Verified Sikh Educational Sources (`approved_sources`)
          </h2>
          <p
            style={{ color: "var(--theme-text-muted)" }}
            className="text-xs sm:text-sm"
          >
            Only these dedicated Sikh educational &amp; scholarly sources are
            allowed in research feeds and Studio citation presets. Generic
            mainstream news scrapers are permanently disabled.
          </p>
        </div>

        <form
          onSubmit={handleAddSource}
          style={{
            backgroundColor: "var(--theme-card-darker)",
            borderColor: "var(--border-subtle)",
          }}
          className="rounded-2xl border p-4 grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          <input
            type="text"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Source Name (e.g., Sikh Research Institute)"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
            }}
            className="rounded-xl border px-3 py-2 text-xs sm:text-sm"
          />
          <input
            type="url"
            required
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="Website URL (https://...)"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
            }}
            className="rounded-xl border px-3 py-2 text-xs sm:text-sm"
          />
          <input
            type="url"
            value={newRssUrl}
            onChange={(e) => setNewRssUrl(e.target.value)}
            placeholder="Optional RSS/Atom Feed URL (https://.../feed)"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
            }}
            className="rounded-xl border px-3 py-2 text-xs sm:text-sm"
          />
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Category (e.g., Sikh Scholarship)"
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
            }}
            className="rounded-xl border px-3 py-2 text-xs sm:text-sm"
          />
          <input
            type="text"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Short editorial description..."
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
            }}
            className="md:col-span-2 rounded-xl border px-3 py-2 text-xs sm:text-sm"
          />
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] px-5 py-2 text-xs font-extrabold text-[#18181B]"
            >
              {submitting ? "Adding…" : "+ Add Verified Sikh Source"}
            </button>
          </div>
        </form>

        {loading ? (
          <p className="text-xs opacity-75">Loading approved sources…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sources.map((src) => (
              <div
                key={src.id}
                style={{
                  backgroundColor: "var(--theme-card-darker)",
                  borderColor: "var(--border-subtle)",
                }}
                className="rounded-2xl border p-4 flex items-start justify-between gap-3"
              >
                <div className="space-y-1 min-w-0">
                  <p className="font-serif text-base font-bold">{src.name}</p>
                  <p
                    style={{
                      color: "var(--accent-text, var(--accent-primary))",
                    }}
                    className="text-xs font-semibold truncate"
                  >
                    {src.domain} • {src.category}
                  </p>
                  <p
                    style={{ color: "var(--theme-text-muted)" }}
                    className="text-xs leading-relaxed"
                  >
                    {src.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleRemoveSource(src.id)}
                  className="shrink-0 rounded-lg border border-red-500/40 px-2.5 py-1 text-[11px] font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. Articles Moderation & Clean Wipe Controls */}
      <section
        style={{
          backgroundColor: "var(--bg-surface)",
          borderColor: "var(--border-subtle)",
        }}
        className="rounded-3xl border p-6 space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-serif font-bold">
              ✎ Published, Draft &amp; Pending Articles ({articles.length})
            </h2>
            <p
              style={{ color: "var(--theme-text-muted)" }}
              className="text-xs sm:text-sm"
            >
              Approve community research submitted from <code>/studio</code> or
              reset the articles table cleanly.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/studio"
              className="rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] px-4 py-2 text-xs font-extrabold text-[#18181B]"
            >
              + Write New Article
            </Link>
            <button
              type="button"
              onClick={() => void handleWipeAllArticles()}
              className="rounded-xl border border-red-500/45 px-3.5 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10"
            >
              Truncate / Clear All Articles
            </button>
          </div>
        </div>

        {articles.length === 0 ? (
          <p
            style={{ color: "var(--theme-text-muted)" }}
            className="text-sm py-4 text-center"
          >
            Clean slate — no articles in the database yet. Open{" "}
            <Link href="/studio" className="underline font-bold">
              /studio
            </Link>{" "}
            to publish your first essay.
          </p>
        ) : (
          <div className="space-y-3">
            {articles.map((art) => (
              <div
                key={art.id}
                style={{
                  backgroundColor: "var(--theme-card-darker)",
                  borderColor: "var(--border-subtle)",
                }}
                className="rounded-2xl border p-4 flex flex-wrap items-center justify-between gap-3"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                    <span className="uppercase px-2 py-0.5 rounded-full border border-[#C59B27]/50">
                      {art.status.replace("_", " ")}
                    </span>
                    <span style={{ color: "var(--theme-text-muted)" }}>
                      Source: {art.source_name} • By {art.author_name}
                    </span>
                  </div>
                  <Link
                    href={`/articles/${encodeURIComponent(art.slug)}`}
                    className="block font-serif text-base font-bold hover:underline truncate"
                  >
                    {art.title}
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  {art.status !== "published" && (
                    <button
                      type="button"
                      onClick={() =>
                        void handleArticleStatus(art.slug, "published")
                      }
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-extrabold text-white"
                    >
                      Approve &amp; Publish
                    </button>
                  )}
                  <Link
                    href={`/studio?edit=${encodeURIComponent(art.slug)}`}
                    style={{ borderColor: "var(--border-subtle)" }}
                    className="rounded-lg border px-3 py-1.5 text-xs font-bold hover:border-[#C59B27]"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleDeleteArticle(art.slug)}
                    className="rounded-lg border border-red-500/40 px-2.5 py-1.5 text-xs font-bold text-red-600 dark:text-red-400"
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
  );
}
