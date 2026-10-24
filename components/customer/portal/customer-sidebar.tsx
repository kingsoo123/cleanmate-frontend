"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import {
  useCustomerBrand,
  type CustomerBrand,
} from "@/components/customer/portal/customer-brand-provider";
import { customerNav, isCustomerNavActive } from "@/lib/customer-dashboard/nav";

export function CustomerSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Suspense
      fallback={
        <CustomerSidebarFrame open={open} onClose={onClose} nav={null} />
      }
    >
      <CustomerSidebarNav open={open} onClose={onClose} />
    </Suspense>
  );
}

function CustomerSidebarNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const brand = useCustomerBrand();

  const nav = (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
      {customerNav.map((item) => {
        const active = isCustomerNavActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-brand text-white shadow-sm"
                : "text-foreground/80 hover:bg-secondary-surface"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <CustomerSidebarFrame open={open} onClose={onClose} nav={nav} brand={brand} />
  );
}

function CustomerSidebarFrame({
  open,
  onClose,
  nav,
  brand,
}: {
  open: boolean;
  onClose: () => void;
  nav: ReactNode | null;
  brand?: CustomerBrand;
}) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-brand-dark/40 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[17rem] flex-col border-r border-border bg-surface transition-transform lg:static lg:z-0 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-border px-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-light text-xs font-bold text-brand">
            {brand?.initials ?? "C"}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {brand?.displayName ?? "Customer"}
            </p>
            <p className="truncate text-xs text-muted">Customer account</p>
          </div>
        </div>
        {nav ?? (
          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
            {customerNav.map((item) => (
              <span
                key={item.href}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80"
              >
                {item.label}
              </span>
            ))}
          </nav>
        )}
        <div className="flex flex-col gap-2 border-t border-border p-4">
          <LogoutButton
            role="customer"
            className="w-full rounded-lg py-2 text-left text-xs font-semibold text-foreground hover:text-brand"
          />
          <Link href="/" className="text-xs font-medium text-muted hover:text-brand">
            ← Back to website
          </Link>
        </div>
      </aside>
    </>
  );
}
