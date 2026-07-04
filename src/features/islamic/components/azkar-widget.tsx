import { RefreshCw, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useRandomDua } from "../hooks/use-islamic";

/** A rotating dhikr / du'ā widget, fed by a random dua from UmmahAPI. */
export function AzkarWidget() {
  const { data, isLoading, isFetching, isError, refetch } = useRandomDua();

  return (
    <Card className="bg-linear-to-br from-islamic/20 to-secondary/5 border-2 border-islamic">
      <CardContent className="flex items-center gap-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-islamic/50 text-islamic-foreground">
          <Sparkles className="size-4" />
        </div>

        <div className="min-w-0 flex-1 items-center space-y-1 text-islamic-foreground">
          {isLoading ? (
            <>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </>
          ) : isError || !data ? (
            <p className="text-sm">
              Could not load a dua right now.
            </p>
          ) : (
            <>
              <p dir="rtl" className="text-lg font-medium leading-relaxed">
                {data.arabic}
              </p>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label="Next dua"
          className="shrink-0"
        >
          <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
        </Button>
      </CardContent>
    </Card>
  );
}
