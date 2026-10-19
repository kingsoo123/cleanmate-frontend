"use client";

import { Suspense, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { BusinessSidebar } from "@/components/business/portal/business-sidebar";
import { BusinessTopbar } from "@/components/business/portal/business-topbar";
import { getBusinessNavTitle } from "@/lib/business-dashboard/nav";

export function BusinessPortalLayout({
  children,
  businessName = "Your laundry",
  periodLabel,
}: {
  children: ReactNode;
  businessName?: string;
  periodLabel?: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  return (
    <div className="flex min-h-screen bg-secondary-surface/50">
      <Suspense fallback={<BusinessSidebarFallback />}>
        <BusinessSidebar open={sidebarOpen} onClose={closeSidebar} />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col">
        <Suspense
          fallback={
            <BusinessTopbar
              title="Business portal"
              businessName={businessName}
              periodLabel={periodLabel}
              onMenuClick={openSidebar}
            />
          }
        >
          <BusinessTopbarWithPathname
            businessName={businessName}
            periodLabel={periodLabel}
            onMenuClick={openSidebar}
          />
        </Suspense>
        <main className="flex-1 p-4 sm:p-6">
          <Suspense fallback={<BusinessMainFallback />}>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}

function BusinessTopbarWithPathname({
  businessName,
  periodLabel,
  onMenuClick,
}: {
  businessName: string;
  periodLabel?: string;
  onMenuClick: () => void;
}) {
  const pathname = usePathname();
  const title = getBusinessNavTitle(pathname);

  return (
    <BusinessTopbar
      title={title}
      businessName={businessName}
      periodLabel={periodLabel}
      onMenuClick={onMenuClick}
    />
  );
}

function BusinessSidebarFallback() {
  return (
    <aside
      className="fixed inset-y-0 left-0 z-50 hidden w-[17.5rem] flex-col border-r border-border bg-surface lg:static lg:flex"
      aria-hidden
    />
  );
}

function BusinessMainFallback() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-4">
      <div className="h-8 w-40 rounded-lg bg-secondary-surface" />
      <div className="h-48 rounded-2xl bg-secondary-surface" />
    </div>
  );
}
