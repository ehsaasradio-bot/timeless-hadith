/**
 * Mock data for the Hadith Reader Dashboard.
 *
 * IMPORTANT: All numbers/strings are deterministic so server-rendered output
 * matches the client and no hydration mismatch occurs. Do NOT introduce
 * Math.random() or new Date() inside render — pre-compute values here.
 */

import type { StatusAccent } from "@/src/lib/design/tokens";

export type ReadingStat = {
  id: string;
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "up" | "down" | "neutral";
  accent: StatusAccent;
  icon: "book" | "check" | "hourglass" | "bookmark";
};

export type WeeklyBar = {
  day: string;
  count: number;
};

export type ContinueReadingItem = {
  id: string;
  collection: string;
  bookName: string;
  hadithNumber: number;
  arabicSnippet: string;
  englishSnippet: string;
  progressPct: number;
  coverHue: string;
};

export type Narrator = {
  id: string;
  name: string;
  honorific: string;
  hadithCount: number;
  initials: string;
  hue: string;
};

export type ReadingTimeBar = {
  day: string;
  label: string; // e.g., "1h 10m"
  minutes: number;
};

export type DailyHadith = {
  id: string;
  arabic: string;
  english: string;
  reference: string;
};

export type RecommendedHadith = {
  id: string;
  collection: string;
  hadithNumber: number;
  topic: string;
  arabic: string;
  english: string;
  reason: string; // why recommended
  score: number;
};

export const stats: ReadingStat[] = [
  {
    id: "total",
    label: "Total Hadith Read",
    value: "1,240",
    delta: "18% from last month",
    deltaTone: "up",
    accent: "brand",
    icon: "book",
  },
  {
    id: "completed",
    label: "Completed Collections",
    value: "3",
    delta: "2 from last month",
    deltaTone: "up",
    accent: "blue",
    icon: "check",
  },
  {
    id: "in-progress",
    label: "In Progress",
    value: "2",
    delta: "Keep going",
    deltaTone: "neutral",
    accent: "amber",
    icon: "hourglass",
  },
  {
    id: "bookmarked",
    label: "Bookmarked",
    value: "45",
    delta: "7 new this week",
    deltaTone: "up",
    accent: "violet",
    icon: "bookmark",
  },
];

export const weeklyReading: WeeklyBar[] = [
  { day: "Sun", count: 80 },
  { day: "Mon", count: 120 },
  { day: "Tue", count: 90 },
  { day: "Wed", count: 150 },
  { day: "Thu", count: 100 },
  { day: "Fri", count: 70 },
  { day: "Sat", count: 60 },
];

export const continueReading: ContinueReadingItem = {
  id: "bukhari-iman-8",
  collection: "Sahih al-Bukhari",
  bookName: "The Book of Faith (Kitab al-Iman)",
  hadithNumber: 8,
  arabicSnippet:
    "عَنْ عُمَرَ بْنِ الْخَطَّابِ رَضِيَ اللَّهُ عَنْهُ قَالَ سَمِعْتُ رَسُولَ اللَّهِ",
  englishSnippet:
    "Narrated 'Umar ibn al-Khattab: I heard the Messenger of Allah say…",
  progressPct: 65,
  coverHue: "#1f5132",
};

export const topNarrators: Narrator[] = [
  {
    id: "abu-hurairah",
    name: "Abu Hurairah",
    honorific: "raḍiyallāhu ʿanhu",
    hadithCount: 1142,
    initials: "AH",
    hue: "#3a9e5e",
  },
  {
    id: "anas-bin-malik",
    name: "Anas bin Malik",
    honorific: "raḍiyallāhu ʿanhu",
    hadithCount: 982,
    initials: "AM",
    hue: "#2c7f4a",
  },
  {
    id: "abdullah-bin-umar",
    name: "Abdullah bin Umar",
    honorific: "raḍiyallāhu ʿanhumā",
    hadithCount: 856,
    initials: "AU",
    hue: "#25653c",
  },
];

export const readingTimeWeek: ReadingTimeBar[] = [
  { day: "Sun", label: "1h 10m", minutes: 70 },
  { day: "Mon", label: "1h 20m", minutes: 80 },
  { day: "Tue", label: "1h 05m", minutes: 65 },
  { day: "Wed", label: "1h 30m", minutes: 90 },
  { day: "Thu", label: "1h 15m", minutes: 75 },
  { day: "Fri", label: "45m", minutes: 45 },
  { day: "Sat", label: "55m", minutes: 55 },
];

export const totalReadingTime = "07:24:18";

export const dailyHadith: DailyHadith = {
  id: "muslim-2699",
  arabic:
    "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ",
  english:
    "Whoever treads a path seeking knowledge, Allah will ease for him a path to Paradise.",
  reference: "Sahih Muslim 2699",
};

export const overallProgress = {
  pct: 72,
  completed: 1240,
  inProgress: 340,
  remaining: 960,
};

export const userProfile = {
  name: "Abdullah Khan",
  email: "abdullah@email.com",
  initials: "AK",
};

export const sampleRecommendations: RecommendedHadith[] = [
  {
    id: "rec-1",
    collection: "Sahih al-Bukhari",
    hadithNumber: 1,
    topic: "Intentions",
    arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ",
    english: "Actions are by intentions.",
    reason: "Foundational hadith — pairs with your current Iman reading.",
    score: 95,
  },
  {
    id: "rec-2",
    collection: "Sahih Muslim",
    hadithNumber: 55,
    topic: "Sincerity",
    arabic: "الدِّينُ النَّصِيحَةُ",
    english: "The religion is sincere advice.",
    reason: "Same topic family as your bookmarks.",
    score: 88,
  },
  {
    id: "rec-3",
    collection: "Sunan Abi Dawud",
    hadithNumber: 4943,
    topic: "Compassion",
    arabic:
      "لَيْسَ مِنَّا مَنْ لَمْ يَرْحَمْ صَغِيرَنَا وَيُوَقِّرْ كَبِيرَنَا",
    english:
      "He is not of us who does not show mercy to our young or honour our elders.",
    reason: "Recommended based on your recent reading themes.",
    score: 82,
  },
  {
    id: "rec-4",
    collection: "Jami` at-Tirmidhi",
    hadithNumber: 2517,
    topic: "Trust in Allah",
    arabic:
      "احْفَظِ اللَّهَ يَحْفَظْكَ احْفَظِ اللَّهَ تَجِدْهُ تُجَاهَكَ",
    english: "Guard Allah and He will guard you; guard Allah and you will find Him before you.",
    reason: "New narrator — broaden your reading.",
    score: 76,
  },
];
