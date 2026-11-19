"use client";

import React from "react";
import Link from "next/link";
import { MotionConfig, motion } from "framer-motion";
import { ArrowRight, BookOpen, Compass } from "lucide-react";
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

        <main className="relative z-10 flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 pb-28 space-y-10">
          <motion.header
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="space-y-3"
          >
            <p
              style={{ color: "var(--accent-text)" }}
              className="text-xs font-semibold uppercase tracking-[0.18em] inline-flex items-center gap-2"
            >
              <Compass className="w-3.5 h-3.5" />
              Explore &amp; News
            </p>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">
              Curated Dispatches &amp; Community Updates
            </h1>
            <p
              style={{ color: "var(--theme-text-muted)" }}
              className="text-sm sm:text-base leading-relaxed max-w-2xl"
            >
              A calm, minimalist space reserved for future curated Sikh
              community dispatches and announcements.
            </p>
          </motion.header>

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: 0.04, ease: "easeOut" }}
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
            }}
            className="rounded-2xl border p-8 sm:p-10 space-y-6"
          >
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold tracking-tight">
                Coming Soon
              </h2>
              <p
                style={{ color: "var(--theme-text-muted)" }}
                className="text-sm sm:text-base leading-relaxed max-w-xl"
              >
                This page is intentionally kept clean and fast while we prepare
                curated community updates. In the meantime, explore essays on
                SikhStacks or browse Foundations of Sikhi.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/"
                style={{
                  backgroundColor: "var(--accent-primary)",
                  color: "var(--cta-text)",
                }}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-opacity duration-150 hover:opacity-95"
              >
                <BookOpen className="w-4 h-4" />
                Explore SikhStacks
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/foundations"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-primary)",
                }}
                className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs sm:text-sm font-semibold transition-colors duration-150 hover:border-[var(--accent-primary)]"
              >
                Foundations of Sikhi
              </Link>
            </div>
          </motion.section>
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}
