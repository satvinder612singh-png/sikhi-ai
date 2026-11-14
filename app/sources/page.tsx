"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { Footer } from "@/components/footer";
import { SIKHI_SOURCES } from "@/lib/deepseek";

const GURMUKHI_NUMERALS = ["੧", "੨", "੩", "੪", "੫", "੬", "੭", "੮"];

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
          <Link
            href="/"
            className="flex items-center gap-3 text-xl font-serif text-[#FAF6EE] hover:text-[#E5C158] transition"
          >
            <BrandLogo size="sm" />
            <span>
              Learn <span className="text-[#E5C158]">Sikhi</span>
            </span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-[#F3ECE0]">
            <Link href="/" className="hover:text-[#E5C158] transition">
              Return to Exhibition
            </Link>
            <Link
              href="/ask"
              className="rounded-full bg-gradient-to-r from-[#C59B27] to-[#D97706] px-4 py-1.5 text-[#171917] font-semibold transition hover:brightness-105"
            >
              Scriptural Inquiry →
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-12">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#D97706]">
            Archival Concordance • Primary Works
          </span>
          <span className="h-[1px] w-16 bg-[#C59B27]/50" />
        </div>
        <h1 className="text-4xl font-serif font-bold text-[#171917] mt-1">
          Scriptural &amp; Historical Sources
        </h1>
        <p className="text-[#4A554E] mt-2 max-w-2xl">
          Explore the primary Sikh scriptures, canonical Vaaran, and historical documents
          referenced across Learn Sikhi.
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
          {filtered.map((src, idx) => (
            <div
              key={src.id}
              className="bg-[#1B2A20] text-[#FAF6EE] border border-[#C59B27]/40 hover:border-[#D97706] rounded-2xl p-6 transition duration-300 shadow-parchment flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center text-xs text-[#E5C158] mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      lang="pa"
                      className="font-gurmukhi text-sm font-bold px-2.5 py-0.5 rounded bg-[#121C15] text-[#E5C158] border border-[#C59B27]/40"
                    >
                      {GURMUKHI_NUMERALS[idx] || "੧"}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-[#C59B27]/15 border border-[#C59B27]/30 uppercase tracking-wider text-[11px] font-semibold">
                      {src.category}
                    </span>
                  </div>
                  <span className="text-[#F3ECE0]/75 font-medium">{src.reference}</span>
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
              <div className="mt-5 pt-3 border-t border-[#C59B27]/25 flex justify-between items-center text-xs text-[#F3ECE0]/70">
                <span>{src.period}</span>
                <Link
                  href={`/ask?q=${encodeURIComponent(`Explore the teachings and historical context of ${src.title}`)}`}
                  className="text-[#E5C158] hover:text-[#D97706] hover:underline font-semibold"
                >
                  Inquire into this source →
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
