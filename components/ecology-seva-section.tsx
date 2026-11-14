"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EcologicalVerseCard {
  numeral: string;
  tag: string;
  citation: string;
  title: string;
  gurmukhi: string;
  transliteration: string;
  translation: string;
  reflection: string;
}

interface ActionPillar {
  id: string;
  numeral: string;
  metaTag: string;
  title: string;
  gurmukhiConcept: string;
  summary: string;
  actionablePractice: string;
  commitments: string[];
}

const SCRIPTURAL_FOUNDATIONS: EcologicalVerseCard[] = [
  {
    numeral: "੧",
    tag: "ANG 8 • JAPJI SAHIB • SALOK",
    citation: "Guru Nanak Dev Ji • Sri Guru Granth Sahib Ji, Ang 8",
    title: "Pavan Guru Pani Pita",
    gurmukhi: "ਪਵਣੁ ਗੁਰੂ ਪਾਣੀ ਪਿਤਾ ਮਾਤਾ ਧਰਤਿ ਮਹਤੁ ॥",
    transliteration: "Pavan Guru Paanee Pitaa Maataa Dharat Mahat.",
    translation:
      "Air is the Guru, Water is the Father, and Earth is the Great Mother of all.",
    reflection:
      "Revering air, water, and soil as sacred family and teacher means environmental degradation is not merely an external policy issue—it is a violation of our relationship with the Divine presence sustaining life.",
  },
  {
    numeral: "੨",
    tag: "ANG 463 • RAAG ASA • ASAA DI VAAR",
    citation: "Guru Nanak Dev Ji • Sri Guru Granth Sahib Ji, Ang 463",
    title: "The Creator Abides Within Creation",
    gurmukhi:
      "ਆਪੀਨੈ ਆਪੁ ਸਾਜਿਓ ਆਪੀਨੈ ਰਚਿਓ ਨਾਉ ॥ ਦੁਯੀ ਕੁਦਰਤਿ ਸਾਜੀਐ ਕਰਿ ਆਸਣੁ ਡਿਠੋ ਚਾਉ ॥",
    transliteration:
      "Aapeenai Aap Saajio Aapeenai Rachio Naao. Duyee Kudarat Saajeeai Kar Aasan Ditho Chaao.",
    translation:
      "He Himself created Himself, and Himself assumed the Name. Secondly, He fashioned Nature (Kudrat), and seated within it, He beholds it with delight.",
    reflection:
      "Nature (Kudrat) is the living throne of the Creator. Protecting biodiversity and addressing climate change is direct Seva (selfless service) to the Divine residence.",
  },
  {
    numeral: "੩",
    tag: "ANG 1372 & ANG 966 • SANTOKH & STEWARDSHIP",
    citation: "Bhagat Kabir Ji (Ang 1372) & Guru Arjan Dev Ji (Ang 966)",
    title: "Simplicity Over Wasteful Consumption",
    gurmukhi:
      "ਕਬੀਰ ਮਨੁ ਪੰਖੀ ਭਇਓ ਉਡਿ ਉਡਿ ਦਹ ਦਿਸ ਜਾਇ ॥ ਜੋ ਜੈਸੀ ਸੰਗਤਿ ਮਿਲੈ ਸੋ ਤੈਸੋ ਫਲੁ ਖਾਇ ॥",
    transliteration:
      "Kabeer Man Pankhee Bhaio Ud Ud Dah Dis Jaae. Jo Jaisee Sangat Milai So Taiso Phal Khaae.",
    translation:
      "Kabir, the mind has become a bird; it soars and flies in the ten directions. According to the company it keeps, so are the fruits it consumes.",
    reflection:
      "Paired with the Gurmat ethic of Santokh (contentment) and rejecting Maya-driven excess: true dignity lies in Santokh and mindful stewardship of resources rather than status-driven overconsumption.",
  },
];

const ACTION_PILLARS: ActionPillar[] = [
  {
    id: "sustainable-langar",
    numeral: "੧",
    metaTag: "COMMUNAL STEWARDSHIP • PANGAT & SEVA",
    title: "Sustainable Langar & Zero-Waste Seva",
    gurmukhiConcept: "ਲੰਗਰ ਤੇ ਸੇਵਾ",
    summary:
      "The institution of Guru ka Langar models plant-based, egalitarian nourishment for millions daily—demonstrating how collective dining can feed humanity with low ecological impact.",
    actionablePractice:
      "Eliminating single-use plastics and styrofoam in Gurdwara and community kitchens, shifting to reusable steel thaals (plates) and tumblers, composting organic kitchen prep waste, and sourcing seasonal, organic, and local produce to reduce agricultural carbon footprints.",
    commitments: [
      "Replace disposable plates, cups, and plastic water bottles with traditional stainless-steel thaals and बाटे (baate).",
      "Establish organic waste composting and greywater conservation systems in Gurdwara and household kitchens.",
      "Partner with local regenerative farms for lentils, grains, and seasonal vegetables in Langar procurement.",
    ],
  },
  {
    id: "santokh-material-life",
    numeral: "੨",
    metaTag: "ETHICAL CONSUMPTION • SANTOKH & KIRAT KARO",
    title: "Rejecting Fast Fashion & Disposability (Santokh in Material Life)",
    gurmukhiConcept: "ਸੰਤੋਖੁ ਤੇ ਕਿਰਤਿ ਕਰਨੀ",
    summary:
      "The Sikh principles of Santokh (inner contentment) and Sadaachaar (dignified simplicity) directly challenge synthetic disposable culture and exploitative global supply chains.",
    actionablePractice:
      "Moving away from non-recyclable synthetic fast fashion and exploitative garment labor. Choosing durable, natural, repairable clothing, buying second-hand or ethically made garments, and viewing every purchase through the lens of Kirat Karo (honest, non-exploitative labor).",
    commitments: [
      "Audit personal consumption through Kirat Karo: refuse goods produced through sweatshop or coerced labor.",
      "Prefer natural, biodegradable fibers (cotton, wool, linen, khadi) and repair garments rather than discarding them.",
      "Practice Santokh by decoupling personal worth from trend-driven accumulation and packaging waste.",
    ],
  },
  {
    id: "climate-stewardship-kudrat",
    numeral: "੩",
    metaTag: "PLANETARY RESTORATION • KUDRAT & SARBAT DA BHALA",
    title: "Climate Stewardship & Restoring Kudrat",
    gurmukhiConcept: "ਕੁਦਰਤਿ ਤੇ ਸਰਬੱਤ ਦਾ ਭਲਾ",
    summary:
      "Contemporary Sikh ecological initiatives—from Guru Nanak Sacred Forests (Miyawaki native afforestation) to river and watershed restoration—embody the daily prayer for Sarbat da Bhala.",
    actionablePractice:
      "Treating carbon reduction, native tree planting, energy conservation, and ethical resource allocation as daily extensions of Sarbat da Bhala (the welfare and flourishing of all beings).",
    commitments: [
      "Support and plant native high-density micro-forests (Guru Nanak Sacred Forests) to restore local biodiversity.",
      "Reduce household and institutional fossil-fuel reliance through clean energy transitions and active transit.",
      "Protect local watersheds, rivers, and soil health in memory of Guru Har Rai Ji's famous sanctuary of medicinal gardens and wildlife.",
    ],
  },
];

export function EcologySevaSection() {
  const [selectedPillarId, setSelectedPillarId] = useState<string>(
    ACTION_PILLARS[0].id
  );

  const activePillar =
    ACTION_PILLARS.find((p) => p.id === selectedPillarId) || ACTION_PILLARS[0];

  return (
    <div className="space-y-16">
      {/* ====================================================================
          A. CORE PHILOSOPHICAL FRAMING (INWARD SIMRAN, OUTWARD STEWARDSHIP)
      ==================================================================== */}
      <div className="rounded-2xl bg-[#1B2A20] text-[#FAF6EE] border border-[#C59B27]/50 p-7 md:p-10 shadow-parchment">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#E5C158] px-3 py-1 rounded-full border border-[#C59B27]/45 bg-[#121C15]">
                INWARD SIMRAN • OUTWARD STEWARDSHIP
              </span>
              <span className="h-[1px] w-12 bg-[#C59B27]/50 hidden sm:inline-block" />
              <span className="text-xs uppercase tracking-[0.2em] text-[#F3ECE0]/70">
                ETHICAL MONOTHEISM IN PRACTICE
              </span>
            </div>

            <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#FAF6EE] leading-snug">
              From Intimate Devotion to Planetary Responsibility
            </h3>

            <p className="text-sm md:text-base text-[#F3ECE0]/90 leading-relaxed">
              In Sikhi, spirituality begins as an intimate, unmediated relationship between the individual soul and{" "}
              <em className="text-[#E5C158] not-italic font-medium">Akal Purakh</em> (the Timeless One)—free from priestly intermediaries or performative ritual. Yet because the Creator is woven into every fiber of creation, Gurbani declares{" "}
              <span lang="pa" className="font-gurmukhi text-[#E5C158]">
                ਬਿਸਰਿ ਗਈ ਸਭ ਤਾਤਿ ਪਰਾਈ
              </span>{" "}
              (<em>“Bisar Gayi Sabh Taat Parayi”</em> — all estrangement and hostility have dissolved) and{" "}
              <span lang="pa" className="font-gurmukhi text-[#E5C158]">
                ਸਭੇ ਸਾਝੀਵਾਲ ਸਦਾਇਨਿ
              </span>{" "}
              (<em>“Sabhe Sanjhiwal Sadayin”</em> — all beings are equal partners in the Divine). Inner devotion therefore naturally manifests as outward care for the Earth, climate action, and ethical consumption.
            </p>
          </div>

          <div className="lg:col-span-4">
            <div className="rounded-xl bg-[#121C15] border border-[#C59B27]/40 p-6 text-center space-y-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#C59B27]">
                DAILY ARDAS BENEDICTION
              </span>
              <p lang="pa" className="text-2xl md:text-3xl font-gurmukhi text-[#E5C158]">
                ਨਾਨਕ ਨਾਮ ਚੜ੍ਹਦੀ ਕਲਾ ॥ ਤੇਰੇ ਭਾਣੇ ਸਰਬੱਤ ਦਾ ਭਲਾ ॥
              </p>
              <div className="h-[1px] w-24 bg-[#C59B27]/40 mx-auto" />
              <p className="text-xs text-[#F3ECE0]/85 italic leading-relaxed">
                “Through Naam, may the spirit remain in ever-ascending optimism; in Your Will, may there be peace and flourishing for all creation.”
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          B. SCRIPTURAL FOUNDATIONS FROM SRI GURU GRANTH SAHIB JI
      ==================================================================== */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#C59B27]/35 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D97706]">
              SECTION I • SCRIPTURAL ECOLOGY
            </span>
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#171917] mt-1">
              Scriptural Foundations from Sri Guru Granth Sahib Ji
            </h3>
          </div>
          <span className="text-xs uppercase tracking-[0.18em] text-[#4A554E]">
            THREE CANONICAL SHABAD FOLIOS
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {SCRIPTURAL_FOUNDATIONS.map((card) => (
            <article
              key={card.title}
              className="rounded-2xl bg-[#F3ECE0] border border-[#C59B27]/45 p-6 md:p-7 flex flex-col justify-between shadow-parchment"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2 border-b border-[#C59B27]/30 pb-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D97706]">
                    {card.tag}
                  </span>
                  <span
                    lang="pa"
                    className="font-gurmukhi text-xl font-bold text-[#1B2A20] px-2.5 py-0.5 rounded border border-[#C59B27]/40 bg-[#FAF6EE]"
                  >
                    {card.numeral}
                  </span>
                </div>

                <div>
                  <h4 className="text-xl font-serif font-bold text-[#171917]">
                    {card.title}
                  </h4>
                  <p className="text-xs text-[#4A554E] mt-0.5">{card.citation}</p>
                </div>

                <div className="rounded-xl bg-[#1B2A20] text-[#FAF6EE] border border-[#C59B27]/40 p-4 space-y-2">
                  <p
                    lang="pa"
                    className="text-lg md:text-xl font-gurmukhi text-[#FAF6EE] leading-relaxed"
                  >
                    {card.gurmukhi}
                  </p>
                  <p className="text-xs text-[#E5C158]/85 italic">
                    {card.transliteration}
                  </p>
                  <div className="h-[1px] w-full bg-[#C59B27]/25" />
                  <p className="text-xs md:text-sm text-[#F3ECE0] font-medium leading-relaxed">
                    “{card.translation}”
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-[#C59B27]/30">
                <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-[#1B2A20] mb-1.5">
                  Ecological &amp; Practical Reflection
                </span>
                <p className="text-xs md:text-sm text-[#4A554E] leading-relaxed">
                  {card.reflection}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* ====================================================================
          C. INTERACTIVE "LIVING GURMAT" ACTION PILLAR CARDS
      ==================================================================== */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#C59B27]/35 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D97706]">
              SECTION II • LIVING GURMAT COMMITMENTS
            </span>
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#171917] mt-1">
              Practical Daily Commitments for Conscious Living
            </h3>
          </div>
          <span className="text-xs uppercase tracking-[0.18em] text-[#4A554E]">
            SELECT ANY PILLAR TO INSPECT DAILY PRACTICES
          </span>
        </div>

        {/* 3-Card Interactive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ACTION_PILLARS.map((pillar) => {
            const isSelected = activePillar.id === pillar.id;
            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => setSelectedPillarId(pillar.id)}
                className={`text-left rounded-2xl p-6 border transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#1B2A20] text-[#FAF6EE] border-[#C59B27] shadow-[0_12px_30px_rgba(27,42,32,0.22)]"
                    : "bg-[#F3ECE0] text-[#171917] border-[#C59B27]/40 hover:border-[#D97706] hover:bg-[#FAF6EE]"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
                        isSelected ? "text-[#E5C158]" : "text-[#D97706]"
                      }`}
                    >
                      {pillar.metaTag}
                    </span>
                    <span
                      lang="pa"
                      className={`font-gurmukhi text-lg font-bold px-2.5 py-0.5 rounded border ${
                        isSelected
                          ? "border-[#C59B27]/50 bg-[#121C15] text-[#E5C158]"
                          : "border-[#C59B27]/40 bg-[#FAF6EE] text-[#1B2A20]"
                      }`}
                    >
                      {pillar.numeral}
                    </span>
                  </div>

                  <p
                    lang="pa"
                    className={`text-base font-gurmukhi ${
                      isSelected ? "text-[#E5C158]" : "text-[#D97706]"
                    }`}
                  >
                    {pillar.gurmukhiConcept}
                  </p>

                  <h4
                    className={`text-xl font-serif font-bold leading-snug ${
                      isSelected ? "text-[#FAF6EE]" : "text-[#171917]"
                    }`}
                  >
                    {pillar.title}
                  </h4>

                  <p
                    className={`text-xs md:text-sm leading-relaxed ${
                      isSelected ? "text-[#F3ECE0]/85" : "text-[#4A554E]"
                    }`}
                  >
                    {pillar.summary}
                  </p>
                </div>

                <div
                  className={`mt-5 pt-3 border-t text-xs font-semibold uppercase tracking-[0.16em] flex items-center justify-between ${
                    isSelected
                      ? "border-[#C59B27]/30 text-[#E5C158]"
                      : "border-[#C59B27]/25 text-[#1B2A20]"
                  }`}
                >
                  <span>
                    {isSelected ? "Active Practice Folio" : "Inspect Actionable Practice"}
                  </span>
                  <span>→</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Expanded Actionable Practice Detail Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePillar.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl bg-[#1B2A20] text-[#FAF6EE] border border-[#C59B27]/50 p-6 md:p-8 shadow-xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-6 space-y-3">
                <div className="flex items-center gap-3">
                  <span
                    lang="pa"
                    className="font-gurmukhi text-xl font-bold text-[#E5C158] px-3 py-0.5 rounded border border-[#C59B27]/45 bg-[#121C15]"
                  >
                    {activePillar.numeral}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#E5C158]">
                    {activePillar.metaTag}
                  </span>
                </div>

                <h4 className="text-2xl md:text-3xl font-serif font-bold text-[#FAF6EE]">
                  {activePillar.title}
                </h4>

                <div className="h-[1px] w-24 bg-[#C59B27]/45" />

                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-[#D97706] mb-1">
                    Actionable Practice
                  </span>
                  <p className="text-sm md:text-base text-[#F3ECE0]/90 leading-relaxed">
                    {activePillar.actionablePractice}
                  </p>
                </div>
              </div>

              <div className="lg:col-span-6 rounded-xl bg-[#121C15] border border-[#C59B27]/35 p-5 md:p-6 space-y-3.5">
                <span className="block text-xs font-bold uppercase tracking-[0.2em] text-[#E5C158]">
                  Concrete Household &amp; Sangat Commitments
                </span>
                <ol className="space-y-3">
                  {activePillar.commitments.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-xs md:text-sm text-[#F3ECE0]/90 leading-relaxed"
                    >
                      <span
                        lang="pa"
                        className="font-gurmukhi text-sm font-bold text-[#E5C158] shrink-0 px-2 py-0.5 rounded border border-[#C59B27]/35 bg-[#1B2A20]"
                      >
                        {idx === 0 ? "੧" : idx === 1 ? "੨" : "੩"}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default EcologySevaSection;
