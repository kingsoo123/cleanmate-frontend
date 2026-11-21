"use client";

import Link from "next/link";
import { LogoutButton } from "@/components/auth/logout-button";
import { CustomerMobileNavMenu } from "@/components/customer/portal/customer-mobile-nav-menu";
import { CustomerNotificationBell } from "@/components/customer/portal/customer-notification-bell";

export function CustomerTopbar({
  title,
  customerName,
}: {
  title: string;
  customerName: string;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur sm:h-16 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <CustomerMobileNavMenu />
        <div className="min-w-0 xl:hidden">
          <p className="truncate text-base font-semibold text-foreground">{title}</p>
        </div>
        <div className="hidden min-w-0 xl:block">
          <p className="text-lg font-semibold text-foreground">{title}</p>
          <p className="truncate text-xs text-muted">{customerName}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <CustomerNotificationBell />
        <LogoutButton
          role="customer"
          className="hidden rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary-surface sm:inline-flex"
        />
        <Link
          href="/customer/pickups/new"
          className="rounded-full bg-brand-dark px-4 py-2 text-xs font-semibold text-white hover:opacity-90 sm:text-sm"
        >
          Request pickup
        </Link>
      </div>
    </header>
  );
}