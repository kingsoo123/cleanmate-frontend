"use client";

import { useEffect, useState } from "react";
import { CustomerDashboardView } from "@/components/customer/dashboard/customer-dashboard-view";
import { AuthApiError } from "@/lib/auth/api-client";
import { fetchCustomerDashboard } from "@/lib/customer-dashboard/customer-api";
import { primeCustomerOrderCache } from "@/lib/customer-dashboard/order-detail-cache";
import type { CustomerDashboardData } from "@/lib/customer-dashboard/types";

export function CustomerDashboardClient() {
  const [data, setData] = useState<CustomerDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const dashboard = await fetchCustomerDashboard();
        if (!cancelled) {
          primeCustomerOrderCache([
            ...dashboard.recentOrders,
            ...(dashboard.featuredOrder ? [dashboard.featuredOrder] : []),
          ]);
          setData(dashboard);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof AuthApiError
              ? err.message
              : "Could not load dashboard.",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        {error}
      </p>
    );
  }

  if (!data) {
    return <p className="text-sm text-muted">Loading dashboard…</p>;
  }

  return <CustomerDashboardView data={data} />;
}
