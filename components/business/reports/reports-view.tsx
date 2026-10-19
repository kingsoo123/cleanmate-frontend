"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { MetricCard } from "@/components/business/dashboard/metric-card";
import { formatNgn } from "@/lib/business-dashboard/format";
import {
  buildReportsCsv,
  parseReportPeriod,
} from "@/lib/business-dashboard/get-reports-data";
import type {
  ReportPeriod,
  ReportsSnapshot,
} from "@/lib/business-dashboard/reports-types";

const periods: { id: ReportPeriod; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "This week" },
  { id: "month", label: "Month to date" },
];

export function ReportsView({
  snapshots,
}: {
  snapshots: Record<ReportPeriod, ReportsSnapshot>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const period = parseReportPeriod(searchParams.get("period") ?? undefined);
  const snapshot = snapshots[period];

  const opsRows = useMemo(
    () => [
      { label: "Orders completed", value: snapshot.operations.ordersCompleted },
      { label: "Active orders (snapshot)", value: snapshot.operations.ordersActive },
      { label: "Cancelled", value: snapshot.operations.ordersCancelled },
      { label: "Pickups completed", value: snapshot.operations.pickupsCompleted },
      {
        label: "Deliveries completed",
        value: snapshot.operations.deliveriesCompleted,
      },
      { label: "New customers", value: snapshot.operations.newCustomers },
    ],
    [snapshot],
  );

  function setPeriod(next: ReportPeriod) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "today") params.delete("period");
    else params.set("period", next);
    const qs = params.toString();
    router.replace(qs ? `/business/reports?${qs}` : "/business/reports", {
      scroll: false,
    });
  }

  function downloadCsv() {
    const csv = buildReportsCsv(snapshot);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `cleanmate-report-${period}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">Insights</p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Reports
          </h2>
          <p className="mt-1 text-sm text-muted">{snapshot.periodLabel}</p>
        </div>
        <button
          type="button"
          onClick={downloadCsv}
          className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-surface px-5 text-sm font-semibold text-foreground hover:bg-secondary-surface"
        >
          Export CSV
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {periods.map((p) => {
          const active = period === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPeriod(p.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
                active
                  ? "bg-brand text-white"
                  : "border border-border bg-surface hover:bg-secondary-surface"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Financial summary
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Recorded revenue"
            value={formatNgn(snapshot.financial.recordedRevenueNgn)}
            hint="Eligible completed value"
            accent="brand"
            trend={{ direction: "up", text: snapshot.financial.revenueTrend }}
          />
          <MetricCard
            label="Payments received"
            value={formatNgn(snapshot.financial.paymentsReceivedNgn)}
            hint="Cash, transfer, POS logged"
            accent="success"
          />
          <MetricCard
            label="Outstanding balances"
            value={formatNgn(snapshot.financial.outstandingBalancesNgn)}
            hint="Open orders snapshot"
            accent="warning"
          />
          <MetricCard
            label="Order value"
            value={formatNgn(snapshot.financial.orderValueNgn)}
            hint="Agreed totals in period"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
          <h3 className="text-sm font-semibold text-foreground">
            Payments by method
          </h3>
          <p className="mt-1 text-xs text-muted">
            Share of received payments in this period
          </p>
          <ul className="mt-6 space-y-4">
            {snapshot.paymentMethods.map((row) => (
              <li key={row.method}>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium text-foreground">{row.method}</span>
                  <span className="text-muted">
                    {formatNgn(row.amountNgn)} · {row.sharePercent}%
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-secondary-surface">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${row.sharePercent}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/business/payments"
            className="mt-4 inline-block text-xs font-semibold text-brand hover:underline"
          >
            Open payments ledger
          </Link>
        </section>

        <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
          <h3 className="text-sm font-semibold text-foreground">Operations</h3>
          <p className="mt-1 text-xs text-muted">Throughput for the selected period</p>
          <ul className="mt-6 divide-y divide-border">
            {opsRows.map((row) => (
              <li
                key={row.label}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <span className="text-sm text-foreground">{row.label}</span>
                <span className="text-lg font-bold text-foreground">{row.value}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold">
            <Link href="/business/orders" className="text-brand hover:underline">
              Orders
            </Link>
            <Link href="/business/pickups" className="text-brand hover:underline">
              Pickups
            </Link>
            <Link href="/business/deliveries" className="text-brand hover:underline">
              Deliveries
            </Link>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <h3 className="text-sm font-semibold text-foreground">
          Top customers by payments
        </h3>
        <p className="mt-1 text-xs text-muted">Preview ranking for the period</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium text-right">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {snapshot.topCustomersByPayments.map((row, index) => (
                <tr key={row.customerName}>
                  <td className="py-3">
                    <span className="mr-2 text-xs text-muted">{index + 1}.</span>
                    {row.customerName}
                  </td>
                  <td className="py-3 text-right font-semibold">
                    {formatNgn(row.amountNgn)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link
          href="/business/customers"
          className="mt-4 inline-block text-xs font-semibold text-brand hover:underline"
        >
          Customer directory
        </Link>
      </section>

      <p className="text-xs text-muted">
        Preview aggregates only. Connect your database for live reporting, PDF
        export, and custom date ranges.
      </p>
    </div>
  );
}
