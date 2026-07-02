import axios from "axios";

// UmmahAPI is a public, unauthenticated third-party service — a separate axios
// instance from the sidecar's `api` client (different base URL, no bearer token).
const ummah = axios.create({ baseURL: "https://ummahapi.com/api" });

export type Dua = {
  id: number;
  category: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  source: string;
  repeat: number;
};

export type PrayerTimes = {
  imsak: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
};

export type PrayerCurrentStatus = {
  current_prayer: string;
  next_prayer: string;
  time_until_next: string;
  minutes_until_next: number;
};

export type PrayerTimesResult = {
  date: string;
  timezone: string;
  prayer_times: PrayerTimes;
  current_status: PrayerCurrentStatus;
};

export const islamicApi = {
  randomDua: async () => {
    const res = await ummah.get<{ data: Dua }>("/duas/random");
    return res.data.data;
  },
  prayerTimes: async (
    lat: number,
    lng: number,
    method: string,
    madhab: string,
  ) => {
    const res = await ummah.get<{ data: PrayerTimesResult }>("/prayer-times", {
      params: { lat, lng, method, madhab },
    });
    return res.data.data;
  },
};
