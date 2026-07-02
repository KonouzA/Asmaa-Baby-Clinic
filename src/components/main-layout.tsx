import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  ArrowLeftIcon,
  ChevronsRightIcon,
  HomeIcon,
  Settings,
  type LucideIcon,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Fragment } from "react";

export type Crumb = {
  label: string;
  to?: string;
  icon?: LucideIcon;
};

export type PageAction = {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: React.ComponentProps<typeof Button>["variant"];
  disabled?: boolean;
};

export type PageHeaderConfig = {
  breadcrumbs?: Crumb[];
  action?: PageAction | null;
};

type PageHeaderContextValue = {
  config: PageHeaderConfig;
  setConfig: (config: PageHeaderConfig) => void;
};

const PageHeaderContext = createContext<PageHeaderContextValue | null>(null);

export function usePageHeader(config: PageHeaderConfig) {
  const ctx = useContext(PageHeaderContext);
  if (!ctx) {
    throw new Error("usePageHeader must be used within <MainLayout>");
  }
  const { setConfig } = ctx;

  const key = JSON.stringify({
    breadcrumbs: config.breadcrumbs?.map((c) => [c.label, c.to]),
    action: config.action === null ? null : config.action?.label,
  });

  useEffect(() => {
    setConfig(config);
    return () => setConfig({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, setConfig]);
}

export function MainLayout() {
  const [config, setConfig] = useState<PageHeaderConfig>({});
  const value = useMemo(() => ({ config, setConfig }), [config]);

  return (
    <PageHeaderContext.Provider value={value}>
      <div className="flex min-h-svh flex-col bg-background">
        <PageHeader config={config} />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </PageHeaderContext.Provider>
  );
}

function PageHeader({ config }: { config: PageHeaderConfig }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  const action: PageAction | null =
    config.action === undefined
      ? isHome
        ? null
        : { label: "Back", icon: ArrowLeftIcon, onClick: () => navigate(-1) }
      : config.action;

  const ActionIcon = action?.icon;

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-3 md:px-10 2xl:max-w-[96rem]">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <img
              src="/logo.webp"
              alt="Asmaa Baby Clinic"
              className="size-10 object-contain"
            />
            <span className="hidden text-base font-semibold tracking-tight sm:inline">
              Asmaa Baby Clinic
            </span>
          </Link>

          <span className="hidden h-6 w-px shrink-0 bg-border sm:block" />

          <HeaderBreadcrumbs crumbs={config.breadcrumbs ?? []} />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => navigate(`/settings`)}
          >
            <Settings className="size-4" />
          </Button>

          {action && (
            <Button
              variant={action.variant ?? "outline"}
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {ActionIcon && <ActionIcon className="size-4" />}
              {action.label}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

function HeaderBreadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <Breadcrumb className="min-w-0">
      <BreadcrumbList className="flex-nowrap">
        <BreadcrumbItem>
          {crumbs.length === 0 ? (
            <BreadcrumbPage className="flex items-center gap-1">
              <HomeIcon className="size-4" />
              <span className="hidden sm:inline">Home</span>
            </BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <Link to="/" className="flex items-center gap-1">
                <HomeIcon className="size-4" />
                <span className="sr-only">Home</span>
              </Link>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>

        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          const Icon = crumb.icon;
          return (
            <Fragment key={`${crumb.label}-${i}`}>
              <BreadcrumbSeparator>
                <ChevronsRightIcon />
              </BreadcrumbSeparator>
              <BreadcrumbItem className="min-w-0">
                {isLast || !crumb.to ? (
                  <BreadcrumbPage className="flex items-center gap-1 truncate">
                    {Icon && <Icon className="size-4 shrink-0" />}
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      to={crumb.to}
                      className="flex items-center gap-1 truncate"
                    >
                      {Icon && <Icon className="size-4 shrink-0" />}
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<PageHeaderConfig>({});
  const value = useMemo(() => ({ config, setConfig }), [config]);
  return (
    <PageHeaderContext.Provider value={value}>
      {children}
    </PageHeaderContext.Provider>
  );
}
