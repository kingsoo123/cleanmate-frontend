import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BusinessPortalLayout } from "@/components/business/portal/business-portal-layout";

export const metadata: Metadata = {
  title: {
    default: "Business portal",
    template: "%s · CleanMate Business",
  },
};

export default function BusinessLayout({ children }: { children: ReactNode }) {
  return <BusinessPortalLayout>{children}</BusinessPortalLayout>;
}
