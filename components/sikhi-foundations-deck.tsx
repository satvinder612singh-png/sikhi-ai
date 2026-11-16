"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  COMMONS_ART,
  ChitrakariCardHeader,
  type ChitrakariVariant,
} from "@/components/chitrakari-card-header";
import {
  EditableHeritageImage,
  useCmsSiteState,
  applyCmsOrder,
  resolveCmsFontFamily,
  resolveCmsHeadingClass,
  resolveCmsBodyClass,
  resolveCmsGurmukhiClass,
  resolveCmsGridClass,
  getPageTransitionClass,
  type CmsSiteState,
} from "@/components/editable-heritage-image";
import {
  InlineTopicEditor,
  InlineOrderControls,
  InlineSectionBanner,
  type InlineTopicEditData,
} from "@/components/inline-cms-editor";
import { SikhiIcon, type SikhiIconName } from "@/components/sikhi-icons";
import {
  FIVE_KS,
  GURUS,
  PANJ_PYARE,
  SAHIBZAADE,
  MATA_GUJRI,
  SHAHEEDS,
  FIXED_EVENTS,
  MOVEABLE_NOTES,
  getNanakshahiDate,
  daysUntil,
  type NSDate,
} from "@/lib/sikhi-foundations-data";

const NUMERALS = ["੧", "੨", "੩", "੪", "੫", "੬", "੭", "੮", "੯", "੧੦"];

const SLIDES: { id: string; short: string; title: string; icon: SikhiIconName }[] = [
  { id: "who", short: "1. Who is a Sikh?", title: "Who is a Sikh?", icon: "ikonkar" },
  { id: "fiveks", short: "2. The 5 Ks", title: "The 5 Ks (Panj Kakaar)", icon: "khanda" },
  { id: "gurus", short: "3. 10 Gurus", title: "The 10 Guru Sahibs & the Eternal Guru", icon: "scroll" },
  { id: "pyare", short: "4. Panj Pyare", title: "The Panj Pyare (Five Beloved)", icon: "dhaal" },
  { id: "sahibzaade", short: "5. Sahibzaade", title: "The Chaar Sahibzaade", icon: "lotus-dome" },
  { id: "shaheeds", short: "6. Shaheeds", title: "Iconic Shaheeds of the Panth", icon: "khanda" },
  { id: "today", short: "7. Today in Sikhi", title: "What's Today in Sikhi?", icon: "rabab" },
];

const card: React.CSSProperties = {
  backgroundColor: "var(--bg-surface)",
  borderColor: "var(--border-subtle)",
  color: "var(--text-primary)",
};
const muted: React.CSSProperties = { color: "var(--theme-text-muted)" };

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C59B27]">
      {children}
    </span>
  );
}

/* --------------------- BANNER ARTWORK (NO PORTRAIT CROP) ------------------ */
function SlideBannerArtwork({
  artKey,
  title,
}: {
  artKey: string;
  variant: ChitrakariVariant;
  title: string;
}) {
  const commons = COMMONS_ART[artKey];
  const src = commons
    ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(commons.file)}?width=1200`
    : "";

  return (
    <div className="space-y-1.5">
      <EditableHeritageImage
        imageKey={`foundations-slide-${artKey}`}
        legacyKeys={[artKey, `chitrakari-${artKey}`, `foundations-card-${artKey}`]}
        defaultSrc={src}
        alt={commons?.caption || title}
        defaultOrientation="natural"
        defaultFit="contain-museum"
        fallbackNode={
          <div
            className="h-52 sm:h-64 w-full rounded-xl flex items-center justify-center text-center px-4"
            style={{
              background:
                "radial-gradient(circle at 50% 35%, rgba(197,155,39,0.22), #0B1020 75%)",
              border: "2px double rgba(197,155,39,0.45)",
            }}
          >
            <span className="font-serif text-lg sm:text-xl font-bold text-[#E5C158]">
              {title}
            </span>
          </div>
        }
      />
      {commons?.caption && (
        <p className="text-[11px] font-medium opacity-75 px-1">{commons.caption}</p>
      )}
    </div>
  );
}

function FoundationCardArtwork({
  artKey,
  title,
  heightClass,
}: {
  artKey: string;
  variant: ChitrakariVariant;
  title: string;
  heightClass: string;
  compact?: boolean;
}) {
  const commons = COMMONS_ART[artKey];
  const src = commons
    ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(commons.file)}?width=1200`
    : "";

  return (
    <EditableHeritageImage
      imageKey={`foundations-card-${artKey}`}
      legacyKeys={[artKey, `chitrakari-${artKey}`, `foundations-slide-${artKey}`]}
      defaultSrc={src}
      alt={title}
      defaultOrientation="natural"
      defaultFit="contain-museum"
      fallbackNode={
        <div
          className={`w-full rounded-xl flex items-center justify-center text-center px-3 ${heightClass}`}
          style={{
            background:
              "radial-gradient(circle at 50% 35%, rgba(197,155,39,0.2), #0B1020 75%)",
            border: "2px double rgba(197,155,39,0.4)",
          }}
        >
          <span className="font-serif text-sm font-bold text-[#E5C158]">{title}</span>
        </div>
      }
    />
  );
}

/* ----------------------- UNIFIED HISTORICAL MODAL ------------------------- */
interface FoundationModalItem {
  title: string;
  gurmukhi: string;
  subtitle: string;
  category: string;
  datesAndPlace: string;
  biography: string;
  puratanSource: string;
  puratanCitation: string;
  gurmatSignificance: string;
  artKey: string;
  artVariant: ChitrakariVariant;
}

function FoundationDetailModal({
  item,
  onClose,
}: {
  item: FoundationModalItem | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 overflow-hidden"
    >
      <div className="w-full max-w-2xl max-h-[82vh] flex flex-col rounded-2xl bg-[#FAF7F0] text-[#18181B] shadow-2xl overflow-hidden border border-[#C59B27]/50">
        {/* Sticky Top Header */}
        <div className="shrink-0 px-6 py-4 border-b border-amber-700/20 flex justify-between items-center gap-4 bg-[#FAF7F0]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-800 px-2.5 py-0.5 rounded bg-amber-100 border border-amber-600/30">
                {item.category}
              </span>
              <span className="text-xs text-zinc-600 truncate">
                {item.datesAndPlace}
              </span>
            </div>
            <p lang="pa" className="font-gurmukhi text-lg font-semibold text-amber-700">
              {item.gurmukhi}
            </p>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-zinc-900 truncate">
              {item.title}
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-amber-800">
              {item.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close historical modal"
            className="shrink-0 px-3.5 py-2 rounded-xl border border-amber-700/35 bg-white text-zinc-900 text-xs font-bold hover:border-amber-700 transition"
          >
            ✕ Close
          </button>
        </div>

        {/* Independently Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5">
          <SlideBannerArtwork
            artKey={item.artKey}
            variant={item.artVariant}
            title={item.title}
          />

          <div className="p-5 rounded-2xl bg-[#F2E9D8] border border-amber-700/25 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">
              ੧ · Historical Sakhi &amp; Biography
            </h4>
            <p className="text-sm sm:text-base leading-relaxed text-zinc-900">
              {item.biography}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F2E9D8] border border-amber-700/25 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">
              ੨ · Puratan Granth Citations ({item.puratanSource})
            </h4>
            <p className="text-sm leading-relaxed text-zinc-800">
              {item.puratanCitation}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-700/30 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-amber-900">
              ੩ · Gurmat Significance
            </h4>
            <p className="text-sm leading-relaxed text-zinc-900">
              {item.gurmatSignificance}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-amber-700/20">
            <Link
              href="/granths"
              className="text-xs font-bold text-amber-800 hover:underline"
            >
              Explore Primary Puratan Granths →
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider"
            >
              Done Reading
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------- PURATAN SCHOLARS DATA ---------------------------- */
interface PuratanScholar {
  id: string;
  name: string;
  work: string;
  era: string;
  summary: string;
  quoteGurmukhi: string;
  quoteTranslation: string;
  context: string;
}

const PURATAN_SCHOLARS: PuratanScholar[] = [
  {
    id: "bhai-gurdas",
    name: "Bhai Gurdas Ji",
    work: "Vaaran (Vaar 1, 12 & 24)",
    era: "Late 16th – Early 17th Century",
    summary:
      "First scribe of the Adi Granth (1604) who defined Sikhi through humility, Sadh Sangat, and living in the Guru's Shabad.",
    quoteGurmukhi: "ਗੁਰ ਸਿਖੁ ਮਿਤ੍ਰੁ ਪੁਤ੍ਰੁ ਭਾਈ ॥ ਗੁਰਮਤਿ ਸਬਦੁ ਸਚੁ ਕਮਾਈ ॥",
    quoteTranslation:
      "A Gursikh is one who walks in Gurmat, earning truth by living the Guru's Shabad in Sangat.",
    context:
      "Bhai Gurdas Ji's Vaaran serve as the earliest systematic commentary ('Kunji' or Key) to Sri Guru Granth Sahib Ji, framing Sikh identity around inner transformation, seva, and loving devotion.",
  },
  {
    id: "bhai-nand-lal",
    name: "Bhai Nand Lal Ji Goya",
    work: "Ganjnama & Rehatnama",
    era: "Late 17th Century (Anandpur Sahib)",
    summary:
      "Court poet of Guru Gobind Singh Ji who recorded the Guru's direct spiritual counsel on daily Sikh discipline and remembrance.",
    quoteGurmukhi: "ਸੋ ਸਿਖੁ ਸਖਾ ਬੰਧਪੁ ਹੈ ਭਾਈ ਜਿ ਗੁਰ ਕੇ ਭਾਣੇ ਵਿਚਿ ਆਵੈ ॥",
    quoteTranslation:
      "He alone is a Sikh, friend, and kin who aligns his life with the Guru's Will and daily Naam.",
    context:
      "Written in the presence of the Tenth Master, Bhai Nand Lal Ji's works unite deep Persian-Gurmukhi mysticism with the practical discipline of Amrit Vela, Katha, and selfless conduct.",
  },
  {
    id: "kavi-sainapati",
    name: "Kavi Sainapati",
    work: "Sri Gur Sobha (1701–1711)",
    era: "Early 18th Century",
    summary:
      "Eyewitness chronicler of Guru Gobind Singh Ji's Darbar who documented the Vaisakhi 1699 Khalsa transformation.",
    quoteGurmukhi: "ਖਾਲਸਾ ਮੇਰੋ ਰੂਪ ਹੈ ਖਾਸ ॥ ਖਾਲਸੇ ਮਹਿ ਹੌ ਕਰੌ ਨਿਵਾਸ ॥",
    quoteTranslation:
      "The Khalsa is My true form; within the Guru-oriented Sangat I abide eternally.",
    context:
      "Completed shortly after 1708, Sri Gur Sobha is our earliest narrative testimony of the Panj Pyare, Khalsa sovereignty, and the passing of eternal Guruship to Sri Guru Granth Sahib Ji.",
  },
  {
    id: "rattan-singh-bhangu",
    name: "Shaheed Bhai Rattan Singh Bhangu",
    work: "Sri Gur Panth Prakash (1841)",
    era: "Early 19th Century",
    summary:
      "Grandson of Shaheed Mehtab Singh Ji, preserving oral Khalsa Misls' testimony on Sikh sovereignty and open-hearted resilience.",
    quoteGurmukhi: "ਪੰਥ ਖਾਲਸਾ ਭਯੋ ਅਕਾਲ ਕਾ ॥",
    quoteTranslation:
      "The Panth belongs to the Timeless One (Akaal Purakh), sustained by sacrifice and humility.",
    context:
      "Bhai Rattan Singh Bhangu recorded living memories from 18th-century veterans, showing how Sehajdhari helpers, Nanakpanthis, and initiated Khalsa Singhs stood together as one Panth.",
  },
  {
    id: "santokh-singh",
    name: "Mahakavi Bhai Santokh Singh Ji",
    work: "Sri Gur Pratap Suraj Granth (1843)",
    era: "Mid-19th Century (Kaithal)",
    summary:
      "Monumental poet-historian whose 12-volume Suraj Prakash chronicles the lives and philosophy of all Ten Guru Sahibs.",
    quoteGurmukhi: "ਜਗਤ ਜਲੰਦੇ ਕਉ ਗੁਰ ਨਾਨਕ ਰਾਖਿ ਲੀਓ ਪ੍ਰਭ ਆਪ ॥",
    quoteTranslation:
      "To rescue the burning world, the Divine revealed Guru Nanak's universal path of light.",
    context:
      "Revered in traditional Katha across Gurdwaras worldwide, Suraj Prakash weaves Braj Bhasha poetry with granular historical episodes from Guru Nanak Dev Ji through Banda Singh Bahadur.",
  },
  {
    id: "gian-singh",
    name: "Giani Gian Singh Ji",
    work: "Panth Prakash & Twarikh Guru Khalsa",
    era: "Late 19th Century (Nirmala Scholarship)",
    summary:
      "Chronicler of the diverse, interconnected family of Guru Nanak's house—honouring Sehajdhari, Udasi, Nirmala, and Khalsa alike.",
    quoteGurmukhi: "ਗੁਰੂ ਨਾਨਕ ਕੇ ਘਰ ਸਭ ਕੋ ਮਾਣੁ ॥ ਸਹਿਜਧਾਰੀ ਸਿੰਘ ਏਕ ਸਮਾਣੁ ॥",
    quoteTranslation:
      "In Guru Nanak's house every seeker is honoured—those progressing gradually and initiated Singhs alike.",
    context:
      "Giani Gian Singh Ji's encyclopedic histories emphasize that Sikhi is a welcoming spiritual continuum rooted in devotion to Sri Guru Granth Sahib Ji rather than narrow institutional gatekeeping.",
  },
];

/* ----------------------------- SLIDE 1 ----------------------------------- */
function SlideWho() {
  const [expandedScholarIds, setExpandedScholarIds] = useState<string[]>([]);

  const toggleScholar = (id: string) => {
    setExpandedScholarIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const pillars: {
    icon: SikhiIconName;
    name: string;
    gurmukhi: string;
    citation: string;
    pangti: string;
    translation: string;
    commentary: string;
  }[] = [
    {
      icon: "ikonkar",
      name: "Naam Japna",
      gurmukhi: "ਨਾਮ ਜਪਣਾ",
      citation: "SGGS Ang 266 (Sukhmani Sahib) • Bhai Gurdas Ji, Vaar 12",
      pangti: "ਪ੍ਰਭ ਕੈ ਸਿਮਰਨਿ ਗਰਭਿ ਨ ਬਸੈ ॥ ਪ੍ਰਭ ਕੈ ਸਿਮਰਨਿ ਦੂਖੁ ਜਮੁ ਨਸੈ ॥",
      translation:
        "In mindful remembrance of the One, one transcends fear and sorrow; inner awakening dawns.",
      commentary:
        "Not mechanical repetition, but continuous loving awareness of Ik Onkar through Amrit Vela Simran, Kirtan, and Gurbani contemplation.",
    },
    {
      icon: "dhaal",
      name: "Kirat Karni",
      gurmukhi: "ਕਿਰਤ ਕਰਨੀ",
      citation: "SGGS Ang 1245 (Sarang Ki Vaar) • Bhai Lalo Ji Sakhi",
      pangti: "ਘਾਲਿ ਖਾਇ ਕਿਛੁ ਹਥਹੁ ਦੇਇ ॥ ਨਾਨਕ ਰਾਹੁ ਪਛਾਣਹਿ ਸੇਇ ॥",
      translation:
        "One who works earnestly with their own hands and gives in charity—O Nanak, they alone recognize the true Way.",
      commentary:
        "Guru Nanak Dev Ji chose Bhai Lalo's coarse honest bread over Malik Bhago's exploited feast, sanctifying ethical labour in society.",
    },
    {
      icon: "lotus-dome",
      name: "Vand Chhakna",
      gurmukhi: "ਵੰਡ ਛਕਣਾ",
      citation: "Bhai Gurdas Ji, Vaar 12, Pauri 2 • Guru Ka Langar",
      pangti: "ਸਭੈ ਸਾਂਝੀਵਾਲ ਸਦਾਇਨਿ ਤੂੰ ਕਿਸੈ ਨ ਦਿਸਹਿ ਬਾਹਰਾ ਜੀਉ ॥",
      translation:
        "All are called equal partners in Your grace; none appears as an outsider to You (Ang 97).",
      commentary:
        "Sharing one's earnings, time (Seva), and table (Langar & Dasvandh) freely with all humanity regardless of caste, creed, or status.",
    },
  ];

  return (
    <div className="space-y-6">
      <SlideBannerArtwork
        artKey="guru-nanak"
        variant="guru"
        title="Guru Nanak Dev Ji with Bhai Mardana & Bhai Bala"
      />

      <div className="rounded-3xl border-2 p-6 sm:p-8 space-y-4" style={card}>
        <Eyebrow>Puratan Foundations • Who is a Sikh?</Eyebrow>
        <blockquote className="font-serif text-xl sm:text-2xl leading-relaxed">
          &ldquo;A Sikh (<em>Sishya</em> / Seeker-Disciple) is any human being who turns toward the
          Light of Ik Onkar revealed in the Ten Guru Sahibs and enshrined eternally in Sri Guru Granth
          Sahib Ji—growing daily through Truthful Living, Seva, and Love.&rdquo;
        </blockquote>
        <p className="text-sm leading-relaxed" style={muted}>
          Classical 17th–19th century Puratan Granths honour the full continuum of Guru Nanak&apos;s
          Sangat: from seekers taking their first steps in Gurbani (<em>Sehajdhari</em>) to those
          who embrace the Khalsa covenant of Amrit and the Panj Kakaar.
        </p>
      </div>

      {/* Enriched 3 Pillars */}
      <div className="space-y-3">
        <Eyebrow>Guru Nanak Dev Ji&apos;s Three Pillars (Gurbani &amp; Varaan Citations)</Eyebrow>
        <div className="grid gap-5 md:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.name} className="rounded-2xl border p-5 space-y-3 flex flex-col justify-between" style={card}>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3">
                  <SikhiIcon name={p.icon} size={38} />
                  <div>
                    <p lang="pa" className="font-gurmukhi text-sm font-semibold text-[#C59B27]">
                      {p.gurmukhi}
                    </p>
                    <h4 className="font-serif text-lg font-bold">{p.name}</h4>
                  </div>
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#D97706]">
                  {p.citation}
                </p>
                <p lang="pa" className="font-gurmukhi text-sm leading-relaxed text-[#C59B27] pt-1 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                  {p.pangti}
                </p>
                <p className="text-xs italic leading-relaxed" style={muted}>
                  &ldquo;{p.translation}&rdquo;
                </p>
              </div>
              <p className="text-xs leading-relaxed pt-2 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                {p.commentary}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 17th–19th Century Puratan Scholars Accordion Grid (items-start prevents sibling stretch!) */}
      <div className="space-y-3">
        <Eyebrow>17th–19th Century Puratan Scholarship • Click to Expand</Eyebrow>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 items-start">
          {PURATAN_SCHOLARS.map((sch) => {
            const isOpen = expandedScholarIds.includes(sch.id);
            return (
              <div
                key={sch.id}
                className="rounded-2xl border p-5 space-y-3 transition-all"
                style={{
                  ...card,
                  borderColor: isOpen ? "var(--accent-primary)" : "var(--border-subtle)",
                }}
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C59B27]">
                    {sch.era}
                  </span>
                  <h4 className="font-serif text-lg font-bold">{sch.name}</h4>
                  <p className="text-xs font-semibold text-[#D97706]">{sch.work}</p>
                  <p className="text-xs leading-relaxed pt-1" style={muted}>
                    {sch.summary}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleScholar(sch.id)}
                  className="w-full py-2 px-3 rounded-xl border text-xs font-bold text-[#C59B27] hover:border-[#C59B27] transition text-left flex items-center justify-between"
                  style={{ borderColor: "var(--border-subtle)" }}
                >
                  <span>{isOpen ? "Hide Puratan Perspective" : "Read Puratan Perspective"}</span>
                  <span>{isOpen ? "↑" : "↓"}</span>
                </button>

                {isOpen && (
                  <div className="pt-3 border-t space-y-2 animate-fade-in-up" style={{ borderColor: "var(--border-subtle)" }}>
                    <p lang="pa" className="font-gurmukhi text-sm leading-relaxed text-[#C59B27]">
                      {sch.quoteGurmukhi}
                    </p>
                    <p className="text-xs italic leading-relaxed">
                      &ldquo;{sch.quoteTranslation}&rdquo;
                    </p>
                    <p className="text-xs leading-relaxed pt-1" style={muted}>
                      {sch.context}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- SLIDE 2 ----------------------------------- */
function SlideFiveKs({
  onOpenModal,
  cms,
}: {
  onOpenModal: (item: FoundationModalItem) => void;
  cms: CmsSiteState;
}) {
  const orderedKs = applyCmsOrder(FIVE_KS, (item) => item.art.artKey, "foundations", cms);
  const [sel, setSel] = useState(0);
  const rawK = orderedKs[Math.min(sel, Math.max(0, orderedKs.length - 1))] || FIVE_KS[0];
  const kEdit = cms.topicEdits?.[rawK.art.artKey];
  const k = {
    ...rawK,
    name: kEdit?.title || rawK.name,
    gurmukhi: kEdit?.gurmukhi || rawK.gurmukhi,
    meaning: kEdit?.subtitle || rawK.meaning,
    symbolism: kEdit?.description || rawK.symbolism,
  };
  const layoutCfg = cms.layoutConfig || {};
  const gurmukhiCls = resolveCmsGurmukhiClass(layoutCfg.gurmukhiScale);
  const headingCls = resolveCmsHeadingClass(layoutCfg.headingScale);
  const bodyCls = resolveCmsBodyClass(layoutCfg.bodyScale);

  const openKakaarModal = (item: (typeof FIVE_KS)[number]) => {
    onOpenModal({
      title: `${item.name} — ${item.meaning}`,
      gurmukhi: item.gurmukhi,
      subtitle: "Panj Kakaar (Gift of Vaisakhi 1699)",
      category: "The 5 Ks (Panj Kakaar)",
      datesAndPlace: "Vaisakhi 1699 • Takht Sri Kesgarh Sahib, Anandpur Sahib",
      biography: item.symbolism,
      puratanSource: "Sri Gur Sobha (1701) & Bhai Nand Lal Ji Rehatnama",
      puratanCitation:
        "Kavi Sainapati in Sri Gur Sobha (Adhyay 5) and Bhai Nand Lal Ji record how Guru Gobind Singh Ji bestowed the Five Ks as the outward emblem of inner Fearlessness (Nirbhau) and Equality across all castes.",
      gurmatSignificance: `${item.name} anchors a Sikh's daily consciousness in Guru Gobind Singh Ji's discipline—uniting spiritual remembrance with moral courage and service to humanity.`,
      artKey: item.art.artKey,
      artVariant: item.art.variant,
    });
  };

  return (
    <div className="space-y-6">
      <SlideBannerArtwork artKey="fiveks-hero" variant="khanda" title="The Five Ks (Panj Kakaar)" />
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="The five Ks">
        {orderedKs.map((x, i) => {
          const ov = cms.topicEdits?.[x.art.artKey];
          return (
            <button
              key={x.id}
              role="tab"
              aria-selected={i === sel}
              type="button"
              onClick={() => setSel(i)}
              className={`rounded-xl border px-4 py-2 text-sm font-bold transition ${i === sel ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B]" : ""}`}
              style={i === sel ? undefined : { ...card, color: "var(--text-primary)" }}
            >
              <span lang="pa" className="font-gurmukhi mr-1.5">{ov?.gurmukhi || x.gurmukhi}</span>
              {ov?.title || x.name}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <article
          key={k.id}
          role="button"
          tabIndex={0}
          onClick={() => openKakaarModal(k)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openKakaarModal(k);
            }
          }}
          className="rounded-3xl border-2 p-6 space-y-4 animate-fade-in-up cursor-pointer hover:border-[#C59B27] transition-all flex flex-col justify-between"
          style={{
            ...card,
            backgroundColor: kEdit?.bgColor || layoutCfg.cardBgColor || card.backgroundColor,
            borderColor: kEdit?.borderColor || layoutCfg.accentColor || card.borderColor,
            color: kEdit?.textColor || layoutCfg.bodyTextColor || card.color,
            fontFamily: (kEdit as InlineTopicEditData | undefined)?.fontFamily
              ? resolveCmsFontFamily((kEdit as InlineTopicEditData).fontFamily)
              : undefined,
          }}
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <InlineOrderControls
                pageKey="foundations"
                itemId={rawK.art.artKey}
                allIds={orderedKs.map((x) => x.art.artKey)}
              />
              <InlineTopicEditor
                itemId={rawK.art.artKey}
                defaults={{
                  title: k.name,
                  gurmukhi: k.gurmukhi,
                  subtitle: k.meaning,
                  description: k.symbolism,
                }}
              />
            </div>
            <FoundationCardArtwork artKey={k.art.artKey} variant={k.art.variant} title={k.name} heightClass="h-32" compact />
            <div>
              <p lang="pa" className={`font-gurmukhi ${gurmukhiCls} font-bold text-[#C59B27]`}>{k.gurmukhi}</p>
              <h3 style={{ color: kEdit?.textColor || layoutCfg.headingTextColor || undefined }} className={`font-serif ${headingCls} font-bold`}>{k.name} — {k.meaning}</h3>
            </div>
            <p className={`${bodyCls} leading-relaxed`} style={muted}>{k.symbolism}</p>
          </div>
          <span className="inline-block text-xs font-bold text-[#C59B27] pt-2">
            Read Historical Sakhi &amp; Citations →
          </span>
        </article>

        <div className="rounded-3xl border-2 p-6 space-y-4" style={card}>
          <Eyebrow>All 5 Articles • Click Any Card for Sakhi</Eyebrow>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {orderedKs.map((item) => {
              const ov = cms.topicEdits?.[item.art.artKey];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    openKakaarModal({
                      ...item,
                      name: ov?.title || item.name,
                      gurmukhi: ov?.gurmukhi || item.gurmukhi,
                      meaning: ov?.subtitle || item.meaning,
                      symbolism: ov?.description || item.symbolism,
                    })
                  }
                  className="rounded-2xl border p-3.5 text-left cursor-pointer hover:border-[#C59B27] transition-all space-y-1"
                  style={{
                    backgroundColor: ov?.bgColor || layoutCfg.cardBgColor || undefined,
                    borderColor: ov?.borderColor || "var(--border-subtle)",
                    color: ov?.textColor || undefined,
                  }}
                >
                  <p lang="pa" className="font-gurmukhi text-sm font-bold text-[#C59B27]">{ov?.gurmukhi || item.gurmukhi}</p>
                  <p className="font-serif text-base font-bold">{ov?.title || item.name}</p>
                  <p className="text-[11px] font-bold text-[#D97706]">Read Historical Sakhi &amp; Citations →</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- SLIDE 3 ----------------------------------- */
function SlideGurus({ onOpenModal }: { onOpenModal: (item: FoundationModalItem) => void }) {
  const [sel, setSel] = useState(0);
  const g = GURUS[sel];

  const openGuruModal = (guru: (typeof GURUS)[number]) => {
    onOpenModal({
      title: guru.name,
      gurmukhi: guru.gurmukhi,
      subtitle: `Guru ${guru.n} of 10 • Guruship: ${guru.guruship}`,
      category: "The 10 Guru Sahibs",
      datesAndPlace: `${guru.life} • ${guru.place}`,
      biography: guru.contribution,
      puratanSource: "Sri Gur Pratap Suraj Granth (1843) & Twarikh Guru Khalsa",
      puratanCitation: `Mahakavi Bhai Santokh Singh Ji (Suraj Prakash) and Giani Gian Singh Ji document ${guru.name}'s divine Jot (Light) continuing unbroken from Guru Nanak Dev Ji, establishing institutions of Langar, Sangat, and fearless righteousness in ${guru.place}.`,
      gurmatSignificance: `${guru.name} nurtured the spiritual and temporal sovereignty of the Panth—illuminating how devotion to Ik Onkar and compassionate action walk together.`,
      artKey: guru.art.artKey,
      artVariant: guru.art.variant,
    });
  };

  const openSggsModal = () => {
    onOpenModal({
      title: "Sri Guru Granth Sahib Ji",
      gurmukhi: "ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ",
      subtitle: "The Eternal Living Guru (1,430 Angs • 31 Classical Raags)",
      category: "Shabad Guru",
      datesAndPlace: "1604 First Prakash (Amritsar) • 1708 Eternal Guruship (Nanded)",
      biography:
        "Compiled as the Adi Granth by Guru Arjan Dev Ji in 1604 with Bhai Gurdas Ji as scribe and Baba Buddha Ji as first Granthi. In 1708 at Hazoor Sahib, Guru Gobind Singh Ji added Guru Tegh Bahadur Ji's Bani and bowed before Sri Guru Granth Sahib Ji as the eternal living Guru of the Sikhs.",
      puratanSource: "Sri Gur Sobha (1701–1711) & Panth Prakash (1841)",
      puratanCitation:
        "Kavi Sainapati (Sri Gur Sobha, Adhyay 18) records Guru Gobind Singh Ji's final command: 'Shabad Guru'—the Khalsa shall seek guidance eternally in the Shabad of Sri Guru Granth Sahib Ji.",
      gurmatSignificance:
        "Containing 1,430 Angs arranged across 31 classical Raags, it unites the Bani of 6 Guru Sahibs, 15 Bhagats, 11 Bhatts, and 4 Gursikhs into one universal message of Divine Oneness.",
      artKey: "sggs-eternal",
      artVariant: "manuscript",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Ten Gurus timeline">
        {GURUS.map((x, i) => (
          <button
            key={x.n}
            role="tab"
            aria-selected={i === sel}
            aria-label={x.name}
            type="button"
            onClick={() => setSel(i)}
            className={`h-11 min-w-11 shrink-0 rounded-full border-2 px-3 font-gurmukhi text-base font-bold transition ${i === sel ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B]" : ""}`}
            style={i === sel ? undefined : { ...card }}
          >
            {NUMERALS[i]}
          </button>
        ))}
      </div>

      <div key={g.n} className="grid gap-6 lg:grid-cols-5 animate-fade-in-up">
        <div className="lg:col-span-2">
          <FoundationCardArtwork artKey={g.art.artKey} variant={g.art.variant} title={g.name} heightClass="h-64 lg:h-full min-h-64" />
        </div>
        <article
          role="button"
          tabIndex={0}
          onClick={() => openGuruModal(g)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openGuruModal(g);
            }
          }}
          className="lg:col-span-3 rounded-3xl border-2 p-6 sm:p-8 space-y-3 cursor-pointer hover:border-[#C59B27] transition-all"
          style={card}
        >
          <Eyebrow>Guru {g.n} of 10 • {g.life}</Eyebrow>
          <p lang="pa" className="font-gurmukhi text-xl font-semibold text-[#C59B27]">{g.gurmukhi}</p>
          <h3 className="font-serif text-3xl font-bold">{g.name}</h3>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div className="rounded-xl border p-3" style={{ borderColor: "var(--border-subtle)" }}>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-[#C59B27]">Guruship</dt>
              <dd>{g.guruship}</dd>
            </div>
            <div className="rounded-xl border p-3" style={{ borderColor: "var(--border-subtle)" }}>
              <dt className="text-[11px] font-bold uppercase tracking-wider text-[#C59B27]">Place</dt>
              <dd>{g.place}</dd>
            </div>
          </dl>
          <p className="text-base leading-relaxed">{g.contribution}</p>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-xs font-bold text-[#C59B27]">
              Read Historical Sakhi &amp; Citations →
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={sel === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  setSel(sel - 1);
                }}
                className="rounded-xl border px-4 py-2 text-xs font-bold disabled:opacity-40"
                style={card}
              >
                ← Previous Guru
              </button>
              <button
                type="button"
                disabled={sel === GURUS.length - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  setSel(sel + 1);
                }}
                className="rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] px-4 py-2 text-xs font-bold disabled:opacity-40"
              >
                Next Guru →
              </button>
            </div>
          </div>
        </article>
      </div>

      <article
        role="button"
        tabIndex={0}
        onClick={openSggsModal}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openSggsModal();
          }
        }}
        className="grid gap-5 rounded-3xl border-2 p-6 md:grid-cols-5 cursor-pointer hover:border-[#C59B27] transition-all"
        style={card}
      >
        <div className="md:col-span-2">
          <FoundationCardArtwork artKey="sggs-eternal" variant="manuscript" title="Sri Guru Granth Sahib Ji" heightClass="h-40" compact />
        </div>
        <div className="md:col-span-3 space-y-2">
          <Eyebrow>The Eternal Guru</Eyebrow>
          <p lang="pa" className="font-gurmukhi text-xl font-semibold text-[#C59B27]">ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ</p>
          <h3 className="font-serif text-2xl font-bold">Sri Guru Granth Sahib Ji</h3>
          <p className="text-sm leading-relaxed" style={muted}>
            First installed at Sri Harmandir Sahib in 1604 under Guru Arjan Dev Ji, with Baba Buddha Ji as the first
            Granthi. In 1708 Guru Gobind Singh Ji declared it the eternal Guru of the Sikhs.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <span className="text-xs font-bold text-[#C59B27]">
              Read Historical Sakhi &amp; Citations →
            </span>
            <Link
              href="/nitnem"
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-bold text-[#D97706] underline"
            >
              Open Nitnem Reader →
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}

/* ----------------------------- SLIDE 4 ----------------------------------- */
function SlidePyare({
  onOpenModal,
  cms,
}: {
  onOpenModal: (item: FoundationModalItem) => void;
  cms: CmsSiteState;
}) {
  const orderedPyare = applyCmsOrder(PANJ_PYARE, (p) => p.art.artKey, "foundations", cms);
  const layoutCfg = cms.layoutConfig || {};
  const openPyareModal = (p: (typeof PANJ_PYARE)[number]) => {
    onOpenModal({
      title: p.name,
      gurmukhi: p.gurmukhi,
      subtitle: `One of the Panj Pyare • From ${p.from}`,
      category: "Panj Pyare (Vaisakhi 1699)",
      datesAndPlace: "Vaisakhi, 1699 • Takht Sri Kesgarh Sahib, Anandpur Sahib",
      biography: p.note,
      puratanSource: "Sri Gur Sobha (1701) & Sri Gur Panth Prakash (1841)",
      puratanCitation: `Kavi Sainapati (Sri Gur Sobha) and Bhai Rattan Singh Bhangu chronicle how ${p.name} rose without hesitation when Guru Gobind Singh Ji called for a head at Anandpur Sahib, uniting diverse regions and castes into one Khalsa brotherhood.`,
      gurmatSignificance:
        "After initiating the Panj Pyare with Khande-ki-Pahul, Guru Gobind Singh Ji knelt before them to receive Amrit himself—establishing democratic Panthic authority (Guru Khalsa Panth).",
      artKey: p.art.artKey,
      artVariant: p.art.variant,
    });
  };

  return (
    <div className="space-y-6">
      <SlideBannerArtwork
        artKey="panj-pyare"
        variant="khanda"
        title="Founding of the Khalsa & the Panj Pyare, Anandpur 1699"
      />
      <div className="rounded-3xl border-2 p-6 sm:p-8 space-y-3" style={card}>
        <Eyebrow>Vaisakhi 1699 • Sri Anandpur Sahib</Eyebrow>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold">&ldquo;Who will offer his head?&rdquo;</h3>
        <p className="text-base leading-relaxed" style={muted}>
          At the Vaisakhi gathering, Guru Gobind Singh Ji called for a Sikh willing to give his head. Five came forward
          one by one, from different regions and backgrounds. The Guru prepared Amrit with a Khanda, with Mata Jito Ji
          adding sweet crystals (patasha), and initiated the Panj Pyare before bowing to receive Amrit from them.
        </p>
      </div>
      <div className={resolveCmsGridClass(layoutCfg.feedLayout)}>
        {orderedPyare.map((rawP) => {
          const ov = cms.topicEdits?.[rawP.art.artKey];
          const p = {
            ...rawP,
            name: ov?.title || rawP.name,
            gurmukhi: ov?.gurmukhi || rawP.gurmukhi,
            from: ov?.subtitle || rawP.from,
            note: ov?.description || rawP.note,
          };
          return (
            <article
              key={p.art.artKey}
              role="button"
              tabIndex={0}
              onClick={() => openPyareModal(p)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openPyareModal(p);
                }
              }}
              className="space-y-3 rounded-2xl border p-4 cursor-pointer hover:border-[#C59B27] transition-all flex flex-col justify-between"
              style={{
                ...card,
                backgroundColor: ov?.bgColor || layoutCfg.cardBgColor || card.backgroundColor,
                borderColor: ov?.borderColor || layoutCfg.accentColor || card.borderColor,
                color: ov?.textColor || layoutCfg.bodyTextColor || card.color,
                fontFamily: (ov as InlineTopicEditData | undefined)?.fontFamily
                  ? resolveCmsFontFamily((ov as InlineTopicEditData).fontFamily)
                  : undefined,
              }}
            >
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <InlineOrderControls
                    pageKey="foundations"
                    itemId={p.art.artKey}
                    allIds={orderedPyare.map((x) => x.art.artKey)}
                  />
                  <InlineTopicEditor
                    itemId={p.art.artKey}
                    defaults={{
                      title: p.name,
                      gurmukhi: p.gurmukhi,
                      subtitle: p.from,
                      description: p.note,
                    }}
                  />
                </div>
                <FoundationCardArtwork artKey={p.art.artKey} variant={p.art.variant} title={p.name} heightClass="h-32" compact />
                <p lang="pa" className={`font-gurmukhi ${resolveCmsGurmukhiClass(layoutCfg.gurmukhiScale)} font-semibold text-[#C59B27]`}>{p.gurmukhi}</p>
                <h4 style={{ color: ov?.textColor || layoutCfg.headingTextColor || undefined }} className={`font-serif ${resolveCmsHeadingClass(ov?.fontScale || layoutCfg.headingScale)} font-bold`}>{p.name}</h4>
                <p className="text-xs font-bold uppercase tracking-wider text-[#C59B27]">{p.from}</p>
                <p className={resolveCmsBodyClass(ov?.fontScale || layoutCfg.bodyScale)} style={muted}>{p.note}</p>
              </div>
              <span className="inline-block text-xs font-bold text-[#C59B27] pt-2">
                Read Historical Sakhi &amp; Citations →
              </span>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------------- SLIDE 5 ----------------------------------- */
function SlideSahibzaade({
  onOpenModal,
  cms,
}: {
  onOpenModal: (item: FoundationModalItem) => void;
  cms: CmsSiteState;
}) {
  const orderedSahibzaade = applyCmsOrder(SAHIBZAADE, (s) => s.art.artKey, "foundations", cms);
  const layoutCfg = cms.layoutConfig || {};
  const openSahibzaadaModal = (s: (typeof SAHIBZAADE)[number]) => {
    onOpenModal({
      title: s.name,
      gurmukhi: s.gurmukhi,
      subtitle: `${s.age} • ${s.place}`,
      category: "Chaar Sahibzaade",
      datesAndPlace: `December 1704 (Poh) • ${s.place}`,
      biography: s.note,
      puratanSource: "Sri Gur Pratap Suraj Granth (1843) & Sri Gur Panth Prakash (1841)",
      puratanCitation: `Mahakavi Bhai Santokh Singh Ji (Suraj Prakash) and Bhai Rattan Singh Bhangu recount how ${s.name} stood fearless in December 1704—declaring that a son of Guru Gobind Singh Ji never trades Sikhi for worldly life.`,
      gurmatSignificance:
        "The martyrdom of the Chaar Sahibzaade at ages 18, 14, 9, and 6 remains the pinnacle of youthful steadfastness (Sidq) and refusal to submit to tyranny.",
      artKey: s.art.artKey,
      artVariant: s.art.variant,
    });
  };

  const openMataGujriModal = () => {
    onOpenModal({
      title: MATA_GUJRI.name,
      gurmukhi: MATA_GUJRI.gurmukhi,
      subtitle: "Mother of Guru Gobind Singh Ji & Grandmother of the Sahibzaade",
      category: "Matriarch & Shaheed",
      datesAndPlace: "December 1704 • Thanda Burj, Fatehgarh Sahib (Sirhind)",
      biography: MATA_GUJRI.note,
      puratanSource: "Sri Gur Pratap Suraj Granth & Twarikh Guru Khalsa",
      puratanCitation:
        "Puratan chroniclers describe Mata Gujri Ji preparing Baba Zorawar Singh Ji and Baba Fateh Singh Ji each morning inside the freezing Thanda Burj with Sakhis of Guru Arjan Dev Ji and Guru Tegh Bahadur Ji before ascending into Akaal Purakh's presence upon hearing of their Shaheedi.",
      gurmatSignificance:
        "Mata Gujri Ji embodied quiet maternal resolve, transmitting unbroken courage across three generations of Shaheedi.",
      artKey: MATA_GUJRI.art.artKey,
      artVariant: MATA_GUJRI.art.variant,
    });
  };

  return (
    <div className="space-y-6">
      <SlideBannerArtwork artKey="sahibzaade-hero" variant="anandpur" title="The Chaar Sahibzaade" />
      <div className="rounded-3xl border-2 p-6 sm:p-8" style={card}>
        <Eyebrow>Chamkaur Sahib &amp; Sirhind • December 1704</Eyebrow>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold mt-1">Four princes, one unshaken faith</h3>
        <p className="mt-2 text-base leading-relaxed" style={muted}>
          The two elder Sahibzaade fell in battle at Chamkaur Sahib. The two younger Sahibzaade, with their grandmother
          Mata Gujri Ji, were imprisoned in the freezing Thanda Burj at Sirhind where they refused to give up their faith.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {orderedSahibzaade.map((rawS) => {
          const ov = cms.topicEdits?.[rawS.art.artKey];
          const s = {
            ...rawS,
            name: ov?.title || rawS.name,
            gurmukhi: ov?.gurmukhi || rawS.gurmukhi,
            note: ov?.description || rawS.note,
          };
          return (
            <article
              key={s.art.artKey}
              role="button"
              tabIndex={0}
              onClick={() => openSahibzaadaModal(s)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openSahibzaadaModal(s);
                }
              }}
              className="space-y-3 rounded-2xl border p-4 cursor-pointer hover:border-[#C59B27] transition-all flex flex-col justify-between"
              style={{
                ...card,
                backgroundColor: ov?.bgColor || layoutCfg.cardBgColor || card.backgroundColor,
                borderColor: ov?.borderColor || layoutCfg.accentColor || card.borderColor,
                color: ov?.textColor || layoutCfg.bodyTextColor || card.color,
                fontFamily: (ov as InlineTopicEditData | undefined)?.fontFamily
                  ? resolveCmsFontFamily((ov as InlineTopicEditData).fontFamily)
                  : undefined,
              }}
            >
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <InlineOrderControls
                    pageKey="foundations"
                    itemId={s.art.artKey}
                    allIds={orderedSahibzaade.map((x) => x.art.artKey)}
                  />
                  <InlineTopicEditor
                    itemId={s.art.artKey}
                    defaults={{
                      title: s.name,
                      gurmukhi: s.gurmukhi,
                      subtitle: `${s.age} • ${s.place}`,
                      description: s.note,
                    }}
                  />
                </div>
                <FoundationCardArtwork artKey={s.art.artKey} variant={s.art.variant} title={s.name} heightClass="h-36" compact />
                <p lang="pa" className={`font-gurmukhi ${resolveCmsGurmukhiClass(layoutCfg.gurmukhiScale)} font-semibold text-[#C59B27]`}>{s.gurmukhi}</p>
                <h4 style={{ color: ov?.textColor || layoutCfg.headingTextColor || undefined }} className={`font-serif ${resolveCmsHeadingClass(ov?.fontScale || layoutCfg.headingScale)} font-bold`}>{s.name}</h4>
                <p className="text-xs font-bold uppercase tracking-wider text-[#C59B27]">{ov?.subtitle || `${s.age} • ${s.place}`}</p>
                <p className={resolveCmsBodyClass(ov?.fontScale || layoutCfg.bodyScale)} style={muted}>{s.note}</p>
              </div>
              <span className="inline-block text-xs font-bold text-[#C59B27] pt-2">
                Read Historical Sakhi &amp; Citations →
              </span>
            </article>
          );
        })}
      </div>
      <article
        role="button"
        tabIndex={0}
        onClick={openMataGujriModal}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openMataGujriModal();
          }
        }}
        className="grid gap-5 rounded-2xl border-2 p-5 md:grid-cols-5 cursor-pointer hover:border-[#C59B27] transition-all"
        style={card}
      >
        <div className="md:col-span-2">
          <FoundationCardArtwork artKey={MATA_GUJRI.art.artKey} variant={MATA_GUJRI.art.variant} title={MATA_GUJRI.name} heightClass="h-40" compact />
        </div>
        <div className="md:col-span-3 space-y-2">
          <p lang="pa" className="font-gurmukhi text-sm font-semibold text-[#C59B27]">{MATA_GUJRI.gurmukhi}</p>
          <h4 className="font-serif text-xl font-bold">{MATA_GUJRI.name}</h4>
          <p className="text-sm leading-relaxed" style={muted}>{MATA_GUJRI.note}</p>
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <span className="text-xs font-bold text-[#C59B27]">
              Read Historical Sakhi &amp; Citations →
            </span>
            <Link
              href="/matriarchs"
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-bold text-[#D97706] underline"
            >
              More Sikh women →
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}

/* ----------------------------- SLIDE 6 ----------------------------------- */
function SlideShaheeds({
  onOpenModal,
  cms,
}: {
  onOpenModal: (item: FoundationModalItem) => void;
  cms: CmsSiteState;
}) {
  const orderedShaheeds = applyCmsOrder(SHAHEEDS, (s) => s.art.artKey, "foundations", cms);
  const layoutCfg = cms.layoutConfig || {};
  const openShaheedModal = (s: (typeof SHAHEEDS)[number]) => {
    onOpenModal({
      title: s.name,
      gurmukhi: s.gurmukhi,
      subtitle: `Shaheed of the Panth • ${s.year}`,
      category: "Iconic Shaheeds",
      datesAndPlace: `Shaheedi Year: ${s.year}`,
      biography: s.note,
      puratanSource: "Sri Gur Pratap Suraj Granth & Sri Gur Panth Prakash",
      puratanCitation: `Mahakavi Bhai Santokh Singh Ji (Suraj Prakash) and Bhai Rattan Singh Bhangu (Panth Prakash) preserve ${s.name}'s supreme sacrifice—embracing torture and death in unwavering Naam Simran rather than surrendering conscience.`,
      gurmatSignificance:
        "In Sikhi, Shaheedi is not defeat; it is the fearless witness of Truth ('Maran Na Moolo') that kept freedom of conscience alive across South Asia.",
      artKey: s.art.artKey,
      artVariant: s.art.variant,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Martyrs of the Panth • Click Any Card</Eyebrow>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold mt-1">They chose conscience over comfort</h3>
      </div>
      <div className={resolveCmsGridClass(layoutCfg.feedLayout)}>
        {orderedShaheeds.map((rawS) => {
          const ov = cms.topicEdits?.[rawS.art.artKey];
          const s = {
            ...rawS,
            name: ov?.title || rawS.name,
            gurmukhi: ov?.gurmukhi || rawS.gurmukhi,
            year: ov?.subtitle || rawS.year,
            note: ov?.description || rawS.note,
          };
          return (
            <article
              key={s.art.artKey}
              role="button"
              tabIndex={0}
              onClick={() => openShaheedModal(s)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openShaheedModal(s);
                }
              }}
              className="space-y-3 rounded-2xl border p-4 cursor-pointer hover:border-[#C59B27] transition-all flex flex-col justify-between"
              style={{
                ...card,
                backgroundColor: ov?.bgColor || layoutCfg.cardBgColor || card.backgroundColor,
                borderColor: ov?.borderColor || layoutCfg.accentColor || card.borderColor,
                color: ov?.textColor || layoutCfg.bodyTextColor || card.color,
                fontFamily: (ov as InlineTopicEditData | undefined)?.fontFamily
                  ? resolveCmsFontFamily((ov as InlineTopicEditData).fontFamily)
                  : undefined,
              }}
            >
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <InlineOrderControls
                    pageKey="foundations"
                    itemId={s.art.artKey}
                    allIds={orderedShaheeds.map((x) => x.art.artKey)}
                  />
                  <InlineTopicEditor
                    itemId={s.art.artKey}
                    defaults={{
                      title: s.name,
                      gurmukhi: s.gurmukhi,
                      subtitle: s.year,
                      description: s.note,
                    }}
                  />
                </div>
                <FoundationCardArtwork artKey={s.art.artKey} variant={s.art.variant} title={s.name} heightClass="h-36" compact />
                <p lang="pa" className={`font-gurmukhi ${resolveCmsGurmukhiClass(layoutCfg.gurmukhiScale)} font-semibold text-[#C59B27]`}>{s.gurmukhi}</p>
                <h4 style={{ color: ov?.textColor || layoutCfg.headingTextColor || undefined }} className={`font-serif ${resolveCmsHeadingClass(ov?.fontScale || layoutCfg.headingScale)} font-bold`}>{s.name}</h4>
                <p className="text-xs font-bold uppercase tracking-wider text-[#C59B27]">{s.year}</p>
                <p className={resolveCmsBodyClass(ov?.fontScale || layoutCfg.bodyScale)} style={muted}>{s.note}</p>
              </div>
              <span className="inline-block text-xs font-bold text-[#C59B27] pt-2">
                Read Historical Sakhi &amp; Citations →
              </span>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------------- SLIDE 7 ----------------------------------- */
function SlideToday() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  if (!now) return <div className="h-64 animate-pulse rounded-3xl border" style={card} />;

  const ns: NSDate = getNanakshahiDate(now);
  const greg = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now);
  const upcoming = FIXED_EVENTS.map((e) => ({ e, d: daysUntil(e, now) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3);
  const todays = upcoming.filter((u) => u.d === 0);

  return (
    <div className="space-y-6">
      <SlideBannerArtwork artKey="darbar-sahib" variant="darbar" title="Sri Harmandir Sahib, Amritsar" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border-2 p-6 sm:p-8 space-y-3" style={card}>
          <Eyebrow>Live Nanakshahi date</Eyebrow>
          <p lang="pa" className="font-gurmukhi text-3xl font-bold text-[#C59B27]">
            {ns.month.gurmukhi} {ns.day}
          </p>
          <h3 className="font-serif text-4xl font-bold">{ns.month.name} {ns.day}, {ns.nsYear} NS</h3>
          <p className="text-sm" style={muted}>{greg}</p>
          <div className="rounded-2xl border p-3 text-sm" style={{ borderColor: "var(--border-subtle)" }}>
            <span className="font-bold text-[#C59B27]">Season (Ritu): </span>
            <span lang="pa" className="font-gurmukhi">{ns.month.seasonGurmukhi}</span> · {ns.month.season}
          </div>
          {ns.day === 1 && (
            <div className="rounded-2xl border-2 p-3 text-sm font-semibold" style={{ borderColor: "var(--accent-primary)" }}>
              Today is Sangrand, the first day of {ns.month.name}. Gurdwaras read the month&apos;s Baarah Maha verses.
            </div>
          )}
          {todays.map(({ e }) => (
            <div key={e.title} className="rounded-2xl border-2 p-3 text-sm font-semibold" style={{ borderColor: "var(--vivid-crimson, #F43F5E)" }}>
              Today: {e.title}
            </div>
          ))}
        </div>
        <div className="rounded-3xl border-2 p-6 space-y-3" style={card}>
          <Eyebrow>Coming up</Eyebrow>
          {upcoming.map(({ e, d }) => (
            <div key={e.title} className="rounded-2xl border p-3" style={{ borderColor: "var(--border-subtle)" }}>
              <p className="text-xs font-bold uppercase tracking-wider text-[#C59B27]">
                {d === 0 ? "Today" : d === 1 ? "Tomorrow" : `In ${d} days`} · {NS_NAME(e.monthIndex)} {e.day}
              </p>
              <p className="font-serif text-lg font-bold">{e.title}</p>
              <p className="text-sm" style={muted}>{e.detail}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-3xl border p-5 space-y-2" style={card}>
        <Eyebrow>Lunar-calendar observances</Eyebrow>
        <ul className="grid gap-2 md:grid-cols-3">
          {MOVEABLE_NOTES.map((m) => (
            <li key={m.title} className="rounded-xl border p-3 text-sm" style={{ borderColor: "var(--border-subtle)" }}>
              <p className="font-bold">{m.title}</p>
              <p style={muted}>{m.detail}</p>
            </li>
          ))}
        </ul>
        <p className="text-xs" style={muted}>
          Dates above use the original Nanakshahi calendar structure (Chet 1 = 14 March). Many Gurdwaras observe
          Gurpurabs by the lunar calendar, so confirm with SGPC or your local Gurdwara.
        </p>
      </div>
    </div>
  );
}

function NS_NAME(i: number) {
  return ["Chet", "Vaisakh", "Jeth", "Harh", "Sawan", "Bhadon", "Assu", "Katak", "Maghar", "Poh", "Magh", "Phagun"][i];
}

/* ------------------------------- DECK ------------------------------------ */
export function SikhiFoundationsDeck({ headingLevel = 2 }: { headingLevel?: 1 | 2 }) {
  const cms = useCmsSiteState();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [modalItem, setModalItem] = useState<FoundationModalItem | null>(null);
  const startX = useRef<number | null>(null);
  const Heading = headingLevel === 1 ? "h1" : "h2";

  const go = (i: number) => {
    const next = Math.max(0, Math.min(SLIDES.length - 1, i));
    if (next === index) return;
    setDir(next > index ? 1 : -1);
    setIndex(next);
  };

  const body = (() => {
    switch (SLIDES[index].id) {
      case "who": return <SlideWho />;
      case "fiveks": return <SlideFiveKs onOpenModal={setModalItem} cms={cms} />;
      case "gurus": return <SlideGurus onOpenModal={setModalItem} />;
      case "pyare": return <SlidePyare onOpenModal={setModalItem} cms={cms} />;
      case "sahibzaade": return <SlideSahibzaade onOpenModal={setModalItem} cms={cms} />;
      case "shaheeds": return <SlideShaheeds onOpenModal={setModalItem} cms={cms} />;
      default: return <SlideToday />;
    }
  })();

  const layoutCfg = cms.layoutConfig || {};
  const deckSec = (
    cms as unknown as {
      sectionLayoutMap?: Record<
        string,
        {
          titleAlign?: "left" | "center" | "right";
          widthMode?: "full" | "contained" | "compact";
          customTitle?: string;
          customSubtitle?: string;
          hidden?: boolean;
        }
      >;
    }
  ).sectionLayoutMap?.["foundations-deck"];
  const deckAlignCls =
    deckSec?.titleAlign === "center"
      ? "text-center mx-auto"
      : deckSec?.titleAlign === "right"
        ? "text-right ml-auto"
        : "text-left";
  const deckWidthCls =
    deckSec?.widthMode === "compact"
      ? "max-w-3xl mx-auto"
      : deckSec?.widthMode === "contained"
        ? "max-w-5xl mx-auto"
        : "";
  const customFoundations = applyCmsOrder(
    cms.customTopics?.foundations || [],
    (t) => t.id,
    "foundations",
    cms
  );

  if (deckSec?.hidden) {
    return null;
  }

  const deckInline = cms.topicEdits?.["foundations-deck-header"] as
    | InlineTopicEditData
    | undefined;

  return (
    <section
      aria-label="Foundations of Sikhi interactive slide deck"
      tabIndex={0}
      onKeyDown={(e) => {
        if (modalItem) return;
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
      style={{
        fontFamily: deckInline?.fontFamily
          ? resolveCmsFontFamily(deckInline.fontFamily)
          : resolveCmsFontFamily(layoutCfg.fontFamily),
        backgroundColor: deckInline?.bgColor || layoutCfg.pageBgColor || undefined,
        color: deckInline?.textColor || layoutCfg.bodyTextColor || undefined,
      }}
      className={`space-y-6 outline-none rounded-3xl ${getPageTransitionClass(layoutCfg.pageTransition)} ${deckWidthCls}`}
    >
      <InlineSectionBanner
        sectionId="foundations-deck"
        pageKey="foundations"
        defaultTitle="Who is a Sikh? & Foundations of Sikhi"
      />
      <div className={`space-y-2 ${deckAlignCls}`}>
        <div className="flex flex-wrap items-center gap-2">
          <Eyebrow>{deckInline?.badge || "Sikhi 101 • Start here"}</Eyebrow>
          <InlineTopicEditor
            itemId="foundations-deck-header"
            defaults={{
              title: deckSec?.customTitle || "Who is a Sikh? & Foundations of Sikhi",
              badge: "Sikhi 101 • Start here",
              description:
                deckSec?.customSubtitle ||
                "Seven short slides, each with a painting, to understand the heart of Sikhi. Swipe, tap or use the arrow keys.",
            }}
          />
        </div>
        <Heading
          style={{
            color: deckInline?.textColor || layoutCfg.headingTextColor || undefined,
          }}
          className="font-serif text-3xl sm:text-5xl font-bold tracking-tight"
        >
          {deckInline?.title ||
            deckSec?.customTitle ||
            "Who is a Sikh? & Foundations of Sikhi"}
        </Heading>
        <p className={`max-w-3xl text-base ${deckSec?.titleAlign === "center" ? "mx-auto" : ""}`} style={muted}>
          {deckInline?.description ||
            deckSec?.customSubtitle ||
            "Seven short slides, each with a painting, to understand the heart of Sikhi. Swipe, tap or use the arrow keys."}
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Foundations slides">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={i === index}
            type="button"
            onClick={() => go(i)}
            className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl border px-3.5 py-2 text-sm font-bold transition ${i === index ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B]" : ""}`}
            style={i === index ? undefined : { ...card }}
          >
            <SikhiIcon name={s.icon} size={22} />
            {s.short}
          </button>
        ))}
      </div>

      <div
        className="touch-pan-y"
        onPointerDown={(e) => { startX.current = e.clientX; }}
        onPointerUp={(e) => {
          if (startX.current === null) return;
          const dx = e.clientX - startX.current;
          startX.current = null;
          if (Math.abs(dx) > 70) go(dx < 0 ? index + 1 : index - 1);
        }}
      >
        <div key={SLIDES[index].id} className={dir > 0 ? "slide-from-right" : "slide-from-left"}>
          {body}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button type="button" disabled={index === 0} onClick={() => go(index - 1)} className="rounded-xl border px-5 py-2.5 text-sm font-bold disabled:opacity-40" style={card}>
          ← Previous
        </button>
        <div className="flex items-center gap-2" aria-hidden="true">
          {SLIDES.map((s, i) => (
            <span key={s.id} className="h-2 rounded-full" style={{ width: i === index ? 28 : 8, background: i === index ? "var(--accent-primary)" : "var(--border-subtle)", transition: "width 300ms cubic-bezier(0.22,1,0.36,1)" }} />
          ))}
        </div>
        <button type="button" disabled={index === SLIDES.length - 1} onClick={() => go(index + 1)} className="rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] px-5 py-2.5 text-sm font-bold disabled:opacity-40">
          Next →
        </button>
      </div>

      {customFoundations.length > 0 && (
        <div className="space-y-4 pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
          <Eyebrow>Admin Curated Additions</Eyebrow>
          <div className={resolveCmsGridClass(layoutCfg.feedLayout)}>
            {customFoundations.map((ct) => {
              const customIds = customFoundations.map((x) => x.id);
              const ov = cms.topicEdits?.[ct.id] as InlineTopicEditData | undefined;
              return (
                <article
                  key={ct.id}
                  style={{
                    ...card,
                    backgroundColor: ov?.bgColor || ct.bgColor || layoutCfg.cardBgColor || card.backgroundColor,
                    borderColor: ov?.borderColor || ct.borderColor || layoutCfg.accentColor || card.borderColor,
                    color: ov?.textColor || ct.textColor || layoutCfg.bodyTextColor || card.color,
                    fontFamily: ov?.fontFamily
                      ? resolveCmsFontFamily(ov.fontFamily)
                      : undefined,
                  }}
                  className="rounded-2xl border p-4 space-y-2.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <InlineOrderControls
                      pageKey="foundations"
                      itemId={ct.id}
                      allIds={customIds}
                    />
                    <InlineTopicEditor
                      itemId={ct.id}
                      defaults={{
                        title: ct.title,
                        gurmukhi: ct.gurmukhi,
                        subtitle: ct.subtitle,
                        badge: ct.badge,
                        description: ct.description,
                      }}
                    />
                  </div>
                  {Boolean(cms.frames?.[ct.imageKey || ct.id]?.src) && (
                    <EditableHeritageImage
                      imageKey={ct.imageKey || ct.id}
                      defaultSrc=""
                      alt={ov?.title || ct.title}
                      defaultOrientation="natural"
                    />
                  )}
                  {(ov?.gurmukhi || ct.gurmukhi) && (
                    <p lang="pa" className={`font-gurmukhi ${resolveCmsGurmukhiClass(layoutCfg.gurmukhiScale)} font-semibold text-[#C59B27]`}>
                      {ov?.gurmukhi || ct.gurmukhi}
                    </p>
                  )}
                  <h4
                    style={{ color: ov?.textColor || ct.textColor || layoutCfg.headingTextColor || undefined }}
                    className={`font-serif ${resolveCmsHeadingClass(ov?.fontScale || ct.fontScale || layoutCfg.headingScale)} font-bold`}
                  >
                    {ov?.title || ct.title}
                  </h4>
                  {(ov?.subtitle || ct.subtitle) && (
                    <p className="text-xs font-bold uppercase tracking-wider text-[#C59B27]">
                      {ov?.subtitle || ct.subtitle}
                    </p>
                  )}
                  <p className={resolveCmsBodyClass(ov?.fontScale || ct.fontScale || layoutCfg.bodyScale)} style={muted}>
                    {ov?.description || ct.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      )}

      <FoundationDetailModal item={modalItem} onClose={() => setModalItem(null)} />
    </section>
  );
}

export default SikhiFoundationsDeck;
