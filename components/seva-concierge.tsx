"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  useKirtanAudio,
  PURATAN_KIRTAN_TRACKS,
} from "@/components/kirtan-audio-context";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type IntentRouteItem = {
  id: string;
  pillLabel: string;
  keywords: string[];
  headline: string;
  gurmukhiPangti: string;
  pangtiTranslation: string;
  angCitation: string;
  guidance: string;
  primaryHref: string;
  primaryCta: string;
  secondaryHref?: string;
  secondaryCta?: string;
  kirtanTrackId?: string;
};

export const INTENT_ROUTES: IntentRouteItem[] = [
  {
    id: "new-to-sikhi",
    pillLabel: "I'm new to Sikhi",
    keywords: [
      "new",
      "beginner",
      "start",
      "what is sikhi",
      "who are sikhs",
      "mool mantar",
      "ik onkar",
      "basics",
    ],
    headline: "Welcome to the Sanctuary — Begin with Ik Onkar & Mool Mantar",
    gurmukhiPangti: "ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ",
    pangtiTranslation:
      "There is One Universal Creator, Eternal Truth is the Name, without fear, without enmity.",
    angCitation: "Sri Guru Granth Sahib Ji • Ang 1",
    guidance:
      "Sikhi is a path of direct love for the One Divine (Ik Onkar), honest living (Kirat Karni), remembrance (Naam Japna), and sharing with all humanity (Vand Chhakna). Start with the interactive 9-slide Mool Mantar explorer or ask any question.",
    primaryHref: "/#mool-mantar",
    primaryCta: "Explore Mool Mantar Word-by-Word →",
    secondaryHref: "/ask",
    secondaryCta: "Ask a Question in Scriptural Inquiry →",
  },
  {
    id: "need-peace",
    pillLabel: "I need peace / going through a hard time",
    keywords: [
      "peace",
      "anxious",
      "anxiety",
      "sad",
      "grief",
      "hard time",
      "stress",
      "fear",
      "worried",
      "healing",
      "comfort",
      "dukhi",
    ],
    headline: "Gurbani Solace for the Heart — You Are Protected",
    gurmukhiPangti: "ਤਾਤੀ ਵਾਉ ਨ ਲਗਈ ਪਾਰਬ੍ਰਹਮ ਸਰਣਾਈ ॥ ਚਉਗਿਰਦ ਹਮਾਰੈ ਰਾਮ ਕਾਰ ਦੁਖੁ ਲਗੈ ਨ ਭਾਈ ॥",
    pangtiTranslation:
      "Not even a hot wind touches the one who rests in the Sanctuary of the Supreme Divine; all around us is the protective circle of the Lord—no sorrow can afflict you, O sibling.",
    angCitation: "Sri Guru Granth Sahib Ji • Ang 819 (Raag Bilaaval)",
    guidance:
      "When the mind feels overwhelmed, Guru Arjan Dev Ji invites us into Sukhmani Sahib (The Psalm of Peace) and the protective shelter of Raag Bilaaval Kirtan.",
    primaryHref: "/nitnem",
    primaryCta: "Read Sukhmani Sahib & Soothing Banis →",
    secondaryHref: "/hukamnama",
    secondaryCta: "Read Today's Darbar Sahib Hukamnama →",
    kirtanTrackId: "raag-bilaaval-gurmej-singh",
  },
  {
    id: "listen-kirtan",
    pillLabel: "Listen to Puratan Kirtan",
    keywords: [
      "kirtan",
      "audio",
      "music",
      "raag",
      "rabab",
      "taus",
      "listen",
      "avtar singh",
      "gurmej singh",
      "sujan singh",
    ],
    headline: "Puratan Raag Darbar & Tanti Saaj Audio Sanctuary",
    gurmukhiPangti: "ਕਲਜੁਗ ਮਹਿ ਕੀਰਤਨੁ ਪਰਧਾਨਾ ॥ ਗੁਰਮੁਖਿ ਜਪੀਐ ਲਾਇ ਧਿਆਨਾ ॥",
    pangtiTranslation:
      "In this age, singing the Divine Praises (Kirtan) is supreme; as Gurmukh, meditate with focused love.",
    angCitation: "Sri Guru Granth Sahib Ji • Ang 1075",
    guidance:
      "Listen to authentic Puratan Kirtan across Raag Asa, Raag Bilaaval, Raag Tukhari, and Raag Kalyan. Our persistent bottom mini-player lets you keep listening as you browse.",
    primaryHref: "/granths",
    primaryCta: "Open Puratan Raag Darbar →",
    kirtanTrackId: "raag-asa-avtar-singh",
  },
  {
    id: "read-nitnem",
    pillLabel: "Read Nitnem / Hukamnama",
    keywords: [
      "nitnem",
      "hukamnama",
      "japji",
      "rehras",
      "sohila",
      "chaupai",
      "anand sahib",
      "sukhmani",
      "daily",
      "mukhwak",
    ],
    headline: "Daily Sri Darbar Sahib Hukamnama & Complete Nitnem Reader",
    gurmukhiPangti: "ਅੰਮ੍ਰਿਤ ਵੇਲਾ ਸਚੁ ਨਾਉ ਵਡਿਆਈ ਵੀਚਾਰੁ ॥",
    pangtiTranslation:
      "In the ambrosial hours before dawn, chant the True Name and contemplate Divine Glorious Virtues.",
    angCitation: "Sri Guru Granth Sahib Ji • Ang 2 (Japji Sahib, Pauri 4)",
    guidance:
      "Read today's live Hukamnama from Sri Harmandir Sahib, Amritsar, or open the distraction-free Nitnem & Sukhmani Sahib reader with Larivaar/Padchhed toggles and adjustable font sizes.",
    primaryHref: "/nitnem",
    primaryCta: "Open Nitnem & Sukhmani Sahib Reader →",
    secondaryHref: "/hukamnama",
    secondaryCta: "Read Today's Live Hukamnama →",
  },
  {
    id: "unsung-women",
    pillLabel: "Explore Unsung Sikh Women",
    keywords: [
      "women",
      "matriarchs",
      "kaur",
      "mai bhago",
      "mata khivi",
      "bebe nanaki",
      "mata gujri",
      "sharan kaur",
      "jind kaur",
      "sada kaur",
      "gulab kaur",
    ],
    headline: "The Unsung Matriarchs & Warriors of the Panth",
    gurmukhiPangti: "ਸੋ ਕਿਉ ਮੰਦਾ ਆਖੀਐ ਜਿਤੁ ਜੰਮਹਿ ਰਾਜਾਨ ॥",
    pangtiTranslation: "Why call her inferior, from whom sovereigns are born?",
    angCitation: "Sri Guru Granth Sahib Ji • Ang 473",
    guidance:
      "Explore 13 foundational Sikh women—from Bebe Nanaki Ji and Mata Khivi Ji to Bibi Sharan Kaur Pabla, Mai Bhago Ji, Rani Sada Kaur, Maharani Jind Kaur, and Bibi Gulab Kaur.",
    primaryHref: "/matriarchs",
    primaryCta: "Explore All 13 Matriarchs & Warriors →",
  },
  {
    id: "granth-pdfs",
    pillLabel: "Read Historical Granth PDFs",
    keywords: [
      "granth",
      "pdf",
      "teeka",
      "darpan",
      "sahib singh",
      "panth prakash",
      "suraj prakash",
      "mahan kosh",
      "bhai gurdas",
      "nand lal",
    ],
    headline: "Historical Granths, Steeks & Gurmat Veechar PDF Library",
    gurmukhiPangti: "ਪੋਥੀ ਪਰਮੇਸਰ ਕਾ ਥਾਨੁ ॥ ਸਾਧਸੰਗਿ ਗਾਵਹਿ ਗੁਣ ਗੋਬਿੰਦ ਪੂਰਨ ਬ੍ਰਹਮ ਗਿਆਨੁ ॥",
    pangtiTranslation:
      "The Sacred Volume is the Dwelling of the Supreme Divine; in the Sangat, singing the Glorious Virtues of Gobind brings perfect spiritual wisdom.",
    angCitation: "Sri Guru Granth Sahib Ji • Ang 1226",
    guidance:
      "Study Prof. Sahib Singh's 10-volume Sri Guru Granth Sahib Darpan, Sri Gur Panth Prakash, Suraj Prakash, Bhai Gurdas Ji Vaaran, and Mahan Kosh with our inline document reader.",
    primaryHref: "/granths",
    primaryCta: "Open Granth & PDF Library →",
  },
  {
    id: "sikhi-games",
    pillLabel: "Play Sikhi Games",
    keywords: [
      "game",
      "games",
      "play",
      "abhiyaas",
      "larivaar",
      "chess",
      "shatranj",
      "hola mahalla",
      "kids",
      "children",
      "painti",
    ],
    headline: "Interactive Abhiyaas Games & 50-Coin Knowledge Treasury",
    gurmukhiPangti: "ਗੁਰਮੁਖਿ ਗਾਵੈ ਗੁਰਮੁਖਿ ਬੂਝੈ ॥",
    pangtiTranslation:
      "The Gurmukh sings the Word, and the Gurmukh understands its deepest meaning.",
    angCitation: "Sri Guru Granth Sahib Ji • Ang 942",
    guidance:
      "Practice Larivaar word-splitting, command Khalsa warriors in Sikh Shatranj (Dhai Phat), sprint in Hola Mahalla Ghurdaur, or learn the 35 Gurmukhi Painti Akhar letters.",
    primaryHref: "/games",
    primaryCta: "Enter Interactive Abhiyaas Games Hub →",
  },
];

type SupportRequestRecord = {
  id: string;
  topicCategory: string;
  details: string;
  contact: string;
  createdAt: string;
};

const REQUESTS_STORAGE_KEY = "learn_sikhi_seva_requests_v1";

const TOPIC_CATEGORIES = [
  "Gurbani & Santhiya",
  "Historical Granth / PDF Request",
  "Puratan Kirtan / Raag Audio",
  "Sikh History & Matriarchs",
  "Personal Sangat Support / Ardas",
];

function ConciergeCore({ compact = false }: { compact?: boolean }) {
  const [mode, setMode] = useState<"intent" | "form">("intent");
  const [selectedIntentId, setSelectedIntentId] = useState<string>("new-to-sikhi");
  const [searchInput, setSearchInput] = useState("");

  // 3-Step Form State
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [topicCategory, setTopicCategory] = useState<string>(TOPIC_CATEGORIES[0]);
  const [details, setDetails] = useState("");
  const [contact, setContact] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<SupportRequestRecord | null>(
    null
  );
  const [savedRequests, setSavedRequests] = useState<SupportRequestRecord[]>([]);

  const { playTrack, isPlaying, currentTrack } = useKirtanAudio();

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(REQUESTS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SupportRequestRecord[];
        if (Array.isArray(parsed)) setSavedRequests(parsed);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const matchedIntent = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    if (!q) {
      return (
        INTENT_ROUTES.find((item) => item.id === selectedIntentId) ||
        INTENT_ROUTES[0]
      );
    }
    const found = INTENT_ROUTES.find(
      (item) =>
        item.pillLabel.toLowerCase().includes(q) ||
        item.headline.toLowerCase().includes(q) ||
        item.keywords.some((kw) => q.includes(kw) || kw.includes(q))
    );
    return (
      found ||
      INTENT_ROUTES.find((item) => item.id === selectedIntentId) ||
      INTENT_ROUTES[0]
    );
  }, [searchInput, selectedIntentId]);

  const handlePlaySuggestedKirtan = (trackId: string) => {
    const found =
      PURATAN_KIRTAN_TRACKS.find((t) => t.id === trackId) ||
      PURATAN_KIRTAN_TRACKS[0];
    playTrack(found);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;
    setSubmitting(true);

    const record: SupportRequestRecord = {
      id: `seva-${Date.now()}`,
      topicCategory,
      details: details.trim(),
      contact: contact.trim(),
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    try {
      const updated = [record, ...savedRequests].slice(0, 10);
      setSavedRequests(updated);
      window.localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Ignore localStorage quota errors
    }

    // Attempt optional Supabase sync if configured
    try {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        await supabase.from("seva_requests").insert({
          topic_category: record.topicCategory,
          details: record.details,
          contact: record.contact || null,
        });
      }
    } catch {
      // Graceful fallback when table isn't provisioned
    }

    setSubmitting(false);
    setSubmittedRecord(record);
  };

  const resetForm = () => {
    setSubmittedRecord(null);
    setDetails("");
    setContact("");
    setStep(1);
  };

  return (
    <div className="space-y-5">
      {/* Mode Switcher Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C59B27]">
            SEVA CONCIERGE &amp; SMART PATH-FINDER
          </span>
          <h3 className={`${compact ? "text-lg" : "text-2xl"} font-serif font-bold`}>
            What are you looking for today?
          </h3>
        </div>

        <div className="flex gap-1.5 p-1 rounded-xl bg-[#121C15] border border-[#C59B27]/35">
          <button
            type="button"
            onClick={() => setMode("intent")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              mode === "intent"
                ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B]"
                : "text-[#4A554E] hover:text-[#171917]"
            }`}
          >
            ੧ · Instant Path-Finder
          </button>
          <button
            type="button"
            onClick={() => setMode("form")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              mode === "form"
                ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B]"
                : "text-[#4A554E] hover:text-[#171917]"
            }`}
          >
            ੨ · Request Resource / Support
          </button>
        </div>
      </div>

      {/* ====================================================================
          MODE 1: INSTANT INTENT ROUTER
      ==================================================================== */}
      {mode === "intent" && (
        <div className="space-y-4">
          {/* Natural Language Input */}
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Type what you need (e.g. 'I need peace', 'Mai Bhago', 'Prof Sahib Singh PDF', 'Raag Asa')..."
              aria-label="What are you looking for today?"
              className="w-full rounded-xl border border-[#C59B27]/45 bg-[#121C15] px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-[#C59B27]"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#4A554E] hover:text-[#171917]"
              >
                Clear
              </button>
            )}
          </div>

          {/* 7 Quick Intent Pills */}
          <div className="flex flex-wrap gap-2">
            {INTENT_ROUTES.map((item) => {
              const active = matchedIntent.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSelectedIntentId(item.id);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                    active
                      ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] border-[#C59B27] font-bold shadow-sm"
                      : "bg-[#121C15] text-[#4A554E] border-[#C59B27]/35 hover:border-[#C59B27]"
                  }`}
                >
                  {item.pillLabel}
                </button>
              );
            })}
          </div>

          {/* Matched Guidance & Direct Sanctuary Action Card */}
          <div className="p-5 rounded-2xl bg-[#121C15] border border-[#C59B27]/40 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C59B27]">
                RECOMMENDED SANCTUARY PATH
              </span>
              <span className="text-[11px] font-semibold text-[#D97706]">
                {matchedIntent.angCitation}
              </span>
            </div>

            <h4 className="text-lg font-serif font-bold">
              {matchedIntent.headline}
            </h4>

            <div className="p-3.5 rounded-xl bg-[#1B2A20] border border-[#C59B27]/30 space-y-1">
              <p
                lang="pa"
                className="font-gurmukhi text-base sm:text-lg font-medium text-[#C59B27]"
              >
                {matchedIntent.gurmukhiPangti}
              </p>
              <p className="text-xs italic text-[#4A554E]">
                &ldquo;{matchedIntent.pangtiTranslation}&rdquo;
              </p>
            </div>

            <p className="text-xs sm:text-sm text-[#4A554E] leading-relaxed">
              {matchedIntent.guidance}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <Link
                href={matchedIntent.primaryHref}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider shadow-sm hover:brightness-105 transition"
              >
                {matchedIntent.primaryCta}
              </Link>

              {matchedIntent.secondaryHref && matchedIntent.secondaryCta && (
                <Link
                  href={matchedIntent.secondaryHref}
                  className="px-4 py-2.5 rounded-xl border border-[#C59B27]/50 bg-[#1B2A20] text-xs font-semibold hover:border-[#C59B27] transition"
                >
                  {matchedIntent.secondaryCta}
                </Link>
              )}

              {matchedIntent.kirtanTrackId && (
                <button
                  type="button"
                  onClick={() =>
                    handlePlaySuggestedKirtan(matchedIntent.kirtanTrackId!)
                  }
                  className="px-4 py-2.5 rounded-xl border border-[#C59B27] bg-[#1B2A20] text-xs font-bold text-[#C59B27] hover:brightness-95 transition"
                >
                  {isPlaying &&
                  currentTrack.id === matchedIntent.kirtanTrackId
                    ? "♫ Playing Soothing Kirtan"
                    : "▶ Play Soothing Raag Audio Now"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODE 2: 3-STEP GUIDED SUPPORT & RESOURCE REQUEST FORM
      ==================================================================== */}
      {mode === "form" && (
        <div className="p-5 rounded-2xl bg-[#121C15] border border-[#C59B27]/40 space-y-4">
          {submittedRecord ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C59B27]">
                  SEVA REQUEST LOGGED • WAHEGURU JI KA KHALSA
                </span>
                <span className="text-xs text-[#4A554E]">
                  {submittedRecord.createdAt}
                </span>
              </div>
              <h4 className="text-lg font-serif font-bold">
                Thank you — Your request has been saved to our Sangat Seva Queue
              </h4>
              <p className="text-xs sm:text-sm text-[#4A554E] leading-relaxed">
                <strong>Category:</strong> {submittedRecord.topicCategory}
                <br />
                <strong>Request:</strong> {submittedRecord.details}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href={`/ask?q=${encodeURIComponent(submittedRecord.details)}`}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider"
                >
                  Search This Topic in Scriptural Inquiry →
                </Link>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl border border-[#C59B27]/45 text-xs font-semibold"
                >
                  Submit Another Request
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Step Indicator */}
              <div className="flex items-center justify-between text-xs font-semibold border-b border-[#C59B27]/25 pb-3">
                <span className={step === 1 ? "text-[#C59B27] font-bold" : "text-[#4A554E]"}>
                  Step 1: Topic Category
                </span>
                <span>→</span>
                <span className={step === 2 ? "text-[#C59B27] font-bold" : "text-[#4A554E]"}>
                  Step 2: What You Need
                </span>
                <span>→</span>
                <span className={step === 3 ? "text-[#C59B27] font-bold" : "text-[#4A554E]"}>
                  Step 3: Optional Contact
                </span>
              </div>

              {step === 1 && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#C59B27]">
                    1. Select a Topic Category:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {TOPIC_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setTopicCategory(cat)}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold transition ${
                          topicCategory === cat
                            ? "bg-[#1B2A20] border-2 border-[#C59B27] font-bold"
                            : "bg-[#1B2A20]/60 border-[#C59B27]/30 text-[#4A554E]"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider"
                    >
                      Next: Describe Request →
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#C59B27]">
                    2. What Granth, Shabad, or support are you looking for?
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Tell us the specific Shabad, historical Granth PDF, sakhi, or Sangat support you need..."
                    className="w-full rounded-xl border border-[#C59B27]/45 bg-[#1B2A20] p-3 text-xs sm:text-sm focus:outline-none focus:border-[#C59B27]"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-3.5 py-2 rounded-xl border border-[#C59B27]/40 text-xs font-semibold"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      disabled={!details.trim()}
                      onClick={() => setStep(3)}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                    >
                      Next: Finalize →
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#C59B27]">
                    3. Optional Email or Name (so we can share the resource):
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Optional: email@example.com or your name"
                    className="w-full rounded-xl border border-[#C59B27]/45 bg-[#1B2A20] px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#C59B27]"
                  />
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-3.5 py-2 rounded-xl border border-[#C59B27]/40 text-xs font-semibold"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider shadow-sm"
                    >
                      {submitting ? "Saving..." : "Submit Seva Request ✓"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Inline homepage Path-Finder & Seva Concierge card
 */
export function SevaPathFinderInline() {
  return (
    <div className="rounded-3xl border border-[#C59B27]/40 bg-[#1B2A20] p-6 sm:p-8 shadow-sm">
      <ConciergeCore compact={false} />
    </div>
  );
}

/**
 * Floating bottom-right Seva Concierge widget rendered globally across all routes
 */
export function SevaConcierge() {
  const [open, setOpen] = useState(false);
  const { isMiniPlayerVisible } = useKirtanAudio();

  return (
    <div
      className={`fixed right-5 z-40 transition-all duration-300 ${
        isMiniPlayerVisible ? "bottom-24" : "bottom-5"
      }`}
    >
      {open ? (
        <div
          role="dialog"
          aria-label="Seva Concierge and Path-Finder"
          className="w-[92vw] max-w-lg rounded-3xl border-2 border-[#C59B27] bg-[#1B2A20] p-5 shadow-2xl backdrop-blur-md animate-fade-in-up"
        >
          <div className="flex items-center justify-between border-b border-[#C59B27]/25 pb-2.5 mb-3">
            <span
              lang="pa"
              className="font-gurmukhi text-xs font-bold text-[#C59B27]"
            >
              ੴ · ਸੇਵਾ ਮਾਰਗ-ਦਰਸ਼ਕ (Seva Concierge)
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close Seva Concierge"
              className="px-2.5 py-1 rounded-lg border border-[#C59B27]/40 text-xs font-bold hover:border-[#C59B27]"
            >
              ✕ Minimize
            </button>
          </div>
          <ConciergeCore compact={true} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open Seva Concierge — What are you looking for?"
          className="flex items-center gap-2.5 rounded-full border-2 border-[#C59B27] bg-[#1B2A20] px-4 py-3 text-xs sm:text-sm font-bold shadow-xl hover:scale-[1.02] transition"
        >
          <span
            lang="pa"
            className="h-6 w-6 rounded-full bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] font-gurmukhi text-xs font-bold flex items-center justify-center"
          >
            ੴ
          </span>
          <span>What are you looking for?</span>
        </button>
      )}
    </div>
  );
}
