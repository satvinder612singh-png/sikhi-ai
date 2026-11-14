"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DailyHukamnama } from "@/components/daily-hukamnama";

export default function HukamnamaPage() {
  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#171917] flex flex-col">
      <Header solid />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D97706]">
              Sri Harmandir Sahib (Golden Temple), Amritsar
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#171917] mt-1">
              Daily Sacred Hukamnama (Mukhwak)
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/nitnem"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#171917] text-xs font-bold uppercase tracking-wider shadow-sm hover:brightness-105 transition"
            >
              Open Nitnem &amp; Sukhmani Sahib Reader →
            </Link>
            <Link
              href="/"
              className="px-4 py-2.5 rounded-xl border border-[#C59B27]/50 bg-[#1B2A20] text-[#E5C158] text-xs font-semibold uppercase tracking-wider hover:border-[#D97706] transition"
            >
              ← Return Home
            </Link>
          </div>
        </div>

        <DailyHukamnama mode="full" />
      </main>

      <Footer />
    </div>
  );
}
