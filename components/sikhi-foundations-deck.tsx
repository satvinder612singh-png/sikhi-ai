"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  COMMONS_ART,
  ChitrakariCardHeader,
  type ChitrakariVariant,
} from "@/components/chitrakari-card-header";
import {
  EditableHeritageImage,
  useAdminEditMode,
  useCmsSiteState,
  resolveCmsFontFamily,
  resolveCmsHeadingClass,
  resolveCmsBodyClass,
  resolveCmsGurmukhiClass,
  resolveCmsGridClass,
  resolveCmsCardLayoutClass,
  getPageTransitionClass,
  type CmsSiteState,
} from "@/components/editable-heritage-image";
import {
  InlineTopicEditor,
  InlineOrderControls,
  InlineSectionBanner,
  SlidePresentationCanvas,
  GodModeText,
  GodModeBox,
  HiddenItemBadgeBar,
  applyCmsVisibilityOrder,
  useVerifiedLiveEdit,
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
      <div
        className="w-full max-w-2xl max-h-[82vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border"
        style={{
          backgroundColor: "var(--bg-surface)",
          color: "var(--text-primary)",
          borderColor: "var(--border-subtle)",
        }}
      >
        {/* Sticky Top Header */}
        <div
          className="shrink-0 px-6 py-4 border-b flex justify-between items-center gap-4"
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span
                className="text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-0.5 rounded border"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--accent-text)",
                }}
              >
                {item.category}
              </span>
              <span className="text-xs truncate" style={muted}>
                {item.datesAndPlace}
              </span>
            </div>
            <p lang="pa" className="font-gurmukhi text-lg font-semibold text-[#C59B27]">
              {item.gurmukhi}
            </p>
            <h3 className="text-xl sm:text-2xl font-serif font-bold truncate" style={{ color: "var(--text-primary)" }}>
              {item.title}
            </h3>
            <p className="text-xs sm:text-sm font-semibold" style={{ color: "var(--accent-text)" }}>
              {item.subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close historical modal"
            className="shrink-0 px-3.5 py-2 rounded-xl border text-xs font-bold hover:border-[#C59B27] transition"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              borderColor: "var(--border-subtle)",
              color: "var(--text-primary)",
            }}
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

          <div
            className="p-5 rounded-2xl border space-y-2"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#C59B27]">
              ੧ · Historical Sakhi &amp; Biography
            </h4>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--text-primary)" }}>
              {item.biography}
            </p>
          </div>

          <div
            className="p-5 rounded-2xl border space-y-2"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#C59B27]">
              ੨ · Puratan Granth Citations ({item.puratanSource})
            </h4>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
              {item.puratanCitation}
            </p>
          </div>

          <div
            className="p-5 rounded-2xl border space-y-2"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#C59B27]">
              ੩ · Gurmat Significance
            </h4>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
              {item.gurmatSignificance}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t" style={{ borderColor: "var(--border-subtle)" }}>
            <Link
              href="/granths"
              className="text-xs font-bold hover:underline"
              style={{ color: "var(--accent-text)" }}
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
  {
    id: "tara-singh-narotam",
    name: "Pandit Tara Singh Narotam",
    work: "Sri Gur Tirath Sangrah & Gurmat Nirnaya Sagar",
    era: "19th Century (Nirmale Scholarship)",
    summary:
      "Preeminent Nirmala scholar who catalogued 508 historical Sikh shrines and authored foundational Gurbani lexicons and philosophical treatises.",
    quoteGurmukhi: "ਗੁਰਮਤਿ ਨਿਰਣੈ ਸਾਗਰੁ ॥",
    quoteTranslation:
      "The Ocean of Gurmat Discernment—illuminating Gurbani philosophy through rigorous classical scholarship.",
    context:
      "Part of the Nirmale intellectual lineage alongside Giani Gian Singh and Mahakavi Santokh Singh, Pandit Tara Singh Narotam preserved encyclopedic knowledge of Sikh theology, Sanskrit-Braj etymology, and sacred geography.",
  },
  {
    id: "bhagats-sggs",
    name: "Bhagats of Sri Guru Granth Sahib Ji",
    work: "Bhagat Bani (Kabir, Namdev, Ravidas, Farid & 11 Others)",
    era: "12th–16th Century • Enshrined in SGGS Ji",
    summary:
      "Fifteen luminous saint-poets across diverse regions and castes whose hymns Guru Arjan Dev Ji enshrined as eternal Gurbani.",
    quoteGurmukhi: "ਅਵਲਿ ਅਲਹ ਨੂਰੁ ਉਪਾਇਆ ਕੁਦਰਤਿ ਕੇ ਸਭ ਬੰਦੇ ॥ (ਅੰਗ ੧੩੪੯)",
    quoteTranslation:
      "First, the Divine created the Light; all beings are of that one Kudrat (Bhagat Kabir Ji, Ang 1349).",
    context:
      "From Bhagat Farid Ji's poignant Saloks to Bhagat Ravidas Ji's vision of Begampura (the city without sorrow), Bhagat Bani anchors Sikh universalism and spiritual equality.",
  },
  {
    id: "kahn-singh-vir-singh-sahib-singh",
    name: "Bhai Kahn Singh Nabha, Bhai Vir Singh & Prof. Sahib Singh",
    work: "Mahan Kosh (1930) • Santhiya & Gurbani Viyakaran",
    era: "19th–20th Century Sikh Historians & Exegetes",
    summary:
      "Pioneering modern Sikh encyclopedists, editors, and grammarians who bridged classical Puratan scholarship with modern textual rigor.",
    quoteGurmukhi: "ਗੁਰਬਾਣੀ ਵਿਆਕਰਣ ਤੇ ਮਹਾਨ ਕੋਸ਼ ॥",
    quoteTranslation:
      "Preserving Sikh history, lexicon, and internal Gurbani grammar for future generations.",
    context:
      "Bhai Kahn Singh Nabha's Gurshabad Ratnakar Mahan Kosh, Bhai Vir Singh's critical editions of Suraj Prakash and Panth Prakash, and Prof. Sahib Singh's 10-volume Sri Guru Granth Sahib Darpan form the bedrock of modern Sikh study.",
  },
];

/* ----------------------------- SLIDE 1 ----------------------------------- */
function SlideWho() {
  const [expandedScholarIds, setExpandedScholarIds] = useState<string[]>([]);
  const [activePillarIdx, setActivePillarIdx] = useState<number>(0);

  const toggleScholar = (id: string) => {
    setExpandedScholarIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const whoDimensions = [
    {
      badge: "੧ · Etymology & Gurbani Definition",
      title: "Sikh (ਸਿੱਖ) — The Lifelong Learner & Disciple of Truth",
      gurmukhi: "ਸੋ ਸਿਖੁ ਸਖਾ ਬੰਧਪੁ ਹੈ ਭਾਈ ਜਿ ਗੁਰ ਕੇ ਭਾਣੇ ਵਿਚਿ ਆਵੈ ॥ (ਅੰਗ ੬੦੧)",
      body:
        "Derived from the Sanskrit 'Śiṣya' (disciple/student) and Punjabi verb 'Sikhna' (to learn), a Sikh is defined in Sri Guru Granth Sahib Ji not by birth, caste, or ritual priesthood, but by an active, lifelong commitment to learning from the Shabad Guru and walking in Hukam (Divine Will).",
    },
    {
      badge: "੨ · Metaphysical Foundation",
      title: "Ik Onkar (ੴ) — Radical Oneness & Fearless Dignity",
      gurmukhi: "ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ ॥",
      body:
        "Guru Nanak Dev Ji opened Sri Guru Granth Sahib Ji with the Mool Mantar: there is One all-pervading Creator (Ik Onkar) whose light dwells equally within every being (Sabudh Meh Jot). Because the One is Nirbhau (without fear) and Nirvair (without enmity), a Sikh refuses both to intimidate anyone and to bow before tyranny.",
    },
    {
      badge: "੩ · Grihasth Marg & Sant-Sipahi",
      title: "The Householder's Path & Saint-Soldier Balance",
      gurmukhi: "ਅੰਜਨ ਮਾਹਿ ਨਿਰੰਜਨਿ ਰਹੀਐ ਜੋਗ ਜੁਗਤਿ ਇਵ ਪਾਈਐ ॥ (ਅੰਗ ੭੩੦)",
      body:
        "Sikhi rejects ascetic withdrawal into caves or forests. Instead, the Gurus taught Grihasth Marg—living purely amid family and civic duties like a lotus flower untouched by muddy water—culminating in the Sant-Sipahi (Saint-Soldier) ideal of Guru Hargobind Sahib Ji (Miri-Piri) and Guru Gobind Singh Ji's Khalsa.",
    },
    {
      badge: "੪ · Shabad Guru & Sadh Sangat",
      title: "Guided by the Eternal Living Guru in Community",
      gurmukhi: "ਬਾਣੀ ਗੁਰੂ ਗੁਰੂ ਹੈ ਬਾਣੀ ਵਿਚਿ ਬਾਣੀ ਅੰਮ੍ਰਿਤੁ ਸਾਰੇ ॥ (ਅੰਗ ੯੮੨)",
      body:
        "In 1708 at Sri Hazoor Sahib, Guru Gobind Singh Ji vested eternal Guruship in Sri Guru Granth Sahib Ji. A Sikh's spiritual growth unfolds in Sadh Sangat (the fellowship of seekers) and Pangat (sitting together as equals in Guru Ka Langar), honoring the full continuum from new learners (Sehajdhari) to initiated Amritdhari Khalsa.",
    },
  ];

  const pillars: {
    icon: SikhiIconName;
    name: string;
    gurmukhi: string;
    subtitle: string;
    citation: string;
    pangti: string;
    translation: string;
    commentary: string;
    philosophy: string;
    historicalSakhi: string;
    dailyPractice: string[];
    secondaryQuoteGurmukhi: string;
    secondaryQuoteTranslation: string;
  }[] = [
    {
      icon: "ikonkar",
      name: "Naam Japna",
      gurmukhi: "ਨਾਮ ਜਪਣਾ",
      subtitle: "Contemplative Remembrance & Inner Alignment with Ik Onkar",
      citation: "SGGS Ang 266 (Sukhmani Sahib) • Bhai Gurdas Ji, Vaar 12",
      pangti: "ਪ੍ਰਭ ਕੈ ਸਿਮਰਨਿ ਗਰਭਿ ਨ ਬਸੈ ॥ ਪ੍ਰਭ ਕੈ ਸਿਮਰਨਿ ਦੂਖੁ ਜਮੁ ਨਸੈ ॥",
      translation:
        "In mindful remembrance of the One, one transcends fear and sorrow; inner awakening dawns.",
      commentary:
        "Not mechanical repetition, but continuous loving awareness of Ik Onkar through Amrit Vela Simran, Kirtan, and Gurbani contemplation that dissolves Haumai (ego).",
      philosophy:
        "In Gurmat, 'Naam' is not merely a noun or verbal formula—it is the total creative presence, Hukam, and virtuous energy of Akal Purakh pervading the cosmos ('Naam Ke Dhare Sagale Jant'). Naam Japna cleanses the mind (Man) of the Five Thieves—Kaam (lust), Krodh (wrath), Lobh (greed), Moh (attachment), and Ahankar (pride)—awakening the innate divine virtues of Sat (truth), Santokh (contentment), Daya (compassion), Dharam (righteousness), and Dheeraj (patience).",
      historicalSakhi:
        "At Kartarpur Sahib (1521–1539), Guru Nanak Dev Ji established the daily rhythm that Bhai Gurdas Ji chronicles in Vaar 1, Pauri 38: rising during Amrit Vela (the ambrosial hours before dawn) to recite Japji Sahib, singing Asa Ki Vaar in congregation, and concluding the day's labor with Sodar Rehras and Sohila.",
      dailyPractice: [
        "Amrit Vela & Nitnem: Rising in the quiet early morning hours to reflect on the Guru's Bani (Japji Sahib, Jaap Sahib, Tav-Prasad Savaiye, Chaupai Sahib, Anand Sahib).",
        "Shabad Vichaar & Santhiya: Reading and understanding the meaning of Gurbani rather than performing ritual recitation without comprehension.",
        "Shabad Kirtan & Sadh Sangat: Singing and listening to Gurbani in the classical Raags within the fellowship of the Sangat.",
        "Swas-Giras Simran: Carrying mindful awareness of Vaheguru into every breath and ethical decision throughout the workday.",
      ],
      secondaryQuoteGurmukhi: "ਗੁਰ ਸਤਿਗੁਰ ਕਾ ਜੋ ਸਿਖੁ ਅਖਾਏ ਸੁ ਭਲਕੇ ਉਠਿ ਹਰਿ ਨਾਮੁ ਧਿਆਵੈ ॥ (ਅੰਗ ੩੦੫)",
      secondaryQuoteTranslation:
        "One who calls themselves a Sikh of the True Guru shall rise in the early morning hours and meditate on the Divine Name (Guru Ram Das Ji, SGGS Ang 305).",
    },
    {
      icon: "dhaal",
      name: "Kirat Karni",
      gurmukhi: "ਕਿਰਤ ਕਰਨੀ",
      subtitle: "Honest, Ethical Labor & Upright Civic Responsibility",
      citation: "SGGS Ang 1245 (Sarang Ki Vaar) • Bhai Lalo Ji Sakhi",
      pangti: "ਘਾਲਿ ਖਾਇ ਕਿਛੁ ਹਥਹੁ ਦੇਇ ॥ ਨਾਨਕ ਰਾਹੁ ਪਛਾਣਹਿ ਸੇਇ ॥",
      translation:
        "One who works earnestly with their own hands and gives in charity—O Nanak, they alone recognize the true Way.",
      commentary:
        "Guru Nanak Dev Ji chose Bhai Lalo's coarse honest bread over Malik Bhago's exploited feast, sanctifying ethical labour and rejecting both parasitism and exploitation.",
      philosophy:
        "Kirat Karni elevates everyday work into sacred worship. Sikhi rejects two extremes: the ascetic who begs from householders while claiming spiritual superiority, and the exploiter who amasses wealth through corruption, coercion, or deceit ('Hakam'). Honest labor performed with integrity, skill, and truthfulness keeps a person humble, self-reliant, and actively useful to society.",
      historicalSakhi:
        "At Eminabad, Guru Nanak Dev Ji declined the lavish state banquet of Malik Bhago—a corrupt official whose wealth was wrung from poor farmers—and stayed instead in the mud home of Bhai Lalo Ji, a humble carpenter. When challenged, Guru Sahib symbolically showed that Bhai Lalo's millet roti held the milk of honest sweat, whereas Malik Bhago's delicacies dripped with the blood of the oppressed. Later, in his final years at Kartarpur, Guru Nanak Dev Ji himself tilled the fields with his own hands.",
      dailyPractice: [
        "Dharam Di Kirat: Earning one's livelihood through transparent, lawful, and ethical work without cheating, bribery, or exploiting vulnerable workers.",
        "Rejection of Entitlement & Superstition: Refusing unearned privileges, caste hierarchies of labor, or fatalistic idleness.",
        "Excellence & Stewardship: Treating one's craft, studies, profession, or caregiving as a direct offering of truth before the Guru.",
        "Environmental & Social Integrity: Ensuring our economic actions respect Sarbat Da Bhala (the well-being of all creation) rather than short-term greed.",
      ],
      secondaryQuoteGurmukhi: "ਹقੁ ਪਰਾਇਆ ਨਾਨਕਾ ਉਸੁ ਸੂਅਰ ਉਸੁ ਗਾਇ ॥ ਗੁਰੁ ਪੀਰੁ ਹਾਮਾ ਤਾ ਭਰੇ ਜਾ ਮੁਰਦਾਰੁ ਨ ਖਾਇ ॥ (ਅੰਗ ੧੪੧)",
      secondaryQuoteTranslation:
        "To usurp what rightfully belongs to another, O Nanak, is like forbidden meat; the Guru stands by one only when they do not consume the proceeds of exploitation (SGGS Ang 141).",
    },
    {
      icon: "lotus-dome",
      name: "Vand Chhakna",
      gurmukhi: "ਵੰਡ ਛਕਣਾ",
      subtitle: "Generous Sharing, Dasvandh & Selfless Seva for All Humanity",
      citation: "Bhai Gurdas Ji, Vaar 12, Pauri 2 • Guru Ka Langar",
      pangti: "ਸਭੈ ਸਾਂਝੀਵਾਲ ਸਦਾਇਨਿ ਤੂੰ ਕਿਸੈ ਨ ਦਿਸਹਿ ਬਾਹਰਾ ਜੀਉ ॥",
      translation:
        "All are called equal partners in Your grace; none appears as an outsider to You (Ang 97).",
      commentary:
        "Sharing one's earnings, time (Seva), and table (Langar & Dasvandh) freely with all humanity regardless of caste, creed, gender, or status.",
      philosophy:
        "If Naam Japna aligns the inner consciousness and Kirat Karni purifies how we act in the world, Vand Chhakna is the outward flowering of Divine Love. Because everything we possess is a trust (Amanat) from the One Creator, hoarding wealth while neighbors suffer is spiritual blindness. Sharing breaks the walls of ego and transforms resources into healing for the world.",
      historicalSakhi:
        "When young Guru Nanak Dev Ji was given twenty rupees by his father Mehta Kalu Ji to conduct a 'Sacha Sauda' (True Bargain), he used the entire sum to feed and clothe starving mendicants in the forest of Chuharkana—founding the eternal institution of Guru Ka Langar. Guru Amar Das Ji expanded this with the rule 'Pehle Pangat Pachhe Sangat' (even Emperor Akbar sat on the floor in the common kitchen row before meeting the Guru), and Guru Arjan Dev Ji institutionalized Dasvandh (contributing one-tenth of one's earnings and time to the common good).",
      dailyPractice: [
        "Dasvandh (The Sacred Tenth): Dedicating at least 10% of one's honest income and time toward charitable causes, education, relief efforts, and community upkeep.",
        "Tan, Man, Dhan Seva: Serving humanity physically (Tan—cooking, cleaning, defending the weak), mentally/intellectually (Man—teaching, counseling, creating), and financially (Dhan).",
        "Guru Ka Langar: Upholding radical hospitality where every human being sits at the same level and is nourished without distinction.",
        "Sarbat Da Bhala: Active solidarity with oppressed and marginalized people everywhere, remembering Bhai Ghanaiya Ji who served water and ointment even to wounded enemy soldiers on the battlefield of Anandpur.",
      ],
      secondaryQuoteGurmukhi: "ਵਿਚਿ ਦੁਨੀਆ ਸੇਵ ਕਮਾਈਐ ॥ ਤਾ ਦਰਗਹ ਬੈਸਣੁ ਪਾਈਐ ॥ (ਅੰਗ ੨੬)",
      secondaryQuoteTranslation:
        "In the midst of this world, dedicate yourself to selfless service (Seva); thus shall you find a seat of honor in the Divine Court (Guru Nanak Dev Ji, SGGS Ang 26).",
    },
  ];

  const activePillar = pillars[activePillarIdx] || pillars[0];

  return (
    <div className="space-y-6">
      <SlideBannerArtwork
        artKey="guru-nanak"
        variant="guru"
        title="Guru Nanak Dev Ji with Bhai Mardana & Bhai Bala"
      />

      <GodModeBox id="foundations-who-intro" pageKey="foundations" label="Who is a Sikh Intro">
        <div className="rounded-3xl border border-[#d4af37]/30 p-6 sm:p-8 space-y-5 shadow-xl shadow-black/10 dark:shadow-2xl dark:shadow-black/30" style={card}>
          <div className="space-y-3">
            <GodModeText
              id="foundations-who-eyebrow"
              pageKey="foundations"
              tag="p"
              defaultText="Puratan Foundations • What is a Sikh?"
              className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#C59B27]"
            />
            <GodModeText
              id="foundations-who-quote"
              pageKey="foundations"
              tag="div"
              defaultText="“A Sikh (Śiṣya / Lifelong Seeker-Disciple) is any human being who turns toward the Light of Ik Onkar revealed through the Ten Guru Sahibs and enshrined eternally in Sri Guru Granth Sahib Ji—striving daily to unite inner contemplation (Naam), ethical labor (Kirat), and compassionate service to all creation (Vand Chhakna & Seva).”"
              className="font-serif text-xl sm:text-2xl leading-relaxed"
            />
            <GodModeText
              id="foundations-who-sub"
              pageKey="foundations"
              tag="p"
              defaultText="Classical 17th–19th century Puratan Granths and the Sikh Rehat Maryada define Sikhi both spiritually and practically: a learner who places faith in One Akal Purakh, the Ten Guru Sahibs (from Guru Nanak Dev Ji to Guru Gobind Singh Ji), and the eternal living Word of Sri Guru Granth Sahib Ji—rejecting caste hierarchies, empty ritualism, and tyranny while walking the householder's path of Sant-Sipahi (Saint-Soldier)."
              className="text-sm leading-relaxed"
              style={muted}
            />
          </div>

          {/* 4 Foundational Dimensions of Sikh Identity */}
          <div className="grid gap-4 md:grid-cols-2 pt-3 border-t" style={{ borderColor: "var(--border-subtle)" }}>
            {whoDimensions.map((dim) => (
              <div
                key={dim.title}
                className="rounded-2xl border p-4 space-y-2"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C59B27]">
                  {dim.badge}
                </span>
                <h4 className="font-serif text-base font-bold" style={{ color: "var(--text-primary)" }}>
                  {dim.title}
                </h4>
                <p lang="pa" className="font-gurmukhi text-xs leading-relaxed text-[#C59B27]">
                  {dim.gurmukhi}
                </p>
                <p className="text-xs leading-relaxed" style={muted}>
                  {dim.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </GodModeBox>

      {/* Enriched 3 Pillars + Interactive Deep-Dive Study */}
      <GodModeBox id="foundations-pillars-box" pageKey="foundations" label="Three Pillars Section">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <GodModeText
              id="foundations-pillars-eyebrow"
              pageKey="foundations"
              tag="p"
              defaultText="Guru Nanak Dev Ji's Three Golden Pillars (Naam Japna • Kirat Karni • Vand Chhakna)"
              className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#C59B27]"
            />
            <span className="text-xs font-medium" style={muted}>
              Click any pillar card below to inspect its full philosophical &amp; historical study
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-3 items-stretch">
            {pillars.map((p, idx) => {
              const isSelected = activePillarIdx === idx;
              return (
                <div
                  key={p.name}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActivePillarIdx(idx)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActivePillarIdx(idx);
                    }
                  }}
                  className="rounded-2xl border p-5 space-y-3 flex flex-col justify-between cursor-pointer transition-all"
                  style={{
                    ...card,
                    borderColor: isSelected ? "#C59B27" : "var(--border-subtle)",
                    boxShadow: isSelected ? "0 0 0 1px rgba(197, 155, 39, 0.35)" : undefined,
                  }}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <SikhiIcon name={p.icon} size={38} />
                        <div>
                          <p lang="pa" className="font-gurmukhi text-sm font-semibold text-[#C59B27]">
                            {p.gurmukhi}
                          </p>
                          <h4 className="font-serif text-lg font-bold">{p.name}</h4>
                        </div>
                      </div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border"
                        style={{
                          backgroundColor: isSelected ? "rgba(197, 155, 39, 0.16)" : "var(--bg-tertiary)",
                          borderColor: isSelected ? "#C59B27" : "var(--border-subtle)",
                          color: isSelected ? "#C59B27" : "var(--theme-text-muted)",
                        }}
                      >
                        {isSelected ? "Active Study" : `Pillar ${idx + 1}`}
                      </span>
                    </div>
                    <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                      {p.subtitle}
                    </p>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#D97706]">
                      {p.citation}
                    </p>
                    <p lang="pa" className="font-gurmukhi text-sm leading-relaxed text-[#C59B27] pt-2 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                      {p.pangti}
                    </p>
                    <p className="text-xs italic leading-relaxed" style={muted}>
                      &ldquo;{p.translation}&rdquo;
                    </p>
                  </div>
                  <div className="pt-2 border-t space-y-2" style={{ borderColor: "var(--border-subtle)" }}>
                    <p className="text-xs leading-relaxed">
                      {p.commentary}
                    </p>
                    <span className="inline-block text-[11px] font-bold text-[#C59B27]">
                      {isSelected ? "Viewing Deep Study Below ↓" : "Inspect Deep Study →"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expanded Deep-Dive Workbench for the Active Pillar */}
          <div
            className="rounded-3xl border p-6 sm:p-7 space-y-5 transition-all"
            style={{
              ...card,
              borderColor: "rgba(197, 155, 39, 0.4)",
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C59B27]">
                  In-Depth Pillar Study • Pillar {activePillarIdx + 1} of 3
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold mt-0.5">
                  <span lang="pa" className="font-gurmukhi text-[#C59B27] mr-2">
                    {activePillar.gurmukhi}
                  </span>
                  {activePillar.name} — {activePillar.subtitle}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {pillars.map((p, idx) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setActivePillarIdx(idx)}
                    className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition ${
                      activePillarIdx === idx
                        ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] border-transparent"
                        : ""
                    }`}
                    style={
                      activePillarIdx === idx
                        ? undefined
                        : {
                            backgroundColor: "var(--bg-tertiary)",
                            borderColor: "var(--border-subtle)",
                            color: "var(--text-primary)",
                          }
                    }
                  >
                    {idx + 1}. {p.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div
                className="rounded-2xl border p-5 space-y-2.5"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C59B27]">
                  ੧ · Theological &amp; Philosophical Depth (Gurmat Siddhant)
                </span>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
                  {activePillar.philosophy}
                </p>
              </div>

              <div
                className="rounded-2xl border p-5 space-y-2.5"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C59B27]">
                  ੨ · Historical Sakhi &amp; Guru-Period Institution
                </span>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
                  {activePillar.historicalSakhi}
                </p>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-12 items-stretch">
              <div
                className="lg:col-span-7 rounded-2xl border p-5 space-y-3"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C59B27]">
                  ੩ · Daily Practical Abhiyaas (How Sikhs Live {activePillar.name} Today)
                </span>
                <ul className="space-y-2 text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
                  {activePillar.dailyPractice.map((step) => (
                    <li key={step} className="flex items-start gap-2.5">
                      <span className="text-[#C59B27] font-bold mt-0.5">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className="lg:col-span-5 rounded-2xl border p-5 flex flex-col justify-between space-y-3"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C59B27]">
                    ੪ · Primary Scriptural Anchor
                  </span>
                  <p lang="pa" className="font-gurmukhi text-base leading-relaxed text-[#C59B27]">
                    {activePillar.secondaryQuoteGurmukhi}
                  </p>
                  <p className="text-xs sm:text-sm italic leading-relaxed" style={muted}>
                    &ldquo;{activePillar.secondaryQuoteTranslation}&rdquo;
                  </p>
                </div>
                <p className="text-[11px] leading-relaxed pt-2 border-t" style={{ borderColor: "var(--border-subtle)", ...muted }}>
                  In Sikh thought, all three pillars are inseparable: Naam without honest Kirat becomes hollow mysticism, and Kirat without Vand Chhakna becomes selfish accumulation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </GodModeBox>

      {/* 17th–19th Century Puratan Scholars Accordion Grid (items-start prevents sibling stretch!) */}
      <div className="space-y-3">
        <GodModeText
          id="foundations-scholars-eyebrow"
          pageKey="foundations"
          tag="p"
          defaultText="Traditional Sikh Lineages: Nirmale Scholars, Classical Kavis, Bhagats & 19th–20th Century Historians"
          className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#C59B27]"
        />
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
const KAKAAR_DEEP_STUDY: Record<
  string,
  {
    pronunciation: string;
    coreVirtue: string;
    etymology: string;
    gurmatPhilosophy: string;
    vaisakhiContext: string;
    dailyDiscipline: string;
    puratanQuoteGurmukhi: string;
    puratanQuoteTranslation: string;
    puratanSource: string;
  }
> = {
  kesh: {
    pronunciation: "Kesh (ਕੇਸ)",
    coreVirtue: "Hukam & Natural Sovereignty",
    etymology: "Sanskrit/Punjabi 'Keśa' — Sacred, unshorn hair preserved in its natural Creator-given form.",
    gurmatPhilosophy:
      "Kesh is the living seal of acceptance of Akal Purakh's Hukam (Divine Will). Rather than altering or renouncing the natural human form out of vanity or ascetic shaving practices (Mundan), a Sikh honors the body as a temple of Divine Light, crowning the Kesh with a Dastaar (turban) of equality and sovereign responsibility.",
    vaisakhiContext:
      "At Vaisakhi 1699 at Takht Sri Kesgarh Sahib, Guru Gobind Singh Ji made uncut Kesh crowned with a Dastaar the unmistakable visual identity of the Khalsa—ensuring that a Sikh could never hide in a crowd when called upon to defend the vulnerable.",
    dailyDiscipline:
      "Combing the Kesh twice daily with the Kanga, washing and caring for it with gratitude, and tying a clean Dastaar or Keski as a daily crown of humility and accountability.",
    puratanQuoteGurmukhi: "ਨਿਸ਼ਾਨਿ ਸਿੱਖੀ ਈਂ ਪੰਜ ਹਰਫ਼ ਕਾਫ਼ ॥ ਹਰਗਿਜ਼ ਨ ਬਾਸ਼ਦ ਈਂ ਪੰਜ ਮੁਆਫ਼ ॥",
    puratanQuoteTranslation:
      "These Five Ks are the sacred insignia of Sikhi; never are these five to be forsaken.",
    puratanSource: "Puratan Rehatnama Tradition & Sri Gur Sobha (1701)",
  },
  kara: {
    pronunciation: "Karā (ਕੜਾ)",
    coreVirtue: "Eternal Oneness & Ethical Restraint",
    etymology: "Punjabi 'Karā' — An unbroken circular band forged of Sarbloh (pure iron or steel) worn on the wrist.",
    gurmatPhilosophy:
      "Like a circle with no beginning and no end, the Kara symbolizes the timeless, unbroken nature of Ik Onkar. Worn on the working hand, it serves as a constant physical conscience ('Hathkadi' to the Guru): before the hand reaches out to act, strike, sign, or take, the Sikh sees the Kara and asks whether the action aligns with truth and compassion.",
    vaisakhiContext:
      "Forged in Sarbloh (all-iron), the Kara rejected both ornamental gold jewelry of royalty and superstitious charm threads (Rakhris/Taweez), uniting spiritual remembrance with martial strength.",
    dailyDiscipline:
      "Wearing the iron/steel Kara continuously on the wrist as a tactile reminder to use one's hands only for Kirat (honest work), Seva (service), and defense of righteousness.",
    puratanQuoteGurmukhi: "ਕੜਾ ਕ੍ਰਿਪਾਨ ਕਛਹਿਰਾ ਕੰਘਾ ॥ ਕੇਸ ਬਿਨਾ ਨਹੀਂ ਸਿੱਖੀ ਚੰਗਾ ॥",
    puratanQuoteTranslation:
      "Kara, Kirpan, Kachera, Kanga, and Kesh—together they form the complete discipline of the Khalsa.",
    puratanSource: "Bhai Nand Lal Ji & Bhai Prahlad Singh Rehatnama",
  },
  kanga: {
    pronunciation: "Kanghā (ਕੰਘਾ)",
    coreVirtue: "Order, Clarity & Daily Renewal",
    etymology: "Punjabi 'Kanghā' — A simple wooden comb tucked neatly within the knotted Kesh.",
    gurmatPhilosophy:
      "When renunciate yogis of the medieval era kept long hair, they matted it with ashes (Jata) as a sign of rejecting the world. Guru Gobind Singh Ji paired Kesh with the Kanga to proclaim the opposite: a Sikh lives in the world with dignity, cleanliness, and order. Just as the Kanga untangles knots from the hair twice a day, Naam and Vichaar untangle knots of confusion and ego from the mind.",
    vaisakhiContext:
      "Bestowed alongside Kesh in 1699, the Kanga established that Khalsa spirituality is disciplined, hygienic, and householder-centered rather than unkempt asceticism.",
    dailyDiscipline:
      "Combing the Kesh morning and evening while reflecting on Gurbani, maintaining bodily cleanliness (Ishnaan), and keeping the Kanga tucked securely inside the Jura (topknot).",
    puratanQuoteGurmukhi: "ਕੰਘਾ ਦੋਨੋਂ ਵਕਤ ਕਰ, ਪਾਗ ਚੁਨੈ ਕਰ ਬਾਂਧਈ ॥",
    puratanQuoteTranslation:
      "Comb the hair at both times of day (morning and evening), and tie the turban neatly block by fold.",
    puratanSource: "Tankahnama Bhai Nand Lal Ji",
  },
  kachera: {
    pronunciation: "Kachherā (ਕਛਹਿਰਾ)",
    coreVirtue: "Moral Restraint, Fidelity & Agile Readiness",
    etymology: "Punjabi 'Kachherā' — Tailored cotton drawstring breeches worn as an inner garment.",
    gurmatPhilosophy:
      "The Kachera represents Seel (moral restraint, marital fidelity, and mastery over lust/Kaam) combined with constant physical readiness. Unlike the loose unstitched dhotis worn in medieval South Asia that hindered swift movement, the Kachera allowed both male and female Khalsa warriors to mount a horse, serve in Langar, or defend the oppressed at a moment's notice.",
    vaisakhiContext:
      "Even during the fiercest 18th-century battles, Khalsa warriors were renowned by friend and foe alike for their unimpeachable moral character and honor toward all women—an ethic anchored in the vow of the Kachera.",
    dailyDiscipline:
      "Upholding personal modesty, self-control over sensory impulses, and lifelong respect for the dignity and safety of every human being.",
    puratanQuoteGurmukhi: "ਪਰ ਨਾਰੀ ਕੀ ਸੇਜ ਸੁਪਨੇ ਹੂੰ ਮਤ ਜਾਨਿਯੋ ॥",
    puratanQuoteTranslation:
      "Never harbor dishonorable desire even in thought or dream; uphold sacred fidelity and restraint.",
    puratanSource: "Charitropakhyan & Puratan Rehatnama Corpus",
  },
  kirpan: {
    pronunciation: "Kirpān (ਕਿਰਪਾਨ)",
    coreVirtue: "Mercy (Kirpa) & Honor (Aan)",
    etymology: "Compound of 'Kirpā' (Grace/Mercy/Compassion) + 'Ān' (Honor/Dignity/Sovereignty).",
    gurmatPhilosophy:
      "The Guru deliberately named the Sikh blade 'Kirpan' rather than 'Talwar' (weapon of aggression). A Kirpan is never drawn out of personal anger, revenge, or conquest; its sole mandate is 'Kirpa' (protecting the defenseless) and 'Aan' (upholding human dignity and freedom of conscience when all peaceful means have failed, as articulated in Guru Gobind Singh Ji's Zafarnama).",
    vaisakhiContext:
      "After the martyrdoms of Guru Arjan Dev Ji (1606) and Guru Tegh Bahadur Ji (1675), Guru Gobind Singh Ji armed the saints with the Kirpan so that compassion would never be helpless before tyranny.",
    dailyDiscipline:
      "Carrying the Kirpan in a Gatra (baldric) with deep humility, remembering that true strength belongs only to those who stand as a shield for the powerless.",
    puratanQuoteGurmukhi: "ਚੁ ਕਾਰ ਅਜ਼ ਹਮਹ ਹੀਲਤੇ ਦਰ ਗੁਜ਼ਸ਼ਤ ॥ ਹਲਾਲ ਅਸਤ ਬੁਰਦਨ ਬ ਸ਼ਮਸ਼ੀਰ ਦਸਤ ॥",
    puratanQuoteTranslation:
      "When all peaceful remedies have been exhausted, it is righteous to place the hand upon the hilt of the sword of justice.",
    puratanSource: "Zafarnama (Verse 22) — Guru Gobind Singh Ji",
  },
};

function SlideFiveKs({
  onOpenModal,
  cms,
}: {
  onOpenModal: (item: FoundationModalItem) => void;
  cms: CmsSiteState;
}) {
  const [liveEditMode] = useAdminEditMode();
  const isVerifiedLiveEdit = useVerifiedLiveEdit();
  const orderedKs = applyCmsVisibilityOrder(FIVE_KS, (item) => item.art.artKey, "foundations", cms, isVerifiedLiveEdit);
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
  const deepStudy = KAKAAR_DEEP_STUDY[k.id] || KAKAAR_DEEP_STUDY.kesh;
  const layoutCfg = cms.layoutConfig || {};
  const gurmukhiCls = resolveCmsGurmukhiClass(layoutCfg.gurmukhiScale);
  const headingCls = resolveCmsHeadingClass(layoutCfg.headingScale);
  const bodyCls = resolveCmsBodyClass(layoutCfg.bodyScale);

  const openKakaarModal = (item: (typeof FIVE_KS)[number]) => {
    const info = KAKAAR_DEEP_STUDY[item.id] || KAKAAR_DEEP_STUDY.kesh;
    onOpenModal({
      title: `${item.name} — ${item.meaning}`,
      gurmukhi: item.gurmukhi,
      subtitle: `Panj Kakaar (Vaisakhi 1699) • Core Virtue: ${info.coreVirtue}`,
      category: "The 5 Ks (Panj Kakaar)",
      datesAndPlace: "Vaisakhi 1699 • Takht Sri Kesgarh Sahib, Sri Anandpur Sahib",
      biography: `${item.symbolism}\n\n${info.gurmatPhilosophy}\n\nHistorical Context: ${info.vaisakhiContext}`,
      puratanSource: info.puratanSource,
      puratanCitation: `${info.puratanQuoteGurmukhi} — "${info.puratanQuoteTranslation}" (${info.puratanSource}).`,
      gurmatSignificance: `Daily Practice: ${info.dailyDiscipline}`,
      artKey: item.art.artKey,
      artVariant: item.art.variant,
    });
  };

  return (
    <div className="space-y-6">
      <SlideBannerArtwork artKey="fiveks-hero" variant="khanda" title="The Five Ks (Panj Kakaar)" />

      {/* Introduction Banner explaining Panj Kakaar */}
      <div className="rounded-3xl border border-[#d4af37]/30 p-6 sm:p-7 space-y-3 shadow-xl shadow-black/10 dark:shadow-2xl dark:shadow-black/30" style={card}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Eyebrow>Vaisakhi 1699 • Takht Sri Kesgarh Sahib • The Panj Kakaar Covenant</Eyebrow>
          <span
            className="text-[11px] font-bold px-3 py-1 rounded-full border"
            style={{
              backgroundColor: "var(--bg-tertiary)",
              borderColor: "var(--border-subtle)",
              color: "var(--accent-text)",
            }}
          >
            5 Articles of Faith • Sant-Sipahi Discipline
          </span>
        </div>
        <h3 className="font-serif text-xl sm:text-2xl font-bold">
          More Than Symbols: Living Instruments of Spiritual Consciousness &amp; Moral Courage
        </h3>
        <p className="text-sm leading-relaxed" style={muted}>
          Bestowed by Guru Gobind Singh Ji upon the Khalsa on Vaisakhi 1699 at Sri Anandpur Sahib, the <strong style={{ color: "var(--text-primary)" }}>Panj Kakaar (Five Ks)</strong> are not passive ornaments or charms. Together they form an integrated spiritual and ethical uniform—binding inner remembrance of Ik Onkar with outer accountability, cleanliness, self-restraint, and the solemn duty to protect human dignity.
        </p>
      </div>

      {/* Interactive 5-K Selector Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C59B27]">
            Interactive Kakaar Explorer — Select Any Article of Faith ({sel + 1} of {orderedKs.length})
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSel((prev) => (prev - 1 + orderedKs.length) % orderedKs.length)}
              className="px-3 py-1 rounded-lg border text-xs font-bold hover:border-[#C59B27] transition"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-primary)",
              }}
            >
              ← Prev Kakaar
            </button>
            <button
              type="button"
              onClick={() => setSel((prev) => (prev + 1) % orderedKs.length)}
              className="px-3 py-1 rounded-lg border text-xs font-bold hover:border-[#C59B27] transition"
              style={{
                backgroundColor: "var(--bg-surface)",
                borderColor: "var(--border-subtle)",
                color: "var(--text-primary)",
              }}
            >
              Next Kakaar →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5" role="tablist" aria-label="The five Ks">
          {orderedKs.map((x, i) => {
            const ov = cms.topicEdits?.[x.art.artKey];
            const isSelected = i === sel;
            const info = KAKAAR_DEEP_STUDY[x.id];
            return (
              <button
                key={x.id}
                role="tab"
                aria-selected={isSelected}
                type="button"
                onClick={() => setSel(i)}
                className={`rounded-2xl border p-3.5 text-left transition-all ${
                  isSelected
                    ? "bg-gradient-to-br from-[#C59B27] to-[#D97706] text-[#18181B] border-transparent shadow-lg"
                    : "hover:border-[#C59B27]"
                }`}
                style={
                  isSelected
                    ? undefined
                    : {
                        ...card,
                        color: "var(--text-primary)",
                      }
                }
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    lang="pa"
                    className={`font-gurmukhi text-base font-bold ${
                      isSelected ? "text-[#18181B]" : "text-[#C59B27]"
                    }`}
                  >
                    {ov?.gurmukhi || x.gurmukhi}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      isSelected ? "bg-black/15 text-[#18181B]" : "text-[#C59B27]"
                    }`}
                  >
                    K{i + 1}
                  </span>
                </div>
                <p className="font-serif text-base font-bold leading-snug">
                  {ov?.title || x.name}
                </p>
                <p
                  className={`text-[11px] line-clamp-1 mt-0.5 ${
                    isSelected ? "text-[#18181B]/85 font-medium" : ""
                  }`}
                  style={isSelected ? undefined : muted}
                >
                  {ov?.subtitle || x.meaning}
                </p>
                {info && (
                  <p
                    className={`text-[10px] font-semibold mt-1.5 truncate ${
                      isSelected ? "text-[#18181B]" : "text-[#D97706]"
                    }`}
                  >
                    {info.coreVirtue}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split Interactive Workbench for Selected Kakaar */}
      {orderedKs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Featured Artwork & Identity Card */}
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
            className={`lg:col-span-5 rounded-3xl border border-[#d4af37]/30 p-6 space-y-4 animate-fade-in-up cursor-pointer hover:border-[#d4af37] shadow-xl shadow-black/10 dark:shadow-2xl dark:shadow-black/30 transition-all duration-300 ease-out flex flex-col justify-between ${
              liveEditMode ? "overflow-visible" : ""
            } ${
              (cms.archivedIds || []).includes(rawK.art.artKey)
                ? "opacity-55 ring-2 ring-amber-400/70"
                : ""
            }`}
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
              <HiddenItemBadgeBar itemId={rawK.art.artKey} />
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

              <FoundationCardArtwork
                artKey={k.art.artKey}
                variant={k.art.variant}
                title={k.name}
                heightClass="h-44"
                compact
              />

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border"
                  style={{
                    backgroundColor: "var(--bg-tertiary)",
                    borderColor: "var(--border-subtle)",
                    color: "#C59B27",
                  }}
                >
                  {deepStudy.coreVirtue}
                </span>
                <span className="text-xs" style={muted}>
                  {deepStudy.pronunciation}
                </span>
              </div>

              <div className="space-y-1">
                <SlidePresentationCanvas
                  id={`fiveks-pa-${rawK.art.artKey}`}
                  pageKey="foundations"
                  label="Gurmukhi"
                  elementType="Text"
                  isMicroElement={true}
                >
                  <p lang="pa" className={`font-gurmukhi ${gurmukhiCls} font-bold text-[#C59B27]`}>
                    {k.gurmukhi}
                  </p>
                </SlidePresentationCanvas>
                <SlidePresentationCanvas
                  id={`fiveks-title-${rawK.art.artKey}`}
                  pageKey="foundations"
                  label="Title"
                  elementType="Text"
                  isMicroElement={true}
                >
                  <h3
                    style={{ color: kEdit?.textColor || layoutCfg.headingTextColor || undefined }}
                    className={`font-serif ${headingCls} font-bold`}
                  >
                    {k.name} — {k.meaning}
                  </h3>
                </SlidePresentationCanvas>
              </div>

              <SlidePresentationCanvas
                id={`fiveks-desc-${rawK.art.artKey}`}
                pageKey="foundations"
                label="Description"
                elementType="Text"
                isMicroElement={true}
              >
                <p className={`${bodyCls} leading-relaxed`} style={muted}>
                  {k.symbolism}
                </p>
              </SlidePresentationCanvas>

              <div
                className="rounded-2xl border p-3.5 space-y-1"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C59B27]">
                  Etymology &amp; Literal Meaning
                </span>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-primary)" }}>
                  {deepStudy.etymology}
                </p>
              </div>
            </div>

            <SlidePresentationCanvas
              id={`fiveks-cta-${rawK.art.artKey}`}
              pageKey="foundations"
              label="Sakhi CTA"
              elementType="Badge"
              isMicroElement={true}
              className="inline-block w-fit"
            >
              <span className="inline-block text-xs font-bold text-[#C59B27] pt-3">
                Open Full Historical Sakhi Modal &amp; Citations →
              </span>
            </SlidePresentationCanvas>
          </article>

          {/* Right 4-Dimension Study Panel for the Selected Kakaar */}
          <div
            className="lg:col-span-7 rounded-3xl border border-[#d4af37]/30 p-6 space-y-4 shadow-xl shadow-black/10 dark:shadow-2xl dark:shadow-black/30 flex flex-col justify-between"
            style={card}
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                <div>
                  <Eyebrow>Deep Study • {k.name} ({k.gurmukhi})</Eyebrow>
                  <h4 className="font-serif text-xl font-bold mt-0.5">
                    Philosophical, Historical &amp; Practical Dimensions
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => openKakaarModal(k)}
                  className="px-3.5 py-2 rounded-xl border text-xs font-bold text-[#C59B27] hover:border-[#C59B27] transition"
                  style={{
                    backgroundColor: "var(--bg-tertiary)",
                    borderColor: "var(--border-subtle)",
                  }}
                >
                  Open Reader Modal ↗
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div
                  className="rounded-2xl border p-4 space-y-2"
                  style={{
                    backgroundColor: "var(--bg-tertiary)",
                    borderColor: "var(--border-subtle)",
                  }}
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C59B27]">
                    ੧ · Spiritual &amp; Gurmat Philosophy
                  </span>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
                    {deepStudy.gurmatPhilosophy}
                  </p>
                </div>

                <div
                  className="rounded-2xl border p-4 space-y-2"
                  style={{
                    backgroundColor: "var(--bg-tertiary)",
                    borderColor: "var(--border-subtle)",
                  }}
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C59B27]">
                    ੨ · Historical Context (Vaisakhi 1699)
                  </span>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
                    {deepStudy.vaisakhiContext}
                  </p>
                </div>
              </div>

              <div
                className="rounded-2xl border p-4 space-y-2"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C59B27]">
                  ੩ · Daily Practical Discipline (Rehat &amp; Living Conduct)
                </span>
                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>
                  {deepStudy.dailyDiscipline}
                </p>
              </div>

              <div
                className="rounded-2xl border p-4 space-y-2"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  borderColor: "var(--border-subtle)",
                }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C59B27]">
                    ੪ · Puratan Scriptural &amp; Rehatnama Testimony
                  </span>
                  <span className="text-[11px] font-semibold text-[#D97706]">
                    {deepStudy.puratanSource}
                  </span>
                </div>
                <p lang="pa" className="font-gurmukhi text-sm sm:text-base leading-relaxed text-[#C59B27]">
                  {deepStudy.puratanQuoteGurmukhi}
                </p>
                <p className="text-xs italic leading-relaxed" style={muted}>
                  &ldquo;{deepStudy.puratanQuoteTranslation}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full 5-Card Comparison Matrix Below */}
      <div className="rounded-3xl border border-[#d4af37]/30 p-6 space-y-4 shadow-xl shadow-black/10 dark:shadow-2xl dark:shadow-black/30" style={card}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Eyebrow>All 5 Panj Kakaar at a Glance • Click Any Card to Inspect or Open Full Study</Eyebrow>
          <span className="text-xs" style={muted}>
            Uniting inner Sant (Saint) devotion with outer Sipahi (Soldier) responsibility
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 items-stretch">
          {orderedKs.map((item, idx) => {
            const ov = cms.topicEdits?.[item.art.artKey];
            const info = KAKAAR_DEEP_STUDY[item.id] || KAKAAR_DEEP_STUDY.kesh;
            const isSelected = idx === sel;
            return (
              <div
                key={item.id}
                className="rounded-2xl border p-4 flex flex-col justify-between transition-all space-y-3"
                style={{
                  backgroundColor: ov?.bgColor || layoutCfg.cardBgColor || "var(--bg-tertiary)",
                  borderColor: isSelected ? "#C59B27" : ov?.borderColor || "var(--border-subtle)",
                  color: ov?.textColor || "var(--text-primary)",
                }}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p lang="pa" className="font-gurmukhi text-base font-bold text-[#C59B27]">
                      {ov?.gurmukhi || item.gurmukhi}
                    </p>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#D97706]">
                      {info.coreVirtue}
                    </span>
                  </div>
                  <p className="font-serif text-base font-bold">
                    {ov?.title || item.name}
                  </p>
                  <p className="text-xs font-semibold" style={{ color: "var(--accent-text)" }}>
                    {ov?.subtitle || item.meaning}
                  </p>
                  <p className="text-xs leading-relaxed line-clamp-3 pt-1" style={muted}>
                    {ov?.description || item.symbolism}
                  </p>
                </div>

                <div className="pt-2 border-t flex items-center justify-between gap-2" style={{ borderColor: "var(--border-subtle)" }}>
                  <button
                    type="button"
                    onClick={() => setSel(idx)}
                    className="text-[11px] font-bold text-[#C59B27] hover:underline"
                  >
                    {isSelected ? "Active Above" : "Select in Explorer"}
                  </button>
                  <button
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
                    className="text-[11px] font-bold text-[#D97706] hover:underline"
                  >
                    Sakhi Modal →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- SLIDE 3 ----------------------------------- */
function SlideGurus({ onOpenModal }: { onOpenModal: (item: FoundationModalItem) => void }) {
  const [liveEditMode] = useAdminEditMode();
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
          className={`lg:col-span-3 rounded-3xl border-2 p-6 sm:p-8 space-y-3 cursor-pointer hover:border-[#C59B27] transition-all ${
            liveEditMode ? "overflow-visible" : ""
          }`}
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
        className={`grid gap-5 rounded-3xl border-2 p-6 md:grid-cols-5 cursor-pointer hover:border-[#C59B27] transition-all ${
          liveEditMode ? "overflow-visible" : ""
        }`}
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
              href="/granths"
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-bold text-[#D97706] underline"
            >
              Explore Granths &amp; Kirtan →
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
  const [liveEditMode] = useAdminEditMode();
  const isVerifiedLiveEdit = useVerifiedLiveEdit();
  const orderedPyare = applyCmsVisibilityOrder(PANJ_PYARE, (p) => p.art.artKey, "foundations", cms, isVerifiedLiveEdit);
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
              className={`space-y-3 rounded-2xl border border-[#d4af37]/30 p-4 cursor-pointer hover:border-[#d4af37] shadow-xl shadow-black/10 dark:shadow-2xl dark:shadow-black/30 transition-all duration-300 ease-out flex flex-col justify-between ${
                liveEditMode ? "overflow-visible" : ""
              } ${
                (cms.archivedIds || []).includes(p.art.artKey)
                  ? "opacity-55 ring-2 ring-amber-400/70"
                  : ""
              } ${resolveCmsCardLayoutClass(ov, layoutCfg.feedLayout)}`}
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
                <HiddenItemBadgeBar itemId={p.art.artKey} />
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
                <SlidePresentationCanvas
                  id={`pyare-pa-${p.art.artKey}`}
                  pageKey="foundations"
                  label="Gurmukhi"
                  elementType="Text"
                  isMicroElement={true}
                >
                  <p lang="pa" className={`font-gurmukhi ${resolveCmsGurmukhiClass(layoutCfg.gurmukhiScale)} font-semibold text-[#C59B27]`}>{p.gurmukhi}</p>
                </SlidePresentationCanvas>
                <SlidePresentationCanvas
                  id={`pyare-title-${p.art.artKey}`}
                  pageKey="foundations"
                  label="Title"
                  elementType="Text"
                  isMicroElement={true}
                >
                  <h4 style={{ color: ov?.textColor || layoutCfg.headingTextColor || undefined }} className={`font-serif ${resolveCmsHeadingClass(ov?.fontScale || layoutCfg.headingScale)} font-bold`}>{p.name}</h4>
                </SlidePresentationCanvas>
                <SlidePresentationCanvas
                  id={`pyare-sub-${p.art.artKey}`}
                  pageKey="foundations"
                  label="Origin"
                  elementType="Badge"
                  isMicroElement={true}
                  className="inline-block w-fit"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-[#C59B27]">{p.from}</p>
                </SlidePresentationCanvas>
                <SlidePresentationCanvas
                  id={`pyare-desc-${p.art.artKey}`}
                  pageKey="foundations"
                  label="Note"
                  elementType="Text"
                  isMicroElement={true}
                >
                  <p className={resolveCmsBodyClass(ov?.fontScale || layoutCfg.bodyScale)} style={muted}>{p.note}</p>
                </SlidePresentationCanvas>
              </div>
              <SlidePresentationCanvas
                id={`pyare-cta-${p.art.artKey}`}
                pageKey="foundations"
                label="Sakhi CTA"
                elementType="Badge"
                isMicroElement={true}
                className="inline-block w-fit"
              >
                <span className="inline-block text-xs font-bold text-[#C59B27] pt-2">
                  Read Historical Sakhi &amp; Citations →
                </span>
              </SlidePresentationCanvas>
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
  const [liveEditMode] = useAdminEditMode();
  const isVerifiedLiveEdit = useVerifiedLiveEdit();
  const orderedSahibzaade = applyCmsVisibilityOrder(SAHIBZAADE, (s) => s.art.artKey, "foundations", cms, isVerifiedLiveEdit);
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
      <div className="grid grid-cols-1 md:grid-cols-6 gap-5 items-start">
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
              className={`space-y-3 rounded-2xl border border-[#d4af37]/30 p-4 cursor-pointer hover:border-[#d4af37] shadow-xl shadow-black/10 dark:shadow-2xl dark:shadow-black/30 transition-all duration-300 ease-out flex flex-col justify-between ${
                liveEditMode ? "overflow-visible" : ""
              } ${
                (cms.archivedIds || []).includes(s.art.artKey)
                  ? "opacity-55 ring-2 ring-amber-400/70"
                  : ""
              } ${resolveCmsCardLayoutClass(ov, "grid-2")}`}
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
                <HiddenItemBadgeBar itemId={s.art.artKey} />
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
                <SlidePresentationCanvas
                  id={`sahibzaade-pa-${s.art.artKey}`}
                  pageKey="foundations"
                  label="Gurmukhi"
                  elementType="Text"
                  isMicroElement={true}
                >
                  <p lang="pa" className={`font-gurmukhi ${resolveCmsGurmukhiClass(layoutCfg.gurmukhiScale)} font-semibold text-[#C59B27]`}>{s.gurmukhi}</p>
                </SlidePresentationCanvas>
                <SlidePresentationCanvas
                  id={`sahibzaade-title-${s.art.artKey}`}
                  pageKey="foundations"
                  label="Title"
                  elementType="Text"
                  isMicroElement={true}
                >
                  <h4 style={{ color: ov?.textColor || layoutCfg.headingTextColor || undefined }} className={`font-serif ${resolveCmsHeadingClass(ov?.fontScale || layoutCfg.headingScale)} font-bold`}>{s.name}</h4>
                </SlidePresentationCanvas>
                <SlidePresentationCanvas
                  id={`sahibzaade-sub-${s.art.artKey}`}
                  pageKey="foundations"
                  label="Age & Place"
                  elementType="Badge"
                  isMicroElement={true}
                  className="inline-block w-fit"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-[#C59B27]">{ov?.subtitle || `${s.age} • ${s.place}`}</p>
                </SlidePresentationCanvas>
                <SlidePresentationCanvas
                  id={`sahibzaade-desc-${s.art.artKey}`}
                  pageKey="foundations"
                  label="Summary"
                  elementType="Text"
                  isMicroElement={true}
                >
                  <p className={resolveCmsBodyClass(ov?.fontScale || layoutCfg.bodyScale)} style={muted}>{s.note}</p>
                </SlidePresentationCanvas>
              </div>
              <SlidePresentationCanvas
                id={`sahibzaade-cta-${s.art.artKey}`}
                pageKey="foundations"
                label="Sakhi CTA"
                elementType="Badge"
                isMicroElement={true}
                className="inline-block w-fit"
              >
                <span className="inline-block text-xs font-bold text-[#C59B27] pt-2">
                  Read Historical Sakhi &amp; Citations →
                </span>
              </SlidePresentationCanvas>
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
  const [liveEditMode] = useAdminEditMode();
  const isVerifiedLiveEdit = useVerifiedLiveEdit();
  const orderedShaheeds = applyCmsVisibilityOrder(SHAHEEDS, (s) => s.art.artKey, "foundations", cms, isVerifiedLiveEdit);
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
              className={`space-y-3 rounded-2xl border border-[#d4af37]/30 p-4 cursor-pointer hover:border-[#d4af37] shadow-xl shadow-black/10 dark:shadow-2xl dark:shadow-black/30 transition-all duration-300 ease-out flex flex-col justify-between ${
                liveEditMode ? "overflow-visible" : ""
              } ${
                (cms.archivedIds || []).includes(s.art.artKey)
                  ? "opacity-55 ring-2 ring-amber-400/70"
                  : ""
              } ${resolveCmsCardLayoutClass(ov, layoutCfg.feedLayout)}`}
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
                <HiddenItemBadgeBar itemId={s.art.artKey} />
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
                <SlidePresentationCanvas
                  id={`shaheed-pa-${s.art.artKey}`}
                  pageKey="foundations"
                  label="Gurmukhi"
                  elementType="Text"
                  isMicroElement={true}
                >
                  <p lang="pa" className={`font-gurmukhi ${resolveCmsGurmukhiClass(layoutCfg.gurmukhiScale)} font-semibold text-[#C59B27]`}>{s.gurmukhi}</p>
                </SlidePresentationCanvas>
                <SlidePresentationCanvas
                  id={`shaheed-title-${s.art.artKey}`}
                  pageKey="foundations"
                  label="Title"
                  elementType="Text"
                  isMicroElement={true}
                >
                  <h4 style={{ color: ov?.textColor || layoutCfg.headingTextColor || undefined }} className={`font-serif ${resolveCmsHeadingClass(ov?.fontScale || layoutCfg.headingScale)} font-bold`}>{s.name}</h4>
                </SlidePresentationCanvas>
                <SlidePresentationCanvas
                  id={`shaheed-year-${s.art.artKey}`}
                  pageKey="foundations"
                  label="Year"
                  elementType="Badge"
                  isMicroElement={true}
                  className="inline-block w-fit"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-[#C59B27]">{s.year}</p>
                </SlidePresentationCanvas>
                <SlidePresentationCanvas
                  id={`shaheed-desc-${s.art.artKey}`}
                  pageKey="foundations"
                  label="Summary"
                  elementType="Text"
                  isMicroElement={true}
                >
                  <p className={resolveCmsBodyClass(ov?.fontScale || layoutCfg.bodyScale)} style={muted}>{s.note}</p>
                </SlidePresentationCanvas>
              </div>
              <SlidePresentationCanvas
                id={`shaheed-cta-${s.art.artKey}`}
                pageKey="foundations"
                label="Sakhi CTA"
                elementType="Badge"
                isMicroElement={true}
                className="inline-block w-fit"
              >
                <span className="inline-block text-xs font-bold text-[#C59B27] pt-2">
                  Read Historical Sakhi &amp; Citations →
                </span>
              </SlidePresentationCanvas>
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
          Gurpurabs by the lunar calendar, so confirm with your local Gurdwara.
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
  const [liveEditMode] = useAdminEditMode();
  const isVerifiedLiveEdit = useVerifiedLiveEdit();
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
  const customFoundations = applyCmsVisibilityOrder(
    cms.customTopics?.foundations || [],
    (t) => t.id,
    "foundations",
    cms,
    isVerifiedLiveEdit
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
      }}
      className={`space-y-6 outline-none rounded-2xl ${getPageTransitionClass(layoutCfg.pageTransition)} ${deckWidthCls}`}
    >
      <InlineSectionBanner
        sectionId="foundations-deck"
        pageKey="foundations"
        defaultTitle="Who is a Sikh? & Foundations of Sikhi"
      />
      <GodModeBox id="foundations-header-box" pageKey="foundations" label="Header Section">
      <div className={`space-y-2 ${deckAlignCls}`}>
        <div className="flex flex-wrap items-center gap-2">
          <GodModeText
            id="foundations-deck-eyebrow"
            pageKey="foundations"
            tag="p"
            defaultText={deckInline?.badge || "Sikhi 101 • Start here"}
            className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#C59B27]"
          />
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
          <GodModeText
            id="foundations-deck-title"
            pageKey="foundations"
            tag="span"
            defaultText={
              deckInline?.title ||
              deckSec?.customTitle ||
              "Who is a Sikh? & Foundations of Sikhi"
            }
          />
        </Heading>
        <GodModeText
          id="foundations-deck-subtitle"
          pageKey="foundations"
          tag="p"
          defaultText={
            deckInline?.description ||
            deckSec?.customSubtitle ||
            "Seven short slides, each with a painting, to understand the heart of Sikhi. Swipe, tap or use the arrow keys."
          }
          className={`max-w-3xl text-base ${deckSec?.titleAlign === "center" ? "mx-auto" : ""}`}
          style={muted}
        />
      </div>
      </GodModeBox>

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Foundations slides">
        {SLIDES.map((s, i) => {
          const active = i === index;
          return (
            <button
              key={s.id}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => go(i)}
              className={`relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl border px-3.5 py-2 text-sm font-bold transition-colors ${
                active ? "text-[#18181B] border-transparent" : ""
              }`}
              style={active ? undefined : { ...card }}
            >
              {active && (
                <motion.span
                  layoutId="foundations-slide-pill"
                  transition={{ type: "spring", stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#C59B27] to-[#D97706] shadow-sm"
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <SikhiIcon name={s.icon} size={22} />
                {s.short}
              </span>
            </button>
          );
        })}
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
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={SLIDES[index].id}
            initial={{ opacity: 0, x: dir >= 0 ? 28 : -28, scale: 0.99 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: dir >= 0 ? -24 : 24, scale: 0.99 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            style={{ willChange: "transform, opacity" }}
          >
            {body}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button type="button" disabled={index === 0} onClick={() => go(index - 1)} className="rounded-xl border px-5 py-2.5 text-sm font-bold disabled:opacity-40" style={card}>
          <GodModeText id="foundations-prev-btn" pageKey="foundations" tag="span" defaultText="← Previous" />
        </button>
        <div className="flex items-center gap-2" aria-hidden="true">
          {SLIDES.map((s, i) => (
            <span key={s.id} className="h-2 rounded-full" style={{ width: i === index ? 28 : 8, background: i === index ? "var(--accent-primary)" : "var(--border-subtle)", transition: "width 300ms cubic-bezier(0.22,1,0.36,1)" }} />
          ))}
        </div>
        <button type="button" disabled={index === SLIDES.length - 1} onClick={() => go(index + 1)} className="rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] px-5 py-2.5 text-sm font-bold disabled:opacity-40">
          <GodModeText id="foundations-next-btn" pageKey="foundations" tag="span" defaultText="Next →" />
        </button>
      </div>

      {customFoundations.length > 0 && (
        <div className="space-y-4 pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
          <GodModeText
            id="foundations-curated-heading"
            pageKey="foundations"
            tag="p"
            defaultText="Admin Curated Additions"
            className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#C59B27]"
          />
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
                  className={`rounded-2xl border border-[#d4af37]/30 p-4 space-y-2.5 shadow-xl shadow-black/10 dark:shadow-2xl dark:shadow-black/30 transition-all duration-300 ease-out ${
                    liveEditMode ? "overflow-visible" : ""
                  } ${
                    (cms.archivedIds || []).includes(ct.id)
                      ? "opacity-55 ring-2 ring-amber-400/70"
                      : ""
                  } ${resolveCmsCardLayoutClass(ov, layoutCfg.feedLayout)}`}
                >
                  <HiddenItemBadgeBar itemId={ct.id} />
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
                    <SlidePresentationCanvas
                      id={`custom-pa-${ct.id}`}
                      pageKey="foundations"
                      label="Gurmukhi"
                      elementType="Text"
                      isMicroElement={true}
                    >
                      <p lang="pa" className={`font-gurmukhi ${resolveCmsGurmukhiClass(layoutCfg.gurmukhiScale)} font-semibold text-[#C59B27]`}>
                        {ov?.gurmukhi || ct.gurmukhi}
                      </p>
                    </SlidePresentationCanvas>
                  )}
                  <SlidePresentationCanvas
                    id={`custom-title-${ct.id}`}
                    pageKey="foundations"
                    label="Title"
                    elementType="Text"
                    isMicroElement={true}
                  >
                    <h4
                      style={{ color: ov?.textColor || ct.textColor || layoutCfg.headingTextColor || undefined }}
                      className={`font-serif ${resolveCmsHeadingClass(ov?.fontScale || ct.fontScale || layoutCfg.headingScale)} font-bold`}
                    >
                      {ov?.title || ct.title}
                    </h4>
                  </SlidePresentationCanvas>
                  {(ov?.subtitle || ct.subtitle) && (
                    <SlidePresentationCanvas
                      id={`custom-sub-${ct.id}`}
                      pageKey="foundations"
                      label="Subtitle"
                      elementType="Badge"
                      isMicroElement={true}
                      className="inline-block w-fit"
                    >
                      <p className="text-xs font-bold uppercase tracking-wider text-[#C59B27]">
                        {ov?.subtitle || ct.subtitle}
                      </p>
                    </SlidePresentationCanvas>
                  )}
                  <SlidePresentationCanvas
                    id={`custom-desc-${ct.id}`}
                    pageKey="foundations"
                    label="Summary"
                    elementType="Text"
                    isMicroElement={true}
                  >
                    <p className={resolveCmsBodyClass(ov?.fontScale || ct.fontScale || layoutCfg.bodyScale)} style={muted}>
                      {ov?.description || ct.description}
                    </p>
                  </SlidePresentationCanvas>
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
