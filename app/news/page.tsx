"use client";

import React, { useCallback, useEffect, useState } from "react";
import { MotionConfig, motion } from "framer-motion";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { SikhNewsBriefingDeck } from "@/components/news/sikh-news-briefing-deck";
import type { SikhiNewsItem } from "@/app/api/sikhi-news/route";

export default function SikhNewsPage() {
  const [items, setItems] = useState<SikhiNewsItem[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBriefing = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    try {
      const res = await fetch(
        forceRefresh ? "/api/sikhi-news?refresh=true" : "/api/sikhi-news",
        { cache: "no-store" }
      );
      const data = await res.json();
      if (data?.ok && Array.isArray(data.items)) {
        setItems(data.items);
        setUpdatedAt(data.updatedAt || new Date().toISOString());
      }
    } catch {
      // keep existing items on transient failure
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBriefing(false);
  }, [loadBriefing]);

  return (
    <MotionConfig reducedMotion="user">
      <div
        style={{
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
        className="min-h-screen flex flex-col relative overflow-x-clip"
      >
        <Header solid />

        {/* Subtle Ambient Radial Light Accent behind Hero */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 h-80 w-[min(92vw,58rem)] rounded-full bg-gradient-to-r from-amber-400/20 via-orange-300/15 to-amber-500/20 blur-3xl"
        />

        <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 pb-28 space-y-10">
          <motion.header
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl space-y-3"
          >
            <p
              style={{ color: "var(--accent-text, var(--accent-primary))" }}
              className="text-xs font-extrabold uppercase tracking-[0.22em]"
            >
              Explore &amp; Editorial Dispatches
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight">
              Sikh News &amp; Global Sangat Briefing
            </h1>
            <p
              style={{ color: "var(--theme-text-muted)" }}
              className="text-base sm:text-lg leading-relaxed"
            >
              Curated hourly from trusted Sikh &amp; global publications—distilled
              into scannable editorial slides with direct links to every
              original publisher.
            </p>
          </motion.header>

          <SikhNewsBriefingDeck
            items={items}
            loading={loading}
            updatedAt={updatedAt}
            surface="theme"
            keyboardActive
            onRefresh={() => void loadBriefing(true)}
          />
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}
