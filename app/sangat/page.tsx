"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/components/auth-provider";
import { ChitrakariCardHeader } from "@/components/chitrakari-card-header";
import {
  SikhHeritageAvatar,
  ProfileStudioModal,
  PublicResearcherProfileModal,
  DEFAULT_SANGAT_PROFILE,
  type SangatUserProfile,
  type AvatarPresetId,
  type PublishedSummaryItem,
} from "@/components/sangat/profile-studio-modal";

type BlogTopicTag =
  | "Gurbani Research"
  | "Sikh History"
  | "Personal Journey"
  | "Philosophy";

type ThreadedComment = {
  id: string;
  authorName: string;
  authorHandle: string;
  authorRole: string;
  authorAvatarPreset: AvatarPresetId;
  authorCustomAvatar?: string | null;
  body: string;
  createdAt: string;
  likes: number;
  replies: {
    id: string;
    authorName: string;
    authorHandle: string;
    authorRole: string;
    authorAvatarPreset: AvatarPresetId;
    body: string;
    createdAt: string;
  }[];
};

type SangatBlogArticle = {
  id: string;
  authorName: string;
  authorHandle: string;
  authorRole: string;
  authorBio: string;
  authorInterests: string[];
  authorAvatarPreset: AvatarPresetId;
  authorCustomAvatar?: string | null;
  title: string;
  subtitle: string;
  gurmukhiHeader: string;
  topicTag: BlogTopicTag;
  readingTime: string;
  createdAt: string;
  pullQuote: string;
  paragraphs: string[];
  likesCount: number;
  comments: ThreadedComment[];
  isUserCreated?: boolean;
};

type PinCategory =
  | "Sikh Art & Miniature"
  | "Gurmukhi Calligraphy"
  | "Historical Photography"
  | "Gurdwara Architecture"
  | "Manuscript & Book Quotes";

type SangatVisualPin = {
  id: string;
  authorName: string;
  authorHandle: string;
  authorRole: string;
  authorBio: string;
  authorInterests: string[];
  authorAvatarPreset: AvatarPresetId;
  authorCustomAvatar?: string | null;
  title: string;
  description: string;
  category: PinCategory;
  gurmukhiCalligraphy: string;
  visualPalette: "darbar-gold" | "amrit-indigo" | "saffron-dawn" | "emerald-manuscript";
  imageDataUrl?: string | null;
  availableToCoordinate: boolean;
  artistContactNote: string;
  savesCount: number;
  createdAt: string;
  isUserCreated?: boolean;
};

type DilMoodTag =
  | "🌱 Seeking Strength / In Pain"
  | "✨ Sharing Happiness / Gratitude"
  | "📚 Researcher Note"
  | "🤝 Sangat Advice";

type DilSupportReply = {
  id: string;
  authorName: string;
  authorHandle: string;
  authorRole: string;
  authorAvatarPreset: AvatarPresetId;
  body: string;
  shabadGurmukhi?: string;
  shabadEnglish?: string;
  shabadAng?: string;
  createdAt: string;
};

type DilDiBaatPost = {
  id: string;
  authorName: string;
  authorHandle: string;
  authorRole: string;
  authorBio: string;
  authorInterests: string[];
  authorAvatarPreset: AvatarPresetId;
  authorCustomAvatar?: string | null;
  moodTag: DilMoodTag;
  title: string;
  body: string;
  shabadGurmukhi: string;
  shabadEnglish: string;
  shabadAng: string;
  ardasCount: number;
  createdAt: string;
  replies: DilSupportReply[];
  isUserCreated?: boolean;
};

const UPLIFTING_SHABADS_LIBRARY = [
  {
    label: "Ang 628 • Raag Sorath M:5 (Tati Vao Na Lagai)",
    gurmukhi: "ਤਾਤੀ ਵਾਉ ਨ ਲਗਈ ਪਾਰਬ੍ਰਹਮ ਸਰਣਾਈ ॥ ਚਉਗਿਰਦ ਹਮਾਰੈ ਰਾਮ ਕਾਰ ਦੁਖੁ ਲਗੈ ਨ ਭਾਈ ॥੧॥",
    english:
      "Not even a hot wind touches one who takes shelter in the Supreme Lord; all around us is the Divine Circle of Protection—pain cannot overwhelm us, O Siblings of Destiny.",
    ang: "Sri Guru Granth Sahib Ji • Ang 628",
  },
  {
    label: "Ang 1366 • Salok Kabir Ji (Kabeer Jis Marne Te Jag Darai)",
    gurmukhi: "ਕਬੀਰ ਜਿਸੁ ਮਰਨੇ ਤੇ ਜਗੁ ਡਰੈ ਮੇਰੇ ਮਨਿ ਆਨੰਦੁ ॥ ਮਰਨੇ ਹੀ ਤੇ ਪਾਈਐ ਪੂਰਨੁ ਪਰਮਾਨੰਦੁ ॥",
    english:
      "Kabeer, that dissolution of ego which the world fears brings bliss to my mind; only by dissolving self-will does one merge into Supreme Bliss.",
    ang: "Sri Guru Granth Sahib Ji • Ang 1366",
  },
  {
    label: "Ang 457 • Raag Asa M:5 (Tu Mera Pita Tu Hai Mera Mata)",
    gurmukhi: "ਤੂੰ ਮੇਰਾ ਪਿਤਾ ਤੂੰਹੈ ਮੇਰਾ ਮਾਤਾ ॥ ਤੂੰ ਮੇਰਾ ਬੰਧਪੁ ਤੂੰ ਮੇਰਾ ਭ੍ਰਾਤਾ ॥ ਤੂੰ ਮੇਰਾ ਰਾਖਾ ਸਭਨੀ ਥਾਈ ਤਾ ਭਉ ਕੇਹਾ ਕਾੜਾ ਜੀਉ ॥੧॥",
    english:
      "You are my Father, and You are my Mother; You are my Relative, and You are my Brother. When You are my Protector everywhere, what fear or anxiety can touch me?",
    ang: "Sri Guru Granth Sahib Ji • Ang 457",
  },
  {
    label: "Ang 962 • Raag Ramkali M:5 (Jis Ke Sir Upar Tu Swami)",
    gurmukhi: "ਜਿਸ ਕੇ ਸਿਰ ਊਪਰਿ ਤੂੰ ਸੁਆਮੀ ਸੋ ਦੁਖੁ ਕੈਸਾ ਪਾਵੈ ॥",
    english:
      "One above whose head You stand, O Sovereign Lord—how could sorrow ever overpower them?",
    ang: "Sri Guru Granth Sahib Ji • Ang 962",
  },
];

const INITIAL_BLOGS: SangatBlogArticle[] = [
  {
    id: "blog-viyakaran-sahib-singh",
    authorName: "Dr. Gurpreet Kaur Sandhu",
    authorHandle: "gurpreet_viyakaran",
    authorRole: "Independent Sikh Researcher",
    authorBio:
      "Researcher of Gurbani Viyakaran (classical morphology), Puratan Larivaar manuscripts, and the exegetical legacy of Prof. Sahib Singh Ji.",
    authorInterests: ["Gurbani Research", "Larivaar Santhiya", "Suraj Prakash & Panth Prakash"],
    authorAvatarPreset: "parchment-quill",
    title: "How One Sihari & Aunkar Transforms the Meaning of Mool Mantar",
    subtitle:
      "A closer look at Prof. Sahib Singh Ji's Sri Guru Granth Sahib Darpan and why Gurbani grammar protects us from arbitrary translations.",
    gurmukhiHeader: "ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ ਅਕਾਲ ਮੂਰਤਿ ਅਜੂਨੀ ਸੈਭੰ ਗੁਰ ਪ੍ਰਸਾਦਿ ॥",
    topicTag: "Gurbani Research",
    readingTime: "6 min read",
    createdAt: "Nov 14, 2026",
    pullQuote:
      "In Gurbani grammar, vowel markers are never decorative—an Aunkar (ੁ) marks a singular subject, while a Sihari (ਿ) on 'ਪ੍ਰਸਾਦਿ' reveals the instrumental path: 'realized through the Guru's Grace.'",
    paragraphs: [
      "When we read Sri Guru Granth Sahib Ji in Puratan Larivaar or modern Padchhed, it is easy for a casual English reader to assume that Gurmukhi vowel endings work like modern spoken Punjabi. Yet the Gurus composed Gurbani using a precise morphological system where every final Aunkar (ੁ) and Sihari (ਿ) carries grammatical case.",
      "In Volume 1 of Sri Guru Granth Sahib Darpan, Prof. Sahib Singh Ji demonstrates why 'ਸਤਿ ਨਾਮੁ' has an Aunkar beneath the মাম (mamma) of 'ਨਾਮੁ': it designates a masculine singular noun in the nominative case ('Whose Eternal Name is Truth'). Similarly, 'ਕਰਤਾ ਪੁਰਖੁ', 'ਨਿਰਭਉ', and 'ਨਿਰਵੈਰੁ' all carry singular nominative endings pointing back to the One Creator (ੴ).",
      "Contrast this with the concluding word of the Mool Mantar: 'ਗੁਰ ਪ੍ਰਸਾਦਿ' (Gur Prasaadi). Here, the দੱਦਾ (dadda) carries a Sihari (ਿ) rather than an Aunkar. In Gurbani Viyakaran, this Sihari marks the Karan Karaka (instrumental case)—meaning 'by means of, or through, the Guru's Grace.' Understanding this single vowel marker transforms theology from passive belief into active relationship with the Satguru.",
    ],
    likesCount: 48,
    comments: [
      {
        id: "c-1",
        authorName: "Bhai Harjinder Singh",
        authorHandle: "harjinder_santhiya",
        authorRole: "Gurbani Learner",
        authorAvatarPreset: "ik-onkar-medallion",
        body: "Waheguru Ji! Comparing 'ਪ੍ਰਸਾਦੁ' (blessed gift, nominative) with 'ਪ੍ਰਸਾਦਿ' (by Grace, instrumental) was the single biggest breakthrough in my daily Nitnem contemplation.",
        createdAt: "2 hours ago",
        likes: 14,
        replies: [
          {
            id: "c-1-r1",
            authorName: "Dr. Gurpreet Kaur Sandhu",
            authorHandle: "gurpreet_viyakaran",
            authorRole: "Independent Sikh Researcher",
            authorAvatarPreset: "parchment-quill",
            body: "Spot on, Veer Ji! Once you see how 'ਭੰਡਿ' (in woman) vs 'ਭੰਡਹੁ' (from woman) works on Ang 473 as well, every Shabad opens up like a lotus.",
            createdAt: "1 hour ago",
          },
        ],
      },
    ],
  },
  {
    id: "blog-panth-prakash-sovereignty",
    authorName: "Sardar Karamjit Singh Bhangu",
    authorHandle: "karamjit_itihaas",
    authorRole: "Itihaas Archivist",
    authorBio:
      "Archivist studying 18th-century Khalsa Misl chronicles, Sri Gur Panth Prakash (1841), and oral histories of the Lakhi Jungle.",
    authorInterests: ["Sikh History", "Suraj Prakash & Panth Prakash", "Matriarchs of the Panth"],
    authorAvatarPreset: "khanda-crest",
    title: "Why Shaheed Bhai Rattan Singh Bhangu Wrote Sri Gur Panth Prakash in 1841",
    subtitle:
      "When British East India Company officers demanded to know what earthly emperor granted Sikhs the right to rule, Bhangu answered with the Guru's Patshahi.",
    gurmukhiHeader: "ਸਿੰਘਨ ਕੀ ਪਾਤਸ਼ਾਹੀ ਸਾਚੀ । ਸਤਿਗੁਰਿ ਆਪੁ ਸਿੰਘਨ ਕਉ ਦੀਨੀ ॥",
    topicTag: "Sikh History",
    readingTime: "8 min read",
    createdAt: "Nov 12, 2026",
    pullQuote:
      "Khalsa sovereignty was never a feudal grant from Delhi or London; it was bestowed directly by Guru Nanak – Guru Gobind Singh Ji and defended in the saddle.",
    paragraphs: [
      "In the early 1800s, Captain William Murray—the British East India Company's political agent at Ambala—commissioned Persian court munshis to write a history of the Sikhs. Those court scribes, trained in imperial Mughal categories, portrayed the Khalsa as mere rebels who had seized territory without royal sanction.",
      "Hearing this distortion, Bhai Rattan Singh Bhangu—the grandson of Shaheed Bhai Mehtab Singh Ji (who liberated Sri Harmandir Sahib from Massa Ranghar in 1740) and maternal grandson of Sardar Shyam Singh Karorsinghia—sat down with Captain Murray in Ludhiana to record the Panth's own testimony.",
      "Across 81 vivid episodes, Sri Gur Panth Prakash documents how Guru Gobind Singh Ji vested true Patshahi (sovereign self-rule) in the collective Khalsa Panth at Sri Anandpur Sahib in 1699, and how two Singhs like Bhai Bota Singh and Bhai Garja Singh could stand on the Grand Trunk Road and embody an unbroken sovereign state.",
    ],
    likesCount: 63,
    comments: [
      {
        id: "c-2",
        authorName: "Simranjit Kaur",
        authorHandle: "simran_research",
        authorRole: "Sangat Member",
        authorAvatarPreset: "lotus-amritsar",
        body: "Reading Episode 78 on Bhai Bota Singh and Bhai Garja Singh in the Granth BookReader here on Learn Sikhi gave me goosebumps. Thank you for contextualizing why Bhangu wrote it!",
        createdAt: "Yesterday",
        likes: 19,
        replies: [],
      },
    ],
  },
  {
    id: "blog-tanti-saaj-rabab-dilruba",
    authorName: "UstadManreet Singh Ragi",
    authorHandle: "manreet_tantisaaj",
    authorRole: "Raag & Tanti Saaj Student",
    authorBio:
      "Student of Gurmat Sangeet Pracheen Reet Ratnavli, practicing Dilruba, Taus, and classical Partaal compositions.",
    authorInterests: ["Puratan Kirtan", "Sikh History", "Gurbani Research"],
    authorAvatarPreset: "rabab-scholar",
    title: "The Spiritual Physics of Tanti Saaj: Why the Gurus Designed the Rabab, Saranda & Taus",
    subtitle:
      "How bowed and plucked string instruments mirror the natural microtones (Shrutis) of the human voice in Raag Kirtan.",
    gurmukhiHeader: "ਧੰਨੁ ਸੁ ਰਾਗ ਸੁਰੰਗੜੇ ਆਲਾਪਤ ਸਭ ਤਿਖ ਜਾਇ ॥ (ਅੰਗ ੯੫੮)",
    topicTag: "Philosophy",
    readingTime: "5 min read",
    createdAt: "Nov 10, 2026",
    pullQuote:
      "Unlike fixed-reed instruments introduced during the colonial era, the fretless glide (Meend) of the Saranda, Dilruba, and Taus breathes with the human soul.",
    paragraphs: [
      "From the very first Udasi of Guru Nanak Dev Ji alongside Bhai Mardana Ji and his six-stringed Rabab, Gurmat Sangeet was inseparable from Tanti Saaj (stringed instruments). Later, Guru Arjan Dev Ji shaped the resonant Saranda, and Guru Hargobind Sahib Ji and Guru Gobind Singh Ji blessed the Taus and Dilruba.",
      "Why did the Gurus place such emphasis on bowed and plucked strings? In the 31 primary Raags and 31 Raag-forms of Sri Guru Granth Sahib Ji, emotional depth (Rasa) lives in the delicate microtonal intervals between fixed notes—the Meend (glide) and Gamak.",
      "When Bhai Avtar Singh Ji and Bhai Gurcharan Singh Ji published Gurbani Sangeet Pracheen Reet Ratnavli in 1979, they preserved nearly 500 centuries-old Shabad Reets passed down across eleven generations. Reviving these instruments in our Gurdwaras and homes reconnects us to the acoustic sanctuary of the Gurus' court.",
    ],
    likesCount: 41,
    comments: [],
  },
];

const INITIAL_PINS: SangatVisualPin[] = [
  {
    id: "pin-1",
    authorName: "Bibi Amrit Kaur",
    authorHandle: "amrit_kalam",
    authorRole: "Visual Artist",
    authorBio: "Gurmukhi calligrapher and manuscript illuminator working with natural indigo, walnut ink, and 24k gold leaf.",
    authorInterests: ["Gurmukhi Calligraphy", "Puratan Kirtan"],
    authorAvatarPreset: "lotus-amritsar",
    title: "Puratan Larivaar Mul Mantar Folio in Gold & Indigo",
    description:
      "Hand-lettered study inspired by 17th-century Damdami Bir manuscripts, featuring geometric floral Phulkari borders and unbroken Gurmukhi script.",
    category: "Gurmukhi Calligraphy",
    gurmukhiCalligraphy: "ੴ ਸਤਿ ਨਾਮੁ ਕਰਤਾ ਪੁਰਖੁ ਨਿਰਭਉ ਨਿਰਵੈਰੁ",
    visualPalette: "darbar-gold",
    availableToCoordinate: true,
    artistContactNote:
      "Original hand-illuminated cotton rag folio (12×16 in). Reach out via @amrit_kalam or email amrit.kalam.art@sangat.org to coordinate framing or Gurdwara gifting.",
    savesCount: 92,
    createdAt: "2 days ago",
  },
  {
    id: "pin-2",
    authorName: "Sardar Zorawar Singh",
    authorHandle: "zorawar_lens",
    authorRole: "Itihaas Archivist",
    authorBio: "Architectural photographer documenting historical Gurdwaras, Bungas, and Baradaris across Punjab.",
    authorInterests: ["Sikh Architecture", "Sikh History"],
    authorAvatarPreset: "darbar-lantern",
    title: "Amrit Vela Reflection at Sachkhand Sri Harmandir Sahib",
    description:
      "At 3:40 AM IST during Asa Di Vaar, the golden dome of Sri Darbar Sahib shimmers across the still waters of the Amrit Sarovar—a living architectural metaphor for the lotus untouched by the world.",
    category: "Gurdwara Architecture",
    gurmukhiCalligraphy: "ਡਿਠੇ ਸਭੇ ਥਾਵ ਨਹੀ ਤੁਧੁ ਜੇਹਿਆ ॥ (ਅੰਗ ੧੩੬੨)",
    visualPalette: "amrit-indigo",
    availableToCoordinate: false,
    artistContactNote: "",
    savesCount: 134,
    createdAt: "4 days ago",
  },
  {
    id: "pin-3",
    authorName: "Simranjit Kaur",
    authorHandle: "simran_miniature",
    authorRole: "Visual Artist",
    authorBio: "Contemporary Pahari-Sikh miniature painter honoring the women and warriors of the Panth.",
    authorInterests: ["Matriarchs of the Panth", "Sikh Art & Miniature"],
    authorAvatarPreset: "nihang-shield",
    title: "Mata Bhag Kaur (Mai Bhago Ji) at the Dhab of Khidrana (1705)",
    description:
      "Gouache and mineral pigment study depicting Mai Bhago Ji leading the Chali Mukte in defense of Guru Gobind Singh Ji at Sri Muktsar Sahib.",
    category: "Sikh Art & Miniature",
    gurmukhiCalligraphy: "ਸੂਰਾ ਸੋ ਪਹਿਚਾਨੀਐ ਜੁ ਲਰੈ ਦੀਨ ਕੇ ਹੇਤ ॥",
    visualPalette: "saffron-dawn",
    availableToCoordinate: true,
    artistContactNote:
      "Archival giclée prints and original mineral-pigment study available for Sikh heritage collections. Coordinate via @simran_miniature.",
    savesCount: 118,
    createdAt: "5 days ago",
  },
  {
    id: "pin-4",
    authorName: "Dr. Gurpreet Kaur Sandhu",
    authorHandle: "gurpreet_viyakaran",
    authorRole: "Independent Sikh Researcher",
    authorBio: "Researcher of Gurbani Viyakaran and classical Sikh manuscripts.",
    authorInterests: ["Gurbani Research", "Suraj Prakash & Panth Prakash"],
    authorAvatarPreset: "parchment-quill",
    title: "Bhai Gurdas Ji Vaar 1: The Tree That Bears Fruit When Struck by Stones",
    description:
      "Calligraphic study of Vaar 6, Pauri 19: 'ਵਿਰਲੇ ਕੇਈ ਗੁਰਮੁਖਿ ਜਾਣਨਿ । ਵੱਟੇ ਮਾਰਨਿ ਫਲੁ ਦੇਨਿ, ਪਰਉਪਕਾਰੀ ਸਤਿਗੁਰੁ ਭਾਵਨਿ ॥'",
    category: "Manuscript & Book Quotes",
    gurmukhiCalligraphy: "ਵੱਟੇ ਮਾਰਨਿ ਫਲੁ ਦੇਨਿ ਪਰਉਪਕਾਰੀ ਸਤਿਗੁਰੁ ਭਾਵਨਿ ॥",
    visualPalette: "emerald-manuscript",
    availableToCoordinate: false,
    artistContactNote: "",
    savesCount: 77,
    createdAt: "1 week ago",
  },
];

const INITIAL_DIL_POSTS: DilDiBaatPost[] = [
  {
    id: "dil-1",
    authorName: "Jasleen Kaur",
    authorHandle: "jasleen_sangat",
    authorRole: "Sangat Member",
    authorBio: "University student learning Nitnem and finding anchor in Sadh Sangat.",
    authorInterests: ["Gurbani Research", "Seva & Ecology"],
    authorAvatarPreset: "darbar-lantern",
    moodTag: "🌱 Seeking Strength / In Pain",
    title: "Walking through the grief of losing my grandfather who taught me Japji Sahib",
    body: "My Baba Ji was the one who sat with me every morning at 6 AM and taught me the pronunciation of every Pauri of Japji Sahib. Since his passing last month, opening my Gutka Sahib brings tears to my eyes, yet I also feel closest to him when I recite. Please keep our family in your Ardas.",
    shabadGurmukhi: "ਜੋਤਿ ਮਿਲੀ ਸੰਗਿ ਜੋਤਿ ਰਹਿਆ ਘਾਲਿਆ ॥ ਸੂਰਜ ਕਿਰਣਿ ਮਿਲੇ ਜਲ ਕਾ ਜਲੁ ਹੂਆ ਰਾਮ ॥",
    shabadEnglish:
      "One's light merges into the Supreme Light, and all struggles come to rest—like the ray of sunlight merging back into the sun, and the droplet merging into the ocean.",
    shabadAng: "Sri Guru Granth Sahib Ji • Ang 846 (Raag Bilawal M:5)",
    ardasCount: 54,
    createdAt: "5 hours ago",
    replies: [
      {
        id: "dr-1",
        authorName: "Bhai Harjinder Singh",
        authorHandle: "harjinder_santhiya",
        authorRole: "Gurbani Learner",
        authorAvatarPreset: "ik-onkar-medallion",
        body: "Bhenji, every time you recite those Pauris of Japji Sahib, your Baba Ji's Seva and love are alive in your voice. Our whole Sangat stands in Ardas for his Gurmukh soul and your family's Chardi Kala.",
        shabadGurmukhi: "ਤਾਤੀ ਵਾਉ ਨ ਲਗਈ ਪਾਰਬ੍ਰਹਮ ਸਰਣਾਈ ॥",
        shabadEnglish: "Not even a hot wind touches one who abides in the Sanctuary of the Supreme Lord.",
        shabadAng: "Ang 628",
        createdAt: "3 hours ago",
      },
    ],
  },
  {
    id: "dil-2",
    authorName: "Prabhjot Singh",
    authorHandle: "prabhjot_raag",
    authorRole: "Gurbani Learner",
    authorBio: "Software engineer & father teaching Painti Akhar to my kids.",
    authorInterests: ["Gurmukhi Calligraphy", "Puratan Kirtan"],
    authorAvatarPreset: "sovereign-baaj",
    moodTag: "✨ Sharing Happiness / Gratitude",
    title: "My 7-year-old daughter read her first complete Hukamnama in Gurmukhi today!",
    body: "After six months of practicing the 35 Painti Akhar and Larivaar word-splitting games together for 15 minutes every evening, she stood up after our family Rehras Sahib today and read the Pangtis cleanly on her own. Shukar Waheguru Ji!",
    shabadGurmukhi: "ਪੀਊ ਦਾਦੇ ਕਾ ਖੋਲਿ ਡਿਠਾ ਖਜਾਨਾ ॥ ਤਾ ਮੇਰੈ ਮਨਿ ਭਇਆ ਨਿਧਾਨਾ ॥੧॥",
    shabadEnglish:
      "When I opened and beheld the treasury of my Father and Grandfather, my mind was filled with the priceless spiritual treasure.",
    shabadAng: "Sri Guru Granth Sahib Ji • Ang 186 (Raag Gauri M:5)",
    ardasCount: 89,
    createdAt: "1 day ago",
    replies: [
      {
        id: "dr-2",
        authorName: "Dr. Gurpreet Kaur Sandhu",
        authorHandle: "gurpreet_viyakaran",
        authorRole: "Independent Sikh Researcher",
        authorAvatarPreset: "parchment-quill",
        body: "Lakh Lakh Vadhaiyan Veer Ji! Opening the 'Peeo Daade Ka Khajana' (the treasury of our ancestors) for the next generation is the greatest gift we can give.",
        createdAt: "20 hours ago",
      },
    ],
  },
];

const STORAGE_KEYS = {
  PROFILE: "learnsikhi_sangat_profile_v1",
  BLOGS: "learnsikhi_sangat_blogs_v1",
  PINS: "learnsikhi_sangat_pins_v1",
  SAVED_PIN_IDS: "learnsikhi_sangat_saved_pins_v1",
  DIL_POSTS: "learnsikhi_sangat_dil_posts_v1",
};

function SangatHubContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeMode, setActiveMode] = useState<"blogs" | "pins" | "dil">("blogs");

  // User Profile Studio State
  const [profile, setProfile] = useState<SangatUserProfile>(DEFAULT_SANGAT_PROFILE);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [inspectedAuthor, setInspectedAuthor] = useState<{
    name: string;
    handle: string;
    role: string;
    bio: string;
    avatarPreset: AvatarPresetId | string;
    customAvatar?: string | null;
    interests: string[];
    contributionsCount: number;
  } | null>(null);

  // Strict Auth Gate Modal State
  const [authGateActionLabel, setAuthGateActionLabel] = useState<string | null>(
    null
  );

  // Mode 1: Substack Blogs State
  const [blogs, setBlogs] = useState<SangatBlogArticle[]>(INITIAL_BLOGS);
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [activeBlogId, setActiveBlogId] = useState<string | null>(null);
  const [isBlogComposerOpen, setIsBlogComposerOpen] = useState(false);
  const [likedBlogIds, setLikedBlogIds] = useState<string[]>([]);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(
    null
  );
  const [replyCommentInput, setReplyCommentInput] = useState("");

  // Blog Composer Inputs
  const [newBlogTitle, setNewBlogTitle] = useState("");
  const [newBlogSubtitle, setNewBlogSubtitle] = useState("");
  const [newBlogGurmukhi, setNewBlogGurmukhi] = useState("");
  const [newBlogTopic, setNewBlogTopic] =
    useState<BlogTopicTag>("Gurbani Research");
  const [newBlogPullQuote, setNewBlogPullQuote] = useState("");
  const [newBlogBody, setNewBlogBody] = useState("");

  // Mode 2: SikhInterest Visual Pinboard State
  const [pins, setPins] = useState<SangatVisualPin[]>(INITIAL_PINS);
  const [selectedPinCategory, setSelectedPinCategory] = useState<string>("All");
  const [savedPinIds, setSavedPinIds] = useState<string[]>([]);
  const [isPinComposerOpen, setIsPinComposerOpen] = useState(false);
  const [coordinatingPin, setCoordinatingPin] =
    useState<SangatVisualPin | null>(null);

  // Pin Composer Inputs
  const [newPinTitle, setNewPinTitle] = useState("");
  const [newPinDesc, setNewPinDesc] = useState("");
  const [newPinCat, setNewPinCat] = useState<PinCategory>("Gurmukhi Calligraphy");
  const [newPinCalligraphy, setNewPinCalligraphy] = useState("");
  const [newPinPalette, setNewPinPalette] = useState<
    "darbar-gold" | "amrit-indigo" | "saffron-dawn" | "emerald-manuscript"
  >("darbar-gold");
  const [newPinImageDataUrl, setNewPinImageDataUrl] = useState<string | null>(
    null
  );
  const [newPinAvailable, setNewPinAvailable] = useState(false);
  const [newPinContactNote, setNewPinContactNote] = useState("");

  // Mode 3: Dil Di Baat State
  const [dilPosts, setDilPosts] = useState<DilDiBaatPost[]>(INITIAL_DIL_POSTS);
  const [selectedMoodFilter, setSelectedMoodFilter] = useState<string>("All");
  const [isDilComposerOpen, setIsDilComposerOpen] = useState(false);
  const [replyingDilPostId, setReplyingDilPostId] = useState<string | null>(
    null
  );
  const [dilReplyBody, setDilReplyBody] = useState("");
  const [dilReplyShabadIdx, setDilReplyShabadIdx] = useState<number>(0);

  // Dil Composer Inputs
  const [newDilMood, setNewDilMood] = useState<DilMoodTag>(
    "✨ Sharing Happiness / Gratitude"
  );
  const [newDilTitle, setNewDilTitle] = useState("");
  const [newDilBody, setNewDilBody] = useState("");
  const [newDilShabadIdx, setNewDilShabadIdx] = useState<number>(0);

  // Open Profile Studio if URL has ?studio=1
  useEffect(() => {
    if (searchParams.get("studio") === "1") {
      setIsStudioOpen(true);
    }
  }, [searchParams]);

  // Load persisted state from localStorage
  useEffect(() => {
    try {
      const savedProf = window.localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (savedProf) setProfile(JSON.parse(savedProf));

      const savedBlogs = window.localStorage.getItem(STORAGE_KEYS.BLOGS);
      if (savedBlogs) {
        const parsed = JSON.parse(savedBlogs);
        if (Array.isArray(parsed) && parsed.length > 0) setBlogs(parsed);
      }

      const savedPins = window.localStorage.getItem(STORAGE_KEYS.PINS);
      if (savedPins) {
        const parsed = JSON.parse(savedPins);
        if (Array.isArray(parsed) && parsed.length > 0) setPins(parsed);
      }

      const savedIds = window.localStorage.getItem(STORAGE_KEYS.SAVED_PIN_IDS);
      if (savedIds) setSavedPinIds(JSON.parse(savedIds));

      const savedDil = window.localStorage.getItem(STORAGE_KEYS.DIL_POSTS);
      if (savedDil) {
        const parsed = JSON.parse(savedDil);
        if (Array.isArray(parsed) && parsed.length > 0) setDilPosts(parsed);
      }
    } catch {
      // Ignore storage read errors
    }
  }, []);

  const saveProfileToStorage = (updated: SangatUserProfile) => {
    setProfile(updated);
    try {
      window.localStorage.setItem(
        STORAGE_KEYS.PROFILE,
        JSON.stringify(updated)
      );
    } catch {
      // Ignore quota errors
    }
  };

  /**
   * Strict Authentication Gate helper:
   * Public visitors can browse everything, but publishing or commenting
   * requires a signed-in Supabase user.
   */
  const requireSignedIn = (actionLabel: string, callback: () => void) => {
    if (!user) {
      setAuthGateActionLabel(actionLabel);
      return;
    }
    callback();
  };

  const activeBlog = useMemo(
    () => blogs.find((b) => b.id === activeBlogId) || null,
    [blogs, activeBlogId]
  );

  const filteredBlogs = useMemo(() => {
    if (selectedTopic === "All") return blogs;
    return blogs.filter((b) => b.topicTag === selectedTopic);
  }, [blogs, selectedTopic]);

  const filteredPins = useMemo(() => {
    if (selectedPinCategory === "All") return pins;
    if (selectedPinCategory === "Saved Collection") {
      return pins.filter((p) => savedPinIds.includes(p.id));
    }
    return pins.filter((p) => p.category === selectedPinCategory);
  }, [pins, selectedPinCategory, savedPinIds]);

  const filteredDilPosts = useMemo(() => {
    if (selectedMoodFilter === "All") return dilPosts;
    return dilPosts.filter((d) => d.moodTag === selectedMoodFilter);
  }, [dilPosts, selectedMoodFilter]);

  const publishedItems: PublishedSummaryItem[] = useMemo(() => {
    const items: PublishedSummaryItem[] = [];
    blogs
      .filter((b) => b.isUserCreated || b.authorHandle === profile.handle)
      .forEach((b) =>
        items.push({
          id: b.id,
          type: "blog",
          title: b.title,
          subtitleOrCategory: b.topicTag,
          createdAt: b.createdAt,
          onDelete: (id) => {
            const next = blogs.filter((x) => x.id !== id);
            setBlogs(next);
            window.localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(next));
          },
        })
      );
    pins
      .filter((p) => p.isUserCreated || p.authorHandle === profile.handle)
      .forEach((p) =>
        items.push({
          id: p.id,
          type: "pin",
          title: p.title,
          subtitleOrCategory: p.category,
          createdAt: p.createdAt,
          onDelete: (id) => {
            const next = pins.filter((x) => x.id !== id);
            setPins(next);
            window.localStorage.setItem(STORAGE_KEYS.PINS, JSON.stringify(next));
          },
        })
      );
    dilPosts
      .filter((d) => d.isUserCreated || d.authorHandle === profile.handle)
      .forEach((d) =>
        items.push({
          id: d.id,
          type: "dil",
          title: d.title,
          subtitleOrCategory: d.moodTag,
          createdAt: d.createdAt,
          onDelete: (id) => {
            const next = dilPosts.filter((x) => x.id !== id);
            setDilPosts(next);
            window.localStorage.setItem(
              STORAGE_KEYS.DIL_POSTS,
              JSON.stringify(next)
            );
          },
        })
      );
    return items;
  }, [blogs, pins, dilPosts, profile.handle]);

  // Handlers for Blogs
  const handleToggleLikeBlog = (blogId: string) => {
    const alreadyLiked = likedBlogIds.includes(blogId);
    const nextLiked = alreadyLiked
      ? likedBlogIds.filter((id) => id !== blogId)
      : [...likedBlogIds, blogId];
    setLikedBlogIds(nextLiked);

    const nextBlogs = blogs.map((b) =>
      b.id === blogId
        ? { ...b, likesCount: b.likesCount + (alreadyLiked ? -1 : 1) }
        : b
    );
    setBlogs(nextBlogs);
    try {
      window.localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(nextBlogs));
    } catch {
      // Ignore
    }
  };

  const handleShareBlog = (blog: SangatBlogArticle) => {
    try {
      const shareUrl = `${window.location.origin}/sangat?article=${blog.id}`;
      void navigator.clipboard?.writeText(shareUrl);
      setShareToast(`Copied link to "${blog.title}"!`);
      window.setTimeout(() => setShareToast(null), 3000);
    } catch {
      setShareToast("Article link ready to share!");
      window.setTimeout(() => setShareToast(null), 3000);
    }
  };

  const handlePublishBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlogTitle.trim() || !newBlogBody.trim()) return;
    const paragraphs = newBlogBody
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

    const wordsCount = newBlogBody.trim().split(/\s+/).length;
    const estMinutes = Math.max(2, Math.ceil(wordsCount / 180));

    const created: SangatBlogArticle = {
      id: `blog-${Date.now()}`,
      authorName: profile.displayName,
      authorHandle: profile.handle,
      authorRole: profile.roleBadge,
      authorBio: profile.bio,
      authorInterests: profile.interests,
      authorAvatarPreset: profile.avatarPreset,
      authorCustomAvatar: profile.customAvatarDataUrl,
      title: newBlogTitle.trim(),
      subtitle:
        newBlogSubtitle.trim() ||
        "Published in the SikhInterest & Vichaar Research Sanctuary",
      gurmukhiHeader:
        newBlogGurmukhi.trim() || "ਗੁਰ ਪਰਸਾਦੀ ਵਿਦਿਆ ਵੀਚਾਰੈ ਪੜਿ ਪੜਿ ਪਾਵੈ ਮਾਨੁ ॥",
      topicTag: newBlogTopic,
      readingTime: `${estMinutes} min read`,
      createdAt: "Just now",
      pullQuote: newBlogPullQuote.trim() || paragraphs[0] || "",
      paragraphs,
      likesCount: 1,
      comments: [],
      isUserCreated: true,
    };

    const next = [created, ...blogs];
    setBlogs(next);
    try {
      window.localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(next));
    } catch {
      // Ignore
    }

    setNewBlogTitle("");
    setNewBlogSubtitle("");
    setNewBlogGurmukhi("");
    setNewBlogPullQuote("");
    setNewBlogBody("");
    setIsBlogComposerOpen(false);
    setActiveBlogId(created.id);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBlog) return;
    requireSignedIn("Post a Comment on this Research Essay", () => {
      if (!commentInput.trim()) return;
      const newComment: ThreadedComment = {
        id: `com-${Date.now()}`,
        authorName: profile.displayName,
        authorHandle: profile.handle,
        authorRole: profile.roleBadge,
        authorAvatarPreset: profile.avatarPreset,
        authorCustomAvatar: profile.customAvatarDataUrl,
        body: commentInput.trim(),
        createdAt: "Just now",
        likes: 1,
        replies: [],
      };
      const next = blogs.map((b) =>
        b.id === activeBlog.id
          ? { ...b, comments: [...b.comments, newComment] }
          : b
      );
      setBlogs(next);
      window.localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(next));
      setCommentInput("");
    });
  };

  const handlePostCommentReply = (commentId: string) => {
    if (!activeBlog) return;
    requireSignedIn("Reply to a Comment", () => {
      if (!replyCommentInput.trim()) return;
      const next = blogs.map((b) => {
        if (b.id !== activeBlog.id) return b;
        return {
          ...b,
          comments: b.comments.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  replies: [
                    ...c.replies,
                    {
                      id: `rep-${Date.now()}`,
                      authorName: profile.displayName,
                      authorHandle: profile.handle,
                      authorRole: profile.roleBadge,
                      authorAvatarPreset: profile.avatarPreset,
                      body: replyCommentInput.trim(),
                      createdAt: "Just now",
                    },
                  ],
                }
              : c
          ),
        };
      });
      setBlogs(next);
      window.localStorage.setItem(STORAGE_KEYS.BLOGS, JSON.stringify(next));
      setReplyCommentInput("");
      setReplyingToCommentId(null);
    });
  };

  // Handlers for Pins
  const handleToggleSavePin = (pinId: string) => {
    const isSaved = savedPinIds.includes(pinId);
    const nextSaved = isSaved
      ? savedPinIds.filter((id) => id !== pinId)
      : [...savedPinIds, pinId];
    setSavedPinIds(nextSaved);
    window.localStorage.setItem(
      STORAGE_KEYS.SAVED_PIN_IDS,
      JSON.stringify(nextSaved)
    );

    const nextPins = pins.map((p) =>
      p.id === pinId
        ? { ...p, savesCount: p.savesCount + (isSaved ? -1 : 1) }
        : p
    );
    setPins(nextPins);
    window.localStorage.setItem(STORAGE_KEYS.PINS, JSON.stringify(nextPins));
  };

  const handleCreatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPinTitle.trim() || !newPinDesc.trim()) return;
    const created: SangatVisualPin = {
      id: `pin-${Date.now()}`,
      authorName: profile.displayName,
      authorHandle: profile.handle,
      authorRole: profile.roleBadge,
      authorBio: profile.bio,
      authorInterests: profile.interests,
      authorAvatarPreset: profile.avatarPreset,
      authorCustomAvatar: profile.customAvatarDataUrl,
      title: newPinTitle.trim(),
      description: newPinDesc.trim(),
      category: newPinCat,
      gurmukhiCalligraphy:
        newPinCalligraphy.trim() || "ੴ ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ ॥",
      visualPalette: newPinPalette,
      imageDataUrl: newPinImageDataUrl,
      availableToCoordinate: newPinAvailable,
      artistContactNote:
        newPinContactNote.trim() ||
        `Coordinate directly with @${profile.handle} on SikhInterest.`,
      savesCount: 1,
      createdAt: "Just now",
      isUserCreated: true,
    };
    const next = [created, ...pins];
    setPins(next);
    window.localStorage.setItem(STORAGE_KEYS.PINS, JSON.stringify(next));
    setNewPinTitle("");
    setNewPinDesc("");
    setNewPinCalligraphy("");
    setNewPinImageDataUrl(null);
    setNewPinAvailable(false);
    setNewPinContactNote("");
    setIsPinComposerOpen(false);
  };

  // Handlers for Dil Di Baat
  const handleCreateDilPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDilTitle.trim() || !newDilBody.trim()) return;
    const shabad =
      UPLIFTING_SHABADS_LIBRARY[newDilShabadIdx] ||
      UPLIFTING_SHABADS_LIBRARY[0];

    const created: DilDiBaatPost = {
      id: `dil-${Date.now()}`,
      authorName: profile.displayName,
      authorHandle: profile.handle,
      authorRole: profile.roleBadge,
      authorBio: profile.bio,
      authorInterests: profile.interests,
      authorAvatarPreset: profile.avatarPreset,
      authorCustomAvatar: profile.customAvatarDataUrl,
      moodTag: newDilMood,
      title: newDilTitle.trim(),
      body: newDilBody.trim(),
      shabadGurmukhi: shabad.gurmukhi,
      shabadEnglish: shabad.english,
      shabadAng: shabad.ang,
      ardasCount: 1,
      createdAt: "Just now",
      replies: [],
      isUserCreated: true,
    };

    const next = [created, ...dilPosts];
    setDilPosts(next);
    window.localStorage.setItem(STORAGE_KEYS.DIL_POSTS, JSON.stringify(next));
    setNewDilTitle("");
    setNewDilBody("");
    setIsDilComposerOpen(false);
  };

  const handleOfferArdas = (postId: string) => {
    const next = dilPosts.map((d) =>
      d.id === postId ? { ...d, ardasCount: d.ardasCount + 1 } : d
    );
    setDilPosts(next);
    window.localStorage.setItem(STORAGE_KEYS.DIL_POSTS, JSON.stringify(next));
  };

  const handlePostDilReply = (postId: string) => {
    requireSignedIn("Post a Supportive Reply on Dil Di Baat", () => {
      if (!dilReplyBody.trim()) return;
      const shabad = UPLIFTING_SHABADS_LIBRARY[dilReplyShabadIdx];
      const next = dilPosts.map((d) => {
        if (d.id !== postId) return d;
        return {
          ...d,
          replies: [
            ...d.replies,
            {
              id: `dr-${Date.now()}`,
              authorName: profile.displayName,
              authorHandle: profile.handle,
              authorRole: profile.roleBadge,
              authorAvatarPreset: profile.avatarPreset,
              body: dilReplyBody.trim(),
              shabadGurmukhi: shabad?.gurmukhi,
              shabadEnglish: shabad?.english,
              shabadAng: shabad?.ang,
              createdAt: "Just now",
            },
          ],
        };
      });
      setDilPosts(next);
      window.localStorage.setItem(STORAGE_KEYS.DIL_POSTS, JSON.stringify(next));
      setDilReplyBody("");
      setReplyingDilPostId(null);
    });
  };

  return (
    <div
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
      className="min-h-screen flex flex-col"
    >
      <Header solid />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 pb-28">
        {/* ================================================================
            HERO SANCTUARY BANNER + PROFILE STUDIO LAUNCHER
        ================================================================ */}
        <section
          style={{
            backgroundColor: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
          className="rounded-3xl border-2 border-[#C59B27]/55 p-8 md:p-10 shadow-sm space-y-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#C59B27] px-3 py-1 rounded-full border border-[#C59B27]/40 bg-[#C59B27]/10">
                  SIKHINTEREST &amp; VICHAAR • SUBSTACK + PINTEREST + DIL DI BAAT
                </span>
                <span lang="pa" className="font-gurmukhi text-sm text-[#D97706] font-semibold">
                  ਸੰਗਤ ਵਿਚਾਰ, ਕਲਾ ਅਤੇ ਦਿਲ ਦੀ ਗੱਲ
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight">
                SikhInterest &amp; Vichaar Community Hub
              </h1>
              <p
                style={{ color: "var(--theme-text-muted)" }}
                className="text-sm sm:text-base leading-relaxed"
              >
                Read and publish Substack-style research essays on Gurbani &amp; history,
                curate visual art and calligraphy on our Pinterest-style{" "}
                <strong>SikhInterest</strong> board, or share personal joys, grief, and
                questions in <strong>Dil Di Baat</strong>.
              </p>
            </div>

            {/* Active Researcher Profile Pill + Customize Studio Button */}
            <div
              style={{
                backgroundColor: "var(--theme-card-darker)",
                borderColor: "var(--border-subtle)",
              }}
              className="p-4 rounded-2xl border flex items-center gap-3.5 shrink-0"
            >
              <SikhHeritageAvatar
                preset={profile.avatarPreset}
                customDataUrl={profile.customAvatarDataUrl}
                size="md"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#C59B27] truncate">
                  {profile.roleBadge}
                </p>
                <p className="text-sm font-serif font-bold truncate">
                  {profile.displayName}{" "}
                  <span className="text-xs font-mono font-normal opacity-75">
                    @{profile.handle}
                  </span>
                </p>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setIsStudioOpen(true)}
                    className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-[11px] font-bold uppercase tracking-wider"
                  >
                    🎨 Customize Profile &amp; Avatar
                  </button>
                  {!user && (
                    <Link
                      href="/auth?next=/sangat"
                      className="px-2.5 py-1 rounded-lg border border-[#C59B27]/50 text-[11px] font-bold text-[#C59B27]"
                    >
                      Sign In to Post →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Three Community Mode Tabs + Primary Action Buttons */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4 border-t border-[#C59B27]/25">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveMode("blogs");
                  setActiveBlogId(null);
                }}
                className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition ${
                  activeMode === "blogs"
                    ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] shadow-sm"
                    : "border border-[#C59B27]/35 hover:border-[#C59B27]"
                }`}
              >
                ੧ · Substack Research &amp; Vichaar Blogs ({blogs.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveMode("pins")}
                className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition ${
                  activeMode === "pins"
                    ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] shadow-sm"
                    : "border border-[#C59B27]/35 hover:border-[#C59B27]"
                }`}
              >
                ੨ · SikhInterest Visual Pinboard ({pins.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveMode("dil")}
                className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition ${
                  activeMode === "dil"
                    ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] shadow-sm"
                    : "border border-[#C59B27]/35 hover:border-[#C59B27]"
                }`}
              >
                ੩ · Dil Di Baat — Joy, Sorrow &amp; Support ({dilPosts.length})
              </button>
            </div>

            {/* Auth-Gated Creation Buttons */}
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() =>
                  requireSignedIn("Publish a Blog / Research Essay", () =>
                    setIsBlogComposerOpen(true)
                  )
                }
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider shadow-sm hover:brightness-105 transition"
              >
                ✍ Publish a Blog / Research Essay
              </button>
              <button
                type="button"
                onClick={() =>
                  requireSignedIn("Create a SikhInterest Pin", () =>
                    setIsPinComposerOpen(true)
                  )
                }
                className="px-4 py-2.5 rounded-xl border border-[#C59B27]/55 text-xs font-bold uppercase tracking-wider text-[#C59B27] hover:border-[#C59B27] transition"
              >
                📌 Create a SikhInterest Pin
              </button>
              <button
                type="button"
                onClick={() =>
                  requireSignedIn("Share What's on Your Heart (Dil Di Baat)", () =>
                    setIsDilComposerOpen(true)
                  )
                }
                className="px-4 py-2.5 rounded-xl border border-[#C59B27]/55 text-xs font-bold uppercase tracking-wider text-[#C59B27] hover:border-[#C59B27] transition"
              >
                💛 Share What&apos;s on Your Heart
              </button>
            </div>
          </div>
        </section>

        {shareToast && (
          <div className="p-3.5 rounded-2xl border border-[#C59B27] bg-[#C59B27]/15 text-xs font-bold text-[#C59B27] text-center">
            ✓ {shareToast}
          </div>
        )}

        {/* ================================================================
            MODE 1: SUBSTACK-STYLE RESEARCH & VICHAAR BLOGS
        ================================================================ */}
        {activeMode === "blogs" && (
          <div className="space-y-8">
            {activeBlog ? (
              /* Full Article Reader View + Threaded Comments */
              <article
                style={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-subtle)",
                }}
                className="rounded-3xl border-2 border-[#C59B27]/60 p-6 sm:p-10 md:p-12 shadow-lg max-w-4xl mx-auto space-y-8"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#C59B27]/25 pb-4">
                  <button
                    type="button"
                    onClick={() => setActiveBlogId(null)}
                    className="px-4 py-2 rounded-xl border border-[#C59B27]/45 text-xs font-bold text-[#C59B27] hover:border-[#C59B27]"
                  >
                    ← Back to All Research Essays
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#C59B27]/15 border border-[#C59B27]/40 text-xs font-bold text-[#C59B27]">
                      {activeBlog.topicTag}
                    </span>
                    <span
                      style={{ color: "var(--theme-text-muted)" }}
                      className="text-xs font-semibold"
                    >
                      {activeBlog.readingTime} • {activeBlog.createdAt}
                    </span>
                  </div>
                </div>

                {/* Article Header */}
                <div className="space-y-4">
                  <p
                    lang="pa"
                    className="font-gurmukhi text-xl sm:text-2xl font-semibold text-[#C59B27]"
                  >
                    {activeBlog.gurmukhiHeader}
                  </p>
                  <h2 className="text-3xl sm:text-5xl font-serif font-bold leading-tight">
                    {activeBlog.title}
                  </h2>
                  <p
                    style={{ color: "var(--theme-text-muted)" }}
                    className="text-base sm:text-xl leading-relaxed"
                  >
                    {activeBlog.subtitle}
                  </p>
                </div>

                {/* Author Byline Card (Clickable to open Public Researcher Profile) */}
                <div
                  style={{
                    backgroundColor: "var(--theme-card-darker)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-4"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setInspectedAuthor({
                        name: activeBlog.authorName,
                        handle: activeBlog.authorHandle,
                        role: activeBlog.authorRole,
                        bio: activeBlog.authorBio,
                        avatarPreset: activeBlog.authorAvatarPreset,
                        customAvatar: activeBlog.authorCustomAvatar,
                        interests: activeBlog.authorInterests,
                        contributionsCount: 4,
                      })
                    }
                    className="flex items-center gap-3.5 text-left group"
                  >
                    <SikhHeritageAvatar
                      preset={activeBlog.authorAvatarPreset}
                      customDataUrl={activeBlog.authorCustomAvatar}
                      size="md"
                    />
                    <div>
                      <p className="text-sm font-serif font-bold group-hover:underline">
                        {activeBlog.authorName}{" "}
                        <span className="text-xs font-mono font-normal text-[#C59B27]">
                          @{activeBlog.authorHandle}
                        </span>
                      </p>
                      <p
                        style={{ color: "var(--theme-text-muted)" }}
                        className="text-xs"
                      >
                        {activeBlog.authorRole} • Click to view Researcher Profile
                      </p>
                    </div>
                  </button>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleToggleLikeBlog(activeBlog.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                        likedBlogIds.includes(activeBlog.id)
                          ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] border-[#C59B27]"
                          : "border-[#C59B27]/45 text-[#C59B27]"
                      }`}
                    >
                      🙏 Waheguru / Chardi Kala ({activeBlog.likesCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShareBlog(activeBlog)}
                      className="px-3.5 py-2 rounded-xl border border-[#C59B27]/45 text-xs font-bold hover:border-[#C59B27]"
                    >
                      ↗ Share Article
                    </button>
                  </div>
                </div>

                {/* Pull Quote */}
                {activeBlog.pullQuote && (
                  <blockquote className="p-6 rounded-2xl border-l-4 border-[#C59B27] bg-[#C59B27]/10 font-serif text-lg sm:text-xl italic leading-relaxed">
                    &ldquo;{activeBlog.pullQuote}&rdquo;
                  </blockquote>
                )}

                {/* Essay Body Paragraphs */}
                <div className="space-y-5 text-base sm:text-lg leading-relaxed">
                  {activeBlog.paragraphs.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>

                {/* Threaded Comment Section */}
                <div className="pt-8 border-t border-[#C59B27]/30 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif font-bold">
                      Sangati Vichaar &amp; Threaded Discussion ({activeBlog.comments.length})
                    </h3>
                    {!user && (
                      <span className="text-xs text-[#C59B27] font-semibold">
                        Sign in required to post comments
                      </span>
                    )}
                  </div>

                  {/* New Comment Form */}
                  <form onSubmit={handlePostComment} className="space-y-3">
                    <textarea
                      rows={3}
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder={
                        user
                          ? "Share a thoughtful reflection, scriptural citation, or question..."
                          : "Click 'Post Comment' to sign in and join the Sangati discussion..."
                      }
                      style={{
                        backgroundColor: "var(--bg-primary)",
                        borderColor: "var(--border-subtle)",
                      }}
                      className="w-full rounded-2xl border p-4 text-xs sm:text-sm focus:outline-none focus:border-[#C59B27]"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider"
                      >
                        Post Comment →
                      </button>
                    </div>
                  </form>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {activeBlog.comments.map((com) => (
                      <div
                        key={com.id}
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          borderColor: "var(--border-subtle)",
                        }}
                        className="p-5 rounded-2xl border space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <SikhHeritageAvatar
                              preset={com.authorAvatarPreset}
                              customDataUrl={com.authorCustomAvatar}
                              size="sm"
                            />
                            <div>
                              <span className="text-xs font-bold">
                                {com.authorName}
                              </span>{" "}
                              <span className="text-[11px] font-mono text-[#C59B27]">
                                @{com.authorHandle}
                              </span>
                              <span
                                style={{ color: "var(--theme-text-muted)" }}
                                className="block text-[10px]"
                              >
                                {com.authorRole} • {com.createdAt}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              requireSignedIn("Reply to a Comment", () =>
                                setReplyingToCommentId(
                                  replyingToCommentId === com.id ? null : com.id
                                )
                              )
                            }
                            className="text-xs font-bold text-[#C59B27] hover:underline"
                          >
                            ↩ Reply
                          </button>
                        </div>

                        <p className="text-xs sm:text-sm leading-relaxed">
                          {com.body}
                        </p>

                        {/* Nested Replies */}
                        {com.replies.length > 0 && (
                          <div className="pl-5 border-l-2 border-[#C59B27]/35 space-y-2.5 pt-2">
                            {com.replies.map((rep) => (
                              <div
                                key={rep.id}
                                style={{
                                  backgroundColor: "var(--bg-surface)",
                                  borderColor: "var(--border-subtle)",
                                }}
                                className="p-3.5 rounded-xl border space-y-1"
                              >
                                <div className="flex items-center gap-2">
                                  <SikhHeritageAvatar
                                    preset={rep.authorAvatarPreset}
                                    size="sm"
                                  />
                                  <span className="text-xs font-bold">
                                    {rep.authorName}
                                  </span>
                                  <span className="text-[10px] text-[#C59B27]">
                                    • {rep.createdAt}
                                  </span>
                                </div>
                                <p className="text-xs leading-relaxed">
                                  {rep.body}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {replyingToCommentId === com.id && (
                          <div className="pt-2 flex gap-2">
                            <input
                              type="text"
                              value={replyCommentInput}
                              onChange={(e) =>
                                setReplyCommentInput(e.target.value)
                              }
                              placeholder="Write your reply..."
                              style={{
                                backgroundColor: "var(--bg-surface)",
                                borderColor: "var(--border-subtle)",
                              }}
                              className="flex-1 rounded-xl border px-3.5 py-2 text-xs focus:outline-none focus:border-[#C59B27]"
                            />
                            <button
                              type="button"
                              onClick={() => handlePostCommentReply(com.id)}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold"
                            >
                              Reply
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ) : (
              /* Substack Editorial Feed View */
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {[
                      "All",
                      "Gurbani Research",
                      "Sikh History",
                      "Personal Journey",
                      "Philosophy",
                    ].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSelectedTopic(tag)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                          selectedTopic === tag
                            ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B]"
                            : "border border-[#C59B27]/35 hover:border-[#C59B27]"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      requireSignedIn("Publish a Blog / Research Essay", () =>
                        setIsBlogComposerOpen(true)
                      )
                    }
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold"
                  >
                    + Write New Research Essay
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {filteredBlogs.map((blog, idx) => (
                    <article
                      key={blog.id}
                      style={{
                        backgroundColor: "var(--bg-surface)",
                        borderColor: "var(--border-subtle)",
                      }}
                      className={`${
                        idx === 0 ? "lg:col-span-12" : "lg:col-span-6"
                      } rounded-3xl border p-7 sm:p-8 shadow-sm hover:border-[#C59B27] transition flex flex-col justify-between gap-6`}
                    >
                      <div className="space-y-4">
                        <ChitrakariCardHeader
                          artKey={blog.id}
                          variant={
                            blog.topicTag === "Sikh History"
                              ? "warrior"
                              : blog.topicTag === "Gurbani Research"
                              ? "manuscript"
                              : "darbar"
                          }
                          title={blog.title}
                          heightClass={idx === 0 ? "h-52" : "h-44"}
                          editable
                        />

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="px-3 py-1 rounded-full bg-[#C59B27]/15 border border-[#C59B27]/40 text-[11px] font-bold uppercase tracking-wider text-[#C59B27]">
                            {blog.topicTag}
                          </span>
                          <span
                            style={{ color: "var(--theme-text-muted)" }}
                            className="text-xs font-semibold"
                          >
                            {blog.readingTime} • {blog.createdAt}
                          </span>
                        </div>

                        <p
                          lang="pa"
                          className="font-gurmukhi text-base sm:text-lg font-medium text-[#C59B27]"
                        >
                          {blog.gurmukhiHeader}
                        </p>

                        <div>
                          <h2 className="text-2xl sm:text-3xl font-serif font-bold">
                            <button
                              type="button"
                              onClick={() => setActiveBlogId(blog.id)}
                              className="text-left hover:underline"
                            >
                              {blog.title}
                            </button>
                          </h2>
                          <p
                            style={{ color: "var(--theme-text-muted)" }}
                            className="text-sm sm:text-base mt-2 leading-relaxed"
                          >
                            {blog.subtitle}
                          </p>
                        </div>

                        {blog.pullQuote && (
                          <blockquote className="p-4 rounded-xl border-l-4 border-[#C59B27] bg-[#C59B27]/10 text-xs sm:text-sm italic">
                            &ldquo;{blog.pullQuote}&rdquo;
                          </blockquote>
                        )}
                      </div>

                      <div className="pt-4 border-t border-[#C59B27]/25 flex flex-wrap items-center justify-between gap-4">
                        <button
                          type="button"
                          onClick={() =>
                            setInspectedAuthor({
                              name: blog.authorName,
                              handle: blog.authorHandle,
                              role: blog.authorRole,
                              bio: blog.authorBio,
                              avatarPreset: blog.authorAvatarPreset,
                              customAvatar: blog.authorCustomAvatar,
                              interests: blog.authorInterests,
                              contributionsCount: 4,
                            })
                          }
                          className="flex items-center gap-3 text-left group"
                        >
                          <SikhHeritageAvatar
                            preset={blog.authorAvatarPreset}
                            customDataUrl={blog.authorCustomAvatar}
                            size="sm"
                          />
                          <div>
                            <p className="text-xs font-bold group-hover:underline">
                              {blog.authorName}
                            </p>
                            <p
                              style={{ color: "var(--theme-text-muted)" }}
                              className="text-[11px]"
                            >
                              {blog.authorRole}
                            </p>
                          </div>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleLikeBlog(blog.id)}
                            className="px-3 py-1.5 rounded-xl border border-[#C59B27]/40 text-xs font-bold text-[#C59B27]"
                          >
                            🙏 {blog.likesCount}
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveBlogId(blog.id)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider"
                          >
                            Read Essay &amp; {blog.comments.length} Comments →
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ================================================================
            MODE 2: SIKHINTEREST VISUAL PINBOARD (MASONRY GRID)
        ================================================================ */}
        {activeMode === "pins" && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {[
                  "All",
                  "Sikh Art & Miniature",
                  "Gurmukhi Calligraphy",
                  "Gurdwara Architecture",
                  "Manuscript & Book Quotes",
                  `Saved Collection`,
                ].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedPinCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                      selectedPinCategory === cat
                        ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B]"
                        : "border border-[#C59B27]/35 hover:border-[#C59B27]"
                    }`}
                  >
                    {cat === "Saved Collection"
                      ? `📌 Saved Collection (${savedPinIds.length})`
                      : cat}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  requireSignedIn("Create a SikhInterest Pin", () =>
                    setIsPinComposerOpen(true)
                  )
                }
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold"
              >
                + Create SikhInterest Pin
              </button>
            </div>

            {/* Responsive Masonry Layout */}
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
              {filteredPins.map((pin) => {
                const isSaved = savedPinIds.includes(pin.id);
                const paletteGradient =
                  pin.visualPalette === "amrit-indigo"
                    ? "from-[#0F172A] via-[#1E3A8A] to-[#172554]"
                    : pin.visualPalette === "saffron-dawn"
                    ? "from-[#7C2D12] via-[#9A3412] to-[#451A03]"
                    : pin.visualPalette === "emerald-manuscript"
                    ? "from-[#064E3B] via-[#1B2A20] to-[#121C15]"
                    : "from-[#1B2A20] via-[#271203] to-[#78350F]";

                return (
                  <div
                    key={pin.id}
                    style={{
                      backgroundColor: "var(--bg-surface)",
                      borderColor: "var(--border-subtle)",
                    }}
                    className="break-inside-avoid rounded-3xl border overflow-hidden shadow-sm hover:border-[#C59B27] transition flex flex-col"
                  >
                    {/* Visual Artwork / Calligraphy Canvas */}
                    {pin.imageDataUrl ? (
                      <div className="relative w-full overflow-hidden bg-[#121C15]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={pin.imageDataUrl}
                          alt={pin.title}
                          className="w-full h-auto object-cover max-h-80"
                        />
                      </div>
                    ) : (
                      <div
                        className={`p-7 bg-gradient-to-br ${paletteGradient} text-[#FAF6EE] space-y-3 border-b border-[#C59B27]/30`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#E5C158] px-2.5 py-0.5 rounded-full bg-black/35 border border-[#C59B27]/40">
                            {pin.category}
                          </span>
                          {pin.availableToCoordinate && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                              🎨 Available • Artist Direct
                            </span>
                          )}
                        </div>
                        <p
                          lang="pa"
                          className="font-gurmukhi text-xl sm:text-2xl font-bold text-[#E5C158] leading-relaxed py-3"
                        >
                          {pin.gurmukhiCalligraphy}
                        </p>
                      </div>
                    )}

                    {/* Pin Content */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="text-lg font-serif font-bold">
                          {pin.title}
                        </h3>
                        <p
                          style={{ color: "var(--theme-text-muted)" }}
                          className="text-xs sm:text-sm mt-1.5 leading-relaxed"
                        >
                          {pin.description}
                        </p>
                      </div>

                      {pin.availableToCoordinate && (
                        <button
                          type="button"
                          onClick={() => setCoordinatingPin(pin)}
                          className="w-full py-2 px-3 rounded-xl border border-[#C59B27] bg-[#C59B27]/10 text-xs font-bold text-[#C59B27] hover:bg-[#C59B27]/20 transition"
                        >
                          🎨 Available — Coordinate with Artist →
                        </button>
                      )}

                      <div className="pt-3 border-t border-[#C59B27]/20 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setInspectedAuthor({
                              name: pin.authorName,
                              handle: pin.authorHandle,
                              role: pin.authorRole,
                              bio: pin.authorBio,
                              avatarPreset: pin.authorAvatarPreset,
                              customAvatar: pin.authorCustomAvatar,
                              interests: pin.authorInterests,
                              contributionsCount: 3,
                            })
                          }
                          className="flex items-center gap-2 text-left group min-w-0"
                        >
                          <SikhHeritageAvatar
                            preset={pin.authorAvatarPreset}
                            customDataUrl={pin.authorCustomAvatar}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate group-hover:underline">
                              {pin.authorName}
                            </p>
                            <p className="text-[10px] text-[#C59B27] truncate">
                              @{pin.authorHandle}
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleSavePin(pin.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            isSaved
                              ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B]"
                              : "border border-[#C59B27]/45 text-[#C59B27]"
                          }`}
                        >
                          {isSaved
                            ? `📌 Saved (${pin.savesCount})`
                            : `📌 Save (${pin.savesCount})`}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================
            MODE 3: DIL DI BAAT (SHARE JOY, SORROW, PAIN, KNOWLEDGE & SUPPORT)
        ================================================================ */}
        {activeMode === "dil" && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    "All",
                    "🌱 Seeking Strength / In Pain",
                    "✨ Sharing Happiness / Gratitude",
                    "📚 Researcher Note",
                    "🤝 Sangat Advice",
                  ] as const
                ).map((mood) => (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => setSelectedMoodFilter(mood)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                      selectedMoodFilter === mood
                        ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B]"
                        : "border border-[#C59B27]/35 hover:border-[#C59B27]"
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  requireSignedIn(
                    "Share What's on Your Heart (Dil Di Baat)",
                    () => setIsDilComposerOpen(true)
                  )
                }
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold"
              >
                💛 Share What&apos;s on Your Heart
              </button>
            </div>

            <div className="space-y-6">
              {filteredDilPosts.map((post) => (
                <article
                  key={post.id}
                  style={{
                    backgroundColor: "var(--bg-surface)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="rounded-3xl border p-6 sm:p-8 shadow-sm space-y-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setInspectedAuthor({
                          name: post.authorName,
                          handle: post.authorHandle,
                          role: post.authorRole,
                          bio: post.authorBio,
                          avatarPreset: post.authorAvatarPreset,
                          customAvatar: post.authorCustomAvatar,
                          interests: post.authorInterests,
                          contributionsCount: 2,
                        })
                      }
                      className="flex items-center gap-3 text-left group"
                    >
                      <SikhHeritageAvatar
                        preset={post.authorAvatarPreset}
                        customDataUrl={post.authorCustomAvatar}
                        size="md"
                      />
                      <div>
                        <p className="text-sm font-serif font-bold group-hover:underline">
                          {post.authorName}{" "}
                          <span className="text-xs font-mono font-normal text-[#C59B27]">
                            @{post.authorHandle}
                          </span>
                        </p>
                        <p
                          style={{ color: "var(--theme-text-muted)" }}
                          className="text-xs"
                        >
                          {post.authorRole} • {post.createdAt}
                        </p>
                      </div>
                    </button>

                    <span className="px-3.5 py-1.5 rounded-full bg-[#C59B27]/15 border border-[#C59B27]/45 text-xs font-bold text-[#C59B27]">
                      {post.moodTag}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-serif font-bold">
                      {post.title}
                    </h3>
                    <p
                      style={{ color: "var(--theme-text-muted)" }}
                      className="text-sm sm:text-base leading-relaxed"
                    >
                      {post.body}
                    </p>
                  </div>

                  {/* Attached Comforting Gurbani Shabad */}
                  {post.shabadGurmukhi && (
                    <div
                      style={{
                        backgroundColor: "var(--theme-card-darker)",
                        borderColor: "var(--border-subtle)",
                      }}
                      className="p-5 rounded-2xl border space-y-1.5"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C59B27]">
                        ANCHORING GURBANI SHABAD • {post.shabadAng}
                      </span>
                      <p
                        lang="pa"
                        className="font-gurmukhi text-lg sm:text-xl font-semibold text-[#C59B27]"
                      >
                        {post.shabadGurmukhi}
                      </p>
                      <p className="text-xs sm:text-sm italic">
                        &ldquo;{post.shabadEnglish}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Actions & Supportive Replies */}
                  <div className="pt-3 border-t border-[#C59B27]/20 flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => handleOfferArdas(post.id)}
                      className="px-4 py-2 rounded-xl border border-[#C59B27]/50 text-xs font-bold text-[#C59B27] hover:bg-[#C59B27]/10 transition"
                    >
                      🙏 Stand in Ardas / Send Chardi Kala ({post.ardasCount})
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        requireSignedIn(
                          "Leave a Supportive Reply & Shabad",
                          () =>
                            setReplyingDilPostId(
                              replyingDilPostId === post.id ? null : post.id
                            )
                        )
                      }
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold"
                    >
                      🤝 Leave Supportive Reply &amp; Attach Shabad
                    </button>
                  </div>

                  {/* Existing Supportive Replies */}
                  {post.replies.length > 0 && (
                    <div className="space-y-3 pt-2 pl-4 border-l-2 border-[#C59B27]/40">
                      {post.replies.map((rep) => (
                        <div
                          key={rep.id}
                          style={{
                            backgroundColor: "var(--bg-primary)",
                            borderColor: "var(--border-subtle)",
                          }}
                          className="p-4 rounded-2xl border space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <SikhHeritageAvatar
                              preset={rep.authorAvatarPreset}
                              size="sm"
                            />
                            <span className="text-xs font-bold">
                              {rep.authorName}
                            </span>
                            <span className="text-[11px] font-mono text-[#C59B27]">
                              @{rep.authorHandle}
                            </span>
                            <span
                              style={{ color: "var(--theme-text-muted)" }}
                              className="text-[10px]"
                            >
                              • {rep.createdAt}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm leading-relaxed">
                            {rep.body}
                          </p>
                          {rep.shabadGurmukhi && (
                            <div className="p-3 rounded-xl bg-[#C59B27]/10 border border-[#C59B27]/30 text-xs space-y-0.5">
                              <p
                                lang="pa"
                                className="font-gurmukhi font-bold text-[#C59B27]"
                              >
                                {rep.shabadGurmukhi}
                              </p>
                              <p className="italic">{rep.shabadEnglish}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Supportive Reply Composer */}
                  {replyingDilPostId === post.id && (
                    <div
                      style={{
                        backgroundColor: "var(--bg-primary)",
                        borderColor: "var(--border-subtle)",
                      }}
                      className="p-4 rounded-2xl border space-y-3"
                    >
                      <textarea
                        rows={2}
                        value={dilReplyBody}
                        onChange={(e) => setDilReplyBody(e.target.value)}
                        placeholder="Write words of encouragement, Ardas, or Sangati support..."
                        style={{
                          backgroundColor: "var(--bg-surface)",
                          borderColor: "var(--border-subtle)",
                        }}
                        className="w-full rounded-xl border p-3 text-xs sm:text-sm focus:outline-none focus:border-[#C59B27]"
                      />
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <select
                          value={dilReplyShabadIdx}
                          onChange={(e) =>
                            setDilReplyShabadIdx(Number(e.target.value))
                          }
                          style={{
                            backgroundColor: "var(--bg-surface)",
                            borderColor: "var(--border-subtle)",
                          }}
                          className="rounded-xl border px-3 py-2 text-xs"
                        >
                          {UPLIFTING_SHABADS_LIBRARY.map((s, idx) => (
                            <option key={s.label} value={idx}>
                              Attach Shabad: {s.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handlePostDilReply(post.id)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold"
                        >
                          Send Reply &amp; Shabad →
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ================================================================
          STRICT AUTHENTICATION GATE MODAL FOR POSTING & COMMENTING
      ================================================================ */}
      {authGateActionLabel && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Sign In Required to Contribute"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--accent-primary)",
              color: "var(--text-primary)",
            }}
            className="w-full max-w-md rounded-3xl border-2 p-6 sm:p-8 shadow-2xl space-y-5 text-center"
          >
            <div className="mx-auto flex justify-center">
              <SikhHeritageAvatar preset="khanda-crest" size="lg" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C59B27]">
                AUTHENTICATED SANGAT CONTRIBUTION
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold">
                Sign In to {authGateActionLabel}
              </h3>
              <p
                style={{ color: "var(--theme-text-muted)" }}
                className="text-xs sm:text-sm leading-relaxed"
              >
                Anyone can read research essays, explore SikhInterest pins, and read Dil Di
                Baat reflections publicly. To publish articles, create pins, or post
                comments, please sign in with your Learn Sikhi account.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => router.push("/auth?next=/sangat")}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider shadow-sm hover:brightness-105 transition"
              >
                Continue to Sign In / Sign Up (/auth) →
              </button>
              <button
                type="button"
                onClick={() => setAuthGateActionLabel(null)}
                className="w-full py-2.5 rounded-xl border border-[#C59B27]/40 text-xs font-bold"
              >
                Continue Browsing Publicly
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          MODAL: PUBLISH A BLOG / RESEARCH ESSAY
      ================================================================ */}
      {isBlogComposerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Publish a Blog or Research Essay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm overflow-y-auto"
        >
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--accent-primary)",
              color: "var(--text-primary)",
            }}
            className="w-full max-w-2xl rounded-3xl border-2 p-6 sm:p-8 shadow-2xl space-y-4 my-6"
          >
            <div className="flex items-center justify-between border-b border-[#C59B27]/25 pb-3">
              <h3 className="text-xl font-serif font-bold">
                Publish a Substack-Style Research Essay
              </h3>
              <button
                type="button"
                onClick={() => setIsBlogComposerOpen(false)}
                className="px-3 py-1 rounded-xl border border-[#C59B27]/40 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePublishBlog} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Essay Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newBlogTitle}
                    onChange={(e) => setNewBlogTitle(e.target.value)}
                    placeholder="e.g., Ecological Ethics in Guru Har Rai Ji's Naulakha Bagh"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-subtle)",
                    }}
                    className="w-full rounded-xl border px-3.5 py-2 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Topic Tag
                  </label>
                  <select
                    value={newBlogTopic}
                    onChange={(e) =>
                      setNewBlogTopic(e.target.value as BlogTopicTag)
                    }
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-subtle)",
                    }}
                    className="w-full rounded-xl border px-3.5 py-2 text-xs sm:text-sm"
                  >
                    <option value="Gurbani Research">Gurbani Research</option>
                    <option value="Sikh History">Sikh History</option>
                    <option value="Personal Journey">Personal Journey</option>
                    <option value="Philosophy">Philosophy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  Subtitle / Summary
                </label>
                <input
                  type="text"
                  value={newBlogSubtitle}
                  onChange={(e) => setNewBlogSubtitle(e.target.value)}
                  placeholder="A concise thesis statement or summary..."
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="w-full rounded-xl border px-3.5 py-2 text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Gurmukhi Opening Pangti (Optional)
                  </label>
                  <input
                    type="text"
                    value={newBlogGurmukhi}
                    onChange={(e) => setNewBlogGurmukhi(e.target.value)}
                    placeholder="ਪਵਣੁ ਗੁਰੂ ਪਾਣੀ ਪਿਤਾ..."
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-subtle)",
                    }}
                    className="w-full rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-gurmukhi"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Key Pull-Quote (Optional)
                  </label>
                  <input
                    type="text"
                    value={newBlogPullQuote}
                    onChange={(e) => setNewBlogPullQuote(e.target.value)}
                    placeholder="Highlighted quote inside your article..."
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-subtle)",
                    }}
                    className="w-full rounded-xl border px-3.5 py-2 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  Essay Paragraphs (Separate paragraphs with a new line) *
                </label>
                <textarea
                  rows={6}
                  required
                  value={newBlogBody}
                  onChange={(e) => setNewBlogBody(e.target.value)}
                  placeholder="Write your full research essay or reflection here..."
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="w-full rounded-xl border p-3.5 text-xs sm:text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider"
              >
                Publish Research Essay →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================
          MODAL: CREATE A SIKHINTEREST VISUAL PIN
      ================================================================ */}
      {isPinComposerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Create a SikhInterest Pin"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm overflow-y-auto"
        >
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--accent-primary)",
              color: "var(--text-primary)",
            }}
            className="w-full max-w-xl rounded-3xl border-2 p-6 sm:p-8 shadow-2xl space-y-4 my-6"
          >
            <div className="flex items-center justify-between border-b border-[#C59B27]/25 pb-3">
              <h3 className="text-xl font-serif font-bold">
                Create a SikhInterest Visual Pin
              </h3>
              <button
                type="button"
                onClick={() => setIsPinComposerOpen(false)}
                className="px-3 py-1 rounded-xl border border-[#C59B27]/40 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePin} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Pin Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPinTitle}
                    onChange={(e) => setNewPinTitle(e.target.value)}
                    placeholder="e.g., Puratan Gurmukhi Calligraphy Folio"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-subtle)",
                    }}
                    className="w-full rounded-xl border px-3.5 py-2 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Category
                  </label>
                  <select
                    value={newPinCat}
                    onChange={(e) =>
                      setNewPinCat(e.target.value as PinCategory)
                    }
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-subtle)",
                    }}
                    className="w-full rounded-xl border px-3.5 py-2 text-xs sm:text-sm"
                  >
                    <option value="Sikh Art & Miniature">
                      Sikh Art &amp; Miniature
                    </option>
                    <option value="Gurmukhi Calligraphy">
                      Gurmukhi Calligraphy
                    </option>
                    <option value="Historical Photography">
                      Historical Photography
                    </option>
                    <option value="Gurdwara Architecture">
                      Gurdwara Architecture
                    </option>
                    <option value="Manuscript & Book Quotes">
                      Manuscript &amp; Book Quotes
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Gurmukhi Calligraphy / Quote on Canvas
                  </label>
                  <input
                    type="text"
                    value={newPinCalligraphy}
                    onChange={(e) => setNewPinCalligraphy(e.target.value)}
                    placeholder="ੴ ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ ॥"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-subtle)",
                    }}
                    className="w-full rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-gurmukhi"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">
                    Canvas Palette (or Upload Artwork Image)
                  </label>
                  <select
                    value={newPinPalette}
                    onChange={(e) =>
                      setNewPinPalette(
                        e.target.value as
                          | "darbar-gold"
                          | "amrit-indigo"
                          | "saffron-dawn"
                          | "emerald-manuscript"
                      )
                    }
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-subtle)",
                    }}
                    className="w-full rounded-xl border px-3.5 py-2 text-xs sm:text-sm"
                  >
                    <option value="darbar-gold">Darbar Gold &amp; Walnut</option>
                    <option value="amrit-indigo">Amrit Vela Indigo</option>
                    <option value="saffron-dawn">Basanti / Saffron Dawn</option>
                    <option value="emerald-manuscript">
                      Emerald Manuscript Leaf
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  Upload Artwork / Photography Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === "string") {
                        setNewPinImageDataUrl(reader.result);
                      }
                    };
                    reader.readAsDataURL(f);
                  }}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  Description &amp; Historical / Artistic Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  value={newPinDesc}
                  onChange={(e) => setNewPinDesc(e.target.value)}
                  placeholder="Describe the medium, inspiration, or manuscript source..."
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="w-full rounded-xl border p-3 text-xs sm:text-sm"
                />
              </div>

              <div className="p-3.5 rounded-xl border border-[#C59B27]/40 space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPinAvailable}
                    onChange={(e) => setNewPinAvailable(e.target.checked)}
                    className="accent-[#C59B27]"
                  />
                  Mark Original Artwork as &ldquo;Available — Coordinate with
                  Artist&rdquo;
                </label>
                {newPinAvailable && (
                  <input
                    type="text"
                    value={newPinContactNote}
                    onChange={(e) => setNewPinContactNote(e.target.value)}
                    placeholder="How can collectors or Gurdwaras reach you? (e.g., @handle or email)"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      borderColor: "var(--border-subtle)",
                    }}
                    className="w-full rounded-xl border px-3 py-2 text-xs"
                  />
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider"
              >
                Publish SikhInterest Pin →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================
          MODAL: COORDINATE WITH ARTIST
      ================================================================ */}
      {coordinatingPin && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Coordinate with Artist"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--accent-primary)",
              color: "var(--text-primary)",
            }}
            className="w-full max-w-md rounded-3xl border-2 p-6 sm:p-8 shadow-2xl space-y-4"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C59B27]">
              SIKHINTEREST ARTIST COORDINATION
            </span>
            <h3 className="text-xl font-serif font-bold">
              {coordinatingPin.title}
            </h3>
            <p className="text-xs font-semibold text-[#C59B27]">
              By {coordinatingPin.authorName} (@{coordinatingPin.authorHandle})
            </p>
            <p
              style={{ color: "var(--theme-text-muted)" }}
              className="text-sm leading-relaxed"
            >
              {coordinatingPin.artistContactNote}
            </p>
            <button
              type="button"
              onClick={() => setCoordinatingPin(null)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ================================================================
          MODAL: DIL DI BAAT COMPOSER
      ================================================================ */}
      {isDilComposerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Share What's on Your Heart (Dil Di Baat)"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm overflow-y-auto"
        >
          <div
            style={{
              backgroundColor: "var(--bg-surface)",
              borderColor: "var(--accent-primary)",
              color: "var(--text-primary)",
            }}
            className="w-full max-w-xl rounded-3xl border-2 p-6 sm:p-8 shadow-2xl space-y-4 my-6"
          >
            <div className="flex items-center justify-between border-b border-[#C59B27]/25 pb-3">
              <h3 className="text-xl font-serif font-bold">
                Dil Di Baat — Share Joy, Sorrow, Questions or Gratitude
              </h3>
              <button
                type="button"
                onClick={() => setIsDilComposerOpen(false)}
                className="px-3 py-1 rounded-xl border border-[#C59B27]/40 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDilPost} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold mb-1">
                  Mood / Intent Tag
                </label>
                <select
                  value={newDilMood}
                  onChange={(e) =>
                    setNewDilMood(e.target.value as DilMoodTag)
                  }
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm"
                >
                  <option value="🌱 Seeking Strength / In Pain">
                    🌱 Seeking Strength / In Pain
                  </option>
                  <option value="✨ Sharing Happiness / Gratitude">
                    ✨ Sharing Happiness / Gratitude
                  </option>
                  <option value="📚 Researcher Note">📚 Researcher Note</option>
                  <option value="🤝 Sangat Advice">🤝 Sangat Advice</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  Title / Summary *
                </label>
                <input
                  type="text"
                  required
                  value={newDilTitle}
                  onChange={(e) => setNewDilTitle(e.target.value)}
                  placeholder="Share what is on your heart..."
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  Your Reflection *
                </label>
                <textarea
                  rows={4}
                  required
                  value={newDilBody}
                  onChange={(e) => setNewDilBody(e.target.value)}
                  placeholder="Write openly to the Sangat..."
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="w-full rounded-xl border p-3.5 text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  Attach an Uplifting Gurbani Shabad
                </label>
                <select
                  value={newDilShabadIdx}
                  onChange={(e) => setNewDilShabadIdx(Number(e.target.value))}
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-subtle)",
                  }}
                  className="w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm"
                >
                  {UPLIFTING_SHABADS_LIBRARY.map((s, idx) => (
                    <option key={s.label} value={idx}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider"
              >
                Share with the Sangat →
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================
          MODAL: CUSTOMIZABLE RESEARCHER PROFILE STUDIO & DASHBOARD
      ================================================================ */}
      <ProfileStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        profile={profile}
        onSaveProfile={saveProfileToStorage}
        userEmail={user?.email}
        myBlogsCount={
          blogs.filter((b) => b.isUserCreated || b.authorHandle === profile.handle)
            .length
        }
        myPinsCount={
          pins.filter((p) => p.isUserCreated || p.authorHandle === profile.handle)
            .length
        }
        myDilPostsCount={
          dilPosts.filter(
            (d) => d.isUserCreated || d.authorHandle === profile.handle
          ).length
        }
        savedPinsCount={savedPinIds.length}
        publishedItems={publishedItems}
      />

      {/* ================================================================
          MODAL: PUBLIC RESEARCHER PROFILE CARD
      ================================================================ */}
      <PublicResearcherProfileModal
        author={inspectedAuthor}
        onClose={() => setInspectedAuthor(null)}
      />

      <Footer />
    </div>
  );
}

export default function SangatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-12 font-serif text-xl">
          Opening SikhInterest &amp; Vichaar Sanctuary…
        </div>
      }
    >
      <SangatHubContent />
    </Suspense>
  );
}
