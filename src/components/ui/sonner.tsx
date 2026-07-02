import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="system"
      richColors
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          "--success-bg":
            "color-mix(in oklab, var(--secondary) 14%, var(--popover))",
          "--success-border":
            "color-mix(in oklab, var(--secondary) 45%, var(--border))",
          "--success-text": "var(--popover-foreground)",
          "--error-bg":
            "color-mix(in oklab, var(--primary) 14%, var(--popover))",
          "--error-border":
            "color-mix(in oklab, var(--primary) 45%, var(--border))",
          "--error-text": "var(--popover-foreground)",
          "--warning-bg":
            "color-mix(in oklab, var(--accent) 16%, var(--popover))",
          "--warning-border":
            "color-mix(in oklab, var(--accent) 45%, var(--border))",
          "--warning-text": "var(--popover-foreground)",
          "--info-bg":
            "color-mix(in oklab, var(--secondary) 16%, var(--popover))",
          "--info-border":
            "color-mix(in oklab, var(--secondary) 45%, var(--border))",
          "--info-text": "var(--popover-foreground)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
