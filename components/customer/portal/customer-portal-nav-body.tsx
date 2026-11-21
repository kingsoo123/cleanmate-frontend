"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { useCustomerBrand } from "@/components/customer/portal/customer-brand-provider";
import { customerNav, isCustomerNavActive } from "@/lib/customer-dashboard/nav";

export function CustomerPortalNavBody({
  onNavigate,
  compactHeader,
}: {
  onNavigate?: () => void;
  compactHeader?: boolean;
}) {
  const pathname = usePathname();
  const brand = useCustomerBrand();

  return (
    <>
      <div
        className={`flex items-center gap-2 border-b border-border ${
          compactHeader ? "px-3 py-3" : "h-16 px-4"
        }`}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-light text-xs font-bold text-brand">
          {brand.initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {brand.displayName}
          </p>
          <p className="truncate text-xs text-muted">Customer account</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-3">
        {customerNav.map((item) => {
          const active = isCustomerNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
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
      <div className="flex flex-col gap-2 border-t border-border p-3">
        <LogoutButton
          role="customer"
          className="w-full rounded-lg py-2 text-left text-xs font-semibold text-foreground hover:text-brand"
        />
        <Link
          href="/"
          onClick={onNavigate}
          className="text-xs font-medium text-muted hover:text-brand"
        >
          ← Back to website
        </Link>
      </div>
    </>
  );
}