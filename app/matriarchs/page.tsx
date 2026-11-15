"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ChitrakariCardHeader } from "@/components/chitrakari-card-header";
import { AnimatedModal } from "@/components/animated-modal";
import { SikhiIcon } from "@/components/sikhi-icons";

type MatriarchCategory =
  | "Spiritual Pioneers"
  | "Battlefield Commanders"
  | "Scholars & Diplomats"
  | "Martyrs of 1700s & 1984";

type MatriarchProfile = {
  id: string;
  numeral: string;
  name: string;
  gurmukhiName: string;
  era: string;
  region: string;
  category: MatriarchCategory;
  roleTitle: string;
  shortSummary: string;
  fullBiography: string;
  historiographicalNote: string;
  primaryCitation: string;
  keyQuoteOrEmblem: string;
};

const MATRIARCH_PROFILES: MatriarchProfile[] = [
  {
    id: "bebe-nanaki",
    numeral: "੧",
    name: "Bebe Nanaki Ji",
    gurmukhiName: "ਬੇਬੇ ਨਾਨਕੀ ਜੀ",
    era: "1464 – 1518 CE",
    region: "Chahal & Sultanpur Lodhi",
    category: "Spiritual Pioneers",
    roleTitle: "The First Sikh & Patron of the First Rabab",
    shortSummary:
      "Recognized Guru Nanak Dev Ji's prophetic light before any other human being and financed Bhai Mardana Ji's first Rabab to inaugurate Gurmat Kirtan.",
    fullBiography:
      "Born five years before Guru Nanak Dev Ji, Bebe Nanaki Ji was the very first disciple of Sikhi. When their father Mehta Kalu reprimanded young Nanak for spending twenty rupees to feed hungry mendicants (Sacha Sauda), Bebe Nanaki Ji shielded her brother and brought him to Sultanpur Lodhi with her husband Bhai Jairam Ji. There, she personally provided the silver coins for Bhai Mardana Ji to commission the first six-stringed Rabab, establishing her household as the first dharamsal where Gurmat Kirtan echoed.",
    historiographicalNote:
      "Popular retellings often frame Bebe Nanaki Ji merely as an affectionate older sister in childhood stories, overlooking her foundational agency as the first initiate of Sikhi and the financial patron of Gurmat Sangeet.",
    primaryCitation: "Puratan Janamsakhi, Bhai Gurdas Ji Vaaran & Mehma Prakash",
    keyQuoteOrEmblem: "ਰਬਾਬ • Patron of the First Rabab at Sultanpur Lodhi",
  },
  {
    id: "mata-khivi",
    numeral: "੨",
    name: "Mata Khivi Ji",
    gurmukhiName: "ਮਾਤਾ ਖੀਵੀ ਜੀ",
    era: "1506 – 1582 CE",
    region: "Sanghar & Khadur Sahib",
    category: "Spiritual Pioneers",
    roleTitle: "Sovereign Architect of Guru Ka Langar (Ang 967)",
    shortSummary:
      "The only historical Sikh stateswoman praised by name in Sri Guru Granth Sahib Ji (Ang 967) for transforming Langar into an egalitarian institution.",
    fullBiography:
      "Serving across the pontificates of the first five Sikh Gurus over her 76-year life, Mata Khivi Ji institutionalized Guru Ka Langar at Khadur Sahib. She personally oversaw the treasury, grain stores, and preparation of rich kheer made with pure ghee, seating emperors (such as Humayun) and untouchables side-by-side on the exact same floor (Pangat) to dismantle the caste hierarchy.",
    historiographicalNote:
      "While modern committees often confine women to kitchen labor without administrative voice, Sri Guru Granth Sahib Ji explicitly exalts Mata Khivi Ji as the supreme administrator and maternal shelter ('dense leafy shade') of the Panth.",
    primaryCitation: "Sri Guru Granth Sahib Ji, Ang 967 (Satta & Balwand Ki Vaar)",
    keyQuoteOrEmblem: "ਬਲਵੰਡ ਖੀਵੀ ਨੇਕ ਜਨ ਜਿਸੁ ਬਹੁਤੀ ਛਾਉ ਪਤ੍ਰਾਲੀ ॥ (Ang 967)",
  },
  {
    id: "mata-gujri",
    numeral: "੩",
    name: "Mata Gujri Ji",
    gurmukhiName: "ਮਾਤਾ ਗੁਜਰੀ ਜੀ",
    era: "1624 – 1704 CE",
    region: "Kartarpur, Anandpur Sahib & Sirhind",
    category: "Martyrs of 1700s & 1984",
    roleTitle: "Tower of Unyielding Sovereign Resolve at Thanda Burj",
    shortSummary:
      "Wife of Martyr-Guru Tegh Bahadur Ji, mother of Guru Gobind Singh Ji, and teacher who prepared the Younger Sahibzaade for martyrdom at Sirhind.",
    fullBiography:
      "From guiding the young Gobind Rai after Guru Tegh Bahadur Ji's martyrdom at Chandni Chowk in 1675 to enduring freezing December nights in the open Thanda Burj tower of Sirhind in 1704, Mata Gujri Ji embodied supreme spiritual sovereignty. At age 80, imprisoned alongside seven-year-old Sahibzada Fateh Singh Ji and nine-year-old Sahibzada Zorawar Singh Ji, she fortified her grandsons with the sakhis of Guru Arjan Dev Ji and Guru Tegh Bahadur Ji so they refused Wazir Khan's bribes and threats to the very end.",
    historiographicalNote:
      "Mata Gujri Ji was not merely a grieving grandmother; she was the ideological mentor who shaped three generations of martyrdom in the Guru's house.",
    primaryCitation: "Katha सरहिंद (Allah Yar Khan Jogi), Gur Sobha & Suraj Prakash",
    keyQuoteOrEmblem: "ਠੰਢਾ ਬੁਰਜ • Guardian of Three Generations of Shaheedi",
  },
  {
    id: "mai-bhago",
    numeral: "੪",
    name: "Mai Bhago Ji (Mata Bhag Kaur)",
    gurmukhiName: "ਮਾਈ ਭਾਗੋ ਜੀ (ਮਾਤਾ ਭਾਗ ਕੌਰ)",
    era: "c. 1666 – 1708 CE",
    region: "Jhabal (Majha), Muktsar & Hazur Sahib Nanded",
    category: "Battlefield Commanders",
    roleTitle: "Commander at the Battle of Khidrana (Muktsar)",
    shortSummary:
      "Rallied the 40 Sikhs who had left Anandpur Sahib, led them on horseback against Wazir Khan's imperial army at Khidrana (1705), and served in Guru Gobind Singh Ji's Hazoori guard.",
    fullBiography:
      "Granddaughter of Bhai Pero Shah Ji (a devout Sikh of Guru Arjan Dev Ji), Mai Bhago Ji grew up trained in Shastarvidya (martial weaponry). When forty exhausted soldiers from Majha signed a disclaimer (Bedawa) at Anandpur Sahib and returned home, Mai Bhago Ji challenged their conscience, donned armor, and led them back to the battlefield at Khidrana Dhaab (Sri Muktsar Sahib) in May 1705. Fighting fiercely with her steel lance (Barcha) and musket, she survived severe wounds and accompanied Guru Gobind Singh Ji to Nanded, where her relics remain venerated.",
    historiographicalNote:
      "Rather than an anomaly, Mai Bhago Ji demonstrates that Amritdhari women in Guru Gobind Singh Ji's Khalsa held active battlefield command.",
    primaryCitation: "Sri Gur Pratap Suraj Granth & Takht Sri Hazur Sahib Relics",
    keyQuoteOrEmblem: "ਬਰਛਾ • Commander of the Chali Mukte at Khidrana (1705)",
  },
  {
    id: "bibi-sharan-kaur",
    numeral: "੫",
    name: "Bibi Sharan Kaur Pabla",
    gurmukhiName: "ਬੀਬੀ ਸ਼ਰਨ ਕੌਰ ਪਬਲਾ",
    era: "Martyred December 1704 CE",
    region: "Raipur Rani & Sri Chamkaur Sahib",
    category: "Martyrs of 1700s & 1984",
    roleTitle: "Martyr of Chamkaur Sahib Who Performed the Last Rites of the Shaheeds",
    shortSummary:
      "Walked onto the guarded battlefield of Chamkaur Sahib by night to gather and cremate the bodies of the Elder Sahibzaade and the Khalsa warriors.",
    fullBiography:
      "Following the fierce Battle of Chamkaur Sahib in December 1704, Mughal commanders ordered that the bodies of Sahibzada Ajit Singh Ji, Sahibzada Jujhar Singh Ji, and the fallen Khalsa warriors be left unburied on the battlefield as a warning. Bibi Sharan Kaur Pabla of nearby village Raipur walked alone into the dark battlefield, collected the sacred bodies of the Sahibzaade and Singhs, built a funeral pyre, and performed their Antam Sanskar (cremation). When drunken Mughal soldiers saw the flames and attacked her, she fought them with her Kirpan and embraced martyrdom in the blazing pyre.",
    historiographicalNote:
      "Gurdwara Bibi Sharan Kaur Ji at Raipur/Chamkaur Sahib stands witness to her supreme courage at a moment when imperial terror sought to deny even funeral rites to the Khalsa.",
    primaryCitation: "Twarikh Guru Khalsa (Giani Gian Singh) & Chamkaur Sahib Archives",
    keyQuoteOrEmblem: "ਚਮਕੌਰ ਸਾਹਿਬ • Guardian of the Martyrs' Sacred Pyre",
  },
  {
    id: "bibi-harsharan-rup-amro",
    numeral: "੬",
    name: "Bibi Amro Ji, Bibi Rup Kaur & Bibi Harsharan Kaur",
    gurmukhiName: "ਬੀਬੀ ਅਮਰੋ ਜੀ, ਬੀਬੀ ਰੂਪ ਕੌਰ ਅਤੇ ਬੀਬੀ ਹਰਸ਼ਰਨ ਕੌਰ",
    era: "16th – Early 18th Century CE",
    region: "Khadur Sahib, Goindwal Sahib & Anandpur Sahib",
    category: "Scholars & Diplomats",
    roleTitle: "Early Manji Parchariks & Scriptural Preservers",
    shortSummary:
      "Women scholars, preachers, and manuscript compilers who spread Gurbani across Punjab and preserved early Sikh literature.",
    fullBiography:
      "Daughter of Guru Angad Dev Ji and Mata Khivi Ji, Bibi Amro Ji memorized Gurbani hymns and sang them at Amrit Vela in Basarke; it was her deeply moving recitation of Guru Nanak Dev Ji's Shabad that awakened her uncle-in-law, Baba Amar Das Ji, leading him to become the Third Guru. Under Guru Amar Das Ji's Manji & Piri system, women such as Bibi Bhani Ji, Mai Sewan, and Mai Bhago of Kabul were appointed spiritual preachers with full authority. Later at Anandpur Sahib, Bibi Rup Kaur authored and compiled early sakhis illustrating philosophical teachings of the Gurus.",
    historiographicalNote:
      "Sixteenth-century Sikhi appointed women as Manji/Piri heads and scriptural teachers centuries before modern institutions debated female religious leadership.",
    primaryCitation: "Mehma Prakash, Twarikh Guru Khalsa & Early Goindwal Pothis",
    keyQuoteOrEmblem: "ਮੰਜੀ ਪ੍ਰਥਾ • Preachers & Custodians of the Sacred Word",
  },
  {
    id: "mata-sahib-kaur",
    numeral: "੭",
    name: "Mata Sahib Kaur Ji & Mata Sundari Ji",
    gurmukhiName: "ਮਾਤਾ ਸਾਹਿਬ ਕੌਰ ਜੀ ਅਤੇ ਮਾਤਾ ਸੁੰਦਰੀ ਜੀ",
    era: "1681 – 1747 CE",
    region: "Rohtas, Anandpur Sahib, Damdama Sahib & Delhi",
    category: "Spiritual Pioneers",
    roleTitle: "Spiritual Mother of the Khalsa & Issuers of Royal Hukamnamas",
    shortSummary:
      "Added patase (sweetness) to the Amrit on Vaisakhi 1699, declared the eternal Mother of the Khalsa, and guided the Panth from Delhi for nearly 40 years.",
    fullBiography:
      "On Vaisakhi 1699 at Keshgarh Sahib, as Guru Gobind Singh Ji prepared Khande-ki-Pahul with the double-edged sword, Mata Ji placed sugar crystals (patase) into the iron bowl so the Khalsa's martial valor would forever be balanced with humility and sweetness. Guru Gobind Singh Ji declared Mata Sahib Kaur Ji the eternal Mother of the Khalsa. After 1708, she and Mata Sundari Ji safeguarded the priceless shastars of the Sixth and Tenth Gurus in Delhi and issued sealed Hukamnamas (nine of which survive today) guiding sangats across India.",
    historiographicalNote:
      "Every Amritdhari Sikh traces their spiritual lineage directly to Guru Gobind Singh Ji as Father and Mata Sahib Kaur Ji as Mother, yet her 40-year post-1708 leadership in Delhi is rarely taught in depth.",
    primaryCitation: "Hukamnamas (ed. Dr. Ganda Singh) & Gurdwara Mata Sundari Delhi",
    keyQuoteOrEmblem: "ਖ਼ਾਲਸੇ ਦੀ ਮਾਤਾ • Sovereign Seal (Mohar) of the Khalsa",
  },
  {
    id: "bibi-dalair-kaur",
    numeral: "੮",
    name: "Bibi Dalair Kaur Ji",
    gurmukhiName: "ਬੀਬੀ ਦਲੇਰ ਕੌਰ ਜੀ",
    era: "Martyred c. 1704 CE",
    region: "Sri Anandpur Sahib (Fort Lohgarh)",
    category: "Battlefield Commanders",
    roleTitle: "Commander of the 100 Khalsa Women Defenders at Anandpur Sahib",
    shortSummary:
      "Led an armed detachment of 100 Sikh women defending the ramparts of Anandpur Sahib against Mughal and Hill Raja sieges.",
    fullBiography:
      "During the prolonged siege of Sri Anandpur Sahib by the combined imperial armies of Aurangzeb and the Shivalik Hill Rajas, Bibi Dalair Kaur organized and commanded a contingent of one hundred armed Khalsa women. Stationed along the defensive walls of Anandpur, her detachment repelled scaling parties with spears, arrows, and matchlocks, fighting unto martyrdom to protect the Guru's fort.",
    historiographicalNote:
      "Her name ('Dalair' meaning fearless) exemplifies how Guru Gobind Singh Ji's martial training at Anandpur Sahib included regiments of armed women.",
    primaryCitation: "18th-Century Anandpur Chronicles & Panthic Martyrologies",
    keyQuoteOrEmblem: "ਕਿਲਾ ਲੋਹਗੜ੍ਹ • Commander of 100 Armed Khalsa Women",
  },
  {
    id: "rani-sada-kaur",
    numeral: "੯",
    name: "Sardarni Sada Kaur (Chief of the Kanhaiya Misl)",
    gurmukhiName: "ਸਰਦਾਰਨੀ ਸਦਾ ਕੌਰ (ਕਨ੍ਹੱਈਆ ਮਿਸਲ)",
    era: "1762 – 1832 CE",
    region: "Batala, Fatehgarh Churian & Lahore",
    category: "Scholars & Diplomats",
    roleTitle: "Master Strategist & Architect of the Unification of the Sikh Empire",
    shortSummary:
      "Led the powerful Kanhaiya Misl for over 30 years and personally engineered the rise and coronation of young Maharaja Ranjit Singh in Lahore (1799).",
    fullBiography:
      "After her husband Gurbakhsh Singh Kanhaiya fell in battle in 1785 and her father-in-law Jai Singh Kanhaiya passed away in 1789, Sardarni Sada Kaur assumed supreme command of the Kanhaiya Misl and its 8,000 cavalrymen. Recognizing the need to unite the fractured Misls against Afghan invasions under Zaman Shah Durrani, she arranged the marriage of her daughter Mehtab Kaur to young Ranjit Singh of the Sukerchakia Misl. In July 1799, Sada Kaur rode beside Ranjit Singh at the head of her troops to capture Lahore and establish the sovereign Sarkar-i-Khalsa.",
    historiographicalNote:
      "British historians like Cunningham called her 'the ladder by which Ranjit Singh reached the summit of power,' yet popular histories of the Sikh Empire often sideline her decades of military and diplomatic genius.",
    primaryCitation: "Umdat-ut-Tawarikh (Sohan Lal Suri) & History of the Sikhs (Cunningham)",
    keyQuoteOrEmblem: "ਸਰਕਾਰ-ਏ-ਖ਼ਾਲਸਾ • Architect of the 1799 Capture of Lahore",
  },
  {
    id: "bibi-rajinder-kaur",
    numeral: "੧੦",
    name: "Bibi Rajinder Kaur of Patiala",
    gurmukhiName: "ਬੀਬੀ ਰਾਜਿੰਦਰ ਕੌਰ ਪਟਿਆਲਾ",
    era: "1739 – 1791 CE",
    region: "Phagwara, Patiala & Mathura",
    category: "Battlefield Commanders",
    roleTitle: "Fearless Princess-General Who Marched 3,000 Cavalry to Relieve Patiala",
    shortSummary:
      "Granddaughter of Baba Ala Singh who led 3,000 soldiers into battle in 1778 and later negotiated face-to-face with Maratha general Mahadji Scindia at Mathura.",
    fullBiography:
      "When her cousin Raja Amar Singh of Patiala was defeated by Hari Singh of Sialba in 1778, Princess Rajinder Kaur marched from Phagwara at the head of 3,000 soldiers to rescue the state. Again in 1790, when Maratha forces under Rane Khan besieged Patiala demanding heavy tribute, Bibi Rajinder Kaur rode with a select cavalry escort all the way to Mathura to confront Maratha chief Mahadji Scindia in person, compelling the Marathas to respect Patiala's autonomy.",
    historiographicalNote:
      "Along with Bibi Sahib Kaur of Patiala (who defeated George Thomas's artillery in 1794), Bibi Rajinder Kaur proved that 18th-century Sikh women commanded armies and conducted high-stakes interstate diplomacy.",
    primaryCitation: "Twarikh-i-Patiala & Griffin's Rajas of the Punjab",
    keyQuoteOrEmblem: "ਪਟਿਆਲਾ ਰਿਆਸਤ • Commander of 3,000 Cavalry",
  },
  {
    id: "maharani-jind-kaur",
    numeral: "੧੧",
    name: "Maharani Jind Kaur (Mai Jindan)",
    gurmukhiName: "ਮਹਾਰਾਣੀ ਜਿੰਦ ਕੌਰ",
    era: "1817 – 1863 CE",
    region: "Gujranwala, Lahore, Chunar Fort, Nepal & London",
    category: "Scholars & Diplomats",
    roleTitle: "Queen Regent of Punjab & Catalyst of Anti-Colonial Resistance",
    shortSummary:
      "Declared by British Governor-General Lord Dalhousie to be 'the only person with manly understanding in the Punjab'; escaped Chunar Fort in disguise and awakened Maharaja Duleep Singh.",
    fullBiography:
      "Serving as Queen Regent for her infant son Maharaja Duleep Singh after 1843, Maharani Jind Kaur fiercely opposed British imperial encroachment. Following the Treaty of Bhyroval, the British East India Company imprisoned her in Sheikhupura and then banished her to the high-security Chunar Fort near Varanasi. In April 1849, disguised as a servant maid, she staged a daring escape from Chunar Fort and trekked 800 miles through jungles into Nepal. Reunited with Duleep Singh in 1861, she restored his knowledge of Sikh sovereignty before passing away in Kensington in 1863.",
    historiographicalNote:
      "Colonial propaganda smeared Maharani Jind Kaur precisely because the British feared her unmatched ability to rally the Khalsa army against annexation.",
    primaryCitation: "Private Letters of the Marquess of Dalhousie & National Archives of India",
    keyQuoteOrEmblem: "ਲਾਹੌਰ ਦਰਬਾਰ • Unbroken Sovereign Spirit of Punjab",
  },
  {
    id: "bibi-gulab-kaur",
    numeral: "੧੨",
    name: "Bibi Gulab Kaur (Ghadar Party Revolutionary)",
    gurmukhiName: "ਬੀਬੀ ਗੁਲਾਬ ਕੌਰ (ਗ਼ਦਰ ਲਹਿਰ)",
    era: "c. 1890 – 1941 CE",
    region: "Bakshiwala (Sangrur), Manila & Lahore",
    category: "Battlefield Commanders",
    roleTitle: "Ghadar Revolutionary & Clandestine Printing-Press Commander",
    shortSummary:
      "Abandoned plans to migrate to America in Manila (1914) to join the Ghadar Party, operated a secret revolutionary press, and endured two years of torture in Lahore's Shahi Qila.",
    fullBiography:
      "Born in village Bakshiwala in Sangrur district, Bibi Gulab Kaur traveled to Manila in the Philippines in 1914 on her way to California. Hearing the call of the Ghadar Party to liberate India from British rule, she renounced her personal comforts, boarded the SS Korea back to Punjab with fifty Ghadarites, and operated a clandestine printing press in Jalandhar disguised as a journalist's press pass holder. She distributed revolutionary literature and arms to Ghadar cells across Kapurthala, Hoshiarpur, and Gurdaspur until her arrest and brutal two-year imprisonment in Lahore Fort (Shahi Qila).",
    historiographicalNote:
      "While Kartar Singh Sarabha and Baba Sohan Singh Bhakna are widely celebrated, Bibi Gulab Kaur's frontline role in the 1914–1915 Ghadar uprising deserves equal prominence.",
    primaryCitation: "Ghadar Party Trial Records (Lahore Conspiracy Case) & Desh Bhagat Yaadgar Hall",
    keyQuoteOrEmblem: "ਗ਼ਦਰ ਗੂੰਜ • Frontline Revolutionary of 1914–1915",
  },
  {
    id: "bibi-upkar-kaur-1984",
    numeral: "੧੩",
    name: "Bibi Upkar Kaur & the Mothers of the 1978–1984 Morchas",
    gurmukhiName: "ਬੀਬੀ ਉਪਕਾਰ ਕੌਰ ਅਤੇ ੧੯੭੮–੧੯੮੪ ਦੀਆਂ ਬੀਬੀਆਂ",
    era: "1978 – 1984 CE & Beyond",
    region: "Amritsar, Delhi & Across Punjab",
    category: "Martyrs of 1700s & 1984",
    roleTitle: "Martyrs, Eyewitnesses & Human-Rights Defenders of 1978–1984",
    shortSummary:
      "Honoring the women who courted arrest during the Dharam Yudh Morcha, defended Sri Harmandir Sahib in June 1984, and fought for decades in courts for justice after November 1984.",
    fullBiography:
      "From Bibi Upkar Kaur, Bibi Pritam Kaur, and the thousands of women jathas who peacefully courted arrest during the 1982–1984 Dharam Yudh Morcha, to the women, mothers, and children martyred inside the Parikrama of Sri Harmandir Sahib during the June 1984 military assault on Guru Arjan Dev Ji's martyrdom day, and the widows of Tilak Vihar (such as Bibi Nirpreet Kaur, Bibi Jagdish Kaur, and Bibi Darshan Kaur) who testified fearlessly for over three decades against state-backed perpetrators of the November 1984 pogroms—modern Sikh history has been carried on the shoulders of resilient Kaurs.",
    historiographicalNote:
      "Without the unwavering courtroom testimony and grassroots documentation of the mothers and widows of 1984, the historical record of contemporary Sikh human rights would have been silenced.",
    primaryCitation: "Ensaaf Documentation, 1984 Tribute Archive & Misra/Nanavati Commission Testimonies",
    keyQuoteOrEmblem: "ਇਨਸਾਫ਼ ਅਤੇ ਸ਼ਹਾਦਤ • Witness & Resilience (1978–1984)",
  },
];

const CATEGORIES: ("All" | MatriarchCategory)[] = [
  "All",
  "Spiritual Pioneers",
  "Battlefield Commanders",
  "Scholars & Diplomats",
  "Martyrs of 1700s & 1984",
];

export default function MatriarchsPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<"All" | MatriarchCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeProfile, setActiveProfile] = useState<MatriarchProfile | null>(
    null
  );

  const filteredProfiles = useMemo(() => {
    return MATRIARCH_PROFILES.filter((p) => {
      const catMatch =
        selectedCategory === "All" || p.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return catMatch;
      return (
        catMatch &&
        (p.name.toLowerCase().includes(q) ||
          p.roleTitle.toLowerCase().includes(q) ||
          p.shortSummary.toLowerCase().includes(q) ||
          p.region.toLowerCase().includes(q) ||
          p.gurmukhiName.includes(q))
      );
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EE] text-[#171917]">
      <Header solid />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 pb-28">
        {/* Hero Banner */}
        <section className="rounded-3xl border border-[#C59B27]/40 bg-[#1B2A20] p-8 md:p-10 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#C59B27] px-3 py-1 rounded-full border border-[#C59B27]/40 bg-[#121C15]">
                  SOVEREIGN EQUALITY ARCHIVE • ANG 473 &amp; ANG 967
                </span>
                <span lang="pa" className="font-gurmukhi text-sm text-[#D97706]">
                  ਸੋ ਕਿਉ ਮੰਦਾ ਆਖੀਐ ਜਿਤੁ ਜੰਮਹਿ ਰਾਜਾਨ
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight">
                The Unsung Matriarchs &amp; Warriors of the Panth
              </h1>
              <p className="text-sm sm:text-base text-[#4A554E] leading-relaxed">
                Over five centuries before modern gender movements, Guru Nanak Dev Ji declared the
                sovereign dignity of women on Ang 473. Explore 13 foundational Sikh women—spiritual
                pioneers, battlefield commanders, scriptural scholars, and martyrs from 1469 to
                1984—with primary historical citations.
              </p>
            </div>

            <div className="shrink-0 p-5 rounded-2xl bg-[#121C15] border border-[#C59B27]/40 text-center max-w-xs">
              <p
                lang="pa"
                className="font-gurmukhi text-xl font-semibold text-[#C59B27]"
              >
                ਸੋ ਕਿਉ ਮੰਦਾ ਆਖੀਐ ਜਿਤੁ ਜੰਮਹਿ ਰਾਜਾਨ ॥
              </p>
              <p className="text-xs text-[#4A554E] mt-1.5 italic">
                &ldquo;Why call her inferior, from whom sovereigns are born?&rdquo;
              </p>
              <span className="text-[11px] font-bold text-[#D97706] block mt-1">
                — Sri Guru Granth Sahib Ji, Ang 473
              </span>
            </div>
          </div>
        </section>

        {/* Category Filter Pills & Search Bar */}
        <section className="p-6 rounded-2xl bg-[#1B2A20] border border-[#C59B27]/35 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] shadow-sm"
                    : "bg-[#121C15] border border-[#C59B27]/35 text-[#4A554E] hover:border-[#C59B27]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="w-full lg:w-80">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, battle, or era..."
              aria-label="Search Matriarchs and Warriors"
              className="w-full rounded-xl border border-[#C59B27]/45 bg-[#121C15] px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#C59B27]"
            />
          </div>
        </section>

        {/* 13 Matriarchs & Warriors Grid (Max 3 per row) */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProfiles.map((profile) => (
            <article
              key={profile.id}
              className="rounded-2xl border border-[#C59B27]/40 bg-[#1B2A20] p-6 shadow-sm hover:border-[#C59B27] hover:-translate-y-0.5 transition flex flex-col justify-between gap-5"
            >
              <div className="space-y-3">
                <ChitrakariCardHeader
                  artKey={profile.id}
                  variant={
                    profile.category === "Battlefield Commanders"
                      ? "warrior"
                      : "woman"
                  }
                  title={profile.name}
                  heightClass="h-44"
                  editable
                />

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <SikhiIcon
                      name={
                        profile.category === "Battlefield Commanders"
                          ? "dhaal"
                          : "lotus-dome"
                      }
                      size={26}
                    />
                    <span
                      lang="pa"
                      className="h-8 w-8 rounded-lg bg-[#121C15] border border-[#C59B27]/40 font-gurmukhi text-sm font-bold text-[#C59B27] flex items-center justify-center"
                    >
                      {profile.numeral}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#C59B27] px-2.5 py-1 rounded-full bg-[#121C15] border border-[#C59B27]/30">
                    {profile.category}
                  </span>
                </div>

                <div>
                  <p
                    lang="pa"
                    className="font-gurmukhi text-base font-medium text-[#D97706]"
                  >
                    {profile.gurmukhiName}
                  </p>
                  <h2 className="text-xl font-serif font-bold mt-0.5">
                    {profile.name}
                  </h2>
                  <p className="text-xs font-semibold text-[#C59B27] mt-0.5">
                    {profile.roleTitle}
                  </p>
                  <p className="text-[11px] text-[#4A554E] mt-1">
                    {profile.era} • {profile.region}
                  </p>
                </div>

                <p className="text-sm text-[#4A554E] leading-relaxed">
                  {profile.shortSummary}
                </p>

                <div className="p-3 rounded-xl bg-[#121C15] border border-[#C59B27]/25 text-xs font-medium text-[#C59B27]">
                  {profile.keyQuoteOrEmblem}
                </div>
              </div>

              <div className="pt-3 border-t border-[#C59B27]/25 flex items-center justify-between gap-3">
                <span className="text-[11px] text-[#4A554E] truncate">
                  {profile.primaryCitation}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveProfile(profile)}
                  className="shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider shadow-sm hover:brightness-105 transition"
                >
                  Read Biography →
                </button>
              </div>
            </article>
          ))}
        </section>

        {/* Expandable Biography & Primary Citation Modal */}
        <AnimatedModal open={!!activeProfile}>
          {activeProfile && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label={activeProfile.name}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setActiveProfile(null);
                }
              }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 overflow-hidden"
            >
              <div className="w-full max-w-2xl max-h-[82vh] flex flex-col rounded-2xl bg-[#FAF7F0] text-[#18181B] shadow-2xl overflow-hidden border border-[#C59B27]/50">
                {/* Sticky Top Header */}
                <div className="shrink-0 px-6 py-4 border-b border-[#C59B27]/25 flex justify-between items-center gap-4 bg-[#FAF7F0]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-800 px-2.5 py-0.5 rounded bg-amber-100 border border-amber-600/30">
                        {activeProfile.category}
                      </span>
                      <span className="text-xs text-zinc-600">
                        {activeProfile.era} • {activeProfile.region}
                      </span>
                    </div>
                    <p
                      lang="pa"
                      className="font-gurmukhi text-lg font-semibold text-amber-700"
                    >
                      {activeProfile.gurmukhiName}
                    </p>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-900 truncate">
                      {activeProfile.name}
                    </h2>
                    <p className="text-xs sm:text-sm font-semibold text-amber-800 mt-0.5">
                      {activeProfile.roleTitle}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveProfile(null)}
                    aria-label="Close biography modal"
                    className="shrink-0 px-3.5 py-2 rounded-xl border border-amber-700/35 bg-white text-zinc-900 text-xs font-bold hover:border-amber-700 transition"
                  >
                    ✕ Close
                  </button>
                </div>

                {/* Independently Scrollable Body */}
                <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5">
                  <ChitrakariCardHeader
                    artKey={activeProfile.id}
                    variant={
                      activeProfile.category === "Battlefield Commanders"
                        ? "warrior"
                        : "woman"
                    }
                    title={activeProfile.name}
                    heightClass="h-48"
                    editable
                  />

                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-[#F2E9D8] border border-amber-700/25 space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">
                        ੧ · Historical Biography &amp; Sovereign Contributions
                      </h3>
                      <p className="text-sm sm:text-base leading-relaxed text-zinc-900">
                        {activeProfile.fullBiography}
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#F2E9D8] border border-amber-700/25 space-y-2">
                      <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-amber-800">
                        ੨ · Confronting Historiographical Silence
                      </h3>
                      <p className="text-sm leading-relaxed text-zinc-800">
                        {activeProfile.historiographicalNote}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F2E9D8] border border-amber-700/25 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <span className="font-bold uppercase tracking-wider text-amber-800">
                        Primary Historical &amp; Scriptural Citation:
                      </span>
                      <span className="font-semibold text-zinc-900">
                        {activeProfile.primaryCitation}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-amber-700/20">
                    <Link
                      href="/ask"
                      className="text-xs font-bold text-amber-800 hover:underline"
                    >
                      Research {activeProfile.name} in Scriptural Inquiry →
                    </Link>
                    <button
                      type="button"
                      onClick={() => setActiveProfile(null)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C59B27] to-[#D97706] text-[#18181B] text-xs font-bold uppercase tracking-wider"
                    >
                      Done Reading
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </AnimatedModal>
      </main>

      <Footer />
    </div>
  );
}
