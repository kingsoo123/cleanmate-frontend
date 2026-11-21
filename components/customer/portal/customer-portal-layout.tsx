"use client";

import { Suspense, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  CustomerBrandProvider,
  useCustomerBrand,
} from "@/components/customer/portal/customer-brand-provider";
import { CustomerMobileNav } from "@/components/customer/portal/customer-mobile-nav";
import { CustomerSidebar } from "@/components/customer/portal/customer-sidebar";
import { CustomerTopbar } from "@/components/customer/portal/customer-topbar";
import { PushNotificationsEnablePrompt } from "@/components/push-notifications-enable-prompt";
import { getCustomerNavTitle } from "@/lib/customer-dashboard/nav";

export function CustomerPortalLayout({ children }: { children: ReactNode }) {
  return (
    <CustomerBrandProvider>
      <div className="flex min-h-screen bg-secondary-surface/50">
        <Suspense fallback={<CustomerSidebarFallback />}>
          <CustomerSidebar />
        </Suspense>
        <div className="flex min-w-0 w-full flex-1 flex-col pb-20 xl:pb-0">
          <Suspense
            fallback={
              <CustomerTopbar title="My account" customerName="Customer" />
            }
          >
            <CustomerTopbarWithPathname />
          </Suspense>
          <PushNotificationsEnablePrompt />
          <main className="relative z-0 flex-1 p-4 sm:p-6">
            <Suspense fallback={<CustomerMainFallback />}>{children}</Suspense>
          </main>
        </div>
        <Suspense fallback={null}>
          <CustomerMobileNav />
        </Suspense>
      </div>
    </CustomerBrandProvider>
  );
}

function CustomerSidebarFallback() {
  return (
    <aside
      className="hidden w-[17.5rem] shrink-0 border-r border-border bg-surface xl:block"
      aria-hidden
    />
  );
}

function CustomerMainFallback() {
  return (
    <div className="mx-auto max-w-lg animate-pulse space-y-4">
      <div className="h-8 w-40 rounded-lg bg-secondary-surface" />
      <div className="h-48 rounded-2xl bg-secondary-surface" />
    </div>
  );
}

function CustomerTopbarWithPathname() {
  const pathname = usePathname();
  const title = getCustomerNavTitle(pathname);
  const { displayName } = useCustomerBrand();

  return (
    <CustomerTopbar title={title} customerName={displayName} />
  );
}