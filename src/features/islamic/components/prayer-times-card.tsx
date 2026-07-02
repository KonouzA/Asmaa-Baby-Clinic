import { Moon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { usePrayerTimes } from "../hooks/use-islamic";
import type { PrayerTimes } from "../api/islamic.api";

const PRAYER_LABELS: Record<keyof PrayerTimes, string> = {
  imsak: "Imsak",
  fajr: "Fajr",
  sunrise: "Sunrise",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

// The 5 daily prayers + sunrise; Imsak is omitted from the card (pre-fajr marker).
const DISPLAY_ORDER: Array<keyof PrayerTimes> = [
  "fajr",
  "sunrise",
  "dhuhr",
  "asr",
  "maghrib",
  "isha",
];

/** Convert a 24h "HH:mm" string to 12-hour am/pm, matching the app-wide time format. */
function to12Hour(time: string): string {
  const [hStr, minute] = time.split(":");
  const hour = Number(hStr);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute} ${period}`;
}

/** Today's prayer times for the clinic's location, from UmmahAPI. */
export function PrayerTimesCard() {
  const { data, isLoading, isError } = usePrayerTimes();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Moon className="size-4 text-muted-foreground" />
          Prayer times
        </CardTitle>
        <CardDescription>
          {data
            ? `Next: ${PRAYER_LABELS[data.current_status.next_prayer as keyof PrayerTimes] ?? data.current_status.next_prayer} in ${data.current_status.time_until_next}`
            : "Today's prayer schedule"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : isError || !data ? (
          <p className="text-sm text-muted-foreground">
            Could not load prayer times right now.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {DISPLAY_ORDER.map((key) => {
              const isCurrent = key === data.current_status.current_prayer;
              return (
                <div
                  key={key}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-lg border px-3 py-2",
                    isCurrent && "border-primary bg-primary/5",
                  )}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">
                      {PRAYER_LABELS[key]}
                    </span>
                    {isCurrent && (
                      <Badge
                        variant="default"
                        className="w-fit h-4 px-1 text-[10px] font-normal"
                      >
                        Now
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {to12Hour(data.prayer_times[key])}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
