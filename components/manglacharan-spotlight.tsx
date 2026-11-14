"use client";

import React, { useState, useEffect } from "react";

export type ManglacharanPassage = {
  id: string;
  numeral: string;
  granthTitle: string;
  gurmukhiGranth: string;
  author: string;
  era: string;
  citation: string;
  episodeTitle: string;
  gurmukhiVerse: string;
  transliteration: string;
  englishTranslation: string;
  sentenceBreakdown: {
    phrase: string;
    meaning: string;
  }[];
  historicalContext: string;
  manglacharanUrl: string;
};

export const MANGLACHARAN_PASSAGES: ManglacharanPassage[] = [
  {
    id: "suraj-prakash-manglacharan",
    numeral: "੧",
    granthTitle: "Sri Gur Pratap Suraj Granth",
    gurmukhiGranth: "ਸ੍ਰੀ ਗੁਰ ਪ੍ਰਤਾਪ ਸੂਰਜ ਗ੍ਰੰਥ",
    author: "Mahakavi Bhai Santokh Singh Ji",
    era: "1843 CE • Kaithal",
    citation: "Rut 1, Chapter 1 • Opening Manglacharan",
    episodeTitle: "Invocation to the One Self-Luminous Reality & the Ten Guru-Suns",
    gurmukhiVerse:
      "ਏਕੰਕਾਰਾ ਸਤਿਗੁਰੂ ਤਿਹ ਪ੍ਰਸਾਦਿ ਸਚੁ ਹੋਇ । ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫਤਹਿ ਵਿਘਨ ਵਿਨਾਸਨ ਸੋਇ ॥",
    transliteration:
      "Ekankaaraa Satiguroo tih prasaadi sachu hoi || Vaahiguroo jee kee fatehi vighan vinaasan soi ||",
    englishTranslation:
      "Through the Grace of the One All-Pervading True Guru, Eternal Truth is realized; the Victory of Waheguru Ji is the Destroyer of all spiritual and worldly obstacles.",
    sentenceBreakdown: [
      {
        phrase: "ਏਕੰਕਾਰਾ ਸਤਿਗੁਰੂ (Ekankaaraa Satiguroo)",
        meaning:
          "The Non-Dual Universal Creator (Ik Oankar) who manifests as the True Enlightener (Satguru).",
      },
      {
        phrase: "ਤਿਹ ਪ੍ਰਸਾਦਿ ਸਚੁ ਹੋਇ (Tih prasaadi sachu hoi)",
        meaning:
          "By that Guru's Grace alone does consciousness awaken to Eternal Truth (Sach).",
      },
      {
        phrase: "ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫਤਹਿ ਵਿਘਨ ਵਿਨਾਸਨ ਸੋਇ (Vaahiguroo jee kee fatehi vighan vinaasan soi)",
        meaning:
          "The sovereign salutation 'Waheguru Ji Ki Fateh' dispels all inner darkness, doubt, and hindrance.",
      },
    ],
    historicalContext:
      "In the classical Braj Bhasha tradition expounded on Manglacharan, every historical Granth opens with a Manglacharan (auspicious invocation) anchoring the poet's intellect in Ik Oankar before narrating the history of the Gurus.",
    manglacharanUrl: "https://manglacharan.com",
  },
  {
    id: "panth-prakash-sovereignty",
    numeral: "੨",
    granthTitle: "Sri Gur Panth Prakash",
    gurmukhiGranth: "ਸ੍ਰੀ ਗੁਰ ਪੰਥ ਪ੍ਰਕਾਸ਼",
    author: "Shaheed Bhai Rattan Singh Bhangu",
    era: "1841 CE • Amritsar",
    citation: "Episode 15 • Dohra & Chaupai on Khalsa Patshahi",
    episodeTitle: "By What Right Does the Khalsa Hold Sovereignty?",
    gurmukhiVerse:
      "ਸਿੰਘਨ ਕੀ ਪਾਤਸ਼ਾਹੀ ਸਾਚੀ । ਸਤਿਗੁਰਿ ਆਪੁ ਸਿੰਘਨ ਕਉ ਦੀਨੀ ॥",
    transliteration:
      "Singhan kee Paatshaahee saachee || Satigur aapu Singhan kau deenee ||",
    englishTranslation:
      "True and eternal is the sovereignty (Patshahi) of the Singhs; the True Guru Himself bestowed this sovereign self-rule upon the Khalsa.",
    sentenceBreakdown: [
      {
        phrase: "ਸਿੰਘਨ ਕੀ ਪਾਤਸ਼ਾਹੀ ਸਾਚੀ (Singhan kee Paatshaahee saachee)",
        meaning:
          "The sovereignty of the Khalsa is not derived from any earthly emperor or treaty—it is eternally true (Saachee).",
      },
      {
        phrase: "ਸਤਿਗੁਰਿ ਆਪੁ ਸਿੰਘਨ ਕਉ ਦੀਨੀ (Satigur aapu Singhan kau deenee)",
        meaning:
          "Guru Nanak – Guru Gobind Singh Ji directly conferred spiritual and temporal autonomy upon the collective Panth.",
      },
    ],
    historicalContext:
      "When British East India Company Captain William Murray asked by what legal treaty the Sikhs claimed rule over Punjab, Bhai Rattan Singh Bhangu composed Sri Gur Panth Prakash to document that Khalsa sovereignty was granted directly by the Guru and sealed with martyrdom.",
    manglacharanUrl: "https://manglacharan.com",
  },
  {
    id: "bhai-gurdas-vaar-1-pauri-27",
    numeral: "੩",
    granthTitle: "Vaaran Bhai Gurdas Ji",
    gurmukhiGranth: "ਵਾਰਾਂ ਭਾਈ ਗੁਰਦਾਸ ਜੀ",
    author: "Bhai Gurdas Ji (First Scribe of the Adi Granth)",
    era: "Early 17th Century CE • Amritsar",
    citation: "Vaar 1, Pauri 27 • The Dawn of Guru Nanak Dev Ji",
    episodeTitle: "As the Sun Rises, the Darkness of Ignorance Vanishes",
    gurmukhiVerse:
      "ਸਤਿਗੁਰ ਨਾਨਕ ਪ੍ਰਗਟਿਆ ਮਿਟੀ ਧੁੰਧੁ ਜਗਿ ਚਾਨਣੁ ਹੋਆ । ਜਿਉ ਕਰਿ ਸੂਰਜੁ ਨਿਕਲਿਆ ਤਾਰੇ ਛਪਿ ਅੰਧੇਰੁ ਪਲੋਆ ॥",
    transliteration:
      "Satigur Nanak pragatiaa mitee dhundhu jagi chaananu hoaa || Jiu kari sooraju nikaliaa taare chhapi andheru paloaa ||",
    englishTranslation:
      "With the manifestation of the True Guru Nanak, the mist of ignorance lifted and Divine light illuminated the world—just as when the sun rises, the stars fade and darkness flees.",
    sentenceBreakdown: [
      {
        phrase: "ਸਤਿਗੁਰ ਨਾਨਕ ਪ੍ਰਗਟਿਆ ਮਿਟੀ ਧੁੰਧੁ (Satigur Nanak pragatiaa mitee dhundhu)",
        meaning:
          "When Guru Nanak Dev Ji revealed the Shabad, the fog of superstition, caste division, and hypocrisy dissolved.",
      },
      {
        phrase: "ਜਿਉ ਕਰਿ ਸੂਰਜੁ ਨਿਕਲਿਆ ਤਾਰੇ ਛਪਿ ਅੰਧੇਰੁ ਪਲੋਆ (Jiu kari sooraju nikaliaa...)",
        meaning:
          "Partial rituals and ego-driven dogmas vanished like dim stars before the radiant sun of Gurmat.",
      },
    ],
    historicalContext:
      "Blessed by Guru Arjan Dev Ji as the 'Key to Sri Guru Granth Sahib Ji' (Gurbani Da Kunji), Bhai Gurdas Ji's 40 Vaaran form the primary exegetical bridge to understanding Gurmat.",
    manglacharanUrl: "https://manglacharan.com",
  },
  {
    id: "bhai-nand-lal-ganjnama",
    numeral: "੪",
    granthTitle: "Ganjnama & Diwan-e-Goya",
    gurmukhiGranth: "ਗੰਜਨਾਮਾ ਅਤੇ ਦੀਵਾਨ-ਏ-ਗੋਯਾ",
    author: "Bhai Nand Lal Ji 'Goya' (Court Poet of Guru Gobind Singh Ji)",
    era: "1695 CE • Sri Anandpur Sahib",
    citation: "Ganjnama • Discourse on the First Sovereign Light",
    episodeTitle: "Both Worlds Are Illuminated by the Dust of Guru Nanak's Feet",
    gurmukhiVerse:
      "ਹੱਕ਼ ਹੱਕ਼ ਆਗਾਹ ਗੁਰੂ ਨਾਨਕ ਸ਼ਾਹ । ਦਰ ਦੋ ਆਲਮ ਸ਼ਾਹ ਗੁਰੂ ਨਾਨਕ ਸ਼ਾਹ ॥",
    transliteration:
      "Haqq Haqq Aagaah Guroo Nanak Shaah || Dar do aalam Shaah Guroo Nanak Shaah ||",
    englishTranslation:
      "Knower of the Supreme Truth is Sovereign Guru Nanak; King of both worlds (the temporal and the spiritual) is Sovereign Guru Nanak.",
    sentenceBreakdown: [
      {
        phrase: "ਹੱਕ਼ ਹੱਕ਼ ਆਗਾਹ (Haqq Haqq Aagaah)",
        meaning:
          "Intimately united with and fully conscious of Ultimate Reality (Haqq / Sat).",
      },
      {
        phrase: "ਦਰ ਦੋ ਆਲਮ ਸ਼ਾਹ (Dar do aalam Shaah)",
        meaning:
          "True Sovereign across both realms—Duniya (worldly ethics/Miri) and Deen (spiritual liberation/Piri).",
      },
    ],
    historicalContext:
      "Written in classical Persian at Anandpur Sahib and praised by Guru Gobind Singh Ji as part of the canonical court literature alongside Bhai Gurdas Ji's Vaaran.",
    manglacharanUrl: "https://manglacharan.com",
  },
  {
    id: "sarbloh-granth-khalsa-mahima",
    numeral: "੫",
    granthTitle: "Sri Sarbloh Granth",
    gurmukhiGranth: "ਸ੍ਰੀ ਸਰਬਲੋਹ ਗ੍ਰੰਥ",
    author: "Tenth Master's Classical Corpus",
    era: "1699 CE • Sri Anandpur Sahib",
    citation: "Khalsa Mahima • Praises of the Sovereign Khalsa",
    episodeTitle: "The Khalsa Is My Very Own Form",
    gurmukhiVerse:
      "ਖਾਲਸਾ ਮੇਰੋ ਰੂਪ ਹੈ ਖਾਸ । ਖਾਲਸੇ ਮਹਿ ਹੌ ਕਰੌ ਨਿਵਾਸ ॥ ਖਾਲਸਾ ਮੇਰੋ ਮੁਖ ਹੈ ਅੰਗਾ । ਖਾਲਸੇ ਕੇ ਹੌ ਸਦ ਸਦ ਸੰਗਾ ॥",
    transliteration:
      "Khaalsaa mero roop hai khaas || Khaalse mahi hau karau nivaas || Khaalsaa mero mukh hai angaa || Khaalse ke hau sad sad sangaa ||",
    englishTranslation:
      "The Khalsa is My very own special form; within the Khalsa I eternally abide. The Khalsa is My countenance and My limbs; I am forever and ever with the Khalsa.",
    sentenceBreakdown: [
      {
        phrase: "ਖਾਲਸਾ ਮੇਰੋ ਰੂਪ ਹੈ ਖਾਸ (Khaalsaa mero roop hai khaas)",
        meaning:
          "The collective, disciplined Sadh Sangat living in Gurmat Rehit is the living embodiment of the Guru's mission.",
      },
      {
        phrase: "ਖਾਲਸੇ ਮਹਿ ਹੌ ਕਰੌ ਨਿਵਾਸ (Khaalse mahi hau karau nivaas)",
        meaning:
          "After 1699 and 1708, the Guru's physical leadership resides in the Guru Khalsa Panth guided by Sri Guru Granth Sahib Ji.",
      },
    ],
    historicalContext:
      "This foundational passage defines the doctrine of 'Guru Panth'—explaining how Guru Gobind Singh Ji dissolved the boundary between teacher and disciple (*Aape Gur Chela*).",
    manglacharanUrl: "https://manglacharan.com",
  },
  {
    id: "suraj-prakash-adi-granth-prakash",
    numeral: "੬",
    granthTitle: "Sri Gur Pratap Suraj Granth",
    gurmukhiGranth: "ਸ੍ਰੀ ਗੁਰ ਪ੍ਰਤਾਪ ਸੂਰਜ ਗ੍ਰੰਥ (ਰਾਸਿ ੩)",
    author: "Mahakavi Bhai Santokh Singh Ji",
    era: "1843 CE • Raas 3 (Guru Arjan Dev Ji)",
    citation: "Raas 3 • First Prakash of the Adi Granth (1604 CE)",
    episodeTitle: "Why Guru Arjan Dev Ji Slept on the Floor Below the Granth",
    gurmukhiVerse:
      "ਸ੍ਰੀ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜਬ ਭਯੋ ਤਿਆਰ । ਧਰਯੋ ਹਰਿਮੰਦਰ ਮਧਿ ਉਦਾਰ ॥ ਬਾਬਾ ਬੁੱਢਾ ਜੀ ਗ੍ਰੰਥੀ ਥਾਪੇ । ਪ੍ਰਥਮ ਪ੍ਰਕਾਸ਼ ਕੀਨੋ ਗੁਰ ਆਪੇ ॥",
    transliteration:
      "Sri Granth Sahib jab bhayo tiaar || Dharyo Harimandar madhi udaar || Baabaa Buddhaa Jee Granthee thaape || Pratham prakaash keeno Gur aape ||",
    englishTranslation:
      "When the sacred volume of Sri Granth Sahib was completed, the Guru installed it within the heart of Sri Harmandir Sahib, appointed Baba Buddha Ji as the first Granthi, and bowed before the Sabad-Guru.",
    sentenceBreakdown: [
      {
        phrase: "ਧਰਯੋ ਹਰਿਮੰਦਰ ਮਧਿ ਉਦਾਰ (Dharyo Harimandar madhi udaar)",
        meaning:
          "Installed at the center of the four-doored Harimandir Sahib, open to all humanity without caste exclusion.",
      },
      {
        phrase: "ਬਾਬਾ ਬੁੱਢਾ ਜੀ ਗ੍ਰੰਥੀ ਥਾਪੇ (Baabaa Buddhaa Jee Granthee thaape)",
        meaning:
          "Venerable Baba Buddha Ji opened the first Hukamnama ('Santa Ke Karaj Aap Khaloya') in Bhadon 1604 CE.",
      },
    ],
    historicalContext:
      "Suraj Prakash records that Guru Arjan Dev Ji placed the Adi Granth on the elevated throne while sitting and sleeping on the floor below—demonstrating that the Bani is higher than even the Guru's physical body.",
    manglacharanUrl: "https://manglacharan.com",
  },
  {
    id: "prem-sumarag-compassion-seva",
    numeral: "੭",
    granthTitle: "Prem Sumarag Granth",
    gurmukhiGranth: "ਪ੍ਰੇਮ ਸੁਮਾਰਗ ਗ੍ਰੰਥ",
    author: "Puratan Khalsa Rehit & Ethical Treatise",
    era: "Early 18th Century CE",
    citation: "Chapter I • Spiritual & Social Way of the Khalsa",
    episodeTitle: "Never Turn Away the Hungry or the Oppressed",
    gurmukhiVerse:
      "ਜੋ ਕੋਈ ਅਭਿਆਗਤੁ ਆਵੈ, ਤਿਸੁ ਪ੍ਰਸ਼ਾਦੁ ਛਕਾਵਣਾ । ਸਰਬੱਤ ਦੇ ਭਲੇ ਕੀ ਅਰਦਾਸਿ ਕਰਨੀ ॥",
    transliteration:
      "Jo koee abhiaagatu aavai, tisu prashaadu chhakaavanaa || Sarbat de bhale kee ardaasi karanee ||",
    englishTranslation:
      "Whoever arrives at your door in need or hunger, share your blessed food with them first; and in every breath, pray for the welfare of all creation (Sarbat Da Bhala).",
    sentenceBreakdown: [
      {
        phrase: "ਜੋ ਕੋਈ ਅਭਿਆਗਤੁ ਆਵੈ (Jo koee abhiaagatu aavai)",
        meaning:
          "Any traveler, stranger, or needy soul who approaches the Sikh household or Gurdwara.",
      },
      {
        phrase: "ਸਰਬੱਤ ਦੇ ਭਲੇ ਕੀ ਅਰਦਾਸਿ ਕਰਨੀ (Sarbat de bhale kee ardaasi karanee)",
        meaning:
          "True devotion is never sectarian—it seeks the flourishing and dignity of all beings.",
      },
    ],
    historicalContext:
      "Prem Sumarag ('The Supreme Path of Love') preserves early 18th-century Sikh social ethics, emphasizing unconditional hospitality, gender dignity, and remembrance of Akal Purakh.",
    manglacharanUrl: "https://manglacharan.com",
  },
  {
    id: "panth-prakash-bota-singh",
    numeral: "੮",
    granthTitle: "Sri Gur Panth Prakash",
    gurmukhiGranth: "ਸ੍ਰੀ ਗੁਰ ਪੰਥ ਪ੍ਰਕਾਸ਼ (ਭਾਈ ਰਤਨ ਸਿੰਘ ਭੰਗੂ)",
    author: "Shaheed Bhai Rattan Singh Bhangu",
    era: "1841 CE • Episode 78 (1739 CE)",
    citation: "Episode 78 • Martyrdom of Bhai Bota Singh & Bhai Garja Singh",
    episodeTitle: "Two Singhs Proclaim Khalsa Sovereignty on the Royal Highway",
    gurmukhiVerse:
      "ਚਿੱਠੀ ਲਿਖੀ ਸਿੰਘ ਬੋਤੇ ਹੱਥ । ਭਾਬੀ ਖਾਲਸਾ ਜੀਹਾਂ ਹੈ ਨੱਥ ॥ ਆਨਾ ਲਾਯਾ ਗੱਡੇ ਨੂੰ ਪੈਸਾ ਲਾਯਾ ਖੋਤੇ ॥",
    transliteration:
      "Chitthee likhee Singh Bote hatth || Bhaabee Khaalsaa jeehaan hai natth || Aanaa laayaa gadde noo paisaa laayaa khote ||",
    englishTranslation:
      "Bhai Bota Singh wrote a letter with his own hand to the Governor of Lahore: 'The Khalsa stands sovereign right here, levying one anna per cart and one paisa per donkey!'",
    sentenceBreakdown: [
      {
        phrase: "ਚਿੱਠੀ ਲਿਖੀ ਸਿੰਘ ਬੋਤੇ ਹੱਥ (Chitthee likhee Singh Bote hatth)",
        meaning:
          "Refusing to hide when the state claimed all Sikhs had been eliminated, Bhai Bota Singh openly notified the Mughal Viceroy.",
      },
      {
        phrase: "ਆਨਾ ਲਾਯਾ ਗੱਡੇ ਨੂੰ ਪੈਸਾ ਲਾਯਾ ਖੋਤੇ (Aanaa laayaa gadde noo...)",
        meaning:
          "Collecting sovereign tax on the Grand Trunk Road was a symbolic declaration that tyrannical rule was illegitimate.",
      },
    ],
    historicalContext:
      "Standing back-to-back with simple wooden staffs (Sothas) at Sarai Nurdin in 1739, Bhai Bota Singh and Bhai Garja Singh proved that Khalsa sovereignty lives as long as even two Singhs stand in Chardi Kala.",
    manglacharanUrl: "https://manglacharan.com",
  },
  {
    id: "nanak-parkash-bein-river",
    numeral: "੯",
    granthTitle: "Sri Nanak Parkash (Purvardh)",
    gurmukhiGranth: "ਸ੍ਰੀ ਨਾਨਕ ਪ੍ਰਕਾਸ਼",
    author: "Mahakavi Bhai Santokh Singh Ji",
    era: "1823 CE • Amritsar / Kaithal",
    citation: "Purvardh, Chapter 36 • Revelation at the Kali Bein River",
    episodeTitle: "There Is No Hindu, There Is No Musalman—All Belong to the One",
    gurmukhiVerse:
      "ਵੇਈਂ ਪ੍ਰਵੇਸ਼ ਕੀਨੋ ਜਗਦੀਸ਼ । ਤੀਨ ਦਿਵਸ ਬੀਤੇ ਬਖਸ਼ੀਸ਼ ॥ ਪ੍ਰਗਟ ਭਏ ਮੁਖ ਬਚਨ ਉਚਾਰਾ । ਏਕ ਪਿਤਾ ਏਕਸ ਕੇ ਬਾਰਾ ॥",
    transliteration:
      "Vee-een pravesh keeno Jagdeesh || Teen divas beete bakhsheesh || Pragat bhae mukh bachan uchaaraa || Ek pitaa ekas ke baaraa ||",
    englishTranslation:
      "Entering the waters of the Bein River in Sultanpur Lodhi, after three days of communion with the Supreme Lord, Guru Nanak Dev Ji emerged proclaiming: 'We are all children of the One Creator!'",
    sentenceBreakdown: [
      {
        phrase: "ਵੇਈਂ ਪ੍ਰਵੇਸ਼ ਕੀਨੋ ਜਗਦੀਸ਼ (Vee-een pravesh keeno Jagdeesh)",
        meaning:
          "Immersion in the Kali Bein at Sultanpur Lodhi marks the formal commencement of Guru Nanak Dev Ji's world Udasis.",
      },
      {
        phrase: "ਏਕ ਪਿਤਾ ਏਕਸ ਕੇ ਬਾਰਾ (Ek pitaa ekas ke baaraa)",
        meaning:
          "Transcending external religious labels that divide humanity, Guru Nanak called everyone back to universal kinship and inner truth.",
      },
    ],
    historicalContext:
      "Completed in 1823 as the first part of the Suraj Prakash project, Sri Nanak Parkash is the most comprehensive poetic biography of Guru Nanak Dev Ji.",
    manglacharanUrl: "https://manglacharan.com",
  },
  {
    id: "gurbilas-miri-piri",
    numeral: "੧੦",
    granthTitle: "Gurbilas Patshahi Chhevin",
    gurmukhiGranth: "ਗੁਰਬਿਲਾਸ ਪਾਤਸ਼ਾਹੀ ੬",
    author: "Classical Sikh Historical Tradition",
    era: "1606 CE • Sri Akal Takhat Sahib, Amritsar",
    citation: "Chapter on the Foundation of Sri Akal Takhat Sahib",
    episodeTitle: "The Twin Swords of Miri and Piri",
    gurmukhiVerse:
      "ਦੋ ਤਲਵਾਰਾਂ ਬੱਧੀਆਂ ਇੱਕ ਮੀਰੀ ਦੀ ਇੱਕ ਪੀਰੀ ਦੀ । ਇੱਕ ਅਜ਼ਮਤ ਦੀ ਇੱਕ ਪਾਤਸ਼ਾਹੀ ਦੀ, ਇੱਕ ਰਾਖੀ ਕਰੇ ਵਜ਼ੀਰੀ ਦੀ ॥",
    transliteration:
      "Do talvaaraan baddheeaan ikk Meeree dee ikk Peeree dee || Ikk azmat dee ikk paatshaahee dee, ikk raakhee kare vazeeree dee ||",
    englishTranslation:
      "Two swords were donned by the Sixth Master—one of Piri (spiritual wisdom) and one of Miri (temporal justice)—so that Saintliness directly protects the oppressed.",
    sentenceBreakdown: [
      {
        phrase: "ਇੱਕ ਮੀਰੀ ਦੀ ਇੱਕ ਪੀਰੀ ਦੀ (Ikk Meeree dee ikk Peeree dee)",
        meaning:
          "In Gurmat, spirituality (Piri) is never divorced from social responsibility and justice (Miri).",
      },
      {
        phrase: "ਇੱਕ ਰਾਖੀ ਕਰੇ ਵਜ਼ੀਰੀ ਦੀ (Ikk raakhee kare vazeeree dee)",
        meaning:
          "Temporal power in Sikhi exists solely as a shield for righteousness (Dharam) and the defenseless.",
      },
    ],
    historicalContext:
      "Following the martyrdom of Guru Arjan Dev Ji in 1606, Guru Hargobind Sahib Ji constructed Sri Akal Takhat Sahib facing Sri Harmandir Sahib, uniting meditation with sovereign justice.",
    manglacharanUrl: "https://manglacharan.com",
  },
  {
    id: "bhai-gurdas-sadh-sangat",
    numeral: "੧੧",
    granthTitle: "Vaaran Bhai Gurdas Ji",
    gurmukhiGranth: "ਵਾਰਾਂ ਭਾਈ ਗੁਰਦਾਸ ਜੀ",
    author: "Bhai Gurdas Ji",
    era: "Early 17th Century CE",
    citation: "Vaar 6, Pauri 19 • Philosophy of Gurmukh Seva",
    episodeTitle: "Like the Tree That Gives Fruit to Those Who Cast Stones",
    gurmukhiVerse:
      "ਵਿਰਲੇ ਕੇਈ ਗੁਰਮੁਖਿ ਜਾਣਨਿ । ਵੱਟੇ ਮਾਰਨਿ ਫਲੁ ਦੇਨਿ, ਪਰਉਪਕਾਰੀ ਸਤਿਗੁਰੁ ਭਾਵਨਿ ॥",
    transliteration:
      "Virale ke-ee Gurmukhi jaanani || Vatte maarani phalu deni, paraupakaaree Satiguru bhaavani ||",
    englishTranslation:
      "Rare are the Gurmukhs who realize this truth: like the fruit-bearing tree that offers sweet fruit even to those who cast stones at it, the selfless altruist is beloved to the True Guru.",
    sentenceBreakdown: [
      {
        phrase: "ਵੱਟੇ ਮਾਰਨਿ ਫਲੁ ਦੇਨਿ (Vatte maarani phalu deni)",
        meaning:
          "Responding to hostility with grace, patience, and service rather than egoic retaliation.",
      },
      {
        phrase: "ਪਰਉਪਕਾਰੀ ਸਤਿਗੁਰੁ ਭਾਵਨਿ (Paraupakaaree Satiguru bhaavani)",
        meaning:
          "Paraupkar (selfless benevolence toward others) is the highest mark of a Gurmukh.",
      },
    ],
    historicalContext:
      "Bhai Gurdas Ji uses ecological metaphors—trees, rivers, sandalwood, and rain—to illustrate how a Sikh walks in the world with humility and generosity.",
    manglacharanUrl: "https://manglacharan.com",
  },
  {
    id: "bhai-nand-lal-zindaginama",
    numeral: "੧੨",
    granthTitle: "Zindaginama (Bandginama)",
    gurmukhiGranth: "ਜ਼ਿੰਦਗੀਨਾਮਾ (ਭਾਈ ਨੰਦ ਲਾਲ ਜੀ)",
    author: "Bhai Nand Lal Ji 'Goya'",
    era: "1695 CE • Sri Anandpur Sahib",
    citation: "Couplet 12 • The Book of True Living",
    episodeTitle: "A Breath Without Remembrance Is No Life at All",
    gurmukhiVerse:
      "ਹਰ ਨਫ਼ਸ ਕੂ ਬੇ-ਯਾਦ-ਇ-ਹੱਕ਼ ਬਰ ਮੀ ਰਵਦ । ਆਂ ਨਫ਼ਸ ਬੇਹੂਦਾ ਵ ਬੇ-ਫ਼ਰ ਮੀ ਰਵਦ ॥",
    transliteration:
      "Har nafas koo be-yaad-i-Haqq bar mee ravad || Aan nafas behoodaa va be-far mee ravad ||",
    englishTranslation:
      "Every single breath that passes without the remembrance of the Divine Truth passes in vain, stripped of radiance and purpose.",
    sentenceBreakdown: [
      {
        phrase: "ਹਰ ਨਫ਼ਸ ਕੂ ਬੇ-ਯਾਦ-ਇ-ਹੱਕ਼ (Har nafas koo be-yaad-i-Haqq)",
        meaning:
          "Each inhalation and exhalation (Swas-Giras) that is disconnected from Naam Simran.",
      },
      {
        phrase: "ਬੇਹੂਦਾ ਵ ਬੇ-ਫ਼ਰ ਮੀ ਰਵਦ (Behoodaa va be-far mee ravad)",
        meaning:
          "When we originally titled this work 'Bandginama' (Book of Meditation), Guru Gobind Singh Ji renamed it 'Zindaginama' (Book of True Life)—because Simran IS life.",
      },
    ],
    historicalContext:
      "Guru Gobind Singh Ji personally blessed Bhai Nand Lal Ji's Persian couplets, changing its title from Bandginama to Zindaginama to teach that remembrance of Waheguru is the essence of living.",
    manglacharanUrl: "https://manglacharan.com",
  },
];

export function ManglacharanSpotlight() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBreakdown, setShowBreakdown] = useState(true);

  // Randomize passage on client mount so every visit/refresh reveals a fresh classical passage
  useEffect(() => {
    const randomIdx = Math.floor(Math.random() * MANGLACHARAN_PASSAGES.length);
    setCurrentIndex(randomIdx);
  }, []);

  const passage =
    MANGLACHARAN_PASSAGES[currentIndex] || MANGLACHARAN_PASSAGES[0];

  const handleDiscoverAnother = () => {
    if (MANGLACHARAN_PASSAGES.length <= 1) return;
    let nextIdx = Math.floor(Math.random() * MANGLACHARAN_PASSAGES.length);
    if (nextIdx === currentIndex) {
      nextIdx = (currentIndex + 1) % MANGLACHARAN_PASSAGES.length;
    }
    setCurrentIndex(nextIdx);
  };

  return (
    <div
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border-subtle)",
        color: "var(--text-primary)",
      }}
      className="rounded-3xl border-2 border-[#C59B27]/55 p-6 sm:p-8 md:p-10 shadow-sm space-y-6"
    >
      {/* Top Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#C59B27]/25 pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              style={{
                backgroundColor: "var(--theme-card-darker)",
                borderColor: "var(--border-subtle)",
                color: "var(--accent-primary)",
              }}
              className="text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border"
            >
              MANGLACHARAN CLASSICAL GRANTH SPOTLIGHT • PASSAGE {passage.numeral}{" "}
              OF ੧੨
            </span>
            <span
              lang="pa"
              style={{ color: "var(--accent-primary)" }}
              className="font-gurmukhi text-sm font-semibold"
            >
              {passage.gurmukhiGranth}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-serif font-bold">
            {passage.episodeTitle}
          </h2>
          <p
            style={{ color: "var(--theme-text-muted)" }}
            className="text-xs sm:text-sm font-medium"
          >
            <strong>{passage.granthTitle}</strong> • {passage.author} ({passage.era})
            • <em>{passage.citation}</em>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleDiscoverAnother}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider shadow-sm hover:brightness-105 transition"
          >
            Discover Another Passage ↻
          </button>

          <a
            href={passage.manglacharanUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: "var(--theme-card-darker)",
              borderColor: "var(--border-subtle)",
              color: "var(--accent-primary)",
            }}
            className="px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider hover:border-[#C59B27] transition"
          >
            Read Full Context on Manglacharan.com →
          </a>
        </div>
      </div>

      {/* Verse Card: Gurmukhi / Braj, Transliteration & English Translation */}
      <div
        style={{
          backgroundColor: "var(--theme-card-darker)",
          borderColor: "var(--border-subtle)",
        }}
        className="rounded-2xl border p-6 sm:p-7 space-y-4"
      >
        <p
          lang="pa"
          style={{ color: "var(--accent-primary)" }}
          className="font-gurmukhi text-2xl sm:text-3xl font-semibold leading-relaxed"
        >
          {passage.gurmukhiVerse}
        </p>

        <p
          style={{ color: "var(--theme-text-muted)" }}
          className="text-xs sm:text-sm italic"
        >
          {passage.transliteration}
        </p>

        <p className="text-base sm:text-lg font-serif font-medium leading-relaxed pt-2 border-t border-[#C59B27]/20">
          &ldquo;{passage.englishTranslation}&rdquo;
        </p>
      </div>

      {/* Sentence-by-Sentence Philosophical Breakdown & Historical Context */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            style={{ color: "var(--accent-primary)" }}
            className="text-xs font-bold uppercase tracking-[0.2em]"
          >
            Sentence-by-Sentence Exegesis &amp; Historical Context
          </span>
          <button
            type="button"
            onClick={() => setShowBreakdown((v) => !v)}
            style={{ color: "var(--accent-primary)" }}
            className="text-xs font-bold hover:underline"
          >
            {showBreakdown ? "Hide Exegesis ↑" : "Show Phrase Breakdown ↓"}
          </button>
        </div>

        {showBreakdown && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Phrase-by-Phrase Breakdown */}
            <div className="lg:col-span-7 space-y-2.5">
              {passage.sentenceBreakdown.map((item) => (
                <div
                  key={item.phrase}
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="p-3.5 rounded-xl border space-y-1"
                >
                  <p
                    lang="pa"
                    style={{ color: "var(--accent-primary)" }}
                    className="font-gurmukhi text-xs sm:text-sm font-bold"
                  >
                    {item.phrase}
                  </p>
                  <p
                    style={{ color: "var(--theme-text-muted)" }}
                    className="text-xs sm:text-sm leading-relaxed"
                  >
                    {item.meaning}
                  </p>
                </div>
              ))}
            </div>

            {/* Historical & Manuscript Context */}
            <div
              style={{
                backgroundColor: "var(--bg-primary)",
                borderColor: "var(--border-subtle)",
              }}
              className="lg:col-span-5 p-5 rounded-2xl border flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <span
                  style={{ color: "var(--accent-primary)" }}
                  className="text-[11px] font-bold uppercase tracking-[0.18em]"
                >
                  Manuscript &amp; Historical Context
                </span>
                <p
                  style={{ color: "var(--theme-text-muted)" }}
                  className="text-xs sm:text-sm leading-relaxed"
                >
                  {passage.historicalContext}
                </p>
              </div>

              <div className="pt-3 border-t border-[#C59B27]/20 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentIndex(
                        (idx) =>
                          (idx - 1 + MANGLACHARAN_PASSAGES.length) %
                          MANGLACHARAN_PASSAGES.length
                      )
                    }
                    className="px-2.5 py-1 rounded-lg border border-[#C59B27]/40 text-xs font-bold hover:border-[#C59B27]"
                  >
                    ← Prev
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentIndex(
                        (idx) => (idx + 1) % MANGLACHARAN_PASSAGES.length
                      )
                    }
                    className="px-2.5 py-1 rounded-lg border border-[#C59B27]/40 text-xs font-bold hover:border-[#C59B27]"
                  >
                    Next →
                  </button>
                </div>

                <a
                  href={passage.manglacharanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent-primary)" }}
                  className="text-xs font-bold hover:underline"
                >
                  Read Full Context on Manglacharan.com →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
