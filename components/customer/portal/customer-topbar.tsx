"use client";

import Link from "next/link";

export function CustomerTopbar({
  title,
  customerName,
  onMenuClick,
}: {
  title: string;
  customerName: string;
  onMenuClick: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur sm:h-16 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 hover:bg-secondary-surface lg:hidden"
          aria-label="Open menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div className="min-w-0 lg:hidden">
          <p className="truncate text-base font-semibold text-foreground">{title}</p>
        </div>
        <div className="hidden min-w-0 lg:block">
          <p className="text-lg font-semibold text-foreground">{title}</p>
          <p className="truncate text-xs text-muted">{customerName}</p>
        </div>
      </div>
      <Link
        href="/customer/pickups/new"
        className="rounded-full bg-brand-dark px-4 py-2 text-xs font-semibold text-white hover:opacity-90 sm:text-sm"
      >
        Request pickup
      </Link>
    </header>
  );
}
