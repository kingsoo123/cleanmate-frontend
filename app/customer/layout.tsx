import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CustomerPortalLayout } from "@/components/customer/portal/customer-portal-layout";

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
  return <CustomerPortalLayout>{children}</CustomerPortalLayout>;
}
