import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BusinessPortalLayout } from "@/components/business/portal/business-portal-layout";

/** Auth portal uses client hooks; do not instant-prerender (Next 16 + PPR). */
export const instant = false;

export const metadata: Metadata = {
  title: {
    default: "Business portal",
    template: "%s · Washuply Business",
  },
};

export default function BusinessLayout({ children }: { children: ReactNode }) {
  return <BusinessPortalLayout>{children}</BusinessPortalLayout>;
}
