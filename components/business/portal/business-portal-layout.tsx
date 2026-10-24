"use client";

import { Suspense, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  BusinessBrandProvider,
  useBusinessBrand,
} from "@/components/business/portal/business-brand-provider";
import { BusinessSidebar } from "@/components/business/portal/business-sidebar";
import { BusinessTopbar } from "@/components/business/portal/business-topbar";
import { PushNotificationsEnablePrompt } from "@/components/push-notifications-enable-prompt";
import { getBusinessNavTitle } from "@/lib/business-dashboard/nav";

export function BusinessPortalLayout({
  children,
  periodLabel,
}: {
  children: ReactNode;
  periodLabel?: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  return (
    <BusinessBrandProvider>
      <div className="flex min-h-screen bg-secondary-surface/50">
        <Suspense fallback={<BusinessSidebarFallback />}>
          <BusinessSidebar open={sidebarOpen} onClose={closeSidebar} />
        </Suspense>
        <div className="flex min-w-0 flex-1 flex-col">
          <Suspense
            fallback={
              <BusinessTopbar
                title="Business portal"
                businessName="Your laundry"
                periodLabel={periodLabel}
                onMenuClick={openSidebar}
              />
            }
          >
            <BusinessTopbarWithPathname
              periodLabel={periodLabel}
              onMenuClick={openSidebar}
            />
          </Suspense>
          <PushNotificationsEnablePrompt />
          <main className="flex-1 p-4 sm:p-6">
            <Suspense fallback={<BusinessMainFallback />}>{children}</Suspense>
          </main>
        </div>
      </div>
    </BusinessBrandProvider>
  );
}

function BusinessTopbarWithPathname({
  periodLabel,
  onMenuClick,
}: {
  periodLabel?: string;
  onMenuClick: () => void;
}) {
  const pathname = usePathname();
  const title = getBusinessNavTitle(pathname);
  const brand = useBusinessBrand();

  return (
    <BusinessTopbar
      title={title}
      businessName={brand.businessName}
      ownerName={brand.ownerName}
      ownerInitials={brand.ownerInitials}
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
