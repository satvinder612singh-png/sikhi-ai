import type { ChitrakariVariant } from "@/components/chitrakari-card-header";

/* ============================================================================
   NANAKSHAHI CALENDAR (original 2003 structure: fixed month start dates)
   Chet 1 = 14 March. Year = Gregorian year − 1468 from 14 March onward.
============================================================================ */
export type NSMonth = {
  name: string;
  gurmukhi: string;
  gm: number; // Gregorian month (1-12) in which the month begins
  gd: number; // Gregorian day on which it begins
  season: string;
  seasonGurmukhi: string;
};

export const NS_MONTHS: NSMonth[] = [
  { name: "Chet", gurmukhi: "ਚੇਤ", gm: 3, gd: 14, season: "Basant (Spring)", seasonGurmukhi: "ਬਸੰਤ" },
  { name: "Vaisakh", gurmukhi: "ਵੈਸਾਖ", gm: 4, gd: 14, season: "Basant (Spring)", seasonGurmukhi: "ਬਸੰਤ" },
  { name: "Jeth", gurmukhi: "ਜੇਠ", gm: 5, gd: 15, season: "Greekham (Summer heat)", seasonGurmukhi: "ਗ੍ਰੀਖਮ" },
  { name: "Harh", gurmukhi: "ਹਾੜ", gm: 6, gd: 15, season: "Greekham (Summer heat)", seasonGurmukhi: "ਗ੍ਰੀਖਮ" },
  { name: "Sawan", gurmukhi: "ਸਾਵਣ", gm: 7, gd: 16, season: "Barsat (Monsoon rains)", seasonGurmukhi: "ਬਰਸਾਤ" },
  { name: "Bhadon", gurmukhi: "ਭਾਦੋਂ", gm: 8, gd: 16, season: "Barsat (Monsoon rains)", seasonGurmukhi: "ਬਰਸਾਤ" },
  { name: "Assu", gurmukhi: "ਅੱਸੂ", gm: 9, gd: 15, season: "Sarad (Autumn)", seasonGurmukhi: "ਸਰਦ" },
  { name: "Katak", gurmukhi: "ਕੱਤਕ", gm: 10, gd: 15, season: "Sarad (Autumn)", seasonGurmukhi: "ਸਰਦ" },
  { name: "Maghar", gurmukhi: "ਮੱਘਰ", gm: 11, gd: 14, season: "Hemant (Early winter)", seasonGurmukhi: "ਹੇਮੰਤ" },
  { name: "Poh", gurmukhi: "ਪੋਹ", gm: 12, gd: 14, season: "Hemant (Early winter)", seasonGurmukhi: "ਹੇਮੰਤ" },
  { name: "Magh", gurmukhi: "ਮਾਘ", gm: 1, gd: 13, season: "Sisiar (Deep winter)", seasonGurmukhi: "ਸਿਸੀਅਰ" },
  { name: "Phagun", gurmukhi: "ਫੱਗਣ", gm: 2, gd: 12, season: "Sisiar (Deep winter)", seasonGurmukhi: "ਸਿਸੀਅਰ" },
];

export type NSDate = {
  monthIndex: number;
  month: NSMonth;
  day: number;
  nsYear: number;
};

const utc = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d);

export function getNanakshahiDate(date: Date): NSDate {
  const y = date.getFullYear();
  const today = utc(y, date.getMonth() + 1, date.getDate());
  let best: { idx: number; start: number } | null = null;
  for (const year of [y - 1, y]) {
    NS_MONTHS.forEach((m, idx) => {
      const start = utc(year, m.gm, m.gd);
      if (start <= today && (!best || start > best.start)) best = { idx, start };
    });
  }
  const found = best as { idx: number; start: number } | null;
  const idx = found ? found.idx : 0;
  const start = found ? found.start : today;
  const day = Math.floor((today - start) / 86400000) + 1;
  const chetFirst = utc(y, 3, 14);
  const nsYear = today >= chetFirst ? y - 1468 : y - 1469;
  return { monthIndex: idx, month: NS_MONTHS[idx], day, nsYear };
}

export type SikhiEvent = {
  monthIndex: number;
  day: number;
  title: string;
  gurmukhi?: string;
  detail: string;
};

/** Fixed-date observances in the original Nanakshahi calendar structure. */
export const FIXED_EVENTS: SikhiEvent[] = [
  { monthIndex: 1, day: 1, title: "Vaisakhi — Khalsa Sajna Divas", gurmukhi: "ਵਿਸਾਖੀ", detail: "Birth of the Khalsa and the Panj Pyare at Sri Anandpur Sahib, 1699." },
  { monthIndex: 2, day: 2, title: "Shaheedi Purab — Guru Arjan Dev Ji", detail: "Remembering the first Guru to be martyred, Lahore, 1606 (original Nanakshahi date)." },
  { monthIndex: 6, day: 25, title: "Parkash Purab — Guru Ram Das Ji", detail: "Fourth Guru, founder of Ramdaspur (Amritsar) and the Sarovar." },
  { monthIndex: 7, day: 6, title: "Gurgaddi Divas — Sri Guru Granth Sahib Ji", gurmukhi: "ਗੁਰਗੱਦੀ ਦਿਵਸ", detail: "Guru Gobind Singh Ji installed the Granth as the eternal Guru, Nanded, 1708." },
  { monthIndex: 8, day: 11, title: "Shaheedi Purab — Guru Tegh Bahadur Ji", detail: "Martyrdom at Chandni Chowk, Delhi (1675), defending freedom of conscience." },
  { monthIndex: 9, day: 8, title: "Shaheedi of Chamkaur Sahib (Poh 8)", detail: "Start of Shaheedi Saptah: Baba Ajit Singh Ji, Baba Jujhar Singh Ji and the Singhs at Chamkaur." },
  { monthIndex: 9, day: 13, title: "Shaheedi of the Chhote Sahibzade (Poh 13)", detail: "Baba Zorawar Singh Ji and Baba Fateh Singh Ji at Sirhind; Mata Gujri Ji's passing." },
  { monthIndex: 9, day: 23, title: "Parkash Purab — Guru Gobind Singh Ji", gurmukhi: "ਪ੍ਰਕਾਸ਼ ਪੁਰਬ", detail: "Tenth Guru, born at Patna Sahib (original Nanakshahi date)." },
];

/** Lunar (Bikrami) observances — date changes yearly. */
export const MOVEABLE_NOTES: { title: string; detail: string }[] = [
  { title: "Parkash Purab — Guru Nanak Dev Ji (Katak Puranmashi)", detail: "Falls on the full moon of Katak, usually in November. Confirm the day with SGPC or your Gurdwara." },
  { title: "Bandi Chhor Divas (Diwali)", detail: "Guru Hargobind Sahib Ji's release with 52 princes from Gwalior; follows the lunar calendar." },
  { title: "Hola Mahalla", detail: "Day after Holi at Anandpur Sahib — martial arts, kirtan and gatka." },
];

/** Days from `from` to the next occurrence of an event (cyclic, 0 = today). */
export function daysUntil(ev: SikhiEvent, from: Date): number {
  const y = from.getFullYear();
  const todayU = utc(y, from.getMonth() + 1, from.getDate());
  const m = NS_MONTHS[ev.monthIndex];
  for (const year of [y, y + 1]) {
    const start = utc(year, m.gm, m.gd) + (ev.day - 1) * 86400000;
    if (start >= todayU) return Math.round((start - todayU) / 86400000);
  }
  return 0;
}

/* ============================================================================
   FOUNDATIONS DATA
============================================================================ */
export type FigureArt = { artKey: string; variant: ChitrakariVariant; commonsKey?: string };

export const FIVE_KS = [
  {
    id: "kesh",
    letter: "K",
    name: "Kesh",
    gurmukhi: "ਕੇਸ",
    meaning: "Unshorn hair",
    symbolism:
      "Living in harmony with Hukam, the natural form given by the Creator. Kesh, covered by the dastaar, is a sign of dignity, humility and readiness to serve.",
    art: { artKey: "k-kesh", variant: "guru" } as FigureArt,
  },
  {
    id: "kara",
    letter: "K",
    name: "Kara",
    gurmukhi: "ਕੜਾ",
    meaning: "Iron / steel bracelet",
    symbolism:
      "A circle with no beginning or end, a reminder of One Eternal Creator, and a restraint on the hands: every deed must be honest and just.",
    art: { artKey: "k-kara", variant: "khanda" } as FigureArt,
  },
  {
    id: "kanga",
    letter: "K",
    name: "Kanga",
    gurmukhi: "ਕੰਘਾ",
    meaning: "Wooden comb",
    symbolism:
      "Cleanliness and order: caring for Kesh daily is a daily practice of discipline, and a reminder to keep the mind as tidy as the hair.",
    art: { artKey: "k-kanga", variant: "manuscript" } as FigureArt,
  },
  {
    id: "kachera",
    letter: "K",
    name: "Kachera",
    gurmukhi: "ਕਛਹਿਰਾ",
    meaning: "Cotton undergarment",
    symbolism:
      "Self-control and modesty, and practical readiness to move freely in service or defence. It stands for moral restraint.",
    art: { artKey: "k-kachera", variant: "horse" } as FigureArt,
  },
  {
    id: "kirpan",
    letter: "K",
    name: "Kirpan",
    gurmukhi: "ਕਿਰਪਾਨ",
    meaning: "Curved sword of mercy & honour",
    symbolism:
      "From Kirpa (mercy) and Aan (honour): a promise to protect the vulnerable and stand against injustice, never to threaten or attack.",
    art: { artKey: "k-kirpan", variant: "warrior" } as FigureArt,
  },
];

export const GURUS = [
  {
    n: 1, name: "Guru Nanak Dev Ji", gurmukhi: "ਗੁਰੂ ਨਾਨਕ ਦੇਵ ਜੀ",
    life: "1469 – 1539", guruship: "Guruship until 1539", place: "Born Talwandi (Nankana Sahib) · founded Kartarpur",
    contribution: "Revealed Ik Onkar, travelled four great Udasis, began langar and the Sangat–Pangat, and gave Japji Sahib.",
    art: { artKey: "guru-nanak", variant: "guru" } as FigureArt,
  },
  {
    n: 2, name: "Guru Angad Dev Ji", gurmukhi: "ਗੁਰੂ ਅੰਗਦ ਦੇਵ ਜੀ",
    life: "1504 – 1552", guruship: "Guru 1539 – 1552", place: "Khadur Sahib",
    contribution: "Standardised the Gurmukhi script, set up Mal Akhara physical training and expanded langar.",
    art: { artKey: "guru-angad", variant: "guru" } as FigureArt,
  },
  {
    n: 3, name: "Guru Amar Das Ji", gurmukhi: "ਗੁਰੂ ਅਮਰ ਦਾਸ ਜੀ",
    life: "1479 – 1574", guruship: "Guru 1552 – 1574", place: "Goindwal Sahib",
    contribution: "Strengthened langar (\"Pehle Pangat, Phir Sangat\"), organised Manjis for preaching, and spoke against sati and purdah.",
    art: { artKey: "guru-amar-das", variant: "guru" } as FigureArt,
  },
  {
    n: 4, name: "Guru Ram Das Ji", gurmukhi: "ਗੁਰੂ ਰਾਮ ਦਾਸ ਜੀ",
    life: "1534 – 1581", guruship: "Guru 1574 – 1581", place: "Founded Ramdaspur (Amritsar)",
    contribution: "Began the Amrit Sarovar, established Amritsar, and composed the Laavan for the Anand Karaj.",
    art: { artKey: "darbar-sahib", variant: "darbar" } as FigureArt,
  },
  {
    n: 5, name: "Guru Arjan Dev Ji", gurmukhi: "ਗੁਰੂ ਅਰਜਨ ਦੇਵ ਜੀ",
    life: "1563 – 1606", guruship: "Guru 1581 – 1606", place: "Built Harmandir Sahib · Tarn Taran",
    contribution: "Compiled the Adi Granth (1604), laid Sri Harmandir Sahib's foundations, composed Sukhmani Sahib; first Guru martyred.",
    art: { artKey: "guru-arjan", variant: "guru" } as FigureArt,
  },
  {
    n: 6, name: "Guru Hargobind Sahib Ji", gurmukhi: "ਗੁਰੂ ਹਰਿਗੋਬਿੰਦ ਸਾਹਿਬ ਜੀ",
    life: "1595 – 1644", guruship: "Guru 1606 – 1644", place: "Sri Akal Takht · Kiratpur Sahib",
    contribution: "Wore the two swords of Miri and Piri, raised Sri Akal Takht Sahib, and trained a Sikh army.",
    art: { artKey: "guru-hargobind", variant: "warrior" } as FigureArt,
  },
  {
    n: 7, name: "Guru Har Rai Ji", gurmukhi: "ਗੁਰੂ ਹਰਿ ਰਾਇ ਜੀ",
    life: "1630 – 1661", guruship: "Guru 1644 – 1661", place: "Kiratpur Sahib",
    contribution: "Known for compassion: maintained a herbal dispensary, cared for nature and animals, and kept langar open to all.",
    art: { artKey: "guru-har-rai", variant: "guru" } as FigureArt,
  },
  {
    n: 8, name: "Guru Har Krishan Ji", gurmukhi: "ਗੁਰੂ ਹਰਿ ਕ੍ਰਿਸ਼ਨ ਜੀ",
    life: "1656 – 1664", guruship: "Guru 1661 – 1664", place: "Delhi (Bangla Sahib)",
    contribution: "The child Guru who served the sick during a smallpox epidemic in Delhi, regardless of faith.",
    art: { artKey: "guru-har-krishan", variant: "child" } as FigureArt,
  },
  {
    n: 9, name: "Guru Tegh Bahadur Ji", gurmukhi: "ਗੁਰੂ ਤੇਗ ਬਹਾਦਰ ਜੀ",
    life: "1621 – 1675", guruship: "Guru 1665 – 1675", place: "Founded Anandpur Sahib · martyred in Delhi",
    contribution: "Defended freedom of conscience, gave his life in Delhi (1675), and his hymns fill the Guru Granth Sahib.",
    art: { artKey: "guru-tegh-bahadur", variant: "guru" } as FigureArt,
  },
  {
    n: 10, name: "Guru Gobind Singh Ji", gurmukhi: "ਗੁਰੂ ਗੋਬਿੰਦ ਸਿੰਘ ਜੀ",
    life: "1666 – 1708", guruship: "Guru 1675 – 1708", place: "Born Patna Sahib · Anandpur · Nanded",
    contribution: "Created the Khalsa (1699), added Guru Tegh Bahadur Ji's bani to the Adi Granth, and installed Sri Guru Granth Sahib Ji as eternal Guru (1708).",
    art: { artKey: "guru-gobind-singh", variant: "warrior" } as FigureArt,
  },
];

export const PANJ_PYARE = [
  { name: "Bhai Daya Singh Ji", gurmukhi: "ਭਾਈ ਦਇਆ ਸਿੰਘ ਜੀ", from: "Lahore", note: "First to offer his head. Later carried the Zafarnama to Aurangzeb with Bhai Dharam Singh Ji.", art: { artKey: "pp-daya", variant: "warrior" } as FigureArt },
  { name: "Bhai Dharam Singh Ji", gurmukhi: "ਭਾਈ ਧਰਮ ਸਿੰਘ ਜੀ", from: "Hastinapur", note: "A farmer by background; accompanied Guru Gobind Singh Ji after Chamkaur and carried the Zafarnama.", art: { artKey: "pp-dharam", variant: "warrior" } as FigureArt },
  { name: "Bhai Himmat Singh Ji", gurmukhi: "ਭਾਈ ਹਿੰਮਤ ਸਿੰਘ ਜੀ", from: "Jagannath Puri", note: "Attained martyrdom at Chamkaur Sahib, 1704.", art: { artKey: "pp-himmat", variant: "warrior" } as FigureArt },
  { name: "Bhai Mohkam Singh Ji", gurmukhi: "ਭਾਈ ਮੋਹਕਮ ਸਿੰਘ ਜੀ", from: "Dwarka", note: "Attained martyrdom at Chamkaur Sahib, 1704.", art: { artKey: "pp-mohkam", variant: "warrior" } as FigureArt },
  { name: "Bhai Sahib Singh Ji", gurmukhi: "ਭਾਈ ਸਾਹਿਬ ਸਿੰਘ ਜੀ", from: "Bidar", note: "Attained martyrdom at Chamkaur Sahib, 1704.", art: { artKey: "pp-sahib", variant: "warrior" } as FigureArt },
];

export const SAHIBZAADE = [
  { name: "Baba Ajit Singh Ji", gurmukhi: "ਬਾਬਾ ਅਜੀਤ ਸਿੰਘ ਜੀ", age: "Aged about 17", place: "Chamkaur Sahib", note: "Led a band of Singhs out of the Garhi into battle and was martyred in December 1704.", art: { artKey: "sz-ajit", variant: "child" } as FigureArt },
  { name: "Baba Jujhar Singh Ji", gurmukhi: "ਬਾਬਾ ਜੁਝਾਰ ਸਿੰਘ ਜੀ", age: "Aged about 13", place: "Chamkaur Sahib", note: "Followed his elder brother into battle at Chamkaur Sahib, December 1704.", art: { artKey: "sz-jujhar", variant: "child" } as FigureArt },
  { name: "Baba Zorawar Singh Ji", gurmukhi: "ਬਾਬਾ ਜ਼ੋਰਾਵਰ ਸਿੰਘ ਜੀ", age: "Aged about 8–9", place: "Sirhind", note: "Refused to give up his faith before Wazir Khan's court and was martyred at Sirhind.", art: { artKey: "sz-zorawar", variant: "child" } as FigureArt },
  { name: "Baba Fateh Singh Ji", gurmukhi: "ਬਾਬਾ ਫ਼ਤਹਿ ਸਿੰਘ ਜੀ", age: "Aged about 6–7", place: "Sirhind", note: "The youngest Sahibzada, martyred alongside Baba Zorawar Singh Ji.", art: { artKey: "sz-fateh", variant: "child" } as FigureArt },
];

export const MATA_GUJRI: { name: string; gurmukhi: string; note: string; art: FigureArt } = {
  name: "Mata Gujri Ji",
  gurmukhi: "ਮਾਤਾ ਗੁਜਰੀ ਜੀ",
  note: "Mother of Guru Tegh Bahadur Ji and grandmother of the Sahibzaade. She comforted the young Sahibzaade in the cold Thanda Burj at Sirhind and passed away there. Tradition remembers Dewan Todar Mal, who purchased the cremation land, and Bhai Moti Ram Mehra, who served them milk.",
  art: { artKey: "mata-gujri", variant: "woman" },
};

export const SHAHEEDS = [
  { name: "Guru Arjan Dev Ji", gurmukhi: "ਗੁਰੂ ਅਰਜਨ ਦੇਵ ਜੀ", year: "1606 · Lahore", note: "First Guru to be martyred; accepted torture with calm remembrance of the Divine Will.", art: { artKey: "guru-arjan", variant: "guru" } as FigureArt },
  { name: "Guru Tegh Bahadur Ji", gurmukhi: "ਗੁਰੂ ਤੇਗ ਬਹਾਦਰ ਜੀ", year: "1675 · Delhi", note: "Gave his life defending the right of others to practise their faith.", art: { artKey: "guru-tegh-bahadur", variant: "guru" } as FigureArt },
  { name: "Bhai Mati Das, Bhai Sati Das & Bhai Dayala Ji", gurmukhi: "ਭਾਈ ਮਤੀ ਦਾਸ, ਸਤੀ ਦਾਸ ਅਤੇ ਦਿਆਲਾ ਜੀ", year: "1675 · Delhi", note: "Companions of Guru Tegh Bahadur Ji who were martyred before him, refusing to abandon their faith.", art: { artKey: "sh-three", variant: "warrior" } as FigureArt },
  { name: "Baba Banda Singh Bahadur", gurmukhi: "ਬਾਬਾ ਬੰਦਾ ਸਿੰਘ ਬਹਾਦਰ", year: "1716 · Delhi", note: "Led the Khalsa to victory at Sirhind (1710), abolished oppressive land systems and was executed in 1716.", art: { artKey: "sh-banda", variant: "horse" } as FigureArt },
  { name: "Baba Deep Singh Ji", gurmukhi: "ਬਾਬਾ ਦੀਪ ਸਿੰਘ ਜੀ", year: "1757 · Amritsar", note: "Scholar-warrior who marched at an advanced age to defend Sri Harmandir Sahib.", art: { artKey: "baba-deep-singh", variant: "warrior" } as FigureArt },
  { name: "Bhai Mani Singh Ji", gurmukhi: "ਭਾਈ ਮਨੀ ਸਿੰਘ ਜੀ", year: "1737 · Lahore", note: "First Granthi of Sri Harmandir Sahib and a great scholar; martyred bearing the cruellest torture.", art: { artKey: "sh-mani", variant: "manuscript" } as FigureArt },
  { name: "Bhai Taru Singh Ji", gurmukhi: "ਭਾਈ ਤਾਰੂ ਸਿੰਘ ਜੀ", year: "1745 · Lahore", note: "Young Singh who preferred death to cutting his Kesh and served the hungry in his village.", art: { artKey: "sh-taru", variant: "warrior" } as FigureArt },
];

