import type {
  GameType,
  LearnerAgeGroup,
  LearnerKnowledgeLevel,
} from "@/components/games/learner-profile";

export interface GeneratedQuizQuestion {
  id: string;
  categoryTag?: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  pankti?: string;
}

export interface GeneratedMatchPair {
  id: string;
  leftPrimary: string;
  leftSecondary?: string;
  rightPrimary: string;
  rightSecondary?: string;
  insight?: string;
  // Backward-compatible fields for Gurmukhi & Concepts components
  gurmukhi?: string;
  sound?: string;
  name?: string;
  example?: string;
  term?: string;
  meaning?: string;
}

export interface GeneratedScenarioOption {
  label: string;
  outcome: string;
  alignment: "gurmat-aligned" | "reflective" | "cautionary";
}

export interface GeneratedScenarioItem {
  id: string;
  contextTag: string;
  title: string;
  scenario: string;
  options: GeneratedScenarioOption[];
  panktiReflection: {
    gurmukhi: string;
    transliteration: string;
    translation: string;
    reflection: string;
  };
}

function rotateArray<T>(items: T[], seed: number): T[] {
  if (items.length <= 1) return [...items];
  const offset = Math.abs(seed) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

const GURMUKHI_FALLBACK: GeneratedMatchPair[] = [
  { id: "g-1", leftPrimary: "ੳ", leftSecondary: "Oora", rightPrimary: "U / O (Oora)", rightSecondary: "Vowel carrier for u / o", gurmukhi: "ੳ", sound: "U / O (Oora)", name: "Oora", example: "Vowel carrier for u / o" },
  { id: "g-2", leftPrimary: "ਅ", leftSecondary: "Aira", rightPrimary: "A (Aira)", rightSecondary: "Vowel carrier for a / aa", gurmukhi: "ਅ", sound: "A (Aira)", name: "Aira", example: "Vowel carrier for a / aa" },
  { id: "g-3", leftPrimary: "ੲ", leftSecondary: "Eeri", rightPrimary: "I / E (Eeri)", rightSecondary: "Vowel carrier for i / e", gurmukhi: "ੲ", sound: "I / E (Eeri)", name: "Eeri", example: "Vowel carrier for i / e" },
  { id: "g-4", leftPrimary: "ਸ", leftSecondary: "Sassa", rightPrimary: "S (Sassa)", rightSecondary: "As in Sat (Truth)", gurmukhi: "ਸ", sound: "S (Sassa)", name: "Sassa", example: "As in Sat (Truth)" },
  { id: "g-5", leftPrimary: "ਹ", leftSecondary: "Haha", rightPrimary: "H (Haha)", rightSecondary: "As in Hukam (Divine Order)", gurmukhi: "ਹ", sound: "H (Haha)", name: "Haha", example: "As in Hukam (Divine Order)" },
  { id: "g-6", leftPrimary: "ਕ", leftSecondary: "Kakka", rightPrimary: "K (Kakka)", rightSecondary: "As in Kirat (Honest work)", gurmukhi: "ਕ", sound: "K (Kakka)", name: "Kakka", example: "As in Kirat (Honest work)" },
  { id: "g-7", leftPrimary: "ਖ", leftSecondary: "Khakha", rightPrimary: "Kh (Khakha)", rightSecondary: "As in Khalsa", gurmukhi: "ਖ", sound: "Kh (Khakha)", name: "Khakha", example: "As in Khalsa" },
  { id: "g-8", leftPrimary: "ਗ", leftSecondary: "Gagga", rightPrimary: "G (Gagga)", rightSecondary: "As in Guru", gurmukhi: "ਗ", sound: "G (Gagga)", name: "Gagga", example: "As in Guru" },
];

const CONCEPTS_FALLBACK: GeneratedMatchPair[] = [
  { id: "c-1", leftPrimary: "Seva", leftSecondary: "ਸੇਵਾ", rightPrimary: "Selfless service offered with humility and without expecting reward.", term: "Seva", gurmukhi: "ਸੇਵਾ", meaning: "Selfless service offered with humility and without expecting reward." },
  { id: "c-2", leftPrimary: "Simran", leftSecondary: "ਸਿਮਰਨ", rightPrimary: "Loving, mindful remembrance of the One Divine Creator in daily life.", term: "Simran", gurmukhi: "ਸਿਮਰਨ", meaning: "Loving, mindful remembrance of the One Divine Creator in daily life." },
  { id: "c-3", leftPrimary: "Kirat Karni", leftSecondary: "ਕਿਰਤ ਕਰਨੀ", rightPrimary: "Earning an honest, ethical living through dedicated effort and integrity.", term: "Kirat Karni", gurmukhi: "ਕਿਰਤ ਕਰਨੀ", meaning: "Earning an honest, ethical living through dedicated effort and integrity." },
  { id: "c-4", leftPrimary: "Vand Chakna", leftSecondary: "ਵੰਡ ਛਕਣਾ", rightPrimary: "Sharing one's earnings, food, and blessings generously with those in need.", term: "Vand Chakna", gurmukhi: "ਵੰਡ ਛਕਣਾ", meaning: "Sharing one's earnings, food, and blessings generously with those in need." },
  { id: "c-5", leftPrimary: "Chardi Kala", leftSecondary: "ਚੜ੍ਹਦੀ ਕਲਾ", rightPrimary: "Ever-rising spirit—maintaining resilient optimism and courage even in hardship.", term: "Chardi Kala", gurmukhi: "ਚੜ੍ਹਦੀ ਕਲਾ", meaning: "Ever-rising spirit—maintaining resilient optimism and courage even in hardship." },
  { id: "c-6", leftPrimary: "Sangat", leftSecondary: "ਸੰਗਤ", rightPrimary: "Spiritual community gathered in equality to learn, reflect, and uplift one another.", term: "Sangat", gurmukhi: "ਸੰਗਤ", meaning: "Spiritual community gathered in equality to learn, reflect, and uplift one another." },
];

const RAAG_PEHAR_FALLBACK: Record<LearnerKnowledgeLevel, GeneratedMatchPair[]> = {
  beginner: [
    { id: "rp-b-1", leftPrimary: "Raag Asa", leftSecondary: "Amrit Vela • 3 AM – 6 AM", rightPrimary: "Fresh hope, sunrise clarity, and setting a calm intention for the day.", insight: "Asa Di Vaar is sung before dawn to awaken joyful purpose." },
    { id: "rp-b-2", leftPrimary: "Sri Raag", leftSecondary: "Evening • 6 PM – 9 PM", rightPrimary: "Grounded humility, quiet gratitude, and stepping back from daily busyness.", insight: "Sri Raag opens the 31-Raag section of Sri Guru Granth Sahib Ji (Ang 14)." },
    { id: "rp-b-3", leftPrimary: "Raag Bilawal", leftSecondary: "Morning • 6 AM – 9 AM", rightPrimary: "Warm joy, bright energy, and upbeat readiness for honest work.", insight: "Bilawal carries a sunlit, welcoming mood suited for morning study." },
    { id: "rp-b-4", leftPrimary: "Raag Kalyan", leftSecondary: "Night • 9 PM – 12 AM", rightPrimary: "Peaceful wind-down, stillness, and restful serenity before sleep.", insight: "Kalyan soothes the restless mind at the end of a long day." },
    { id: "rp-b-5", leftPrimary: "Raag Basant", leftSecondary: "Spring / Any Pehar", rightPrimary: "Renewal, blooming creativity, and optimism after a hard season.", insight: "Basant celebrates nature's renewal and inner spiritual blossoming." },
    { id: "rp-b-6", leftPrimary: "Raag Tukhari", leftSecondary: "Late Night / Pre-Dawn", rightPrimary: "Deep quiet reflection during still, silent hours.", insight: "Guru Nanak Dev Ji's Barah Maha in Raag Tukhari traces the soul through twelve months." },
  ],
  intermediate: [
    { id: "rp-i-1", leftPrimary: "Raag Asa", leftSecondary: "Pehar 1 • Amrit Vela (3–6 AM)", rightPrimary: "Disciplined optimism & mental reset before academic or workplace demands begin.", insight: "Balances aspiration (Asa) with detachment from anxiety." },
    { id: "rp-i-2", leftPrimary: "Raag Gujri", leftSecondary: "Pehar 2 • Late Morning (9 AM–12 PM)", rightPrimary: "Focused devotion and steady composure during peak midday productivity.", insight: "Often paired with deep reflection on inner steadiness amid busyness." },
    { id: "rp-i-3", leftPrimary: "Raag Dhanasri", leftSecondary: "Pehar 3 • Afternoon (12–3 PM)", rightPrimary: "Overcoming midday fatigue with gratitude and renewed inner courage.", insight: "Home to Arti (Gagan Mai Thaal), reframing the entire cosmos as worship." },
    { id: "rp-i-4", leftPrimary: "Raag Gauri", leftSecondary: "Pehar 4 • Late Afternoon / Dusk", rightPrimary: "Serious contemplative inquiry—ideal for deep reading and philosophical focus.", insight: "Sukhmani Sahib is composed in Raag Gauri, offering structured stillness." },
    { id: "rp-i-5", leftPrimary: "Raag Kalyan", leftSecondary: "Pehar 5 • Night (9 PM–12 AM)", rightPrimary: "Releasing stress and cultivating calm equipoise before rest.", insight: "Uses Teevra Madhyam to evoke expansive, unhurried evening tranquility." },
    { id: "rp-i-6", leftPrimary: "Raag Sarang", leftSecondary: "Midday • 12 PM – 3 PM", rightPrimary: "Quenching mental burnout like cool rain during intense midday heat.", insight: "Traditionally linked to the thirsty rainbird (Chatrik) seeking spiritual refreshment." },
  ],
  advanced: [
    { id: "rp-a-1", leftPrimary: "Raag Maru", leftSecondary: "Afternoon • Ang 989–1106", rightPrimary: "Fearless resolve and contemplation of mortality, dissolving attachment to illusion.", insight: "Contains Guru Nanak Dev Ji's Maru Solhe—cosmic meditations on pre-creation Sunn." },
    { id: "rp-a-2", leftPrimary: "Raag Ramkali", leftSecondary: "Amrit Vela • Ang 876–974", rightPrimary: "Ascetic clarity and awakening—bridging dialogue with yogis into householder stillness.", insight: "Houses Anand Sahib, Siddh Gosht, and Oankar, emphasizing inner equipoise over withdrawal." },
    { id: "rp-a-3", leftPrimary: "Raag Jaijawanti", leftSecondary: "Night • Ang 1352–1353", rightPrimary: "Bittersweet triumph—holding victory and Vairaag (detachment) simultaneously.", insight: "Introduced exclusively by Guru Tegh Bahadur Ji as the final 31st Raag of SGGS." },
    { id: "rp-a-4", leftPrimary: "Raag Sorath", leftSecondary: "Night • Ang 595–659", rightPrimary: "Quiet assurance and unwavering trust when navigating high-stakes uncertainty.", insight: "Blends serene melody with resolute courage in facing life's trials." },
    { id: "rp-a-5", leftPrimary: "Raag Majh", leftSecondary: "Afternoon • Ang 94–150", rightPrimary: "Intense longing (Birha) transformed into humble, grounded self-surrender.", insight: "A uniquely Punjabi folk-classical Raag elevated by Guru Nanak Dev Ji and Guru Arjan Dev Ji." },
    { id: "rp-a-6", leftPrimary: "Raag Malar", leftSecondary: "Monsoon / Late Night • Ang 1254–1293", rightPrimary: "Cathartic cooling of emotional fever—turning inner restlessness into fertile calm.", insight: "Celebrates monsoon renewal as a metaphor for Naam cooling the fire of ego." },
  ],
};

const PANKTI_DECODER_FALLBACK: Record<LearnerKnowledgeLevel, GeneratedMatchPair[]> = {
  beginner: [
    { id: "pd-b-1", leftPrimary: "Hukam", leftSecondary: "ਹੁਕਮ", rightPrimary: "Trusting the bigger picture instead of panicking over things outside your control.", insight: "Living in Hukam brings calm acceptance paired with wise effort." },
    { id: "pd-b-2", leftPrimary: "Haumai", leftSecondary: "ਹਉਮੈ", rightPrimary: "Self-centered pride ('I-me-mine') that makes us compare ourselves and feel anxious.", insight: "Recognizing Haumai is the first step toward genuine humility and peace." },
    { id: "pd-b-3", leftPrimary: "Santokh", leftSecondary: "ਸੰਤੋਖ", rightPrimary: "Deep contentment—appreciating what you have while still working honestly.", insight: "Santokh protects the mind from endless comparison and burnout." },
    { id: "pd-b-4", leftPrimary: "Daya", leftSecondary: "ਦਇਆ", rightPrimary: "Active empathy and kindness that notices when someone needs help.", insight: "In Sikhi, compassion is expressed through real-world Seva." },
    { id: "pd-b-5", leftPrimary: "Nimrata", leftSecondary: "ਨਿਮਰਤਾ", rightPrimary: "Quiet strength and humility that listens well without needing applause.", insight: "Guru Nanak Dev Ji calls sweetness and humility the essence of all virtue." },
    { id: "pd-b-6", leftPrimary: "Sehaj", leftSecondary: "ਸਹਜ", rightPrimary: "Steady emotional balance—staying calm even when a day gets hectic.", insight: "Sehaj is unhurried poise rooted in daily Simran." },
  ],
  intermediate: [
    { id: "pd-i-1", leftPrimary: "Haumai", leftSecondary: "ਹਉਮੈ (Ego-Centrism)", rightPrimary: "Cognitive tunnel vision where identity depends on status, validation, or control.", insight: "Gurbani diagnoses Haumai as a chronic disease whose remedy lies within the very awareness of Hukam." },
    { id: "pd-i-2", leftPrimary: "Sehaj", leftSecondary: "ਸਹਜ (Equipoise)", rightPrimary: "Emotional regulation & flow state free from reactive highs and lows.", insight: "Cultivated gradually through disciplined Simran, honest work, and Sangati reflection." },
    { id: "pd-i-3", leftPrimary: "Bibek", leftSecondary: "ਬਿਬੇਕ (Discernment)", rightPrimary: "Critical ethical clarity—distinguishing lasting truth from short-term social pressure.", insight: "Bibek Buddhi empowers students and professionals to make principled choices under pressure." },
    { id: "pd-i-4", leftPrimary: "Hukam", leftSecondary: "ਹੁਕਮ (Cosmic Order)", rightPrimary: "Radical acceptance of reality's unfolding while acting with disciplined responsibility.", insight: "Replaces fatalism and control-anxiety with aligned, resilient action." },
    { id: "pd-i-5", leftPrimary: "Santokh", leftSecondary: "ਸੰਤੋਖ (Contentment)", rightPrimary: "Antidote to hedonic treadmill and comparison burnout in modern career culture.", insight: "Enables ambition fueled by service rather than insecurity." },
    { id: "pd-i-6", leftPrimary: "Vairaag", leftSecondary: "ਵੈਰਾਗ (Detachment)", rightPrimary: "Healthy non-clinging—loving deeply while recognizing life's impermanence.", insight: "Frees the mind from fear of loss without withdrawing from civic responsibility." },
  ],
  advanced: [
    { id: "pd-a-1", leftPrimary: "Sunniai / Mannai", leftSecondary: "ਸੁਣਿਐ / ਮੰਨੈ (Japji)", rightPrimary: "Epistemic progression from attentive listening to embodied internal conviction.", insight: "Japji Sahib's Pauris 8–15 map consciousness from receptivity to transformative realization." },
    { id: "pd-a-2", leftPrimary: "Jeevan Mukti", leftSecondary: "ਜੀਵਨ ਮੁਕਤਿ", rightPrimary: "Existential liberation attained in active worldly engagement, not posthumous escape.", insight: "Sukhmani Sahib (Ang 275) defines the Jeevan Mukta as one who sees the One in joy and sorrow alike." },
    { id: "pd-a-3", leftPrimary: "Sabad Surat", leftSecondary: "ਸਬਦ ਸੁਰਤਿ", rightPrimary: "Attuning raw awareness (Surat) directly to transcendent wisdom (Shabad) to dissolve mental noise.", insight: "Central contemplative praxis in Siddh Gosht (Ang 938–946)." },
    { id: "pd-a-4", leftPrimary: "Bibek Buddhi", leftSecondary: "ਬਿਬੇਕ ਬੁਧਿ", rightPrimary: "Sovereign ethical discernment capable of auditing one's own motives before acting.", insight: "Bridges contemplative Piri with accountable leadership in Miri." },
    { id: "pd-a-5", leftPrimary: "Nirmal Bhau", leftSecondary: "ਨਿਰਮਲ ਭਉ", rightPrimary: "Reverent awe that dissolves all lesser worldly fears and social conformity.", insight: "In Gurbani, awe of the Infinite is the antidote to fear of finite authority." },
    { id: "pd-a-6", leftPrimary: "Gurmukh vs. Manmukh", leftSecondary: "ਗੁਰਮੁਖਿ / ਮਨਮੁਖਿ", rightPrimary: "Contrast between wisdom-anchored agency and impulse-driven reactivity.", insight: "Not a social label, but a moment-by-moment orientation of consciousness." },
  ],
};

const GURBANI_SYNTHESIS_FALLBACK: GeneratedMatchPair[] = [
  {
    id: "gs-1",
    leftPrimary: "ਹੁਕਮਿ ਰਜਾਈ ਚਲਣਾ ਨਾਨਕ ਲਿਖਿਆ ਨਾਲਿ ॥",
    leftSecondary: "Japji Sahib • Ang 1",
    rightPrimary: "Harmonizing human agency with cosmic order—dissolving egoic resistance without falling into passive fatalism.",
    insight: "Establishes the foundational ontology of Sri Guru Granth Sahib Ji right after the Mool Mantar.",
  },
  {
    id: "gs-2",
    leftPrimary: "ਹਉਮੈ ਦੀਰਘ ਰੋਗੁ ਹੈ ਦਾਰੂ ਭੀ ਇਸੁ ਮਾਹਿ ॥",
    leftSecondary: "Asa Di Vaar • Ang 466",
    rightPrimary: "Ego-individuation is both the root pathology and the very site where self-aware transformation begins.",
    insight: "Guru Angad Dev Ji frames ego dialectically rather than merely condemning human selfhood.",
  },
  {
    id: "gs-3",
    leftPrimary: "ਮਨ ਤੂੰ ਜੋਤਿ ਸਰੂਪੁ ਹੈ ਆਪਣਾ ਮੂਲੁ ਪਛਾਣੁ ॥",
    leftSecondary: "Raag Asa, Guru Amar Das Ji • Ang 441",
    rightPrimary: "Non-dual self-recognition—realizing consciousness is inherently radiant rather than fundamentally flawed.",
    insight: "Shifts spiritual practice from guilt-driven penance to remembering one's luminous origin.",
  },
  {
    id: "gs-4",
    leftPrimary: "ਪਵਣੁ ਗੁਰੂ ਪਾਣੀ ਪਿਤਾ ਮਾਤਾ ਧਰਤਿ ਮਹਤੁ ॥",
    leftSecondary: "Japji Sahib Slok • Ang 8",
    rightPrimary: "Sacred ecological ethics—viewing air, water, and earth as relational kin demanding stewardship.",
    insight: "Closes Japji Sahib by anchoring spiritual liberation in accountability toward the living planet.",
  },
  {
    id: "gs-5",
    leftPrimary: "ਭੈ ਕਾਹੂ ਕਉ ਦੇਤ ਨਹਿ ਨਹਿ ਭੈ ਮਾਨਤ ਆਨ ॥",
    leftSecondary: "Slok Mahalla 9 • Ang 1427",
    rightPrimary: "Sovereign moral courage—refusing both to coerce others and to capitulate to unjust intimidation.",
    insight: "Guru Tegh Bahadur Ji's concise criterion for the truly wise (Giani).",
  },
  {
    id: "gs-6",
    leftPrimary: "ਸਚਹੁ ਓਰੈ ਸਭੁ ਕੋ ਉਪਰਿ ਸਚੁ ਆਚਾਰੁ ॥",
    leftSecondary: "Sri Raag, Guru Nanak Dev Ji • Ang 62",
    rightPrimary: "Truthful conduct supersedes abstract metaphysical claims—ethics is the highest test of realization.",
    insight: "Directly challenges performative religiosity detached from lived integrity.",
  },
];

const HISTORY_BEGINNER_FALLBACK: GeneratedQuizQuestion[] = [
  {
    id: "hb-1",
    categoryTag: "Foundations",
    question: "Who founded Sikhi and established the egalitarian community of Kartarpur Sahib?",
    options: ["Guru Nanak Dev Ji", "Guru Angad Dev Ji", "Guru Ram Das Ji", "Guru Hargobind Sahib Ji"],
    correctIndex: 0,
    explanation: "Guru Nanak Dev Ji (1469–1539) founded Kartarpur Sahib where seekers lived together practicing Kirat Karni, Naam Japna, and Vand Chakna.",
  },
  {
    id: "hb-2",
    categoryTag: "Gurmukhi",
    question: "Which Guru standardized the Gurmukhi alphabet so everyone could read Gurbani directly?",
    options: ["Guru Amar Das Ji", "Guru Angad Dev Ji", "Guru Har Rai Ji", "Guru Tegh Bahadur Ji"],
    correctIndex: 1,
    explanation: "Guru Angad Dev Ji (Second Guru) systematized Gurmukhi and opened learning schools welcoming children and adults of all backgrounds.",
  },
  {
    id: "hb-3",
    categoryTag: "Langar",
    question: "Who is lovingly praised in Sri Guru Granth Sahib Ji for nurturing Guru Ka Langar with warmth and abundance?",
    options: ["Bebe Nanaki Ji", "Mata Khivi Ji", "Mai Bhago Ji", "Mata Sundari Ji"],
    correctIndex: 1,
    explanation: "Mata Khivi Ji, spouse of Guru Angad Dev Ji, is honored on Ang 967 for serving nourishing kheer and guiding Langar with deep compassion.",
  },
  {
    id: "hb-4",
    categoryTag: "Equality",
    question: "What principle did Guru Amar Das Ji emphasize with 'Pehle Pangat, Pache Sangat'?",
    options: [
      "Everyone sits together as equals in Langar before meeting the Guru",
      "Only scholars may study scripture",
      "Fasting silently before sunrise",
      "Traveling to distant mountain shrines",
    ],
    correctIndex: 0,
    explanation: "Guru Amar Das Ji invited kings and villagers alike to sit side by side on the same floor in Pangat to dissolve caste hierarchy.",
  },
  {
    id: "hb-5",
    categoryTag: "Courage",
    question: "Why is Guru Tegh Bahadur Ji revered across humanity as 'Hind Di Chadar'?",
    options: [
      "For composing Asa Di Vaar",
      "For sacrificing his life in 1675 to defend the religious freedom of others",
      "For founding Amritsar's Sarovar",
      "For translating ancient star charts",
    ],
    correctIndex: 1,
    explanation: "Guru Tegh Bahadur Ji gave his life in Delhi in 1675 defending the right of Kashmiri Pandits and all people to live by their conscience.",
  },
  {
    id: "hb-6",
    categoryTag: "Eternal Guru",
    question: "In 1708 at Hazur Sahib (Nanded), whom did Guru Gobind Singh Ji bestow eternal Guruship upon?",
    options: ["A royal dynasty", "Sri Guru Granth Sahib Ji", "A council of governors", "A single regional fort"],
    correctIndex: 1,
    explanation: "Guru Gobind Singh Ji enshrined Sri Guru Granth Sahib Ji as the Eternal Living Guru, uniting the Panth under the Shabad Guru.",
  },
];

const PURATAN_ANALYSIS_FALLBACK: GeneratedQuizQuestion[] = [
  {
    id: "pa-1",
    categoryTag: "Raag Musicology",
    question: "In Sri Guru Granth Sahib Ji, what musical directive does the numeral 'Gharu' (ਘਰੁ) in a Shabad heading specify?",
    options: [
      "The specific rhythmic Taal variation and melodic contour (Swar-bandish) for singing the Shabad",
      "The geographical city where the Guru composed the hymn",
      "The number of verses contained in the closing Slok",
      "The season of the Nanakshahi calendar when the hymn must be recited",
    ],
    correctIndex: 0,
    explanation: "Gharu (ranging from 1 to 17) indicates the precise rhythmic cycle (Taal) and melodic intonation framework within the parent Raag.",
    pankti: "ਰਾਗੁ ਸਿਰੀਰਾਗੁ ਮਹਲਾ ੧ ਘਰੁ ੧ ॥",
  },
  {
    id: "pa-2",
    categoryTag: "Historiography",
    question: "What primary motivation prompted Shaheed Bhai Rattan Singh Bhangu to compose Sri Gur Panth Prakash in 1841?",
    options: [
      "To articulate the Sikh claim to sovereign Patshahi directly in response to British East India Company inquiries",
      "To compile a Sanskrit lexicon of Mughal administrative terms",
      "To translate European military manuals into Braj Bhasha",
      "To catalog architectural measurements of Lahore's royal gardens",
    ],
    correctIndex: 0,
    explanation: "When Captain Murray questioned how the Sikhs held sovereignty over Punjab, Bhangu recorded oral histories from surviving 18th-century Singhs establishing Guru-bestowed Patshahi.",
  },
  {
    id: "pa-3",
    categoryTag: "Gurbani Viyakaran",
    question: "In Professor Sahib Singh's Gurbani Viyakaran, what grammatical function does a final Aunkar (ੁ) on a masculine singular noun like 'ਨਾਨਕੁ' (Nanak-u) typically indicate?",
    options: [
      "Nominative singular subject case (the actor performing the verb)",
      "Plural vocative address to a large gathering",
      "Past-tense verbal conjugation",
      "A silent scribal ornament with no grammatical value",
    ],
    correctIndex: 0,
    explanation: "In Gurbani grammar, the final Aunkar marks the nominative singular case, distinguishing 'Nanak says' (ਨਾਨਕੁ) from vocative 'O Nanak' (ਨਾਨਕ).",
  },
  {
    id: "pa-4",
    categoryTag: "Raag Architecture",
    question: "Which 31st Raag was introduced exclusively by Guru Tegh Bahadur Ji and placed as the concluding main Raag of Sri Guru Granth Sahib Ji?",
    options: ["Raag Jaijawanti", "Raag Prabhati", "Raag Kedara", "Raag Bhairau"],
    correctIndex: 0,
    explanation: "Guru Gobind Singh Ji added Guru Tegh Bahadur Ji's four Shabads in Raag Jaijawanti (Ang 1352–1353) when preparing the Damdami Bir.",
  },
  {
    id: "pa-5",
    categoryTag: "Puratan Granths",
    question: "How does Mahakavi Bhai Santokh Singh structure his monumental 1843 epic Sri Gur Pratap Suraj Granth?",
    options: [
      "Into twelve Raas (zodiacal chapters) and six Ruts (seasons), mirroring the sun's annual illumination",
      "Into 31 Raag sections matching the exact order of Sri Guru Granth Sahib Ji",
      "As a collection of short Persian ghazals addressed to Emperor Aurangzeb",
      "As an alphabetical encyclopedia of Punjabi botanical medicine",
    ],
    correctIndex: 0,
    explanation: "Continuing from Sri Nanak Parkash, Suraj Granth uses solar imagery (Raas & Rut) to narrate the lives of Gurus Angad Dev Ji through Gobind Singh Ji.",
  },
  {
    id: "pa-6",
    categoryTag: "Tanti Saaj Lineage",
    question: "Why did Guru Arjan Dev Ji and Guru Hargobind Sahib Ji champion bowed string instruments like the Saranda and Taus alongside the Rabab?",
    options: [
      "Their sustained resonant bow strokes mirror the human voice's continuous Meend (microtonal glide) for Gurbani Raags",
      "They were required by Mughal court protocol for outdoor military parades",
      "They eliminated the need for rhythmic Taal accompaniment like the Jori-Pakhawaj",
      "They were designed strictly for solo instrumental recitals without vocal Gurbani",
    ],
    correctIndex: 0,
    explanation: "Bowed Tanti Saaj instruments sustain notes continuously, supporting contemplative Shabad pronunciation and authentic Raag microtones.",
  },
];

function buildChardiKalaSprintFallback(
  ageGroup: LearnerAgeGroup,
  level: LearnerKnowledgeLevel
): GeneratedQuizQuestion[] {
  if (level === "advanced" || ageGroup === "adults-seniors") {
    return [
      {
        id: "cks-adv-1",
        categoryTag: "1 · Concept Synthesis",
        question: "How does Gurbani distinguish authentic 'Santokh' (contentment) from passive complacency in leadership or family stewardship?",
        options: [
          "Santokh frees action from egoic greed so one serves with full excellence without anxiety over status",
          "Santokh requires withdrawing from career and community responsibilities altogether",
          "Santokh means accepting injustice silently to avoid confrontation",
          "Santokh applies only during Amrit Vela meditation, not daily work",
        ],
        correctIndex: 0,
        explanation: "In Gurmat, contentment dissolves restless craving (Trishna), unlocking steady, ethical energy for Seva and honest stewardship.",
      },
      {
        id: "cks-adv-2",
        categoryTag: "2 · History Insight",
        question: "What strategic principle did Bhai Kanhaiya Ji model on the battlefield of Anandpur Sahib when serving water to wounded adversaries?",
        options: [
          "Unconditional humanitarianism rooted in recognizing the One Divine Light (Ek Noor) in every human being",
          "A temporary diplomatic truce negotiated with hill chieftains",
          "A tactical distraction to map enemy supply lines",
          "An individual vow unrelated to Guru Gobind Singh Ji's instruction",
        ],
        correctIndex: 0,
        explanation: "Guru Gobind Singh Ji affirmed Bhai Kanhaiya Ji's vision and handed him healing ointment as well—establishing a timeless benchmark for humanitarian ethics.",
      },
      {
        id: "cks-adv-3",
        categoryTag: "3 · Real-Life Reflection",
        question: "When mentoring a younger colleague or family member who feels overwhelmed by comparison, which Gurmat lens best restores Chardi Kala?",
        options: [
          "Anchor their worth in Kirat Karni (honest effort) and Hukam rather than external applause or rivals' timelines",
          "Tell them to ignore their goals and stop striving altogether",
          "Encourage them to outperform peers at any ethical cost",
          "Remind them that stress is a sign of weak faith",
        ],
        correctIndex: 0,
        explanation: "Chardi Kala combines grounded humility with resilient forward motion—releasing comparison while honoring sincere effort.",
      },
    ];
  }

  if (ageGroup === "young-adults" || level === "intermediate") {
    return [
      {
        id: "cks-ya-1",
        categoryTag: "1 · Concept",
        question: "During an intense exam week or work deadline, how does 'Sehaj' (equipoise) practically help prevent burnout?",
        options: [
          "It replaces frantic panic with steady, focused rhythm—working diligently while keeping the mind calm",
          "It means postponing your responsibilities until you feel completely relaxed",
          "It requires working non-stop without taking breaks",
          "It means avoiding ambitious academic or career goals",
        ],
        correctIndex: 0,
        explanation: "Sehaj is calm, unhurried steadiness—allowing high-quality Kirat without letting anxiety hijack your clarity.",
      },
      {
        id: "cks-ya-2",
        categoryTag: "2 · History Insight",
        question: "What civic innovation did Guru Ram Das Ji build when founding Amritsar (Ramdaspur) in the 1570s?",
        options: [
          "An open, self-sustaining city welcoming 52 trades and artisans regardless of caste around a shared Sarovar",
          "A closed fortress restricted exclusively to royal courtiers",
          "A solitary mountain monastery far from trade routes",
          "A tax-exempt palace for a single merchant family",
        ],
        correctIndex: 0,
        explanation: "Guru Ram Das Ji integrated spiritual sanctuary with ethical economics (Kirat) and egalitarian civic life.",
      },
      {
        id: "cks-ya-3",
        categoryTag: "3 · Real-Life Reflection",
        question: "A teammate takes credit for your project work in front of a manager. What is the most Gurmat-aligned response?",
        options: [
          "Address the facts calmly and privately with integrity, keeping your dignity without retaliating in anger",
          "Publicly humiliate them in the meeting to protect your ego",
          "Sabotage their next deliverable silently",
          "Stay resentful for months while pretending nothing happened",
        ],
        correctIndex: 0,
        explanation: "Bibek (discernment) and Nimrata (humility) pair clear truth-speaking with composure—standing up for fairness without feeding Haumai.",
      },
    ];
  }

  return [
    {
      id: "cks-beg-1",
      categoryTag: "1 · Concept",
      question: "What does 'Vand Chakna' encourage us to do every day?",
      options: [
        "Share our food, kindness, and blessings generously with others",
        "Keep all our achievements secret",
        "Only help people we already know",
        "Wait until we are rich before being kind",
      ],
      correctIndex: 0,
      explanation: "Vand Chakna is one of Guru Nanak Dev Ji's three pillars—reminding us that joy grows when shared.",
    },
    {
      id: "cks-beg-2",
      categoryTag: "2 · History Insight",
      question: "How many doors does Sri Harmandir Sahib (the Golden Temple) have, and why?",
      options: [
        "Four doors—one in every direction—showing that people of all backgrounds are welcome",
        "One grand door facing east",
        "Two doors reserved for kings",
        "Three doors opened only on festivals",
      ],
      correctIndex: 0,
      explanation: "The four doors symbolize Guru Nanak Dev Ji's message of universal equality and open hospitality.",
    },
    {
      id: "cks-beg-3",
      categoryTag: "3 · Real-Life Reflection",
      question: "You notice a classmate or neighbor sitting alone and feeling left out. What reflects Chardi Kala and Seva?",
      options: [
        "Walk over warmly, invite them to join, and make them feel included",
        "Ignore them so you don't feel awkward",
        "Wait for someone else to notice first",
        "Laugh along with the crowd",
      ],
      correctIndex: 0,
      explanation: "Small acts of warmth and inclusion bring the spirit of Sangat and Langar into everyday life.",
    },
  ];
}

function buildGurmatActionFallback(
  ageGroup: LearnerAgeGroup,
  level: LearnerKnowledgeLevel
): GeneratedScenarioItem[] {
  if (ageGroup === "kids" || ageGroup === "youth") {
    return [
      {
        id: "ga-youth-1",
        contextTag: "School & Integrity",
        title: "The Leaked Test Answer Sheet",
        scenario:
          "The night before a tough science exam, a group chat shares photos of tomorrow's actual test paper. Everyone says, 'If you don't look, you'll fall behind.' What do you do?",
        options: [
          {
            label: "Mute the chat, study honestly with what you know, and trust your own Kirat (honest effort).",
            outcome:
              "You walk into class with a clear conscience and genuine mastery. Even if the test feels challenging, your self-respect and character grow stronger.",
            alignment: "gurmat-aligned",
          },
          {
            label: "Glance at just two questions so you don't feel left out, then close the chat.",
            outcome:
              "Compromising 'just a little' still leaves lingering unease—showing how subtle peer pressure tests our Bibek (discernment).",
            alignment: "reflective",
          },
          {
            label: "Memorize all the leaked answers to guarantee a top grade.",
            outcome:
              "A short-term score gained without Kirat erodes confidence and habits over time.",
            alignment: "cautionary",
          },
        ],
        panktiReflection: {
          gurmukhi: "ਸਚਹੁ ਓਰੈ ਸਭੁ ਕੋ ਉਪਰਿ ਸਚੁ ਆਚਾਰੁ ॥",
          transliteration: "Sachahu orai sabhu ko upari sachu aachaar ||",
          translation: "Truth is higher than everything; higher still is truthful living.",
          reflection: "Honest effort (Kirat Karni) builds quiet, unshakeable confidence that no shortcut can ever replace.",
        },
      },
      {
        id: "ga-youth-2",
        contextTag: "Friendship & Courage",
        title: "Standing Up for a New Student",
        scenario:
          "At lunch, a few popular classmates mimic a new student's accent and laugh. Nobody else speaks up because they don't want to become the next target.",
        options: [
          {
            label: "Calmly tell them that's not cool, then invite the new student to sit at your table.",
            outcome:
              "Your steady courage breaks the bystander effect and turns a painful moment into welcome Sangat.",
            alignment: "gurmat-aligned",
          },
          {
            label: "Stay silent during lunch, then message the new student privately later to say sorry.",
            outcome:
              "Kindness afterward helps, though speaking up in the moment protects dignity when it matters most.",
            alignment: "reflective",
          },
          {
            label: "Pretend not to hear so you stay on everyone's good side.",
            outcome:
              "Staying comfortable while someone is hurt leaves a heavy heart—Sikhi calls us to fearless compassion.",
            alignment: "cautionary",
          },
        ],
        panktiReflection: {
          gurmukhi: "ਨਾ ਕੋ ਬੈਰੀ ਨਹੀ ਬਿਗਾਨਾ ਸਗਲ ਸੰਗਿ ਹਮ ਕਉ ਬਨਿ ਆਈ ॥",
          transliteration: "Naa ko bairee nahee bigaanaa sagal sangi ham kau bani aaee ||",
          translation: "No one is my enemy, and no one is a stranger; I am in harmony with all.",
          reflection: "Seeing the One Divine Light in everyone gives us the courage to protect anyone who feels isolated.",
        },
      },
      {
        id: "ga-youth-3",
        contextTag: "Resilience & Focus",
        title: "Bouncing Back After a Setback",
        scenario:
          "You practiced for weeks for a tournament or recital, yet made a big mistake in front of everyone. Now you feel embarrassed and want to quit.",
        options: [
          {
            label: "Breathe deeply, thank your coach or family, note one lesson to improve, and keep practicing in Chardi Kala.",
            outcome:
              "You transform embarrassment into fuel. Growth happens fastest when ego steps aside and learning takes the lead.",
            alignment: "gurmat-aligned",
          },
          {
            label: "Take a few days off to cool down, then decide whether to return.",
            outcome:
              "Taking space to regulate emotions is healthy—just be careful not to let fear make the final decision.",
            alignment: "reflective",
          },
          {
            label: "Quit immediately so you never risk looking foolish again.",
            outcome:
              "Protecting pride from failure also shuts the door on mastery and joy.",
            alignment: "cautionary",
          },
        ],
        panktiReflection: {
          gurmukhi: "ਨਾਨਕ ਨਾਮ ਚੜ੍ਹਦੀ ਕਲਾ ॥ ਤੇਰੇ ਭਾਣੇ ਸਰਬੱਤ ਦਾ ਭਲਾ ॥",
          transliteration: "Nanak Naam Chardi Kalaa || Tere Bhaane Sarbat Daa Bhalaa ||",
          translation: "O Nanak, through the Naam may spirits forever rise, and in Your Will may all prosper.",
          reflection: "Chardi Kala doesn't mean never stumbling—it means rising every time with grace and courage.",
        },
      },
    ];
  }

  if (ageGroup === "young-adults") {
    return [
      {
        id: "ga-ya-1",
        contextTag: "Career Ethics & Kirat",
        title: "The Inflated Client Report",
        scenario:
          "Your manager asks you to omit a known risk metric from a quarterly presentation so the team hits its bonus target, promising 'we'll fix it quietly next month.'",
        options: [
          {
            label: "Document the risk transparently and propose a clear mitigation timeline so leadership sees both truth and solutions.",
            outcome:
              "You uphold Kirat Karni and Bibek Buddhi. Constructive honesty earns lasting trust far more than short-term optics.",
            alignment: "gurmat-aligned",
          },
          {
            label: "Place the risk in tiny appendix footnotes so you technically didn't hide it.",
            outcome:
              "Burying material truth creates ethical gray zones and erodes team accountability over time.",
            alignment: "reflective",
          },
          {
            label: "Remove the metric completely to keep your manager happy and secure the bonus.",
            outcome:
              "Trading integrity for short-term approval breeds quiet burnout and compromises your professional foundation.",
            alignment: "cautionary",
          },
        ],
        panktiReflection: {
          gurmukhi: "ਘਾਲਿ ਖਾਇ ਕਿਛੁ ਹਥਹੁ ਦੇਇ ॥ ਨਾਨਕ ਰਾਹੁ ਪਛਾਣਹਿ ਸੇਇ ॥",
          transliteration: "Ghaali khaai kichhu hathahu dei || Nanak raahu pachhaanahi sei ||",
          translation: "One who earns through honest labor and shares from their hands—O Nanak, they know the True Path.",
          reflection: "True career success in Gurmat is measured by clean integrity (Kirat) and service, never deceptive shortcuts.",
        },
      },
      {
        id: "ga-ya-2",
        contextTag: "Burnout & Sehaj",
        title: "Running on Empty During Finals & Deadlines",
        scenario:
          "Three major deadlines collide this week. Your sleep is down to four hours, your temper is short with family, and comparison with peers on social media is fueling constant anxiety.",
        options: [
          {
            label: "Pause for 10 minutes of grounding Simran, cut non-essential distractions, prioritize top impact tasks, and protect real sleep.",
            outcome:
              "Operating from Sehaj (equipoise) sharpens focus and protects both your mental health and relationships.",
            alignment: "gurmat-aligned",
          },
          {
            label: "Push through with caffeine until Friday, then promise to rest over the weekend.",
            outcome:
              "Short sprints happen, yet chronic neglect of inner stillness degrades judgment and well-being.",
            alignment: "reflective",
          },
          {
            label: "Doom-scroll peers' achievements at 2 AM while panicking about falling behind.",
            outcome:
              "Comparison feeds Haumai and drains the very energy needed for purposeful work.",
            alignment: "cautionary",
          },
        ],
        panktiReflection: {
          gurmukhi: "ਮਨਿ ਜੀਤੈ ਜਗੁ ਜੀਤੁ ॥",
          transliteration: "Mani jeetai jagu jeetu ||",
          translation: "Conquering the restless mind is conquering the entire world.",
          reflection: "Productivity without inner stillness leads to burnout; centering the mind first restores clarity and grace.",
        },
      },
      {
        id: "ga-ya-3",
        contextTag: "Leadership & Humility",
        title: "Credit & Collaboration on a High-Stakes Launch",
        scenario:
          "A project you led succeeds brilliantly. Senior executives praise you personally in a town hall, though a junior analyst solved the hardest bug behind the scenes.",
        options: [
          {
            label: "Publicly name and spotlight the junior analyst's breakthrough right in the town hall.",
            outcome:
              "Sharing credit dissolves Haumai, elevates your whole team, and models servant leadership.",
            alignment: "gurmat-aligned",
          },
          {
            label: "Thank 'the whole team' generically on stage and message the analyst privately later.",
            outcome:
              "Private appreciation is kind, though public recognition creates tangible career opportunity for emerging teammates.",
            alignment: "reflective",
          },
          {
            label: "Accept the solo spotlight since you carried the overall project risk.",
            outcome:
              "Hoarding recognition weakens team trust and traps leadership inside ego.",
            alignment: "cautionary",
          },
        ],
        panktiReflection: {
          gurmukhi: "ਮਿਠਤੁ ਨੀਵੀ ਨਾਨਕਾ ਗੁਣ ਚੰਗਿਆਈਆ ਤਤੁ ॥",
          transliteration: "Mithatu neevee Nanakaa gun changiaaeeaa tatu ||",
          translation: "Sweetness and humility, O Nanak, are the essence of all virtues and goodness.",
          reflection: "Great leadership lifts others into the light without needing to shrink anyone else.",
        },
      },
    ];
  }

  // Adults & Seniors / Advanced
  return [
    {
      id: "ga-as-1",
      contextTag: "Mentorship & Intergenerational Wisdom",
      title: "Bridging Generational Tensions in Community Leadership",
      scenario:
        "During a Gurdwara or civic board meeting, younger volunteers propose modern digital outreach while senior committee members worry traditional discipline will be diluted. Tempers begin rising.",
      options: [
        {
          label: "Facilitate a respectful Sangat dialogue honoring traditional Maryada while piloting one youth-led initiative with shared mentorship.",
          outcome:
            "You embody Panch Pardhan wisdom—uniting institutional memory with fresh Seva energy instead of letting ego polarize the room.",
            alignment: "gurmat-aligned",
          },
        {
          label: "Table the discussion indefinitely to avoid immediate disagreement.",
          outcome:
            "Postponing hard conversations keeps short-term quiet but risks alienating sincere volunteers who want to contribute.",
          alignment: "reflective",
        },
        {
          label: "Insist that seniority alone settles the vote without hearing the youth proposal.",
          outcome:
            "Authority without listening hardens Haumai and weakens long-term community continuity.",
          alignment: "cautionary",
        },
      ],
      panktiReflection: {
        gurmukhi: "ਹੋਇ ਇਕਤ੍ਰ ਮਿਲਹੁ ਮੇਰੇ ਭਾਈ ਦੁਬਿਧਾ ਦੂਰਿ ਕਰਹੁ ਲਿਵ ਲਾਇ ॥",
        transliteration: "Hoi ikatra milahu mere bhaaee dubidhaa doori karahu liv laai ||",
        translation: "Come together in unity, my companions; dissolve division by attuning to Divine Love.",
        reflection: "Stewardship thrives when wisdom listens with humility and welcomes the next generation into shared Seva.",
      },
    },
    {
      id: "ga-as-2",
      contextTag: "Family & Non-Attachment",
      title: "Navigating an Unsolicited Career Shift in the Family",
      scenario:
        "An adult child or mentee you invested years supporting chooses a purposeful but lower-paying vocation instead of the prestigious path you envisioned.",
      options: [
        {
          label: "Listen deeply to their calling, affirm their integrity in Kirat Karni, and offer steady counsel without emotional leverage.",
          outcome:
            "Replacing attachment (Moh) with compassionate love preserves trust and honors their sovereign growth.",
          alignment: "gurmat-aligned",
        },
        {
          label: "Express quiet disappointment repeatedly so they reconsider financial prestige.",
          outcome:
            "Well-meaning worry can easily blur into Moh (controlling attachment) when prestige overshadows purpose.",
          alignment: "reflective",
        },
        {
          label: "Withdraw warmth until they return to the conventional career track.",
          outcome:
            "Conditional support fractures family Sangat and prioritizes social status over spiritual well-being.",
          alignment: "cautionary",
        },
      ],
      panktiReflection: {
        gurmukhi: "ਹੁਕਮੈ ਅੰਦਰਿ ਸਭੁ ਕੋ ਬਾਹਰਿ ਹੁਕਮ ਨ ਕੋਇ ॥",
        transliteration: "Hukamai andari sabhu ko baahari hukam na koi ||",
        translation: "Everyone is within Divine Order; none is outside Hukam.",
        reflection: "Mature love guides with wisdom and then trusts Hukam, releasing the need to script another's life.",
      },
    },
    {
      id: "ga-as-3",
      contextTag: "Legacy & Ethical Stewardship",
      title: "Stepping Back with Grace in Leadership",
      scenario:
        "After a decade leading a community organization or business unit, you notice capable successors are ready—yet stepping aside feels uncomfortable for your sense of identity.",
      options: [
        {
          label: "Design a transparent transition plan, mentor your successors openly, and transition into an elder advisor role.",
          outcome:
            "You model the Gurmat ideal of Seva over title—ensuring the institution flourishes far beyond any single individual.",
          alignment: "gurmat-aligned",
        },
        {
          label: "Hand over operational tasks while retaining veto power over every minor decision.",
          outcome:
            "Partial delegation prevents successors from developing true ownership and resilience.",
          alignment: "reflective",
        },
        {
          label: "Hold onto the title indefinitely because you built the foundation.",
          outcome:
            "Clinging to position turns past Seva into subtle Haumai.",
          alignment: "cautionary",
        },
      ],
      panktiReflection: {
        gurmukhi: "ਸੇਵਾ ਕਰਤ ਹੋਇ ਨਿਹਕਾਮੀ ॥ ਤਿਸ ਕਉ ਹੋਤ ਪਰਾਪਤਿ ਸੁਆਮੀ ॥",
        transliteration: "Sevaa karat hoi nihakaamee || Tis kau hot paraapati suaamee ||",
        translation: "One who performs selfless service without desire for reward attains the Sovereign Divine.",
        reflection: "True Seva leaves institutions stronger and more independent than we found them.",
      },
    },
  ];
}

function buildHistoryCrossroadsFallback(
  ageGroup: LearnerAgeGroup,
  level: LearnerKnowledgeLevel
): GeneratedScenarioItem[] {
  const isAdvanced = level === "advanced" || ageGroup === "adults-seniors";
  return [
    {
      id: "hc-1",
      contextTag: isAdvanced ? "1604 • Institutional Architecture" : "1604 • Amritsar",
      title: "Compiling & Installing the Adi Granth",
      scenario:
        isAdvanced
          ? "As Guru Arjan Dev Ji compiles the Adi Granth at Ramsar Sarovar, sectarian pressures urge restricting scripture to a single regional caste or Sanskritic elite. How should the canon be structured?"
          : "Guru Arjan Dev Ji is gathering sacred hymns into one eternal scripture at Amritsar. Some people argue only one region's or background's writings should be included. What principle should guide the compilation?",
      options: [
        {
          label:
            "Include hymns of the Gurus alongside Bhagats and Sufis of diverse backgrounds—arranged by 31 classical Raags in accessible Gurmukhi.",
          outcome:
            "Sri Guru Granth Sahib Ji becomes a universal sanctuary of Divine Truth, transcending caste, creed, and regional barriers forever.",
          alignment: "gurmat-aligned",
        },
        {
          label: "Restrict the text to a small scholarly circle to prevent misinterpretation.",
          outcome:
            "Restricting access contradicts Guru Nanak Dev Ji's mission of universal spiritual literacy.",
          alignment: "cautionary",
        },
        {
          label: "Keep the hymns scattered across oral traditions without an authoritative volume.",
          outcome:
            "Without an authenticated Granth, forged verses (Kachi Bani) threatened to dilute authentic Gurbani.",
          alignment: "reflective",
        },
      ],
      panktiReflection: {
        gurmukhi: "ਅਵਲਿ ਅਲਹ ਨੂਰੁ ਉਪਾਇਆ ਕੁਦਰਤਿ ਕੇ ਸਭ ਬੰਦੇ ॥",
        transliteration: "Avali Alah nooru upaaiaa kudarati ke sabh bande ||",
        translation: "First, the Divine created the Light; from that One Nature, all beings are born.",
        reflection: "Inclusivity rooted in Truth gave Sikhi an incorruptible, universal scriptural anchor.",
      },
    },
    {
      id: "hc-2",
      contextTag: isAdvanced ? "1675 • Constitutional Conscience" : "1675 • Anandpur & Delhi",
      title: "The Plea of the Kashmiri Pandits",
      scenario:
        "A delegation of Kashmiri Pandits arrives at Anandpur Sahib seeking protection from forced religious conversion. Their rituals differ from Sikh practice, and confronting imperial power risks mortal danger.",
      options: [
        {
          label: "Stand unequivocally for their freedom of conscience—even at the cost of supreme personal sacrifice.",
          outcome:
            "Guru Tegh Bahadur Ji's martyrdom at Chandni Chowk establishes a world-historic precedent: defending another community's right to believe freely.",
          alignment: "gurmat-aligned",
        },
        {
          label: "Offer quiet sympathy from afar while avoiding imperial confrontation.",
          outcome:
            "Neutrality in the face of systemic coercion leaves the vulnerable defenseless.",
          alignment: "cautionary",
        },
        {
          label: "Assist them only if they adopt Sikh practices first.",
          outcome:
            "Conditional solidarity violates the core Gurmat ethic of universal human dignity.",
          alignment: "cautionary",
        },
      ],
      panktiReflection: {
        gurmukhi: "ਤਿਲਕ ਜੰਞੂ ਰਾਖਾ ਪ੍ਰਭ ਤਾ ਕਾ ॥ ਕੀਨੋ ਬਡੋ ਕਲੂ ਮਹਿ ਸਾਕਾ ॥",
        transliteration: "Tilak janjoo raakhaa Prabh taa kaa || Keeno bado kaloo mahi saakaa ||",
        translation: "He protected their sacred marks and thread; in this dark age, He performed an unequaled heroic deed.",
        reflection: "True spiritual sovereignty defends the conscience of others as fiercely as one's own.",
      },
    },
    {
      id: "hc-3",
      contextTag: isAdvanced ? "1705 • Moral Leadership at Muktsar" : "1705 • Khidrana (Muktsar)",
      title: "Mai Bhago Ji & The Forty Returning Singhs",
      scenario:
        "During the grueling siege of Anandpur Sahib, forty exhausted warriors sign a disclaimer (Bedava) and return home. Mai Bhago Ji meets them in Majha as imperial forces advance toward Guru Gobind Singh Ji.",
      options: [
        {
          label: "Challenge their conscience with fearless dignity, rally them back to duty, and lead them personally to Khidrana.",
          outcome:
            "The Chali Mukte (Forty Liberated Ones) fight heroically alongside Mai Bhago Ji, and Guru Gobind Singh Ji tears up the Bedava in loving forgiveness.",
          alignment: "gurmat-aligned",
        },
        {
          label: "Condemn them permanently with no path back to redemption.",
          outcome:
            "Permanent shaming closes the door on transformation—Mai Bhago Ji combined fierce accountability with belief in their courage.",
          alignment: "reflective",
        },
        {
          label: "Accept defeat and advise everyone to disperse into hiding.",
          outcome:
            "Surrendering to despair would have left the Panth without its rallying symbol of redemption and resilience.",
          alignment: "cautionary",
        },
      ],
      panktiReflection: {
        gurmukhi: "ਸੂਰਾ ਸੋ ਪਹਿਚਾਨੀਐ ਜੁ ਲਰੈ ਦੀਨ ਕੇ ਹੇਤ ॥",
        transliteration: "Sooraa so pahichaaneeai ju larai deen ke het ||",
        translation: "Recognize that one as a true spiritual hero who stands up for the downtrodden.",
        reflection: "Courageous leadership calls out the highest potential in others and walks beside them into the storm.",
      },
    },
  ];
}

export function buildFallbackPayload(
  gameType: GameType,
  ageGroup: LearnerAgeGroup,
  knowledgeLevel: LearnerKnowledgeLevel,
  seed: number
): {
  pairs?: GeneratedMatchPair[];
  questions?: GeneratedQuizQuestion[];
  scenarios?: GeneratedScenarioItem[];
} {
  switch (gameType) {
    case "gurmukhi":
      return { pairs: rotateArray(GURMUKHI_FALLBACK, seed) };
    case "concepts":
      return { pairs: rotateArray(CONCEPTS_FALLBACK, seed) };
    case "raag-pehar":
      return {
        pairs: rotateArray(RAAG_PEHAR_FALLBACK[knowledgeLevel], seed),
      };
    case "pankti-decoder":
      return {
        pairs: rotateArray(PANKTI_DECODER_FALLBACK[knowledgeLevel], seed),
      };
    case "gurbani-synthesis":
      return { pairs: rotateArray(GURBANI_SYNTHESIS_FALLBACK, seed) };
    case "history":
      return { questions: rotateArray(HISTORY_BEGINNER_FALLBACK, seed) };
    case "puratan-analysis":
      return { questions: rotateArray(PURATAN_ANALYSIS_FALLBACK, seed) };
    case "chardi-kala-sprint":
      return {
        questions: buildChardiKalaSprintFallback(ageGroup, knowledgeLevel),
      };
    case "gurmat-action":
      return {
        scenarios: rotateArray(
          buildGurmatActionFallback(ageGroup, knowledgeLevel),
          seed
        ),
      };
    case "history-crossroads":
      return {
        scenarios: rotateArray(
          buildHistoryCrossroadsFallback(ageGroup, knowledgeLevel),
          seed
        ),
      };
  }
}
