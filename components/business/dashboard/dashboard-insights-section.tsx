import type { ReactNode } from "react";
import Link from "next/link";
import { MetricCard } from "@/components/business/dashboard/metric-card";
import { VerticalBarChart } from "@/components/business/dashboard/vertical-bar-chart";
import { formatNgn } from "@/lib/business-dashboard/format";
import type { DashboardInsights } from "@/lib/business-dashboard/types";

function InsightPanel({
  title,
  hint,
  children,
  action,
}: {
  title: string;
  hint: string;
  children: ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="mt-0.5 text-xs text-muted">{hint}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function DashboardInsightsSection({
  insights,
  showBranches,
}: {
  insights: DashboardInsights;
  showBranches: boolean;
}) {
  const { summary } = insights;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Business insights
          </h2>
          <p className="mt-1 text-sm text-foreground">
            {insights.periodLabel} — bar charts from live orders and payments.
          </p>
        </div>
        <Link
          href="/business/reports"
          className="text-xs font-semibold text-brand hover:underline"
        >
          Full reports →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Payments (7d)"
          value={formatNgn(summary.paymentsTotalNgn)}
          hint="Successful payments logged"
          accent="success"
        />
        <MetricCard
          label="New orders (7d)"
          value={String(summary.ordersCreated)}
          hint="Walk-in & pickup conversions"
          accent="brand"
        />
        <MetricCard
          label="Completion rate"
          value={`${summary.completionRatePercent}%`}
          hint={`${summary.ordersCompleted} completed of ${summary.ordersCreated} created`}
        />
        <MetricCard
          label="Avg order value"
          value={formatNgn(summary.avgOrderValueNgn)}
          hint={`Collection ${summary.collectionRatePercent}% of new order value`}
          accent="warning"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <InsightPanel
          title="Payments by day"
          hint="Cash flow pattern — spot quiet days early"
        >
          <VerticalBarChart
            items={insights.daily.map((d) => ({
              label: d.label,
              value: d.paymentsNgn,
            }))}
            formatValue={(v) => (v >= 1000 ? formatNgn(v) : formatNgn(v))}
            barClassName="bg-emerald-600"
            emptyLabel="No payments in the last 7 days."
          />
        </InsightPanel>

        <InsightPanel
          title="New orders by day"
          hint="Demand trend — staffing & marketing timing"
        >
          <VerticalBarChart
            items={insights.daily.map((d) => ({
              label: d.label,
              value: d.ordersCreated,
            }))}
            emptyLabel="No new orders in the last 7 days."
          />
        </InsightPanel>

        <InsightPanel
          title="Orders completed by day"
          hint="Throughput — is the floor keeping up?"
        >
          <VerticalBarChart
            items={insights.daily.map((d) => ({
              label: d.label,
              value: d.ordersCompleted,
            }))}
            barClassName="bg-sky-600"
            emptyLabel="No completions in the last 7 days."
          />
        </InsightPanel>

        <InsightPanel
          title="Open orders by status"
          hint="Where work is stuck — prioritize bottlenecks"
        >
          <VerticalBarChart
            items={insights.ordersByStatus.map((row) => ({
              label: row.label,
              value: row.count,
            }))}
            emptyLabel="No matching orders right now."
          />
        </InsightPanel>

        <InsightPanel
          title="Payments by method"
          hint="POS vs transfer vs cash — reconcile floats"
        >
          <VerticalBarChart
            items={insights.paymentsByMethod.map((row) => ({
              label: row.label,
              value: row.amountNgn,
            }))}
            formatValue={(v) => formatNgn(v)}
            barClassName="bg-violet-600"
            emptyLabel="No payment mix data yet."
          />
        </InsightPanel>

        <InsightPanel
          title="Order sources (7d)"
          hint="Walk-in vs pickup — channel investment"
        >
          <VerticalBarChart
            items={insights.orderSources.map((row) => ({
              label: row.label,
              value: row.count,
            }))}
            barClassName="bg-amber-600"
            emptyLabel="No orders in the last 7 days."
          />
        </InsightPanel>
      </div>

      {showBranches && insights.branches && insights.branches.length > 0 ? (
        <InsightPanel
          title="Branch comparison (7d)"
          hint="Orders created & payments received per branch"
          action={
            <Link
              href="/business/staff"
              className="shrink-0 text-xs font-semibold text-brand hover:underline"
            >
              Manage branches
            </Link>
          }
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium text-muted">Orders created</p>
              <VerticalBarChart
                items={insights.branches.map((row) => ({
                  label: row.label,
                  value: row.ordersCount,
                }))}
              />
            </div>
            <div>
              <p className="mb-2 text-xs font-medium text-muted">Payments received</p>
              <VerticalBarChart
                items={insights.branches.map((row) => ({
                  label: row.label,
                  value: row.paymentsNgn,
                }))}
                formatValue={(v) => formatNgn(v)}
                barClassName="bg-emerald-600"
              />
            </div>
          </div>
        </InsightPanel>
      ) : null}
    </div>
  );
}