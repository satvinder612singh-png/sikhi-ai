import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LearnerAgeGroup = "kids" | "youth" | "young-adults" | "adults-seniors";
type LearnerLevel = "beginner" | "intermediate" | "fluent" | "advanced";
type GameMode = "history" | "gurmukhi" | "concepts";

interface GenerateQuizRequest {
  ageGroup?: LearnerAgeGroup;
  level?: LearnerLevel;
  mode?: GameMode;
  seed?: number;
}

export interface GeneratedQuizQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export interface GeneratedGurmukhiPair {
  id: string;
  gurmukhi: string;
  sound: string;
  name: string;
  example: string;
}

export interface GeneratedConceptPair {
  id: string;
  term: string;
  gurmukhi: string;
  meaning: string;
}

const AGE_DESCRIPTIONS: Record<LearnerAgeGroup, string> = {
  kids: "Kids (ages 5–10): warm, gentle, playful tone with short, easy-to-read sentences and vivid imagery.",
  youth: "Youth (ages 11–17): engaging, clear storytelling with relatable examples and inspiring historical moments.",
  "young-adults": "Young Adults (ages 18–30): thoughtful, modern clarity connecting Sikh principles, history, and real life.",
  "adults-seniors": "Adults & Seniors (ages 30+): respectful, serene, scholarly clarity with rich historical and Gurbani resonance.",
};

const LEVEL_DESCRIPTIONS: Record<LearnerLevel, string> = {
  beginner: "Beginner: foundational facts, welcoming plain English, no assumed prior knowledge, opening Gurmukhi letters.",
  intermediate: "Intermediate: Ten Gurus, key historical milestones, Guru Ka Langar, Panj Pyare, everyday Sikhi terms, common consonants.",
  fluent: "Fluent: Gurbani concepts, Raags, Nitnem compositions, Gurdwara heritage, compound Sikh terminology, varied Gurmukhi letters.",
  advanced: "Advanced: Sri Guru Granth Sahib Ji Raags and Bhagats, Puratan Granths (Panth Prakash, Vaaran Bhai Gurdas), subtle Gurmat philosophy, advanced Gurmukhi characters and matras.",
};

const FALLBACK_HISTORY_BY_LEVEL: Record<LearnerLevel, GeneratedQuizQuestion[]> = {
  beginner: [
    {
      id: "fb-beg-1",
      question: "Who was the First Guru who founded Sikhi and taught equality for all?",
      options: ["Guru Nanak Dev Ji", "Guru Arjan Dev Ji", "Guru Hargobind Sahib Ji", "Guru Tegh Bahadur Ji"],
      correctIndex: 0,
      explanation: "Guru Nanak Dev Ji (1469–1539) founded Sikhi and traveled far and wide sharing the message of One Creator (Ik Onkar) and universal love.",
    },
    {
      id: "fb-beg-2",
      question: "What is the free community kitchen open to everyone at every Gurdwara called?",
      options: ["Langar", "Sarovar", "Nishan", "Chaur"],
      correctIndex: 0,
      explanation: "Guru Ka Langar welcomes people of every background to sit together as equals and share a freshly prepared vegetarian meal.",
    },
    {
      id: "fb-beg-3",
      question: "What do the opening words 'Ik Onkar' (ੴ) in Gurbani mean?",
      options: ["One Universal Creator", "Five Sacred Rivers", "Morning Prayer", "Golden Temple"],
      correctIndex: 0,
      explanation: "Ik Onkar affirms that there is One Universal Creator present in all of creation, uniting all humanity.",
    },
    {
      id: "fb-beg-4",
      question: "Which Guru standardized the Gurmukhi alphabet so everyone could read Gurbani?",
      options: ["Guru Angad Dev Ji", "Guru Har Rai Ji", "Guru Har Krishan Ji", "Guru Gobind Singh Ji"],
      correctIndex: 0,
      explanation: "Guru Angad Dev Ji, the Second Guru, organized the Gurmukhi script and encouraged open learning for children and adults alike.",
    },
    {
      id: "fb-beg-5",
      question: "What is the sacred living scripture and Eternal Guru of the Sikhs?",
      options: ["Sri Guru Granth Sahib Ji", "Panj Bania", "Janamsakhi", "Bara Maha"],
      correctIndex: 0,
      explanation: "Sri Guru Granth Sahib Ji holds 1,430 Angs of sacred Gurbani and was enshrined as the Eternal Guru in 1708.",
    },
    {
      id: "fb-beg-6",
      question: "Which city is home to Sachkhand Sri Harmandir Sahib (the Golden Temple)?",
      options: ["Amritsar", "Anandpur Sahib", "Patna", "Nanded"],
      correctIndex: 0,
      explanation: "Sri Harmandir Sahib sits in the heart of Amritsar, with four doors symbolizing openness to seekers from every direction.",
    },
  ],
  intermediate: [
    {
      id: "fb-int-1",
      question: "Which Guru taught 'Pehle Pangat, Pache Sangat'—sitting as equals in Langar before meeting the Guru?",
      options: ["Guru Amar Das Ji", "Guru Ram Das Ji", "Guru Har Rai Ji", "Guru Angad Dev Ji"],
      correctIndex: 0,
      explanation: "Guru Amar Das Ji instituted Pangat so emperors and villagers sat together on the same floor, dissolving caste barriers.",
    },
    {
      id: "fb-int-2",
      question: "Who is lovingly praised in Sri Guru Granth Sahib Ji for nurturing Guru Ka Langar with warmth and generosity?",
      options: ["Mata Khivi Ji", "Mai Bhago Ji", "Bebe Nanaki Ji", "Rani Sada Kaur"],
      correctIndex: 0,
      explanation: "Mata Khivi Ji, spouse of Guru Angad Dev Ji, is honored on Ang 967 for serving nourishing kheer and guiding Langar with deep compassion.",
    },
    {
      id: "fb-int-3",
      question: "Who was appointed the first Granthi when Guru Arjan Dev Ji installed the Adi Granth in 1604?",
      options: ["Baba Buddha Ji", "Bhai Mardana Ji", "Bhai Gurdas Ji", "Bhai Mani Singh Ji"],
      correctIndex: 0,
      explanation: "Baba Buddha Ji, who served six Gurus from Guru Nanak Dev Ji to Guru Hargobind Sahib Ji, became the first Granthi at Sri Harmandir Sahib.",
    },
    {
      id: "fb-int-4",
      question: "Which Guru introduced the twin swords of Miri (temporal justice) and Piri (spiritual devotion)?",
      options: ["Guru Hargobind Sahib Ji", "Guru Har Krishan Ji", "Guru Ram Das Ji", "Guru Amar Das Ji"],
      correctIndex: 0,
      explanation: "Guru Hargobind Sahib Ji established Sri Akal Takht Sahib facing Sri Harmandir Sahib to embody balanced spiritual and ethical leadership.",
    },
    {
      id: "fb-int-5",
      question: "Why is Guru Tegh Bahadur Ji remembered across humanity as 'Hind Di Chadar'?",
      options: [
        "For giving his life in 1675 to defend religious freedom for others",
        "For founding Kartarpur Sahib",
        "For compiling the Adi Granth",
        "For creating the Gurmukhi alphabet",
      ],
      correctIndex: 0,
      explanation: "Guru Tegh Bahadur Ji sacrificed his life in Delhi in 1675 to protect the conscience and religious liberty of Kashmiri Pandits and all people.",
    },
    {
      id: "fb-int-6",
      question: "On Vaisakhi 1699 at Anandpur Sahib, what sovereign spiritual order did Guru Gobind Singh Ji initiate?",
      options: ["The Khalsa Panth", "The Manji Network", "The Sarbat Khalsa Misl", "The Udasi Tradition"],
      correctIndex: 0,
      explanation: "Through Khande-di-Pahul and the Panj Pyare, Guru Gobind Singh Ji formed the Khalsa—committed to fearlessness, equality, and selfless service.",
    },
  ],
  fluent: [
    {
      id: "fb-flu-1",
      question: "In which classical Raag is Sri Guru Granth Sahib Ji's Raag-organized section opened at Ang 14?",
      options: ["Sri Raag", "Raag Asa", "Raag Gauri", "Raag Majh"],
      correctIndex: 0,
      explanation: "Following Japji Sahib, Rehras, and Sohila, the 31-Raag musical arrangement begins on Ang 14 with Sri Raag, evoking grounded humility.",
    },
    {
      id: "fb-flu-2",
      question: "Which revered scholar-poet served as scribe for the Adi Granth in 1604 and wrote 40 Vaaran praised as the 'Key to Gurbani'?",
      options: ["Bhai Gurdas Ji", "Bhai Nand Lal Ji", "Bhai Santokh Singh Ji", "Bhai Rattan Singh Bhangu"],
      correctIndex: 0,
      explanation: "Bhai Gurdas Ji inscribed the Pothi Sahib dictated by Guru Arjan Dev Ji and authored Vaaran illuminating Gurmat philosophy.",
    },
    {
      id: "fb-flu-3",
      question: "During which Pehar (time of day) is Raag Asa traditionally sung for Asa Di Vaar?",
      options: ["Amrit Vela (3 AM – 6 AM)", "Afternoon (12 PM – 3 PM)", "Evening (6 PM – 9 PM)", "Late Night (9 PM – 12 AM)"],
      correctIndex: 0,
      explanation: "Raag Asa carries dawn hope and spiritual awakening, making it the prescribed Raag for Amrit Vela Kirtan.",
    },
    {
      id: "fb-flu-4",
      question: "Which Guru established a herbal dispensary and ecological sanctuary at Kiratpur Sahib?",
      options: ["Guru Har Rai Ji", "Guru Amar Das Ji", "Guru Angad Dev Ji", "Guru Ram Das Ji"],
      correctIndex: 0,
      explanation: "Guru Har Rai Ji (Seventh Guru) nurtured botanical gardens, cared for wildlife, and operated free herbal clinics for all.",
    },
    {
      id: "fb-flu-5",
      question: "How many main classical Raags structure the musical body of Sri Guru Granth Sahib Ji?",
      options: ["31 Main Raags", "12 Main Raags", "24 Main Raags", "40 Main Raags"],
      correctIndex: 0,
      explanation: "From Sri Raag (Ang 14) to Raag Jaijawanti (Ang 1353), 31 main Raags pair every Shabad with a precise emotional atmosphere (Ras).",
    },
    {
      id: "fb-flu-6",
      question: "Which warrior-matriarch rallied forty Sikhs back to stand beside Guru Gobind Singh Ji at the Battle of Muktsar (1705)?",
      options: ["Mai Bhago Ji", "Bibi Dalair Kaur Ji", "Mata Gujri Ji", "Bebe Nanaki Ji"],
      correctIndex: 0,
      explanation: "Mai Bhago Ji (Mata Bhag Kaur) led the Chali Mukte with steadfast devotion and remained in Guru Gobind Singh Ji's retinue to Hazur Sahib.",
    },
  ],
  advanced: [
    {
      id: "fb-adv-1",
      question: "Which 31st Raag—added by Guru Tegh Bahadur Ji's Banis in the Damdami Bir—concludes the Raag section of Sri Guru Granth Sahib Ji?",
      options: ["Raag Jaijawanti", "Raag Prabhati", "Raag Kalyan", "Raag Tukhari"],
      correctIndex: 0,
      explanation: "Raag Jaijawanti (Ang 1352–1353) contains four Shabads by Guru Tegh Bahadur Ji, expressing serene detachment and inner victory.",
    },
    {
      id: "fb-adv-2",
      question: "Who authored 'Sri Gur Panth Prakash' (completed 1841), preserving first-hand oral histories of 18th-century Khalsa sovereignty?",
      options: [
        "Shaheed Bhai Rattan Singh Bhangu",
        "Mahakavi Bhai Santokh Singh",
        "Bhai Kahn Singh Nabha",
        "Prof. Sahib Singh",
      ],
      correctIndex: 0,
      explanation: "Bhai Rattan Singh Bhangu, grandson of Shaheed Mehtab Singh, recorded the Panth's sovereign struggle in response to British inquiries.",
    },
    {
      id: "fb-adv-3",
      question: "In Gurbani Viyakaran (grammar), what crucial grammatical clue does a Sihari (ਿ) or Aunkar (ੁ) at the end of a noun often indicate?",
      options: [
        "Singular masculine subject or instrumental/locative case",
        "Always indicates plural feminine tense",
        "Marks a musical pause in Tabla Taal",
        "Indicates a Persian loanword only",
      ],
      correctIndex: 0,
      explanation: "Prof. Sahib Singh's Gurbani Viyakaran demonstrates how final Sihari and Aunkar vowel markers govern precise syntactic meaning across Angs.",
    },
    {
      id: "fb-adv-4",
      question: "Which bowed string instrument—crafted to sustain deep meend and Vairaag—was popularized by Guru Arjan Dev Ji for Gurmat Sangeet?",
      options: ["Saranda", "Sitar", "Santoor", "Shehnai"],
      correctIndex: 0,
      explanation: "The Saranda is a deeply resonant bowed Tanti Saaj instrument integral to Puratan Raag Kirtan alongside the Rabab, Taus, and Dilruba.",
    },
    {
      id: "fb-adv-5",
      question: "Which Bhagat's hymns in Sri Guru Granth Sahib Ji include the iconic Aarti 'Gagan Mai Thaal' in Raag Dhanasari?",
      options: [
        "Guru Nanak Dev Ji (followed by Bhagats Ravidas, Sain, Kabir, Dhanna)",
        "Bhagat Namdev Ji alone",
        "Bhagat Farid Ji alone",
        "Bhatt Kalshar Ji",
      ],
      correctIndex: 0,
      explanation: "Guru Nanak Dev Ji's 'Gagan Mai Thaal' (Ang 663) opens the Sohila Aarti sequence, celebrating the entire cosmos performing Aarti to the Creator.",
    },
    {
      id: "fb-adv-6",
      question: "Who compiled the monumental four-volume encyclopedic dictionary of Sikh literature and history, 'Gurushabad Ratnakar Mahan Kosh' (1930)?",
      options: ["Bhai Kahn Singh Nabha", "Bhai Vir Singh", "Giani Dit Singh", "Principal Teja Singh"],
      correctIndex: 0,
      explanation: "Bhai Kahn Singh Nabha spent over fourteen years compiling Mahan Kosh, documenting over 64,000 Gurmat, historical, and linguistic entries.",
    },
  ],
};

const FALLBACK_GURMUKHI_BY_LEVEL: Record<LearnerLevel, GeneratedGurmukhiPair[]> = {
  beginner: [
    { id: "oora", gurmukhi: "ੳ", sound: "U / O (Oora)", name: "Oora", example: "Vowel bearer for u / o" },
    { id: "aira", gurmukhi: "ਅ", sound: "A (Aira)", name: "Aira", example: "Vowel bearer for a / aa" },
    { id: "eeri", gurmukhi: "ੲ", sound: "I / E (Eeri)", name: "Eeri", example: "Vowel bearer for i / e" },
    { id: "sassa", gurmukhi: "ਸ", sound: "S (Sassa)", name: "Sassa", example: "Sat (Truth)" },
    { id: "haha", gurmukhi: "ਹ", sound: "H (Haha)", name: "Haha", example: "Hukam (Divine Order)" },
    { id: "kakka", gurmukhi: "ਕ", sound: "K (Kakka)", name: "Kakka", example: "Kirat (Honest Work)" },
    { id: "khakha", gurmukhi: "ਖ", sound: "Kh (Khakha)", name: "Khakha", example: "Khalsa" },
    { id: "gagga", gurmukhi: "ਗ", sound: "G (Gagga)", name: "Gagga", example: "Guru" },
  ],
  intermediate: [
    { id: "chacha", gurmukhi: "ਚ", sound: "Ch (Chacha)", name: "Chacha", example: "Chardi Kala" },
    { id: "jajja", gurmukhi: "ਜ", sound: "J (Jajja)", name: "Jajja", example: "Japji Sahib" },
    { id: "tatta", gurmukhi: "ਤ", sound: "T (Tatta)", name: "Tatta", example: "Soft 't' as in Tera" },
    { id: "dadda", gurmukhi: "ਦ", sound: "D (Dadda)", name: "Dadda", example: "Daya (Compassion)" },
    { id: "nanna", gurmukhi: "ਨ", sound: "N (Nanna)", name: "Nanna", example: "Naam (Divine Name)" },
    { id: "pappa", gurmukhi: "ਪ", sound: "P (Pappa)", name: "Pappa", example: "Panth" },
    { id: "babba", gurmukhi: "ਬ", sound: "B (Babba)", name: "Babba", example: "Bani" },
    { id: "mamma", gurmukhi: "ਮ", sound: "M (Mamma)", name: "Mamma", example: "Mool Mantar" },
  ],
  fluent: [
    { id: "ghagga", gurmukhi: "ਘ", sound: "Gh (Ghagga)", name: "Ghagga", example: "Ghar (Musical House)" },
    { id: "jhajja", gurmukhi: "ਝ", sound: "Jh (Jhajja)", name: "Jhajja", example: "Jhanda / Nishan" },
    { id: "thatha", gurmukhi: "ਥ", sound: "Th (Thatha)", name: "Thatha", example: "Thaal (Cosmic Platter)" },
    { id: "dhadda", gurmukhi: "ਧ", sound: "Dh (Dhadda)", name: "Dhadda", example: "Dharam (Righteousness)" },
    { id: "phapha", gurmukhi: "ਫ", sound: "Ph (Phapha)", name: "Phapha", example: "Fateh (Victory)" },
    { id: "bhabba", gurmukhi: "ਭ", sound: "Bh (Bhabba)", name: "Bhabba", example: "Bhagti (Devotion)" },
    { id: "rara", gurmukhi: "ਰ", sound: "R (Rara)", name: "Rara", example: "Raag / Rabab" },
    { id: "vava", gurmukhi: "ਵ", sound: "V / W (Vava)", name: "Vava", example: "Waheguru" },
  ],
  advanced: [
    { id: "nganga", gurmukhi: "ਙ", sound: "Ng (Nganga)", name: "Nganga", example: "Nasal velar consonant" },
    { id: "nyanya", gurmukhi: "ਞ", sound: "Ny (Nyanya)", name: "Nyanya", example: "Palatal nasal consonant" },
    { id: "tainka", gurmukhi: "ਟ", sound: "Hard T (Tainka)", name: "Tainka", example: "Retroflex 'T'" },
    { id: "ddadda", gurmukhi: "ਡ", sound: "Hard D (Ddadda)", name: "Ddadda", example: "Retroflex 'D'" },
    { id: "nana", gurmukhi: "ਣ", sound: "Retroflex N (Nana)", name: "Nana", example: "As in Gun (Virtues)" },
    { id: "rharha", gurmukhi: "ੜ", sound: "Rh (Rharha)", name: "Rharha", example: "As in Pauri / Chardi" },
    { id: "yaya", gurmukhi: "ਯ", sound: "Y (Yaya)", name: "Yaya", example: "As in Yug / Jaap" },
    { id: "lalla", gurmukhi: "ਲ", sound: "L (Lalla)", name: "Lalla", example: "As in Langar / Larivaar" },
  ],
};

const FALLBACK_CONCEPTS_BY_LEVEL: Record<LearnerLevel, GeneratedConceptPair[]> = {
  beginner: [
    { id: "seva", term: "Seva", gurmukhi: "ਸੇਵਾ", meaning: "Selfless service offered to others with kindness and humility." },
    { id: "simran", term: "Simran", gurmukhi: "ਸਿਮਰਨ", meaning: "Loving, peaceful remembrance of the One Creator." },
    { id: "hukam", term: "Hukam", gurmukhi: "ਹੁਕਮ", meaning: "Living in joyful harmony with Divine Order." },
    { id: "kirat-karni", term: "Kirat Karni", gurmukhi: "ਕਿਰਤ ਕਰਨੀ", meaning: "Earning an honest living through sincere hard work." },
    { id: "vand-chakna", term: "Vand Chakna", gurmukhi: "ਵੰਡ ਛਕਣਾ", meaning: "Sharing your food, time, and blessings with others." },
    { id: "chardi-kala", term: "Chardi Kala", gurmukhi: "ਚੜ੍ਹਦੀ ਕਲਾ", meaning: "An ever-rising spirit filled with hope and courage." },
    { id: "miri-piri", term: "Miri-Piri", gurmukhi: "ਮੀਰੀ-ਪੀਰੀ", meaning: "Balancing spiritual devotion with standing up for justice." },
  ],
  intermediate: [
    { id: "sangat", term: "Sangat", gurmukhi: "ਸੰਗਤ", meaning: "The uplifting fellowship of seekers gathering in truth and harmony." },
    { id: "pangat", term: "Pangat", gurmukhi: "ਪੰਗਤ", meaning: "Sitting side by side in equal rows to share Guru Ka Langar." },
    { id: "dasvandh", term: "Dasvandh", gurmukhi: "ਦਸਵੰਧ", meaning: "Dedicating one-tenth of one's honest earnings to community welfare." },
    { id: "ardas", term: "Ardas", gurmukhi: "ਅਰਦਾਸ", meaning: "Humble prayer of gratitude, remembrance, and Sarbat Da Bhala." },
    { id: "nitnem", term: "Nitnem", gurmukhi: "ਨਿਤਨੇਮ", meaning: "Daily rhythm of sacred Banis read at dawn, dusk, and night." },
    { id: "hukamnama", term: "Hukamnama", gurmukhi: "ਹੁਕਮਨਾਮਾ", meaning: "Daily guiding Shabad opened from Sri Guru Granth Sahib Ji." },
    { id: "sarbat-da-bhala", term: "Sarbat Da Bhala", gurmukhi: "ਸਰਬੱਤ ਦਾ ਭਲਾ", meaning: "Wishing peace, dignity, and well-being for all of humanity." },
  ],
  fluent: [
    { id: "gurmukh", term: "Gurmukh", gurmukhi: "ਗੁਰਮੁਖਿ", meaning: "One whose awareness is turned toward the Guru's wisdom and truth." },
    { id: "haumai", term: "Haumai", gurmukhi: "ਹਉਮੈ", meaning: "Self-centered ego that creates separation from the One." },
    { id: "sahaj", term: "Sahaj", gurmukhi: "ਸਹਜ", meaning: "Natural spiritual equipoise, unshakable calm, and clarity." },
    { id: "vismad", term: "Vismad", gurmukhi: "ਵਿਸਮਾਦੁ", meaning: "Transcendent awe and wonder at the vastness of Creation." },
    { id: "shabad-guru", term: "Shabad Guru", gurmukhi: "ਸ਼ਬਦ ਗੁਰੂ", meaning: "Divine Wisdom revealed as Word, guiding consciousness beyond form." },
    { id: "sant-sipahi", term: "Sant-Sipahi", gurmukhi: "ਸੰਤ-ਸਿਪਾਹੀ", meaning: "Saint-Soldier uniting meditative compassion with fearless justice." },
    { id: "nadar", term: "Nadar / Mehar", gurmukhi: "ਨਦਰਿ", meaning: "The compassionate, liberating Glance of Divine Grace." },
  ],
  advanced: [
    { id: "anhad-naad", term: "Anhad Naad", gurmukhi: "ਅਨਹਦ ਨਾਦ", meaning: "The unstruck celestial resonance perceived in deep Naam immersion." },
    { id: "sargun-nirgun", term: "Sargun–Nirgun", gurmukhi: "ਸਰਗੁਣ ਨਿਰਗੁਣ", meaning: "The Divine simultaneously manifest in form and transcendent beyond attributes." },
    { id: "jivan-mukt", term: "Jivan-Mukt", gurmukhi: "ਜੀਵਨ ਮੁਕਤੁ", meaning: "Spiritual liberation lived actively within the world, free from ego." },
    { id: "tanti-saaj", term: "Tanti Saaj", gurmukhi: "ਤੰਤੀ ਸਾਜ਼", meaning: "Traditional stringed instruments (Rabab, Saranda, Taus, Dilruba) of Gurmat Sangeet." },
    { id: "larivaar", term: "Larivaar", gurmukhi: "ਲੜੀਵਾਰ", meaning: "Continuous unbroken script tradition of Puratan Sri Guru Granth Sahib Ji saroops." },
    { id: "panj-khand", term: "Panj Khand", gurmukhi: "ਪੰਜ ਖੰਡ", meaning: "Five realms of spiritual ascent in Japji Sahib culminating in Sach Khand." },
    { id: "gian-khand", term: "Gian Khand", gurmukhi: "ਗਿਆਨ ਖੰਡ", meaning: "The Realm of Cosmic Wisdom awakening awareness of infinite worlds." },
  ],
};

function rotateBySeed<T>(items: T[], seed: number): T[] {
  if (items.length === 0) return items;
  const shift = Math.abs(Math.floor(seed)) % items.length;
  return [...items.slice(shift), ...items.slice(0, shift)];
}

function buildFallback(mode: GameMode, level: LearnerLevel, seed: number) {
  if (mode === "history") {
    return {
      questions: rotateBySeed(FALLBACK_HISTORY_BY_LEVEL[level], seed),
    };
  }
  if (mode === "gurmukhi") {
    return {
      pairs: rotateBySeed(FALLBACK_GURMUKHI_BY_LEVEL[level], seed),
    };
  }
  return {
    pairs: rotateBySeed(FALLBACK_CONCEPTS_BY_LEVEL[level], seed),
  };
}

function sanitizeJsonText(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }
  return trimmed;
}

export async function POST(req: Request) {
  let body: GenerateQuizRequest = {};
  try {
    body = (await req.json()) as GenerateQuizRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const ageGroup: LearnerAgeGroup =
    body.ageGroup && body.ageGroup in AGE_DESCRIPTIONS
      ? body.ageGroup
      : "youth";
  const level: LearnerLevel =
    body.level && body.level in LEVEL_DESCRIPTIONS
      ? body.level
      : "beginner";
  const mode: GameMode =
    body.mode === "gurmukhi" || body.mode === "concepts" || body.mode === "history"
      ? body.mode
      : "history";
  const seed = typeof body.seed === "number" ? body.seed : Date.now();

  const apiKey = (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    ""
  ).trim();

  if (!apiKey) {
    return NextResponse.json({
      ok: true,
      source: "fallback",
      mode,
      ageGroup,
      level,
      ...buildFallback(mode, level, seed),
    });
  }

  const audienceSpec = `${AGE_DESCRIPTIONS[ageGroup]}\n${LEVEL_DESCRIPTIONS[level]}`;

  let prompt = "";
  if (mode === "history") {
    prompt = [
      "You are a respectful, historically accurate Sikhi educator.",
      `Generate 6 fresh, engaging, untimed Sikh History & Heritage multiple-choice questions tailored to:\n${audienceSpec}`,
      `Variation seed: ${seed}. Avoid repeating clichés; ensure strict historical accuracy grounded in Sikh tradition and Sri Guru Granth Sahib Ji.`,
      "Return ONLY valid JSON matching this exact shape:",
      `{ "questions": [ { "id": "q-1", "question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "1-2 clear, warm educational sentences." } ] }`,
      "Ensure every options array has exactly 4 distinct strings and correctIndex is 0, 1, 2, or 3.",
    ].join("\n\n");
  } else if (mode === "gurmukhi") {
    prompt = [
      "You are a gentle Gurmukhi teacher.",
      `Generate 8 distinct Gurmukhi letter-to-phonetic-sound pairs tailored to:\n${audienceSpec}`,
      `Variation seed: ${seed}. Use authentic Unicode Gurmukhi characters.`,
      "Return ONLY valid JSON matching this exact shape:",
      `{ "pairs": [ { "id": "g-1", "gurmukhi": "ੳ", "sound": "U / O (Oora)", "name": "Oora", "example": "Short example word or tip" } ] }`,
      "Ensure all 8 gurmukhi characters and sounds are unique.",
    ].join("\n\n");
  } else {
    prompt = [
      "You are a respectful Sikhi philosophy educator.",
      `Generate 7 distinct Sikhi concept-to-meaning pairs tailored to:\n${audienceSpec}`,
      `Variation seed: ${seed}. Include authentic Unicode Gurmukhi for each term and a clear, concise 1-sentence plain-English meaning.`,
      "Return ONLY valid JSON matching this exact shape:",
      `{ "pairs": [ { "id": "c-1", "term": "Seva", "gurmukhi": "ਸੇਵਾ", "meaning": "Selfless service offered to humanity without expecting reward." } ] }`,
      "Ensure all 7 terms are unique.",
    ].join("\n\n");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    });

    const rawText = sanitizeJsonText(response.text || "");
    const parsed = JSON.parse(rawText) as Record<string, unknown>;

    if (mode === "history" && Array.isArray(parsed.questions)) {
      const valid = parsed.questions
        .filter((q): q is Record<string, unknown> => Boolean(q && typeof q === "object"))
        .map((q, idx): GeneratedQuizQuestion | null => {
          const opts = Array.isArray(q.options)
            ? q.options.map((o) => String(o || "").trim()).filter(Boolean)
            : [];
          const ci = Number(q.correctIndex);
          const question = String(q.question || "").trim();
          const explanation = String(q.explanation || "").trim();
          if (
            !question ||
            !explanation ||
            opts.length !== 4 ||
            !Number.isInteger(ci) ||
            ci < 0 ||
            ci > 3
          ) {
            return null;
          }
          return {
            id: `ai-q-${seed}-${idx}`,
            question,
            options: [opts[0], opts[1], opts[2], opts[3]],
            correctIndex: ci,
            explanation,
          };
        })
        .filter((q): q is GeneratedQuizQuestion => q !== null)
        .slice(0, 6);

      if (valid.length >= 4) {
        return NextResponse.json({
          ok: true,
          source: "gemini",
          mode,
          ageGroup,
          level,
          questions: valid,
        });
      }
    }

    if (mode === "gurmukhi" && Array.isArray(parsed.pairs)) {
      const seen = new Set<string>();
      const valid = parsed.pairs
        .filter((p): p is Record<string, unknown> => Boolean(p && typeof p === "object"))
        .map((p, idx): GeneratedGurmukhiPair | null => {
          const gurmukhi = String(p.gurmukhi || "").trim();
          const sound = String(p.sound || "").trim();
          const name = String(p.name || sound).trim();
          const example = String(p.example || "").trim();
          if (!gurmukhi || !sound || seen.has(gurmukhi)) return null;
          seen.add(gurmukhi);
          return {
            id: `ai-g-${seed}-${idx}`,
            gurmukhi,
            sound,
            name,
            example: example || `Sound: ${sound}`,
          };
        })
        .filter((p): p is GeneratedGurmukhiPair => p !== null)
        .slice(0, 8);

      if (valid.length >= 6) {
        return NextResponse.json({
          ok: true,
          source: "gemini",
          mode,
          ageGroup,
          level,
          pairs: valid,
        });
      }
    }

    if (mode === "concepts" && Array.isArray(parsed.pairs)) {
      const seen = new Set<string>();
      const valid = parsed.pairs
        .filter((p): p is Record<string, unknown> => Boolean(p && typeof p === "object"))
        .map((p, idx): GeneratedConceptPair | null => {
          const term = String(p.term || "").trim();
          const gurmukhi = String(p.gurmukhi || "").trim();
          const meaning = String(p.meaning || "").trim();
          if (!term || !meaning || seen.has(term.toLowerCase())) return null;
          seen.add(term.toLowerCase());
          return {
            id: `ai-c-${seed}-${idx}`,
            term,
            gurmukhi: gurmukhi || term,
            meaning,
          };
        })
        .filter((p): p is GeneratedConceptPair => p !== null)
        .slice(0, 7);

      if (valid.length >= 5) {
        return NextResponse.json({
          ok: true,
          source: "gemini",
          mode,
          ageGroup,
          level,
          pairs: valid,
        });
      }
    }
  } catch {
    // Graceful fallback to curated level-matched set
  }

  return NextResponse.json({
    ok: true,
    source: "fallback",
    mode,
    ageGroup,
    level,
    ...buildFallback(mode, level, seed),
  });
}
