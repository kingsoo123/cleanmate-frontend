"use client";

import { Suspense, useEffect, useState } from "react";
import { ReportsView } from "@/components/business/reports/reports-view";
import { AuthApiError } from "@/lib/auth/api-client";
import { fetchBusinessReports } from "@/lib/business-dashboard/reports-api";
import type {
  ReportPeriod,
  ReportsSnapshot,
} from "@/lib/business-dashboard/reports-types";

const emptySnapshot = (period: ReportPeriod): ReportsSnapshot => ({
  period,
  periodLabel: "—",
  financial: {
    recordedRevenueNgn: 0,
    paymentsReceivedNgn: 0,
    outstandingBalancesNgn: 0,
    orderValueNgn: 0,
    revenueTrend: "—",
  },
  paymentMethods: [],
  operations: {
    ordersCompleted: 0,
    ordersActive: 0,
    ordersCancelled: 0,
    pickupsCompleted: 0,
    deliveriesCompleted: 0,
    newCustomers: 0,
  },
  topCustomersByPayments: [],
});

function ReportsFallback() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-4">
      <div className="h-10 w-40 rounded-lg bg-secondary-surface" />
      <div className="grid gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-secondary-surface" />
        ))}
      </div>
      <div className="h-48 rounded-2xl bg-secondary-surface" />
    </div>
  );
}

export function BusinessReportsClient() {
  return (
    <Suspense fallback={<ReportsFallback />}>
      <BusinessReportsContent />
    </Suspense>
  );
}

function BusinessReportsContent() {
  const [snapshots, setSnapshots] = useState<Record<
    ReportPeriod,
    ReportsSnapshot
  > | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchBusinessReports();
        if (!cancelled) {
          setSnapshots({
            today: data.today ?? emptySnapshot("today"),
            week: data.week ?? emptySnapshot("week"),
            month: data.month ?? emptySnapshot("month"),
          });
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof AuthApiError
              ? err.message
              : err instanceof Error
                ? err.message
                : "Could not load reports.";
          setError(message);
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

  if (!snapshots) {
    return <ReportsFallback />;
  }

  return <ReportsView snapshots={snapshots} />;
}
