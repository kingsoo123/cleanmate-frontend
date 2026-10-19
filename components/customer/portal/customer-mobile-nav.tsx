"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/customer/dashboard", label: "Home" },
  { href: "/customer/pickups/new", label: "Pickup" },
  { href: "/customer/orders", label: "Orders" },
  { href: "/customer/payments", label: "Pay" },
  { href: "/customer/profile", label: "Profile" },
];

export function CustomerMobileNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/customer/dashboard") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur-md lg:hidden">
      <ul className="mx-auto flex max-w-lg justify-around px-1 pb-[env(safe-area-inset-bottom)] pt-2">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={`flex min-w-[4rem] flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide ${
                  active ? "text-brand" : "text-muted"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${active ? "bg-brand" : "bg-transparent"}`}
                />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
