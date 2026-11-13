"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SIKHI_SOURCES } from "@/lib/deepseek";

export default function SourcesPage() {
  const [filter, setFilter] = useState("All");
  const categories = ["All", "Primary Scripture", "Canonical Exegesis", "Historical Text", "Code of Conduct"];

  const filtered =
    filter === "All"
      ? SIKHI_SOURCES
      : SIKHI_SOURCES.filter((s) => s.category === filter);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100">
      <header className="border-b border-slate-800 bg-[#070b14]/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-serif text-amber-400">
            Sikhi AI
          </Link>
          <div className="flex gap-6 text-sm text-slate-300">
            <Link href="/" className="hover:text-amber-400">Home & Logs</Link>
            <Link href="/ask" className="text-amber-400 font-medium">Ask a Question →</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-serif text-white">Scriptural & Historical Sources</h1>
        <p className="text-slate-400 mt-2">
          Explore the primary Sikh scriptures, vaaran, and historical documents indexed by Sikhi AI.
        </p>

        <div className="flex flex-wrap gap-2 mt-6 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition ${ filter === cat ? "bg-amber-400 text-slate-950" : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-amber-400/40" }`} > {cat} </button> ))} </div>  <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {filtered.map((src) => ( <div key={src.id} className="bg-slate-900/70 border border-slate-800 hover:border-amber-400/50 rounded-2xl p-6 transition duration-300" > <div className="flex justify-between items-center text-xs text-amber-400 mb-2"> <span>{src.category}</span> <span className="text-slate-400">{src.reference}</span> </div> <h2 className="text-xl font-serif text-white">{src.title}</h2> {src.gurmukhi && ( <p className="text-amber-300 text-base mt-2">{src.gurmukhi}</p> )} <p className="text-slate-300 text-sm mt-3 leading-relaxed">{src.excerpt}</p> <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500"> <span>{src.period}</span> <Link href={`/ask?q=${encodeURIComponent(`Tell me about ${src.title}`)}`}
                  className="text-amber-400 hover:underline font-medium"
                >
                  Ask AI about this source →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}