"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const GURMUKHI_NUMERALS = ["੧", "੨", "੩", "੪", "੫", "੬"];

function AskContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [question, setQuestion] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    answer: string;
    paragraphs: string[];
    sources: any[];
  } | null>(null);

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

      if (!res.ok || data.error) {
        setError(data.error || data.message || "Unable to retrieve synthesis at this time.");
        setResult(null);
      } else {
        setResult({
          answer: data.answer || data.content || "",
          paragraphs: data.paragraphs || [data.answer || ""],
          sources: data.sources || [],
        });
      }
    } catch (err: any) {
      setError(err?.message || "Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  return (
    <div
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
      className="min-h-screen flex flex-col"
    >
      <Header solid />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-8 space-y-2">
          <p
            style={{ color: "var(--accent-text)" }}
            className="text-xs uppercase tracking-[0.22em] font-semibold"
          >
            Khoj AI
          </p>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold">
            Khoj AI — Gurmat &amp; Classical Sources
          </h1>
          <p
            style={{ color: "var(--theme-text-muted)" }}
            className="text-sm max-w-2xl mx-auto leading-relaxed"
          >
            Ask a question grounded in Sri Guru Granth Sahib Ji, classical
            Kavis, Nirmale scholarship, and traditional Sikh historians.
          </p>
        </div>

        <div
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
          className="border rounded-2xl p-5"
        >
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask Khoj AI about Gurbani, Sikh history, or Gurmat philosophy..."
              style={{
                backgroundColor: "var(--bg-tertiary)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-primary)",
              }}
              className="flex-1 border rounded-xl px-4 py-3.5 outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: "var(--accent-primary)",
                color: "var(--cta-text)",
              }}
              className="disabled:opacity-50 font-semibold px-6 py-3.5 rounded-xl transition hover:opacity-95"
            >
              {loading ? "Consulting Sources..." : "Ask Khoj AI"}
            </button>
          </form>
        </div>

        {loading && (
          <div className="mt-8 bg-[#1B2A20] border border-[#C59B27]/40 rounded-2xl p-8 animate-pulse">
            <div className="text-[#E5C158] text-xs uppercase tracking-[0.22em] mb-4">
              Consulting Sri Guru Granth Sahib Ji &amp; Historical Archives...
            </div>
            <div className="space-y-3">
              <div className="h-4 bg-[#FAF6EE]/15 rounded w-11/12" />
              <div className="h-4 bg-[#FAF6EE]/10 rounded w-full" />
              <div className="h-4 bg-[#FAF6EE]/10 rounded w-4/5" />
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="mt-8 bg-[#1B2A20] border border-[#D97706] rounded-2xl p-6 text-center text-[#FAF6EE]">
            <p className="text-xs uppercase tracking-[0.2em] text-[#D97706] font-semibold mb-2">
              Archival Notice
            </p>
            <p className="text-[#E5C158] font-medium mb-4">{error}</p>
            <button
              onClick={() => askQuestion(question)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#171917] font-semibold text-sm"
            >
              Repeat Inquiry
            </button>
          </div>
        )}

        {!loading && result && (
          <div className="mt-8 space-y-6">
            <div className="bg-[#1B2A20] text-[#FAF6EE] border border-[#C59B27]/45 rounded-2xl p-7 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-[#C59B27]/25">
                <div className="flex items-center gap-2.5">
                  <span
                    lang="pa"
                    className="font-gurmukhi text-sm font-bold text-[#E5C158] px-2.5 py-0.5 rounded bg-[#121C15] border border-[#C59B27]/40"
                  >
                    ੴ
                  </span>
                  <span className="text-xs uppercase tracking-[0.22em] text-[#E5C158] font-semibold">
                    Gurbani &amp; Historical Synthesis
                  </span>
                </div>
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#F3ECE0]/80 bg-[#121C15] px-3 py-1 rounded border border-[#C59B27]/30">
                  PRIMARY &amp; CANONICAL RECORD
                </span>
              </div>
              <div className="space-y-4 text-[#F3ECE0] leading-relaxed">
                {result.paragraphs.map((para: string, idx: number) => (
                  <p key={idx} className="leading-7">
                    {para}
                  </p>
                ))}
              </div>
            </div>

            {result.sources && result.sources.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs uppercase tracking-[0.22em] text-[#D97706] font-semibold">
                    Referenced Scriptural &amp; Historical Folios
                  </span>
                  <span className="h-[1px] flex-1 bg-[#C59B27]/35" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.sources.map((src: any, index: number) => (
                    <div
                      key={src.id}
                      className="bg-[#F3ECE0] text-[#171917] border border-[#C59B27]/45 rounded-xl p-5 shadow-parchment"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            lang="pa"
                            className="font-gurmukhi text-xs font-bold px-2 py-0.5 rounded bg-[#1B2A20] text-[#E5C158]"
                          >
                            {GURMUKHI_NUMERALS[index] || "੧"}
                          </span>
                          <span className="text-[11px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded bg-[#1B2A20] text-[#E5C158]">
                            {src.category}
                          </span>
                        </div>
                        <span className="text-xs text-[#4A554E] font-medium">
                          {src.reference}
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-lg text-[#171917]">
                        {src.title}
                      </h3>
                      {src.gurmukhi && (
                        <p lang="pa" className="font-gurmukhi text-[#D97706] text-sm mt-1">
                          {src.gurmukhi}
                        </p>
                      )}
                      <p className="text-[#4A554E] text-xs mt-2 leading-relaxed">
                        {src.excerpt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function AskPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF6EE] text-[#4A554E] p-12 text-center">
          Loading Scriptural &amp; Historical Inquiry...
        </div>
      }
    >
      <AskContent />
    </Suspense>
  );
}
