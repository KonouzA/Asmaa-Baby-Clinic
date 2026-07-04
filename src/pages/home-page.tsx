import { Link } from "react-router";
import {
  Users,
  Stethoscope,
  FileBarChart,
  CalendarCheck,
  CalendarClock,
  TrendingUp,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, useLogout } from "@/features/auth";
import { usePageHeader } from "@/components/main-layout";
import { cn } from "@/lib/utils";
import {
  DashboardTrendChart,
  ReportStatCard,
  TodayQueueCard,
  formatCurrency,
  useDashboard,
} from "@/features/reports";
import { AzkarWidget, PrayerTimesCard } from "@/features/islamic";

const now = new Date();

type NavCard = {
  title: string;
  description: string;
  to: string;
  icon: LucideIcon;
  iconClass: string;
  glowClass: string;
  titleClass: string;
  borderClass: string;
};

const NAV_CARDS: NavCard[] = [
  {
    title: "Patients",
    description:
      "Browse and manage patient records, allergies, problems, medications and immunizations.",
    to: "/patients",
    icon: Users,
    iconClass: "from-primary to-primary/70 text-primary-foreground",
    glowClass: "bg-primary/60",
    titleClass: "text-primary",
    borderClass: "border-primary/40",
  },
  {
    title: "Visits",
    description:
      "Record exams, diagnoses, screenings, growth measurements and visit attachments.",
    to: "/visits",
    icon: Stethoscope,
    iconClass: "from-secondary to-secondary/70 text-secondary-foreground",
    glowClass: "bg-secondary/60",
    titleClass: "text-secondary",
    borderClass: "border-secondary/40",
  },
  {
    title: "Reports",
    description:
      "Review monthly activity, fees collected and cost breakdowns at a glance.",
    to: "/reports",
    icon: FileBarChart,
    iconClass: "from-accent to-accent/70 text-accent-foreground",
    glowClass: "bg-accent/60",
    titleClass: "text-accent",
    borderClass: "border-accent/40",
  },
];

export function HomePage() {
  const { user } = useAuth();
  const logout = useLogout();
  const { data: dashboard, isLoading: dashLoading } = useDashboard();

  const thisMonth = dashboard?.trend.find(
    (t) => t.month === now.getMonth() + 1 && t.year === now.getFullYear(),
  );

  usePageHeader({
    breadcrumbs: [],
    action: {
      label: "Log out",
      icon: LogOut,
      onClick: () => logout.mutate(),
      disabled: logout.isPending,
    },
  });

  return (
    <main className="relative overflow-hidden">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-10 md:px-10 md:py-14 2xl:max-w-[96rem]">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back Dr.
            {user?.displayName ? ` ${user.displayName}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">
            Jump to any section of the clinic dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {NAV_CARDS.map((nav) => (
            <Link
              key={nav.to}
              to={nav.to}
              className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="spotlight-card relative h-full overflow-hidden rounded-xl bg-border p-px transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg">
                <Card
                  className={cn(
                    "relative h-full border-2 ring-0 transition-all duration-300 ease-in-out group-hover:bg-card/90 group-hover:backdrop-blur-[20px]",
                    nav.borderClass,
                  )}
                >
                  <ArrowUpRight
                    className={cn(
                      "absolute right-3 top-3 size-4 opacity-60 transition-all duration-300 ease-in-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100",
                      nav.titleClass,
                    )}
                    strokeWidth={2.5}
                  />
                  <CardHeader>
                    <div
                      className={cn(
                        "mb-3 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm transition-transform duration-300 ease-in-out group-hover:scale-110",
                        nav.iconClass,
                      )}
                    >
                      <nav.icon className="size-6" strokeWidth={2} />
                    </div>
                    <CardTitle
                      className={cn(
                        "text-2xl font-bold tracking-tight transition-all duration-300 ease-in-out group-hover:brightness-110 group-hover:saturate-150",
                        nav.titleClass,
                      )}
                    >
                      {nav.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground">
                    {nav.description}
                  </CardContent>
                </Card>

                <div
                  className={cn(
                    "blob pointer-events-none absolute left-0 top-0 size-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 ease-in-out",
                    nav.glowClass,
                  )}
                />
                <div className="fake-blob pointer-events-none absolute left-0 top-0 size-24 rounded-full" />
              </div>
            </Link>
          ))}
        </div>

        {/* Dashboard */}
        <div className="mt-10 space-y-6">
          {/* Dashboard grid: left panel (KPIs + charts) and right panel (prayer times) */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
            {/* Left column: KPIs, queue, and trend */}
            <div className="lg:col-span-3 flex flex-col gap-5">
              {/* KPI strip */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <ReportStatCard
                  label="Today's visits"
                  value={String(dashboard?.today_count ?? 0)}
                  icon={CalendarCheck}
                  isLoading={dashLoading}
                />
                <ReportStatCard
                  label="Upcoming"
                  value={String(dashboard?.upcoming_count ?? 0)}
                  icon={CalendarClock}
                  isLoading={dashLoading}
                />
                <ReportStatCard
                  label="Total patients"
                  value={String(dashboard?.total_patients ?? 0)}
                  icon={Users}
                  isLoading={dashLoading}
                />
                <ReportStatCard
                  label="Net this month"
                  value={formatCurrency(thisMonth?.net ?? 0)}
                  tone={
                    (thisMonth?.net ?? 0) > 0
                      ? "positive"
                      : (thisMonth?.net ?? 0) < 0
                        ? "negative"
                        : "default"
                  }
                  icon={TrendingUp}
                  isLoading={dashLoading}
                />
              </div>

              {/* Today's queue and trend chart */}
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <TodayQueueCard />
                <DashboardTrendChart
                  trend={dashboard?.trend}
                  isLoading={dashLoading}
                />
              </div>
            </div>

            {/* Right column: Prayer times (narrower on desktop, full width on mobile) */}
            <PrayerTimesCard />
          </div>

          {/* Doaa & Azkar */}
          <AzkarWidget />
        </div>
      </div>
    </main>
  );
}
