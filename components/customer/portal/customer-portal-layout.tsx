"use client";

import { Suspense, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { CustomerMobileNav } from "@/components/customer/portal/customer-mobile-nav";
import { CustomerSidebar } from "@/components/customer/portal/customer-sidebar";
import { CustomerTopbar } from "@/components/customer/portal/customer-topbar";
import { getCustomerNavTitle } from "@/lib/customer-dashboard/nav";

export function CustomerPortalLayout({
  children,
  customerName = "Customer",
}: {
  children: ReactNode;
  customerName?: string;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = () => setSidebarOpen(false);
  const openSidebar = () => setSidebarOpen(true);

  return (
    <div className="flex min-h-screen bg-secondary-surface/50">
      <Suspense fallback={<CustomerSidebarFallback />}>
        <CustomerSidebar open={sidebarOpen} onClose={closeSidebar} />
      </Suspense>
      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        <Suspense
          fallback={
            <CustomerTopbar
              title="My account"
              customerName={customerName}
              onMenuClick={openSidebar}
            />
          }
        >
          <CustomerTopbarWithPathname
            customerName={customerName}
            onMenuClick={openSidebar}
          />
        </Suspense>
        <main className="flex-1 p-4 sm:p-6">
          <Suspense fallback={<CustomerMainFallback />}>{children}</Suspense>
        </main>
      </div>
      <Suspense fallback={<CustomerMobileNavFallback />}>
        <CustomerMobileNav />
      </Suspense>
    </div>
  );
}

function CustomerTopbarWithPathname({
  customerName,
  onMenuClick,
}: {
  customerName: string;
  onMenuClick: () => void;
}) {
  const pathname = usePathname();
  const title = getCustomerNavTitle(pathname);

  return (
    <CustomerTopbar
      title={title}
      customerName={customerName}
      onMenuClick={onMenuClick}
    />
  );
}

function CustomerSidebarFallback() {
  return (
    <aside
      className="fixed inset-y-0 left-0 z-50 hidden w-[17rem] flex-col border-r border-border bg-surface lg:static lg:flex"
      aria-hidden
    />
  );
}

function CustomerMobileNavFallback() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 h-14 border-t border-border bg-surface/95 lg:hidden"
      aria-hidden
    />
  );
}

function CustomerMainFallback() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse space-y-4">
      <div className="h-8 w-40 rounded-lg bg-secondary-surface" />
      <div className="h-48 rounded-2xl bg-secondary-surface" />
    </div>
  );
}
