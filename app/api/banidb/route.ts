import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export interface NormalizedVerse {
  verseId: number;
  shabadId: number;
  pageNo: number;
  writer: string;
  raag: string;
  gurmukhiUnicode: string;
  larivaarUnicode: string;
  transliteration: string;
  punjabiViakhia: string;
  englishTranslation: string;
  headerRank?: number;
}

export interface NormalizedShabad {
  shabadId: number;
  pageNo: number;
  writer: string;
  raag: string;
  verses: NormalizedVerse[];
}

export interface NormalizedHukamnama {
  gregorianDate: string;
  nanakshahiDate: string;
  ang: number;
  raag: string;
  writer: string;
  titleGurmukhi: string;
  verses: NormalizedVerse[];
}

export interface BaniSectionPage {
  sectionIndex: number;
  title: string;
  gurmukhiTitle: string;
  verses: NormalizedVerse[];
}

function toLarivaar(gurmukhi: string): string {
  // Keep danda delimiters (॥) attached cleanly while removing spaces between words
  return gurmukhi.replace(/\s+/g, "");
}

/**
 * Authentic curated Shabads from Sri Guru Granth Sahib Ji used as a resilient
 * fallback when api.banidb.com is unreachable or rate-limited.
 */
const CURATED_SHABADS: Record<
  number,
  NormalizedShabad & { keywords: string[]; initials: string[] }
> = {
  1: {
    shabadId: 1,
    pageNo: 1,
    writer: "Guru Nanak Dev Ji",
    raag: "Japji Sahib (Prologue)",
    keywords: [
      "ik onkar",
      "mool mantar",
      "hukam",
      "fearless",
      "creator",
      "truth",
      "timeless",
      "japji",
      "one universal creator",
      "divine command",
    ],
    initials: ["stnk", "io", "hhak", "ssbh"],
    verses: [
      {
        verseId: 1,
        shabadId: 1,
        pageNo: 1,
        writer: "Guru Nanak Dev Ji",
        raag: "Japji Sahib",
        gurmukhiUnicode:
          "ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ ॥",
        larivaarUnicode:
          "ੴਸਤਿਨਾਮੁਕਰਤਾਪੁਰਖੁਨਿਰਭਉਨਿਰਵੈਰੁਅਕਾਲਮੂਰਤਿਅਜੂਨੀਸੈਭੰਗੁਰਪ੍ਰਸਾਦਿ॥",
        transliteration:
          "Ik Oankaar Sat Naam Kartaa Purakh Nirbhau Nirvair Akaal Moorat Ajoonee Saibhan Gur Prasaad ||",
        punjabiViakhia:
          "ਅਕਾਲ ਪੁਰਖ ਇੱਕ ਹੈ, ਜਿਸ ਦਾ ਨਾਮ 'ਹੋਂਦ ਵਾਲਾ' ਹੈ, ਜੋ ਸ੍ਰਿਸ਼ਟੀ ਦਾ ਰਚਨਹਾਰ ਹੈ, ਜੋ ਸਭ ਵਿੱਚ ਵਿਆਪਕ ਹੈ, ਭੈ ਤੋਂ ਰਹਿਤ ਹੈ, ਵੈਰ-ਰਹਿਤ ਹੈ, ਜਿਸ ਦਾ ਸਰੂਪ ਕਾਲ ਤੋਂ ਪਰੇ ਹੈ, ਜੋ ਜੂਨਾਂ ਵਿੱਚ ਨਹੀਂ ਆਉਂਦਾ, ਜਿਸ ਦਾ ਪ੍ਰਕਾਸ਼ ਆਪਣੇ ਆਪ ਤੋਂ ਹੋਇਆ ਹੈ ਅਤੇ ਜੋ ਸਤਿਗੁਰੂ ਦੀ ਕਿਰਪਾ ਨਾਲ ਮਿਲਦਾ ਹੈ।",
        englishTranslation:
          "One Universal Creator God. The Name Is Truth. Creative Being Personified. No Fear. No Hatred. Image Of The Undying, Beyond Birth, Self-Existent. By Guru's Grace.",
      },
      {
        verseId: 2,
        shabadId: 1,
        pageNo: 1,
        writer: "Guru Nanak Dev Ji",
        raag: "Japji Sahib",
        gurmukhiUnicode: "॥ ਜਪੁ ॥",
        larivaarUnicode: "॥ਜਪੁ॥",
        transliteration: "|| Jap ||",
        punjabiViakhia: "ਇਸ ਬਾਣੀ ਦਾ ਨਾਮ 'ਜਪੁ' ਹੈ।",
        englishTranslation: "Chant And Meditate:",
      },
      {
        verseId: 3,
        shabadId: 1,
        pageNo: 1,
        writer: "Guru Nanak Dev Ji",
        raag: "Japji Sahib",
        gurmukhiUnicode: "ਆਦਿ ਸਚੁ ਜੁਗਾਦਿ ਸਚੁ ॥",
        larivaarUnicode: "ਆਦਿਸਚੁਜੁਗਾਦਿਸਚੁ॥",
        transliteration: "Aad Sach Jugaad Sach ||",
        punjabiViakhia: "ਉਹ ਪ੍ਰਭੂ ਸ੍ਰਿਸ਼ਟੀ ਦੇ ਮੁੱਢ ਤੋਂ ਹੋਂਦ ਵਾਲਾ ਹੈ ਅਤੇ ਜੁਗਾਂ ਦੇ ਮੁੱਢ ਤੋਂ ਮੌਜੂਦ ਹੈ।",
        englishTranslation: "True In The Primal Beginning. True Throughout The Ages.",
      },
      {
        verseId: 4,
        shabadId: 1,
        pageNo: 1,
        writer: "Guru Nanak Dev Ji",
        raag: "Japji Sahib",
        gurmukhiUnicode: "ਹੈ ਭੀ ਸਚੁ ਨਾਨਕ ਹੋਸੀ ਭੀ ਸਚੁ ॥੧॥",
        larivaarUnicode: "ਹੈਭੀਸਚੁਨਾਨਕਹੋਸੀਭੀਸਚੁ॥੧॥",
        transliteration: "Hai Bhee Sach Nanak Hosee Bhee Sach ||1||",
        punjabiViakhia: "ਇਸ ਵੇਲੇ ਵੀ ਮੌਜੂਦ ਹੈ ਅਤੇ ਹੇ ਨਾਨਕ! ਅਗਾਂਹ ਵੀ ਸਦਾ ਕਾਇਮ ਰਹੇਗਾ ॥੧॥",
        englishTranslation: "True Here And Now. O Nanak, Forever And Ever True. ||1||",
      },
      {
        verseId: 5,
        shabadId: 1,
        pageNo: 1,
        writer: "Guru Nanak Dev Ji",
        raag: "Japji Sahib",
        gurmukhiUnicode: "ਹੁਕਮੀ ਹੋਵਨਿ ਆਕਾਰ ਹੁਕਮੁ ਨ ਕਹਿਆ ਜਾਈ ॥",
        larivaarUnicode: "ਹੁਕਮੀਹੋਵਨਿਆਕਾਰਹੁਕਮੁਨਕਹਿਆਜਾਈ॥",
        transliteration: "Hukamee Hovan Aakaar Hukam Na Kahiaa Jaaee ||",
        punjabiViakhia: "ਅਕਾਲ ਪੁਰਖ ਦੇ ਹੁਕਮ ਅਨੁਸਾਰ ਸਾਰੇ ਸਰੀਰ ਬਣਦੇ ਹਨ, ਪਰ ਹੁਕਮ ਦੱਸਿਆ ਨਹੀਂ ਜਾ ਸਕਦਾ ਕਿ ਕਿਹੋ ਜਿਹਾ ਹੈ।",
        englishTranslation:
          "By Hukam (the Divine Command), bodies and forms are created; Hukam cannot be described in words.",
      },
      {
        verseId: 6,
        shabadId: 1,
        pageNo: 1,
        writer: "Guru Nanak Dev Ji",
        raag: "Japji Sahib",
        gurmukhiUnicode: "ਹੁਕਮੀ ਰਜਾਈ ਚਲਣਾ ਨਾਨਕ ਲਿਖਿਆ ਨਾਲਿ ॥੧॥",
        larivaarUnicode: "ਹੁਕਮੀਰਜਾਈਚਲਣਾਨਾਨਕਲਿਖਿਆਨਾਲਿ॥੧॥",
        transliteration: "Hukamee Rajaaee Chalanaa Nanak Likhiaa Naal ||1||",
        punjabiViakhia: "ਹੇ ਨਾਨਕ! ਪ੍ਰਭੂ ਦੀ ਰਜ਼ਾ ਵਿੱਚ ਤੁਰਨਾ ਹੀ ਕੂੜ ਦੀ ਕੰਧ ਨੂੰ ਤੋੜਨ ਦਾ ਵਿਧਾਨ ਹੈ ਜੋ ਜੀਵ ਦੇ ਨਾਲ ਹੀ ਲਿਖਿਆ ਹੋਇਆ ਹੈ ॥੧॥",
        englishTranslation:
          "O Nanak, it is written that you shall obey the Hukam of His Command, and walk in the Way of His Will. ||1||",
      },
    ],
  },
  1797: {
    shabadId: 1797,
    pageNo: 473,
    writer: "Guru Nanak Dev Ji",
    raag: "Raag Aasaa (Asa Di Vaar)",
    keywords: [
      "kings are born",
      "woman",
      "women",
      "equality",
      "inferior",
      "bhand",
      "mother",
      "so kio mandaa",
      "queen",
      "sovereign",
    ],
    initials: ["skma", "bjbn", "bjm", "skmajjr"],
    verses: [
      {
        verseId: 21552,
        shabadId: 1797,
        pageNo: 473,
        writer: "Guru Nanak Dev Ji",
        raag: "Raag Aasaa",
        gurmukhiUnicode: "ਮਃ ੧ ॥ ਭੰਡਿ ਜੰਮੀਐ ਭੰਡਿ ਨਿੰਮੀਐ ਭੰਡਿ ਮੰਗਣੁ ਵੀਆਹੁ ॥",
        larivaarUnicode: "ਮਃ੧॥ਭੰਡਿਜੰਮੀਐਭੰਡਿਨਿੰਮੀਐਭੰਡਿਮੰਗਣੁਵੀਆਹੁ॥",
        transliteration: "M: 1 || Bhand Jammeeai Bhand Nimmeeai Bhand Mangan Veeaahu ||",
        punjabiViakhia: "ਇਸਤ੍ਰੀ ਤੋਂ ਜਨਮ ਲਈਦਾ ਹੈ, ਇਸਤ੍ਰੀ ਦੇ ਪੇਟ ਵਿੱਚ ਹੀ ਪ੍ਰਾਣੀ ਦਾ ਸਰੀਰ ਬਣਦਾ ਹੈ, ਇਸਤ੍ਰੀ ਰਾਹੀਂ ਹੀ ਕੁੜਮਾਈ ਤੇ ਵਿਆਹ ਹੁੰਦਾ ਹੈ।",
        englishTranslation:
          "First Mehl: From woman, man is born; within woman, man is conceived; to woman he is engaged and married.",
      },
      {
        verseId: 21555,
        shabadId: 1797,
        pageNo: 473,
        writer: "Guru Nanak Dev Ji",
        raag: "Raag Aasaa",
        gurmukhiUnicode: "ਸੋ ਕਿਉ ਮੰਦਾ ਆਖੀਐ ਜਿਤੁ ਜੰਮਹਿ ਰਾਜਾਨ ॥",
        larivaarUnicode: "ਸੋਕਿਉਮੰਦਾਆਖੀਐਜਿਤੁਜੰਮਹਿਰਾਜਾਨ॥",
        transliteration: "So Kio Mandaa Aakheeai Jit Jammeh Raajaan ||",
        punjabiViakhia: "ਜਿਸ ਇਸਤ੍ਰੀ ਜਾਤੀ ਤੋਂ ਰਾਜੇ ਅਤੇ ਮਹਾਂਪੁਰਖ ਜੰਮਦੇ ਹਨ, ਉਸ ਨੂੰ ਮੰਦਾ ਕਿਉਂ ਆਖਿਆ ਜਾਵੇ?",
        englishTranslation:
          "So why call her bad or inferior? From her, kings and sovereigns are born.",
      },
      {
        verseId: 21556,
        shabadId: 1797,
        pageNo: 473,
        writer: "Guru Nanak Dev Ji",
        raag: "Raag Aasaa",
        gurmukhiUnicode: "ਭੰਡਹੁ ਹੀ ਭੰਡੁ ਊਪਜੈ ਭੰਡੈ ਬਾਝੁ ਨ ਕੋਇ ॥",
        larivaarUnicode: "ਭੰਡਹੁਹੀਭੰਡੁਊਪਜੈਭੰਡੈਬਾਝੁਨਕੋਇ॥",
        transliteration: "Bhandahu Hee Bhand Oopajai Bhandai Baajh Na Koe ||",
        punjabiViakhia: "ਇਸਤ੍ਰੀ ਤੋਂ ਹੀ ਇਸਤ੍ਰੀ ਪੈਦਾ ਹੁੰਦੀ ਹੈ, ਇਸਤ੍ਰੀ ਤੋਂ ਬਿਨਾਂ ਕਿਸੇ ਦਾ ਵੀ ਜਨਮ ਨਹੀਂ ਹੋ ਸਕਦਾ।",
        englishTranslation:
          "From woman, woman is born; without woman, there would be no one at all.",
      },
      {
        verseId: 21557,
        shabadId: 1797,
        pageNo: 473,
        writer: "Guru Nanak Dev Ji",
        raag: "Raag Aasaa",
        gurmukhiUnicode: "ਨਾਨਕ ਭੰਡੈ ਬਾਹਰਾ ਏਕੋ ਸਚਾ ਸੋਇ ॥",
        larivaarUnicode: "ਨਾਨਕਭੰਡੈਬਾਹਰਾਏਕੋਸਚਾਸੋਇ॥",
        transliteration: "Nanak Bhandai Baaharaa Eko Sachaa Soe ||",
        punjabiViakhia: "ਹੇ ਨਾਨਕ! ਕੇਵਲ ਇੱਕ ਸੱਚਾ ਪ੍ਰਭੂ ਹੀ ਹੈ ਜੋ ਇਸਤ੍ਰੀ ਤੋਂ ਬਿਨਾਂ (ਆਪਣੇ ਆਪ ਤੋਂ) ਹੈ।",
        englishTranslation: "O Nanak, only the True One is without woman.",
      },
    ],
  },
  3630: {
    shabadId: 3630,
    pageNo: 967,
    writer: "Bhatt Balwand & Satta Doom",
    raag: "Raag Ramkali (Ramkali Ki Vaar)",
    keywords: [
      "langar",
      "khivi",
      "mata khivi",
      "kheer",
      "shade",
      "wealth",
      "generosity",
      "seva",
      "balwand",
    ],
    initials: ["bknj", "ldvr"],
    verses: [
      {
        verseId: 41355,
        shabadId: 3630,
        pageNo: 967,
        writer: "Bhatt Balwand & Satta Doom",
        raag: "Raag Ramkali",
        gurmukhiUnicode: "ਬਲਵੰਡ ਖੀਵੀ ਨੇਕ ਜਨ ਜਿਸੁ ਬਹੁਤੀ ਛਾਉ ਪਤ੍ਰਾਲੀ ॥",
        larivaarUnicode: "ਬਲਵੰਡਖੀਵੀਨੇਕਜਨਜਿਸੁਬਹੁਤੀਛਾਉਪਤ੍ਰਾਲੀ॥",
        transliteration: "Balvand Kheevee Nek Jan Jis Bahutee Chhaau Patraalee ||",
        punjabiViakhia: "ਬਲਵੰਡ ਆਖਦਾ ਹੈ—ਮਾਤਾ ਖੀਵੀ ਜੀ ਭਲੇ ਪੁਰਖ ਹਨ, ਜਿਨ੍ਹਾਂ ਦੀ ਸੰਘਣੀ ਪੱਤਿਆਂ ਵਾਲੀ ਛਾਂ ਸਭ ਨੂੰ ਆਸਰਾ ਦਿੰਦੀ ਹੈ।",
        englishTranslation:
          "Says Balwand: Khivi is a noble person, who gives soothing, leafy shade to all.",
      },
      {
        verseId: 41356,
        shabadId: 3630,
        pageNo: 967,
        writer: "Bhatt Balwand & Satta Doom",
        raag: "Raag Ramkali",
        gurmukhiUnicode: "ਲੰਗਰਿ ਦਉਲਤਿ ਵੰਡੀਐ ਰਸੁ ਅੰਮ੍ਰਿਤੁ ਖੀਰਿ ਘਿਆਲੀ ॥",
        larivaarUnicode: "ਲੰਗਰਿਦਉਲਤਿਵੰਡੀਐਰਸੁਅੰਮ੍ਰਿਤੁਖੀਰਿਘਿਆਲੀ॥",
        transliteration: "Langar Daulat Vandeeai Ras Amrit Kheer Ghiaalee ||",
        punjabiViakhia: "ਗੁਰੂ ਦੇ ਲੰਗਰ ਵਿੱਚ ਦੌਲਤ ਵੰਡੀ ਜਾਂਦੀ ਹੈ—ਘਿਉ ਵਾਲੀ ਸੁਆਦਲੀ ਖੀਰ ਜੋ ਅੰਮ੍ਰਿਤ ਵਰਗੀ ਹੈ।",
        englishTranslation:
          "In the Guru's Langar, wealth is distributed—ambrosial kheer (rice pudding) rich with pure ghee.",
      },
    ],
  },
  3393: {
    shabadId: 3393,
    pageNo: 917,
    writer: "Guru Amar Das Ji",
    raag: "Raag Ramkali (Anand Sahib)",
    keywords: [
      "anand",
      "bliss",
      "ecstasy",
      "mother",
      "true guru",
      "peace",
      "joy",
      "anand sahib",
    ],
    initials: ["abmm", "abmmsmp"],
    verses: [
      {
        verseId: 39175,
        shabadId: 3393,
        pageNo: 917,
        writer: "Guru Amar Das Ji",
        raag: "Raag Ramkali",
        gurmukhiUnicode: "ਅਨੰਦੁ ਭਇਆ ਮੇਰੀ ਮਾਏ ਸਤਿਗੁਰੂ ਮੈ ਪਾਇਆ ॥",
        larivaarUnicode: "ਅਨੰਦੁਭਇਆਮੇਰੀਮਾਏਸਤਿਗੁਰੂਮੈਪਾਇਆ॥",
        transliteration: "Anand Bhaiaa Meree Maae Satguroo Mai Paaiaa ||",
        punjabiViakhia: "ਹੇ ਮੇਰੀ ਮਾਂ! ਮੇਰੇ ਅੰਦਰ ਪੂਰਨ ਆਨੰਦ ਪੈਦਾ ਹੋ ਗਿਆ ਹੈ ਕਿਉਂਕਿ ਮੈਨੂੰ ਸਤਿਗੁਰੂ ਮਿਲ ਪਿਆ ਹੈ।",
        englishTranslation:
          "I am in ecstasy, O my mother, for I have found my True Guru.",
      },
      {
        verseId: 39176,
        shabadId: 3393,
        pageNo: 917,
        writer: "Guru Amar Das Ji",
        raag: "Raag Ramkali",
        gurmukhiUnicode: "ਸਤਿਗੁਰੁ ਤ ਪਾਇਆ ਸਹਜ ਸੇਤੀ ਮਨਿ ਵਜੀਆ ਵਾਧਾਈਆ ॥",
        larivaarUnicode: "ਸਤਿਗੁਰੁਤਪਾਇਆਸਹਜਸੇਤੀਮਨਿਵਜੀਆਵਾਧਾਈਆ॥",
        transliteration: "Satgur Ta Paaiaa Sahaj Setee Man Vajeeaa Vaadhaaeeaa ||",
        punjabiViakhia: "ਸਤਿਗੁਰੂ ਤਾਂ ਅਡੋਲ ਅਵਸਥਾ ਦੇ ਨਾਲ ਮਿਲਿਆ ਹੈ ਅਤੇ ਮੇਰੇ ਮਨ ਵਿੱਚ ਖ਼ੁਸ਼ੀ ਦੇ ਵਾਜੇ ਵੱਜ ਪਏ ਹਨ।",
        englishTranslation:
          "I have found the True Guru, with intuitive ease, and my mind vibrates with the music of bliss.",
      },
    ],
  },
  4861: {
    shabadId: 4861,
    pageNo: 1350,
    writer: "Bhagat Kabir Ji",
    raag: "Raag Prabhaatee",
    keywords: [
      "avali allah",
      "equality",
      "clay",
      "one light",
      "humanity",
      "caste",
      "noor",
      "creator",
    ],
    initials: ["aano", "ekn"],
    verses: [
      {
        verseId: 57690,
        shabadId: 4861,
        pageNo: 1349,
        writer: "Bhagat Kabir Ji",
        raag: "Raag Prabhaatee",
        gurmukhiUnicode: "ਅਵਲਿ ਅਲਹ ਨੂਰੁ ਉਪਾਇਆ ਕੁਦਰਤਿ ਕੇ ਸਭ ਬੰਦੇ ॥",
        larivaarUnicode: "ਅਵਲਿਅਲਹਨੂਰੁਉਪਾਇਆਕੁਦਰਤਿਕੇਸਭਬੰਦੇ॥",
        transliteration: "Aval Alah Noor Oupaaiaa Kudarat Ke Sabh Bande ||",
        punjabiViakhia: "ਸਭ ਤੋਂ ਪਹਿਲਾਂ ਅੱਲ੍ਹਾ ਨੇ ਆਪਣਾ ਨੂਰ (ਪ੍ਰਕਾਸ਼) ਪੈਦਾ ਕੀਤਾ, ਅਤੇ ਸਾਰੇ ਜੀਵ ਕੁਦਰਤ ਦੇ ਬੰਦੇ ਹਨ।",
        englishTranslation:
          "First, Allah created the Light; then, by His Creative Power, He made all mortal beings.",
      },
      {
        verseId: 57691,
        shabadId: 4861,
        pageNo: 1349,
        writer: "Bhagat Kabir Ji",
        raag: "Raag Prabhaatee",
        gurmukhiUnicode: "ਏਕ ਨੂਰ ਤੇ ਸਭੁ ਜਗੁ ਉਪਜਿਆ ਕਉਨ ਭਲੇ ਕੋ ਮੰਦੇ ॥੧॥",
        larivaarUnicode: "ਏਕਨੂਰਤੇਸਭੁਜਗੁਉਪਜਿਆਕਉਨਭਲੇਕੋਮੰਦੇ॥੧॥",
        transliteration: "Ek Noor Te Sabh Jag Oupajiaa Kaun Bhale Ko Mande ||1||",
        punjabiViakhia: "ਇੱਕੋ ਨੂਰ ਤੋਂ ਸਾਰਾ ਜਗਤ ਪੈਦਾ ਹੋਇਆ ਹੈ, ਫਿਰ ਕੌਣ ਚੰਗਾ ਤੇ ਕੌਣ ਮੰਦਾ ਕਿਹਾ ਜਾ ਸਕਦਾ ਹੈ? ॥੧॥",
        englishTranslation:
          "From the One Light, the entire universe welled up. So who is good, and who is bad? ||1||",
      },
    ],
  },
  5356: {
    shabadId: 5356,
    pageNo: 1427,
    writer: "Guru Tegh Bahadur Ji",
    raag: "Salok Mahalla 9",
    keywords: [
      "fear",
      "fearless",
      "frighten",
      "bhay kahu ko det neh",
      "guru tegh bahadur",
      "courage",
      "sovereignty",
    ],
    initials: ["bkkdn", "nmkd"],
    verses: [
      {
        verseId: 60403,
        shabadId: 5356,
        pageNo: 1427,
        writer: "Guru Tegh Bahadur Ji",
        raag: "Salok Mahalla 9",
        gurmukhiUnicode: "ਭੈ ਕਾਹੂ ਕਉ ਦੇਤ ਨਹਿ ਨਹਿ ਭੈ ਮਾਨਤ ਆਨ ॥",
        larivaarUnicode: "ਭੈਕਾਹੂਕਉਦੇਤਨਹਿਨਹਿਭੈਮਾਨਤਆਨ॥",
        transliteration: "Bhai Kaahoo Kau Det Nahi Nahi Bhai Maanat Aan ||",
        punjabiViakhia: "ਜੋ ਮਨੁੱਖ ਨਾ ਕਿਸੇ ਨੂੰ ਡਰਾਉਂਦਾ ਹੈ ਅਤੇ ਨਾ ਹੀ ਕਿਸੇ ਹੋਰ ਦਾ ਡਰ ਮੰਨਦਾ ਹੈ—",
        englishTranslation:
          "One who does not frighten anyone, and who is not afraid of anyone else—",
      },
      {
        verseId: 60404,
        shabadId: 5356,
        pageNo: 1427,
        writer: "Guru Tegh Bahadur Ji",
        raag: "Salok Mahalla 9",
        gurmukhiUnicode: "ਕਹੁ ਨਾਨਕ ਸੁਨਿ ਰੇ ਮਨਾ ਗਿਆਨੀ ਤਾਹਿ ਬਖਾਨਿ ॥੧੬॥",
        larivaarUnicode: "ਕਹੁਨਾਨਕਸੁਨਿਰੇਮਨਾਗਿਆਨੀਤਾਹਿਬਖਾਨਿ॥੧੬॥",
        transliteration: "Kahu Nanak Sun Re Manaa Giaanee Taahi Bakhaan ||16||",
        punjabiViakhia: "ਹੇ ਨਾਨਕ! ਆਖ—ਹੇ ਮਨ ਸੁਣ, ਉਸੇ ਮਨੁੱਖ ਨੂੰ ਅਸਲ ਗਿਆਨੀ ਸਮਝ ॥੧੬॥",
        englishTranslation:
          "Says Nanak, listen, O mind: call that person spiritually wise! ||16||",
      },
    ],
  },
};

const FALLBACK_HUKAMNAMA: NormalizedHukamnama = {
  gregorianDate: new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
  nanakshahiDate: "Chet / Vaisakh • Nanakshahi Samvat 558",
  ang: 611,
  raag: "Raag Sorath • Mahala 5",
  writer: "Guru Arjan Dev Ji",
  titleGurmukhi: "ਸੋਰਠਿ ਮਹਲਾ ੫ ਘਰੁ ੨ ਅਸਟਪਦੀਆ",
  verses: [
    {
      verseId: 26391,
      shabadId: 2394,
      pageNo: 611,
      writer: "Guru Arjan Dev Ji",
      raag: "Raag Sorath",
      gurmukhiUnicode: "ਸੋਰਠਿ ਮਹਲਾ ੫ ॥ ਕਰਿ ਇਸਨਾਨੁ ਸਿਮਰਿ ਪ੍ਰਭੁ ਅਪਨਾ ਮਨ ਤਨ ਭਏ ਅਰੋਗਾ ॥",
      larivaarUnicode: "ਸੋਰਠਿਮਹਲਾ੫॥ਕਰਿਇਸਨਾਨੁਸਿਮਰਿਪ੍ਰਭੁਅਪਨਾਮਨਤਨਭਏਅਰੋਗਾ॥",
      transliteration: "Sorath Mahalaa 5 || Kar Isanaan Simar Prabh Apanaa Man Tan Bhae Arogaa ||",
      punjabiViakhia:
        "ਹੇ ਭਾਈ! ਅੰਮ੍ਰਿਤ ਵੇਲੇ ਇਸ਼ਨਾਨ ਕਰ ਕੇ ਆਪਣੇ ਪ੍ਰਭੂ ਦਾ ਸਿਮਰਨ ਕਰ, ਇਸ ਨਾਲ ਮਨ ਅਤੇ ਤਨ ਦੋਵੇਂ ਨਿਰੋਗ ਹੋ ਜਾਂਦੇ ਹਨ।",
      englishTranslation:
        "Sorath, Fifth Mehl: After taking your cleansing bath, remember your God in meditation, and your mind and body shall be free of disease.",
    },
    {
      verseId: 26392,
      shabadId: 2394,
      pageNo: 611,
      writer: "Guru Arjan Dev Ji",
      raag: "Raag Sorath",
      gurmukhiUnicode: "ਕੋਟਿ ਬਿਘਨ ਲਾਥੇ ਪ੍ਰਭ ਸਰਣਾ ਪ੍ਰਗਟੇ ਭਲੇ ਸੰਜੋਗਾ ॥੧॥",
      larivaarUnicode: "ਕੋਟਿਬਿਘਨਲਾਥੇਪ੍ਰਭਸਰਣਾਪ੍ਰਗਟੇਭਲੇਸੰਜੋਗਾ॥੧॥",
      transliteration: "Kot Bighan Laathe Prabh Saranaa Pragate Bhale Sanjogaa ||1||",
      punjabiViakhia:
        "ਪ੍ਰਭੂ ਦੀ ਸਰਨ ਪਿਆਂ ਕਰੋੜਾਂ ਵਿਘਨ ਦੂਰ ਹੋ ਜਾਂਦੇ ਹਨ ਅਤੇ ਪ੍ਰਭੂ-ਮਿਲਾਪ ਦੇ ਚੰਗੇ ਅਵਸਰ ਪ੍ਰਗਟ ਹੋ ਜਾਂਦੇ ਹਨ ॥੧॥",
      englishTranslation:
        "Millions of obstacles are removed in the Sanctuary of God, and good fortune dawns. ||1||",
    },
    {
      verseId: 26393,
      shabadId: 2394,
      pageNo: 611,
      writer: "Guru Arjan Dev Ji",
      raag: "Raag Sorath",
      gurmukhiUnicode: "ਪ੍ਰਭ ਬਾਣੀ ਸਬਦੁ ਸੁਭਾਖਿਆ ॥ ਗਾਵਹੁ ਸੁਣਹੁ ਪੜਹੁ ਨਿਤ ਭਾਈ ਗੁਰ ਪੂਰੈ ਤੂ ਰਾਖਿਆ ॥ ਰਹਾਉ ॥",
      larivaarUnicode: "ਪ੍ਰਭਬਾਣੀਸਬਦੁਸੁਭਾਖਿਆ॥ਗਾਵਹੁਸੁਣਹੁਪੜਹੁਨਿਤਭਾਈਗੁਰਪੂਰੈਤੂਰਾਖਿਆ॥ਰਹਾਉ॥",
      transliteration:
        "Prabh Baanee Sabad Subhaakhiaa || Gaavahu Sunahu Parhahu Nit Bhaaee Gur Poorai Too Raakhiaa || Rahaau ||",
      punjabiViakhia:
        "ਹੇ ਭਾਈ! ਪ੍ਰਭੂ ਦੀ ਸਿਫ਼ਤਿ-ਸਾਲਾਹ ਦੀ ਬਾਣੀ ਸਦਾ ਗਾਇਆ ਕਰੋ, ਸੁਣਿਆ ਕਰੋ ਅਤੇ ਪੜ੍ਹਿਆ ਕਰੋ; ਪੂਰੇ ਗੁਰੂ ਨੇ ਤੁਹਾਡੀ ਰੱਖਿਆ ਕੀਤੀ ਹੈ ॥ ਰਹਾਉ ॥",
      englishTranslation:
        "The Word of God's Bani, and His Shabad, are the best utterances. So constantly sing them, listen to them, and read them, O Siblings of Destiny, and the Perfect Guru shall save you. || Pause ||",
    },
    {
      verseId: 26394,
      shabadId: 2394,
      pageNo: 611,
      writer: "Guru Arjan Dev Ji",
      raag: "Raag Sorath",
      gurmukhiUnicode: "ਸਾਚਾ ਸਾਹਿਬੁ ਅਮਿਤਿ ਵਡਾਈ ਭਗਤਿ ਵਛਲ ਦਇਆਲਾ ॥",
      larivaarUnicode: "ਸਾਚਾਸਾਹਿਬੁਅਮਿਤਿਵਡਾਈਭਗਤਿਵਛਲਦਇਆਲਾ॥",
      transliteration: "Saachaa Saahib Amit Vadaaee Bhagat Vachhal Daiaalaa ||",
      punjabiViakhia:
        "ਉਹ ਮਾਲਕ ਸਦਾ ਕਾਇਮ ਰਹਿਣ ਵਾਲਾ ਹੈ, ਉਸ ਦੀ ਵਡਿਆਈ ਮਿਣੀ ਨਹੀਂ ਜਾ ਸਕਦੀ, ਉਹ ਭਗਤੀ ਨਾਲ ਪਿਆਰ ਕਰਨ ਵਾਲਾ ਅਤੇ ਦਇਆ ਦਾ ਘਰ ਹੈ।",
      englishTranslation:
        "The True Lord and Master's glorious greatness is immeasurable; the Merciful Lord is the Lover of His devotees.",
    },
    {
      verseId: 26395,
      shabadId: 2394,
      pageNo: 611,
      writer: "Guru Arjan Dev Ji",
      raag: "Raag Sorath",
      gurmukhiUnicode: "ਸੰਤਾ ਕੀ ਪੈਜ ਰਖਦਾ ਆਇਆ ਆਦਿ ਬਿਰਦੁ ਪ੍ਰਤਿਪਾਲਾ ॥੨॥",
      larivaarUnicode: "ਸੰਤਾਕੀਪੈਜਰਖਦਾਆਇਆਆਦਿਬਿਰਦੁਪ੍ਰਤਿਪਾਲਾ॥੨॥",
      transliteration: "Santaa Kee Paij Rakhadaa Aaiaa Aad Birad Pratipaalaa ||2||",
      punjabiViakhia:
        "ਉਹ ਮੁੱਢ ਤੋਂ ਹੀ ਆਪਣੇ ਸੰਤਾਂ ਦੀ ਲਾਜ ਰੱਖਦਾ ਆਇਆ ਹੈ ਅਤੇ ਆਪਣੇ ਇਸ ਮੁੱਢ-ਕਦੀਮਾਂ ਦੇ ਸੁਭਾਉ ਨੂੰ ਸਦਾ ਨਿਭਾਉਂਦਾ ਹੈ ॥੨॥",
      englishTranslation:
        "He has preserved the honor of His Saints; from the very beginning of time, His nature is to cherish them. ||2||",
    },
    {
      verseId: 26396,
      shabadId: 2394,
      pageNo: 612,
      writer: "Guru Arjan Dev Ji",
      raag: "Raag Sorath",
      gurmukhiUnicode: "ਹਰਿ ਅੰਮ੍ਰਿਤ ਨਾਮੁ ਭੋਜਨੁ ਨਿਤ ਭੁੰਚਹੁ ਸਰਬ ਵੇਲਾ ਮੁਖਿ ਪਾਵਹੁ ॥",
      larivaarUnicode: "ਹਰਿਅੰਮ੍ਰਿਤਨਾਮੁਭੋਜਨੁਨਿਤਭੁੰਚਹੁਸਰਬਵੇਲਾਮੁਖਿਪਾਵਹੁ॥",
      transliteration: "Har Amrit Naam Bhojan Nit Bhunchahu Sarab Velaa Mukh Paavahu ||",
      punjabiViakhia:
        "ਹੇ ਭਾਈ! ਪਰਮਾਤਮਾ ਦਾ ਆਤਮਕ ਜੀਵਨ ਦੇਣ ਵਾਲਾ ਨਾਮ-ਰੂਪੀ ਭੋਜਨ ਸਦਾ ਛਕਦੇ ਰਹੋ, ਹਰ ਵੇਲੇ ਆਪਣੇ ਮੂੰਹ ਵਿੱਚ ਪਾਉਂਦੇ ਰਹੋ।",
      englishTranslation:
        "So take the Ambrosial Naam, the Name of the Lord, as your steady nourishment; put it into your mouth at all times.",
    },
    {
      verseId: 26397,
      shabadId: 2394,
      pageNo: 612,
      writer: "Guru Arjan Dev Ji",
      raag: "Raag Sorath",
      gurmukhiUnicode: "ਜਰਾ ਮਰਾ ਤਾਪੁ ਸਭੁ ਨਾਠਾ ਗੁਣ ਗੋਬਿੰਦ ਨਿਤ ਗਾਵਹੁ ॥੩॥",
      larivaarUnicode: "ਜਰਾਮਰਾਤਾਪੁਸਭੁਨਾਠਾਗੁਣਗੋਬਿੰਦਨਿਤਗਾਵਹੁ॥੩॥",
      transliteration: "Jaraa Maraa Taap Sabh Naathaa Gun Gobind Nit Gaavahu ||3||",
      punjabiViakhia:
        "ਗੋਬਿੰਦ ਦੇ ਗੁਣ ਸਦਾ ਗਾਇਆ ਕਰੋ, ਇਸ ਨਾਲ ਬੁਢੇਪੇ, ਮੌਤ ਅਤੇ ਦੁੱਖ-ਕਲੇਸ਼ਾਂ ਦਾ ਸਾਰਾ ਡਰ ਦੂਰ ਹੋ ਜਾਂਦਾ ਹੈ ॥੩॥",
      englishTranslation:
        "The pains of old age and death shall all run away, when you constantly sing the Glorious Praises of the Lord of the Universe. ||3||",
    },
    {
      verseId: 26398,
      shabadId: 2394,
      pageNo: 612,
      writer: "Guru Arjan Dev Ji",
      raag: "Raag Sorath",
      gurmukhiUnicode: "ਸੁਣੀ ਅਰਦਾਸਿ ਸੁਆਮੀ ਮੇਰੈ ਸਰਬ ਕਲਾ ਬਣਿ ਆਈ ॥",
      larivaarUnicode: "ਸੁਣੀਅਰਦਾਸਿਸੁਆਮੀਮੇਰੈਸਰਬਕਲਾਬਣਿਆਈ॥",
      transliteration: "Sunee Aradaas Suaamee Merai Sarab Kalaa Ban Aaee ||",
      punjabiViakhia:
        "ਮੇਰੇ ਮਾਲਕ-ਪ੍ਰਭੂ ਨੇ ਅਰਦਾਸ ਸੁਣ ਲਈ ਹੈ ਅਤੇ ਸਾਰੀਆਂ ਤਾਕਤਾਂ ਨਾਲ ਕੰਮ ਸਿਰੇ ਚੜ੍ਹ ਗਿਆ ਹੈ।",
      englishTranslation:
        "My Lord and Master has heard my prayer, and all my affairs have been resolved.",
    },
    {
      verseId: 26399,
      shabadId: 2394,
      pageNo: 612,
      writer: "Guru Arjan Dev Ji",
      raag: "Raag Sorath",
      gurmukhiUnicode: "ਪ੍ਰਗਟ ਭਈ ਸਗਲੇ ਜੁਗ ਅੰਤਰਿ ਗੁਰ ਨਾਨਕ ਕੀ ਵਡਿਆਈ ॥੪॥੧੧॥",
      larivaarUnicode: "ਪ੍ਰਗਟਭਈਸਗਲੇਜੁਗਅੰਤਰਿਗੁਰਨਾਨਕਕੀਵਡਿਆਈ॥੪॥੧੧॥",
      transliteration: "Pragat Bhaee Sagale Jug Antar Gur Nanak Kee Vadaaee ||4||11||",
      punjabiViakhia:
        "ਗੁਰੂ ਨਾਨਕ ਸਾਹਿਬ ਜੀ ਦੀ ਵਡਿਆਈ ਸਾਰੇ ਜੁਗਾਂ ਵਿੱਚ ਪ੍ਰਤੱਖ ਪ੍ਰਗਟ ਹੋ ਗਈ ਹੈ ॥੪॥੧੧॥",
      englishTranslation:
        "The glorious greatness of Guru Nanak has become manifest throughout all the ages. ||4||11||",
    },
  ],
};

function normalizeBaniDbVerse(raw: any, fallbackShabadInfo?: any): NormalizedVerse {
  const verseObj = raw?.verse || raw || {};
  const shabadId = Number(
    verseObj?.shabadId ?? raw?.shabadId ?? fallbackShabadInfo?.shabadId ?? verseObj?.verseId ?? 1
  );
  const pageNo = Number(
    verseObj?.pageNo ?? raw?.pageNo ?? fallbackShabadInfo?.pageNo ?? verseObj?.ang ?? 1
  );
  const writer =
    verseObj?.writer?.english ||
    raw?.writer?.english ||
    fallbackShabadInfo?.writer?.english ||
    "Sri Guru Granth Sahib Ji";
  const raag =
    verseObj?.raag?.english ||
    raw?.raag?.english ||
    fallbackShabadInfo?.raag?.english ||
    "Gurbani";
  const gurmukhiUnicode =
    verseObj?.verse?.unicode ||
    verseObj?.gurmukhi?.unicode ||
    raw?.verse?.unicode ||
    raw?.gurmukhi?.unicode ||
    verseObj?.verse?.gurmukhi ||
    "";
  const larivaarUnicode =
    verseObj?.larivaar?.unicode ||
    raw?.larivaar?.unicode ||
    toLarivaar(gurmukhiUnicode);
  const transliteration =
    verseObj?.transliteration?.english ||
    verseObj?.transliteration?.en ||
    raw?.transliteration?.english ||
    raw?.transliteration?.en ||
    "";
  const punjabiViakhia =
    verseObj?.translation?.pu?.ss?.unicode ||
    verseObj?.translation?.pu?.bdb?.unicode ||
    verseObj?.translation?.pu?.ft?.unicode ||
    raw?.translation?.pu?.ss?.unicode ||
    raw?.translation?.pu?.bdb?.unicode ||
    "";
  const englishTranslation =
    verseObj?.translation?.en?.bdb ||
    verseObj?.translation?.en?.ms ||
    verseObj?.translation?.en?.ssk ||
    raw?.translation?.en?.bdb ||
    raw?.translation?.en?.ms ||
    "";

  return {
    verseId: Number(verseObj?.verseId ?? raw?.verseId ?? Math.random() * 100000),
    shabadId,
    pageNo,
    writer,
    raag,
    gurmukhiUnicode,
    larivaarUnicode,
    transliteration,
    punjabiViakhia,
    englishTranslation,
    headerRank: Number(raw?.header ?? verseObj?.header ?? 0),
  };
}

function groupVersesIntoSections(
  verses: NormalizedVerse[],
  baniId: number
): BaniSectionPage[] {
  if (verses.length === 0) return [];

  // For Sukhmani Sahib (baniId 31), group into 24 Ashtpadis when possible
  if (baniId === 31 && verses.length >= 24) {
    const sections: BaniSectionPage[] = [];
    let currentVerses: NormalizedVerse[] = [];
    let ashtpadiNum = 1;

    for (const v of verses) {
      const isSalokStart =
        v.gurmukhiUnicode.includes("ਸਲੋਕੁ") && currentVerses.length > 6;
      if (isSalokStart && ashtpadiNum < 24) {
        sections.push({
          sectionIndex: ashtpadiNum,
          title: `Ashtpadi ${ashtpadiNum}`,
          gurmukhiTitle: `ਅਸਟਪਦੀ ${ashtpadiNum}`,
          verses: currentVerses,
        });
        ashtpadiNum++;
        currentVerses = [v];
      } else {
        currentVerses.push(v);
      }
    }
    if (currentVerses.length > 0) {
      sections.push({
        sectionIndex: ashtpadiNum,
        title: `Ashtpadi ${ashtpadiNum}`,
        gurmukhiTitle: `ਅਸਟਪਦੀ ${ashtpadiNum}`,
        verses: currentVerses,
      });
    }
    return sections;
  }

  // Group into Pauris / Chhands (~10–14 verses per page, splitting cleanly on numbered Pauri endings like ॥੧॥, ॥੨॥)
  const pages: BaniSectionPage[] = [];
  let bucket: NormalizedVerse[] = [];
  let pageNum = 1;

  for (let i = 0; i < verses.length; i++) {
    const v = verses[i];
    bucket.push(v);
    const endsPauri = /॥\s*[੦-੯0-9]+\s*॥/.test(v.gurmukhiUnicode);
    if ((endsPauri && bucket.length >= 6) || bucket.length >= 14) {
      pages.push({
        sectionIndex: pageNum,
        title: `Pauri / Section ${pageNum}`,
        gurmukhiTitle: `ਪਉੜੀ / ਭਾਗ ${pageNum}`,
        verses: bucket,
      });
      pageNum++;
      bucket = [];
    }
  }

  if (bucket.length > 0) {
    pages.push({
      sectionIndex: pageNum,
      title: `Pauri / Section ${pageNum}`,
      gurmukhiTitle: `ਪਉੜੀ / ਭਾਗ ${pageNum}`,
      verses: bucket,
    });
  }

  return pages;
}

function searchCuratedFallback(query: string): NormalizedVerse[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const matchedVerses: NormalizedVerse[] = [];
  for (const shabad of Object.values(CURATED_SHABADS)) {
    const shabadMatches =
      shabad.initials.some((init) => init.includes(q) || q.includes(init)) ||
      shabad.keywords.some((kw) => kw.includes(q) || q.includes(kw)) ||
      shabad.writer.toLowerCase().includes(q) ||
      shabad.raag.toLowerCase().includes(q);

    for (const v of shabad.verses) {
      const verseMatches =
        v.englishTranslation.toLowerCase().includes(q) ||
        v.transliteration.toLowerCase().includes(q) ||
        v.gurmukhiUnicode.includes(q);

      if (verseMatches || shabadMatches) {
        matchedVerses.push(v);
      }
    }
  }

  const seen = new Set<number>();
  return matchedVerses.filter((v) => {
    if (seen.has(v.verseId)) return false;
    seen.add(v.verseId);
    return true;
  });
}

async function fetchBaniDbJson(url: string, timeoutMs = 6500): Promise<any | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const mode = searchParams.get("mode");
  const baniIdParam = searchParams.get("baniId");
  const shabadIdParam = searchParams.get("shabadId");
  const rawQuery = (searchParams.get("q") || "").trim();
  const explicitType = searchParams.get("searchtype");

  // 1. Daily Sri Darbar Sahib Hukamnama: GET /api/banidb?mode=hukamnama
  if (mode === "hukamnama") {
    const data = await fetchBaniDbJson("https://api.banidb.com/v2/hukamnamas/today");

    if (data && Array.isArray(data.shabads) && data.shabads.length > 0) {
      const firstShabad = data.shabads[0];
      const info = firstShabad?.shabadInfo || {};
      const rawVerses = data.shabads.flatMap((s: any) =>
        Array.isArray(s.verses) ? s.verses : []
      );
      const verses: NormalizedVerse[] = rawVerses
        .map((v: any) => normalizeBaniDbVerse(v, info))
        .filter((v: NormalizedVerse) => Boolean(v.gurmukhiUnicode));

      if (verses.length > 0) {
        const gregObj = data.date?.gregorian;
        const nanakObj = data.date?.nanakshahi?.english;
        const gregorianDate = gregObj
          ? `${gregObj.day || ""}, ${gregObj.month || ""} ${gregObj.date || ""}, ${
              gregObj.year || ""
            }`.replace(/^,\s*/, "")
          : FALLBACK_HUKAMNAMA.gregorianDate;
        const nanakshahiDate = nanakObj
          ? `${nanakObj.date || ""} ${nanakObj.monthName || ""}, Samvat ${
              nanakObj.year || "558"
            }`
          : FALLBACK_HUKAMNAMA.nanakshahiDate;

        const hukamnama: NormalizedHukamnama = {
          gregorianDate,
          nanakshahiDate,
          ang: Number(info.pageNo ?? verses[0]?.pageNo ?? 611),
          raag: info?.raag?.english || verses[0]?.raag || "Raag Sorath",
          writer:
            info?.writer?.english || verses[0]?.writer || "Sri Guru Granth Sahib Ji",
          titleGurmukhi: verses[0]?.gurmukhiUnicode || FALLBACK_HUKAMNAMA.titleGurmukhi,
          verses,
        };

        return Response.json({
          ok: true,
          source: "banidb-live",
          hukamnama,
        });
      }
    }

    return Response.json({
      ok: true,
      source: "curated-archive",
      hukamnama: FALLBACK_HUKAMNAMA,
    });
  }

  // 2. Complete Bani Lookup for Nitnem & Sukhmani Sahib Reader: GET /api/banidb?baniId=...
  if (baniIdParam) {
    const baniIdNum = Number(baniIdParam);
    const data = await fetchBaniDbJson(
      `https://api.banidb.com/v2/banis/${encodeURIComponent(baniIdParam)}`,
      8000
    );

    if (data && Array.isArray(data.verses) && data.verses.length > 0) {
      const info = data.baniInfo || {};
      const verses: NormalizedVerse[] = data.verses
        .map((v: any) => normalizeBaniDbVerse(v, info))
        .filter((v: NormalizedVerse) => Boolean(v.gurmukhiUnicode));

      const sections = groupVersesIntoSections(verses, baniIdNum);
      return Response.json({
        ok: true,
        source: "banidb-live",
        baniInfo: {
          baniId: baniIdNum,
          nameGurmukhi: info?.unicode || "ਗੁਰਬਾਣੀ",
          nameEnglish: info?.english || "Nitnem Bani",
          writer: info?.writer?.english || verses[0]?.writer || "Sikh Gurus",
          raag: info?.raag?.english || "Sacred Bani",
        },
        sections,
        totalVerses: verses.length,
      });
    }

    // Fallback sections if offline
    const fallbackShabad = CURATED_SHABADS[1];
    return Response.json({
      ok: true,
      source: "curated-archive",
      baniInfo: {
        baniId: baniIdNum,
        nameGurmukhi: "ਜਪੁਜੀ ਸਾਹਿਬ",
        nameEnglish: "Sacred Bani Archive",
        writer: fallbackShabad.writer,
        raag: fallbackShabad.raag,
      },
      sections: [
        {
          sectionIndex: 1,
          title: "Pauri / Section 1",
          gurmukhiTitle: "ਪਉੜੀ ੧",
          verses: fallbackShabad.verses,
        },
      ],
      totalVerses: fallbackShabad.verses.length,
    });
  }

  // 3. Full Shabad Lookup: GET /api/banidb?shabadId=...
  if (shabadIdParam) {
    const idNum = Number(shabadIdParam);
    const data = await fetchBaniDbJson(
      `https://api.banidb.com/v2/shabads/${encodeURIComponent(shabadIdParam)}`
    );

    if (data && Array.isArray(data.verses) && data.verses.length > 0) {
      const info = data.shabadInfo || {};
      const verses = data.verses.map((v: any) => normalizeBaniDbVerse(v, info));
      return Response.json({
        ok: true,
        source: "banidb-live",
        shabad: {
          shabadId: Number(info.shabadId ?? idNum),
          pageNo: Number(info.pageNo ?? verses[0]?.pageNo ?? 1),
          writer: info?.writer?.english || verses[0]?.writer || "Sri Guru Granth Sahib Ji",
          raag: info?.raag?.english || verses[0]?.raag || "Gurbani",
          verses,
        } satisfies NormalizedShabad,
      });
    }

    const fallbackShabad = CURATED_SHABADS[idNum] || CURATED_SHABADS[1];
    return Response.json({
      ok: true,
      source: "curated-archive",
      shabad: {
        shabadId: fallbackShabad.shabadId,
        pageNo: fallbackShabad.pageNo,
        writer: fallbackShabad.writer,
        raag: fallbackShabad.raag,
        verses: fallbackShabad.verses,
      } satisfies NormalizedShabad,
    });
  }

  // 4. Shabad Verse Search: GET /api/banidb?q=...
  if (!rawQuery) {
    return Response.json(
      { ok: false, error: "Please enter a search term or Gurmukhi initials." },
      { status: 400 }
    );
  }

  const words = rawQuery.split(/\s+/);
  const looksLikeInitials =
    words.length === 1 &&
    rawQuery.length >= 2 &&
    rawQuery.length <= 7 &&
    !/^(hukam|langar|peace|truth|woman|women|bliss|anand|nanak|guru|khivi|fear|light|kings|born|water|mind|love|grace)$/i.test(
      rawQuery
    );

  const searchOrder: number[] = explicitType
    ? [Number(explicitType), 3, 1, 2]
    : looksLikeInitials
    ? [1, 2, 3]
    : [3, 1, 2];

  const uniqueOrder = Array.from(new Set(searchOrder));

  for (const st of uniqueOrder) {
    const url = `https://api.banidb.com/v2/search/${encodeURIComponent(
      rawQuery
    )}?searchtype=${st}&results=10`;
    const data = await fetchBaniDbJson(url);
    if (data && Array.isArray(data.verses) && data.verses.length > 0) {
      const verses: NormalizedVerse[] = data.verses
        .map((v: any) => normalizeBaniDbVerse(v))
        .filter((v: NormalizedVerse) => Boolean(v.gurmukhiUnicode));
      if (verses.length > 0) {
        return Response.json({
          ok: true,
          source: "banidb-live",
          searchTypeUsed: st,
          verses,
        });
      }
    }
  }

  const curatedMatches = searchCuratedFallback(rawQuery);
  return Response.json({
    ok: true,
    source: "curated-archive",
    searchTypeUsed: looksLikeInitials ? 1 : 3,
    verses: curatedMatches,
  });
}
