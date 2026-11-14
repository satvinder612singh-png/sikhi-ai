"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type VeecharPillarId = "exegesis" | "granths" | "katha";

export interface VeecharEntry {
  id: string;
  numeral: string;
  pillar: VeecharPillarId;
  title: string;
  gurmukhiTitle: string;
  authorOrExpositor: string;
  era: string;
  classification: string;
  sampleGurmukhi?: string;
  sampleTranslation?: string;
  scholarlyOverview: string;
  historicalContext: string;
  keyThemes: string[];
  literatureUrl: string;
  audioUrl?: string;
  primaryResourceLabel: string;
}

const PILLARS: {
  id: VeecharPillarId;
  numeral: string;
  archivalTag: string;
  label: string;
  gurmukhiLabel: string;
  subtitle: string;
}[] = [
  {
    id: "exegesis",
    numeral: "੧",
    archivalTag: "DIVISION I • STEEKS & TEEKAS",
    label: "Gurbani Exegesis (Steeks & Teekas)",
    gurmukhiLabel: "ਗੁਰਬਾਣੀ ਟੀਕਾਕਾਰੀ ਤੇ ਸੰਥਿਆ",
    subtitle: "Grammatical, classical, and Ucharan commentaries on Sri Guru Granth Sahib Ji",
  },
  {
    id: "granths",
    numeral: "੨",
    archivalTag: "DIVISION II • CANONICAL & HISTORICAL GRANTHS",
    label: "Historical & Canonical Granths",
    gurmukhiLabel: "ਇਤਿਹਾਸਕ ਤੇ ਪ੍ਰਮਾਣਿਕ ਗ੍ਰੰਥ",
    subtitle: "Primary court compositions, canonical exegesis, and 18th–19th century chronicles",
  },
  {
    id: "katha",
    numeral: "੩",
    archivalTag: "DIVISION III • ORAL EXEGESIS ARCHIVE",
    label: "Classical Katha & Veechar Traditions",
    gurmukhiLabel: "ਲੜੀਵਾਰ ਗੁਰਬਾਣੀ ਤੇ ਇਤਿਹਾਸਕ ਕਥਾ",
    subtitle: "Oral exegesis streams of Sri Guru Granth Sahib Ji, Suraj Prakash, and Panth Prakash",
  },
];

export const VEECHAR_ENTRIES: VeecharEntry[] = [
  /* ==========================================================================
     PILLAR 1: GURBANI EXEGESIS (STEEKS & TEEKAS)
  ========================================================================== */
  {
    id: "sggs-darpan",
    numeral: "੧",
    pillar: "exegesis",
    title: "Sri Guru Granth Sahib Darpan",
    gurmukhiTitle: "ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਦਰਪਣ",
    authorOrExpositor: "Prof. Sahib Singh Ji (D.Litt.)",
    era: "1962 – 1964 CE (10 Volumes)",
    classification: "GRAMMATICAL & PHILOSOPHICAL EXEGESIS (STEEK)",
    sampleGurmukhi: "ਗੁਰਬਾਣੀ ਇਸੁ ਜਗ ਮਹਿ ਚਾਨਣੁ ਕਰਮਿ ਵਸੈ ਮਨਿ ਆਏ ॥",
    sampleTranslation:
      "Gurbani is the Divine Light in this world; by Grace, it comes to abide within the mind. (Ang 67)",
    scholarlyOverview:
      "A landmark ten-volume Punjabi Steek (word-by-word and verse-by-verse exegesis) of Sri Guru Granth Sahib Ji. Prof. Sahib Singh Ji demonstrated that Gurbani follows a rigorous, self-consistent internal grammar (Gurbani Vyakaran) where vowel inflections (Sihari, Aunkar, Dulavan) systematically distinguish case, number, and syntactic roles.",
    historicalContext:
      "Compiled over decades of painstaking linguistic research following Prof. Sahib Singh Ji's seminal 1932 treatise 'Gurbani Vyakaran'. It emancipated modern Gurbani interpretation from arbitrary allegorical guesswork by grounding meanings directly in the internal usage of the Guru Granth Sahib.",
    keyThemes: [
      "Morphological analysis of Sihari, Aunkar, and Bindee inflections in Gurmukhi",
      "Identification of the central 'Rahao' (Pause) verse as the thematic nucleus of every Shabad",
      "Rejection of superstitious interpolation in favor of Gurmat ethical monotheism",
      "Complete 10-volume Ang-by-Ang Punjabi Pada-Arth (word meanings) and Bhaav-Arth (central essence)",
    ],
    literatureUrl: "https://www.gurmatveechar.com/literature",
    primaryResourceLabel: "Read Darpan Volumes on Gurmat Veechar Literature",
  },
  {
    id: "fareedkot-wala-teeka",
    numeral: "੨",
    pillar: "exegesis",
    title: "Fareedkot Wala Teeka",
    gurmukhiTitle: "ਫ਼ਰੀਦਕੋਟ ਵਾਲਾ ਟੀਕਾ",
    authorOrExpositor: "Giani Badan Singh Ji Sekhwan & Classical Synod of Scholars",
    era: "Late 19th Century (Commissioned 1877 CE, First Published 1905–1907 CE)",
    classification: "CLASSICAL SAMPRADAYE & NIRMALA COMMENTARY",
    sampleGurmukhi: "ਸਤਿਗੁਰ ਕੀ ਬਾਣੀ ਸਤਿ ਸਤਿ ਕਰਿ ਜਾਣਹੁ ਗੁਰਸਿਖਹੁ ॥",
    sampleTranslation:
      "O GurSikhs, know that the Bani of the True Guru is True, absolutely True. (Ang 308)",
    scholarlyOverview:
      "The earliest complete multi-volume traditional commentary (Teeka) on Sri Guru Granth Sahib Ji printed in the modern era. Written in classical Braj-infused Punjabi prose, it preserves centuries-old oral exegetical lineages taught in historic Sikh Bungas and Vidyalayas around Sri Harmandir Sahib.",
    historicalContext:
      "Commissioned by Maharaja Bikram Singh of Fareedkot State in response to Ernest Trumpp's distorted 1877 colonial translation. Leading traditional scholars led by Mahant Santa Singh Ji and Giani Badan Singh Ji spent years cross-verifying manuscript traditions to produce an authoritative indigenous commentary.",
    keyThemes: [
      "Preservation of pre-colonial oral commentary traditions from Amritsar and Anandpur Bungas",
      "Contextual Utthanka (historical background narratives) introducing individual Shabads",
      "Classical philosophical terminology bridging Gurmat metaphysics and comparative Indic thought",
      "Four-volume archival editions preserved in PDF format on Gurmat Veechar",
    ],
    literatureUrl: "https://www.gurmatveechar.com/literature",
    primaryResourceLabel: "Explore Classical Teeka PDFs on Gurmat Veechar",
  },
  {
    id: "amrit-keertan-santhiya",
    numeral: "੩",
    pillar: "exegesis",
    title: "Amrit Keertan & Santhiya Resources",
    gurmukhiTitle: "ਅੰਮ੍ਰਿਤ ਕੀਰਤਨ ਪੋਥੀ ਅਤੇ ਗੁਰਬਾਣੀ ਸੰਥਿਆ",
    authorOrExpositor: "Traditional Gurbani Vidyalayas & Keertaniye Archives",
    era: "Classical to Contemporary Study Editions",
    classification: "GURBANI UCHARAN, LARIVAAR & PADCHHED STUDY GUIDES",
    sampleGurmukhi: "ਧੰਨੁ ਧੰਨੁ ਰਾਮਦਾਸ ਗੁਰੁ ਜਿਨਿ ਸਿਰਿਆ ਤਿਨੈ ਸਵਾਰਿਆ ॥",
    sampleTranslation:
      "Blessed, blessed is Guru Ram Das; He who created You, has also exalted You. (Ang 968)",
    scholarlyOverview:
      "Comprehensive textual and pedagogical manuals for learning accurate Gurbani pronunciation (Shudh Ucharan), navigating unbroken scriptural calligraphy (Larivaar Saroop) alongside separated-word study texts (Padchhed), and thematic Shabad collections organized by spiritual occasion in the Amrit Keertan Pothi.",
    historicalContext:
      "For centuries, Sikh students began their scriptural education through 'Santhiya'—sitting before a seasoned teacher to master every Vishraam (pause), nasalization (Bindee/Tippee), and half-letter (Paireen/Adhak) before attempting independent exegesis or Raag Keertan.",
    keyThemes: [
      "Vishraam (syntactic pause) placement guides preventing distortion of Gurbani meaning",
      "Transitioning smoothly from Padchhed (separated words) to traditional Larivaar manuscripts",
      "Thematic indexing of Shabads across Sri Guru Granth Sahib Ji, Sri Dasam Granth, and Bhai Gurdas Ji",
      "Sundar Gutka, Nitnem Steeks, and full Santhiya audio-text pairings",
    ],
    literatureUrl: "https://www.gurmatveechar.com/literature",
    audioUrl: "https://www.gurmatveechar.com/audio",
    primaryResourceLabel: "Access Santhiya & Pothi Archives on Gurmat Veechar",
  },

  /* ==========================================================================
     PILLAR 2: HISTORICAL & CANONICAL GRANTHS
  ========================================================================== */
  {
    id: "sri-dasam-granth",
    numeral: "੧",
    pillar: "granths",
    title: "Sri Dasam Granth Sahib",
    gurmukhiTitle: "ਸ੍ਰੀ ਦਸਮ ਗ੍ਰੰਥ ਸਾਹਿਬ",
    authorOrExpositor: "Tenth Sovereign, Sri Guru Gobind Singh Ji (Compiled by Bhai Mani Singh Ji)",
    era: "Late 17th – Early 18th Century CE (Anandpur Sahib & Damdama Sahib)",
    classification: "CANONICAL SCRIPTURE OF THE TENTH GURU",
    sampleGurmukhi: "ਚੂੰ ਕਾਰ ਅਜ਼ ਹਮਹ ਹੀਲਤੇ ਦਰ ਗੁਜ਼ਸ਼ਤ ॥ ਹਲਾਲ ਅਸਤ ਬੁਰਦਨ ਬ ਸ਼ਮਸ਼ੀਰ ਦਸਤ ॥",
    sampleTranslation:
      "When all peaceful remedies have been exhausted, it is righteous indeed to put one's hand to the hilt of the sword. (Zafarnama, Verse 22)",
    scholarlyOverview:
      "The sacred compilation of Guru Gobind Singh Ji's compositions, embodying the Saint-Soldier (Sant-Sipahi) ethos in magnificent Brajbhasha, Punjabi, Sanskritic, and Persian verse. Its hymns form a core part of daily Sikh Nitnem and the Amrit Sanskar initiation ceremony.",
    historicalContext:
      "Composed primarily at Paonta Sahib and Anandpur Sahib, and later gathered after the evacuation of Anandpur by Bhai Mani Singh Ji and Mata Sundari Ji. It pairs transcendent Nirgun devotion with fearless Bir Ras (heroic spirit) to awaken an oppressed populace into sovereign Khalsa warriors.",
    keyThemes: [
      "Jaap Sahib & Akal Ustat: 199 verses of rhythmic praise to the Formless, Invincible Creator",
      "Bachittar Natak & Chandi di Vaar: Cosmic struggle of Dharam (righteousness) over tyranny",
      "Shabad Hazare & 33 Savaiye: Pure devotion rejecting idol worship, tomb veneration, and hypocrisy",
      "Zafarnama: The Persian 'Epistle of Victory' dispatched to Mughal Emperor Aurangzeb from Dina Kangar",
    ],
    literatureUrl: "https://www.gurmatveechar.com/literature",
    audioUrl: "https://www.gurmatveechar.com/audio",
    primaryResourceLabel: "Study Sri Dasam Granth Steeks on Gurmat Veechar",
  },
  {
    id: "vaaran-bhai-gurdas",
    numeral: "੨",
    pillar: "granths",
    title: "Vaaran Bhai Gurdas Ji & Kabit Savaiye",
    gurmukhiTitle: "ਵਾਰਾਂ ਭਾਈ ਗੁਰਦਾਸ ਜੀ ਅਤੇ ਕਬਿੱਤ ਸਵੱਈਏ",
    authorOrExpositor: "Bhai Gurdas Ji (1551 – 1636 CE)",
    era: "Late 16th – Early 17th Century CE",
    classification: "CANONICAL EXEGESIS ('KUNJI' / KEY TO SRI GURU GRANTH SAHIB JI)",
    sampleGurmukhi: "ਸਤਿਗੁਰ ਨਾਨਕ ਪ੍ਰਗਟਿਆ ਮਿਟੀ ਧੁੰਧੁ ਜਗਿ ਚਾਨਣੁ ਹੋਆ ॥",
    sampleTranslation:
      "With the emergence of the True Guru Nanak, the mist of ignorance cleared and Divine Light illuminated the world. (Vaar 1, Pauri 27)",
    scholarlyOverview:
      "Comprising 40 Punjabi Vaaran (balladic odes) and 675 Brajbhasha Kabit Savaiye by Bhai Gurdas Ji—maternal nephew of Guru Amar Das Ji and the amanuensis who inscribed the original Adi Granth (Kartarpur Bir) under Guru Arjan Dev Ji in 1604 CE.",
    historicalContext:
      "Guru Arjan Dev Ji blessed Bhai Gurdas Ji's compositions as the 'Kunji' (Key) to understanding Sri Guru Granth Sahib Ji and ordained that they may be sung alongside Gurbani in Kirtan Darbars. Vaar 1 provides the earliest eyewitness-era account of Guru Nanak Dev Ji's Udasis (travels to Mecca, Baghdad, and Sumer).",
    keyThemes: [
      "First-hand historical chronicle of the first six Sikh Gurus and prominent early Gursikhs",
      "Articulation of Gurmukh vs. Manmukh ethical psychology and the primacy of Sadh Sangat",
      "Defense of Guru Hargobind Sahib Ji's Miri-Piri sovereignty ('the thorny hedge protecting the orchard')",
      "675 Kabit Savaiye exploring mystical longing (Prem Bhagti) and Naam Simran",
    ],
    literatureUrl: "https://www.gurmatveechar.com/literature",
    audioUrl: "https://www.gurmatveechar.com/audio",
    primaryResourceLabel: "Read Vaaran & Kabit Savaiye Steeks on Gurmat Veechar",
  },
  {
    id: "kalaam-bhai-nand-lal",
    numeral: "੩",
    pillar: "granths",
    title: "Kalaam Bhai Nand Lal Ji Goyaa",
    gurmukhiTitle: "ਕਲਾਮ ਭਾਈ ਨੰਦ ਲਾਲ ਜੀ 'ਗੋਯਾ'",
    authorOrExpositor: "Bhai Nand Lal Ji 'Goyaa' (1633 – 1713 CE)",
    era: "Late 17th – Early 18th Century CE (Court of Guru Gobind Singh Ji)",
    classification: "CANONICAL PERSIAN & PUNJABI MYSTICAL POETRY",
    sampleGurmukhi: "ਨਾਸਰੋ ਮਨਸੂਰ ਗੁਰੁ ਗੋਬਿੰਦ ਸਿੰਘ ॥ ਏਜ਼ਦੀ ਮਨਜ਼ੂਰ ਗੁਰੁ ਗੋਬਿੰਦ ਸਿੰਘ ॥",
    sampleTranslation:
      "Defender of the oppressed and ever-victorious is Guru Gobind Singh; Approved by the Divine Himself is Guru Gobind Singh. (Ganjnama)",
    scholarlyOverview:
      "Approved alongside Bhai Gurdas Ji's works for singing in Gurdwara Kirtan, the Persian and Punjabi works of Bhai Nand Lal Ji ('Goyaa') fuse classical Sufi poetic elegance with uncompromising Gurmat theology and devotion to the Ten Gurus.",
    historicalContext:
      "Born in Ghazni and raised in Multan as a master of Persian diplomacy, Bhai Nand Lal Ji left the Mughal imperial administration to reside in Guru Gobind Singh Ji's court at Anandpur Sahib. When he presented his work 'Bandaginama', Guru Gobind Singh Ji lovingly renamed it 'Zindaginama' (The Book of Eternal Life).",
    keyThemes: [
      "Diwan-e-Goya & Zindaginama: 61 Persian Ghazals and 510 couplets on Divine Love and humility",
      "Ganjnama ('Book of Treasure'): Poetic tributes to all Ten Sikh Gurus",
      "Jot Bigas & Tausif-o-Sana: Metaphysical treatises on the eternal light of Guru Gobind Singh Ji",
      "Tankahnama & Rehatnama: Historical records of Khalsa ethical discipline and conduct",
    ],
    literatureUrl: "https://www.gurmatveechar.com/literature",
    primaryResourceLabel: "Explore Bhai Nand Lal Ji Literature on Gurmat Veechar",
  },
  {
    id: "suraj-prakash-granth",
    numeral: "੪",
    pillar: "granths",
    title: "Sri Gur Partap Suraj Granth (Suraj Prakash)",
    gurmukhiTitle: "ਸ੍ਰੀ ਗੁਰ ਪ੍ਰਤਾਪ ਸੂਰਜ ਗ੍ਰੰਥ",
    authorOrExpositor: "Mahakavi Bhai Santokh Singh Ji (Edited with footnotes by Bhai Vir Singh Ji)",
    era: "Completed 1843 CE at Kaithal (51,829 Verse Stanzas)",
    classification: "MONUMENTAL HISTORICAL CHRONICLE OF THE TEN GURUS",
    sampleGurmukhi: "ਜਿਮ ਸੂਰਜੁ ਪ੍ਰਗਟੈ ਜਗ ਮਾਹੀ ॥ ਅੰਧਕਾਰ ਮਿਟਿ ਜਾਵਤ ਤਾਹੀ ॥",
    sampleTranslation:
      "Just as the sun rises across the world and immediately dispels all darkness, so too does the glory of the Gurus' lives.",
    scholarlyOverview:
      "Towering at over 51,000 verses in ornate Brajbhasha poetry, 'Suraj Prakash' is the most comprehensive pre-colonial biographical encyclopedia of the Ten Sikh Gurus and Baba Banda Singh Bahadur. Every afternoon in historic Gurdwaras across the world, its daily oral exposition (Suraj Prakash Katha) remains a living tradition.",
    historicalContext:
      "Mahakavi Santokh Singh Ji spent nearly two decades collecting oral testimonies, earlier Janamsakhis, Gurbilas texts, and family records across Punjab, completing the Granth in 1843 CE. In the early 20th century, Bhai Vir Singh Ji published a 14-volume critical edition with extensive historical footnotes.",
    keyThemes: [
      "Guru Nanak Prakash (2 Parts): Detailed life and dialogues (Sidh Gosht, Mecca, Baghdad) of Guru Nanak Dev Ji",
      "Twelve Raas (Zodiac Cycles): Chronicles of Guru Angad Dev Ji through Guru Tegh Bahadur Ji",
      "Six Rut (Seasons) & Two Ayan: The complete life, battles, literary court, and Khalsa creation of Guru Gobind Singh Ji",
      "14-Volume Bhai Vir Singh Ji annotated Steek archived on Gurmat Veechar",
    ],
    literatureUrl: "https://www.gurmatveechar.com/literature",
    audioUrl: "https://www.gurmatveechar.com/audio",
    primaryResourceLabel: "Access Suraj Prakash Volumes & Katha on Gurmat Veechar",
  },
  {
    id: "prachin-panth-prakash",
    numeral: "੫",
    pillar: "granths",
    title: "Sri Gur Panth Prakash (Prachin Panth Prakash)",
    gurmukhiTitle: "ਸ੍ਰੀ ਗੁਰ ਪੰਥ ਪ੍ਰਕਾਸ਼ (ਪ੍ਰਾਚੀਨ ਪੰਥ ਪ੍ਰਕਾਸ਼)",
    authorOrExpositor: "Shaheed Bhai Rattan Singh Bhangu (Grandson of Shaheed Bhai Mehtab Singh Ji)",
    era: "Completed 1841 CE",
    classification: "PRIMARY HISTORIOGRAPHY OF 18TH-CENTURY KHALSA SOVEREIGNTY",
    sampleGurmukhi: "ਹਮ ਰਾਖਤ ਪਾਤਸ਼ਾਹੀ ਦਾਵਾ ॥ ਚਾਹਿਤ ਜਗ ਮਹਿ ਖਾਲਸਾ ਲਾਵਾ ॥",
    sampleTranslation:
      "We uphold the sovereign claim to Patshahi (self-rule), and envision the Khalsa flourishing across the world.",
    scholarlyOverview:
      "The foundational primary source for 18th-century Sikh political philosophy, martyrdoms, the Dal Khalsa, and the twelve Misls. Written by Rattan Singh Bhangu—whose father Rai Singh and grandfather Mehtab Singh (who liberated Harmandir Sahib from Massa Ranghar) were direct participants in the struggle.",
    historicalContext:
      "Composed between 1809 and 1841 CE to counter biased East India Company diplomatic narratives (specifically Captain Murray's accounts) and place on permanent record how the Guru bestowed inherent sovereign authority (Patshahi) directly upon the Khalsa Panth.",
    keyThemes: [
      "Creation of the Khalsa at Anandpur Sahib and the doctrine of collective Guru-Panth sovereignty",
      "Campaigns of Baba Banda Singh Bahadur and the first sovereign Sikh coinage at Lohgarh",
      "Martyrdoms of Bhai Mani Singh Ji, Bhai Taru Singh Ji, Baba Deep Singh Ji, and Subeg Singh–Shahbaz Singh",
      "Organization of the Sarbat Khalsa, Gurmata democracy, and the rise of the Sikh Misls",
    ],
    literatureUrl: "https://www.gurmatveechar.com/literature",
    audioUrl: "https://www.gurmatveechar.com/audio",
    primaryResourceLabel: "Read Prachin Panth Prakash on Gurmat Veechar",
  },

  /* ==========================================================================
     PILLAR 3: CLASSICAL KATHA & VEECHAR TRADITIONS
  ========================================================================== */
  {
    id: "katha-maskeen-ji",
    numeral: "੧",
    pillar: "katha",
    title: "Panth Ratan Giani Sant Singh Ji Maskeen — Gurmat Veechar & Katha",
    gurmukhiTitle: "ਪੰਥ ਰਤਨ ਗਿਆਨੀ ਸੰਤ ਸਿੰਘ ਜੀ ਮਸਕੀਨ — ਗੁਰਮਤਿ ਵਿਚਾਰ",
    authorOrExpositor: "Giani Sant Singh Ji Maskeen (1934 – 2005 CE)",
    era: "50+ Years of Recorded Discourses (Alwar, Harmandir Sahib & Global Diwans)",
    classification: "PHILOSOPHICAL & THEMATIC GURBANI EXEGESIS",
    sampleGurmukhi: "ਮਨ ਤੂੰ ਜੋਤਿ ਸਰੂਪੁ ਹੈ ਆਪਣਾ ਮੂਲੁ ਪਛਾਣੁ ॥",
    sampleTranslation:
      "O my mind, you are the embodiment of the Divine Light—recognize your own true origin! (Ang 441)",
    scholarlyOverview:
      "Renowned across the Sikh world as 'Panth Ratan' (Jewel of the Panth), Giani Sant Singh Ji Maskeen delivered thousands of hours of profound, crystal-clear Gurbani Katha. Drawing fluently from Sri Guru Granth Sahib Ji, Bhai Gurdas Ji, Bhai Nand Lal Ji, Persian Sufi poetry, and comparative philosophy, his discourses illuminate the inner psychology of Haumai (ego), Naam, and household spirituality (Grihasth).",
    historicalContext:
      "His annual Rain-Sabai and morning Katha series at Manji Sahib Diwan Hall (Sri Harmandir Sahib, Amritsar) and across India and the diaspora were meticulously recorded and are preserved in full thematic collections on Gurmat Veechar.",
    keyThemes: [
      "Complete Japji Sahib, Asa Di Vaar, Sukhmani Sahib, and Anand Sahib philosophical Katha series",
      "Deep psychological analysis of the Five Thieves (Kaam, Krodh, Lobh, Moh, Ahankaar) and their transmutation",
      "Harmony of Miri-Piri, family ethics, and living in Hukam amidst modern restlessness",
      "Published books ('Guru Chintan', 'Prabhu Simran', 'Ratnagar') and 2,000+ audio discourses on Gurmat Veechar",
    ],
    literatureUrl: "https://www.gurmatveechar.com/literature",
    audioUrl: "https://www.gurmatveechar.com/audio",
    primaryResourceLabel: "Listen to Giani Sant Singh Ji Maskeen Audio Archive",
  },
  {
    id: "katha-sant-gurbachan-singh",
    numeral: "੨",
    pillar: "katha",
    title: "Sampooran Larivaar Sri Guru Granth Sahib Ji Katha — Sant Gurbachan Singh Ji",
    gurmukhiTitle: "ਸੰਪੂਰਨ ਲੜੀਵਾਰ ਕਥਾ ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ — ਸੰਤ ਗੁਰਬਚਨ ਸਿੰਘ ਜੀ",
    authorOrExpositor: "Sant Giani Gurbachan Singh Ji Khalsa (1902 – 1969 CE)",
    era: "Mid-20th Century Recorded Archival Series",
    classification: "COMPLETE ANG-BY-ANG LARIVAAR KATHA & GURBANI SANTHIYA",
    sampleGurmukhi: "ਗੁਰ ਕਾ ਸਬਦੁ ਰਤੰਨੁ ਹੈ ਹੀਰੇ ਜਿਤੁ ਜੜਾਉ ॥",
    sampleTranslation:
      "The Word of the Guru's Shabad is a jewel, studded with diamonds. (Ang 59)",
    scholarlyOverview:
      "One of the foundational recorded Ang-by-Ang (Ang 1 to 1430) oral commentaries on Sri Guru Granth Sahib Ji. This monumental archival stream preserves traditional Vidyalaya pedagogy—explaining the Raag structure, grammatical syntax, Utthanka (historical context of revelation), and multi-layered spiritual meanings of every Shabad.",
    historicalContext:
      "Taught through travelling Vidyalayas across Punjab over four decades, these recordings and the accompanying written treatise 'Gurbani Paath Darpan' serve as a primary reference for students learning traditional Gurbani Ucharan and Sampooran Katha.",
    keyThemes: [
      "Complete Ang 1–1430 sequential Larivaar Katha of Sri Guru Granth Sahib Ji",
      "Gurbani Paath Darpan: Comprehensive rules of Shudh Ucharan, Vishraam, and Raag maryada",
      "Word-by-word classical exegesis cross-referencing Sri Dasam Granth and Bhai Gurdas Ji",
      "Preserved in organized Ang-wise MP3 folders and PDF literature on Gurmat Veechar",
    ],
    literatureUrl: "https://www.gurmatveechar.com/literature",
    audioUrl: "https://www.gurmatveechar.com/audio",
    primaryResourceLabel: "Explore Sampooran Larivaar Katha Audio on Gurmat Veechar",
  },
  {
    id: "katha-suraj-panth-randhawa",
    numeral: "੩",
    pillar: "katha",
    title: "Suraj Prakash & Panth Prakash Veechar — Sant Hari Singh Randhawa & Classical Kathavachaks",
    gurmukhiTitle: "ਸੂਰਜ ਪ੍ਰਕਾਸ਼ ਅਤੇ ਪੰਥ ਪ੍ਰਕਾਸ਼ ਕਥਾ — ਸੰਤ ਹਰੀ ਸਿੰਘ ਰੰਧਾਵੇ ਵਾਲੇ",
    authorOrExpositor: "Sant Giani Hari Singh Ji Randhawa & Traditional Historical Expositors",
    era: "Contemporary & Classical Archival Recordings",
    classification: "VERSE-BY-VERSE HISTORICAL GRANTH EXPOSITION",
    sampleGurmukhi: "ਸੁਣਿ ਸਾਖੀ ਮਨਿ ਚਾਉ ਉਮਾਹਾ ॥ ਗੁਰ ਪ੍ਰਤਾਪੁ ਜਗ ਮਹਿ ਪਰਗਾਸਾ ॥",
    sampleTranslation:
      "Hearing the sacred chronicles, joy wells up in the mind as the Guru's glory illuminates the world.",
    scholarlyOverview:
      "Because historical Sikh chronicles like 'Sri Gur Partap Suraj Granth' and 'Prachin Panth Prakash' were composed in dense 19th-century Brajbhasha and Malwai-Punjabi poetic meters (Dohra, Chaupai, Savaiya, Kabit), oral Katha by trained scholars unpacks every stanza into accessible Punjabi while critically evaluating historical sources through the lens of Gurbani.",
    historicalContext:
      "Gurmat Veechar hosts complete, chapter-indexed audio recordings of Suraj Prakash Katha, Prachin Panth Prakash Veechar, and Sri Dasam Granth Katha by scholars such as Sant Hari Singh Ji Randhawa, Giani Sher Singh Ji (Ambala), and Giani Harbhajan Singh Ji Dhudike.",
    keyThemes: [
      "Line-by-line translation of Brajbhasha poetic meters into clear contemporary Punjabi",
      "Complete audio streams of Guru Nanak Prakash, 12 Raas, 6 Rut, and Prachin Panth Prakash",
      "Cross-verification of historical Sakhis against the touchstone of Sri Guru Granth Sahib Ji",
      "Direct chapter-by-chapter audio and accompanying PDF Steeks on Gurmat Veechar",
    ],
    literatureUrl: "https://www.gurmatveechar.com/literature",
    audioUrl: "https://www.gurmatveechar.com/audio",
    primaryResourceLabel: "Listen to Historical Granth Katha on Gurmat Veechar",
  },
];

const GURMUKHI_NUMERALS = ["੧", "੨", "੩", "੪"];

export function GurmatVeecharHub() {
  const [activePillar, setActivePillar] = useState<VeecharPillarId>("exegesis");
  const filteredEntries = VEECHAR_ENTRIES.filter((e) => e.pillar === activePillar);
  const [selectedEntryId, setSelectedEntryId] = useState<string>(
    VEECHAR_ENTRIES[0].id
  );

  const activeEntry =
    filteredEntries.find((e) => e.id === selectedEntryId) || filteredEntries[0];

  const handlePillarChange = (pillarId: VeecharPillarId) => {
    setActivePillar(pillarId);
    const firstInPillar = VEECHAR_ENTRIES.find((e) => e.pillar === pillarId);
    if (firstInPillar) {
      setSelectedEntryId(firstInPillar.id);
    }
  };

  return (
    <div className="space-y-10">
      {/* 1. Pillar Category Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PILLARS.map((p) => {
          const isSelected = activePillar === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePillarChange(p.id)}
              className={`group text-left p-5 rounded-2xl border transition-all duration-300 ${
                isSelected
                  ? "bg-[#1B2A20] text-[#FAF6EE] border-[#C59B27] shadow-[0_12px_30px_rgba(27,42,32,0.22)]"
                  : "bg-[#F3ECE0] text-[#171917] border-[#C59B27]/40 hover:border-[#D97706] hover:bg-[#FAF6EE]"
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-2">
                <span
                  className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
                    isSelected ? "text-[#E5C158]" : "text-[#D97706]"
                  }`}
                >
                  {p.archivalTag}
                </span>
                <span
                  lang="pa"
                  className={`font-gurmukhi text-lg font-bold px-2.5 py-0.5 rounded border ${
                    isSelected
                      ? "bg-[#121C15] border-[#C59B27]/50 text-[#E5C158]"
                      : "bg-[#FAF6EE] border-[#C59B27]/40 text-[#1B2A20]"
                  }`}
                >
                  {p.numeral}
                </span>
              </div>
              <p
                lang="pa"
                className={`text-sm font-gurmukhi ${
                  isSelected ? "text-[#E5C158]" : "text-[#D97706]"
                }`}
              >
                {p.gurmukhiLabel}
              </p>
              <h3
                className={`font-serif text-lg md:text-xl font-bold mt-0.5 ${
                  isSelected ? "text-[#FAF6EE]" : "text-[#171917]"
                }`}
              >
                {p.label}
              </h3>
              <p
                className={`text-xs mt-1.5 leading-relaxed ${
                  isSelected ? "text-[#F3ECE0]/80" : "text-[#4A554E]"
                }`}
              >
                {p.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* 2. Master-Detail Interactive Granth & Katha Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Granth / Katha Stream Selector Cards */}
        <div className="lg:col-span-5 space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#C59B27]/35 pb-2.5 px-1">
            <span className="text-xs uppercase tracking-[0.2em] text-[#D97706] font-semibold">
              ARCHIVAL CATALOGUE ({filteredEntries.length} FOLIOS)
            </span>
            <span className="text-[11px] uppercase tracking-wider text-[#4A554E]">
              SELECT TO INSPECT
            </span>
          </div>

          {filteredEntries.map((entry) => {
            const isActive = activeEntry.id === entry.id;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setSelectedEntryId(entry.id)}
                className={`w-full text-left p-5 rounded-xl border hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ${
                  isActive
                    ? "bg-[#1B2A20] text-[#FAF6EE] border-[#C59B27] shadow-[0_8px_24px_rgba(27,42,32,0.2)]"
                    : "bg-[#F3ECE0] text-[#171917] border-[#C59B27]/35 hover:border-[#C59B27]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <span
                      lang="pa"
                      className={`font-gurmukhi text-base font-bold px-2.5 py-0.5 rounded border shrink-0 ${
                        isActive
                          ? "border-[#C59B27]/50 bg-[#121C15] text-[#E5C158]"
                          : "border-[#C59B27]/40 bg-[#FAF6EE] text-[#1B2A20]"
                      }`}
                    >
                      {entry.numeral}
                    </span>
                    <div>
                      <p
                        lang="pa"
                        className={`text-base font-gurmukhi ${
                          isActive ? "text-[#E5C158]" : "text-[#D97706]"
                        }`}
                      >
                        {entry.gurmukhiTitle}
                      </p>
                      <h4
                        className={`text-base font-serif font-bold mt-0.5 ${
                          isActive ? "text-[#FAF6EE]" : "text-[#171917]"
                        }`}
                      >
                        {entry.title}
                      </h4>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded border shrink-0 ${
                      isActive
                        ? "bg-[#C59B27]/20 text-[#E5C158] border-[#C59B27]/40"
                        : "bg-[#1B2A20]/10 text-[#1B2A20] border-[#1B2A20]/20"
                    }`}
                  >
                    {entry.pillar === "exegesis"
                      ? "STEEK / TEEKA"
                      : entry.pillar === "granths"
                      ? "GRANTH"
                      : "KATHA STREAM"}
                  </span>
                </div>
                <p
                  className={`text-xs mt-2.5 pt-2 border-t ${
                    isActive
                      ? "border-[#C59B27]/25 text-[#F3ECE0]/75"
                      : "border-[#C59B27]/20 text-[#4A554E]"
                  }`}
                >
                  {entry.authorOrExpositor}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right Column: Illuminated Deep-Dive Scholarly Dossier */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeEntry.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="bg-[#1B2A20] text-[#FAF6EE] border border-[#C59B27]/50 rounded-2xl p-6 md:p-8 shadow-xl space-y-6"
            >
              {/* Header */}
              <div className="border-b border-[#C59B27]/25 pb-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E5C158] px-3 py-1 rounded border border-[#C59B27]/40 bg-[#121C15]">
                    {activeEntry.classification}
                  </span>
                  <span className="text-xs text-[#F3ECE0]/75">{activeEntry.era}</span>
                </div>

                <p
                  lang="pa"
                  className="text-xl md:text-2xl font-gurmukhi text-[#E5C158] mt-3"
                >
                  {activeEntry.gurmukhiTitle}
                </p>
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#FAF6EE] mt-1">
                  {activeEntry.title}
                </h3>
                <p className="text-xs md:text-sm text-[#F3ECE0]/85 mt-1.5">
                  <strong className="text-[#E5C158]">Author / Expositor:</strong>{" "}
                  {activeEntry.authorOrExpositor}
                </p>
              </div>

              {/* Invocation / Epigraph Quote */}
              {activeEntry.sampleGurmukhi && (
                <div className="p-4 rounded-xl bg-[#121C15] border border-[#C59B27]/35 space-y-1.5">
                  <p
                    lang="pa"
                    className="text-lg md:text-xl font-gurmukhi text-[#FAF6EE]"
                  >
                    {activeEntry.sampleGurmukhi}
                  </p>
                  {activeEntry.sampleTranslation && (
                    <p className="text-xs md:text-sm text-[#E5C158]/90 italic">
                      “{activeEntry.sampleTranslation}”
                    </p>
                  )}
                </div>
              )}

              {/* Scholarly Overview & Historical Context */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#121C15]/85 border border-[#C59B27]/25">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#E5C158] mb-1.5">
                    Scholarly Overview
                  </h4>
                  <p className="text-xs md:text-sm text-[#F3ECE0]/90 leading-relaxed">
                    {activeEntry.scholarlyOverview}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[#121C15]/85 border border-[#C59B27]/25">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#E5C158] mb-1.5">
                    Historical Provenance &amp; Context
                  </h4>
                  <p className="text-xs md:text-sm text-[#F3ECE0]/90 leading-relaxed">
                    {activeEntry.historicalContext}
                  </p>
                </div>
              </div>

              {/* Key Themes & Chapters Covered */}
              <div className="p-5 rounded-xl bg-[#121C15]/60 border border-[#C59B27]/25">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#E5C158] mb-3">
                  Key Themes, Methodology &amp; Archival Scope
                </h4>
                <ol className="space-y-2.5">
                  {activeEntry.keyThemes.map((theme, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-xs md:text-sm text-[#F3ECE0]/90 leading-relaxed"
                    >
                      <span
                        lang="pa"
                        className="font-gurmukhi text-xs font-bold text-[#E5C158] shrink-0 px-2 py-0.5 rounded border border-[#C59B27]/35 bg-[#1B2A20]"
                      >
                        {GURMUKHI_NUMERALS[idx] || "•"}
                      </span>
                      <span>{theme}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Direct Resource Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href={activeEntry.literatureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#171917] font-semibold text-xs md:text-sm hover:brightness-105 transition shadow-sm"
                >
                  {activeEntry.primaryResourceLabel} ↗
                </a>

                {activeEntry.audioUrl && (
                  <a
                    href={activeEntry.audioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#C59B27]/60 bg-[#121C15] text-[#FAF6EE] font-semibold text-xs md:text-sm hover:border-[#D97706] hover:text-[#E5C158] transition"
                  >
                    Gurmat Veechar Audio Streams ↗
                  </a>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 3. Dedicated Chapter III Attribution Footer */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#F3ECE0] border-2 border-[#C59B27]/55 shadow-parchment">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#D97706]">
              ARCHIVAL PROVENANCE • GURMAT VEECHAR DIGITAL LIBRARY
            </span>
            <p className="text-sm md:text-base text-[#171917] font-medium leading-relaxed">
              Archival Reference &amp; Primary Source Attribution: Scriptural Steeks, classical Katha audio series, and historical Granth manuscripts featured in this chapter are curated and referenced from the Gurmat Veechar digital library.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="https://www.gurmatveechar.com/literature"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B2A20] text-[#FAF6EE] border border-[#C59B27] font-semibold text-xs md:text-sm hover:bg-[#D97706] hover:text-[#171917] transition"
            >
              Gurmat Veechar Literature/PDFs ↗
            </a>
            <a
              href="https://www.gurmatveechar.com/audio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#171917] font-semibold text-xs md:text-sm hover:brightness-105 transition"
            >
              Gurmat Veechar Audio Archives ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GurmatVeecharHub;
