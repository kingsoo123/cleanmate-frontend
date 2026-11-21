"use client";

import { Suspense, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  BusinessBrandProvider,
  useBusinessBrand,
} from "@/components/business/portal/business-brand-provider";
import { BusinessSidebar } from "@/components/business/portal/business-sidebar";
import { BusinessTopbar } from "@/components/business/portal/business-topbar";
import { PushNotificationsEnablePrompt } from "@/components/push-notifications-enable-prompt";
import { BusinessPortalRouteGuard } from "@/components/business/portal/business-portal-route-guard";
import { getBusinessNavTitle } from "@/lib/business-dashboard/nav";

export function BusinessPortalLayout({
  children,
  periodLabel,
}: {
  children: ReactNode;
  periodLabel?: string;
}) {
  return (
    <BusinessBrandProvider>
      <Suspense fallback={null}>
        <BusinessPortalRouteGuard>
          <div className="flex min-h-screen bg-secondary-surface/50">
            <Suspense fallback={<BusinessSidebarFallback />}>
              <BusinessSidebar />
            </Suspense>
            <div className="flex min-w-0 w-full flex-1 flex-col">
              <Suspense
                fallback={
                  <BusinessTopbar
                    title="Business portal"
                    businessName="Your laundry"
                    periodLabel={periodLabel}
                  />
                }
              >
                <BusinessTopbarWithPathname periodLabel={periodLabel} />
              </Suspense>
              <PushNotificationsEnablePrompt />
              <main className="relative z-0 flex-1 p-4 sm:p-6">
                <Suspense fallback={<BusinessMainFallback />}>{children}</Suspense>
              </main>
            </div>
          </div>
        </BusinessPortalRouteGuard>
      </Suspense>
    </BusinessBrandProvider>
  );
}

function BusinessTopbarWithPathname({
  periodLabel,
}: {
  periodLabel?: string;
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
    />
  );
}

function BusinessSidebarFallback() {
  return (
    <aside
      className="hidden w-[17.5rem] shrink-0 border-r border-border bg-surface xl:block"
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