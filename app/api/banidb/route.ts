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
  transliteration: string;
  englishTranslation: string;
}

export interface NormalizedShabad {
  shabadId: number;
  pageNo: number;
  writer: string;
  raag: string;
  verses: NormalizedVerse[];
}

/**
 * Authentic curated Shabads from Sri Guru Granth Sahib Ji used as a resilient
 * fallback when api.banidb.com is unreachable or rate-limited, and to guarantee
 * instant results for common Gurmukhi initials and English themes.
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
        transliteration:
          "Ik Oankaar Sat Naam Kartaa Purakh Nirbhau Nirvair Akaal Moorat Ajoonee Saibhan Gur Prasaad ||",
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
        transliteration: "|| Jap ||",
        englishTranslation: "Chant And Meditate:",
      },
      {
        verseId: 3,
        shabadId: 1,
        pageNo: 1,
        writer: "Guru Nanak Dev Ji",
        raag: "Japji Sahib",
        gurmukhiUnicode: "ਆਦਿ ਸਚੁ ਜੁਗਾਦਿ ਸਚੁ ॥",
        transliteration: "Aad Sach Jugaad Sach ||",
        englishTranslation: "True In The Primal Beginning. True Throughout The Ages.",
      },
      {
        verseId: 4,
        shabadId: 1,
        pageNo: 1,
        writer: "Guru Nanak Dev Ji",
        raag: "Japji Sahib",
        gurmukhiUnicode: "ਹੈ ਭੀ ਸਚੁ ਨਾਨਕ ਹੋਸੀ ਭੀ ਸਚੁ ॥੧॥",
        transliteration: "Hai Bhee Sach Nanak Hosee Bhee Sach ||1||",
        englishTranslation: "True Here And Now. O Nanak, Forever And Ever True. ||1||",
      },
      {
        verseId: 5,
        shabadId: 1,
        pageNo: 1,
        writer: "Guru Nanak Dev Ji",
        raag: "Japji Sahib",
        gurmukhiUnicode: "ਹੁਕਮੀ ਹੋਵਨਿ ਆਕਾਰ ਹੁਕਮੁ ਨ ਕਹਿਆ ਜਾਈ ॥",
        transliteration: "Hukamee Hovan Aakaar Hukam Na Kahiaa Jaaee ||",
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
        transliteration: "Hukamee Rajaaee Chalanaa Nanak Likhiaa Naal ||1||",
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
        transliteration: "M: 1 || Bhand Jammeeai Bhand Nimmeeai Bhand Mangan Veeaahu ||",
        englishTranslation:
          "First Mehl: From woman, man is born; within woman, man is conceived; to woman he is engaged and married.",
      },
      {
        verseId: 21553,
        shabadId: 1797,
        pageNo: 473,
        writer: "Guru Nanak Dev Ji",
        raag: "Raag Aasaa",
        gurmukhiUnicode: "ਭੰਡਹੁ ਹੋਵੈ ਦੋਸਤੀ ਭੰਡਹੁ ਚਲੈ ਰਾਹੁ ॥",
        transliteration: "Bhandahu Hovai Dosatee Bhandahu Chalai Raahu ||",
        englishTranslation:
          "Woman becomes his friend; through woman, the future generations come to be.",
      },
      {
        verseId: 21554,
        shabadId: 1797,
        pageNo: 473,
        writer: "Guru Nanak Dev Ji",
        raag: "Raag Aasaa",
        gurmukhiUnicode: "ਭੰਡੁ ਮੁਆ ਭੰਡੁ ਭਾਲੀਐ ਭੰਡਿ ਹੋਵੈ ਬੰਧਾਨੁ ॥",
        transliteration: "Bhand Muaa Bhand Bhaaleeai Bhand Hovai Bandhaan ||",
        englishTranslation:
          "When his woman passes away, he seeks another woman; to woman he is bound.",
      },
      {
        verseId: 21555,
        shabadId: 1797,
        pageNo: 473,
        writer: "Guru Nanak Dev Ji",
        raag: "Raag Aasaa",
        gurmukhiUnicode: "ਸੋ ਕਿਉ ਮੰਦਾ ਆਖੀਐ ਜਿਤੁ ਜੰਮਹਿ ਰਾਜਾਨ ॥",
        transliteration: "So Kio Mandaa Aakheeai Jit Jammeh Raajaan ||",
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
        transliteration: "Bhandahu Hee Bhand Oopajai Bhandai Baajh Na Koe ||",
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
        transliteration: "Nanak Bhandai Baaharaa Eko Sachaa Soe ||",
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
        transliteration: "Balvand Kheevee Nek Jan Jis Bahutee Chhaau Patraalee ||",
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
        transliteration: "Langar Daulat Vandeeai Ras Amrit Kheer Ghiaalee ||",
        englishTranslation:
          "In the Guru's Langar, wealth is distributed—ambrosial kheer (rice pudding) rich with pure ghee.",
      },
      {
        verseId: 41357,
        shabadId: 3630,
        pageNo: 967,
        writer: "Bhatt Balwand & Satta Doom",
        raag: "Raag Ramkali",
        gurmukhiUnicode: "ਗੁਰਸਿਖਾ ਕੇ ਮੁਖ ਉਜਲੇ ਮਨਮੁਖ ਥੀਏ ਪਰਾਲੀ ॥",
        transliteration: "Gursikhaa Ke Mukh Ujale Manmukh Theee Paraalee ||",
        englishTranslation:
          "The faces of the GurSikhs are radiant and bright, while the self-willed Manmukhs are pale like straw.",
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
        transliteration: "Anand Bhaiaa Meree Maae Satguroo Mai Paaiaa ||",
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
        transliteration: "Satgur Ta Paaiaa Sahaj Setee Man Vajeeaa Vaadhaaeeaa ||",
        englishTranslation:
          "I have found the True Guru, with intuitive ease, and my mind vibrates with the music of bliss.",
      },
      {
        verseId: 39177,
        shabadId: 3393,
        pageNo: 917,
        writer: "Guru Amar Das Ji",
        raag: "Raag Ramkali",
        gurmukhiUnicode: "ਰਾਗ ਰਤਨ ਪਰਵਾਰ ਪਰੀਆ ਸਬਦ ਗਾਵਣ ਆਈਆ ॥",
        transliteration: "Raag Ratan Parvaar Pareeaa Sabad Gaavan Aaeeaa ||",
        englishTranslation:
          "The jeweled melodies and their related celestial harmonies have come to sing the Word of the Shabad.",
      },
      {
        verseId: 39178,
        shabadId: 3393,
        pageNo: 917,
        writer: "Guru Amar Das Ji",
        raag: "Raag Ramkali",
        gurmukhiUnicode: "ਸਬਦੋ ਤ ਗਾਵਹੁ ਹਰੀ ਕੇਰਾ ਮਨਿ ਜਿਨੀ ਵਸਾਇਆ ॥",
        transliteration: "Sabado Ta Gaavahu Haree Keraa Man Jinee Vasaaiaa ||",
        englishTranslation:
          "Those who have enshrined the Lord within their minds—sing the Word of the Shabad.",
      },
      {
        verseId: 39179,
        shabadId: 3393,
        pageNo: 917,
        writer: "Guru Amar Das Ji",
        raag: "Raag Ramkali",
        gurmukhiUnicode: "ਕਹੈ ਨਾਨਕੁ ਅਨੰਦੁ ਹੋਆ ਸਤਿਗੁਰੂ ਮੈ ਪਾਇਆ ॥੧॥",
        transliteration: "Kahai Nanak Anand Hoaa Satguroo Mai Paaiaa ||1||",
        englishTranslation:
          "Says Nanak, I am in bliss, for I have found my True Guru. ||1||",
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
        transliteration: "Aval Alah Noor Oupaaiaa Kudarat Ke Sabh Bande ||",
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
        transliteration: "Ek Noor Te Sabh Jag Oupajiaa Kaun Bhale Ko Mande ||1||",
        englishTranslation:
          "From the One Light, the entire universe welled up. So who is good, and who is bad? ||1||",
      },
      {
        verseId: 57692,
        shabadId: 4861,
        pageNo: 1349,
        writer: "Bhagat Kabir Ji",
        raag: "Raag Prabhaatee",
        gurmukhiUnicode: "ਮਾਟੀ ਏਕ ਅਨੇਕ ਭਾਂਤਿ ਕਰਿ ਸਾਜੀ ਸਾਜਨਹਾਰੈ ॥",
        transliteration: "Maatee Ek Anek Bhaant Kar Saajee Saajanhaarai ||",
        englishTranslation:
          "The Creator fashioned the one clay into vessels of many forms and shapes.",
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
        transliteration: "Bhai Kaahoo Kau Det Nahi Nahi Bhai Maanat Aan ||",
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
        transliteration: "Kahu Nanak Sun Re Manaa Giaanee Taahi Bakhaan ||16||",
        englishTranslation:
          "Says Nanak, listen, O mind: call that person spiritually wise! ||16||",
      },
    ],
  },
};

function normalizeBaniDbVerse(raw: any, fallbackShabadInfo?: any): NormalizedVerse {
  const shabadId = Number(
    raw?.shabadId ?? fallbackShabadInfo?.shabadId ?? raw?.verseId ?? 1
  );
  const pageNo = Number(
    raw?.pageNo ?? fallbackShabadInfo?.pageNo ?? raw?.ang ?? 1
  );
  const writer =
    raw?.writer?.english ||
    fallbackShabadInfo?.writer?.english ||
    "Sri Guru Granth Sahib Ji";
  const raag =
    raw?.raag?.english ||
    fallbackShabadInfo?.raag?.english ||
    "Gurbani";
  const gurmukhiUnicode =
    raw?.verse?.unicode ||
    raw?.gurmukhi?.unicode ||
    raw?.verse?.gurmukhi ||
    "";
  const transliteration =
    raw?.transliteration?.english ||
    raw?.transliteration?.en ||
    "";
  const englishTranslation =
    raw?.translation?.en?.bdb ||
    raw?.translation?.en?.ms ||
    raw?.translation?.en?.ssk ||
    "";

  return {
    verseId: Number(raw?.verseId ?? Math.random() * 100000),
    shabadId,
    pageNo,
    writer,
    raag,
    gurmukhiUnicode,
    transliteration,
    englishTranslation,
  };
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

  // Deduplicate by verseId
  const seen = new Set<number>();
  return matchedVerses.filter((v) => {
    if (seen.has(v.verseId)) return false;
    seen.add(v.verseId);
    return true;
  });
}

async function fetchBaniDbJson(url: string, timeoutMs = 5500): Promise<any | null> {
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
  const shabadIdParam = searchParams.get("shabadId");
  const rawQuery = (searchParams.get("q") || "").trim();
  const explicitType = searchParams.get("searchtype");

  // 1. Full Shabad Lookup: GET /api/banidb?shabadId=...
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

    // Fallback to curated Shabad if offline or unreachable
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

  // 2. Shabad Verse Search: GET /api/banidb?q=...
  if (!rawQuery) {
    return Response.json(
      { ok: false, error: "Please enter a search term or Gurmukhi initials." },
      { status: 400 }
    );
  }

  // Determine search type order:
  // In BaniDB v2:
  // searchtype=1 -> First letter start (Gurmukhi/Roman initials like "stnk", "skma")
  // searchtype=2 -> First letter anywhere
  // searchtype=3 -> Full word English/Punjabi/Transliteration keyword search
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

  // If live BaniDB returned 0 matches or is offline in this environment, search our curated archive
  const curatedMatches = searchCuratedFallback(rawQuery);
  return Response.json({
    ok: true,
    source: "curated-archive",
    searchTypeUsed: looksLikeInitials ? 1 : 3,
    verses: curatedMatches,
  });
}
