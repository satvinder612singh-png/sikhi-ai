"use client";

import React from "react";
import { ExternalLink, BookMarked, ShieldAlert,ScrollText, Globe } from "lucide-react";

const PANTHIC_PORTALS = [
  {
    name: "Manglacharan (by Jvala Singh)",
    url: "https://www.manglacharan.com/",
    category: "Classical Granths & Pre-Colonial History",
    description:
      "Translations and deep literary analysis of classical Sikh historical texts including Sri Gur Pratap Suraj Granth, Panth Prakash, and Sri Dasam Granth.",
    highlight: "Read primary-source translations of 18th-century Khalsa chronicles.",
    icon: ScrollText,
  },
  {
    name: "Never Forget 1984",
    url: "https://www.neverforget84.com/",
    category: "1984 Saka & Shaheed Archive",
    description:
      "Comprehensive digital memorial documenting the June 1984 military assault on Sri Harmandir Sahib (Operation Blue Star), the November 1984 anti-Sikh pogroms, and biographies of Shaheeds.",
    highlight: "Eyewitness testimonies, rare photographs, and documented timelines.",
    icon: ShieldAlert,
  },
  {
    name: "Bunga Azaadi",
    url: "https://www.bungaazaadi.com/",
    category: "Sikh Sovereignty, Philosophy & Ethos",
    description:
      "Platform dedicated to revitalizing indigenous Sikh political thought, Miri-Piri philosophy, anti-colonial history, and the intellectual traditions of the Khalsa.",
    highlight: "Essays, podcasts, and research on Khalsa sovereignty (Patshahi).",
    icon: BookMarked,
  },
  {
    name: "SikhiToTheMax (BaniDB)",
    url: "https://www.sikhitothemax.org/",
    category: "Complete Gurbani Search & Translation Portal",
    description:
      "The gold-standard portal for searching Sri Guru Granth Sahib Ji, Sri Dasam Granth, Bhai Gurdas Ji Vaaran, and Bhai Nand Lal Ji Ghazals with word-by-word meanings.",
    highlight: "Direct Ang-by-Ang navigation and Larivaar/Padchhed toggles.",
    icon: Globe,
  },
];

export default function ScholarlyPortals() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {PANTHIC_PORTALS.map((portal) => {
        const Icon = portal.icon;
        return (
          <a
            key={portal.name}
            href={portal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-6 rounded-2xl bg-[#0C111D] border border-slate-800 hover:border-[#D4AF37] transition-all duration-300 flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37] px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                  {portal.category}
                </span>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-[#D4AF37] transition" />
              </div>

              <h3 className="text-xl font-serif text-white group-hover:text-[#D4AF37] transition flex items-center gap-2">
                <Icon className="w-5 h-5 text-[#D4AF37]" />
                {portal.name}
              </h3>

              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                {portal.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 text-xs text-amber-200/80 italic">
              ✦ {portal.highlight}
            </div>
          </a>
        );
      })}
    </div>
  );
}