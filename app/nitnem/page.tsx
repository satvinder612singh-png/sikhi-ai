"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MoolMantarExplorer } from "@/components/mool-mantar-explorer";

type BaniCategory = "morning" | "evening" | "extended";

type BaniCatalogItem = {
  id: string;
  baniId: number;
  numeral: string;
  category: BaniCategory;
  title: string;
  gurmukhi: string;
  author: string;
  unitLabel: string;
  description: string;
  curatedFallbackVerses: {
    gurmukhiUnicode: string;
    larivaarUnicode: string;
    transliteration: string;
    punjabiViakhia: string;
    englishTranslation: string;
  }[];
};

const BANI_CATALOG: BaniCatalogItem[] = [
  {
    id: "japji-sahib",
    baniId: 2,
    numeral: "੧",
    category: "morning",
    title: "Japji Sahib",
    gurmukhi: "ਜਪੁਜੀ ਸਾਹਿਬ",
    author: "Guru Nanak Dev Ji • Ang 1–8",
    unitLabel: "Pauri",
    description:
      "The foundational morning Bani of Sri Guru Granth Sahib Ji: Mool Mantar, 38 Pauris, and the concluding Salok (Pavan Guru Pani Pita).",
    curatedFallbackVerses: [
      {
        gurmukhiUnicode:
          "ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ ॥",
        larivaarUnicode:
          "ੴਸਤਿਨਾਮੁਕਰਤਾਪੁਰਖੁਨਿਰਭਉਨਿਰਵੈਰੁਅਕਾਲਮੂਰਤਿਅਜੂਨੀਸੈਭੰਗੁਰਪ੍ਰਸਾਦਿ॥",
        transliteration:
          "Ik Oankaar Sat Naam Kartaa Purakh Nirbhau Nirvair Akaal Moorat Ajoonee Saibhan Gur Prasaad ||",
        punjabiViakhia:
          "ਅਕਾਲ ਪੁਰਖ ਇੱਕ ਹੈ, ਜਿਸ ਦਾ ਨਾਮ 'ਹੋਂਦ ਵਾਲਾ' ਹੈ, ਜੋ ਸ੍ਰਿਸ਼ਟੀ ਦਾ ਰਚਨਹਾਰ ਹੈ, ਭੈ ਤੋਂ ਰਹਿਤ ਹੈ, ਵੈਰ-ਰਹਿਤ ਹੈ, ਅਕਾਲ ਮੂਰਤਿ ਹੈ, ਜੂਨਾਂ ਤੋਂ ਰਹਿਤ ਹੈ, ਸ੍ਵੈ-ਪ੍ਰਕਾਸ਼ ਹੈ ਅਤੇ ਗੁਰੂ ਦੀ ਕਿਰਪਾ ਨਾਲ ਮਿਲਦਾ ਹੈ।",
        englishTranslation:
          "One Universal Creator God. The Name Is Truth. Creative Being Personified. No Fear. No Hatred. Image Of The Undying, Beyond Birth, Self-Existent. By Guru's Grace.",
      },
      {
        gurmukhiUnicode: "ਆਦਿ ਸਚੁ ਜੁਗਾਦਿ ਸਚੁ ॥ ਹੈ ਭੀ ਸਚੁ ਨਾਨਕ ਹੋਸੀ ਭੀ ਸਚੁ ॥੧॥",
        larivaarUnicode: "ਆਦਿਸਚੁਜੁਗਾਦਿਸਚੁ॥ਹੈਭੀਸਚੁਨਾਨਕਹੋਸੀਭੀਸਚੁ॥੧॥",
        transliteration: "Aad Sach Jugaad Sach || Hai Bhee Sach Nanak Hosee Bhee Sach ||1||",
        punjabiViakhia: "ਮੁੱਢ ਤੋਂ ਸੱਚ ਹੈ, ਜੁਗਾਂ ਦੇ ਆਦਿ ਤੋਂ ਸੱਚ ਹੈ, ਹੁਣ ਵੀ ਸੱਚ ਹੈ ਅਤੇ ਹੇ ਨਾਨਕ! ਅੱਗੇ ਵੀ ਸਦਾ ਸੱਚ ਰਹੇਗਾ ॥੧॥",
        englishTranslation:
          "True In The Primal Beginning. True Throughout The Ages. True Here And Now. O Nanak, Forever And Ever True. ||1||",
      },
    ],
  },
  {
    id: "jaap-sahib",
    baniId: 4,
    numeral: "੨",
    category: "morning",
    title: "Jaap Sahib",
    gurmukhi: "ਜਾਪੁ ਸਾਹਿਬ",
    author: "Guru Gobind Singh Ji • Sri Dasam Granth Sahib",
    unitLabel: "Chhand Section",
    description:
      "199 rhythmic verses in diverse poetic meters praising the Formless, Invincible, All-Pervading Creator (Chakkar Chihan Ar Baran Jaat).",
    curatedFallbackVerses: [
      {
        gurmukhiUnicode: "ਚੱਕ੍ਰ ਚਿਹਨ ਅਰੁ ਬਰਨ ਜਾਤਿ ਅਰੁ ਪਾਤਿ ਨਹਿਨ ਜਿਹ ॥",
        larivaarUnicode: "ਚੱਕ੍ਰਚਿਹਨਅਰੁਬਰਨਜਾਤਿਅਰੁਪਾਤਿਨਹਿਨਜਿਹ॥",
        transliteration: "Chakkar Chihan Ar Baran Jaat Ar Paat Nahin Jih ||",
        punjabiViakhia: "ਉਸ ਪ੍ਰਭੂ ਦਾ ਕੋਈ ਚਿੰਨ੍ਹ, ਨਿਸ਼ਾਨ, ਰੰਗ, ਜਾਤ ਜਾਂ ਗੋਤ ਨਹੀਂ ਹੈ।",
        englishTranslation:
          "He who has no physical mark or symbol, no caste, color, or lineage—",
      },
      {
        gurmukhiUnicode: "ਰੂਪ ਰੰਗ ਅਰੁ ਰੇਖ ਭੇਖ ਕੋਊ ਕਹਿ ਨ ਸਕਤਿ ਕਿਹ ॥",
        larivaarUnicode: "ਰੂਪਰੰਗਅਰੁਰੇਖਭੇਖਕੋਊਕਹਿਨਸਕਤਿਕਿਹ॥",
        transliteration: "Roop Rang Ar Rekh Bhekh Ko-oo Kahi Na Sakat Kih ||",
        punjabiViakhia: "ਉਸ ਦਾ ਰੂਪ, ਰੰਗ, ਰੇਖਾ ਅਤੇ ਪਹਿਰਾਵਾ ਕੋਈ ਵੀ ਬਿਆਨ ਨਹੀਂ ਕਰ ਸਕਦਾ।",
        englishTranslation:
          "Whose form, color, outline, and garb no one can describe—",
      },
      {
        gurmukhiUnicode: "ਅਚਲ ਮੂਰਤਿ ਅਨਭਉ ਪ੍ਰਕਾਸ ਅਮਿਤੋਜ ਕਹਿੱਜੈ ॥",
        larivaarUnicode: "ਅਚਲਮੂਰਤਿਅਨਭਉਪ੍ਰਕਾਸਅਮਿਤੋਜਕਹਿੱਜੈ॥",
        transliteration: "Achal Moorat Anbhau Prakaas Amitoj Kahijjai ||",
        punjabiViakhia: "ਉਹ ਅਡੋਲ ਸਰੂਪ ਵਾਲਾ, ਸ੍ਵੈ-ਪ੍ਰਕਾਸ਼ ਅਤੇ ਅਮਿੱਤ ਤੇਜ ਵਾਲਾ ਕਿਹਾ ਜਾਂਦਾ ਹੈ।",
        englishTranslation:
          "He is the Unmoving Being, Self-Luminous, of Immeasurable Radiance—",
      },
      {
        gurmukhiUnicode: "ਕੋਟਿ ਇੰਦ੍ਰ ਇੰਦ੍ਰਾਣਿ ਸਾਹੁ ਸਾਹਾਣਿ ਗਣਿੱਜੈ ॥੧॥",
        larivaarUnicode: "ਕੋਟਿਇੰਦ੍ਰਇੰਦ੍ਰਾਣਿਸਾਹੁਸਾਹਾਣਿਗਣਿੱਜੈ॥੧॥",
        transliteration: "Kot Indra Indraan Saahu Saahaan Ganijjai ||1||",
        punjabiViakhia: "ਉਹ ਕਰੋੜਾਂ ਇੰਦਰਾਂ ਦਾ ਇੰਦਰ ਅਤੇ ਸ਼ਾਹਾਂ ਦਾ ਸ਼ਹਿਨਸ਼ਾਹ ਗਿਣਿਆ ਜਾਂਦਾ ਹੈ ॥੧॥",
        englishTranslation:
          "Counted as the Sovereign of millions of Indras and the King of Kings! ||1||",
      },
    ],
  },
  {
    id: "tav-prasad-savaiye",
    baniId: 6,
    numeral: "੩",
    category: "morning",
    title: "Tav-Prasad Savaiye",
    gurmukhi: "ਤ੍ਵ ਪ੍ਰਸਾਦਿ ਸਵੱਯੇ",
    author: "Guru Gobind Singh Ji • Akal Ustat",
    unitLabel: "Savaiya",
    description:
      "Ten Savaiyas from Akal Ustat declaring that empires, asceticism, and rituals are hollow without sincere love for Akal Purakh ('Jin Prem Kiyo Tin Hee Prabh Paayo').",
    curatedFallbackVerses: [
      {
        gurmukhiUnicode: "ਸਾਚੁ ਕਹੋਂ ਸੁਨ ਲੇਹੁ ਸਭੈ ਜਿਨ ਪ੍ਰੇਮ ਕੀਓ ਤਿਨ ਹੀ ਪ੍ਰਭੁ ਪਾਇਓ ॥੯॥",
        larivaarUnicode: "ਸਾਚੁਕਹੋਂਸੁਨਲੇਹੁਸਭੈਜਿਨਪ੍ਰੇਮਕੀਓਤਿਨਹੀਪ੍ਰਭੁਪਾਇਓ॥੯॥",
        transliteration: "Saach Kahon Sun Lehu Sabhai Jin Prem Kee-o Tin Hee Prabh Paa-i-o ||9||",
        punjabiViakhia: "ਮੈਂ ਸੱਚ ਕਹਿੰਦਾ ਹਾਂ, ਸਾਰੇ ਸੁਣ ਲਵੋ—ਜਿਨ੍ਹਾਂ ਨੇ ਪ੍ਰੇਮ ਕੀਤਾ ਹੈ, ਉਨ੍ਹਾਂ ਨੇ ਹੀ ਪ੍ਰਭੂ ਨੂੰ ਪਾਇਆ ਹੈ ॥੯॥",
        englishTranslation:
          "I speak the Truth; let everyone listen: only those who love the Divine realize the Divine! ||9||",
      },
    ],
  },
  {
    id: "chaupai-sahib",
    baniId: 9,
    numeral: "੪",
    category: "morning",
    title: "Chaupai Sahib",
    gurmukhi: "ਚੌਪਈ ਸਾਹਿਬ",
    author: "Guru Gobind Singh Ji • Charitropakhyan (Benti Chaupai)",
    unitLabel: "Section",
    description:
      "Supplication for spiritual protection, fearlessness, and unwavering trust in the One Protector ('Hamri Karo Haath Dai Rachha').",
    curatedFallbackVerses: [
      {
        gurmukhiUnicode: "ਹਮਰੀ ਕਰੋ ਹਾਥ ਦੈ ਰੱਛਾ ॥ ਪੂਰਨ ਹੋਇ ਚਿੱਤ ਕੀ ਇੱਛਾ ॥",
        larivaarUnicode: "ਹਮਰੀਕਰੋਹਾਥਦੈਰੱਛਾ॥ਪੂਰਨਹੋਇਚਿੱਤਕੀਇੱਛਾ॥",
        transliteration: "Hamree Karo Haath Dai Rachhaa || Pooran Ho-e Chitt Kee Ichhaa ||",
        punjabiViakhia: "ਹੇ ਪ੍ਰਭੂ! ਆਪਣਾ ਹੱਥ ਦੇ ਕੇ ਸਾਡੀ ਰੱਖਿਆ ਕਰੋ, ਅਤੇ ਸਾਡੇ ਚਿੱਤ ਦੀ ਇੱਛਾ ਪੂਰੀ ਹੋਵੇ।",
        englishTranslation:
          "Protect me with Your Own Hand, O Lord; may the longing of my heart be fulfilled.",
      },
      {
        gurmukhiUnicode: "ਤਵ ਚਰਨਨ ਮਨ ਰਹੈ ਹਮਾਰਾ ॥ ਅਪਨਾ ਜਾਨ ਕਰੋ ਪ੍ਰਤਿਪਾਰਾ ॥੧॥",
        larivaarUnicode: "ਤਵਚਰਨਨਮਨਰਹੈਹਮਾਰਾ॥ਅਪਨਾਜਾਨਕਰੋਪ੍ਰਤਿਪਾਰਾ॥੧॥",
        transliteration: "Tav Charanan Man Rahai Hamaaraa || Apnaa Jaan Karo Pratipaaraa ||1||",
        punjabiViakhia: "ਸਾਡਾ ਮਨ ਤੇਰੇ ਚਰਨਾਂ ਵਿੱਚ ਜੁੜਿਆ ਰਹੇ; ਸਾਨੂੰ ਆਪਣਾ ਜਾਣ ਕੇ ਪਾਲਣਾ ਕਰੋ ॥੧॥",
        englishTranslation:
          "May my mind remain attached to Your Feet; cherish me as Your very own! ||1||",
      },
    ],
  },
  {
    id: "anand-sahib",
    baniId: 10,
    numeral: "੫",
    category: "morning",
    title: "Anand Sahib",
    gurmukhi: "ਅਨੰਦੁ ਸਾਹਿਬ",
    author: "Guru Amar Das Ji • Raag Ramkali (Ang 917–922)",
    unitLabel: "Pauri",
    description:
      "40 Pauris celebrating spiritual equipoise and sovereign bliss (Anand) born of meeting the True Guru.",
    curatedFallbackVerses: [
      {
        gurmukhiUnicode: "ਅਨੰਦੁ ਭਇਆ ਮੇਰੀ ਮਾਏ ਸਤਿਗੁਰੂ ਮੈ ਪਾਇਆ ॥",
        larivaarUnicode: "ਅਨੰਦੁਭਇਆਮੇਰੀਮਾਏਸਤਿਗੁਰੂਮੈਪਾਇਆ॥",
        transliteration: "Anand Bha-i-aa Meree Maa-e Satguroo Mai Paa-i-aa ||",
        punjabiViakhia: "ਹੇ ਮੇਰੀ ਮਾਂ! ਮੇਰੇ ਅੰਦਰ ਪੂਰਨ ਆਨੰਦ ਪੈਦਾ ਹੋ ਗਿਆ ਹੈ ਕਿਉਂਕਿ ਮੈਨੂੰ ਸਤਿਗੁਰੂ ਮਿਲ ਪਿਆ ਹੈ।",
        englishTranslation:
          "I am in ecstasy, O my mother, for I have found my True Guru.",
      },
    ],
  },
  {
    id: "rehras-sahib",
    baniId: 21,
    numeral: "੬",
    category: "evening",
    title: "Rehras Sahib",
    gurmukhi: "ਰਹਿਰਾਸਿ ਸਾਹਿਬ",
    author: "Evening Liturgical Bani • Sri Guru Granth Sahib Ji & Dasam Bani",
    unitLabel: "Shabad Section",
    description:
      "Recited at sunset after the day's honest labor (Kirat), renewing gratitude and spiritual focus as evening falls.",
    curatedFallbackVerses: [
      {
        gurmukhiUnicode: "ਸੋ ਦਰੁ ਤੇਰਾ ਕੇਹਾ ਸੋ ਘਰੁ ਕੇਹਾ ਜਿਤੁ ਬਹਿ ਸਰਬ ਸਮਾਲੇ ॥",
        larivaarUnicode: "ਸੋਦਰੁਤੇਰਾਕੇਹਾਸੋਘਰੁਕੇਹਾਜਿਤੁਬਹਿਸਰਬਸਮਾਲੇ॥",
        transliteration: "So Dar Teraa Kehaa So Ghar Kehaa Jit Bahi Sarab Samaale ||",
        punjabiViakhia: "ਹੇ ਪ੍ਰਭੂ! ਤੇਰਾ ਉਹ ਦਰਵਾਜ਼ਾ ਕਿਹੋ ਜਿਹਾ ਅਸਚਰਜ ਹੈ ਅਤੇ ਉਹ ਘਰ ਕਿਹੋ ਜਿਹਾ ਹੈ ਜਿੱਥੇ ਬੈਠ ਕੇ ਤੂੰ ਸਾਰੇ ਜੀਵਾਂ ਦੀ ਸੰਭਾਲ ਕਰਦਾ ਹੈਂ!",
        englishTranslation:
          "Where is That Door of Yours, and where is That Home, in which You sit and take care of all?",
      },
    ],
  },
  {
    id: "kirtan-sohila",
    baniId: 23,
    numeral: "੭",
    category: "evening",
    title: "Kirtan Sohila",
    gurmukhi: "ਕੀਰਤਨ ਸੋਹਿਲਾ",
    author: "Guru Nanak Dev Ji, Guru Ram Das Ji & Guru Arjan Dev Ji • Ang 12–13",
    unitLabel: "Shabad",
    description:
      "The five night hymns recited before sleep, uniting the soul with the cosmic Aarti of the skies ('Gagan Mai Thaal').",
    curatedFallbackVerses: [
      {
        gurmukhiUnicode: "ਗਗਨ ਮੈ ਥਾਲੁ ਰਵਿ ਚੰਦੁ ਦੀਪਕ ਬਨੇ ਤਾਰਿਕਾ ਮੰਡਲ ਜਨਕ ਮੋਤੀ ॥",
        larivaarUnicode: "ਗਗਨਮੈਥਾਲੁਰਵਿਚੰਦੁਦੀਪਕਬਨੇਤਾਰਿਕਾਮੰਡਲਜਨਕਮੋਤੀ॥",
        transliteration: "Gagan Mai Thaal Rav Chand Deepak Bane Taarikaa Mandal Janak Motee ||",
        punjabiViakhia: "ਸਾਰਾ ਆਕਾਸ਼ ਥਾਲ ਹੈ, ਸੂਰਜ ਅਤੇ ਚੰਦ੍ਰਮਾ ਦੀਵੇ ਬਣੇ ਹੋਏ ਹਨ, ਅਤੇ ਤਾਰਿਆਂ ਦੇ ਸਮੂਹ ਮਾਨੋ ਮੋਤੀ ਰੱਖੇ ਹੋਏ ਹਨ।",
        englishTranslation:
          "Upon the cosmic platter of the sky, the sun and the moon are the lamps; the constellations of stars are the pearls.",
      },
    ],
  },
  {
    id: "sukhmani-sahib",
    baniId: 31,
    numeral: "੮",
    category: "extended",
    title: "Sukhmani Sahib (All 24 Ashtpadis)",
    gurmukhi: "ਸੁਖਮਨੀ ਸਾਹਿਬ",
    author: "Guru Arjan Dev Ji • Raag Gauri (Ang 262–296)",
    unitLabel: "Ashtpadi",
    description:
      "24 Ashtpadis (each preceded by a Salok and comprising 8 stanzas of 10 lines) bringing inner peace ('Sukhmani Sukh Amrit Prabh Naam').",
    curatedFallbackVerses: [
      {
        gurmukhiUnicode: "ਸਲੋਕੁ ॥ ਆਦਿ ਗੁਰਏ ਨਮਹ ॥ ਜੁਗਾਦਿ ਗੁਰਏ ਨਮਹ ॥",
        larivaarUnicode: "ਸਲੋਕੁ॥ਆਦਿਗੁਰਏਨਮਹ॥ਜੁਗਾਦਿਗੁਰਏਨਮਹ॥",
        transliteration: "Salok || Aad Gura-e Namah || Jugaad Gura-e Namah ||",
        punjabiViakhia: "ਮੁੱਢ ਤੋਂ ਮੌਜੂਦ ਸਭ ਤੋਂ ਵੱਡੇ ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਜੁਗਾਂ ਦੇ ਆਦਿ ਤੋਂ ਮੌਜੂਦ ਗੁਰੂ-ਪ੍ਰਭੂ ਨੂੰ ਨਮਸਕਾਰ ਹੈ।",
        englishTranslation:
          "Salok: I bow to the Primal Guru. I bow to the Guru of all ages.",
      },
      {
        gurmukhiUnicode: "ਸਤਿਗੁਰਏ ਨਮਹ ॥ ਸ੍ਰੀ ਗੁਰਦੇਵਏ ਨਮਹ ॥੧॥",
        larivaarUnicode: "ਸਤਿਗੁਰਏਨਮਹ॥ਸ੍ਰੀਗੁਰਦੇਵਏਨਮਹ॥੧॥",
        transliteration: "Satgura-e Namah || Sree Gurdeva-e Namah ||1||",
        punjabiViakhia: "ਸਦਾ ਕਾਇਮ ਰਹਿਣ ਵਾਲੇ ਗੁਰੂ ਨੂੰ ਨਮਸਕਾਰ ਹੈ; ਪ੍ਰਕਾਸ਼-ਰੂਪ ਗੁਰਦੇਵ ਨੂੰ ਨਮਸਕਾਰ ਹੈ ॥੧॥",
        englishTranslation:
          "I bow to the True Guru. I bow to the Great, Divine Guru. ||1||",
      },
      {
        gurmukhiUnicode: "ਸਿਮਰਉ ਸਿਮਰਿ ਸਿਮਰਿ ਸੁਖੁ ਪਾਵਉ ॥ ਕਲਿ ਕਲੇਸ ਤਨ ਮਾਹਿ ਮਿਟਾਵਉ ॥",
        larivaarUnicode: "ਸਿਮਰਉਸਿਮਰਿਸਿਮਰਿਸੁਖੁਪਾਵਉ॥ਕਲਿਕਲੇਸਤਨਮਾਹਿਮਿਟਾਵਉ॥",
        transliteration: "Simarau Simar Simar Sukh Paavau || Kal Kales Tan Maahi Mitaavau ||",
        punjabiViakhia: "ਮੈਂ ਪ੍ਰਭੂ ਦਾ ਸਿਮਰਨ ਕਰਾਂ ਅਤੇ ਸਿਮਰ-ਸਿਮਰ ਕੇ ਆਤਮਕ ਸੁਖ ਪ੍ਰਾਪਤ ਕਰਾਂ; ਇਸ ਤਰ੍ਹਾਂ ਸਰੀਰ ਦੇ ਸਾਰੇ ਦੁੱਖ-ਕਲੇਸ਼ ਮਿਟਾ ਲਵਾਂ।",
        englishTranslation:
          "Meditate, meditate, meditate in remembrance of Him, and find peace. Worry and anguish shall be dispelled from your body.",
      },
      {
        gurmukhiUnicode: "ਸੁਖਮਨੀ ਸੁਖ ਅੰਮ੍ਰਿਤ ਪ੍ਰਭ ਨਾਮੁ ॥ ਭਗਤ ਜਨਾ ਕੈ ਮਨਿ ਬਿਸ੍ਰਾਮ ॥ ਰਹਾਉ ॥",
        larivaarUnicode: "ਸੁਖਮਨੀਸੁਖਅੰਮ੍ਰਿਤਪ੍ਰਭਨਾਮੁ॥ਭਗਤਜਨਾਕੈਮਨਿਬਿਸ੍ਰਾਮ॥ਰਹਾਉ॥",
        transliteration: "Sukhmanee Sukh Amrit Prabh Naam || Bhagat Janaa Kai Man Bisraam || Rahaau ||",
        punjabiViakhia: "ਪ੍ਰਭੂ ਦਾ ਅਮਰ ਕਰਨ ਵਾਲਾ ਤੇ ਸੁਖਦਾਈ ਨਾਮ ਹੀ 'ਸੁਖਮਨੀ' (ਸੁਖਾਂ ਦੀ ਮਣੀ) ਹੈ; ਇਸ ਦਾ ਟਿਕਾਣਾ ਭਗਤਾਂ ਦੇ ਹਿਰਦੇ ਵਿੱਚ ਹੁੰਦਾ ਹੈ ॥ ਰਹਾਉ ॥",
        englishTranslation:
          "Sukhmani—Peace of Mind—is the Ambrosial Naam, the Name of God. It abides in the hearts of the devotees. || Pause ||",
      },
    ],
  },
  {
    id: "asa-di-vaar",
    baniId: 90,
    numeral: "੯",
    category: "extended",
    title: "Asa Di Vaar",
    gurmukhi: "ਆਸਾ ਦੀ ਵਾਰ",
    author: "Guru Nanak Dev Ji & Guru Angad Dev Ji • Ang 462–475",
    unitLabel: "Pauri",
    description:
      "24 Pauris and accompanying Saloks sung in the early morning, examining human ego, caste pride, gender equality (Ang 473), and cosmic Kudrat.",
    curatedFallbackVerses: [
      {
        gurmukhiUnicode: "ਬਲਿਹਾਰੀ ਗੁਰ ਆਪਣੇ ਦਿਉਹਾੜੀ ਸਦ ਵਾਰ ॥ ਜਿਨਿ ਮਾਣਸ ਤੇ ਦੇਵਤੇ ਕੀਏ ਕਰਤ ਨ ਲਾਗੀ ਵਾਰ ॥੧॥",
        larivaarUnicode: "ਬਲਿਹਾਰੀਗੁਰਆਪਣੇਦਿਉਹਾੜੀਸਦਵਾਰ॥ਜਿਨਿਮਾਣਸਤੇਦੇਵਤੇਕੀਏਕਰਤਨਲਾਗੀਵਾਰ॥੧॥",
        transliteration:
          "Balihaaree Gur Aapane Di-uhaarhee Sad Vaar || Jin Maanas Te Devate Kee-e Karat Na Laagee Vaar ||1||",
        punjabiViakhia: "ਮੈਂ ਆਪਣੇ ਗੁਰੂ ਤੋਂ ਦਿਨ ਵਿੱਚ ਸੌ ਵਾਰੀ ਸਦਕੇ ਜਾਂਦਾ ਹਾਂ, ਜਿਸ ਨੇ ਸਧਾਰਨ ਮਨੁੱਖਾਂ ਤੋਂ ਦੇਵਤੇ ਬਣਾ ਦਿੱਤੇ ਅਤੇ ਬਣਾਉਂਦਿਆਂ ਰਤਾ ਚਿਰ ਨਹੀਂ ਲੱਗਾ ॥੧॥",
        englishTranslation:
          "I am a sacrifice to my Guru a hundred times a day, who transformed ordinary mortals into angels without a moment's delay! ||1||",
      },
    ],
  },
  {
    id: "ardas",
    baniId: 24,
    numeral: "੧੦",
    category: "extended",
    title: "Ardas",
    gurmukhi: "ਅਰਦਾਸ",
    author: "Panthic Supplication • Concluding with Sarbat da Bhala",
    unitLabel: "Section",
    description:
      "The collective Sikh prayer remembering the Ten Gurus, Sri Guru Granth Sahib Ji, the Panj Piare, Chaar Sahibzaade, Matriarchs, and Shaheeds, concluding with 'Nanak Naam Chardi Kala, Tere Bhane Sarbat da Bhala'.",
    curatedFallbackVerses: [
      {
        gurmukhiUnicode: "ਪ੍ਰਿਥਮ ਭਗੌਤੀ ਸਿਮਰਿ ਕੈ ਗੁਰ ਨਾਨਕ ਲਈਂ ਧਿਆਇ ॥",
        larivaarUnicode: "ਪ੍ਰਿਥਮਭਗੌਤੀਸਿਮਰਿਕੈਗੁਰਨਾਨਕਲਈਂਧਿਆਇ॥",
        transliteration: "Pritham Bhagautee Simar Kai Gur Nanak La-een Dhiaa-e ||",
        punjabiViakhia: "ਸਭ ਤੋਂ ਪਹਿਲਾਂ ਅਕਾਲ ਪੁਰਖ ਨੂੰ ਸਿਮਰ ਕੇ ਗੁਰੂ ਨਾਨਕ ਦੇਵ ਜੀ ਦਾ ਧਿਆਨ ਧਰੋ।",
        englishTranslation:
          "First remembering the Almighty Divine Power, meditate on Guru Nanak Dev Ji.",
      },
      {
        gurmukhiUnicode: "ਨਾਨਕ ਨਾਮ ਚੜ੍ਹਦੀ ਕਲਾ ॥ ਤੇਰੇ ਭਾਣੇ ਸਰਬੱਤ ਦਾ ਭਲਾ ॥",
        larivaarUnicode: "ਨਾਨਕਨਾਮਚੜ੍ਹਦੀਕਲਾ॥ਤੇਰੇਭਾਣੇਸਰਬੱਤਦਾਭਲਾ॥",
        transliteration: "Nanak Naam Chardi Kalaa || Tere Bhaane Sarbat Daa Bhalaa ||",
        punjabiViakhia: "ਹੇ ਨਾਨਕ! ਤੇਰੇ ਨਾਮ ਰਾਹੀਂ ਸਦਾ ਚੜ੍ਹਦੀ ਕਲਾ ਰਹੇ ਅਤੇ ਤੇਰੇ ਭਾਣੇ ਵਿੱਚ ਸਰਬੱਤ (ਸਾਰੀ ਸ੍ਰਿਸ਼ਟੀ) ਦਾ ਭਲਾ ਹੋਵੇ।",
        englishTranslation:
          "O Nanak, through the Naam may spirits forever rise in Chardi Kala, and in Your Will, may peace and welfare come to all creation!",
      },
    ],
  },
];

function NitnemReaderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialBaniSlug = searchParams.get("bani") || "japji-sahib";
  const [selectedBaniId, setSelectedBaniId] = useState<string>(
    BANI_CATALOG.some((b) => b.id === initialBaniSlug) ? initialBaniSlug : "japji-sahib"
  );
  const [activeCategory, setActiveCategory] = useState<BaniCategory>("morning");

  const [sections, setSections] = useState<
    {
      sectionIndex: number;
      title: string;
      gurmukhiTitle: string;
      verses: BaniCatalogItem["curatedFallbackVerses"];
    }[]
  >([]);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [continuousView, setContinuousView] = useState(false);
  const [loadingBani, setLoadingBani] = useState(false);
  const [totalVerses, setTotalVerses] = useState(0);

  // Reader Controls
  const [fontSize, setFontSize] = useState(24);
  const [scriptMode, setScriptMode] = useState<"padchhed" | "larivaar">("padchhed");
  const [showTranslit, setShowTranslit] = useState(true);
  const [showPunjabiViakhia, setShowPunjabiViakhia] = useState(true);
  const [showEnglish, setShowEnglish] = useState(true);
  const [showMoolMantarDeepDive, setShowMoolMantarDeepDive] = useState(false);

  const selectedBani =
    BANI_CATALOG.find((b) => b.id === selectedBaniId) || BANI_CATALOG[0];

  useEffect(() => {
    let cancelled = false;
    async function loadBaniVerses() {
      setLoadingBani(true);
      setCurrentPageIdx(0);
      try {
        const res = await fetch(`/api/banidb?baniId=${selectedBani.baniId}`);
        const data = await res.json();
        if (
          !cancelled &&
          data?.ok &&
          Array.isArray(data.sections) &&
          data.sections.length > 0
        ) {
          setSections(data.sections);
          setTotalVerses(data.totalVerses || 0);
        } else if (!cancelled) {
          setSections([
            {
              sectionIndex: 1,
              title: `${selectedBani.unitLabel} 1`,
              gurmukhiTitle: selectedBani.gurmukhi,
              verses: selectedBani.curatedFallbackVerses,
            },
          ]);
          setTotalVerses(selectedBani.curatedFallbackVerses.length);
        }
      } catch {
        if (!cancelled) {
          setSections([
            {
              sectionIndex: 1,
              title: `${selectedBani.unitLabel} 1`,
              gurmukhiTitle: selectedBani.gurmukhi,
              verses: selectedBani.curatedFallbackVerses,
            },
          ]);
          setTotalVerses(selectedBani.curatedFallbackVerses.length);
        }
      } finally {
        if (!cancelled) setLoadingBani(false);
      }
    }

    void loadBaniVerses();
    return () => {
      cancelled = true;
    };
  }, [selectedBani]);

  const handleSelectBani = (item: BaniCatalogItem) => {
    setSelectedBaniId(item.id);
    setActiveCategory(item.category);
    router.replace(`/nitnem?bani=${item.id}`, { scroll: false });
  };

  const currentSection = sections[currentPageIdx] || sections[0];
  const displayedSections = continuousView
    ? sections
    : currentSection
    ? [currentSection]
    : [];

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#171917] flex flex-col">
      <Header solid />

      {/* Top Hero Banner */}
      <section className="border-b border-[#C59B27]/40 bg-gradient-to-b from-[#0A1F17] via-[#121C15] to-[#1B2A20] text-[#FAF6EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="inline-flex items-center gap-2.5">
                <span
                  lang="pa"
                  className="font-gurmukhi text-sm font-bold px-2.5 py-0.5 rounded bg-[#1B2A20] text-[#E5C158] border border-[#C59B27]/45"
                >
                  ਨਿਤਨੇਮ ਅਤੇ ਬਾਣੀ ਪੋਥੀ
                </span>
                <span className="text-xs uppercase tracking-[0.22em] text-[#D97706] font-semibold">
                  Complete BaniDB Reader • Padchhed &amp; Larivaar
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#FAF6EE]">
                Nitnem, Sukhmani Sahib &amp; Sacred Bani Reader
              </h1>
              <p className="text-sm sm:text-base text-[#F3ECE0]/85 leading-relaxed">
                Read every Pauri, Chhand, and Ashtpadi with customizable Gurmukhi font size,
                Padchhed/Larivaar script toggle, Punjabi Viakhia (Teeka), and English translation.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowMoolMantarDeepDive((v) => !v)}
                className="px-4 py-2.5 rounded-xl border border-[#C59B27] bg-[#121C15] text-xs font-bold uppercase tracking-wider text-[#E5C158] hover:border-[#D97706] transition"
              >
                {showMoolMantarDeepDive
                  ? "Hide Mool Mantar Deep-Dive"
                  : "Open Mool Mantar 9-Slide Explorer"}
              </button>
              <Link
                href="/hukamnama"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#171917] text-xs font-bold uppercase tracking-wider shadow-sm hover:brightness-105 transition"
              >
                Today&apos;s Darbar Sahib Hukamnama →
              </Link>
            </div>
          </div>

          {showMoolMantarDeepDive && (
            <div className="pt-4 animate-fade-in-up">
              <MoolMantarExplorer />
            </div>
          )}

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            {(
              [
                { id: "morning", label: "੧ · Morning Nitnem (5 Banis)" },
                { id: "evening", label: "੨ · Evening & Night Nitnem (Rehras & Sohila)" },
                { id: "extended", label: "੩ · Sukhmani Sahib (24 Ashtpadis), Asa Di Vaar & Ardas" },
              ] as { id: BaniCategory; label: string }[]
            ).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                  activeCategory === cat.id
                    ? "bg-[#E5C158] text-[#171917] shadow-sm"
                    : "bg-[#121C15] text-[#F3ECE0] border border-[#C59B27]/35 hover:border-[#E5C158]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Bani Selector Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {BANI_CATALOG.filter((b) => b.category === activeCategory).map((item) => {
              const selected = item.id === selectedBani.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectBani(item)}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between hover:-translate-y-0.5 ${
                    selected
                      ? "bg-[#FAF6EE] text-[#171917] border-2 border-[#E5C158] shadow-lg"
                      : "bg-[#1B2A20]/90 text-[#FAF6EE] border-[#C59B27]/40 hover:border-[#E5C158]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        lang="pa"
                        className={`font-gurmukhi text-xs font-bold px-2 py-0.5 rounded border ${
                          selected
                            ? "bg-[#1B2A20] text-[#E5C158] border-[#C59B27]"
                            : "bg-[#121C15] text-[#E5C158] border-[#C59B27]/40"
                        }`}
                      >
                        {item.numeral}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider opacity-75">
                        {item.unitLabel}s
                      </span>
                    </div>
                    <p
                      lang="pa"
                      className={`font-gurmukhi text-sm font-bold ${
                        selected ? "text-[#D97706]" : "text-[#E5C158]"
                      }`}
                    >
                      {item.gurmukhi}
                    </p>
                    <h2 className="font-serif text-base font-bold mt-0.5">{item.title}</h2>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Distraction-Free Reader Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Sticky Reader Controls Bar */}
        <div className="p-5 rounded-2xl bg-[#1B2A20] border-2 border-[#C59B27] text-[#FAF6EE] shadow-xl space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#C59B27]/30">
            <div>
              <div className="flex items-center gap-2">
                <span
                  lang="pa"
                  className="font-gurmukhi text-lg font-bold text-[#E5C158]"
                >
                  {selectedBani.gurmukhi}
                </span>
                <span className="text-xs text-[#F3ECE0]/75">• {selectedBani.author}</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#FAF6EE]">
                {selectedBani.title}{" "}
                {totalVerses > 0 && (
                  <span className="text-xs font-sans font-normal text-[#E5C158]">
                    ({sections.length} {selectedBani.unitLabel} Pages • {totalVerses} Verses)
                  </span>
                )}
              </h2>
              <p className="text-xs text-[#F3ECE0]/80 mt-0.5">{selectedBani.description}</p>
            </div>

            {/* Pauri / Ashtpadi Jump Selector */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={continuousView || currentPageIdx === 0}
                onClick={() => setCurrentPageIdx((p) => Math.max(0, p - 1))}
                className="px-3.5 py-2 rounded-xl bg-[#121C15] text-[#E5C158] border border-[#C59B27]/50 text-xs font-semibold uppercase tracking-wider disabled:opacity-40 hover:border-[#D97706] transition"
              >
                ← Prev {selectedBani.unitLabel}
              </button>

              <select
                aria-label={`Select ${selectedBani.unitLabel}`}
                disabled={continuousView}
                value={currentPageIdx}
                onChange={(e) => setCurrentPageIdx(Number(e.target.value))}
                className="rounded-xl bg-[#121C15] text-[#FAF6EE] border border-[#C59B27]/60 px-3 py-2 text-xs font-semibold focus:outline-none disabled:opacity-50"
              >
                {sections.map((sec, idx) => (
                  <option key={sec.sectionIndex} value={idx}>
                    {selectedBani.unitLabel} {idx + 1} of {sections.length} ({sec.verses.length}{" "}
                    lines)
                  </option>
                ))}
              </select>

              <button
                type="button"
                disabled={continuousView || currentPageIdx >= sections.length - 1}
                onClick={() =>
                  setCurrentPageIdx((p) => Math.min(sections.length - 1, p + 1))
                }
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#171917] text-xs font-bold uppercase tracking-wider disabled:opacity-40 hover:brightness-105 transition"
              >
                Next {selectedBani.unitLabel} →
              </button>
            </div>
          </div>

          {/* Toggles Row: Script, Translations, Font Size, Continuous Mode */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setScriptMode("padchhed")}
                className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition ${
                  scriptMode === "padchhed"
                    ? "bg-[#E5C158] text-[#171917]"
                    : "bg-[#121C15] text-[#F3ECE0] border border-[#C59B27]/35"
                }`}
              >
                Padchhed
              </button>
              <button
                type="button"
                onClick={() => setScriptMode("larivaar")}
                className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition ${
                  scriptMode === "larivaar"
                    ? "bg-[#E5C158] text-[#171917]"
                    : "bg-[#121C15] text-[#F3ECE0] border border-[#C59B27]/35"
                }`}
              >
                Larivaar
              </button>
              <button
                type="button"
                onClick={() => setContinuousView((v) => !v)}
                className={`px-3 py-1.5 rounded-lg font-semibold border transition ${
                  continuousView
                    ? "bg-[#D97706] text-[#171917] border-[#E5C158] font-bold"
                    : "bg-[#121C15] text-[#E5C158] border-[#C59B27]/40"
                }`}
              >
                {continuousView ? "Showing All Pages" : "Paginated Mode"}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowTranslit((v) => !v)}
                className={`px-3 py-1.5 rounded-lg font-semibold border transition ${
                  showTranslit
                    ? "bg-[#121C15] text-[#E5C158] border-[#E5C158]"
                    : "bg-transparent text-[#F3ECE0]/50 border-[#C59B27]/20"
                }`}
              >
                {showTranslit ? "✓" : "○"} Transliteration
              </button>
              <button
                type="button"
                onClick={() => setShowPunjabiViakhia((v) => !v)}
                className={`px-3 py-1.5 rounded-lg font-semibold border transition ${
                  showPunjabiViakhia
                    ? "bg-[#121C15] text-[#E5C158] border-[#E5C158]"
                    : "bg-transparent text-[#F3ECE0]/50 border-[#C59B27]/20"
                }`}
              >
                {showPunjabiViakhia ? "✓" : "○"} ਪੰਜਾਬੀ ਵਿਆਖਿਆ
              </button>
              <button
                type="button"
                onClick={() => setShowEnglish((v) => !v)}
                className={`px-3 py-1.5 rounded-lg font-semibold border transition ${
                  showEnglish
                    ? "bg-[#121C15] text-[#E5C158] border-[#E5C158]"
                    : "bg-transparent text-[#F3ECE0]/50 border-[#C59B27]/20"
                }`}
              >
                {showEnglish ? "✓" : "○"} English
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="nitnem-font-size" className="text-[#E5C158] font-semibold">
                Font Size ({fontSize}px):
              </label>
              <input
                id="nitnem-font-size"
                type="range"
                min={18}
                max={38}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-24 accent-[#D97706] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loadingBani ? (
          <div className="p-10 rounded-2xl bg-[#1B2A20] border border-[#C59B27]/40 text-center text-[#E5C158] animate-pulse">
            Loading complete {selectedBani.title} verses from BaniDB Sanctuary…
          </div>
        ) : (
          <div
            key={`${selectedBani.id}-${currentPageIdx}-${continuousView}`}
            className="space-y-8 animate-fade-in-up"
          >
            {displayedSections.map((section) => (
              <div
                key={section.sectionIndex}
                className="p-6 md:p-8 rounded-2xl bg-[#1B2A20] border border-[#C59B27]/50 text-[#FAF6EE] shadow-xl space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-[#C59B27]/30">
                  <div>
                    <span className="text-xs uppercase tracking-[0.2em] text-[#E5C158] font-bold">
                      {selectedBani.title} • {selectedBani.unitLabel} {section.sectionIndex} of{" "}
                      {sections.length}
                    </span>
                    <p lang="pa" className="font-gurmukhi text-lg text-[#D97706] font-semibold">
                      {section.gurmukhiTitle}
                    </p>
                  </div>
                  <span className="text-xs text-[#F3ECE0]/75">
                    {section.verses.length} Pangtis
                  </span>
                </div>

                <div className="space-y-4">
                  {section.verses.map((v, vIdx) => (
                    <div
                      key={vIdx}
                      className="p-4 sm:p-5 rounded-xl bg-[#121C15] border border-[#C59B27]/30 space-y-2"
                    >
                      <p
                        lang="pa"
                        style={{ fontSize: `${fontSize}px` }}
                        className={`font-gurmukhi text-[#FAF6EE] leading-relaxed ${
                          scriptMode === "larivaar" ? "break-all" : ""
                        }`}
                      >
                        {scriptMode === "larivaar"
                          ? v.larivaarUnicode
                          : v.gurmukhiUnicode}
                      </p>

                      {showTranslit && v.transliteration && (
                        <p className="text-xs sm:text-sm text-[#E5C158] italic">
                          {v.transliteration}
                        </p>
                      )}

                      {showPunjabiViakhia && v.punjabiViakhia && (
                        <p
                          lang="pa"
                          className="font-gurmukhi text-sm sm:text-base text-[#F3ECE0]/90 pt-1.5 border-t border-[#C59B27]/20"
                        >
                          <strong className="text-[#D97706] text-xs uppercase mr-2">
                            ਪੰਜਾਬੀ ਵਿਆਖਿਆ:
                          </strong>
                          {v.punjabiViakhia}
                        </p>
                      )}

                      {showEnglish && v.englishTranslation && (
                        <p className="text-sm sm:text-base text-[#FAF6EE]/95 pt-1.5 border-t border-[#C59B27]/20">
                          {v.englishTranslation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Bottom Pauri / Ashtpadi Turn-Page Controls */}
                {!continuousView && sections.length > 1 && (
                  <div className="pt-4 border-t border-[#C59B27]/30 flex items-center justify-between">
                    <button
                      type="button"
                      disabled={currentPageIdx === 0}
                      onClick={() => {
                        setCurrentPageIdx((p) => Math.max(0, p - 1));
                        window.scrollTo({ top: 260, behavior: "smooth" });
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#121C15] text-[#E5C158] border border-[#C59B27]/50 text-xs font-semibold uppercase tracking-wider disabled:opacity-40"
                    >
                      ← Previous {selectedBani.unitLabel}
                    </button>
                    <span className="text-xs text-[#E5C158] font-bold">
                      {selectedBani.unitLabel} {currentPageIdx + 1} / {sections.length}
                    </span>
                    <button
                      type="button"
                      disabled={currentPageIdx >= sections.length - 1}
                      onClick={() => {
                        setCurrentPageIdx((p) => Math.min(sections.length - 1, p + 1));
                        window.scrollTo({ top: 260, behavior: "smooth" });
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#171917] text-xs font-bold uppercase tracking-wider disabled:opacity-40"
                    >
                      Next {selectedBani.unitLabel} →
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function NitnemPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#1B2A20] text-[#FAF6EE] p-12 text-center font-serif text-xl">
          Opening Nitnem &amp; Sacred Bani Sanctuary…
        </div>
      }
    >
      <NitnemReaderContent />
    </Suspense>
  );
}
