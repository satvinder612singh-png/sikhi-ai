"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { Footer } from "@/components/footer";
import { SIKHI_SOURCES } from "@/lib/deepseek";

export default function SourcesPage() {
  const [filter, setFilter] = useState("All");
  const categories = [
    "All",
    "Primary Scripture",
    "Canonical Exegesis",
    "Historical Text",
    "Code of Conduct",
  ];

  const filtered =
    filter === "All"
      ? SIKHI_SOURCES
      : SIKHI_SOURCES.filter((s) => s.category === filter);

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#171917] flex flex-col">
      <header className="border-b border-[#C59B27]/35 bg-[#1B2A20]/95 text-[#FAF6EE] backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-xl font-serif text-[#FAF6EE] hover:text-[#E5C158] transition">
            <BrandLogo size="sm" />
            <span>
              Learn <span className="text-[#E5C158]">Sikhi</span>
            </span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-[#F3ECE0]">
            <Link href="/" className="hover:text-[#E5C158] transition">
              Home & Logs
            </Link>
            <Link
              href="/ask"
              className="rounded-full bg-gradient-to-r from-[#C59B27] to-[#D97706] px-4 py-1.5 text-[#171917] font-semibold transition hover:brightness-105"
            >
              Ask a Question →
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D97706]">
          Explore the depths of Sikhi.
        </p>
        <h1 className="text-4xl font-serif font-bold text-[#171917] mt-1">
          Scriptural & Historical Sources
        </h1>
        <p className="text-[#4A554E] mt-2">
          Explore the primary Sikh scriptures, vaaran, and historical documents indexed by Learn Sikhi.
        </p>

        <div className="flex flex-wrap gap-2 mt-6 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                filter === cat
                  ? "bg-[#1B2A20] text-[#E5C158] border border-[#C59B27]"
                  : "bg-[#F3ECE0] text-[#171917] border border-[#C59B27]/40 hover:border-[#D97706]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((src) => (
            <div
              key={src.id}
              className="bg-[#1B2A20] text-[#FAF6EE] border border-[#C59B27]/40 hover:border-[#D97706] rounded-2xl p-6 transition duration-300 shadow-parchment flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center text-xs text-[#E5C158] mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#C59B27]/15 border border-[#C59B27]/30">
                    {src.category}
                  </span>
                  <span className="text-[#F3ECE0]/75">{src.reference}</span>
                </div>
                <h2 className="text-xl font-serif text-[#FAF6EE]">{src.title}</h2>
                {src.gurmukhi && (
                  <p lang="pa" className="font-gurmukhi text-[#E5C158] text-base mt-2">
                    {src.gurmukhi}
                  </p>
                )}
                <p className="text-[#F3ECE0]/90 text-sm mt-3 leading-relaxed">
                  {src.excerpt}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#C59B27]/25 flex justify-between items-center text-xs text-[#F3ECE0]/70">
                <span>{src.period}</span>
                <Link
                  href={`/ask?q=${encodeURIComponent(`Tell me about ${src.title}`)}`}
                  className="text-[#E5C158] hover:text-[#D97706] hover:underline font-semibold"
                >
                  Ask AI about this source →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
