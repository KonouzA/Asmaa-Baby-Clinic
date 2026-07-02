import { useQuery } from "@tanstack/react-query";
import { islamicApi } from "../api/islamic.api";

// Clinic location, used to compute prayer times.
const CLINIC_LAT = 27.27694059350061;
const CLINIC_LNG = 31.283667665958983;
const CALCULATION_METHOD = "Egyptian";
const MADHAB = "Hanafi";

export function useRandomDua() {
  return useQuery({
    queryKey: ["islamic", "dua"],
    queryFn: () => islamicApi.randomDua(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function usePrayerTimes() {
  return useQuery({
    queryKey: ["islamic", "prayer-times", CLINIC_LAT, CLINIC_LNG],
    queryFn: () =>
      islamicApi.prayerTimes(CLINIC_LAT, CLINIC_LNG, CALCULATION_METHOD, MADHAB),
    staleTime: 5 * 60 * 1000,
    // Refresh periodically so "current/next prayer" stays accurate through the day.
    refetchInterval: 5 * 60 * 1000,
  });
}
