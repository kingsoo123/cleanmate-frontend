"use client";

import { BusinessPortalNavBody } from "@/components/business/portal/business-portal-nav-body";

/** Pinned left rail — visible from the `xl` breakpoint and up. */
export function BusinessSidebar() {
  return (
    <aside className="hidden w-[17.5rem] shrink-0 flex-col border-r border-border bg-surface xl:flex">
      <BusinessPortalNavBody />
    </aside>
  );
}