"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function AskContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [question, setQuestion] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/ask");
      const data = await res.json();
      if (data && data.logs) setLogs(data.logs);
    } catch {}
  };

  const askQuestion = async (qText: string) => {
    const trimmed = qText.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });
      const data = await res.json();
      if (data && data.logs) setLogs(data.logs);

      if (!res.ok || data.error) {
        setError(data.error || data.message || "Failed to generate answer.");
        setResult(null);
      } else {
        setResult({
          answer: data.answer || data.content || "",
          paragraphs: data.paragraphs || [data.answer || ""],
          sources: data.sources || [],
          model: data.model || "gemini-3.8-flash",
          durationMs: data.durationMs || 0,
        });
      }
    } catch (err: any) {
      setError(err?.message || "Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    if (initialQuery) {
      setQuestion(initialQuery);
      askQuestion(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    router.replace("/ask?q=" + encodeURIComponent(question.trim()), { scroll: false });
    askQuestion(question);
  };

  const presets = [
    "What is the meaning of Hukam?",
    "What is the purpose of Langar?",
    "What are Miri and Piri?",
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 bg-[#070b14]/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-serif text-amber-400">
            Sikhi AI
          </Link>
          <nav className="flex items-center gap-6 text-sm text-slate-300">
            <Link href="/sources" className="hover:text-amber-400 transition">
              Sources
            </Link>
            <Link href="/" className="hover:text-amber-400 transition">
              Explore & Logs
            </Link>
            <button
              onClick={() => {
                fetchLogs();
                setShowLogs(!showLogs);
              }}
              className="px-3 py-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 text-amber-300 text-xs font-medium"
            >
              Live Logs ({logs.length})
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
            Ask Sikhi AI
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif mt-2 text-white">
            What would you like to understand?
          </h1>
          <p className="text-slate-400 mt-3 text-sm">
            Answers are grounded in Gurbani and historical texts and list the sources they rely on.
          </p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-2xl">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask about Gurbani, Sikh history, or philosophy..."
              className="flex-1 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-3.5 text-slate-100 outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-semibold px-6 py-3.5 rounded-xl transition"
            >
              {loading ? "Asking..." : "Ask"}
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-2 mt-4">
            <span className="text-xs uppercase text-slate-500 mr-1">Try:</span>
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setQuestion(p);
                  router.replace("/ask?q=" + encodeURIComponent(p), { scroll: false });
                  askQuestion(p);
                }}
                className="text-xs px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="mt-8 bg-slate-900/60 border border-slate-800 rounded-2xl p-8 animate-pulse">
            <div className="text-amber-400 text-xs uppercase tracking-widest mb-4">
              Searching Gurbani & Historical Sources...
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-800 rounded w-11/12" />
              <div className="h-4 bg-slate-800 rounded w-full" />
              <div className="h-4 bg-slate-800 rounded w-4/5" />
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="mt-8 bg-red-950/30 border border-red-500/40 rounded-2xl p-6 text-center">
            <p className="text-red-300 font-medium mb-4">{error}</p>
            <button
              onClick={() => askQuestion(question)}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && result && (
          <div className="mt-8 space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-7 shadow-xl">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
                <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
                  Gurbani & Historical Synthesis
                </span>
                <span className="text-xs text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                  {result.model} • {(result.durationMs / 1000).toFixed(2)}s
                </span>
              </div>
              <div className="space-y-4 text-slate-200 leading-relaxed">
                {result.paragraphs.map((para: string, idx: number) => (
                  <p key={idx} className="leading-7">{para}</p>
                ))}
              </div>
            </div>

            {result.sources && result.sources.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.sources.map((src: any) => (
                  <div key={src.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300">
                        {src.category}
                      </span>
                      <span className="text-xs text-slate-500">{src.reference}</span>
                    </div>
                    <h3 className="font-serif text-lg text-white">{src.title}</h3>
                    {src.gurmukhi && <p className="text-amber-300 text-sm mt-1">{src.gurmukhi}</p>}
                    <p className="text-slate-400 text-xs mt-2 leading-relaxed">{src.excerpt}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {showLogs && (
          <div className="mt-10 bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase text-amber-400">Live API Request Logs</h3>
              <button onClick={() => setShowLogs(false)} className="text-xs text-slate-400">Close</button>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {logs.map((log: any) => (
                <div key={log.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-200">{log.question}</span>
                    <span className="text-emerald-400 font-mono">HTTP {log.status} • {log.durationMs}ms</span>
                  </div>
                  <p className="text-slate-400">{log.preview}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AskPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070b14] text-slate-400 p-12 text-center">Loading...</div>}>
      <AskContent />
    </Suspense>
  );
}