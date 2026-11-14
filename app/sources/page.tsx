"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/header";
import { Footer } from "@/components/footer";
import { SIKHI_SOURCES } from "@/lib/deepseek";

const GURMUKHI_NUMERALS = ["੧", "੨", "੩", "੪", "੫", "੬", "੭", "੮"];

const INDEPENDENT_ARCHIVES = [
  {
    numeral: "੧",
    tag: "CLASSICAL GRANTHS & EXEGESIS",
    name: "Manglacharan",
    description:
      "Translations and scholarly commentary on classical Braj and Gurmukhi Sikh texts (such as Suraj Prakash, Panth Prakash, and Sarbloh Granth).",
    links: [
      { label: "Manglacharan.com ↗", url: "https://manglacharan.com" },
    ],
  },
  {
    numeral: "੨",
    tag: "SOVEREIGNTY & PHILOSOPHY",
    name: "Bunga Azadi",
    description:
      "Deep-dive discussions on Sikh sovereignty, philosophy, colonial history, and Panthic literature.",
    links: [
      {
        label: "Bunga Azadi YouTube ↗",
        url: "https://www.youtube.com/@BungaAzadi",
      },
      {
        label: "Bunga Azadi Instagram ↗",
        url: "https://www.instagram.com/bungaazadi/",
      },
    ],
  },
  {
    numeral: "੩",
    tag: "VERIFIED HISTORICAL ARCHIVES",
    name: "Never Forget 1984",
    description:
      "Verified historical archives documenting the June 1984 assault on Sri Harmandir Sahib, November 1984 pogroms, and Shaheed biographies.",
    links: [
      {
        label: "NeverForget84 (Wayback Archive) ↗",
        url: "https://web.archive.org/web/20160618115353/http://www.neverforget84.com/",
      },
      { label: "1984 Tribute ↗", url: "https://1984tribute.com/" },
      { label: "Ensaaf Documentation ↗", url: "https://ensaaf.org/" },
    ],
  },
  {
    numeral: "੪",
    tag: "KIRTAN, KATHA & POTHIS",
    name: "Gurmat Veechar",
    description:
      "Archive of Puratan Kirtan, classical Katha recordings, and downloadable Granth PDFs.",
    links: [
      {
        label: "GurmatVeechar.com ↗",
        url: "https://www.gurmatveechar.com",
      },
    ],
  },
];

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
      <Header solid />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <section>
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
                    ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] font-bold"
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
                className="bg-[#1B2A20] text-[#FAF6EE] border border-[#C59B27]/40 hover:border-[#D97706] rounded-2xl p-6 transition duration-300 shadow-sm flex flex-col justify-between"
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
                  <h2 className="text-xl font-serif font-bold text-[#FAF6EE]">
                    {src.title}
                  </h2>
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
                    href={`/ask?q=${encodeURIComponent(
                      `Explore the teachings and historical context of ${src.title}`
                    )}`}
                    className="text-[#E5C158] hover:text-[#D97706] hover:underline font-semibold"
                  >
                    Inquire into this source →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Want to Learn More? Explore Independent Sikhi Archives & Research */}
        <section className="pt-8 border-t border-[#C59B27]/30 space-y-8">
          <div className="max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#C59B27]">
              Deep-Dive Resources • Independent Scholarship
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mt-1">
              Want to Learn More? Explore Independent Sikhi Archives &amp; Research
            </h2>
            <p className="text-sm sm:text-base text-[#4A554E] mt-2 leading-relaxed">
              If you want to dive deeper into classical Sikh manuscripts, philosophy, and
              historical documentation, explore these respected resources:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {INDEPENDENT_ARCHIVES.map((item) => (
              <article
                key={item.name}
                className="rounded-2xl border border-[#C59B27]/40 bg-[#1B2A20] p-6 shadow-sm flex flex-col justify-between gap-5"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span
                      lang="pa"
                      className="h-8 w-8 rounded-lg bg-[#121C15] border border-[#C59B27]/40 font-gurmukhi text-sm font-bold text-[#C59B27] flex items-center justify-center"
                    >
                      {item.numeral}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C59B27]">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-bold">{item.name}</h3>
                  <p className="text-sm text-[#4A554E] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#C59B27]/25 flex flex-wrap gap-2">
                  {item.links.map((lnk) => (
                    <a
                      key={lnk.url}
                      href={lnk.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-[#121C15] border border-[#C59B27]/40 text-xs font-bold text-[#C59B27] hover:border-[#C59B27] transition"
                    >
                      {lnk.label}
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
