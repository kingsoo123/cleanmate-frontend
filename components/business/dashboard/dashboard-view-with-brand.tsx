"use client";

import { useMemo } from "react";
import { DashboardView } from "@/components/business/dashboard/dashboard-view";
import { useBusinessBrand } from "@/components/business/portal/business-brand-provider";
import type { BusinessDashboardData } from "@/lib/business-dashboard/types";

export function DashboardViewWithBrand({
  data,
}: {
  data: BusinessDashboardData;
}) {
  const brand = useBusinessBrand();

  const brandedData = useMemo((): BusinessDashboardData => {
    if (!brand.isFromSession) {
      return data;
    }
    return {
      ...data,
      businessName: brand.businessName,
      isPreviewData: data.isPreviewData,
    };
  }, [brand.businessName, brand.isFromSession, data]);

  return <DashboardView data={brandedData} ownerName={brand.ownerName} />;
}
