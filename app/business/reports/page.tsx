import { Suspense } from "react";
import { ReportsView } from "@/components/business/reports/reports-view";
import { getBusinessReportsData } from "@/lib/business-dashboard/get-reports-data";
import type { ReportPeriod } from "@/lib/business-dashboard/reports-types";

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

async function ReportsContent() {
  const periods: ReportPeriod[] = ["today", "week", "month"];
  const entries = await Promise.all(
    periods.map(async (period) => [period, await getBusinessReportsData(period)] as const),
  );
  const snapshots = Object.fromEntries(entries) as Record<
    ReportPeriod,
    Awaited<ReturnType<typeof getBusinessReportsData>>
  >;

  return <ReportsView snapshots={snapshots} />;
}

export default function BusinessReportsPage() {
  return (
    <Suspense fallback={<ReportsFallback />}>
      <ReportsContent />
    </Suspense>
  );
}
