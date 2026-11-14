"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
import {
  useKirtanAudio,
  formatAudioTime,
  type KirtanTrack,
} from "@/components/kirtan-audio-context";

type NativeChapter = {
  title: string;
  reference: string;
  gurmukhi: string;
  transliteration: string;
  punjabiTeeka: string;
  englishTranslation: string;
  scholarlyNote: string;
};

type BookReaderEdition = {
  label: string;
  embedUrl: string;
  archiveDetailsUrl: string;
};

type GranthVolume = {
  id: string;
  numeral: string;
  category:
    | "Scriptural Teeka & Manuscript"
    | "Historical Chronicle"
    | "Gurmat Musicology & Rehit"
    | "Canonical Bani & Lexicon";
  title: string;
  gurmukhiTitle: string;
  author: string;
  period: string;
  volumesCount: string;
  summary: string;
  significance: string;
  supportsLiveAngReader?: boolean;
  defaultAng?: number;
  editions: BookReaderEdition[];
  gurmatVeecharUrl: string;
  chapters: NativeChapter[];
};

const HISTORICAL_GRANTHS: GranthVolume[] = [
  {
    id: "sggs-darpan",
    numeral: "੧",
    category: "Scriptural Teeka & Manuscript",
    title: "Sri Guru Granth Sahib Ji Darpan (Prof. Sahib Singh Teeka)",
    gurmukhiTitle: "ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਦਰਪਣ (ਪ੍ਰੋ. ਸਾਹਿਬ ਸਿੰਘ)",
    author: "Prof. Sahib Singh Ji (D.Litt.)",
    period: "1962 – 1964 CE • Amritsar (10 Volumes)",
    volumesCount: "Complete Ang 1 to 1430 Exegesis + Live Ang Reader",
    summary:
      "The foundational grammatical exegesis (Teeka) of Sri Guru Granth Sahib Ji, unlocking the morphological rules of Gurbani Viyakaran (vowel endings, case markers, and syntax).",
    significance:
      "Use the Built-In Live Ang Reader (Ang 1–1430) to read any Ang of Sri Guru Granth Sahib Ji with Prof. Sahib Singh's Punjabi Darpan Teeka and English translation, or flip through the 2-Up BookReader.",
    supportsLiveAngReader: true,
    defaultAng: 1,
    editions: [
      {
        label: "Darpan BookReader (2-Up Flipbook)",
        embedUrl: "https://archive.org/embed/GuruGranthDarpanPSS?ui=embed#mode/2up",
        archiveDetailsUrl: "https://archive.org/details/GuruGranthDarpanPSS",
      },
    ],
    gurmatVeecharUrl:
      "https://www.gurmatveechar.com/books/Punjabi_Books/Professor_Sahib_Singh/",
    chapters: [
      {
        title: "Mool Mantar Grammatical Analysis (Ang 1)",
        reference: "Sri Guru Granth Sahib Darpan, Vol. 1 • Ang 1",
        gurmukhi:
          "ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ ॥",
        transliteration:
          "Ik Oankaar Sat Naamu Kartaa Purakhu Nirbhau Nirvairu Akaal Moorati Ajoonee Saibhang Gur Prasaadi ||",
        punjabiTeeka:
          "ਅਕਾਲ ਪੁਰਖ ਇੱਕ ਹੈ, ਜਿਸ ਦਾ ਨਾਮ 'ਹੋਂਦ ਵਾਲਾ' ਹੈ ਜੋ ਸ੍ਰਿਸ਼ਟੀ ਦਾ ਰਚਨਹਾਰ ਹੈ, ਜੋ ਸਭ ਵਿਚ ਵਿਆਪਕ ਹੈ, ਭੈ ਤੋਂ ਰਹਿਤ ਹੈ, ਵੈਰ-ਰਹਿਤ ਹੈ, ਜਿਸ ਦਾ ਸਰੂਪ ਕਾਲ ਤੋਂ ਪਰੇ ਹੈ, ਜੋ ਜੂਨਾਂ ਵਿਚ ਨਹੀਂ ਆਉਂਦਾ, ਜਿਸ ਦਾ ਪ੍ਰਕਾਸ਼ ਆਪਣੇ ਆਪ ਤੋਂ ਹੋਇਆ ਹੈ ਅਤੇ ਜੋ ਸਤਿਗੁਰੂ ਦੀ ਕਿਰਪਾ ਨਾਲ ਮਿਲਦਾ ਹੈ।",
        englishTranslation:
          "There is One Universal Creator whose Eternal Name is Truth, All-Pervading Doer, Without Fear, Without Enmity, Timeless Form, Unborn, Self-Illuminated, realized through the Guru's Grace.",
        scholarlyNote:
          "Prof. Sahib Singh demonstrates that the Aunkar (ੁ) beneath 'ਨਾਮੁ' and 'ਪੁਰਖੁ' marks the singular nominative subject, while the Sihari (ਿ) on 'ਪ੍ਰਸਾਦਿ' marks the instrumental case ('by means of Grace').",
      },
      {
        title: "Sovereign Equality of Women (Ang 473)",
        reference: "Sri Guru Granth Sahib Darpan, Vol. 3 • Ang 473 (Asa Di Vaar)",
        gurmukhi:
          "ਭੰਡਿ ਜੰਮੀਐ ਭੰਡਿ ਨਿੰਮੀਐ ਭੰਡਿ ਮੰਗਣੁ ਵੀਆਹੁ ॥ ... ਸੋ ਕਿਉ ਮੰਦਾ ਆਖੀਐ ਜਿਤੁ ਜੰਮਹਿ ਰਾਜਾਨ ॥",
        transliteration:
          "Bhandi jammeeai bhandi nimmeeai bhandi manganu veeaahu || ... So kiu mandaa aakheeai jitu jammeh raajaan ||",
        punjabiTeeka:
          "ਇਸਤ੍ਰੀ ਤੋਂ ਜਨਮ ਲਈਦਾ ਹੈ, ਇਸਤ੍ਰੀ ਦੇ ਪੇਟ ਵਿਚ ਹੀ ਪ੍ਰਾਣੀ ਦਾ ਸਰੀਰ ਬਣਦਾ ਹੈ... ਜਿਸ ਇਸਤ੍ਰੀ ਜਾਤੀ ਤੋਂ ਰਾਜੇ (ਅਤੇ ਮਹਾਂਪੁਰਖ) ਜੰਮਦੇ ਹਨ, ਉਸ ਨੂੰ ਮੰਦਾ ਕਿਉਂ ਆਖਿਆ ਜਾਵੇ?",
        englishTranslation:
          "From woman, man is born; within woman, man is conceived... Why call her inferior, from whom sovereigns and great souls are born?",
        scholarlyNote:
          "In Gurbani grammar, 'ਭੰਡਿ' (Bhandi) carries a locative/instrumental Sihari ('through/in woman'), while 'ਭੰਡਹੁ' (Bhandahu) carries the ablative suffix ('from woman').",
      },
    ],
  },
  {
    id: "panth-prakash",
    numeral: "੨",
    category: "Historical Chronicle",
    title: "Sri Gur Panth Prakash (Rattan Singh Bhangu)",
    gurmukhiTitle: "ਸ੍ਰੀ ਗੁਰ ਪੰਥ ਪ੍ਰਕਾਸ਼ (ਭਾਈ ਰਤਨ ਸਿੰਘ ਭੰਗੂ)",
    author: "Shaheed Bhai Rattan Singh Bhangu",
    period: "Completed 1841 CE • Amritsar",
    volumesCount: "Original Gurmukhi & English Translation (Episodes 1–81)",
    summary:
      "Primary 18th-century chronicle of the Khalsa's struggle for sovereignty, written by the grandson of Shaheed Bhai Mehtab Singh Ji.",
    significance:
      "Records the oral testimonies of surviving 18th-century Khalsa warriors on how the Guru bestowed sovereign Patshahi (self-rule) upon the Panth.",
    editions: [
      {
        label: "Original Gurmukhi BookReader (2-Up)",
        embedUrl: "https://archive.org/embed/SriGurPanthPrakash?ui=embed#mode/2up",
        archiveDetailsUrl: "https://archive.org/details/SriGurPanthPrakash",
      },
      {
        label: "Vol. 1 English Translation (Episodes 1–81)",
        embedUrl:
          "https://archive.org/embed/SriGurPanthPrakashVolume1episodes1To81?ui=embed#mode/2up",
        archiveDetailsUrl:
          "https://archive.org/details/SriGurPanthPrakashVolume1episodes1To81",
      },
    ],
    gurmatVeecharUrl:
      "https://www.gurmatveechar.com/literature?q=f&f=%2FEnglish_Books",
    chapters: [
      {
        title: "Episode 15: The Sovereign Patshahi of the Khalsa",
        reference: "Sri Gur Panth Prakash • Dohra & Chaupai",
        gurmukhi: "ਸਿੰਘਨ ਕੀ ਪਾਤਸ਼ਾਹੀ ਸਾਚੀ । ਸਤਿਗੁਰਿ ਆਪੁ ਸਿੰਘਨ ਕਉ ਦੀਨੀ ॥",
        transliteration:
          "Singhan kee Paatshaahee saachee. Satigur aapu Singhan kau deenee ||",
        punjabiTeeka:
          "ਸਿੰਘਾਂ ਦੀ ਪਾਤਸ਼ਾਹੀ ਸੱਚੀ ਅਤੇ ਸਦੀਵੀ ਹੈ, ਕਿਉਂਕਿ ਸਤਿਗੁਰੂ ਜੀ ਨੇ ਆਪ ਇਹ ਪਾਤਸ਼ਾਹੀ ਖ਼ਾਲਸਾ ਪੰਥ ਨੂੰ ਬਖ਼ਸ਼ੀ ਹੈ।",
        englishTranslation:
          "True and eternal is the sovereignty of the Singhs; the True Guru Himself bestowed this sovereignty upon the Khalsa.",
        scholarlyNote:
          "Written in response to British East India Company Captain Murray's inquiry into by what right the Sikhs claimed sovereignty over Punjab.",
      },
      {
        title: "Episode 78: Bhai Bota Singh & Bhai Garja Singh's Sovereign Toll",
        reference: "Sri Gur Panth Prakash • Episode 78 (1739 CE)",
        gurmukhi:
          "ਚਿੱਠੀ ਲਿਖੀ ਸਿੰਘ ਬੋਤੇ ਹੱਥ । ਭਾਬੀ ਖਾਲਸਾ ਜੀਹਾਂ ਹੈ ਨੱਥ ॥ ਆਨਾ ਲਾਯਾ ਗੱਡੇ ਨੂੰ ਪੈਸਾ ਲਾਯਾ ਖੋਤੇ ॥",
        transliteration:
          "Chitthee likhee Singh Bote hatth. Bhaabee Khaalsaa jeehaan hai natth || Aanaa laayaa gadde noo paisaa laayaa khote ||",
        punjabiTeeka:
          "ਭਾਈ ਬੋਤਾ ਸਿੰਘ ਨੇ ਸਰਾਏ ਨੂਰਦੀਨ ਵਿਖੇ ਖੜ੍ਹੋ ਕੇ ਲਾਹੌਰ ਦੇ ਸੂਬੇਦਾਰ ਜ਼ਕਰੀਆ ਖ਼ਾਨ ਨੂੰ ਖ਼ਤ ਲਿਖਿਆ ਕਿ ਖ਼ਾਲਸਾ ਕਦੇ ਖ਼ਤਮ ਨਹੀਂ ਹੋਇਆ—ਅਸੀਂ ਸ਼ਾਹੀ ਸੜਕ ਉੱਤੇ ਗੱਡੇ ਉੱਤੇ ਆਨਾ ਅਤੇ ਖੋਤੇ ਉੱਤੇ ਪੈਸਾ ਜਜ਼ੀਆ ਲਾ ਕੇ ਪਾਤਸ਼ਾਹੀ ਪ੍ਰਗਟ ਕੀਤੀ ਹੈ।",
        englishTranslation:
          "Bhai Bota Singh wrote directly to the Mughal Governor of Lahore: 'The Khalsa stands sovereign on the Grand Trunk Road, levying one anna per cart and one paisa per donkey.'",
        scholarlyNote:
          "When Mughal officials claimed the Khalsa had been wiped out, Bhai Bota Singh and Bhai Garja Singh stood openly on the royal highway at Tarn Taran to proclaim Khalsa sovereignty unto martyrdom.",
      },
    ],
  },
  {
    id: "suraj-prakash",
    numeral: "੩",
    category: "Historical Chronicle",
    title: "Sri Gur Pratap Suraj Granth (Kavi Santokh Singh)",
    gurmukhiTitle: "ਸ੍ਰੀ ਗੁਰ ਪ੍ਰਤਾਪ ਸੂਰਜ ਗ੍ਰੰਥ (ਮਹਾਂਕਵੀ ਸੰਤੋਖ ਸਿੰਘ)",
    author: "Mahakavi Bhai Santokh Singh Ji (1787 – 1843 CE)",
    period: "Completed 1843 CE • Kaithal (14 Volumes)",
    volumesCount: "Sri Nanak Parkash & 12 Raas / 6 Rut",
    summary:
      "The monumental 51,829-verse Braj Bhasha historical epic of the Ten Sikh Gurus, recited and expounded daily in historical Gurdwaras during afternoon Katha.",
    significance:
      "Flip through both Raas 01 and Sri Nanak Parkash in the 2-Up BookReader theater or read key chapters in the Native Reader.",
    editions: [
      {
        label: "Suraj Granth — Raas 01 (2-Up Flipbook)",
        embedUrl:
          "https://archive.org/embed/SriGurPartapSurajGranth-Raas01?ui=embed#mode/2up",
        archiveDetailsUrl:
          "https://archive.org/details/SriGurPartapSurajGranth-Raas01",
      },
      {
        label: "Vol. 1: Sri Nanak Parkash (2-Up Flipbook)",
        embedUrl:
          "https://archive.org/embed/SriGuruPartapSurajGranth01SriNanakParkash1?ui=embed#mode/2up",
        archiveDetailsUrl:
          "https://archive.org/details/SriGuruPartapSurajGranth01SriNanakParkash1",
      },
    ],
    gurmatVeecharUrl:
      "https://www.gurmatveechar.com/books/Punjabi_Books/Bhai_Vir_Singh/",
    chapters: [
      {
        title: "Manglacharan • Invocation to the Ten Sovereign Lights",
        reference: "Sri Gur Pratap Suraj Granth • Manglacharan",
        gurmukhi:
          "ਏਕੰਕਾਰਾ ਸਤਿਗੁਰੂ ਤਿਹ ਪ੍ਰਸਾਦਿ ਸਚੁ ਹੋਇ । ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫਤਹਿ ਵਿਘਨ ਵਿਨਾਸਨ ਸੋਇ ॥",
        transliteration:
          "Ekankaaraa Satiguroo tih prasaadi sachu hoi. Vaahiguroo jee kee fatehi vighan vinaasan soi ||",
        punjabiTeeka:
          "ਇੱਕ ਅਕਾਲ ਪੁਰਖ ਸਤਿਗੁਰੂ ਦੀ ਕਿਰਪਾ ਨਾਲ ਸੱਚ ਦਾ ਪ੍ਰਕਾਸ਼ ਹੁੰਦਾ ਹੈ; ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫਤਹਿ ਸਾਰੇ ਵਿਘਨਾਂ ਦਾ ਨਾਸ਼ ਕਰਨ ਵਾਲੀ ਹੈ।",
        englishTranslation:
          "By the Grace of the One Universal True Guru, Truth is realized; Victory belongs to Waheguru Ji, the Destroyer of all obstacles.",
        scholarlyNote:
          "Annotated across 14 volumes by Bhai Vir Singh Ji between 1927 and 1935 with extensive historical footnotes.",
      },
      {
        title: "Raas 1 • Installation of the Adi Granth at Sri Harmandir Sahib (1604)",
        reference: "Sri Gur Pratap Suraj Granth • Raas 1 (Guru Arjan Dev Ji)",
        gurmukhi:
          "ਸ੍ਰੀ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜਬ ਭਯੋ ਤਿਆਰ । ਧਰਯੋ ਹਰਿਮੰਦਰ ਮਧਿ ਉਦਾਰ ॥ ਬਾਬਾ ਬੁੱਢਾ ਜੀ ਗ੍ਰੰਥੀ ਥਾਪੇ । ਪ੍ਰਥਮ ਪ੍ਰਕਾਸ਼ ਕੀਨੋ ਗੁਰ ਆਪੇ ॥",
        transliteration:
          "Sri Granth Sahib jab bhayo tiaar. Dharyo Harimandar madhi udaar || Baabaa Buddhaa Jee Granthee thaape. Pratham prakaash keeno Gur aape ||",
        punjabiTeeka:
          "ਜਦੋਂ ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ ਦੀ ਪਾਵਨ ਬੀੜ ਸੰਪੂਰਨ ਹੋਈ, ਗੁਰੂ ਅਰਜਨ ਦੇਵ ਜੀ ਨੇ ਸ੍ਰੀ ਹਰਿਮੰਦਰ ਸਾਹਿਬ ਵਿਖੇ ਪ੍ਰਕਾਸ਼ ਕੀਤਾ ਅਤੇ ਬਾਬਾ ਬੁੱਢਾ ਜੀ ਨੂੰ ਪਹਿਲੇ ਮੁੱਖ ਗ੍ਰੰਥੀ ਥਾਪਿਆ।",
        englishTranslation:
          "When the sacred volume of Sri Guru Granth Sahib Ji was completed, Guru Arjan Dev Ji installed it inside Sri Harmandir Sahib and appointed Baba Buddha Ji as the first Head Granthi.",
        scholarlyNote:
          "Guru Arjan Dev Ji slept on the floor below the throne of the Granth to establish forever that the Sabad-Guru is supreme above all human forms.",
      },
    ],
  },
  {
    id: "puratan-sggs-manuscript",
    numeral: "੪",
    category: "Scriptural Teeka & Manuscript",
    title: "Puratan Sri Guru Granth Sahib Ji Manuscript (Larivaar Bir)",
    gurmukhiTitle: "ਪੁਰਾਤਨ ਹੱਥ-ਲਿਖਤ ਬੀੜ ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ",
    author: "Puratan Gurmukhi Scribal Tradition",
    period: "17th – 18th Century CE • Hand-Illuminated Larivaar Folio",
    volumesCount: "Complete Illuminated Manuscript + Live Larivaar Ang Reader",
    summary:
      "High-resolution preservation of a historical hand-inscribed Larivaar (continuous unbroken script) manuscript of Sri Guru Granth Sahib Ji.",
    significance:
      "Examine original Puratan Gurmukhi calligraphy in the 2-Up BookReader or use the Live Ang Reader in Larivaar mode.",
    supportsLiveAngReader: true,
    defaultAng: 1,
    editions: [
      {
        label: "Puratan Manuscript BookReader (2-Up)",
        embedUrl:
          "https://archive.org/embed/puratan-sri-guru-granth-sahib-ji?ui=embed#mode/2up",
        archiveDetailsUrl:
          "https://archive.org/details/puratan-sri-guru-granth-sahib-ji",
      },
    ],
    gurmatVeecharUrl: "https://www.gurmatveechar.com/literature",
    chapters: [
      {
        title: "Opening Folio (Ang 1) • Larivaar Scribal Tradition",
        reference: "Puratan Bir • Opening Illuminated Folio (Nishan & Mool Mantar)",
        gurmukhi:
          "ੴਸਤਿਨਾਮੁਕਰਤਾਪੁਰਖੁਨਿਰਭਉਨਿਰਵੈਰੁਅਕਾਲਮੂਰਤਿਅਜੂਨੀਸੈਭੰਗੁਰਪ੍ਰਸਾਦਿ॥॥ਜਪੁ॥ਆਦਿਸਚੁਜੁਗਾਦਿਸਚੁ॥ਹੈਭੀਸਚੁਨਾਨਕਹੋਸੀਭੀਸਚੁ॥੧॥",
        transliteration:
          "IkOankaarSatNaamuKartaaPurakhuNirbhauNirvairuAkaalMooratiAjooneeSaibhangGurPrasaadi || ||Japu|| AadiSachuJugaadiSachu || HaiBheeSachuNanakHoseeBheeSachu ||1||",
        punjabiTeeka:
          "ਪੁਰਾਤਨ ਹੱਥ-ਲਿਖਤ ਬੀੜਾਂ ਵਿੱਚ ਸਾਰੀ ਬਾਣੀ ਲੜੀਵਾਰ (ਬਿਨਾਂ ਪਦ-ਛੇਦ ਦੇ) ਲਿਖੀ ਜਾਂਦੀ ਸੀ ਤਾਂ ਜੋ ਬਾਣੀ ਦੀ ਅਖੰਡਤਾ ਅਤੇ ਵਿਆਕਰਣਕ ਸ਼ੁੱਧਤਾ ਕਾਇਮ ਰਹੇ।",
        englishTranslation:
          "In historical Sikh manuscripts, the entire scripture was inscribed in unbroken Larivaar calligraphy, requiring Santhiya (oral grammatical training) to recite accurately.",
        scholarlyNote:
          "Use the Live Ang Reader below and toggle 'Larivaar Script' to inspect any Ang (1–1430) in unbroken Puratan format.",
      },
    ],
  },
  {
    id: "pracheen-reet-ratnavli",
    numeral: "੫",
    category: "Gurmat Musicology & Rehit",
    title: "Gurbani Sangeet Pracheen Reet Ratnavli (Bhai Avtar Singh Ji)",
    gurmukhiTitle: "ਗੁਰਬਾਣੀ ਸੰਗੀਤ ਪ੍ਰਾਚੀਨ ਰੀਤ ਰਤਨਾਵਲੀ",
    author: "Bhai Avtar Singh Ji & Bhai Gurcharan Singh Ji Ragi",
    period: "Published 1979 CE • Punjabi University, Patiala",
    volumesCount: "Part I & II • Complete Swar-Lipi Notation of Puratan Shabad Reets",
    summary:
      "The monumental musicological compendium preserving the exact Swar-lipi (musical notation), Raag forms, and Taals of nearly 500 centuries-old Puratan Gurbani compositions.",
    significance:
      "Pairs directly with the audio recordings of Bhai Avtar Singh Ji in Tab A (Puratan Kirtan & Raag Darbar).",
    editions: [
      {
        label: "Pracheen Reet Ratnavli Pt. 1 (2-Up Flipbook)",
        embedUrl:
          "https://archive.org/embed/gurbani-sangeet-pracheen-reet-ratnavli-pt-1?ui=embed#mode/2up",
        archiveDetailsUrl:
          "https://archive.org/details/gurbani-sangeet-pracheen-reet-ratnavli-pt-1",
      },
    ],
    gurmatVeecharUrl:
      "https://www.gurmatveechar.com/audio.php?q=f&f=%2FKirtan%2FBhai_Avtar_Singh_%28Delhi_Wale%29",
    chapters: [
      {
        title: "Raag Sri Raag & Raag Asa — Puratan Guldasta Notation",
        reference: "Gurbani Sangeet Pracheen Reet Ratnavli • Part 1",
        gurmukhi:
          "ਰਾਗੁ ਸਿਰੀਰਾਗੁ ਮਹਲਾ ੧ ਘਰੁ ੧ ॥ ਮੋਤੀ ਤ ਮੰਦਰ ਊਸਰਹਿ ਰਤਨੀ ਤ ਹੋਹਿ ਜੜਾਉ ॥",
        transliteration:
          "Raagu Sireeraagu Mahalaa 1 Gharu 1 || Motee ta mandar oosarahi ratanee ta hohi jarhaau ||",
        punjabiTeeka:
          "ਇਸ ਗ੍ਰੰਥ ਵਿੱਚ ਹਰੇਕ ਸ਼ਬਦ ਦੇ ਘਰੁ, ਤਾਲ (ਪੜਤਾਲ, ਚਾਰਤਾਲ, ਧਮਾਰ) ਅਤੇ ਸੁਰ-ਲਿਪੀ ਨੂੰ ਗੁਰੂ-ਘਰ ਦੀ ਪੁਰਾਤਨ ਰਬਾਬੀ ਅਤੇ ਕੀਰਤਨੀ ਪਰੰਪਰਾ ਅਨੁਸਾਰ ਦਰਜ ਕੀਤਾ ਗਿਆ ਹੈ।",
        englishTranslation:
          "Even if palaces were built of pearls and inlaid with jewels—yet let me never forget You, O Beloved, nor let Your Name depart from my mind.",
        scholarlyNote:
          "Passed down from Baba Jwala Singh Ji and Bhai Desa Singh Ji across eleven generations of court Ragis.",
      },
    ],
  },
  {
    id: "khalsa-dharam-shastar",
    numeral: "੬",
    category: "Gurmat Musicology & Rehit",
    title: "Khalsa Dharam Shastar (Sikh Sanskar & Rehit Maryada)",
    gurmukhiTitle: "ਖ਼ਾਲਸਾ ਧਰਮ ਸ਼ਾਸਤ੍ਰ",
    author: "Bhai Avtar Singh Vahiria",
    period: "Published 1914 CE • Lahore",
    volumesCount: "Complete Treatise on Khalsa Sanskars & Code of Conduct",
    summary:
      "Comprehensive pre-SGPC compilation of traditional Khalsa ceremonies (Sanskars), Amrit Sanchar injunctions, and historical Rehitnamas.",
    significance:
      "Documents late-19th and early-20th century Panthic liturgical practices and classical Rehitnama traditions.",
    editions: [
      {
        label: "Khalsa Dharam Shastar BookReader (2-Up)",
        embedUrl:
          "https://archive.org/embed/khalsa_dharam_shastar?ui=embed#mode/2up",
        archiveDetailsUrl: "https://archive.org/details/khalsa_dharam_shastar",
      },
    ],
    gurmatVeecharUrl:
      "https://www.gurmatveechar.com/literature?q=f&f=%2FPunjabi_Books",
    chapters: [
      {
        title: "Chapter I: Praises of Akal Purakh & Khalsa Rehit",
        reference: "Khalsa Dharam Shastar • Opening Invocation & Rehit",
        gurmukhi:
          "ਰਹਿਣੀ ਰਹੈ ਸੋਈ ਸਿਖ ਮੇਰਾ । ਉਹ ਸਾਹਿਬ ਮੈਂ ਉਸ ਕਾ ਚੇਰਾ ॥ ਰਹਿਤ ਬਿਨਾ ਨਹਿ ਸਿਖ ਕਹਾਵੈ । ਰਹਿਤ ਬਿਨਾ ਦਰ ਚੋਟਾਂ ਖਾਵੈ ॥",
        transliteration:
          "Rahinee rahai soee Sikh meraa. Uh Saahib main us kaa cheraa || Rahit binaa nahi Sikh kahaavai ||",
        punjabiTeeka:
          "ਗੁਰੂ ਗੋਬਿੰਦ ਸਿੰਘ ਜੀ ਦਾ ਬਚਨ ਹੈ ਕਿ ਜੋ ਸਿੱਖ ਗੁਰਮਤਿ ਰਹਿਣੀ ਵਿੱਚ ਰਹਿੰਦਾ ਹੈ, ਉਹੀ ਮੇਰਾ ਸਾਹਿਬ ਹੈ ਅਤੇ ਮੈਂ ਉਸ ਦਾ ਸੇਵਕ ਹਾਂ।",
        englishTranslation:
          "One who lives by the Guru's discipline (Rehit) is truly my Sikh; he is my Master, and I am his disciple.",
        scholarlyNote:
          "Synthesizes injunctions from Bhai Nand Lal Ji's Tankahnama, Bhai Prahlad Singh Ji, and Bhai Chaupa Singh Ji's Rehitnamas.",
      },
    ],
  },
];

type LiveAngVerse = {
  verseId: number;
  pageNo: number;
  writer: string;
  raag: string;
  gurmukhiUnicode: string;
  larivaarUnicode: string;
  transliteration: string;
  punjabiViakhia: string;
  englishTranslation: string;
};

export default function GranthsAndKirtanPage() {
  const [activeTab, setActiveTab] = useState<"kirtan" | "granths">("kirtan");
  const [kirtanCollectionFilter, setKirtanCollectionFilter] = useState<string>("All");
  const [kirtanQuery, setKirtanQuery] = useState("");
  const [showAdminQueue, setShowAdminQueue] = useState(true);
  const [granthQuery, setGranthQuery] = useState("");
  const [granthCategory, setGranthCategory] = useState<string>("All");
  const [selectedGranth, setSelectedGranth] = useState<GranthVolume | null>(null);
  const [modalMode, setModalMode] = useState<"bookreader" | "native">(
    "bookreader"
  );
  const [selectedEditionIdx, setSelectedEditionIdx] = useState(0);
  const [selectedChapterIdx, setSelectedChapterIdx] = useState(0);
  const [isFullscreenModal, setIsFullscreenModal] = useState(false);

  // Live Ang-by-Ang Reader State (for SGGS Darpan & Puratan Manuscript)
  const [angInput, setAngInput] = useState("1");
  const [activeAng, setActiveAng] = useState(1);
  const [angVerses, setAngVerses] = useState<LiveAngVerse[]>([]);
  const [loadingAng, setLoadingAng] = useState(false);
  const [larivaarMode, setLarivaarMode] = useState(false);

  const {
    tracks,
    liveStreams,
    currentTrack,
    isPlaying,
    isLoadingAudio,
    currentTime,
    duration,
    volume,
    isReadingVolumePreset,
    playerMode,
    playTrack,
    togglePlayPause,
    seekTo,
    setVolume,
    toggleReadingVolumePreset,
    startReadingInstrumental,
    setPlayerMode,
    nextTrack,
    prevTrack,
    setIsCustomModalOpen,
    submissions,
    pendingSubmissionsCount,
    approveSubmission,
    rejectSubmission,
  } = useKirtanAudio();

  const filteredKirtanTracks = useMemo(() => {
    const sourceList =
      kirtanCollectionFilter === "Live 24/7 Gurdwara Broadcasts"
        ? liveStreams
        : kirtanCollectionFilter === "All"
        ? tracks
        : tracks.filter((t) => t.category === kirtanCollectionFilter);

    const q = kirtanQuery.trim().toLowerCase();
    if (!q) return sourceList;
    return sourceList.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.ragi.toLowerCase().includes(q) ||
        t.raag.toLowerCase().includes(q) ||
        t.tantiSaaj.toLowerCase().includes(q) ||
        t.gurmukhiTitle.includes(q)
    );
  }, [kirtanCollectionFilter, kirtanQuery, liveStreams, tracks]);

  const fetchLiveAng = useCallback(async (angNumber: number) => {
    const clamped = Math.max(1, Math.min(1430, angNumber));
    setActiveAng(clamped);
    setAngInput(String(clamped));
    setLoadingAng(true);
    try {
      const res = await fetch(`/api/banidb?ang=${clamped}`);
      const data = await res.json();
      if (data?.ok && Array.isArray(data.verses)) {
        setAngVerses(data.verses);
      }
    } catch {
      // Keep existing verses if offline
    } finally {
      setLoadingAng(false);
    }
  }, []);

  useEffect(() => {
    if (selectedGranth?.supportsLiveAngReader) {
      void fetchLiveAng(selectedGranth.defaultAng || 1);
      if (selectedGranth.id === "puratan-sggs-manuscript") {
        setLarivaarMode(true);
      } else {
        setLarivaarMode(false);
      }
    }
  }, [fetchLiveAng, selectedGranth]);

  const filteredGranths = useMemo(() => {
    return HISTORICAL_GRANTHS.filter((g) => {
      const matchesCat =
        granthCategory === "All" || g.category === granthCategory;
      const q = granthQuery.trim().toLowerCase();
      if (!q) return matchesCat;
      return (
        matchesCat &&
        (g.title.toLowerCase().includes(q) ||
          g.author.toLowerCase().includes(q) ||
          g.summary.toLowerCase().includes(q) ||
          g.gurmukhiTitle.includes(q))
      );
    });
  }, [granthCategory, granthQuery]);

  const handleTrackClick = (track: KirtanTrack) => {
    if (currentTrack.id === track.id) {
      togglePlayPause();
    } else {
      playTrack(track);
    }
  };

  const openGranthModal = (
    granth: GranthVolume,
    initialMode: "bookreader" | "native"
  ) => {
    setSelectedGranth(granth);
    setSelectedEditionIdx(0);
    setSelectedChapterIdx(0);
    setModalMode(initialMode);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EE] text-[#171917]">
      <Header solid />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 pb-28">
        {/* Page Header */}
        <section className="rounded-3xl border border-[#C59B27]/40 bg-[#1B2A20] p-8 md:p-10 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#C59B27] px-3 py-1 rounded-full border border-[#C59B27]/40 bg-[#121C15]">
                  SANCTUARY ARCHIVE • PURATAN KIRTAN &amp; GRANTH BOOKREADER
                </span>
                <span lang="pa" className="font-gurmukhi text-sm text-[#D97706]">
                  ਗੁਰਮਤਿ ਸੰਗੀਤ ਅਤੇ ਇਤਿਹਾਸਕ ਗ੍ਰੰਥ
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight">
                Puratan Raag Darbar &amp; Interactive Granths
              </h1>
              <p className="text-sm sm:text-base text-[#4A554E] leading-relaxed">
                Stream authentic Puratan Gurbani Kirtan recordings by Bhai Avtar Singh Ji Ragi
                (proxied directly from Archive.org with an Embedded Playlist toggle) or open our
                Dual-Mode Interactive BookReader &amp; Live Ang 1–1430 Darpan Viewer.
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl border border-[#C59B27]/40 bg-[#121C15] shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("kirtan")}
                className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition ${
                  activeTab === "kirtan"
                    ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] shadow-sm"
                    : "text-[#4A554E] hover:text-[#171917]"
                }`}
              >
                ੧ · Puratan Kirtan &amp; Raag Player
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("granths")}
                className={`px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition ${
                  activeTab === "granths"
                    ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] shadow-sm"
                    : "text-[#4A554E] hover:text-[#171917]"
                }`}
              >
                ੨ · Interactive Granth BookReader
              </button>
              <Link
                href="/live-kirtan"
                className="px-4 py-3 rounded-xl text-xs sm:text-sm font-bold border border-[#C59B27]/45 text-[#C59B27] hover:border-[#C59B27] transition flex items-center gap-1.5"
              >
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                Live 24/7 Darbar Sahib
              </Link>
            </div>
          </div>
        </section>

        {/* ================================================================
            TAB A: PURATAN KIRTAN & RAAG DARBAR PLAYER
        ================================================================ */}
        {activeTab === "kirtan" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Active Raag Console */}
            <div className="lg:col-span-5 rounded-3xl border-2 border-[#C59B27] bg-[#1B2A20] p-6 sm:p-8 shadow-md space-y-6 sticky top-24">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C59B27] px-3 py-1 rounded-full bg-[#121C15] border border-[#C59B27]/40">
                  VERIFIED ARCHIVE.ORG KIRTAN
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPlayerMode("native")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      playerMode === "native"
                        ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B]"
                        : "bg-[#121C15] border border-[#C59B27]/35 text-[#4A554E]"
                    }`}
                  >
                    Native MP3
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayerMode("embed")}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      playerMode === "embed"
                        ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B]"
                        : "bg-[#121C15] border border-[#C59B27]/35 text-[#4A554E]"
                    }`}
                  >
                    Archive.org Player
                  </button>
                </div>
              </div>

              <div>
                <p
                  lang="pa"
                  className="font-gurmukhi text-2xl sm:text-3xl font-semibold text-[#C59B27]"
                >
                  {currentTrack.gurmukhiTitle}
                </p>
                <h2 className="text-2xl font-serif font-bold mt-1">
                  {currentTrack.title}
                </h2>
                <p className="text-sm font-medium text-[#4A554E] mt-1">
                  {currentTrack.ragi}
                </p>
              </div>

              {/* Dual-Mode Audio Player: Native Stream vs Embedded Archive.org Playlist */}
              {playerMode === "native" ? (
                <div className="p-5 rounded-2xl bg-[#121C15] border border-[#C59B27]/35 space-y-4">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="tabular-nums">{formatAudioTime(currentTime)}</span>
                    <span className="uppercase tracking-widest text-[10px] text-[#C59B27]">
                      {isLoadingAudio
                        ? "Buffering Archive.org MP3 Stream..."
                        : isPlaying
                        ? "Streaming Authentic Puratan Shabad"
                        : "Ready to Stream"}
                    </span>
                    <span className="tabular-nums">{formatAudioTime(duration)}</span>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={duration || 1800}
                    value={currentTime}
                    onChange={(e) => seekTo(Number(e.target.value))}
                    aria-label="Seek Kirtan audio"
                    className="w-full accent-[#C59B27] cursor-pointer h-2 rounded-lg"
                  />

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <button
                      type="button"
                      onClick={prevTrack}
                      className="px-3.5 py-2 rounded-xl border border-[#C59B27]/40 text-xs font-semibold hover:border-[#C59B27] transition"
                    >
                      ⏮ Prev
                    </button>
                    <button
                      type="button"
                      onClick={togglePlayPause}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs sm:text-sm font-bold uppercase tracking-wider shadow-sm hover:brightness-105 transition"
                    >
                      {isLoadingAudio
                        ? "Buffering..."
                        : isPlaying
                        ? "⏸ Pause Recital"
                        : "▶ Play Puratan Shabad"}
                    </button>
                    <button
                      type="button"
                      onClick={nextTrack}
                      className="px-3.5 py-2 rounded-xl border border-[#C59B27]/40 text-xs font-semibold hover:border-[#C59B27] transition"
                    >
                      Next ⏭
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#C59B27]/20 text-xs">
                    <span className="font-semibold text-[#4A554E]">Volume</span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      aria-label="Volume control"
                      className="w-28 accent-[#C59B27] cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={toggleReadingVolumePreset}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                        isReadingVolumePreset
                          ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] border-[#C59B27]"
                          : "border-[#C59B27]/40 text-[#C59B27]"
                      }`}
                    >
                      🎻 25% Reading Vol
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#121C15] border border-[#C59B27]/40 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-[#C59B27]">
                      Embedded Internet Archive Playlist Player
                    </span>
                    <a
                      href={currentTrack.directArchiveMp3Url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#C59B27] underline font-semibold"
                    >
                      Direct MP3 ↗
                    </a>
                  </div>
                  <div className="w-full h-[220px] rounded-xl overflow-hidden border border-[#C59B27]/40 bg-black">
                    <iframe
                      key={currentTrack.archiveEmbedUrl || "default-playlist"}
                      src={
                        currentTrack.archiveEmbedUrl ||
                        "https://archive.org/embed/a-volume-1?playlist=1"
                      }
                      title="Puratan Kirtan & Bani Archive Playlist"
                      className="w-full h-full border-0"
                      allow="autoplay; fullscreen"
                    />
                  </div>
                </div>
              )}

              {/* Raag Musicology & Tanti Saaj Metadata */}
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="p-4 rounded-2xl bg-[#121C15] border border-[#C59B27]/30">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C59B27]">
                    Tanti Saaj &amp; Pehar (Time of Day)
                  </p>
                  <p className="font-semibold mt-1">{currentTrack.tantiSaaj}</p>
                  <p className="text-xs text-[#4A554E] mt-0.5">
                    Prescribed Pehar: {currentTrack.timeOfDay}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#121C15] border border-[#C59B27]/30 space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C59B27]">
                    Raag Musicology &amp; Historical Lineage
                  </p>
                  <p className="text-[#4A554E] leading-relaxed">
                    {currentTrack.raagNotes}
                  </p>
                  <p className="text-[#4A554E] leading-relaxed pt-1 border-t border-[#C59B27]/20">
                    {currentTrack.historicalContext}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <a
                    href={currentTrack.directArchiveMp3Url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#C59B27] hover:underline"
                  >
                    Download Original MP3 ↗
                  </a>
                  <a
                    href={currentTrack.externalArchiveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#4A554E] hover:underline"
                  >
                    View on Archive.org ↗
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Curated Puratan Kirtan, Nitnem, Katha & Instrumental Repertoire */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-serif font-bold">
                    Complete Puratan Kirtan, Nitnem, Katha &amp; Tanti Saaj Library
                  </h2>
                  <p className="text-xs sm:text-sm text-[#4A554E]">
                    {filteredKirtanTracks.length} verified tracks across Puratan Ragis, Nitnem,
                    Katha, Background Reading Instrumentals (Sitar, Veena, Dilruba, Taus, Rabab),
                    and Live Gurdwara Streams.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => startReadingInstrumental()}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold shadow-sm hover:brightness-105 transition"
                  >
                    🎻 Start 25% Reading Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCustomModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl border border-[#C59B27]/50 bg-[#121C15] text-xs font-bold text-[#C59B27] hover:border-[#C59B27] transition"
                  >
                    + Suggest a Kirtan / Bani for Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAdminQueue((v) => !v)}
                    className="px-3.5 py-2 rounded-xl border border-[#C59B27] bg-[#121C15] text-xs font-bold text-[#C59B27] hover:brightness-105 transition"
                  >
                    {showAdminQueue ? "Hide" : "Open"} Admin Review Queue ({pendingSubmissionsCount} Pending)
                  </button>
                </div>
              </div>

              {/* Collection Filter Tabs + Track Search */}
              <div className="p-4 rounded-2xl bg-[#1B2A20] border border-[#C59B27]/40 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "All", label: "All Tracks" },
                    { id: "Puratan Kirtan Masters", label: "੧ · Puratan Kirtan Masters" },
                    { id: "Background Raag Instrumentals", label: "੨ · Sitar, Veena, Dilruba & Taus (Reading Mode)" },
                    { id: "Complete Nitnem & Sacred Bani", label: "੩ · Complete Nitnem & Bani" },
                    { id: "Puratan Katha & Vichaar", label: "੪ · Puratan Katha & Vichaar" },
                    { id: "Live 24/7 Gurdwara Broadcasts", label: "🔴 Live 24/7 Gurdwara Streams" },
                  ].map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setKirtanCollectionFilter(col.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        kirtanCollectionFilter === col.id
                          ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B]"
                          : "bg-[#121C15] border border-[#C59B27]/35 text-[#4A554E] hover:border-[#C59B27]"
                      }`}
                    >
                      {col.label}
                    </button>
                  ))}
                </div>

                <input
                  type="search"
                  value={kirtanQuery}
                  onChange={(e) => setKirtanQuery(e.target.value)}
                  placeholder="Search Shabad, Ragi (Bhai Avtar Singh, Sant Singh Maskeen), Raag, or Instrument (Sitar, Veena, Dilruba, Taus)..."
                  aria-label="Search Kirtan, Nitnem, Katha, or Instrumental tracks"
                  className="w-full rounded-xl border border-[#C59B27]/45 bg-[#121C15] px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#C59B27]"
                />
              </div>

              <div className="space-y-4">
                {filteredKirtanTracks.map((track) => {
                  const active = currentTrack.id === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => handleTrackClick(track)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleTrackClick(track);
                        }
                      }}
                      className={`p-6 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-4 ${
                        active
                          ? "bg-[#1B2A20] border-2 border-[#C59B27] shadow-md"
                          : "bg-[#F3ECE0] border-[#C59B27]/35 hover:border-[#C59B27]"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span
                            lang="pa"
                            className="h-10 w-10 rounded-xl bg-[#121C15] border border-[#C59B27]/45 font-gurmukhi text-base font-bold text-[#C59B27] flex items-center justify-center shrink-0"
                          >
                            {track.numeral}
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C59B27]">
                                {track.raag}
                              </span>
                              <span className="text-xs text-[#4A554E]">
                                • {track.durationLabel}
                              </span>
                            </div>
                            <p
                              lang="pa"
                              className="font-gurmukhi text-lg font-medium text-[#D97706] mt-0.5"
                            >
                              {track.gurmukhiTitle}
                            </p>
                            <h3 className="text-lg font-serif font-bold">
                              {track.title}
                            </h3>
                            <p className="text-xs font-medium text-[#4A554E]">
                              {track.ragi}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTrackClick(track);
                          }}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition ${
                            active && isPlaying
                              ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B]"
                              : "bg-[#121C15] border border-[#C59B27]/50 text-[#C59B27] hover:border-[#C59B27]"
                          }`}
                        >
                          {active && isPlaying ? "⏸ Playing" : "▶ Play Shabad"}
                        </button>
                      </div>

                      <p className="text-xs sm:text-sm text-[#4A554E] leading-relaxed">
                        {track.raagNotes}
                      </p>

                      <div className="pt-3 border-t border-[#C59B27]/20 flex flex-wrap items-center justify-between gap-2 text-xs text-[#4A554E]">
                        <span>Instruments: {track.tantiSaaj}</span>
                        <a
                          href={track.directArchiveMp3Url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="font-bold text-[#C59B27] hover:underline"
                        >
                          Direct Stream / Source Link ↗
                        </a>
                      </div>
                    </div>
                  );
                })}

                {filteredKirtanTracks.length === 0 && (
                  <div className="p-8 rounded-2xl border border-[#C59B27]/40 bg-[#1B2A20] text-center space-y-3">
                    <p className="text-sm font-serif font-bold">
                      No verified tracks in this category yet.
                    </p>
                    <p className="text-xs text-[#4A554E] max-w-md mx-auto leading-relaxed">
                      We only list verified working streams and local MP3 files in{" "}
                      <code>public/audio/</code>. Submit a track for review or approve a
                      pending track in the Admin Review Queue below.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsCustomModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider"
                    >
                      + Suggest a Kirtan / Bani for Review
                    </button>
                  </div>
                )}
              </div>

              {/* ============================================================
                  COLLAPSIBLE ADMIN REVIEW QUEUE (VERIFY & PROMOTE TRACKS)
              ============================================================ */}
              <div className="rounded-2xl border-2 border-[#C59B27]/60 bg-[#1B2A20] p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C59B27]">
                      MANUAL AUDIO VERIFICATION • PUBLIC.KIRTAN_SUBMISSIONS
                    </span>
                    <h3 className="text-lg sm:text-xl font-serif font-bold mt-0.5">
                      Admin Review Queue ({pendingSubmissionsCount} Pending Verification)
                    </h3>
                    <p className="text-xs text-[#4A554E]">
                      Inspect submitted tracks, verify that the audio matches the Kirtaniye
                      and Shabad, and click Approve to promote to the live player.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCustomModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold"
                    >
                      + Submit New Track
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAdminQueue((v) => !v)}
                      className="px-3 py-2 rounded-xl border border-[#C59B27]/45 text-xs font-bold"
                    >
                      {showAdminQueue ? "Collapse ↑" : "Expand Queue ↓"}
                    </button>
                  </div>
                </div>

                {showAdminQueue && (
                  <div className="space-y-3 pt-2 border-t border-[#C59B27]/25">
                    {submissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-4 rounded-xl bg-[#121C15] border border-[#C59B27]/35 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                sub.status === "approved"
                                  ? "bg-emerald-600/20 text-emerald-700 border border-emerald-600/40"
                                  : sub.status === "rejected"
                                  ? "bg-red-600/20 text-red-700 border border-red-600/40"
                                  : "bg-amber-500/20 text-[#C59B27] border border-[#C59B27]/50"
                              }`}
                            >
                              {sub.status}
                            </span>
                            <span className="text-[11px] font-bold text-[#C59B27]">
                              {sub.category} • {sub.raag}
                            </span>
                            <span className="text-[11px] text-[#4A554E]">
                              by {sub.submittedBy}
                            </span>
                          </div>
                          {sub.gurmukhiTitle && (
                            <p
                              lang="pa"
                              className="font-gurmukhi text-sm font-medium text-[#D97706]"
                            >
                              {sub.gurmukhiTitle}
                            </p>
                          )}
                          <h4 className="text-base font-serif font-bold">
                            {sub.title} — <span className="font-sans font-normal text-xs">{sub.ragi}</span>
                          </h4>
                          <p className="text-xs text-[#4A554E] leading-relaxed">
                            {sub.authenticityNotes}
                          </p>
                          <a
                            href={sub.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-xs font-bold text-[#C59B27] hover:underline break-all"
                          >
                            Verify Source Audio Link: {sub.sourceUrl} ↗
                          </a>
                        </div>

                        <div className="flex sm:flex-col gap-2 shrink-0">
                          {sub.status !== "approved" && (
                            <button
                              type="button"
                              onClick={() => approveSubmission(sub.id)}
                              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider shadow-sm hover:brightness-105 transition"
                            >
                              ✓ Approve
                            </button>
                          )}
                          {sub.status !== "rejected" && (
                            <button
                              type="button"
                              onClick={() => rejectSubmission(sub.id)}
                              className="px-3.5 py-2 rounded-xl border border-[#C59B27]/40 text-xs font-bold text-[#4A554E] hover:border-red-500 hover:text-red-600 transition"
                            >
                              ✕ Reject
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            TAB B: INTERACTIVE GRANTH BOOKREADER & CHAPTER VIEWER
        ================================================================ */}
        {activeTab === "granths" && (
          <div className="space-y-8">
            {/* Search & Category Filter Bar */}
            <div className="p-6 rounded-2xl bg-[#1B2A20] border border-[#C59B27]/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {[
                  "All",
                  "Scriptural Teeka & Manuscript",
                  "Historical Chronicle",
                  "Gurmat Musicology & Rehit",
                ].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setGranthCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                      granthCategory === cat
                        ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] font-bold"
                        : "bg-[#121C15] border border-[#C59B27]/35 text-[#4A554E] hover:border-[#C59B27]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="w-full md:w-80">
                <input
                  type="search"
                  value={granthQuery}
                  onChange={(e) => setGranthQuery(e.target.value)}
                  placeholder="Search Granth, author, or topic..."
                  aria-label="Search Historical Granths"
                  className="w-full rounded-xl border border-[#C59B27]/45 bg-[#121C15] px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#C59B27]"
                />
              </div>
            </div>

            {/* Granth Cards Grid (Max 3 per row) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredGranths.map((granth) => (
                <article
                  key={granth.id}
                  className="rounded-2xl border border-[#C59B27]/40 bg-[#1B2A20] p-6 shadow-sm hover:border-[#C59B27] transition flex flex-col justify-between gap-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        lang="pa"
                        className="h-8 w-8 rounded-lg bg-[#121C15] border border-[#C59B27]/40 font-gurmukhi text-sm font-bold text-[#C59B27] flex items-center justify-center"
                      >
                        {granth.numeral}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#C59B27] px-2.5 py-1 rounded-full bg-[#121C15] border border-[#C59B27]/30">
                        {granth.category}
                      </span>
                    </div>

                    <div>
                      <p
                        lang="pa"
                        className="font-gurmukhi text-base font-medium text-[#D97706]"
                      >
                        {granth.gurmukhiTitle}
                      </p>
                      <h3 className="text-xl font-serif font-bold mt-0.5">
                        {granth.title}
                      </h3>
                      <p className="text-xs font-semibold text-[#4A554E] mt-1">
                        {granth.author} • {granth.period}
                      </p>
                    </div>

                    <p className="text-sm text-[#4A554E] leading-relaxed">
                      {granth.summary}
                    </p>

                    <div className="p-3.5 rounded-xl bg-[#121C15] border border-[#C59B27]/25 text-xs text-[#4A554E] leading-relaxed">
                      <strong className="text-[#C59B27] block mb-0.5">
                        Built-In Reader Features:
                      </strong>
                      {granth.significance}
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-[#C59B27]/25">
                    <button
                      type="button"
                      onClick={() => openGranthModal(granth, "bookreader")}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider shadow-sm hover:brightness-105 transition"
                    >
                      Open 2-Up BookReader Theater →
                    </button>
                    <button
                      type="button"
                      onClick={() => openGranthModal(granth, "native")}
                      className="w-full py-2 px-4 rounded-xl border border-[#C59B27]/45 bg-[#121C15] text-xs font-bold uppercase tracking-wider hover:border-[#C59B27] transition"
                    >
                      {granth.supportsLiveAngReader
                        ? "Open Instant Native Ang 1–1430 Reader"
                        : "Open Instant Native Chapter Reader"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================
            DUAL-MODE BUILT-IN GRANTH READER EXTENSION MODAL
        ================================================================ */}
        {selectedGranth && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={selectedGranth.title}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto"
          >
            <div
              className={`relative w-full ${
                isFullscreenModal ? "max-w-[98vw] min-h-[94vh]" : "max-w-6xl"
              } rounded-3xl border-2 border-[#C59B27] bg-[#1B2A20] p-5 sm:p-7 shadow-2xl space-y-5 my-4`}
            >
              {/* Modal Top Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#C59B27]/30 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C59B27]">
                    {selectedGranth.category} • {selectedGranth.volumesCount}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold mt-0.5">
                    {selectedGranth.title}
                  </h2>
                  <p className="text-xs text-[#4A554E]">{selectedGranth.author}</p>
                </div>

                {/* Mode Switcher + Reading Music + Fullscreen + Close */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startReadingInstrumental()}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                      currentTrack.category === "Background Raag Instrumentals" && isPlaying
                        ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] border-[#C59B27]"
                        : "bg-[#121C15] border-[#C59B27]/45 text-[#C59B27] hover:border-[#C59B27]"
                    }`}
                    title="Play gentle Sitar, Veena, Dilruba & Taus instrumental at 25% volume while reading"
                  >
                    🎻 {currentTrack.category === "Background Raag Instrumentals" && isPlaying ? "25% Reading Music On" : "25% Reading Music"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalMode("bookreader")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                      modalMode === "bookreader"
                        ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B]"
                        : "bg-[#121C15] border border-[#C59B27]/40 text-[#4A554E]"
                    }`}
                  >
                    ੧ · Interactive BookReader (2-Up Flipbook)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalMode("native")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                      modalMode === "native"
                        ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B]"
                        : "bg-[#121C15] border border-[#C59B27]/40 text-[#4A554E]"
                    }`}
                  >
                    ੨ · Native On-Page Chapter &amp; Ang Reader
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFullscreenModal((v) => !v)}
                    className="px-3 py-2 rounded-xl border border-[#C59B27]/45 text-xs font-semibold hover:border-[#C59B27]"
                  >
                    {isFullscreenModal ? "Standard Size" : "⤢ Expand View"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedGranth(null)}
                    aria-label="Close reader modal"
                    className="px-3.5 py-2 rounded-xl border border-[#C59B27]/45 text-xs font-bold hover:border-[#C59B27]"
                  >
                    ✕ Close
                  </button>
                </div>
              </div>

              {/* ============================================================
                  MODE 1: INTERACTIVE ARCHIVE.ORG BOOKREADER THEATER (?ui=embed#mode/2up)
              ============================================================ */}
              {modalMode === "bookreader" && (
                <div className="space-y-4">
                  {/* Edition / Volume Switcher if multiple editions exist */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                      {selectedGranth.editions.map((ed, idx) => (
                        <button
                          key={ed.label}
                          type="button"
                          onClick={() => setSelectedEditionIdx(idx)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                            selectedEditionIdx === idx
                              ? "bg-[#121C15] border-2 border-[#C59B27] text-[#C59B27]"
                              : "bg-[#121C15]/60 border border-[#C59B27]/30 text-[#4A554E]"
                          }`}
                        >
                          {ed.label}
                        </button>
                      ))}
                    </div>

                    <a
                      href={
                        selectedGranth.editions[selectedEditionIdx]
                          ?.archiveDetailsUrl ||
                        selectedGranth.editions[0].archiveDetailsUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#C59B27] hover:underline"
                    >
                      Open Full Archive.org BookReader in New Tab ↗
                    </a>
                  </div>

                  {/* Full-Height 75vh Interactive BookReader Container */}
                  <div className="w-full h-[75vh] rounded-2xl overflow-hidden border-2 border-[#C59B27]/60 bg-[#0F172A] shadow-inner">
                    <iframe
                      key={
                        selectedGranth.editions[selectedEditionIdx]?.embedUrl ||
                        selectedGranth.editions[0].embedUrl
                      }
                      src={
                        selectedGranth.editions[selectedEditionIdx]?.embedUrl ||
                        selectedGranth.editions[0].embedUrl
                      }
                      title={`${selectedGranth.title} Interactive BookReader`}
                      className="w-full h-full border-0"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* ============================================================
                  MODE 2: NATIVE ON-PAGE CHAPTER & LIVE ANG 1-1430 READER
              ============================================================ */}
              {modalMode === "native" && (
                <div className="space-y-6">
                  {/* Live BaniDB Ang-by-Ang Reader for SGGS Darpan & Puratan Manuscript */}
                  {selectedGranth.supportsLiveAngReader && (
                    <div className="p-5 rounded-2xl bg-[#121C15] border-2 border-[#C59B27]/50 space-y-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#C59B27]/25 pb-4">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C59B27]">
                            LIVE NATIVE ANG-BY-ANG READER (ANG 1 TO 1430)
                          </span>
                          <h3 className="text-lg font-serif font-bold">
                            Ang {activeAng} • Gurmukhi + Prof. Sahib Singh Darpan Teeka + English
                          </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            disabled={activeAng <= 1 || loadingAng}
                            onClick={() => void fetchLiveAng(activeAng - 1)}
                            className="px-3 py-1.5 rounded-xl border border-[#C59B27]/40 text-xs font-bold disabled:opacity-40"
                          >
                            ← Prev Ang
                          </button>

                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              void fetchLiveAng(Number(angInput) || 1);
                            }}
                            className="flex items-center gap-1.5"
                          >
                            <label htmlFor="ang-jump-input" className="text-xs font-semibold">
                              Ang:
                            </label>
                            <input
                              id="ang-jump-input"
                              type="number"
                              min={1}
                              max={1430}
                              value={angInput}
                              onChange={(e) => setAngInput(e.target.value)}
                              className="w-20 rounded-xl border border-[#C59B27]/50 bg-[#1B2A20] px-2.5 py-1.5 text-xs font-bold text-center"
                            />
                            <button
                              type="submit"
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold"
                            >
                              Go
                            </button>
                          </form>

                          <button
                            type="button"
                            disabled={activeAng >= 1430 || loadingAng}
                            onClick={() => void fetchLiveAng(activeAng + 1)}
                            className="px-3 py-1.5 rounded-xl border border-[#C59B27]/40 text-xs font-bold disabled:opacity-40"
                          >
                            Next Ang →
                          </button>

                          <button
                            type="button"
                            onClick={() => setLarivaarMode((v) => !v)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                              larivaarMode
                                ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] border-[#C59B27]"
                                : "border-[#C59B27]/40"
                            }`}
                          >
                            {larivaarMode ? "Larivaar (Unbroken)" : "Padchhed (Spaced)"}
                          </button>
                        </div>
                      </div>

                      {loadingAng ? (
                        <div className="py-12 text-center text-sm text-[#4A554E]">
                          Loading Ang {activeAng} and Prof. Sahib Singh Darpan Teeka...
                        </div>
                      ) : (
                        <div className="max-h-[55vh] overflow-y-auto space-y-4 pr-2">
                          {angVerses.map((v) => (
                            <div
                              key={v.verseId}
                              className="p-4 rounded-xl bg-[#1B2A20] border border-[#C59B27]/30 space-y-2"
                            >
                              <p
                                lang="pa"
                                className="font-gurmukhi text-xl sm:text-2xl leading-relaxed text-[#C59B27]"
                              >
                                {larivaarMode ? v.larivaarUnicode : v.gurmukhiUnicode}
                              </p>
                              {v.transliteration && (
                                <p className="text-xs italic text-[#4A554E]">
                                  {v.transliteration}
                                </p>
                              )}
                              {v.punjabiViakhia && (
                                <p
                                  lang="pa"
                                  className="font-gurmukhi text-sm sm:text-base text-[#D97706] leading-relaxed pt-1 border-t border-[#C59B27]/15"
                                >
                                  <strong>ਪ੍ਰੋ. ਸਾਹਿਬ ਸਿੰਘ ਦਰਪਣ ਟੀਕਾ:</strong>{" "}
                                  {v.punjabiViakhia}
                                </p>
                              )}
                              {v.englishTranslation && (
                                <p className="text-xs sm:text-sm leading-relaxed">
                                  {v.englishTranslation}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Curated Native Chapters & Exegesis Viewer */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedGranth.chapters.map((ch, idx) => (
                        <button
                          key={ch.title}
                          type="button"
                          onClick={() => setSelectedChapterIdx(idx)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                            selectedChapterIdx === idx
                              ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B]"
                              : "bg-[#121C15] border border-[#C59B27]/35 text-[#4A554E]"
                          }`}
                        >
                          {ch.title}
                        </button>
                      ))}
                    </div>

                    {selectedGranth.chapters[selectedChapterIdx] && (
                      <div className="p-6 rounded-2xl bg-[#121C15] border border-[#C59B27]/40 space-y-4">
                        <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#C59B27]">
                          {selectedGranth.chapters[selectedChapterIdx].reference}
                        </span>
                        <p
                          lang="pa"
                          className="font-gurmukhi text-2xl sm:text-3xl leading-relaxed text-[#C59B27]"
                        >
                          {selectedGranth.chapters[selectedChapterIdx].gurmukhi}
                        </p>
                        <p className="text-sm italic text-[#4A554E]">
                          {
                            selectedGranth.chapters[selectedChapterIdx]
                              .transliteration
                          }
                        </p>
                        <p
                          lang="pa"
                          className="font-gurmukhi text-base text-[#D97706] leading-relaxed pt-2 border-t border-[#C59B27]/20"
                        >
                          {selectedGranth.chapters[selectedChapterIdx].punjabiTeeka}
                        </p>
                        <p className="text-base font-medium leading-relaxed">
                          {
                            selectedGranth.chapters[selectedChapterIdx]
                              .englishTranslation
                          }
                        </p>
                        <div className="p-4 rounded-xl bg-[#1B2A20] border border-[#C59B27]/25 text-xs sm:text-sm text-[#4A554E] leading-relaxed">
                          <strong className="text-[#C59B27] block mb-1">
                            Scholarly &amp; Historical Commentary:
                          </strong>
                          {
                            selectedGranth.chapters[selectedChapterIdx]
                              .scholarlyNote
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#C59B27]/30">
                <div className="flex flex-wrap gap-3">
                  <a
                    href={
                      selectedGranth.editions[selectedEditionIdx]
                        ?.archiveDetailsUrl ||
                      selectedGranth.editions[0].archiveDetailsUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider"
                  >
                    View Complete Volume on Archive.org ↗
                  </a>
                  <a
                    href={selectedGranth.gurmatVeecharUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl border border-[#C59B27]/50 bg-[#121C15] text-xs font-semibold hover:border-[#C59B27]"
                  >
                    Browse GurmatVeechar Repository ↗
                  </a>
                </div>
                <Link
                  href="/nitnem"
                  className="text-xs font-semibold text-[#C59B27] hover:underline"
                >
                  Open Live Nitnem &amp; Bani Reader →
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
