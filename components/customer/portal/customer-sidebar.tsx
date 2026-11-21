"use client";

import { Suspense } from "react";
import { CustomerPortalNavBody } from "@/components/customer/portal/customer-portal-nav-body";

/** Pinned left rail — visible from the `xl` breakpoint and up. */
export function CustomerSidebar() {
  return (
    <aside className="hidden w-[17.5rem] shrink-0 flex-col border-r border-border bg-surface xl:flex">
      <Suspense
        fallback={
          <div className="h-16 animate-pulse border-b border-border bg-secondary-surface/40" />
        }
      >
        <CustomerPortalNavBody />
      </Suspense>
    </aside>
  );
}