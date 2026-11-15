"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  COMMONS_ART,
  ChitrakariCardHeader,
  type ChitrakariVariant,
} from "@/components/chitrakari-card-header";
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
  variant,
  title,
}: {
  artKey: string;
  variant: ChitrakariVariant;
  title: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const commons = COMMONS_ART[artKey];
  const src = commons
    ? `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(commons.file)}?width=1200`
    : null;

  if (!src || imgFailed) {
    return (
      <ChitrakariCardHeader
        artKey={artKey}
        variant={variant}
        title={title}
        heightClass="h-52 sm:h-64"
        editable
      />
    );
  }

  return (
    <div className="h-52 sm:h-64 w-full overflow-hidden rounded-2xl bg-[#111318] relative flex items-center justify-center border border-[#C59B27]/40 shadow-sm">
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-35 pointer-events-none select-none"
      />
      <img
        src={src}
        alt={title}
        onError={() => setImgFailed(true)}
        className="relative z-10 h-full w-full object-contain object-[center_20%] p-1.5"
      />
      <span className="absolute bottom-2.5 left-3 z-20 rounded-lg bg-black/70 px-2.5 py-1 text-[11px] font-medium text-[#FAF7F0] backdrop-blur-sm">
        {commons.caption || title}
      </span>
    </div>
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
function SlideFiveKs({ onOpenModal }: { onOpenModal: (item: FoundationModalItem) => void }) {
  const [sel, setSel] = useState(0);
  const k = FIVE_KS[sel];

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
        {FIVE_KS.map((x, i) => (
          <button
            key={x.id}
            role="tab"
            aria-selected={i === sel}
            type="button"
            onClick={() => setSel(i)}
            className={`rounded-xl border px-4 py-2 text-sm font-bold transition ${i === sel ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B]" : ""}`}
            style={i === sel ? undefined : { ...card, color: "var(--text-primary)" }}
          >
            <span lang="pa" className="font-gurmukhi mr-1.5">{x.gurmukhi}</span>
            {x.name}
          </button>
        ))}
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
          style={card}
        >
          <div className="space-y-4">
            <ChitrakariCardHeader artKey={k.art.artKey} variant={k.art.variant} title={k.name} heightClass="h-32" editable compact />
            <div>
              <p lang="pa" className="font-gurmukhi text-2xl font-bold text-[#C59B27]">{k.gurmukhi}</p>
              <h3 className="font-serif text-2xl font-bold">{k.name} — {k.meaning}</h3>
            </div>
            <p className="text-sm leading-relaxed" style={muted}>{k.symbolism}</p>
          </div>
          <span className="inline-block text-xs font-bold text-[#C59B27] pt-2">
            Read Historical Sakhi &amp; Citations →
          </span>
        </article>

        <div className="rounded-3xl border-2 p-6 space-y-4" style={card}>
          <Eyebrow>All 5 Articles • Click Any Card for Sakhi</Eyebrow>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {FIVE_KS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openKakaarModal(item)}
                className="rounded-2xl border p-3.5 text-left cursor-pointer hover:border-[#C59B27] transition-all space-y-1"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <p lang="pa" className="font-gurmukhi text-sm font-bold text-[#C59B27]">{item.gurmukhi}</p>
                <p className="font-serif text-base font-bold">{item.name}</p>
                <p className="text-[11px] font-bold text-[#D97706]">Read Historical Sakhi &amp; Citations →</p>
              </button>
            ))}
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
          <ChitrakariCardHeader artKey={g.art.artKey} variant={g.art.variant} title={g.name} heightClass="h-64 lg:h-full min-h-64" editable />
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
          <ChitrakariCardHeader artKey="sggs-eternal" variant="manuscript" title="Sri Guru Granth Sahib Ji" heightClass="h-40" editable compact />
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
function SlidePyare({ onOpenModal }: { onOpenModal: (item: FoundationModalItem) => void }) {
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
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PANJ_PYARE.map((p) => (
          <article
            key={p.name}
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
            style={card}
          >
            <div className="space-y-2.5">
              <ChitrakariCardHeader artKey={p.art.artKey} variant={p.art.variant} title={p.name} heightClass="h-32" editable compact />
              <p lang="pa" className="font-gurmukhi text-sm font-semibold text-[#C59B27]">{p.gurmukhi}</p>
              <h4 className="font-serif text-lg font-bold">{p.name}</h4>
              <p className="text-xs font-bold uppercase tracking-wider text-[#C59B27]">From {p.from}</p>
              <p className="text-sm" style={muted}>{p.note}</p>
            </div>
            <span className="inline-block text-xs font-bold text-[#C59B27] pt-2">
              Read Historical Sakhi &amp; Citations →
            </span>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- SLIDE 5 ----------------------------------- */
function SlideSahibzaade({ onOpenModal }: { onOpenModal: (item: FoundationModalItem) => void }) {
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
        {SAHIBZAADE.map((s) => (
          <article
            key={s.name}
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
            style={card}
          >
            <div className="space-y-2.5">
              <ChitrakariCardHeader artKey={s.art.artKey} variant={s.art.variant} title={s.name} heightClass="h-36" editable compact />
              <p lang="pa" className="font-gurmukhi text-sm font-semibold text-[#C59B27]">{s.gurmukhi}</p>
              <h4 className="font-serif text-xl font-bold">{s.name}</h4>
              <p className="text-xs font-bold uppercase tracking-wider text-[#C59B27]">{s.age} • {s.place}</p>
              <p className="text-sm" style={muted}>{s.note}</p>
            </div>
            <span className="inline-block text-xs font-bold text-[#C59B27] pt-2">
              Read Historical Sakhi &amp; Citations →
            </span>
          </article>
        ))}
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
          <ChitrakariCardHeader artKey={MATA_GUJRI.art.artKey} variant={MATA_GUJRI.art.variant} title={MATA_GUJRI.name} heightClass="h-40" editable compact />
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
function SlideShaheeds({ onOpenModal }: { onOpenModal: (item: FoundationModalItem) => void }) {
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
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SHAHEEDS.map((s) => (
          <article
            key={s.name}
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
            style={card}
          >
            <div className="space-y-2.5">
              <ChitrakariCardHeader artKey={s.art.artKey} variant={s.art.variant} title={s.name} heightClass="h-36" editable compact />
              <p lang="pa" className="font-gurmukhi text-sm font-semibold text-[#C59B27]">{s.gurmukhi}</p>
              <h4 className="font-serif text-lg font-bold">{s.name}</h4>
              <p className="text-xs font-bold uppercase tracking-wider text-[#C59B27]">{s.year}</p>
              <p className="text-sm" style={muted}>{s.note}</p>
            </div>
            <span className="inline-block text-xs font-bold text-[#C59B27] pt-2">
              Read Historical Sakhi &amp; Citations →
            </span>
          </article>
        ))}
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
      case "fiveks": return <SlideFiveKs onOpenModal={setModalItem} />;
      case "gurus": return <SlideGurus onOpenModal={setModalItem} />;
      case "pyare": return <SlidePyare onOpenModal={setModalItem} />;
      case "sahibzaade": return <SlideSahibzaade onOpenModal={setModalItem} />;
      case "shaheeds": return <SlideShaheeds onOpenModal={setModalItem} />;
      default: return <SlideToday />;
    }
  })();

  return (
    <section
      aria-label="Foundations of Sikhi interactive slide deck"
      tabIndex={0}
      onKeyDown={(e) => {
        if (modalItem) return;
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
      className="space-y-6 outline-none"
    >
      <div className="space-y-2">
        <Eyebrow>Sikhi 101 • Start here</Eyebrow>
        <Heading className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">
          Who is a Sikh? &amp; Foundations of Sikhi
        </Heading>
        <p className="max-w-3xl text-base" style={muted}>
          Seven short slides, each with a painting, to understand the heart of Sikhi. Swipe, tap or use the arrow keys.
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

      <FoundationDetailModal item={modalItem} onClose={() => setModalItem(null)} />
    </section>
  );
}

export default SikhiFoundationsDeck;
