import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CustomerPortalLayout } from "@/components/customer/portal/customer-portal-layout";
import { getCustomerDashboardData } from "@/lib/customer-dashboard/get-dashboard-data";

export const metadata: Metadata = {
  title: {
    default: "My account",
    template: "%s · CleanMate",
  },
};

export default async function CustomerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const data = await getCustomerDashboardData();

  return (
    <CustomerPortalLayout customerName={data.customerName}>
      {children}
    </CustomerPortalLayout>
  );
}
