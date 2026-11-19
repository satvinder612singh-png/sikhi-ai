"use client";

import React from "react";
import Link from "next/link";
import { MotionConfig, motion } from "framer-motion";
import { Compass, ArrowRight, Newspaper, BookOpen } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function ExploreNewsPage() {
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

        <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 pb-28 space-y-10">
          <motion.header
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl space-y-3"
          >
            <p
              style={{ color: "var(--accent-text, var(--accent-primary))" }}
              className="text-xs font-extrabold uppercase tracking-[0.22em] inline-flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              Explore &amp; News
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight">
              Curated Sikh Dispatches &amp; Research
            </h1>
            <p
              style={{ color: "var(--theme-text-muted)" }}
              className="text-base sm:text-lg leading-relaxed"
            >
              A calm, distraction-free space for curated Sikh community news,
              verified dispatches, and custom scholarly sources—free of noisy
              automated scrapers.
            </p>
          </motion.header>

          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-subtle)",
            }}
            className="rounded-3xl border p-8 sm:p-12 shadow-sm space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  color: "var(--accent-text, var(--accent-primary))",
                }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              >
                <Newspaper className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                  Ready for Custom Curated Sources
                </h2>
                <p
                  style={{ color: "var(--theme-text-muted)" }}
                  className="text-sm sm:text-base leading-relaxed max-w-2xl"
                >
                  Automated third-party scrapers have been removed so this feed
                  stays fast, intentional, and trustworthy. Custom Sikh news
                  sources and editorial dispatches will appear here once wired
                  in.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Link
                href="/"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border-subtle)",
                }}
                className="group rounded-2xl border p-5 flex items-start justify-between gap-4 hover:border-amber-500/60 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    <BookOpen className="w-3.5 h-3.5" />
                    SikhStacks on Home
                  </div>
                  <h3 className="font-serif text-lg font-bold">
                    Read &amp; Write Essays on SikhStacks
                  </h3>
                  <p
                    style={{ color: "var(--theme-text-muted)" }}
                    className="text-xs sm:text-sm leading-relaxed"
                  >
                    Explore community research, philosophy, book showcases, and
                    Sikh businesses—or publish your own essay in-page.
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 shrink-0 mt-1 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </Link>

              <Link
                href="/foundations"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border-subtle)",
                }}
                className="group rounded-2xl border p-5 flex items-start justify-between gap-4 hover:border-amber-500/60 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    <Compass className="w-3.5 h-3.5" />
                    Core Study
                  </div>
                  <h3 className="font-serif text-lg font-bold">
                    Foundations of Sikhi
                  </h3>
                  <p
                    style={{ color: "var(--theme-text-muted)" }}
                    className="text-xs sm:text-sm leading-relaxed"
                  >
                    Study core Gurmat philosophy, the Ten Gurus, Sikh history,
                    and Sri Guru Granth Sahib Ji.
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 shrink-0 mt-1 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </div>
          </motion.section>
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}
