import { useEffect, type CSSProperties } from "react";
import { Link } from "react-router";
import {
  Users,
  Stethoscope,
  FileBarChart,
  type LucideIcon,
} from "lucide-react";
import { LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth, useLogout } from "@/features/auth";
import { usePageHeader } from "@/components/main-layout";
import { cn } from "@/lib/utils";

type NavCard = {
  title: string;
  description: string;
  to: string;
  icon: LucideIcon;
  iconClass: string;
  glowClass: string;
  titleClass: string;
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
  },
];

export function HomePage() {
  const { user } = useAuth();
  const logout = useLogout();

  usePageHeader({
    breadcrumbs: [],
    action: {
      label: "Log out",
      icon: LogOut,
      onClick: () => logout.mutate(),
      disabled: logout.isPending,
    },
  });

  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>(".spotlight-card");

    const handleMouseMove = (ev: MouseEvent) => {
      cards.forEach((card) => {
        const blob = card.querySelector<HTMLElement>(".blob");
        const fblob = card.querySelector<HTMLElement>(".fake-blob");
        if (!blob || !fblob) return;

        const rec = fblob.getBoundingClientRect();
        blob.style.opacity = "1";
        blob.animate(
          [
            {
              transform: `translate(${
                ev.clientX - rec.left - rec.width / 2
              }px, ${ev.clientY - rec.top - rec.height / 2}px)`,
            },
          ],
          { duration: 300, fill: "forwards" },
        );
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <main className="relative min-h-svh overflow-hidden">
      {/* Floating decorative shapes */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <img
          src="/A.webp"
          alt=""
          className="floating-shape absolute -left-6 top-24 w-24 blur-[1px] md:w-32"
          style={
            {
              "--float-anim": "float-a",
              "--float-duration": "9s",
              "--fade-duration": "11s",
              "--float-delay": "0s",
            } as CSSProperties
          }
        />
        <img
          src="/B.webp"
          alt=""
          className="floating-shape absolute right-[8%] top-12 w-20 blur-[1px] md:w-28"
          style={
            {
              "--float-anim": "float-b",
              "--float-duration": "11s",
              "--fade-duration": "13s",
              "--float-delay": "1.5s",
            } as CSSProperties
          }
        />
        <img
          src="/C.webp"
          alt=""
          className="floating-shape absolute bottom-16 left-[12%] w-24 blur-[1px] md:w-32"
          style={
            {
              "--float-anim": "float-c",
              "--float-duration": "10s",
              "--fade-duration": "12s",
              "--float-delay": "0.8s",
            } as CSSProperties
          }
        />
        <img
          src="/A.webp"
          alt=""
          className="floating-shape absolute -right-4 bottom-24 w-16 blur-[1px] md:w-20"
          style={
            {
              "--float-anim": "float-c",
              "--float-duration": "13s",
              "--fade-duration": "9s",
              "--float-delay": "2.2s",
            } as CSSProperties
          }
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
            {user?.displayName ? `, ${user.displayName}` : ""} 👋
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
                <Card className="h-full ring-0 transition-all duration-300 ease-in-out group-hover:bg-card/90 group-hover:backdrop-blur-[20px]">
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
      </div>
    </main>
  );
}
