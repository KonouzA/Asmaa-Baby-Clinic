// Public surface of the islamic feature (dua + prayer times, via UmmahAPI).

export { AzkarWidget } from "./components/azkar-widget";
export { PrayerTimesCard } from "./components/prayer-times-card";

export { useRandomDua, usePrayerTimes } from "./hooks/use-islamic";
export { islamicApi } from "./api/islamic.api";

export type {
  Dua,
  PrayerTimes,
  PrayerCurrentStatus,
  PrayerTimesResult,
} from "./api/islamic.api";
