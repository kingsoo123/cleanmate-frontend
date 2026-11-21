"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { useBusinessBrand } from "@/components/business/portal/business-brand-provider";
import { businessNavForUser } from "@/lib/business-dashboard/nav";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { useDrawerViewport } from "@/lib/use-drawer-viewport";

function NavIcon({ href }: { href: string }) {
  const className = "h-5 w-5 shrink-0 opacity-80";
  if (href.includes("dashboard")) {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    );
  }
  if (href.includes("orders/new")) {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    );
  }
  if (href.includes("orders")) {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    );
  }
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}

export function BusinessSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const brand = useBusinessBrand();
  const user = useAuthUser();
  const navItems = businessNavForUser(user);
  const drawerViewport = useDrawerViewport();
  const panelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open || !drawerViewport) return;

    function dismiss(event: MouseEvent | TouchEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (panelRef.current?.contains(target)) return;
      if (
        target instanceof Element &&
        target.closest("[data-sidebar-toggle]")
      ) {
        return;
      }
      onClose();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("mousedown", dismiss);
    document.addEventListener("touchstart", dismiss, { passive: true });
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", dismiss);
      document.removeEventListener("touchstart", dismiss);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, drawerViewport, onClose]);

  useEffect(() => {
    if (!drawerViewport) return;
    onClose();
  }, [pathname, drawerViewport, onClose]);

  function isActive(href: string) {
    if (pathname === href) return true;
    if (href === "/business/dashboard") return false;
    if (
      href === "/business/orders" &&
      pathname.startsWith("/business/orders/new")
    ) {
      return false;
    }
    return pathname.startsWith(`${href}/`);
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
      {navItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-brand text-white shadow-sm"
                : "text-foreground/80 hover:bg-secondary-surface hover:text-foreground"
            }`}
          >
            <NavIcon href={item.href} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <div
        className={`fixed inset-0 z-[100] bg-brand-dark/40 backdrop-blur-sm transition-opacity xl:hidden ${
          open && drawerViewport
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onPointerDown={(event) => {
          event.preventDefault();
          onClose();
        }}
        aria-hidden={!open}
        role="presentation"
      />
      <aside
        ref={panelRef}
        className={`fixed inset-y-0 left-0 z-[110] flex w-[17.5rem] max-w-[85vw] flex-col border-r border-border bg-surface shadow-xl transition-transform xl:static xl:z-0 xl:max-w-none xl:translate-x-0 xl:shadow-none ${
          open || !drawerViewport
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
        aria-hidden={drawerViewport && !open}
      >
        <div className="flex h-16 items-center gap-2 border-b border-border px-4">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-light text-xs font-bold text-brand"
            aria-hidden
          >
            {brand.businessInitials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {brand.businessName}
            </p>
            <p className="truncate text-xs text-muted">
              {brand.isFromSession && brand.ownerName
                ? brand.ownerName
                : "Washuply business portal"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-foreground hover:bg-secondary-surface xl:hidden"
            aria-label="Close menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {nav}
        <div className="flex flex-col gap-2 border-t border-border p-4">
          <LogoutButton
            role="business"
            className="w-full rounded-lg py-2 text-left text-xs font-semibold text-foreground hover:text-brand"
          />
          <Link
            href="/"
            className="text-xs font-medium text-muted hover:text-brand"
          >
            ← Marketing site
          </Link>
        </div>
      </aside>
    </>
  );
}
