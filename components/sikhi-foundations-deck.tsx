"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChitrakariCardHeader } from "@/components/chitrakari-card-header";
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
  { id: "who", short: "Who is a Sikh?", title: "Who is a Sikh?", icon: "ikonkar" },
  { id: "fiveks", short: "The 5 Ks", title: "The 5 Ks (Panj Kakaar)", icon: "khanda" },
  { id: "gurus", short: "10 Gurus", title: "The 10 Guru Sahibs & the Eternal Guru", icon: "scroll" },
  { id: "pyare", short: "Panj Pyare", title: "The Panj Pyare (Five Beloved)", icon: "dhaal" },
  { id: "sahibzaade", short: "Sahibzaade", title: "The Chaar Sahibzaade", icon: "lotus-dome" },
  { id: "shaheeds", short: "Shaheeds", title: "Iconic Shaheeds of the Panth", icon: "khanda" },
  { id: "today", short: "Today in Sikhi", title: "What's Today in Sikhi?", icon: "rabab" },
];

const card: React.CSSProperties = {
  backgroundColor: "var(--bg-surface)",
  borderColor: "var(--border-subtle)",
  color: "var(--text-primary)",
};
const muted: React.CSSProperties = { color: "var(--theme-text-muted)" };

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C59B27]">{children}</span>
  );
}

/* ----------------------------- SLIDE 1 ----------------------------------- */
function SlideWho() {
  const beliefs = [
    "One Immortal Being (Ik Onkar)",
    "The Ten Guru Sahibs, from Guru Nanak Dev Ji to Guru Gobind Singh Ji",
    "Sri Guru Granth Sahib Ji",
    "The utterances and teachings of the Ten Gurus",
    "The baptism (Amrit) bequeathed by the Tenth Guru",
  ];
  const pillars: { icon: SikhiIconName; name: string; gurmukhi: string; text: string }[] = [
    { icon: "ikonkar", name: "Naam Japna", gurmukhi: "ਨਾਮ ਜਪਣਾ", text: "Remember the One through daily meditation and Gurbani." },
    { icon: "dhaal", name: "Kirat Karni", gurmukhi: "ਕਿਰਤ ਕਰਨੀ", text: "Earn an honest living by your own effort." },
    { icon: "lotus-dome", name: "Vand Chhakna", gurmukhi: "ਵੰਡ ਛਕਣਾ", text: "Share what you have with others, starting with those in need." },
  ];
  return (
    <div className="space-y-6">
      <ChitrakariCardHeader artKey="guru-nanak" variant="guru" title="Guru Nanak Dev Ji" heightClass="h-56 sm:h-72" editable />
      <div className="rounded-3xl border-2 p-6 sm:p-8 space-y-4" style={card}>
        <Eyebrow>Sikh Rehat Maryada • Definition of a Sikh</Eyebrow>
        <blockquote className="font-serif text-xl sm:text-2xl leading-relaxed">
          &ldquo;Any human being who faithfully believes in One Immortal Being, the Ten Gurus (from Guru Nanak Dev
          to Guru Gobind Singh), the Guru Granth Sahib, the utterances and teachings of the Ten Gurus, and the
          baptism bequeathed by the Tenth Guru, and who does not owe allegiance to any other religion, is a Sikh.&rdquo;
        </blockquote>
        <ol className="grid gap-2 sm:grid-cols-2">
          {beliefs.map((b, i) => (
            <li key={b} className="flex items-start gap-3 rounded-xl border p-3 text-sm" style={{ borderColor: "var(--border-subtle)" }}>
              <span lang="pa" className="font-gurmukhi text-lg font-bold text-[#C59B27]">{NUMERALS[i]}</span>
              <span>{b}</span>
            </li>
          ))}
        </ol>
        <p className="text-xs" style={muted}>
          Paraphrased from Article I of the Sikh Rehat Maryada (SGPC). Sikhi is a path you grow into: learning,
          practice and Seva come first.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {pillars.map((p) => (
          <div key={p.name} className="rounded-2xl border p-5 space-y-2" style={card}>
            <div className="flex items-center gap-3">
              <SikhiIcon name={p.icon} size={40} />
              <div>
                <p lang="pa" className="font-gurmukhi text-sm font-semibold text-[#C59B27]">{p.gurmukhi}</p>
                <h4 className="font-serif text-lg font-bold">{p.name}</h4>
              </div>
            </div>
            <p className="text-sm" style={muted}>{p.text}</p>
          </div>
        ))}
      </div>
      <p className="text-xs" style={muted}>Guru Nanak Dev Ji&apos;s three pillars.</p>
    </div>
  );
}

/* ----------------------------- SLIDE 2 ----------------------------------- */
function SlideFiveKs() {
  const [sel, setSel] = useState(0);
  const k = FIVE_KS[sel];
  return (
    <div className="space-y-6">
      <ChitrakariCardHeader artKey="fiveks-hero" variant="khanda" title="The Five Ks" heightClass="h-44 sm:h-56" editable />
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="The five Ks">
        {FIVE_KS.map((x, i) => (
          <button
            key={x.id}
            role="tab"
            aria-selected={i === sel}
            type="button"
            onClick={() => setSel(i)}
            className={`rounded-xl border px-4 py-2 text-sm font-bold ${i === sel ? "bg-gradient-to-r from-[#C59B27] to-[#D97706]" : ""}`}
            style={i === sel ? undefined : { ...card, color: "var(--text-primary)" }}
          >
            <span lang="pa" className="font-gurmukhi mr-1.5">{x.gurmukhi}</span>
            {x.name}
          </button>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div key={k.id} className="rounded-3xl border-2 p-6 space-y-4 animate-fade-in-up" style={card}>
          <ChitrakariCardHeader artKey={k.art.artKey} variant={k.art.variant} title={k.name} heightClass="h-32" editable compact />
          <div>
            <p lang="pa" className="font-gurmukhi text-2xl font-bold text-[#C59B27]">{k.gurmukhi}</p>
            <h3 className="font-serif text-2xl font-bold">{k.name} — {k.meaning}</h3>
          </div>
          <p className="text-sm leading-relaxed" style={muted}>{k.symbolism}</p>
        </div>
        <div className="rounded-3xl border-2 p-6 space-y-4" style={card}>
          <Eyebrow>Who wears the Five Ks?</Eyebrow>
          <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border-subtle)" }}>
            <h4 className="font-serif text-lg font-bold">Amritdhari Sikhs (the initiated Khalsa)</h4>
            <p className="text-sm mt-1" style={muted}>
              Wear all five at all times, as a vow taken at the Amrit Sanchar ceremony.
            </p>
          </div>
          <div className="rounded-2xl border p-4" style={{ borderColor: "var(--border-subtle)" }}>
            <h4 className="font-serif text-lg font-bold">Practising Sikhs on the path (often called Sehajdhari)</h4>
            <p className="text-sm mt-1" style={muted}>
              Many keep their Kesh and wear the Kara, and cherish the other articles as they grow in learning and
              practice. Taking Amrit is a personal, voluntary step made when a Sikh feels ready.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- SLIDE 3 ----------------------------------- */
function SlideGurus() {
  const [sel, setSel] = useState(0);
  const g = GURUS[sel];
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
            className={`h-11 min-w-11 shrink-0 rounded-full border-2 px-3 font-gurmukhi text-base font-bold ${i === sel ? "bg-gradient-to-r from-[#C59B27] to-[#D97706]" : ""}`}
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
        <div className="lg:col-span-3 rounded-3xl border-2 p-6 sm:p-8 space-y-3" style={card}>
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
          <div className="flex gap-2 pt-2">
            <button type="button" disabled={sel === 0} onClick={() => setSel(sel - 1)} className="rounded-xl border px-4 py-2 text-xs font-bold disabled:opacity-40" style={card}>← Previous Guru</button>
            <button type="button" disabled={sel === GURUS.length - 1} onClick={() => setSel(sel + 1)} className="rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] px-4 py-2 text-xs font-bold disabled:opacity-40">Next Guru →</button>
          </div>
        </div>
      </div>
      <div className="grid gap-5 rounded-3xl border-2 p-6 md:grid-cols-5" style={card}>
        <div className="md:col-span-2">
          <ChitrakariCardHeader artKey="sggs-eternal" variant="manuscript" title="Sri Guru Granth Sahib Ji" heightClass="h-40" editable compact />
        </div>
        <div className="md:col-span-3 space-y-2">
          <Eyebrow>The Eternal Guru</Eyebrow>
          <p lang="pa" className="font-gurmukhi text-xl font-semibold text-[#C59B27]">ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ</p>
          <h3 className="font-serif text-2xl font-bold">Sri Guru Granth Sahib Ji</h3>
          <p className="text-sm leading-relaxed" style={muted}>
            First installed at Sri Harmandir Sahib in 1604 under Guru Arjan Dev Ji, with Baba Buddha Ji as the first
            Granthi. In 1708 Guru Gobind Singh Ji declared it the eternal Guru of the Sikhs. It has 1,430 Angs and
            carries the bani of the Gurus alongside saints from many backgrounds.
          </p>
          <Link href="/nitnem" className="inline-block text-sm font-bold text-[#C59B27] underline">Read Gurbani →</Link>
        </div>
      </div>
      <p className="text-xs" style={muted}>Dates follow commonly cited traditional reckonings.</p>
    </div>
  );
}

/* ----------------------------- SLIDE 4 ----------------------------------- */
function SlidePyare() {
  return (
    <div className="space-y-6">
      <ChitrakariCardHeader artKey="panj-pyare" variant="khanda" title="The Panj Pyare" heightClass="h-56 sm:h-72" editable />
      <div className="rounded-3xl border-2 p-6 sm:p-8 space-y-3" style={card}>
        <Eyebrow>Vaisakhi 1699 • Sri Anandpur Sahib</Eyebrow>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold">&ldquo;Who will offer his head?&rdquo;</h3>
        <p className="text-base leading-relaxed" style={muted}>
          At the Vaisakhi gathering, Guru Gobind Singh Ji called for a Sikh willing to give his head. Five came forward
          one by one, from different regions and backgrounds. The Guru prepared Amrit with a Khanda, with Mata Jito Ji
          adding sweet crystals (patasha), and gave it to the five, who became the Panj Pyare. He then asked them to
          initiate him, becoming Guru Gobind Singh and showing that Guru and Khalsa are one.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PANJ_PYARE.map((p) => (
          <article key={p.name} className="space-y-3 rounded-2xl border p-4" style={card}>
            <ChitrakariCardHeader artKey={p.art.artKey} variant={p.art.variant} title={p.name} heightClass="h-32" editable compact />
            <p lang="pa" className="font-gurmukhi text-sm font-semibold text-[#C59B27]">{p.gurmukhi}</p>
            <h4 className="font-serif text-lg font-bold">{p.name}</h4>
            <p className="text-xs font-bold uppercase tracking-wider text-[#C59B27]">From {p.from}</p>
            <p className="text-sm" style={muted}>{p.note}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- SLIDE 5 ----------------------------------- */
function SlideSahibzaade() {
  return (
    <div className="space-y-6">
      <ChitrakariCardHeader artKey="sahibzaade-hero" variant="anandpur" title="The Chaar Sahibzaade" heightClass="h-44 sm:h-56" editable />
      <div className="rounded-3xl border-2 p-6 sm:p-8" style={card}>
        <Eyebrow>Chamkaur Sahib & Sirhind • December 1704</Eyebrow>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold mt-1">Four princes, one unshaken faith</h3>
        <p className="mt-2 text-base leading-relaxed" style={muted}>
          The two elder Sahibzaade fell in battle at Chamkaur Sahib. The two younger Sahibzaade, with their grandmother
          Mata Gujri Ji, were taken to Sirhind where they refused to give up their faith.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        {SAHIBZAADE.map((s) => (
          <article key={s.name} className="space-y-3 rounded-2xl border p-4" style={card}>
            <ChitrakariCardHeader artKey={s.art.artKey} variant={s.art.variant} title={s.name} heightClass="h-36" editable compact />
            <p lang="pa" className="font-gurmukhi text-sm font-semibold text-[#C59B27]">{s.gurmukhi}</p>
            <h4 className="font-serif text-xl font-bold">{s.name}</h4>
            <p className="text-xs font-bold uppercase tracking-wider text-[#C59B27]">{s.age} • {s.place}</p>
            <p className="text-sm" style={muted}>{s.note}</p>
          </article>
        ))}
      </div>
      <article className="grid gap-5 rounded-2xl border-2 p-5 md:grid-cols-5" style={card}>
        <div className="md:col-span-2">
          <ChitrakariCardHeader artKey={MATA_GUJRI.art.artKey} variant={MATA_GUJRI.art.variant} title={MATA_GUJRI.name} heightClass="h-40" editable compact />
        </div>
        <div className="md:col-span-3 space-y-1">
          <p lang="pa" className="font-gurmukhi text-sm font-semibold text-[#C59B27]">{MATA_GUJRI.gurmukhi}</p>
          <h4 className="font-serif text-xl font-bold">{MATA_GUJRI.name}</h4>
          <p className="text-sm leading-relaxed" style={muted}>{MATA_GUJRI.note}</p>
          <Link href="/matriarchs" className="inline-block text-sm font-bold text-[#C59B27] underline">More Sikh women →</Link>
        </div>
      </article>
    </div>
  );
}

/* ----------------------------- SLIDE 6 ----------------------------------- */
function SlideShaheeds() {
  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>Martyrs of the Panth</Eyebrow>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold mt-1">They chose conscience over comfort</h3>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SHAHEEDS.map((s) => (
          <article key={s.name} className="space-y-3 rounded-2xl border p-4" style={card}>
            <ChitrakariCardHeader artKey={s.art.artKey} variant={s.art.variant} title={s.name} heightClass="h-36" editable compact />
            <p lang="pa" className="font-gurmukhi text-sm font-semibold text-[#C59B27]">{s.gurmukhi}</p>
            <h4 className="font-serif text-lg font-bold">{s.name}</h4>
            <p className="text-xs font-bold uppercase tracking-wider text-[#C59B27]">{s.year}</p>
            <p className="text-sm" style={muted}>{s.note}</p>
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
      <ChitrakariCardHeader artKey="darbar-sahib" variant="darbar" title="Sri Harmandir Sahib" heightClass="h-44 sm:h-56" editable />
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
      case "fiveks": return <SlideFiveKs />;
      case "gurus": return <SlideGurus />;
      case "pyare": return <SlidePyare />;
      case "sahibzaade": return <SlideSahibzaade />;
      case "shaheeds": return <SlideShaheeds />;
      default: return <SlideToday />;
    }
  })();

  return (
    <section
      aria-label="Foundations of Sikhi interactive slide deck"
      tabIndex={0}
      onKeyDown={(e) => {
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
            className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl border px-3.5 py-2 text-sm font-bold ${i === index ? "bg-gradient-to-r from-[#C59B27] to-[#D97706]" : ""}`}
            style={i === index ? undefined : { ...card }}
          >
            <SikhiIcon name={s.icon} size={22} />
            <span lang="pa" className="font-gurmukhi">{NUMERALS[i]}</span>
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
        <button type="button" disabled={index === SLIDES.length - 1} onClick={() => go(index + 1)} className="rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] px-5 py-2.5 text-sm font-bold disabled:opacity-40">
          Next →
        </button>
      </div>
    </section>
  );
}

export default SikhiFoundationsDeck;
