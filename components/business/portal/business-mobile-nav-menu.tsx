"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { BusinessPortalNavBody } from "@/components/business/portal/business-portal-nav-body";

/** Mobile / tablet nav — same open + outside-dismiss pattern as notification bell. */
export function BusinessMobileNavMenu() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (prevPathnameRef.current === pathname) return;
    prevPathnameRef.current = pathname;
    setOpen(false);
  }, [pathname]);

  function handleToggle() {
    setOpen((value) => !value);
  }

  return (
    <div className="relative xl:hidden" ref={panelRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="rounded-lg p-2 text-foreground hover:bg-secondary-surface"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        {open ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-50 mt-2 flex w-[min(22rem,calc(100vw-2rem))] max-h-[min(75vh,36rem)] flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
          <BusinessPortalNavBody
            compactHeader
            onNavigate={() => setOpen(false)}
          />
        </div>
      ) : null}
    </div>
  );
}