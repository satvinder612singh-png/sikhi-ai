"use client";

import React from "react";
import { MotionConfig, motion } from "framer-motion";
import { ArrowUpRight, BookOpen, Compass, Globe, Radio } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface CreatorDirectoryItem {
  name: string;
  url: string;
  brief: string;
  whatYoullLearn: string;
  format: string;
}

interface NewsOutletItem {
  name: string;
  url: string;
  region: string;
}

const INDEPENDENT_SCHOLARS_AND_CREATORS: CreatorDirectoryItem[] = [
  {
    name: "Manglacharan",
    url: "https://manglacharan.com/",
    brief:
      "Open-access English translations of pre-colonial Sikh literature, commentaries, and historical chronicles (Suraj Prakash, Gur Panth Prakash, Faridkot Tika, and more) by Dr. Jvala Singh.",
    whatYoullLearn: "Classical Granths & Translations",
    format: "Translations & Research",
  },
  {
    name: "The Suraj Podcast",
    url: "https://www.surajpodcast.com/",
    brief:
      "Chapter-by-chapter English audio storytelling of Kavi Santokh Singh's Gurpratap Suraj Prakash with original musical scoring—ideal for commuting or studying.",
    whatYoullLearn: "Sikh Itihaas & Audio Storytelling",
    format: "Podcast",
  },
  {
    name: "Azadism",
    url: "https://azadism.co.uk/",
    brief:
      "Explores Sikh political-economic philosophy, Miri-Piri, sovereignty, and how Sikh ethics apply to modern leadership and institutions.",
    whatYoullLearn: "Miri-Piri, Sovereignty & Leadership",
    format: "Philosophy & Policy",
  },
  {
    name: "Bunga Azaadi (Substack)",
    url: "https://substack.com/@azadism",
    brief:
      "Essays, manifestos, and debates (Azaadcast) on Sikh governance, economics, and community institution-building.",
    whatYoullLearn: "Governance, Economics & Institutions",
    format: "Substack & Podcast",
  },
  {
    name: "Ramblings of a Sikh",
    url: "https://substack.com/@ramblingsofasikh",
    brief:
      "Substack, podcast, and curated books by Amar Singh uncovering primary-source Sikh history, early sovereignty, and forgotten stories of Sikh women.",
    whatYoullLearn: "Primary History & Unsung Sikh Women",
    format: "Substack, Podcast & Books",
  },
  {
    name: "Sikh Research Institute (SikhRI)",
    url: "https://sikhri.org/",
    brief:
      "Structured courses, The Guru Granth Sahib Project, research papers, and podcasts bridging rigorous Gurbani scholarship with daily life.",
    whatYoullLearn: "Gurbani Scholarship & Courses",
    format: "Institute & Courses",
  },
];

const SIKH_NEWS_OUTLETS: NewsOutletItem[] = [
  { name: "Sikh Channel", url: "https://sikhchannel.tv", region: "UK / Global" },
  { name: "Akaal Channel", url: "https://akaalchannel.tv", region: "UK / Global" },
  { name: "Baaz News", url: "https://baaznews.org", region: "Canada / Global" },
  { name: "World Sikh Organization (WSO)", url: "https://worldsikh.org", region: "Canada" },
  { name: "Sikh Coalition", url: "https://sikhcoalition.org", region: "USA" },
  { name: "Sikh Press Association (SikhPA)", url: "https://sikhpa.com", region: "UK / Global" },
  { name: "Sikh24", url: "https://sikh24.com", region: "Global" },
];

export default function ExploreNewsPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div
        style={{
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
        className="min-h-screen flex flex-col relative overflow-x-clip"
      >
        <Header solid />

        <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 pb-28 space-y-12">
          {/* Top Minimalistic Mission Banner */}
          <motion.header
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
            }}
            className="rounded-2xl border p-6 sm:p-8 space-y-3"
          >
            <p
              style={{ color: "var(--accent-text)" }}
              className="text-xs font-semibold uppercase tracking-[0.18em] inline-flex items-center gap-2"
            >
              <Compass className="w-3.5 h-3.5" />
              Explore &amp; News Directory
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
              Independent Sikh Scholars, Creators &amp; Media
            </h1>
            <p
              style={{ color: "var(--theme-text-muted)" }}
              className="text-sm sm:text-base leading-relaxed max-w-3xl"
            >
              Learning Sikhi doesn&apos;t end on one website. Behind every
              translation, podcast, painting, and independent report is a Sikh
              scholar, artist, or journalist dedicating years of seva to
              preserve our heritage. Explore their work, reflect on what you
              learn back on SikhStacks, and support them directly.
            </p>
          </motion.header>

          {/* Section A: Independent Sikh Scholars, Writers & Podcasts */}
          <section aria-labelledby="independent-creators-heading" className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-1">
                <p
                  style={{ color: "var(--accent-text)" }}
                  className="text-[11px] font-semibold uppercase tracking-[0.18em] inline-flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Section A
                </p>
                <h2
                  id="independent-creators-heading"
                  className="font-serif text-2xl sm:text-3xl font-bold tracking-tight"
                >
                  Independent Sikh Scholars, Writers &amp; Podcasts
                </h2>
              </div>
              <span
                style={{ color: "var(--theme-text-muted)" }}
                className="text-xs font-medium"
              >
                {INDEPENDENT_SCHOLARS_AND_CREATORS.length} featured creators
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INDEPENDENT_SCHOLARS_AND_CREATORS.map((creator) => (
                <article
                  key={creator.name}
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="rounded-xl border p-6 flex flex-col justify-between gap-5 transition-colors duration-150 hover:border-[var(--accent-primary)]"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        style={{
                          backgroundColor: "var(--bg-tertiary)",
                          borderColor: "var(--border-subtle)",
                          color: "var(--theme-text-muted)",
                        }}
                        className="rounded-md border px-2 py-0.5 text-[11px] font-medium"
                      >
                        {creator.format}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold leading-snug">
                      {creator.name}
                    </h3>

                    <p
                      style={{ color: "var(--theme-text-muted)" }}
                      className="text-sm leading-relaxed"
                    >
                      {creator.brief}
                    </p>
                  </div>

                  <div
                    className="pt-4 border-t space-y-3"
                    style={{ borderColor: "var(--border-subtle)" }}
                  >
                    <div className="space-y-1">
                      <span
                        style={{ color: "var(--theme-text-muted)" }}
                        className="block text-[10px] font-semibold uppercase tracking-[0.14em]"
                      >
                        What You&apos;ll Learn
                      </span>
                      <span
                        style={{
                          backgroundColor: "var(--bg-tertiary)",
                          borderColor: "var(--border-subtle)",
                          color: "var(--accent-text)",
                        }}
                        className="inline-block rounded-md border px-2.5 py-1 text-xs font-medium"
                      >
                        {creator.whatYoullLearn}
                      </span>
                    </div>

                    <a
                      href={creator.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: "var(--bg-tertiary)",
                        borderColor: "var(--border-subtle)",
                        color: "var(--text-primary)",
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors duration-150 hover:border-[var(--accent-primary)] hover:text-[var(--accent-text)]"
                    >
                      Visit &amp; Support
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Section B: Sikh News & Media Directory */}
          <section aria-labelledby="news-directory-heading" className="space-y-5">
            <div className="space-y-1">
              <p
                style={{ color: "var(--accent-text)" }}
                className="text-[11px] font-semibold uppercase tracking-[0.18em] inline-flex items-center gap-1.5"
              >
                <Radio className="w-3.5 h-3.5" />
                Section B
              </p>
              <h2
                id="news-directory-heading"
                className="font-serif text-2xl sm:text-3xl font-bold tracking-tight"
              >
                Sikh News &amp; Media Directory
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SIKH_NEWS_OUTLETS.map((outlet) => (
                <a
                  key={outlet.name}
                  href={outlet.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="group rounded-xl border px-4 py-3.5 flex items-center justify-between gap-3 transition-colors duration-150 hover:border-[var(--accent-primary)]"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="font-serif text-base font-bold truncate group-hover:text-[var(--accent-text)] transition-colors duration-150">
                      {outlet.name}
                    </div>
                    <span
                      style={{
                        backgroundColor: "var(--bg-tertiary)",
                        borderColor: "var(--border-subtle)",
                        color: "var(--theme-text-muted)",
                      }}
                      className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium"
                    >
                      <Globe className="w-3 h-3" />
                      {outlet.region}
                    </span>
                  </div>
                  <ArrowUpRight
                    className="w-4 h-4 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity duration-150"
                    style={{ color: "var(--accent-text)" }}
                  />
                </a>
              ))}
            </div>
          </section>

          {/* Subtle Footer Disclaimer */}
          <footer
            style={{
              borderColor: "var(--border-subtle)",
              color: "var(--theme-text-muted)",
            }}
            className="border-t pt-6 text-xs sm:text-sm leading-relaxed max-w-3xl"
          >
            Learn Sikhi is an independent educational directory. All external
            publications, podcasts, and news outlets remain the sole work of
            their respective creators. Are you a listed creator and want to
            update your description or opt out? Reach out anytime.
          </footer>
        </main>

        <Footer />
      </div>
    </MotionConfig>
  );
}
