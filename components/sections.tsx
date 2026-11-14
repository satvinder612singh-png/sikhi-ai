import { Icon, type IconName } from "@/components/icons";

type Card = { title: string; body: string; icon: IconName };

const SOURCES: Card[] = [
  {
    title: "Gurbani",
    body: "Answers begin with the Guru Granth Sahib, citing the bani or shabad and Ang so you can read the original verse yourself.",
    icon: "book",
  },
  {
    title: "Historical references",
    body: "Janamsakhis, Rehatnamas, Gurbilas literature and early records, each identified by type and period.",
    icon: "scroll",
  },
  {
    title: "Credible scholarship",
    body: "Published teekas, academic studies and translations, attributed to their authors so interpretations stay traceable.",
    icon: "scholar",
  },
];

const FEATURES: Card[] = [
  {
    title: "Gurbani Texts",
    body: "Explore shabads, banis and their meanings, with the original Gurmukhi, transliteration and translation.",
    icon: "book",
  },
  {
    title: "Sikh History",
    body: "From Guru Nanak's travels to the Khalsa and beyond: events, timelines and the people who shaped them.",
    icon: "scroll",
  },
  {
    title: "Sikh Philosophy",
    body: "Concepts such as Hukam, Haumai, Naam Simran and Seva, explained clearly and grounded in the text.",
    icon: "lotus",
  },
  {
    title: "Sikh Practice",
    body: "Understand langar, sangat, pangat and the daily rhythm of Sikh life and gurdwara tradition.",
    icon: "hands",
  },
  {
    title: "The Gurus",
    body: "The ten Gurus, their teachings, and the continuity of Guru Granth Sahib as the eternal Guru.",
    icon: "star",
  },
  {
    title: "Reflect and Learn",
    body: "Gentle explanations for beginners, with deeper layers for students who want to go further.",
    icon: "spark",
  },
];

function SectionHeading({
  eyebrow,
  title,
  id,
  children,
}: {
  eyebrow: string;
  title: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-medium uppercase tracking-[0.25em] text-gold">{eyebrow}</p>
      <h2 id={id} className="mt-3 font-serif text-4xl font-semibold text-gold-pale sm:text-5xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-relaxed text-slate-400">{children}</p>
    </div>
  );
}

export function GoldDivider() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto h-px w-full max-w-md bg-gradient-to-r from-transparent via-gold/60 to-transparent"
    />
  );
}

export function SourcesSection() {
  return (
    <section
      id="sources"
      aria-labelledby="sources-title"
      className="bg-midnight-900 px-5 py-24 sm:px-8"
    >
      <SectionHeading eyebrow="Grounded in sources" title="Every answer shows its sources" id="sources-title">
        Learn Sikhi is designed to explain, not to pronounce. Answers cite where they come
        from so you can follow the trail to the original.
      </SectionHeading>

      <ul className="mx-auto mt-14 grid max-w-6xl gap-6 md:grid-cols-3">
        {SOURCES.map((s) => (
          <li
            key={s.title}
            className="rounded-2xl border border-gold/20 bg-gradient-to-b from-white/[0.04] to-transparent p-7"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold-light ring-1 ring-gold/30">
              <Icon name={s.icon} className="h-6 w-6" />
            </span>
            <h3 className="mt-5 font-serif text-2xl font-semibold text-gold-pale">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function FeatureGrid() {
  return (
    <section
      id="explore"
      aria-labelledby="explore-title"
      className="bg-midnight-800 px-5 py-24 sm:px-8"
    >
      <SectionHeading eyebrow="Core values" title="Begin wherever your curiosity leads" id="explore-title">
        Whether you are new to Sikhi or deepening a lifelong study, choose a path and
        ask your own questions along the way.
      </SectionHeading>

      <ul className="mx-auto mt-14 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <li key={f.title}>
            <article className="group h-full rounded-2xl border border-white/10 bg-midnight-900/70 p-7 transition duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-glow">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold transition group-hover:bg-gold group-hover:text-midnight-900">
                <Icon name={f.icon} className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-serif text-2xl font-semibold text-gold-pale">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.body}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
