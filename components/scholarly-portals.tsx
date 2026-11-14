"use client";

import React from "react";

type PortalEntry = {
  numeral: string;
  name: string;
  url: string;
  category: string;
  description: string;
  highlight: string;
  secondaryLinks?: { label: string; url: string }[];
};

const PANTHIC_PORTALS: PortalEntry[] = [
  {
    numeral: "੧",
    name: "Manglacharan (by Jvala Singh)",
    url: "https://www.manglacharan.com/",
    category: "Classical Granths & Pre-Colonial History",
    description:
      "Translations and deep literary analysis of classical Sikh historical texts including Sri Gur Pratap Suraj Granth, Panth Prakash, and Sri Dasam Granth.",
    highlight: "Read primary-source translations of 18th-century Khalsa chronicles.",
  },
  {
    numeral: "੨",
    name: "1984 Saka & Shaheed Historical Archives",
    url: "https://1984tribute.com/",
    category: "1984 Tribute, Ensaaf & Preserved NeverForget84 Archive",
    description:
      "Verified digital memorials documenting the June 1984 military assault on Sri Harmandir Sahib (Operation Blue Star), the November 1984 anti-Sikh pogroms, and biographies of Shaheeds.",
    highlight: "Eyewitness testimonies, rare photographs, and documented timelines.",
    secondaryLinks: [
      {
        label: "1984 Tribute ↗",
        url: "https://1984tribute.com/",
      },
      {
        label: "Ensaaf Archive ↗",
        url: "https://ensaaf.org/",
      },
      {
        label: "Original NeverForget84 (Wayback) ↗",
        url: "https://web.archive.org/web/20160618115353/http://www.neverforget84.com/",
      },
    ],
  },
  {
    numeral: "੩",
    name: "Bunga Azaadi",
    url: "https://www.bungaazaadi.com/",
    category: "Sikh Sovereignty, Philosophy & Ethos",
    description:
      "Platform dedicated to revitalizing indigenous Sikh political thought, Miri-Piri philosophy, anti-colonial history, and the intellectual traditions of the Khalsa.",
    highlight: "Essays, podcasts, and research on Khalsa sovereignty (Patshahi).",
  },
  {
    numeral: "੪",
    name: "SikhiToTheMax (BaniDB)",
    url: "https://www.sikhitothemax.org/",
    category: "Complete Gurbani Search & Translation Portal",
    description:
      "The gold-standard portal for searching Sri Guru Granth Sahib Ji, Sri Dasam Granth, Bhai Gurdas Ji Vaaran, and Bhai Nand Lal Ji Ghazals with word-by-word meanings.",
    highlight: "Direct Ang-by-Ang navigation and Larivaar/Padchhed toggles.",
  },
];

export default function ScholarlyPortals() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {PANTHIC_PORTALS.map((portal) => (
        <div
          key={portal.name}
          className="group p-6 rounded-2xl bg-[#F3ECE0] border border-[#C59B27]/40 hover:border-[#D97706] hover:bg-[#1B2A20] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col justify-between shadow-parchment"
        >
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#D97706] group-hover:text-[#E5C158] px-3 py-1 rounded-full bg-[#C59B27]/15 border border-[#C59B27]/30">
                {portal.numeral} · {portal.category}
              </span>
              <a
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#4A554E] group-hover:text-[#E5C158] transition"
              >
                Visit Archive ↗
              </a>
            </div>

            <h3 className="text-xl font-serif font-bold text-[#171917] group-hover:text-[#FAF6EE] transition">
              <a
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {portal.name}
              </a>
            </h3>

            <p className="text-sm text-[#4A554E] group-hover:text-[#F3ECE0]/90 mt-2 leading-relaxed">
              {portal.description}
            </p>

            {portal.secondaryLinks && (
              <div className="mt-4 flex flex-wrap gap-2">
                {portal.secondaryLinks.map((lnk) => (
                  <a
                    key={lnk.url}
                    href={lnk.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 rounded-lg bg-[#1B2A20] text-[#E5C158] border border-[#C59B27]/45 text-xs font-semibold hover:bg-[#D97706] hover:text-[#171917] transition"
                  >
                    {lnk.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 pt-3 border-t border-[#C59B27]/25 text-xs text-[#1B2A20] group-hover:text-[#E5C158] italic">
            ✦ {portal.highlight}
          </div>
        </div>
      ))}
    </div>
  );
}
