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
import type { PrayerCurrentStatus, PrayerTimes } from "../api/islamic.api";

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

function describeNextPrayer(status: PrayerCurrentStatus): string {
  if (!status.next_prayer) {
    return `Next: ${PRAYER_LABELS.fajr} tomorrow`;
  }
  const label =
    PRAYER_LABELS[status.next_prayer as keyof PrayerTimes] ?? status.next_prayer;
  return `Next: ${label} in ${status.time_until_next}`;
}

/** Today's prayer times for the clinic's location, from UmmahAPI. */
export function PrayerTimesCard() {
  const { data, isLoading, isError } = usePrayerTimes();

  return (
    <Card className="h-full border-2 border-islamic bg-linear-to-br from-islamic/20 to-islamic/0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-islamic-foreground">
          <Moon className="size-4" />
          Prayer times
        </CardTitle>
        <CardDescription>
          {data ? describeNextPrayer(data.current_status) : "Today's prayer schedule"}
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
                    isCurrent && "border-islamic-foreground bg-islamic/5",
                  )}
                >
                  <div className="flex gap-1">
                    <span className="text-xs text-islamic-foreground/90">
                      {PRAYER_LABELS[key]}
                    </span>
                    {isCurrent && (
                      <Badge
                        variant="islamic"
                        className="w-fit h-4 px-1 text-[10px] font-normal"
                      >
                        Now
                      </Badge>
                    )}
                  </div>
                  <span className="text-sm font-semibold tabular-nums text-islamic-foreground">
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
