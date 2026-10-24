"use client";

import { Suspense, useState, type ReactNode } from "react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  return (
    <CustomerBrandProvider>
      <div className="flex min-h-screen bg-secondary-surface/50">
        <CustomerSidebar open={sidebarOpen} onClose={closeSidebar} />
        <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
          <Suspense
            fallback={
              <CustomerTopbar
                title="My account"
                customerName="Customer"
                onMenuClick={openSidebar}
              />
            }
          >
            <CustomerTopbarWithPathname onMenuClick={openSidebar} />
          </Suspense>
          <PushNotificationsEnablePrompt />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
        <CustomerMobileNav />
      </div>
    </CustomerBrandProvider>
  );
}

function CustomerTopbarWithPathname({
  onMenuClick,
}: {
  onMenuClick: () => void;
}) {
  const pathname = usePathname();
  const title = getCustomerNavTitle(pathname);
  const { displayName } = useCustomerBrand();

  return (
    <CustomerTopbar
      title={title}
      customerName={displayName}
      onMenuClick={onMenuClick}
    />
  );
}

