"use client";

import React, { useState, useEffect } from "react";

export interface MoolMantarAttribute {
  index: number;
  numeral: string;
  gurmukhi: string;
  transliteration: string;
  literalMeaning: string;
  etymologyAndGrammar: string;
  philosophicalDepth: string;
  crossReferenceGurmukhi: string;
  crossReferenceEnglish: string;
  crossReferenceAng: string;
}

export const MOOL_MANTAR_ATTRIBUTES: MoolMantarAttribute[] = [
  {
    index: 1,
    numeral: "੧",
    gurmukhi: "ੴ",
    transliteration: "Ik Oankaar",
    literalMeaning: "One All-Pervading Universal Creator (Indivisible Oneness)",
    etymologyAndGrammar:
      "Composed of three sacred elements: the numeral '੧' (Ik — absolute mathematical and metaphysical Unity, not merely a word that can be pluralized), 'ਓ' (Oan — the transcendent and immanent source of creation), and the extended open 'ਕਾਰ' (Kaar — the unbroken cosmic vibration extending infinitely across all existence).",
    philosophicalDepth:
      "Guru Nanak Dev Ji placed the numeral '੧' at the very threshold of Sri Guru Granth Sahib Ji to declare that the Divine is not divided by religion, caste, gender, or geography. Because there is only One Creator pervading all creation, all human beings and ecosystems are intrinsically connected.",
    crossReferenceGurmukhi: "ਏਕੁ ਪਿਤਾ ਏਕਸ ਕੇ ਹਮ ਬਾਰਿਕ ਤੂ ਮੇਰਾ ਗੁਰ ਹਾਈ ॥",
    crossReferenceEnglish:
      "The One God is our Father; we are the children of the One God. You are our Guru.",
    crossReferenceAng: "Sri Guru Granth Sahib Ji • Ang 611",
  },
  {
    index: 2,
    numeral: "੨",
    gurmukhi: "ਸਤਿ ਨਾਮੁ",
    transliteration: "Sat Naam",
    literalMeaning: "Eternal Reality Is the Divine Name & Vibration",
    etymologyAndGrammar:
      "'ਸਤਿ' (Sati, with a sihari vowel mark) derives from Sanskrit 'Satya'—that which exists across past, present, and future without decay. 'ਨਾਮੁ' (Naamu, with an aunkar mark) denotes the active, sustaining presence and cosmic law (Hukam) of the One.",
    philosophicalDepth:
      "In Gurmat, 'Naam' is not merely a spoken label; it is the conscious, living vibration of Truth that sustains every atom of the universe. Remembering Sat Naam anchors the human mind in what is permanent rather than fleeting worldly illusions.",
    crossReferenceGurmukhi: "ਆਦਿ ਸਚੁ ਜੁਗਾਦਿ ਸਚੁ ॥ ਹੈ ਭੀ ਸਚੁ ਨਾਨਕ ਹੋਸੀ ਭੀ ਸਚੁ ॥੧॥",
    crossReferenceEnglish:
      "True in the primal beginning. True throughout the ages. True here and now. O Nanak, forever and ever True.",
    crossReferenceAng: "Sri Guru Granth Sahib Ji • Ang 1",
  },
  {
    index: 3,
    numeral: "੩",
    gurmukhi: "ਕਰਤਾ ਪੁਰਖੁ",
    transliteration: "Kartaa Purakh",
    literalMeaning: "The Creative Being Pervading All Creation",
    etymologyAndGrammar:
      "'ਕਰਤਾ' (Kartaa) means the sole Doer and Fashioner of the cosmos; 'ਪੁਰਖੁ' (Purakhu — Puri + Shaya) means the Consciousness that dwells within every vessel and form.",
    philosophicalDepth:
      "Unlike deistic philosophies where a creator fashions the world and stands apart from it, 'Kartaa Purakh' reveals that the Creator is simultaneously the Architect ('Kartaa') and the immanent Soul dwelling inside every creature ('Purakh').",
    crossReferenceGurmukhi: "ਆਪੀਨੈ ਆਪੁ ਸਾਜਿਓ ਆਪੀਨੈ ਰਚਿਓ ਨਾਉ ॥ ਦੂਯੀ ਕੁਦਰਤਿ ਸਾਜੀਐ ਕਰਿ ਆਸਣੁ ਡਿਠੋ ਚਾਉ ॥",
    crossReferenceEnglish:
      "He Himself created Himself; He Himself assumed His Name. Second, He fashioned Nature (Kudrat); seated within creation, He beholds it with delight.",
    crossReferenceAng: "Sri Guru Granth Sahib Ji • Ang 463",
  },
  {
    index: 4,
    numeral: "੪",
    gurmukhi: "ਨਿਰਭਉ",
    transliteration: "Nirbhau",
    literalMeaning: "Utterly Free of Fear",
    etymologyAndGrammar:
      "Prefix 'ਨਿਰ' (Nir — without / devoid of) + 'ਭਉ' (Bhau — fear). Because there is no rival or second power outside the One ('Ik'), Akal Purakh is completely fearless.",
    philosophicalDepth:
      "When a seeker meditates on the Fearless One ('Nirbhau'), worldly anxieties, intimidation by tyrants, and fear of death dissolve: 'Nirbhau Japai Sagal Bhau Mitae' (Meditating on the Fearless One, all fear is erased).",
    crossReferenceGurmukhi: "ਭੈ ਕਾਹੂ ਕਉ ਦੇਤ ਨਹਿ ਨਹਿ ਭੈ ਮਾਨਤ ਆਨ ॥",
    crossReferenceEnglish:
      "One who does not frighten anyone, and who is not afraid of anyone else—says Nanak, call that person spiritually wise.",
    crossReferenceAng: "Sri Guru Granth Sahib Ji • Ang 1427",
  },
  {
    index: 5,
    numeral: "੫",
    gurmukhi: "ਨਿਰਵੈਰੁ",
    transliteration: "Nirvair",
    literalMeaning: "Utterly Free of Enmity, Hatred, or Rancor",
    etymologyAndGrammar:
      "Prefix 'ਨਿਰ' (Nir — without) + 'ਵੈਰੁ' (Vairu — hostility, vengeance, or prejudice). Paired directly after 'Nirbhau' because true fearlessness in Sikhi is never aggressive—it is wholly free of malice.",
    philosophicalDepth:
      "Nirbhau and Nirvair together form the ethical spine of the Khalsa Sant-Sipahi: standing fearless against injustice ('Nirbhau') while harboring zero hatred toward any human community ('Nirvair').",
    crossReferenceGurmukhi: "ਨਾ ਕੋ ਬੈਰੀ ਨਹੀ ਬਿਗਾਨਾ ਸਗਲ ਸੰਗਿ ਹਮ ਕਉ ਬਨਿ ਆਈ ॥",
    crossReferenceEnglish:
      "No one is my enemy, and no one is a stranger. I am in harmony with all creation.",
    crossReferenceAng: "Sri Guru Granth Sahib Ji • Ang 1299",
  },
  {
    index: 6,
    numeral: "੬",
    gurmukhi: "ਅਕਾਲ ਮੂਰਤਿ",
    transliteration: "Akaal Moorat",
    literalMeaning: "Timeless Embodiment Beyond Death and Decay",
    etymologyAndGrammar:
      "'ਅਕਾਲ' (A-kaal — beyond Time and Death) modifies 'ਮੂਰਤਿ' (Moorati, feminine noun with sihari — existence, reality, or form). Together they signify Reality whose existence is untouched by time.",
    philosophicalDepth:
      "Every physical statue, empire, and star is subject to 'Kaal' (time and change), whereas the Divine Reality ('Akaal Moorat') remains eternally fresh and undying.",
    crossReferenceGurmukhi: "ਤੂ ਅਕਾਲ ਪੁਰਖੁ ਨਾਹੀ ਸਿਰਿ ਕਾਲਾ ॥ ਤੂ ਪੁਰਖੁ ਅਲੇਖ ਅਗੰਮ ਨਿਰਾਲਾ ॥",
    crossReferenceEnglish:
      "You are the Timeless Primal Being; death does not hover over Your head. You are the Ineffable, Unfathomable Being.",
    crossReferenceAng: "Sri Guru Granth Sahib Ji • Ang 1038",
  },
  {
    index: 7,
    numeral: "੭",
    gurmukhi: "ਅਜੂਨੀ",
    transliteration: "Ajoonee",
    literalMeaning: "Unborn — Beyond the Cycle of Birth and Incarnation",
    etymologyAndGrammar:
      "Prefix 'ਅ' (A — not) + 'ਜੂਨੀ' (Joonee — womb, biological species, or avatar incarnation).",
    philosophicalDepth:
      "In Gurmat ontology, the Infinite Creator never shrinks into a finite biological womb or exclusive human avatar ('So Mukh Jalia Jit Kahahi Thakur Joni'). Rather, the Divine Light illuminates all beings simultaneously.",
    crossReferenceGurmukhi: "ਸੋ ਮੁਖੁ ਜਲਉ ਜਿਤੁ ਕਹਹਿ ਠਾਕੁਰੁ ਜੋਨੀ ॥੩॥",
    crossReferenceEnglish:
      "Let that mouth be scorched, which says that our Sovereign Lord is subject to birth and incarnation.",
    crossReferenceAng: "Sri Guru Granth Sahib Ji • Ang 1136",
  },
  {
    index: 8,
    numeral: "੮",
    gurmukhi: "ਸੈਭੰ",
    transliteration: "Saibhang",
    literalMeaning: "Self-Existent & Self-Illuminated",
    etymologyAndGrammar:
      "Derived from Prakrit/Sanskrit 'Svayambhu' ('ਸ੍ਵੈ' — by One's own self + 'ਭੰ' — illuminated / existent).",
    philosophicalDepth:
      "Akal Purakh was not created by any prior cause, parent, or external force; the Divine exists and radiates by Its own sovereign light.",
    crossReferenceGurmukhi: "ਥਾਪਿਆ ਨ ਜਾਇ ਕੀਤਾ ਨ ਹੋਇ ॥ ਆਪੇ ਆਪਿ ਨਿਰੰਜਨੁ ਸੋਇ ॥",
    crossReferenceEnglish:
      "He cannot be established or created by human hands; the Immaculate One is Self-Existent.",
    crossReferenceAng: "Sri Guru Granth Sahib Ji • Ang 2",
  },
  {
    index: 9,
    numeral: "੯",
    gurmukhi: "ਗੁਰ ਪ੍ਰਸਾਦਿ ॥",
    transliteration: "Gur Prasaad ||",
    literalMeaning: "Realized Through the Enlightening Grace of the Guru",
    etymologyAndGrammar:
      "'ਗੁਰ' ('Gu' — darkness of ignorance; 'Ru' — light that dispels it) + 'ਪ੍ਰਸਾਦਿ' (Prasaadi, with sihari — through grace / blessing).",
    philosophicalDepth:
      "How does a finite human mind realize this Infinite, Fearless, Timeless One? Not through pride or austere torture of the body, but through 'Gur Prasaad'—the enlightening wisdom and grace of the Shabad Guru.",
    crossReferenceGurmukhi: "ਗੁਰ ਪਰਸਾਦੀ ਬੁਝੀਐ ਤਾ ਚੂਕੈ ਮਨ ਕੀ ਭੁਖ ॥",
    crossReferenceEnglish:
      "By Guru's Grace, one comes to understand, and then the hunger of the mind is satisfied.",
    crossReferenceAng: "Sri Guru Granth Sahib Ji • Ang 141",
  },
];

export interface JapjiPauriSlide {
  pauriNumber: number; // 0 = Mool Mantar & Salok, 1..38 = Pauri 1..38, 39 = Closing Salok
  label: string;
  gurmukhiLabel: string;
  themeTitle: string;
  gurmukhiLines: string[];
  transliterationLines: string[];
  englishLines: string[];
  commentary: string;
}

const CURATED_JAPJI_PAURIS: JapjiPauriSlide[] = [
  {
    pauriNumber: 0,
    label: "Prologue • Mool Mantar & Aad Sach Salok",
    gurmukhiLabel: "ਮੂਲ ਮੰਤ੍ਰ ਅਤੇ ਆਦਿ ਸਚੁ ਸਲੋਕੁ",
    themeTitle: "The Primordial Definition of Akal Purakh",
    gurmukhiLines: [
      "ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ ॥",
      "॥ ਜਪੁ ॥",
      "ਆਦਿ ਸਚੁ ਜੁਗਾਦਿ ਸਚੁ ॥ ਹੈ ਭੀ ਸਚੁ ਨਾਨਕ ਹੋਸੀ ਭੀ ਸਚੁ ॥੧॥",
    ],
    transliterationLines: [
      "Ik Oankaar Sat Naam Kartaa Purakh Nirbhau Nirvair Akaal Moorat Ajoonee Saibhan Gur Prasaad ||",
      "|| Jap ||",
      "Aad Sach Jugaad Sach || Hai Bhee Sach Nanak Hosee Bhee Sach ||1||",
    ],
    englishLines: [
      "One Universal Creator God. The Name Is Truth. Creative Being Personified. No Fear. No Hatred. Image Of The Undying, Beyond Birth, Self-Existent. By Guru's Grace.",
      "Chant And Meditate:",
      "True In The Primal Beginning. True Throughout The Ages. True Here And Now. O Nanak, Forever And Ever True. ||1||",
    ],
    commentary:
      "The prologue of Japji Sahib establishes that Truth (Sach) is not a static dogma, but the living, timeless Reality present at the dawn of creation, here today, and forever hereafter.",
  },
  {
    pauriNumber: 1,
    label: "Pauri 1 • Sachiara & Walking in Hukam",
    gurmukhiLabel: "ਪਉੜੀ ੧ • ਕਿਵ ਸਚਿਆਰਾ ਹੋਈਐ",
    themeTitle: "Breaking the Wall of Falsehood Through Hukam",
    gurmukhiLines: [
      "ਸੋਚੈ ਸੋਚਿ ਨ ਹੋਵਈ ਜੇ ਸੋਚੀ ਲਖ ਵਾਰ ॥",
      "ਚੁਪੈ ਚੁਪ ਨ ਹੋਵਈ ਜੇ ਲਾਇ ਰਹਾ ਲਿਵ ਤਾਰ ॥",
      "ਭੁਖਿਆ ਭੁਖ ਨ ਉਤਰੀ ਜੇ ਬੰਨਾ ਪੁਰੀਆ ਭਾਰ ॥",
      "ਸਹਸ ਸਿਆਣਪਾ ਲਖ ਹੋਹਿ ਤ ਇਕ ਨ ਚਲੈ ਨਾਲਿ ॥",
      "ਕਿਵ ਸਚਿਆਰਾ ਹੋਈਐ ਕਿਵ ਕੂੜੈ ਤੁਟੈ ਪਾਲਿ ॥",
      "ਹੁਕਮੀ ਰਜਾਈ ਚਲਣਾ ਨਾਨਕ ਲਿਖਿਆ ਨਾਲਿ ॥੧॥",
    ],
    transliterationLines: [
      "Sochai soch na hova-ee je sochee lakh vaar ||",
      "Chupai chup na hova-ee je laa-e rahaa liv taar ||",
      "Bhukhiaa bhukh na utree je bannaa puree-aa bhaar ||",
      "Sahas siaanpaa lakh hohi ta ik na chalai naal ||",
      "Kiv sachiaaraa ho-ee-ai kiv koorhai tutai paal ||",
      "Hukmee rajaa-ee chalnaa Nanak likhiaa naal ||1||",
    ],
    englishLines: [
      "By ritual purification, purity cannot be achieved, even by cleansing hundreds of thousands of times.",
      "By remaining silent, inner peace is not found, even by sitting in unbroken trance.",
      "The hunger of the greedy is not appeased, even by piling up the wealth of all worlds.",
      "Even with hundreds of thousands of clever stratagems, not one goes along in the end.",
      "How then can one become truthful (Sachiara)? How can the veil of falsehood be torn away?",
      "O Nanak, by walking in harmony with the Hukam (Command) of the Sovereign Will, which is woven into our very being. ||1||",
    ],
    commentary:
      "Pauri 1 critiques four dead-ends of spiritual seeking—ritual bathing, forced silence, material accumulation, and egoic cleverness—and reveals the path of aligning one's life with Hukam.",
  },
  {
    pauriNumber: 2,
    label: "Pauri 2 • Hukamee Hovan Aakaar",
    gurmukhiLabel: "ਪਉੜੀ ੨ • ਹੁਕਮੀ ਹੋਵਨਿ ਆਕਾਰ",
    themeTitle: "Recognizing Hukam Dissolves Haumai (Ego)",
    gurmukhiLines: [
      "ਹੁਕਮੀ ਹੋਵਨਿ ਆਕਾਰ ਹੁਕਮੁ ਨ ਕਹਿਆ ਜਾਈ ॥",
      "ਹੁਕਮੀ ਹੋਵਨਿ ਜੀਅ ਹੁਕਮਿ ਮਿਲੈ ਵਡਿਆਈ ॥",
      "ਹੁਕਮੀ ਉਤਮੁ ਨੀਚੁ ਹੁਕਮਿ ਲਿਖਿ ਦੁਖ ਸੁਖ ਪਾਈਅਹਿ ॥",
      "ਇਕਨਾ ਹੁਕਮੀ ਬਖਸੀਸ ਇਕਿ ਹੁਕਮੀ ਸਦਾ ਭਵਾਈਅਹਿ ॥",
      "ਹੁਕਮੈ ਅੰਦਰਿ ਸਭੁ ਕੋ ਬਾਹਰਿ ਹੁਕਮ ਨ ਕੋਇ ॥",
      "ਨਾਨਕ ਹੁਕਮੈ ਜੇ ਬੁਝੈ ਤ ਹਉਮੈ ਕਹੈ ਨ ਕੋਇ ॥੨॥",
    ],
    transliterationLines: [
      "Hukmee hovan aakaar hukam na kahiaa jaa-ee ||",
      "Hukmee hovan jee-a hukam milai vadiaa-ee ||",
      "Hukmee utam neech hukam likh dukh sukh paa-ee-ahi ||",
      "Iknaa hukmee bakhsees ik hukmee sadaa bhavaa-ee-ahi ||",
      "Hukmai andar sabh ko baahar hukam na ko-e ||",
      "Nanak hukmai je bujhai ta ha-umai kahai na ko-e ||2||",
    ],
    englishLines: [
      "By Hukam, forms come into being; Hukam cannot be fully described.",
      "By Hukam, souls are born; by Hukam, greatness is obtained.",
      "Everyone is within Hukam; no one is outside of Hukam.",
      "O Nanak, one who truly understands Hukam never speaks in ego (Haumai). ||2||",
    ],
    commentary:
      "Pauri 2 explains that Haumai ('I am separate and in control') is the root of spiritual separation; realizing that the entire cosmos moves within One Divine Order awakens humility.",
  },
  {
    pauriNumber: 3,
    label: "Pauri 3 • Gaavai Ko Taan",
    gurmukhiLabel: "ਪਉੜੀ ੩ • ਗਾਵੈ ਕੋ ਤਾਣੁ",
    themeTitle: "The Endless Symphony of Devotees Singing the Infinite",
    gurmukhiLines: [
      "ਗਾਵੈ ਕੋ ਤਾਣੁ ਹੋਵੈ ਕਿਸੈ ਤਾਣੁ ॥ ਗਾਵੈ ਕੋ ਦਾਤਿ ਜਾਣੈ ਨੀਸਾਣੁ ॥",
      "ਗਾਵੈ ਕੋ ਗੁਣ ਵਡਿਆਈਆ ਚਾਰ ॥ ਗਾਵੈ ਕੋ ਵਿਦਿਆ ਵਿਖਮੁ ਵੀਚਾਰੁ ॥",
      "ਗਾਵੈ ਕੋ ਸਾਜਿ ਕਰੇ ਤਨੁ ਖੇਹ ॥ ਗਾਵੈ ਕੋ ਜੀਅ ਲੈ ਫਿਰਿ ਦੇਹ ॥",
      "ਦੇਦਾ ਦੇ ਲੈਦੇ ਥਕਿ ਪਾਹਿ ॥ ਜੁਗਾ ਜੁਗੰਤਰਿ ਖਾਹੀ ਖਾਹਿ ॥",
      "ਹੁਕਮੀ ਹੁਕਮੁ ਚਲਾਏ ਰਾਹੁ ॥ ਨਾਨਕ ਵਿਗਸੈ ਵੇਪਰਵਾਹੁ ॥੩॥",
    ],
    transliterationLines: [
      "Gaavai ko taan hovai kisai taan || Gaavai ko daat jaanai neesaan ||",
      "Gaavai ko gun vadiaa-ee-aa chaar || Gaavai ko vidiaa vikham veechaar ||",
      "Dedaa de laide thak paahi || Jugaa jugantar khaahee khaahi ||",
      "Hukmee hukam chalaa-e raahu || Nanak vigsai veparvaahu ||3||",
    ],
    englishLines: [
      "Some sing of His Power, who have been blessed with such strength; some sing of His Gifts as His Insignia.",
      "Some sing of His glorious virtues and beauty; some sing through deep philosophical scholarship.",
      "The Giver keeps on giving, while receivers grow weary of receiving; throughout all ages, creation subsists on His bounty.",
      "The Commander directs the path by His Hukam; O Nanak, the Carefree One blossoms forth in joy! ||3||",
    ],
    commentary:
      "Every human temperament—whether poet, philosopher, scientist, or grateful householder—praises the One according to their capacity, while the Giver's generosity never runs dry.",
  },
  {
    pauriNumber: 4,
    label: "Pauri 4 • Saachaa Saahib Saach Naa-e",
    gurmukhiLabel: "ਪਉੜੀ ੪ • ਸਾਚਾ ਸਾਹਿਬੁ ਸਾਚੁ ਨਾਇ",
    themeTitle: "Amrit Vela & the Language of Infinite Love",
    gurmukhiLines: [
      "ਸਾਚਾ ਸਾਹਿਬੁ ਸਾਚੁ ਨਾਇ ਭਾਖਿਆ ਭਾਉ ਅਪਾਰੁ ॥",
      "ਆਖਹਿ ਮੰਗਹਿ ਦੇਹਿ ਦੇਹਿ ਦਾਤਿ ਕਰੇ ਦਾਤਾਰੁ ॥",
      "ਫੇਰਿ ਕਿ ਅਗੈ ਰਖੀਐ ਜਿਤੁ ਦਿਸੈ ਦਰਬਾਰੁ ॥",
      "ਮੁਹੌ ਕਿ ਬੋਲਣੁ ਬੋਲੀਐ ਜਿਤੁ ਸੁਣਿ ਧਰੇ ਪਿਆਰੁ ॥",
      "ਅੰਮ੍ਰਿਤ ਵੇਲਾ ਸਚੁ ਨਾਉ ਵਡਿਆਈ ਵੀਚਾਰੁ ॥",
      "ਕਰਮੀ ਆਵੈ ਕਪੜਾ ਨਦਰੀ ਮੋਖੁ ਦੁਆਰੁ ॥",
      "ਨਾਨਕ ਏਵੈ ਜਾਣੀਐ ਸਭੁ ਆਪੇ ਸਚਿਆਰੁ ॥੪॥",
    ],
    transliterationLines: [
      "Saachaa saahib saach naa-e bhaakhiaa bhaa-o apaar ||",
      "Aakhahi mangahi dehi dehi daat kare daataar ||",
      "Amrit velaa sach naa-o vadiaa-ee veechaar ||",
      "Karmee aavai kaprhaa nadree mokh duaar ||",
      "Nanak evai jaanee-ai sabh aape sachiaar ||4||",
    ],
    englishLines: [
      "True is the Master, True is His Name—spoken with infinite love ('Bhaakhiaa Bhaau Apaar').",
      "In the Amrit Vela (the ambrosial hours before dawn), meditate on the True Name and contemplate His glorious greatness.",
      "By the robe of good actions and Divine Grace, the Door of Liberation is found. O Nanak, know that the True One Himself is All-in-All. ||4||",
    ],
    commentary:
      "Pauri 4 teaches that the language of the Divine Court is neither Sanskrit nor Arabic, but 'Bhaau Apaar'—boundless love—nurtured during Amrit Vela contemplation.",
  },
  {
    pauriNumber: 38,
    label: "Pauri 38 • Jat Paahaaraa Dheeraj Suniaar",
    gurmukhiLabel: "ਪਉੜੀ ੩੮ • ਜਤੁ ਪਾਹਾਰਾ ਧੀਰਜੁ ਸੁਨਿਆਰੁ",
    themeTitle: "The Spiritual Mint where the Shabad Is Coined",
    gurmukhiLines: [
      "ਜਤੁ ਪਾਹਾਰਾ ਧੀਰਜੁ ਸੁਨਿਆਰੁ ॥ ਅਹਰਣਿ ਮਤਿ ਵੇਦੁ ਹਥਿਆਰੁ ॥",
      "ਭਉ ਖਲਾ ਅਗਨਿ ਤਪ ਤਾਉ ॥ ਭਾਂਡਾ ਭਾਉ ਅੰਮ੍ਰਿਤੁ ਤਿਤੁ ਢਾਲਿ ॥",
      "ਘੜੀਐ ਸਬਦੁ ਸਚੀ ਟਕਸਾਲ ॥ ਜਿਨ ਕਉ ਨਦਰਿ ਕਰਮੁ ਤਿਨ ਕਾਰ ॥",
      "ਨਾਨਕ ਨਦਰੀ ਨਦਰਿ ਨਿਹਾਲ ॥੩੮॥",
    ],
    transliterationLines: [
      "Jat paahaaraa dheeraj suniaar || Aharan mat ved hathiaar ||",
      "Bhau khalaa agan tap taa-o || Bhaandaa bhaa-o amrit tit dhaal ||",
      "Gharhee-ai sabad sachee taksaal || Jin kau nadar karam tin kaar ||",
      "Nanak nadree nadar nihaal ||38||",
    ],
    englishLines: [
      "Let self-discipline be the furnace, and patience the goldsmith; let understanding be the anvil, and spiritual wisdom the hammer.",
      "Let reverential awe be the bellows, and inner devotion the fire; in the crucible of love, melt the Nectar of the Name.",
      "In this True Mint (Sachee Taksaal), the Word of the Shabad is coined. O Nanak, the Merciful One, by His Grace, uplifts and exalts! ||38||",
    ],
    commentary:
      "The 38th and final Pauri of Japji Sahib uses the metaphor of a royal goldsmith's mint: character, patience, wisdom, and love are the crucible in which the Shabad transforms the human mind.",
  },
  {
    pauriNumber: 39,
    label: "Concluding Salok • Pavan Guru Pani Pita",
    gurmukhiLabel: "ਸਲੋਕੁ • ਪਵਣੁ ਗੁਰੂ ਪਾਣੀ ਪਿਤਾ",
    themeTitle: "Cosmic Kinship & Fulfilling Human Purpose",
    gurmukhiLines: [
      "ਸਲੋਕੁ ॥ ਪਵਣੁ ਗੁਰੂ ਪਾਣੀ ਪਿਤਾ ਮਾਤਾ ਧਰਤਿ ਮਹਤੁ ॥",
      "ਦਿਵਸੁ ਰਾਤਿ ਦੁਇ ਦਾਈ ਦਾਇਆ ਖੇਲੈ ਸਗਲ ਜਗਤੁ ॥",
      "ਚੰਗਿਆਈਆ ਬੁਰਿਆਈਆ ਵਾਚੈ ਧਰਮੁ ਹਦੂਰਿ ॥",
      "ਕਰਮੀ ਆਪੋ ਆਪਣੀ ਕੇ ਨੇੜੈ ਕੇ ਦੂਰਿ ॥",
      "ਜਿਨੀ ਨਾਮੁ ਧਿਆਇਆ ਗਏ ਮਸਕਤਿ ਘਾਲਿ ॥",
      "ਨਾਨਕ ਤੇ ਮੁਖ ਉਜਲੇ ਕੇਤੀ ਛੁਟੀ ਨਾਲਿ ॥੧॥",
    ],
    transliterationLines: [
      "Salok || Pavan guroo paanee pitaa maataa dharat mahat ||",
      "Divas raat du-e daa-ee daa-i-aa khelai sagal jagat ||",
      "Changiaa-ee-aa buriaa-ee-aa vaachai dharam hadoor ||",
      "Karmee aapo aapanee ke nerhai ke door ||",
      "Jinee naam dhiaa-i-aa ga-e maskat ghaal ||",
      "Nanak te mukh ujale ketee chhutee naal ||1||",
    ],
    englishLines: [
      "Salok: Air is the Guru, Water is the Father, and Earth is the Great Mother.",
      "Day and night are the two nurses, in whose lap all the world is at play.",
      "Good deeds and bad deeds are read in the Presence of Righteousness; according to their own actions, some are drawn near, and some drift far.",
      "Those who have meditated on the Naam and earned their spiritual labor—O Nanak, their faces are radiant, and many more are liberated along with them! ||1||",
    ],
    commentary:
      "The concluding Salok of Japji Sahib unites cosmic ecology (Air, Water, Earth) with ethical responsibility and collective liberation ('Ketee Chhutee Naal').",
  },
];

export function MoolMantarExplorer() {
  const [mode, setMode] = useState<"mool-mantar" | "japji-pauris">("mool-mantar");
  const [attrIdx, setAttrIdx] = useState(0);

  // Dynamic Japji Sahib Pauri state (populates all Pauris from BaniDB when online, falling back to curated Pauris)
  const [pauriSlides, setPauriSlides] = useState<JapjiPauriSlide[]>(CURATED_JAPJI_PAURIS);
  const [pauriIdx, setPauriIdx] = useState(0);
  const [loadingLivePauris, setLoadingLivePauris] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadAllJapjiPauris() {
      setLoadingLivePauris(true);
      try {
        const res = await fetch("/api/banidb?baniId=2");
        const data = await res.json();
        if (!cancelled && data?.ok && Array.isArray(data.sections) && data.sections.length > 5) {
          const mapped: JapjiPauriSlide[] = data.sections.map((sec: any, idx: number) => ({
            pauriNumber: idx,
            label:
              idx === 0
                ? "Prologue • Mool Mantar & Aad Sach"
                : idx === data.sections.length - 1
                ? `Concluding Salok • Pavan Guru Pani Pita`
                : `Pauri ${idx}`,
            gurmukhiLabel: sec.gurmukhiTitle || `ਪਉੜੀ ${idx}`,
            themeTitle: `Japji Sahib — ${sec.title}`,
            gurmukhiLines: (sec.verses || []).map((v: any) => v.gurmukhiUnicode),
            transliterationLines: (sec.verses || []).map((v: any) => v.transliteration),
            englishLines: (sec.verses || []).map((v: any) => v.englishTranslation),
            commentary:
              CURATED_JAPJI_PAURIS.find((c) => c.pauriNumber === idx)?.commentary ||
              "Revealed by Guru Nanak Dev Ji on Ang 1–8 of Sri Guru Granth Sahib Ji, guiding the seeker through the stages of spiritual consciousness (Dharam Khand, Gian Khand, Saram Khand, Karam Khand, and Sach Khand).",
          }));
          setPauriSlides(mapped);
        }
      } catch {
        // Keep curated Pauris
      } finally {
        if (!cancelled) setLoadingLivePauris(false);
      }
    }
    void loadAllJapjiPauris();
    return () => {
      cancelled = true;
    };
  }, []);

  const currentAttr = MOOL_MANTAR_ATTRIBUTES[attrIdx];
  const currentPauri = pauriSlides[pauriIdx] || pauriSlides[0];

  return (
    <div className="p-6 md:p-8 rounded-2xl bg-[#1B2A20] border-2 border-[#C59B27] text-[#FAF6EE] shadow-2xl space-y-6">
      {/* Top Mode Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#C59B27]/30">
        <div>
          <span className="text-[11px] uppercase tracking-[0.22em] text-[#E5C158] font-semibold">
            MULTI-PAGE INTERACTIVE SCRIPTURE EXPLORER • ANG 1–8
          </span>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#FAF6EE] mt-0.5">
            Mool Mantar Word-by-Word &amp; Japji Sahib Pauri Reader
          </h3>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => setMode("mool-mantar")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              mode === "mool-mantar"
                ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#171917]"
                : "bg-[#121C15] text-[#FAF6EE] border border-[#C59B27]/40 hover:border-[#E5C158]"
            }`}
          >
            ੧ · Mool Mantar Breakdown (9 Slides)
          </button>
          <button
            type="button"
            onClick={() => setMode("japji-pauris")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              mode === "japji-pauris"
                ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#171917]"
                : "bg-[#121C15] text-[#FAF6EE] border border-[#C59B27]/40 hover:border-[#E5C158]"
            }`}
          >
            ੨ · Japji Sahib Pauri-by-Pauri ({pauriSlides.length} Pages)
          </button>
        </div>
      </div>

      {/* ====================================================================
          MODE 1: MOOL MANTAR WORD-BY-WORD BREAKDOWN (9 SLIDES)
      ==================================================================== */}
      {mode === "mool-mantar" && (
        <div key={`attr-${currentAttr.index}`} className="space-y-6 animate-fade-in-up">
          {/* Complete Mool Mantar Ribbon with Clickable Attribute Pills */}
          <div className="p-4 rounded-xl bg-[#121C15] border border-[#C59B27]/40">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#E5C158] font-semibold mb-2 text-center">
              Click Any Attribute of the Mool Mantar to Inspect Its Etymology &amp; Philosophy (Slide{" "}
              {attrIdx + 1} of {MOOL_MANTAR_ATTRIBUTES.length})
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {MOOL_MANTAR_ATTRIBUTES.map((attr, idx) => {
                const active = idx === attrIdx;
                return (
                  <button
                    key={attr.transliteration}
                    type="button"
                    onClick={() => setAttrIdx(idx)}
                    className={`px-3.5 py-2 rounded-xl border font-gurmukhi text-lg sm:text-xl transition ${
                      active
                        ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#171917] border-[#FAF6EE] font-bold shadow-md scale-105"
                        : "bg-[#1B2A20] text-[#FAF6EE] border-[#C59B27]/35 hover:border-[#E5C158]"
                    }`}
                  >
                    {attr.gurmukhi}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Attribute Deep-Dive Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-5 p-6 rounded-2xl bg-[#121C15] border border-[#C59B27]/50 flex flex-col justify-between text-center">
              <div className="flex items-center justify-between text-xs text-[#E5C158]">
                <span className="px-2.5 py-0.5 rounded bg-[#1B2A20] border border-[#C59B27]/40 font-bold">
                  ATTRIBUTE {currentAttr.numeral} OF ੯
                </span>
                <span>ANG 1 • JAPJI SAHIB</span>
              </div>

              <div className="my-8 space-y-2">
                <p
                  lang="pa"
                  className="font-gurmukhi text-5xl sm:text-6xl text-[#E5C158] font-bold drop-shadow"
                >
                  {currentAttr.gurmukhi}
                </p>
                <h4 className="text-2xl font-serif font-bold text-[#FAF6EE]">
                  {currentAttr.transliteration}
                </h4>
                <p className="text-sm text-[#D97706] font-semibold">
                  &ldquo;{currentAttr.literalMeaning}&rdquo;
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#1B2A20] border border-[#C59B27]/35 text-left space-y-1">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#E5C158] font-bold block">
                  Cross-Reference in Sri Guru Granth Sahib Ji ({currentAttr.crossReferenceAng})
                </span>
                <p lang="pa" className="font-gurmukhi text-base text-[#FAF6EE]">
                  {currentAttr.crossReferenceGurmukhi}
                </p>
                <p className="text-xs text-[#F3ECE0]/85 italic">
                  &ldquo;{currentAttr.crossReferenceEnglish}&rdquo;
                </p>
              </div>
            </div>

            <div className="lg:col-span-7 p-6 rounded-2xl bg-[#F3ECE0] text-[#171917] border border-[#C59B27]/50 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D97706] block mb-1">
                    Etymology &amp; Gurbani Viyakaran (Grammar)
                  </span>
                  <p className="text-sm sm:text-base leading-relaxed text-[#171917]">
                    {currentAttr.etymologyAndGrammar}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#C59B27]/35">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D97706] block mb-1">
                    Philosophical &amp; Spiritual Contemplation
                  </span>
                  <p className="text-sm sm:text-base leading-relaxed text-[#171917]">
                    {currentAttr.philosophicalDepth}
                  </p>
                </div>
              </div>

              {/* Slide Pagination Controls */}
              <div className="pt-4 border-t border-[#C59B27]/35 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setAttrIdx(
                      (prev) =>
                        (prev - 1 + MOOL_MANTAR_ATTRIBUTES.length) %
                        MOOL_MANTAR_ATTRIBUTES.length
                    )
                  }
                  className="px-4 py-2.5 rounded-xl bg-[#1B2A20] text-[#E5C158] border border-[#C59B27]/50 text-xs font-semibold uppercase tracking-wider hover:border-[#D97706] transition"
                >
                  ← Previous Attribute
                </button>
                <span className="text-xs font-bold text-[#4A554E]">
                  {attrIdx + 1} / {MOOL_MANTAR_ATTRIBUTES.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setAttrIdx((prev) => (prev + 1) % MOOL_MANTAR_ATTRIBUTES.length)
                  }
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#171917] text-xs font-bold uppercase tracking-wider hover:brightness-105 transition"
                >
                  Next Attribute →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODE 2: MULTI-PAURI JAPJI SAHIB PAGINATION (PAURI 1..38 + SALOK)
      ==================================================================== */}
      {mode === "japji-pauris" && (
        <div key={`pauri-${pauriIdx}`} className="space-y-6 animate-fade-in-up">
          {/* Top Pauri Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-[#121C15] border border-[#C59B27]/40">
            <button
              type="button"
              disabled={pauriIdx === 0}
              onClick={() => setPauriIdx((p) => Math.max(0, p - 1))}
              className="px-4 py-2 rounded-xl bg-[#1B2A20] text-[#E5C158] border border-[#C59B27]/45 text-xs font-semibold uppercase tracking-wider disabled:opacity-40 hover:border-[#D97706] transition"
            >
              ← Previous Pauri
            </button>

            <div className="flex items-center gap-2">
              <label
                htmlFor="japji-pauri-select"
                className="text-xs uppercase tracking-wider text-[#E5C158] font-semibold"
              >
                Jump to Pauri:
              </label>
              <select
                id="japji-pauri-select"
                value={pauriIdx}
                onChange={(e) => setPauriIdx(Number(e.target.value))}
                className="rounded-lg bg-[#1B2A20] text-[#FAF6EE] border border-[#C59B27]/60 px-3 py-1.5 text-xs font-semibold focus:outline-none"
              >
                {pauriSlides.map((slide, idx) => (
                  <option key={idx} value={idx}>
                    {slide.label}
                  </option>
                ))}
              </select>
              {loadingLivePauris && (
                <span className="text-[11px] text-[#E5C158]">(Loading all 38 Pauris…)</span>
              )}
            </div>

            <button
              type="button"
              disabled={pauriIdx >= pauriSlides.length - 1}
              onClick={() => setPauriIdx((p) => Math.min(pauriSlides.length - 1, p + 1))}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#171917] text-xs font-bold uppercase tracking-wider disabled:opacity-40 hover:brightness-105 transition"
            >
              Next Pauri ({pauriIdx + 1} / {pauriSlides.length}) →
            </button>
          </div>

          {/* Current Pauri Content */}
          <div className="p-6 rounded-2xl bg-[#121C15] border border-[#C59B27]/45 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#C59B27]/25">
              <div>
                <p lang="pa" className="font-gurmukhi text-lg text-[#E5C158] font-bold">
                  {currentPauri.gurmukhiLabel}
                </p>
                <h4 className="text-xl font-serif font-bold text-[#FAF6EE]">
                  {currentPauri.label} — {currentPauri.themeTitle}
                </h4>
              </div>
              <span className="text-xs px-3 py-1 rounded bg-[#1B2A20] border border-[#C59B27]/40 text-[#E5C158] font-semibold">
                Page {pauriIdx + 1} of {pauriSlides.length}
              </span>
            </div>

            <div className="space-y-4">
              {currentPauri.gurmukhiLines.map((line, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-[#1B2A20] border border-[#C59B27]/30 space-y-1.5"
                >
                  <p lang="pa" className="font-gurmukhi text-2xl text-[#FAF6EE] leading-relaxed">
                    {line}
                  </p>
                  {currentPauri.transliterationLines[i] && (
                    <p className="text-xs sm:text-sm text-[#E5C158] italic">
                      {currentPauri.transliterationLines[i]}
                    </p>
                  )}
                  {currentPauri.englishLines[i] && (
                    <p className="text-sm text-[#F3ECE0]/95 pt-1">
                      {currentPauri.englishLines[i]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-[#1B2A20]/80 border border-[#C59B27]/40">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#D97706] font-bold block mb-1">
                Pauri Veechar (Commentary)
              </span>
              <p className="text-xs sm:text-sm text-[#F3ECE0]/90 leading-relaxed">
                {currentPauri.commentary}
              </p>
            </div>

            {/* Bottom Pauri Pagination */}
            <div className="pt-3 border-t border-[#C59B27]/25 flex items-center justify-between">
              <button
                type="button"
                disabled={pauriIdx === 0}
                onClick={() => setPauriIdx((p) => Math.max(0, p - 1))}
                className="px-4 py-2 rounded-xl bg-[#1B2A20] text-[#E5C158] border border-[#C59B27]/45 text-xs font-semibold uppercase tracking-wider disabled:opacity-40"
              >
                ← Previous Pauri
              </button>
              <span className="text-xs text-[#F3ECE0]/75">
                Pauri Page {pauriIdx + 1} of {pauriSlides.length}
              </span>
              <button
                type="button"
                disabled={pauriIdx >= pauriSlides.length - 1}
                onClick={() => setPauriIdx((p) => Math.min(pauriSlides.length - 1, p + 1))}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#171917] text-xs font-bold uppercase tracking-wider disabled:opacity-40"
              >
                Next Pauri →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
