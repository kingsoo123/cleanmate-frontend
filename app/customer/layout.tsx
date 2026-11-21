import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CustomerPortalLayout } from "@/components/customer/portal/customer-portal-layout";

/** Auth portal uses client hooks; do not instant-prerender (Next 16 + PPR). */
export const instant = false;

export const metadata: Metadata = {
  title: {
    default: "My account",
    template: "%s · Washuply",
  },
};

export default async function CustomerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <CustomerPortalLayout>{children}</CustomerPortalLayout>;
}
