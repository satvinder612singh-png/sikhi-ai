"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [logsOpen, setLogsOpen] = useState(true);

  const loadFrontPageData = async () => {
    try {
      const res = await fetch("/api/ask");
      const data = await res.json();
      if (data && data.logs) setLogs(data.logs);
      if (data && data.sources) setSources(data.sources);
    } catch {}
  };

  useEffect(() => {
    loadFrontPageData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push("/ask?q=" + encodeURIComponent(query.trim()));
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-[#070b14]/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-serif text-amber-400">
            Sikhi AI
          </Link>
          <nav className="flex items-center gap-6 text-sm text-slate-300">
            <Link href="/sources" className="hover:text-amber-400 transition">
              Sources ({sources.length})
            </Link>
            <Link href="/ask" className="hover:text-amber-400 transition">
              Ask a Question
            </Link>
            <button
              onClick={() => {
                loadFrontPageData();
                setLogsOpen(!logsOpen);
              }}
              className="px-3.5 py-1.5 rounded-full bg-amber-400 text-slate-950 font-semibold text-xs hover:bg-amber-300 transition"
            >
              {logsOpen ? "Hide Logs" : "Open All Logs (" + logs.length + ")"}
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-14">
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-amber-400 text-sm font-medium tracking-widest uppercase mb-3">
            ੴ ਸਤਿ ਨਾਮੁ • Grounded Sikh Knowledge
          </p>
          <h1 className="text-4xl sm:text-6xl font-serif text-white leading-tight">
            Explore Sikhi with clarity and context
          </h1>
          <p className="text-slate-400 mt-4 text-base">
            Every response is synthesized from Sri Guru Granth Sahib Ji, Vaaran Bhai Gurdas, and historical Sikh chronicles.
          </p>

          <form onSubmit={handleSearch} className="mt-8 flex gap-3 max-w-2xl mx-auto">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What is the meaning of Hukam?"
              className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-5 py-4 text-slate-100 outline-none"
            />
            <button
              type="submit"
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold px-7 py-4 rounded-xl transition"
            >
              Ask
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {[
              "What is the meaning of Hukam?",
              "What is the purpose of Langar?",
              "What are Miri and Piri?",
            ].map((item) => (
              <button
                key={item}
                onClick={() => router.push("/ask?q=" + encodeURIComponent(item))}
                className="text-xs px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 hover:border-amber-400/50 text-slate-300 transition"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {logsOpen && (
          <section className="mt-14 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-amber-400">
                Live System & Search Logs ({logs.length})
              </h2>
              <button
                onClick={loadFrontPageData}
                className="text-xs px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Refresh Logs
              </button>
            </div>

            {logs.length === 0 ? (
              <p className="text-sm text-slate-400 py-3">
                No search logs recorded yet. Click any question above to run a query and view its live log!
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {logs.map((log: any) => (
                  <div
                    key={log.id}
                    onClick={() => router.push("/ask?q=" + encodeURIComponent(log.question))}
                    className="cursor-pointer p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-400/50 transition"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-white truncate">{log.question}</span>
                      <span className="text-emerald-400 font-mono">
                        {log.status} • {(log.durationMs / 1000).toFixed(2)}s
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{log.preview}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="mt-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif text-white">Authentic Sikh Sources</h2>
            <Link href="/sources" className="text-xs font-semibold uppercase text-amber-400 hover:underline">
              View All Sources →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {sources.map((src: any) => (
              <div
                key={src.id}
                className="bg-slate-900/50 border border-slate-800 hover:border-amber-400/40 rounded-2xl p-6 transition"
              >
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-300">
                  {src.category}
                </span>
                <h3 className="text-lg font-serif text-white mt-3">{src.title}</h3>
                {src.gurmukhi && <p className="text-amber-300 text-sm mt-1">{src.gurmukhi}</p>}
                <p className="text-xs text-slate-400 mt-3 leading-relaxed">{src.excerpt}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}