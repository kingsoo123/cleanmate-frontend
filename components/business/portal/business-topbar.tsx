"use client";

import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { BusinessNotificationBell } from "@/components/business/portal/business-notification-bell";

export function BusinessTopbar({
  title,
  businessName,
  ownerName,
  ownerInitials,
  periodLabel,
  onMenuClick,
}: {
  title: string;
  businessName: string;
  ownerName?: string;
  ownerInitials?: string;
  periodLabel?: string;
  onMenuClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-surface/95 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-foreground hover:bg-secondary-surface lg:hidden"
          aria-label="Open menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-foreground">{title}</h1>
          <p className="truncate text-xs text-muted">
            {businessName}
            {periodLabel ? ` · ${periodLabel}` : null}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <label className="hidden sm:block">
          <span className="sr-only">Date range</span>
          <select className="rounded-full border border-border bg-secondary-surface px-3 py-1.5 text-xs font-medium text-foreground outline-none focus:border-brand">
            <option>Today</option>
            <option>This week</option>
            <option>This month</option>
            <option>Custom range</option>
          </select>
        </label>
        <Link
          href="/business/orders/new"
          className="hidden rounded-full bg-brand px-4 py-2 text-xs font-semibold text-white hover:opacity-90 sm:inline-flex"
        >
          New order
        </Link>
        <BusinessNotificationBell />
        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light text-xs font-bold text-brand"
          title={ownerName || businessName}
        >
          {ownerInitials ?? "—"}
        </div>
        <LogoutButton
          role="business"
          className="hidden rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary-surface sm:inline-flex"
        />
      </div>
    </header>
  );
}
