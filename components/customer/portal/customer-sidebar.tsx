"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { customerNav } from "@/lib/customer-dashboard/nav";

export function CustomerSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/customer/dashboard") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
      {customerNav.map((item) => {
        const active = isActive(item.href);
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
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-light text-xs font-bold text-brand">
            CM
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">CleanMate</p>
            <p className="text-xs text-muted">Customer</p>
          </div>
        </div>
        {nav}
        <div className="border-t border-border p-4">
          <Link href="/" className="text-xs font-medium text-muted hover:text-brand">
            ← Back to website
          </Link>
        </div>
      </aside>
    </>
  );
}
