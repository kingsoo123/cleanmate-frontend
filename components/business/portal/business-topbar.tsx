"use client";

import Link from "next/link";

export function BusinessTopbar({
  title,
  businessName,
  periodLabel,
  onMenuClick,
}: {
  title: string;
  businessName: string;
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
        <button
          type="button"
          className="relative rounded-full p-2 hover:bg-secondary-surface"
          aria-label="Notifications"
        >
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand" />
          <svg className="h-5 w-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light text-xs font-bold text-brand">
          SB
        </div>
      </div>
    </header>
  );
}
