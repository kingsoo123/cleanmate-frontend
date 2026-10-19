import type { ReactNode } from "react";
import { appStoreUrl, playStoreUrl } from "@/lib/app-download-links";

function StoreBadge({
  href,
  label,
  title,
  subtitle,
  icon,
}: {
  href: string;
  label: string;
  title: string;
  subtitle: string;
  icon: ReactNode;
}) {
  const isPlaceholder = href === "#";

  return (
    <a
      href={href}
      aria-label={label}
      {...(!isPlaceholder && { target: "_blank", rel: "noopener noreferrer" })}
      className={`inline-flex h-[3.25rem] min-w-[10.5rem] items-center gap-3 rounded-xl border border-foreground/10 bg-brand-dark px-4 text-white shadow-sm transition-opacity hover:opacity-90 ${
        isPlaceholder ? "pointer-events-none opacity-90" : ""
      }`}
    >
      {icon}
      <span className="flex flex-col leading-tight">
        <span className="text-[10px] font-medium uppercase tracking-wide opacity-90">
          {subtitle}
        </span>
        <span className="text-sm font-semibold">{title}</span>
      </span>
    </a>
  );
}

function AppleIcon() {
  return (
    <svg className="h-7 w-7 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.08 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="h-7 w-7 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M3 20.5V3.5C3 2.91 3.34 2.39 3.84 2.15L13.69 12 3.84 21.85c-.5-.24-.84-.76-.84-1.35z" />
      <path fill="#FBBC04" d="M16.81 15.12 6.05 21.34l8.64-8.64 2.12 2.42z" />
      <path fill="#4285F4" d="M20.16 10.81c.48.27.76.78.76 1.31s-.28 1.04-.76 1.31l-2.12 1.22-2.54-2.54 2.54-2.54 2.12 1.24z" />
      <path fill="#34A853" d="M6.05 2.66l10.76 6.22-2.12 2.42L6.05 2.66z" />
    </svg>
  );
}

export function AppDownloadButtons() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
      <StoreBadge
        href={appStoreUrl}
        label="Download on the App Store"
        subtitle="Download on the"
        title="App Store"
        icon={<AppleIcon />}
      />
      <StoreBadge
        href={playStoreUrl}
        label="Get it on Google Play"
        subtitle="Get it on"
        title="Google Play"
        icon={<PlayIcon />}
      />
    </div>
  );
}
