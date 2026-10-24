"use client";

import { useEffect, useState } from "react";
import { DashboardViewWithBrand } from "@/components/business/dashboard/dashboard-view-with-brand";
import { AuthApiError } from "@/lib/auth/api-client";
import { fetchBusinessDashboard } from "@/lib/business-dashboard/dashboard-api";
import type { BusinessDashboardData } from "@/lib/business-dashboard/types";

function DashboardFallback() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-6">
      <div className="h-10 w-56 rounded-lg bg-secondary-surface" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-secondary-surface" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-secondary-surface" />
    </div>
  );
}

export function BusinessDashboardClient() {
  const [data, setData] = useState<BusinessDashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const bundle = await fetchBusinessDashboard();
        if (!cancelled) {
          setData(bundle);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof AuthApiError
              ? err.message
              : err instanceof Error
                ? err.message
                : "Could not load dashboard.";
          setError(message);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error && !data) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        {error}
      </p>
    );
  }

  if (!data) {
    return <DashboardFallback />;
  }

  return (
    <>
      {error ? (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {error}
        </p>
      ) : null}
      <DashboardViewWithBrand data={data} />
    </>
  );
}
