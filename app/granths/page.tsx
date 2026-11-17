"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ChitrakariCardHeader } from "@/components/chitrakari-card-header";
import {
  EditableHeritageImage,
  useCmsSiteState,
  checkVerifiedAdminStatus,
  resolveCmsFontFamily,
  resolveCmsHeadingClass,
  resolveCmsBodyClass,
  resolveCmsGurmukhiClass,
  resolveCmsCardLayoutClass,
  getPageTransitionClass,
} from "@/components/editable-heritage-image";
import {
  InlineTopicEditor,
  InlineOrderControls,
  InlineSectionBanner,
  SlidePresentationCanvas,
  GodModeText,
  GodModeBox,
  HiddenItemBadgeBar,
  applyCmsVisibilityOrder,
  useGodModeTextValue,
  useVerifiedLiveEdit,
  type InlineTopicEditData,
} from "@/components/inline-cms-editor";
import { AnimatedModal } from "@/components/animated-modal";
import { SikhiIcon } from "@/components/sikhi-icons";
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

interface RaagInfo {
  order: number;
  name: string;
  gurmukhi: string;
  angRange: string;
  pehar: "Amrit Vela" | "Morning" | "Afternoon" | "Evening" | "Night";
  timeWindow: string;
  ras: string;
  gurus: string;
}

const TANTI_SAAJ_LIST = [
  { name: "Rabab (ਰਬਾਬ)", note: "Plucked lute of Bhai Mardana Ji & Guru Nanak Dev Ji." },
  { name: "Saranda (ਸਰੰਦਾ)", note: "Deep bowed instrument tailored for meend & Vairaag." },
  { name: "Taus (ਤਾਊਸ)", note: "Peacock-shaped bowed lute conceived by Guru Hargobind Sahib Ji." },
  { name: "Dilruba (ਦਿਲਰੁਬਾ)", note: "Portable bowed lute designed by Guru Gobind Singh Ji." },
  { name: "Jori–Pakhawaj (ਜੋੜੀ-ਪਖਾਵਜ)", note: "Classical Dhrupad & Partaal twin drums introduced by Guru Arjan Dev Ji." },
];

const SGGS_31_RAAGS: RaagInfo[] = [
  { order: 1, name: "Sri Raag", gurmukhi: "ਸਿਰੀ ਰਾਗੁ", angRange: "14–93", pehar: "Evening", timeWindow: "6 PM – 9 PM", ras: "Detachment, humility & reverence", gurus: "Guru Nanak, Amar Das, Ram Das, Arjan Dev; Kabir, Trilochan, Beni, Ravidas" },
  { order: 2, name: "Majh", gurmukhi: "ਮਾਝ", angRange: "94–150", pehar: "Afternoon", timeWindow: "3 PM – 6 PM", ras: "Tender longing & Barah Maha union", gurus: "Guru Nanak, Angad, Amar Das, Ram Das, Arjan Dev" },
  { order: 3, name: "Gauri", gurmukhi: "ਗਉੜੀ", angRange: "151–346", pehar: "Evening", timeWindow: "6 PM – 9 PM", ras: "Serious contemplation & Sukhmani peace", gurus: "Guru Nanak, Amar Das, Ram Das, Arjan Dev, Tegh Bahadur; Kabir, Namdev, Ravidas" },
  { order: 4, name: "Asa", gurmukhi: "ਆਸਾ", angRange: "347–488", pehar: "Amrit Vela", timeWindow: "3 AM – 6 AM", ras: "Dawn hope & Asa Di Vaar awakening", gurus: "Guru Nanak, Angad, Amar Das, Ram Das, Arjan Dev; Kabir, Namdev, Ravidas, Dhanna" },
  { order: 5, name: "Gujri", gurmukhi: "ਗੂਜਰੀ", angRange: "489–526", pehar: "Morning", timeWindow: "9 AM – 12 PM", ras: "Quiet devotion & inner contentment", gurus: "Guru Nanak, Amar Das, Ram Das, Arjan Dev; Kabir, Namdev, Ravidas, Trilochan, Jaidev" },
  { order: 6, name: "Devgandhari", gurmukhi: "ਦੇਵਗੰਧਾਰੀ", angRange: "527–536", pehar: "Morning", timeWindow: "9 AM – 12 PM", ras: "Humble plea & surrender of ego", gurus: "Guru Ram Das, Arjan Dev, Tegh Bahadur" },
  { order: 7, name: "Bihagara", gurmukhi: "ਬਿਹਾਗੜਾ", angRange: "537–556", pehar: "Night", timeWindow: "9 PM – 12 AM", ras: "Nocturnal yearning & serene joy", gurus: "Guru Ram Das, Arjan Dev" },
  { order: 8, name: "Wadahans", gurmukhi: "ਵਡਹੰਸੁ", angRange: "557–594", pehar: "Afternoon", timeWindow: "12 PM – 3 PM", ras: "Lavan & Alahnian: joy & cosmic acceptance", gurus: "Guru Nanak, Amar Das, Ram Das, Arjan Dev" },
  { order: 9, name: "Sorath", gurmukhi: "ਸੋਰਠਿ", angRange: "595–659", pehar: "Night", timeWindow: "9 PM – 12 AM", ras: "Soothing trust & steady confidence", gurus: "Guru Nanak, Amar Das, Ram Das, Arjan Dev, Tegh Bahadur; Kabir, Namdev, Ravidas, Bhikhan" },
  { order: 10, name: "Dhanasari", gurmukhi: "ਧਨਾਸਰੀ", angRange: "660–695", pehar: "Afternoon", timeWindow: "12 PM – 3 PM", ras: "Aarti (Gagan Mai Thaal): cosmic wonder", gurus: "Guru Nanak, Amar Das, Ram Das, Arjan Dev, Tegh Bahadur; Kabir, Namdev, Ravidas, Sain, Pipa, Dhanna" },
  { order: 11, name: "Jaitsri", gurmukhi: "ਜੈਤਸਰੀ", angRange: "696–710", pehar: "Evening", timeWindow: "3 PM – 6 PM", ras: "Perseverance & humility over pride", gurus: "Guru Ram Das, Arjan Dev, Tegh Bahadur" },
  { order: 12, name: "Todi", gurmukhi: "ਟੋਡੀ", angRange: "711–718", pehar: "Morning", timeWindow: "9 AM – 12 PM", ras: "Plaintive gentleness & refuge", gurus: "Guru Ram Das, Arjan Dev, Tegh Bahadur; Namdev" },
  { order: 13, name: "Bairari", gurmukhi: "ਬੈਰਾੜੀ", angRange: "719–720", pehar: "Afternoon", timeWindow: "12 PM – 3 PM", ras: "Concentrated remembrance", gurus: "Guru Ram Das, Arjan Dev" },
  { order: 14, name: "Tilang", gurmukhi: "ਤਿਲੰਗ", angRange: "721–727", pehar: "Afternoon", timeWindow: "3 PM – 6 PM", ras: "Compassion & Baburvani candour", gurus: "Guru Nanak, Ram Das, Arjan Dev, Tegh Bahadur; Kabir, Namdev" },
  { order: 15, name: "Suhi", gurmukhi: "ਸੂਹੀ", angRange: "728–794", pehar: "Morning", timeWindow: "9 AM – 12 PM", ras: "Anand Karaj (Lavan) bridal joy", gurus: "Guru Nanak, Amar Das, Ram Das, Arjan Dev; Kabir, Ravidas, Sheikh Farid" },
  { order: 16, name: "Bilawal", gurmukhi: "ਬਿਲਾਵਲੁ", angRange: "795–858", pehar: "Morning", timeWindow: "6 AM – 9 AM", ras: "Morning radiance & grateful peace", gurus: "Guru Nanak, Amar Das, Ram Das, Arjan Dev, Tegh Bahadur; Kabir, Namdev, Ravidas, Sadhna" },
  { order: 17, name: "Gaund", gurmukhi: "ਗੋਂਡ", angRange: "859–875", pehar: "Morning", timeWindow: "9 AM – 12 PM", ras: "Fortitude dispelling illusion", gurus: "Guru Ram Das, Arjan Dev; Kabir, Namdev, Ravidas" },
  { order: 18, name: "Ramkali", gurmukhi: "ਰਾਮਕਲੀ", angRange: "876–974", pehar: "Amrit Vela", timeWindow: "5 AM – 8 AM", ras: "Anand Sahib & Sidh Gosht equipoise", gurus: "Guru Nanak, Amar Das, Ram Das, Arjan Dev, Tegh Bahadur; Kabir, Namdev, Ravidas, Beni, Satta & Balwand" },
  { order: 19, name: "Nat Narayan", gurmukhi: "ਨਟ ਨਾਰਾਇਣ", angRange: "975–983", pehar: "Evening", timeWindow: "6 PM – 9 PM", ras: "Spirited focus on the Beloved", gurus: "Guru Ram Das, Arjan Dev" },
  { order: 20, name: "Mali Gaura", gurmukhi: "ਮਾਲੀ ਗਉੜਾ", angRange: "984–988", pehar: "Afternoon", timeWindow: "3 PM – 6 PM", ras: "Cheerful contentment in Simran", gurus: "Guru Ram Das, Arjan Dev; Namdev" },
  { order: 21, name: "Maru", gurmukhi: "ਮਾਰੂ", angRange: "989–1106", pehar: "Afternoon", timeWindow: "12 PM – 3 PM", ras: "Fearless detachment in solitude", gurus: "Guru Nanak, Amar Das, Ram Das, Arjan Dev, Tegh Bahadur; Kabir, Namdev, Jaidev, Ravidas" },
  { order: 22, name: "Tukhari", gurmukhi: "ਤੁਖਾਰੀ", angRange: "1107–1117", pehar: "Night", timeWindow: "12 AM – 3 AM", ras: "Barah Maha seasonal yearning", gurus: "Guru Nanak, Ram Das, Arjan Dev" },
  { order: 23, name: "Kedara", gurmukhi: "ਕੇਦਾਰਾ", angRange: "1118–1124", pehar: "Night", timeWindow: "9 PM – 12 AM", ras: "Solemn humility & sanctuary", gurus: "Guru Ram Das, Arjan Dev; Kabir, Ravidas" },
  { order: 24, name: "Bhairao", gurmukhi: "ਭੈਰਉ", angRange: "1125–1167", pehar: "Amrit Vela", timeWindow: "3 AM – 6 AM", ras: "Sovereign gravity at dawn", gurus: "Guru Nanak, Amar Das, Ram Das, Arjan Dev; Kabir, Namdev, Ravidas" },
  { order: 25, name: "Basant", gurmukhi: "ਬਸੰਤੁ", angRange: "1168–1196", pehar: "Morning", timeWindow: "Spring / Any Time", ras: "Vernal renewal of the soul", gurus: "Guru Nanak, Amar Das, Ram Das, Arjan Dev, Tegh Bahadur; Kabir, Ramanand, Namdev, Ravidas" },
  { order: 26, name: "Sarang", gurmukhi: "ਸਾਰੰਗ", angRange: "1197–1253", pehar: "Afternoon", timeWindow: "12 PM – 3 PM", ras: "Chatrik thirst for Divine Grace", gurus: "Guru Nanak, Ram Das, Arjan Dev, Tegh Bahadur; Kabir, Namdev, Parmanand, Surdas" },
  { order: 27, name: "Malar", gurmukhi: "ਮਲਾਰ", angRange: "1254–1293", pehar: "Night", timeWindow: "Monsoon / 9 PM – 12 AM", ras: "Cooling monsoon relief", gurus: "Guru Nanak, Angad, Amar Das, Ram Das, Arjan Dev; Namdev, Ravidas" },
  { order: 28, name: "Kanara", gurmukhi: "ਕਾਨੜਾ", angRange: "1294–1318", pehar: "Night", timeWindow: "9 PM – 12 AM", ras: "Royal evening majesty & prayer", gurus: "Guru Ram Das, Arjan Dev; Namdev" },
  { order: 29, name: "Kalyan", gurmukhi: "ਕਲਿਆਣ", angRange: "1319–1326", pehar: "Evening", timeWindow: "6 PM – 9 PM", ras: "Auspicious dusk tranquility", gurus: "Guru Ram Das, Arjan Dev" },
  { order: 30, name: "Prabhati", gurmukhi: "ਪ੍ਰਭਾਤੀ", angRange: "1327–1351", pehar: "Amrit Vela", timeWindow: "4 AM – 7 AM", ras: "First light: pure illumination", gurus: "Guru Nanak, Amar Das, Ram Das, Arjan Dev, Tegh Bahadur; Kabir, Namdev, Beni" },
  { order: 31, name: "Jaijawanti", gurmukhi: "ਜੈਜਾਵੰਤੀ", angRange: "1352–1353", pehar: "Night", timeWindow: "9 PM – 12 AM", ras: "Victorious composure (Guru Tegh Bahadur Ji)", gurus: "Guru Tegh Bahadur Ji" },
];

function resolvePlayableAudioUrl(rawUrl: string): string {
  const trimmed = (rawUrl || "").trim();
  if (!trimmed) return "";
  const lower = trimmed.toLowerCase();
  if (lower.includes("drive.google.com") || lower.includes("docs.google.com")) {
    return `/api/media-stream?url=${encodeURIComponent(trimmed)}`;
  }
  if (lower.includes("dropbox.com")) {
    try {
      const parsed = new URL(trimmed);
      parsed.searchParams.delete("dl");
      parsed.searchParams.set("raw", "1");
      return parsed.toString();
    } catch {
      return trimmed.includes("?")
        ? trimmed.replace(/([?&])dl=\d/g, "$1raw=1")
        : `${trimmed}?raw=1`;
    }
  }
  return trimmed;
}

type RemoteKirtanTrack = {
  id: string;
  title: string;
  gurmukhi?: string;
  ragi: string;
  raag?: string;
  sourceUrl: string;
  duration?: string;
  imageUrl?: string;
  imageKey?: string;
};

type RemoteKirtanEdit = {
  title?: string;
  gurmukhi?: string;
  ragi?: string;
  raag?: string;
  sourceUrl?: string;
  imageUrl?: string;
  deleted?: boolean;
};

type RemoteSectionLayout = {
  titleAlign?: "left" | "center" | "right";
  widthMode?: "full" | "contained" | "compact";
  customTitle?: string;
  customSubtitle?: string;
  hidden?: boolean;
};

export default function GranthsAndKirtanPage() {
  const [activeTab, setActiveTab] = useState<"kirtan" | "granths">("kirtan");
  const [kirtanCollectionFilter, setKirtanCollectionFilter] = useState<string>("All");
  const [kirtanQuery, setKirtanQuery] = useState("");
  const [raagFilterPehar, setRaagFilterPehar] = useState<string>("All");
  const [raagSearch, setRaagSearch] = useState("");
  const localFileInputRef = React.useRef<HTMLInputElement | null>(null);
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

  const { user } = useAuth();
  const cms = useCmsSiteState();
  const isVerifiedLiveEdit = useVerifiedLiveEdit();

  // Remote Kirtan Vault, Edits, Frames & Approval Queue Submission State
  const [remoteKirtanTracks, setRemoteKirtanTracks] = useState<RemoteKirtanTrack[]>([]);
  const [remoteKirtanEdits, setRemoteKirtanEdits] = useState<Record<string, RemoteKirtanEdit>>({});
  const [remoteFrames, setRemoteFrames] = useState<Record<string, { src?: string; hidden?: boolean }>>({});
  const [sectionLayoutMap, setSectionLayoutMap] = useState<Record<string, RemoteSectionLayout>>({});
  const [isSubmitApprovalOpen, setIsSubmitApprovalOpen] = useState(false);
  const [subType, setSubType] = useState<"kirtan" | "pdf" | "post">("kirtan");
  const [subTitle, setSubTitle] = useState("");
  const [subSubtitle, setSubSubtitle] = useState("");
  const [subUrl, setSubUrl] = useState("");
  const [subBy, setSubBy] = useState("");
  const [subMsg, setSubMsg] = useState<string | null>(null);

  useEffect(() => {
    void fetch(`/api/site-frames?t=${Date.now()}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || typeof data !== "object") return;
        if (Array.isArray(data.kirtanTracks)) setRemoteKirtanTracks(data.kirtanTracks);
        if (data.kirtanEdits && typeof data.kirtanEdits === "object") {
          setRemoteKirtanEdits(data.kirtanEdits);
        }
        if (data.frames && typeof data.frames === "object") {
          setRemoteFrames(data.frames);
        }
        if (data.sectionLayoutMap && typeof data.sectionLayoutMap === "object") {
          setSectionLayoutMap(data.sectionLayoutMap);
        }
      })
      .catch(() => {
        // ignore offline errors
      });
  }, []);

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
    addLocalAudioFiles,
    showRequestToast,
  } = useKirtanAudio();

  const filteredRaags = useMemo(() => {
    const q = raagSearch.trim().toLowerCase();
    return SGGS_31_RAAGS.filter((r) => {
      const matchesPehar = raagFilterPehar === "All" || r.pehar === raagFilterPehar;
      if (!q) return matchesPehar;
      return (
        matchesPehar &&
        (r.name.toLowerCase().includes(q) ||
          r.gurmukhi.includes(raagSearch.trim()) ||
          r.ras.toLowerCase().includes(q) ||
          r.gurus.toLowerCase().includes(q))
      );
    });
  }, [raagFilterPehar, raagSearch]);

  const filteredKirtanTracks = useMemo(() => {
    const convertedRemote: (KirtanTrack & { imageUrl?: string; imageKey?: string })[] =
      remoteKirtanTracks.map((rt, idx) => {
        const playable = resolvePlayableAudioUrl(rt.sourceUrl);
        return {
          id: rt.id,
          numeral: String(idx + 2),
          category: "Verified Local & Approved Audio",
          title: rt.title,
          gurmukhiTitle: rt.gurmukhi || "ਗੁਰਮਤਿ ਕੀਰਤਨ",
          ragi: rt.ragi,
          raag: rt.raag || "Gurmat Kirtan",
          angCitation: "5TB Drive Vault",
          tantiSaaj: "Puratan Kirtan Archive",
          timeOfDay: "All Pehars",
          durationLabel: rt.duration || "Stream",
          durationSec: 0,
          audioUrl: playable,
          directArchiveMp3Url: playable,
          archiveEmbedUrl: "",
          externalArchiveUrl: rt.sourceUrl,
          raagNotes: `Streamed directly via LearnSikhi Media Proxy (${rt.ragi}).`,
          historicalContext: "",
          isCustomOrLocal: true,
          imageUrl: rt.imageUrl,
          imageKey: rt.imageKey || `kirtan-art-${rt.id}`,
        };
      });

    const baseSource: (KirtanTrack & { imageUrl?: string; imageKey?: string })[] =
      kirtanCollectionFilter === "Live 24/7 Gurdwara Broadcasts"
        ? liveStreams
        : kirtanCollectionFilter === "All"
          ? [...convertedRemote, ...tracks]
          : kirtanCollectionFilter === "Verified Local & Approved Audio"
            ? [
                ...convertedRemote,
                ...tracks.filter((t) => t.category === kirtanCollectionFilter),
              ]
            : tracks.filter((t) => t.category === kirtanCollectionFilter);

    const editedSource = baseSource
      .filter((t) => !remoteKirtanEdits[t.id]?.deleted)
      .map((t) => {
        const ed = remoteKirtanEdits[t.id];
        if (!ed) return t;
        const playable = ed.sourceUrl ? resolvePlayableAudioUrl(ed.sourceUrl) : t.audioUrl;
        return {
          ...t,
          title: ed.title || t.title,
          gurmukhiTitle: ed.gurmukhi || t.gurmukhiTitle,
          ragi: ed.ragi || t.ragi,
          raag: ed.raag || t.raag,
          audioUrl: playable,
          directArchiveMp3Url: ed.sourceUrl ? playable : t.directArchiveMp3Url,
          externalArchiveUrl: ed.sourceUrl || t.externalArchiveUrl,
          imageUrl: ed.imageUrl ?? t.imageUrl,
        };
      });

    const q = kirtanQuery.trim().toLowerCase();
    const matched = !q
      ? editedSource
      : editedSource.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.ragi.toLowerCase().includes(q) ||
            t.raag.toLowerCase().includes(q) ||
            t.tantiSaaj.toLowerCase().includes(q) ||
            t.gurmukhiTitle.includes(q)
        );
    return applyCmsVisibilityOrder(
      matched,
      (t) => t.id,
      "granths",
      cms,
      isVerifiedLiveEdit
    );
  }, [
    kirtanCollectionFilter,
    kirtanQuery,
    liveStreams,
    tracks,
    remoteKirtanTracks,
    remoteKirtanEdits,
    cms,
    isVerifiedLiveEdit,
  ]);

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
    const matched = HISTORICAL_GRANTHS.filter((g) => {
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
    return applyCmsVisibilityOrder(
      matched,
      (g) => g.id,
      "granths",
      cms,
      isVerifiedLiveEdit
    );
  }, [granthCategory, granthQuery, cms, isVerifiedLiveEdit]);

  const handleTrackClick = (track: KirtanTrack) => {
    if (currentTrack.id === track.id) {
      togglePlayPause();
    } else {
      playTrack(track);
    }
  };

  const layoutCfg = cms.layoutConfig || {};
  const secCfg = cms.securityConfig || {};
  const [isAdmin, setIsAdmin] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    let active = true;
    const syncAdmin = async () => {
      const ok = await checkVerifiedAdminStatus();
      if (active) setIsAdmin(ok);
    };
    void syncAdmin();
    window.addEventListener("learnsikhi-admin-change", syncAdmin);
    return () => {
      active = false;
      window.removeEventListener("learnsikhi-admin-change", syncAdmin);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const syncVerified = async () => {
      if (!user) {
        if (active) setEmailVerified(false);
        return;
      }
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        if (active) setEmailVerified(true);
        return;
      }
      try {
        const { data } = await supabase.auth.getUser();
        const confirmed = Boolean(
          data?.user?.email_confirmed_at ||
            (data?.user as { confirmed_at?: string } | undefined)?.confirmed_at
        );
        if (active) setEmailVerified(confirmed);
      } catch {
        if (active) setEmailVerified(false);
      }
    };
    void syncVerified();
    return () => {
      active = false;
    };
  }, [user]);

  const allowGuestKirtan = isAdmin || secCfg.allowGuestKirtanPlay !== false;
  const isMaintenancePaused = !isAdmin && Boolean(secCfg.readOnlyMaintenanceMode);
  const needsSignInForSub =
    !isAdmin &&
    Boolean(secCfg.requireSignInForSubmissions || secCfg.requireEmailVerification) &&
    !user;
  const needsEmailVerificationForSub =
    !isAdmin && Boolean(secCfg.requireEmailVerification) && Boolean(user) && !emailVerified;
  const hideIdentity = Boolean(secCfg.hideSubmitterIdentity);

  const kirtanSearchPlaceholder = useGodModeTextValue(
    "granths-kirtan-search-placeholder",
    "Search live broadcast or your loaded local .mp3 files..."
  );
  const raagSearchPlaceholder = useGodModeTextValue(
    "granths-raag-search-placeholder",
    "Search Raag, Guru, or Ras..."
  );
  const granthSearchPlaceholder = useGodModeTextValue(
    "granths-books-search-placeholder",
    "Search Granth, author, or topic..."
  );
  const pageFont = resolveCmsFontFamily(layoutCfg.fontFamily);
  const headingSizeCls = resolveCmsHeadingClass(layoutCfg.headingScale);
  const bodySizeCls = resolveCmsBodyClass(layoutCfg.bodyScale);
  const gurmukhiSizeCls = resolveCmsGurmukhiClass(layoutCfg.gurmukhiScale);

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
    <div
      style={{
        backgroundColor: layoutCfg.pageBgColor || "#FAF6EE",
        color: layoutCfg.bodyTextColor || "#171917",
        fontFamily: pageFont,
      }}
      className={`min-h-screen flex flex-col ${getPageTransitionClass(layoutCfg.pageTransition)}`}
    >
      <Header solid />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 pb-28">
        <InlineSectionBanner
          sectionId="granths-kirtan-hub"
          pageKey="granths"
          defaultTitle="Puratan Raag Darbar & Interactive Granths"
        />

        {/* Page Header */}
        {(() => {
          const liveHubSec = (cms.sectionLayoutMap?.["granths-kirtan-hub"] ||
            {}) as RemoteSectionLayout;
          const hubSec = {
            ...(sectionLayoutMap["granths-kirtan-hub"] || {}),
            ...liveHubSec,
          };
          if (hubSec.hidden) return null;
          const heroOv = cms.topicEdits?.["granths-hero-header"] as
            | InlineTopicEditData
            | undefined;
          const heroHeadingCls = heroOv?.fontScale
            ? resolveCmsHeadingClass(heroOv.fontScale)
            : "";
          const heroBodyCls = heroOv?.fontScale
            ? resolveCmsBodyClass(heroOv.fontScale)
            : "text-sm sm:text-base";
          const alignCls =
            hubSec.titleAlign === "center"
              ? "text-center items-center"
              : hubSec.titleAlign === "right"
                ? "text-right items-end"
                : "text-left items-start";
          const widthCls =
            hubSec.widthMode === "compact"
              ? "max-w-3xl mx-auto"
              : hubSec.widthMode === "contained"
                ? "max-w-5xl mx-auto"
                : "w-full";
          return (
            <GodModeBox id="granths-hero-box" pageKey="granths" label="Hero Section">
            <section
              style={{
                backgroundColor: heroOv?.bgColor || layoutCfg.cardBgColor || undefined,
                borderColor: heroOv?.borderColor || layoutCfg.accentColor || undefined,
                color: heroOv?.textColor || undefined,
                fontFamily: heroOv?.fontFamily
                  ? resolveCmsFontFamily(heroOv.fontFamily)
                  : undefined,
              }}
              className={`rounded-3xl border border-[#d4af37]/30 bg-[#1B2A20] p-8 md:p-10 shadow-xl shadow-black/10 dark:shadow-2xl dark:shadow-black/30 ${widthCls}`}
            >
              <div className="flex justify-end mb-2">
                <InlineTopicEditor
                  itemId="granths-hero-header"
                  label="Edit Hero Banner"
                  defaults={{
                    title:
                      hubSec.customTitle ||
                      "Puratan Raag Darbar & Interactive Granths",
                    gurmukhi: "ਗੁਰਮਤਿ ਸੰਗੀਤ ਅਤੇ ਇਤਿਹਾਸਕ ਗ੍ਰੰਥ",
                    badge:
                      "SANCTUARY ARCHIVE • PURATAN KIRTAN & GRANTH BOOKREADER",
                    subtitle:
                      hubSec.customSubtitle ||
                      "Stream authentic Puratan Gurbani Kirtan recordings by Bhai Avtar Singh Ji Ragi (proxied directly from Archive.org or our 5TB Drive Vault) or open our Dual-Mode Interactive BookReader & Live Ang 1–1430 Darpan Viewer.",
                  }}
                />
              </div>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className={`space-y-3 max-w-3xl flex flex-col ${alignCls}`}>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <GodModeText
                      id="granths-hero-badge"
                      pageKey="granths"
                      tag="span"
                      defaultText={
                        heroOv?.badge ||
                        "SANCTUARY ARCHIVE • PURATAN KIRTAN & GRANTH BOOKREADER"
                      }
                      className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#C59B27] px-3 py-1 rounded-full border border-[#C59B27]/40 bg-[#121C15]"
                    />
                    <GodModeText
                      id="granths-hero-gurmukhi"
                      pageKey="granths"
                      tag="span"
                      lang="pa"
                      defaultText={heroOv?.gurmukhi || "ਗੁਰਮਤਿ ਸੰਗੀਤ ਅਤੇ ਇਤਿਹਾਸਕ ਗ੍ਰੰਥ"}
                      className="font-gurmukhi text-sm text-[#D97706]"
                    />
                  </div>
                  <GodModeText
                    id="granths-hero-title"
                    pageKey="granths"
                    tag="h1"
                    defaultText={
                      heroOv?.title ||
                      hubSec.customTitle ||
                      "Puratan Raag Darbar & Interactive Granths"
                    }
                    style={{
                      color: heroOv?.textColor || layoutCfg.headingTextColor || undefined,
                    }}
                    className={`text-3xl sm:text-5xl ${heroHeadingCls} font-serif font-bold tracking-tight`}
                  />
                  <GodModeText
                    id="granths-hero-subtitle"
                    pageKey="granths"
                    tag="p"
                    defaultText={
                      heroOv?.subtitle ||
                      heroOv?.description ||
                      hubSec.customSubtitle ||
                      "Stream authentic Puratan Gurbani Kirtan recordings by Bhai Avtar Singh Ji Ragi (proxied directly from Archive.org or our 5TB Drive Vault) or open our Dual-Mode Interactive BookReader & Live Ang 1–1430 Darpan Viewer."
                    }
                    className={`${heroBodyCls} text-[#4A554E] leading-relaxed`}
                  />
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
                <GodModeText
                  id="granths-tab-kirtan"
                  pageKey="granths"
                  tag="span"
                  defaultText="੧ · Puratan Kirtan & Raag Player"
                />
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
                <GodModeText
                  id="granths-tab-bookreader"
                  pageKey="granths"
                  tag="span"
                  defaultText="੨ · Interactive Granth BookReader"
                />
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
        </GodModeBox>
          );
        })()}

        {/* ================================================================
            TAB A: PURATAN KIRTAN & RAAG DARBAR PLAYER
        ================================================================ */}
        {activeTab === "kirtan" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
            {/* Left Column: Live 24/7 Sri Harmandir Sahib Broadcast & Active Player Card */}
            <SlidePresentationCanvas
              id="granths-audio-player-canvas"
              pageKey="granths"
              label="Kirtan Audio Player"
              className="lg:col-span-5 w-full min-w-0"
            >
            <div className="w-full min-w-0 rounded-3xl border-2 border-[#C59B27] bg-[#1B2A20] text-[#FAF6EE] p-6 sm:p-8 shadow-md space-y-6">
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
            </SlidePresentationCanvas>

            {/* Right Column: Educational Kirtan & 31 Ragas Hub + Verified / Local Tracks */}
            <SlidePresentationCanvas
              id="granths-playlist-canvas"
              pageKey="granths"
              label="Kirtan & 31 Ragas Hub"
              className="lg:col-span-7 w-full min-w-0"
            >
            <div className="w-full min-w-0 space-y-6">
              <div className="rounded-3xl border border-[#C59B27]/40 bg-[#1B2A20] text-[#FAF6EE] p-6 space-y-4 w-full min-w-0">
                <div className="space-y-1.5 w-full min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C59B27]">
                    VERIFIED BROADCASTS • LOCAL MP3 PLAYBACK • GURMAT SANGEET
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-[#FAF6EE]">
                    Puratan Kirtan, Local Audio &amp; 31 Ragas Hub
                  </h2>
                  <p className="text-xs sm:text-sm text-[#E2E8F0] leading-relaxed">
                    Listen to the verified 24/7 Sri Darbar Sahib broadcast, play `.mp3` files
                    directly from your computer (e.g., Bhai Avtar Singh Ji recordings), or explore
                    all 31 Classical Raags of Sri Guru Granth Sahib Ji below.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-1">
                  {allowGuestKirtan ? (
                    <>
                      <input
                        ref={localFileInputRef}
                        type="file"
                        accept="audio/*,.mp3,.wav,.m4a,.ogg"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            const added = addLocalAudioFiles(e.target.files);
                            showRequestToast(
                              `Loaded ${added.length} local track${added.length > 1 ? "s" : ""} — now playing "${added[0].title}".`
                            );
                            e.target.value = "";
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => localFileInputRef.current?.click()}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold shadow-sm hover:brightness-105 transition"
                      >
                        📂 Play / Upload Local MP3 Files (e.g., Bhai Avtar Singh)
                      </button>
                    </>
                  ) : (
                    <span className="px-3.5 py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-xs font-bold text-amber-300">
                      🔒 Custom Audio Uploads Paused by Admin
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => startReadingInstrumental()}
                    className="px-3.5 py-2.5 rounded-xl border border-[#C59B27]/50 bg-[#121C15] text-xs font-bold text-[#E5C158] hover:border-[#C59B27] transition"
                  >
                    🎻 25% Reading Mode
                  </button>
                  {isMaintenancePaused ? (
                    <span className="px-3.5 py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-xs font-bold text-amber-300">
                      🛡️ Submissions Paused (Read-Only)
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSubMsg(null);
                        setIsSubmitApprovalOpen(true);
                      }}
                      className="px-3.5 py-2.5 rounded-xl border border-[#C59B27]/50 bg-[#121C15] text-xs font-bold text-[#E5C158] hover:border-[#C59B27] transition"
                    >
                      + Suggest Shabad / Drive Link
                    </button>
                  )}
                </div>
              </div>

              {/* Track Search & Playable Tracks (Live Darbar Sahib + Local / Approved) */}
              <GodModeBox id="granths-kirtan-search-box" pageKey="granths" label="Kirtan Search Box">
              <div className="p-4 rounded-2xl bg-[#1B2A20] text-[#FAF6EE] border border-[#d4af37]/30 shadow-xl shadow-black/10 dark:shadow-2xl dark:shadow-black/30 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "All", label: "All Playable Tracks" },
                    { id: "Live 24/7 Gurdwara Broadcasts", label: "🔴 Live 24/7 Darbar Sahib" },
                    { id: "Verified Local & Approved Audio", label: "📂 Local & Approved Tracks" },
                  ].map((col) => (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setKirtanCollectionFilter(col.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        kirtanCollectionFilter === col.id
                          ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B]"
                          : "bg-[#121C15] border border-[#C59B27]/35 text-[#E2E8F0] hover:border-[#C59B27]"
                      }`}
                    >
                      {col.label}
                    </button>
                  ))}
                </div>

                <GodModeText
                  id="granths-kirtan-search-placeholder"
                  pageKey="granths"
                  tag="span"
                  defaultText="Search live broadcast or your loaded local .mp3 files..."
                  className="block text-[10px] font-bold uppercase tracking-wider opacity-65"
                />
                <input
                  type="search"
                  value={kirtanQuery}
                  onChange={(e) => setKirtanQuery(e.target.value)}
                  placeholder={kirtanSearchPlaceholder}
                  aria-label="Search playable Kirtan tracks"
                  className="w-full rounded-xl border border-[#C59B27]/45 bg-[#121C15] px-4 py-2.5 text-xs sm:text-sm text-[#FAF6EE] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#C59B27]"
                />
              </div>
              </GodModeBox>

              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-start">
                {filteredKirtanTracks.map((track) => {
                  const active = currentTrack.id === track.id;
                  const imgKey = track.imageKey || `kirtan-art-${track.id}`;
                  const storedFrame = cms.frames?.[imgKey] || remoteFrames[imgKey];
                  const hasPicture =
                    !storedFrame?.hidden &&
                    Boolean(storedFrame?.src || track.imageUrl);
                  const ov = cms.topicEdits?.[track.id] as
                    | InlineTopicEditData
                    | undefined;
                  const cardHeadingCls = ov?.fontScale
                    ? resolveCmsHeadingClass(ov.fontScale)
                    : headingSizeCls;
                  const cardBodyCls = ov?.fontScale
                    ? resolveCmsBodyClass(ov.fontScale)
                    : bodySizeCls;
                  const displayTitle = ov?.title || track.title;
                  const displayGurmukhi = ov?.gurmukhi || track.gurmukhiTitle;
                  const displayRaag = ov?.badge || track.raag;
                  const displayRagi = ov?.subtitle || track.ragi;
                  const cardLayoutCls = resolveCmsCardLayoutClass(ov, "editorial");
                  return (
                    <div
                      key={track.id}
                      id={`topic-${track.id}`}
                      onClick={() => handleTrackClick(track)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleTrackClick(track);
                        }
                      }}
                      style={{
                        backgroundColor:
                          ov?.bgColor || (!active ? layoutCfg.cardBgColor || undefined : undefined),
                        borderColor:
                          ov?.borderColor || layoutCfg.accentColor || undefined,
                        color: ov?.textColor || undefined,
                        fontFamily: ov?.fontFamily
                          ? resolveCmsFontFamily(ov.fontFamily)
                          : undefined,
                      }}
                      className={`p-5 rounded-2xl border border-[#d4af37]/30 transition-all duration-300 ease-out cursor-pointer flex flex-col justify-between gap-3 scroll-mt-28 ${cardLayoutCls} ${
                        (cms.archivedIds || []).includes(track.id)
                          ? "opacity-55 ring-2 ring-amber-400/70"
                          : ""
                      } ${
                        active
                          ? "bg-[#1B2A20] text-[#FAF6EE] border-2 border-[#C59B27] shadow-2xl shadow-black/30"
                          : "bg-[#F3ECE0] text-[#171917] hover:border-[#d4af37] shadow-xl shadow-black/10 dark:shadow-2xl dark:shadow-black/30"
                      }`}
                    >
                      <HiddenItemBadgeBar itemId={track.id} />
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <InlineOrderControls
                          pageKey="granths"
                          itemId={track.id}
                          allIds={filteredKirtanTracks.map((t) => t.id)}
                        />
                        <InlineTopicEditor
                          itemId={track.id}
                          label="Edit Shabad"
                          defaults={{
                            title: track.title,
                            gurmukhi: track.gurmukhiTitle,
                            subtitle: track.ragi,
                            badge: track.raag,
                            description: track.raagNotes,
                          }}
                        />
                      </div>
                      {hasPicture && (
                        <EditableHeritageImage
                          imageKey={imgKey}
                          defaultSrc={storedFrame?.src || track.imageUrl || ""}
                          alt={displayTitle}
                          defaultOrientation="natural"
                        />
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            lang="pa"
                            className="h-10 w-10 rounded-xl bg-[#121C15] border border-[#C59B27]/45 font-gurmukhi text-base font-bold text-[#C59B27] flex items-center justify-center shrink-0"
                          >
                            {track.numeral}
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                style={{ color: layoutCfg.accentColor || undefined }}
                                className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C59B27]"
                              >
                                {displayRaag}
                              </span>
                              <span className={`text-xs ${active ? "text-[#E2E8F0]" : "text-[#4A554E]"}`}>
                                • {track.durationLabel}
                              </span>
                            </div>
                            <p
                              lang="pa"
                              className={`font-gurmukhi ${gurmukhiSizeCls} font-medium text-[#D97706] mt-0.5`}
                            >
                              {displayGurmukhi}
                            </p>
                            <h3 className={`${cardHeadingCls} font-serif font-bold truncate`}>
                              {displayTitle}
                            </h3>
                            <p className={`${cardBodyCls} font-medium ${active ? "text-[#E2E8F0]" : "text-[#4A554E]"}`}>
                              {displayRagi}
                            </p>
                            {ov?.description && (
                              <p className="text-xs opacity-75 mt-1">
                                {ov.description}
                              </p>
                            )}
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
                          {active && isPlaying ? "⏸ Playing" : "▶ Play"}
                        </button>
                      </div>

                      <p className={`text-xs sm:text-sm leading-relaxed ${active ? "text-[#E2E8F0]" : "text-[#4A554E]"}`}>
                        {track.raagNotes}
                      </p>
                    </div>
                  );
                })}

                {filteredKirtanTracks.length === 0 && (
                  <div className="p-6 rounded-2xl border border-[#C59B27]/40 bg-[#1B2A20] text-[#FAF6EE] text-center space-y-3">
                    <p className="text-sm font-serif font-bold">
                      No tracks in this filter yet.
                    </p>
                    <p className="text-xs text-[#E2E8F0] max-w-md mx-auto leading-relaxed">
                      Load `.mp3` files directly from your computer for instant playback or switch back to All Playable Tracks.
                    </p>
                    <button
                      type="button"
                      onClick={() => localFileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider"
                    >
                      📂 Play / Upload Local MP3 Files
                    </button>
                  </div>
                )}
              </div>

              {/* ============================================================
                  INTERACTIVE "WHAT IS GURMAT SANGEET & THE 31 RAGAS?" GUIDE
              ============================================================ */}
              <div className="rounded-3xl border border-[#C59B27]/45 bg-[#1B2A20] text-[#FAF6EE] p-6 sm:p-7 space-y-6 w-full min-w-0">
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C59B27]">
                    EDUCATIONAL GUIDE • GURMAT SANGEET &amp; 31 RAAG-PRAKAAR
                  </span>
                  <h3 className="text-2xl font-serif font-bold text-[#FAF6EE]">
                    What is Puratan Gurmat Sangeet &amp; The 31 Classical Ragas?
                  </h3>
                  <p className="text-xs sm:text-sm text-[#E2E8F0] leading-relaxed">
                    In Sri Guru Granth Sahib Ji (Ang 14–1353), Gurbani is arranged not by topic or
                    chronology, but by <strong className="text-[#E5C158]">31 Main Classical Raags</strong>,
                    each specifying the exact <strong className="text-[#E5C158]">Raag, Taal, and Ghar</strong>{" "}
                    so melody elevates the Shabad&apos;s emotional truth (<em>Ras</em>) into spiritual equipoise.
                  </p>
                </div>

                {/* 5 Tanti Saaj String Instruments */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {TANTI_SAAJ_LIST.map((inst) => (
                    <div
                      key={inst.name}
                      className="p-3.5 rounded-2xl bg-[#121C15] border border-[#C59B27]/30 space-y-1"
                    >
                      <p className="text-xs font-bold text-[#E5C158]">{inst.name}</p>
                      <p className="text-xs text-[#E2E8F0] leading-relaxed">{inst.note}</p>
                    </div>
                  ))}
                </div>

                {/* Search & Pehar Filter for the 31 Ragas */}
                <div className="space-y-3 pt-2 border-t border-[#C59B27]/25">
                  <GodModeBox id="granths-raag-search-box" pageKey="granths" label="31 Ragas Section & Search">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <GodModeText
                        id="granths-ragas-heading"
                        pageKey="granths"
                        tag="h4"
                        defaultText="All 31 Main Ragas of Sri Guru Granth Sahib Ji"
                        className="text-lg font-serif font-bold text-[#FAF6EE]"
                      />
                      <GodModeText
                        id="granths-ragas-subheading"
                        pageKey="granths"
                        tag="p"
                        defaultText={`Showing ${filteredRaags.length} of 31 Raags • Ang 14 (Sri Raag) to Ang 1353 (Jaijawanti)`}
                        className="text-xs text-[#E2E8F0]"
                      />
                    </div>
                    <div className="w-full sm:w-64">
                      <GodModeText
                        id="granths-raag-search-placeholder"
                        pageKey="granths"
                        tag="span"
                        defaultText="Search Raag, Guru, or Ras..."
                        className="block text-[10px] font-bold uppercase tracking-wider opacity-65 mb-1"
                      />
                      <input
                        type="search"
                        value={raagSearch}
                        onChange={(e) => setRaagSearch(e.target.value)}
                        placeholder={raagSearchPlaceholder}
                        aria-label="Search 31 classical Ragas"
                        className="w-full rounded-xl border border-[#C59B27]/45 bg-[#121C15] px-3.5 py-2 text-xs text-[#FAF6EE] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#C59B27]"
                      />
                    </div>
                  </div>
                </GodModeBox>

                  <div className="flex flex-wrap gap-1.5">
                    {(["All", "Amrit Vela", "Morning", "Afternoon", "Evening", "Night"] as const).map(
                      (pehar) => (
                        <button
                          key={pehar}
                          type="button"
                          onClick={() => setRaagFilterPehar(pehar)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                            raagFilterPehar === pehar
                              ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B]"
                              : "bg-[#121C15] border border-[#C59B27]/35 text-[#E2E8F0] hover:border-[#C59B27]"
                          }`}
                        >
                          {pehar === "All" ? "All 31 Ragas" : pehar}
                        </button>
                      )
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[30rem] overflow-y-auto pr-1">
                    {filteredRaags.map((raag) => (
                      <article
                        key={raag.order}
                        className="p-4 rounded-2xl bg-[#121C15] border border-[#C59B27]/30 space-y-1.5 flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#C59B27]/20 text-[#E5C158] border border-[#C59B27]/40">
                              #{raag.order} • Ang {raag.angRange}
                            </span>
                            <span className="text-[11px] font-semibold text-[#E2E8F0]">
                              {raag.pehar} ({raag.timeWindow})
                            </span>
                          </div>
                          <div className="flex items-baseline justify-between gap-2 pt-0.5">
                            <h5 className="text-base font-serif font-bold text-[#FAF6EE]">
                              {raag.name}
                            </h5>
                            <span lang="pa" className="font-gurmukhi text-sm font-semibold text-[#E5C158]">
                              {raag.gurmukhi}
                            </span>
                          </div>
                          <p className="text-xs text-[#E2E8F0] leading-relaxed">
                            <strong className="text-[#C59B27]">Ras / Mood:</strong> {raag.ras}
                          </p>
                        </div>
                        <p className="text-[11px] text-[#E2E8F0]/90 pt-1.5 border-t border-[#C59B27]/20">
                          <strong className="text-[#C59B27]">Voices:</strong> {raag.gurus}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            </SlidePresentationCanvas>
          </div>
        )}

        {/* ================================================================
            TAB B: INTERACTIVE GRANTH BOOKREADER & CHAPTER VIEWER
        ================================================================ */}
        {activeTab === "granths" && (
          <div className="space-y-8">
            {/* Search & Category Filter Bar */}
            <GodModeBox id="granths-books-search-box" pageKey="granths" label="Granths Search & Filter Bar">
            <div className="p-6 rounded-2xl bg-[#1B2A20] border border-[#d4af37]/30 shadow-xl shadow-black/10 dark:shadow-2xl dark:shadow-black/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                    <GodModeText
                      id={`granths-cat-${cat.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                      pageKey="granths"
                      tag="span"
                      defaultText={cat}
                    />
                  </button>
                ))}
              </div>

              <div className="w-full md:w-80">
                <GodModeText
                  id="granths-books-search-placeholder"
                  pageKey="granths"
                  tag="span"
                  defaultText="Search Granth, author, or topic..."
                  className="block text-[10px] font-bold uppercase tracking-wider opacity-65 mb-1"
                />
                <input
                  type="search"
                  value={granthQuery}
                  onChange={(e) => setGranthQuery(e.target.value)}
                  placeholder={granthSearchPlaceholder}
                  aria-label="Search Historical Granths"
                  className="w-full rounded-xl border border-[#C59B27]/45 bg-[#121C15] px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#C59B27]"
                />
              </div>
            </div>
            </GodModeBox>

            {/* Granth Cards Grid (Max 3 per row) */}
            <SlidePresentationCanvas
              id="granths-library-canvas"
              pageKey="granths"
              label="Granth BookReader Grid"
            >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredGranths.map((granth) => {
                const gOv = cms.topicEdits?.[granth.id];
                return (
                <article
                  key={granth.id}
                  id={`topic-${granth.id}`}
                  className={`rounded-2xl border border-[#C59B27]/40 bg-[#1B2A20] p-6 shadow-sm hover:border-[#C59B27] transition flex flex-col justify-between gap-6 scroll-mt-28 ${
                    (cms.archivedIds || []).includes(granth.id)
                      ? "opacity-55 ring-2 ring-amber-400/70"
                      : ""
                  }`}
                >
                  <div className="space-y-3">
                    <HiddenItemBadgeBar itemId={granth.id} />
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <InlineOrderControls
                        pageKey="granths"
                        itemId={granth.id}
                        allIds={filteredGranths.map((g) => g.id)}
                      />
                      <InlineTopicEditor
                        itemId={granth.id}
                        defaults={{
                          title: granth.title,
                          gurmukhi: granth.gurmukhiTitle,
                          subtitle: `${granth.author} • ${granth.period}`,
                          badge: granth.category,
                          description: granth.summary,
                        }}
                      />
                    </div>
                    <ChitrakariCardHeader
                      artKey={granth.id}
                      variant="manuscript"
                      title={gOv?.title || granth.title}
                      heightClass="h-40"
                      editable
                    />

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <SikhiIcon name="scroll" size={26} />
                        <span
                          lang="pa"
                          className="h-8 w-8 rounded-lg bg-[#121C15] border border-[#C59B27]/40 font-gurmukhi text-sm font-bold text-[#C59B27] flex items-center justify-center"
                        >
                          {granth.numeral}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#C59B27] px-2.5 py-1 rounded-full bg-[#121C15] border border-[#C59B27]/30">
                        {gOv?.badge || granth.category}
                      </span>
                    </div>

                    <div>
                      <p
                        lang="pa"
                        className="font-gurmukhi text-base font-medium text-[#D97706]"
                      >
                        {gOv?.gurmukhi || granth.gurmukhiTitle}
                      </p>
                      <h3 className="text-xl font-serif font-bold mt-0.5">
                        {gOv?.title || granth.title}
                      </h3>
                      <p className="text-xs font-semibold text-[#4A554E] mt-1">
                        {gOv?.subtitle || `${granth.author} • ${granth.period}`}
                      </p>
                    </div>

                    <p className="text-sm text-[#4A554E] leading-relaxed">
                      {gOv?.description || granth.summary}
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
                );
              })}
            </div>
            </SlidePresentationCanvas>
          </div>
        )}

        {/* ================================================================
            DUAL-MODE BUILT-IN GRANTH READER EXTENSION MODAL
        ================================================================ */}
        <AnimatedModal open={!!selectedGranth}>
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
        </AnimatedModal>

        {/* Submit Kirtan / PDF / Resource for Admin Approval Queue */}
        {isSubmitApprovalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 overflow-hidden"
            onClick={() => setIsSubmitApprovalOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-[#FAF7F0] dark:bg-[#111318] text-[#18181B] dark:text-[#FAF7F0] border border-[#C59B27]/40 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between gap-2 border-b border-[#C59B27]/20 pb-3">
                <h3 className="text-lg font-serif font-bold">
                  Submit Shabad or Resource for Approval
                </h3>
                <button
                  type="button"
                  onClick={() => setIsSubmitApprovalOpen(false)}
                  className="px-2.5 py-1 rounded-lg border text-xs font-bold"
                >
                  Close ✕
                </button>
              </div>

              {subMsg && (
                <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  {subMsg}
                </div>
              )}

              {isMaintenancePaused ? (
                <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs font-semibold text-amber-700 dark:text-amber-300">
                  Community submissions are temporarily paused by the Admin.
                </div>
              ) : needsSignInForSub ? (
                <div className="space-y-3 rounded-xl border border-[#C59B27]/40 bg-[#C59B27]/10 p-4 text-xs">
                  <p className="font-semibold">
                    The Admin requires account sign-in before submitting a Shabad or PDF resource.
                  </p>
                  <Link
                    href="/auth?next=/granths"
                    className="inline-block px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] font-extrabold"
                  >
                    Sign In / Sign Up →
                  </Link>
                </div>
              ) : needsEmailVerificationForSub ? (
                <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs font-semibold text-amber-700 dark:text-amber-300">
                  Verified email is required by the Admin before submitting. Please confirm your email address via your verification inbox link.
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!subTitle.trim() || !subUrl.trim()) return;
                    try {
                      const res = await fetch("/api/site-frames", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          action: "submit_for_approval",
                          submission: {
                            type: subType,
                            title: subTitle.trim(),
                            subtitle: subSubtitle.trim() || undefined,
                            url: subUrl.trim(),
                            submittedBy: hideIdentity
                              ? "Sangat Contributor"
                              : subBy.trim() || "Sangat Member",
                          },
                        }),
                        cache: "no-store",
                      });
                      const data = await res.json().catch(() => null);
                      if (!res.ok || !data?.ok) {
                        throw new Error(data?.error || "Submission rejected.");
                      }
                      if (data.publishedDirectly && Array.isArray(data.kirtanTracks)) {
                        setRemoteKirtanTracks(data.kirtanTracks);
                        setSubMsg("✓ Published directly to Granths & Kirtan!");
                      } else {
                        setSubMsg("✓ Submitted to the Admin Approval Queue!");
                      }
                      setSubTitle("");
                      setSubSubtitle("");
                      setSubUrl("");
                    } catch (err) {
                      setSubMsg(
                        err instanceof Error
                          ? err.message
                          : "Could not submit right now. Please try again."
                      );
                    }
                  }}
                  className="space-y-3 text-sm"
                >
                  {hideIdentity && (
                    <div className="rounded-xl border border-[#C59B27]/35 bg-[#C59B27]/10 px-3 py-2 text-[11px] font-semibold">
                      Privacy Shield Active: Submitter identity is hidden publicly (&ldquo;Sangat Contributor&rdquo;).
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold mb-1">Type</label>
                      <select
                        value={subType}
                        onChange={(e) => setSubType(e.target.value as "kirtan" | "pdf" | "post")}
                        className="w-full rounded-xl border border-[#C59B27]/35 bg-transparent px-3 py-2 text-xs"
                      >
                        <option value="kirtan">Kirtan Shabad Audio</option>
                        <option value="pdf">Granth / Pothi PDF</option>
                        <option value="post">Article / Link</option>
                      </select>
                    </div>
                    {!hideIdentity && (
                      <div>
                        <label className="block text-xs font-bold mb-1">Your Name</label>
                        <input
                          type="text"
                          value={subBy}
                          onChange={(e) => setSubBy(e.target.value)}
                          placeholder="Sangat Member"
                          className="w-full rounded-xl border border-[#C59B27]/35 bg-transparent px-3 py-2 text-xs"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={subTitle}
                      onChange={(e) => setSubTitle(e.target.value)}
                      placeholder="e.g. Asa Di Vaar — Bhai Avtar Singh Ji"
                      className="w-full rounded-xl border border-[#C59B27]/35 bg-transparent px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Ragi / Author (optional)</label>
                    <input
                      type="text"
                      value={subSubtitle}
                      onChange={(e) => setSubSubtitle(e.target.value)}
                      placeholder="e.g. Bhai Avtar Singh Ji"
                      className="w-full rounded-xl border border-[#C59B27]/35 bg-transparent px-3 py-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">
                      Google Drive Link or Audio/PDF URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={subUrl}
                      onChange={(e) => setSubUrl(e.target.value)}
                      placeholder="https://drive.google.com/file/d/.../view"
                      className="w-full rounded-xl border border-[#C59B27]/35 bg-transparent px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsSubmitApprovalOpen(false)}
                      className="px-4 py-2 rounded-xl border text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-extrabold"
                    >
                      {secCfg.requireAdminApproval === false
                        ? "Publish Now"
                        : "Submit for Approval"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      <GodModeBox id="granths-footer-box" pageKey="granths" label="Page Footer">
        <div className="max-w-7xl mx-auto px-4 pt-4 text-center">
          <GodModeText
            id="granths-footer-caption"
            pageKey="granths"
            tag="p"
            defaultText="Puratan Raag Darbar & Historical Granth Library • Learn Sikhi Sanctuary"
            className="text-xs font-semibold opacity-70"
          />
        </div>
        <Footer />
      </GodModeBox>
    </div>
  );
}
