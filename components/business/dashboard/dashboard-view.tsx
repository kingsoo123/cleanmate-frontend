import Link from "next/link";
import type { ReactNode } from "react";
import { MetricCard } from "@/components/business/dashboard/metric-card";
import {
  OrderStatusBadge,
  PaymentStateBadge,
} from "@/components/business/status-badge";
import { formatNgn } from "@/lib/business-dashboard/format";
import type { BusinessDashboardData } from "@/lib/business-dashboard/types";

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function DashboardView({ data }: { data: BusinessDashboardData }) {
  const { financial, operational } = data;
  const maxStage = Math.max(...data.processingStages.map((s) => s.count), 1);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm font-medium text-muted">{data.periodLabel}</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {data.businessName}
        </h2>
        <p className="mt-1 text-sm text-muted">
          Operations overview — orders, payments, pickups, and processing at a
          glance.
        </p>
      </div>

      {data.isPreviewData ? (
        <p className="rounded-xl border border-brand/20 bg-brand-light/40 px-4 py-3 text-sm text-foreground">
          <span className="font-semibold">Preview layout.</span> Metrics below
          are sample data until your laundry account is connected to live orders
          and payments.
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href="/business/orders/new"
          className="inline-flex items-center justify-center rounded-full bg-brand-dark px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Create walk-in order
        </Link>
        <Link
          href="/business/pickups?filter=review"
          className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary-surface"
        >
          Review pickup requests ({operational.pickupsAwaitingReview})
        </Link>
        <Link
          href="/business/orders?filter=ready"
          className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary-surface"
        >
          Ready for collection ({operational.readyForCollection})
        </Link>
      </div>

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Financial overview
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Payments received"
            value={formatNgn(financial.paymentsReceivedNgn)}
            hint="Cash & transfers recorded today"
            accent="success"
            trend={{ direction: "up", text: "+12% vs yesterday" }}
          />
          <MetricCard
            label="Recorded revenue"
            value={formatNgn(financial.revenueTodayNgn)}
            hint="Eligible successful payments"
            accent="brand"
          />
          <MetricCard
            label="Outstanding balances"
            value={formatNgn(financial.outstandingBalancesNgn)}
            hint="Across active & ready orders"
            accent="warning"
          />
          <MetricCard
            label="Order value (week)"
            value={formatNgn(financial.orderValueThisWeekNgn)}
            hint="Agreed totals, not all collected"
          />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
          Operations snapshot
        </h2>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          <MetricCard label="Active orders" value={String(operational.activeOrders)} accent="brand" />
          <MetricCard label="Draft requests" value={String(operational.draftRequests)} />
          <MetricCard label="Pickups in progress" value={String(operational.pickupsInProgress)} />
          <MetricCard label="In processing" value={String(operational.inProcessing)} />
          <MetricCard label="Awaiting QC" value={String(operational.awaitingQualityCheck)} />
          <MetricCard label="Completed today" value={String(operational.completedToday)} accent="success" />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <Panel
            title="Needs attention"
            action={
              <Link href="/business/orders" className="text-xs font-semibold text-brand hover:underline">
                View all
              </Link>
            }
          >
            <ul className="space-y-3">
              {data.attentionOrders.map((order) => (
                <li
                  key={order.id}
                  className="rounded-xl border border-border bg-secondary-surface/30 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-semibold text-brand">
                        {order.orderNumber}
                      </p>
                      <p className="truncate text-sm text-foreground">{order.customerName}</p>
                    </div>
                    <span className="shrink-0 text-xs text-muted">{order.dueLabel}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted">{order.reason}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <OrderStatusBadge status={order.status} />
                    <PaymentStateBadge state={order.paymentState} />
                    {order.outstandingNgn > 0 ? (
                      <span className="text-xs font-medium text-amber-800">
                        {formatNgn(order.outstandingNgn)} due
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="xl:col-span-3">
          <Panel title="Processing pipeline">
            <ul className="space-y-3">
              {data.processingStages.map((stage) => (
                <li key={stage.stage}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium text-foreground">{stage.stage}</span>
                    <span className="text-muted">{stage.count} orders</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary-surface">
                    <div
                      className="h-full rounded-full bg-brand transition-all"
                      style={{ width: `${(stage.count / maxStage) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <Panel
        title="Recent orders"
        action={
          <Link href="/business/orders" className="text-xs font-semibold text-brand hover:underline">
            Open orders
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="pb-3 pr-4 font-medium">Order</th>
                <th className="pb-3 pr-4 font-medium">Customer</th>
                <th className="pb-3 pr-4 font-medium">Source</th>
                <th className="pb-3 pr-4 font-medium">Status</th>
                <th className="pb-3 pr-4 font-medium">Payment</th>
                <th className="pb-3 pr-4 font-medium text-right">Total</th>
                <th className="pb-3 font-medium text-right">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.recentOrders.map((row) => (
                <tr key={row.id} className="hover:bg-secondary-surface/40">
                  <td className="py-3 pr-4 font-mono text-xs font-semibold text-brand">
                    {row.orderNumber}
                  </td>
                  <td className="py-3 pr-4 text-foreground">{row.customerName}</td>
                  <td className="py-3 pr-4 text-muted">{row.source}</td>
                  <td className="py-3 pr-4">
                    <OrderStatusBadge status={row.status} />
                  </td>
                  <td className="py-3 pr-4">
                    <PaymentStateBadge state={row.paymentState} />
                  </td>
                  <td className="py-3 pr-4 text-right font-medium">
                    {formatNgn(row.totalNgn)}
                  </td>
                  <td className="py-3 text-right text-muted">{row.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Driver jobs"
          action={
            <div className="flex gap-3">
              <Link href="/business/staff" className="text-xs font-semibold text-brand hover:underline">
                Onboard riders
              </Link>
              <Link href="/business/deliveries" className="text-xs font-semibold text-brand hover:underline">
                Deliveries & pickups
              </Link>
            </div>
          }
        >
          <ul className="divide-y divide-border">
            {data.driverJobs.map((job) => (
              <li key={job.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="font-mono text-xs font-semibold text-brand">{job.reference}</p>
                  <p className="text-sm text-foreground">
                    {job.type} · {job.driverName}
                  </p>
                  <p className="text-xs text-muted">{job.status}</p>
                </div>
                <span className="text-xs font-medium text-muted">{job.scheduledAt}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Recent payments"
          action={
            <Link href="/business/payments" className="text-xs font-semibold text-brand hover:underline">
              All payments
            </Link>
          }
        >
          <ul className="divide-y divide-border">
            {data.recentPayments.map((payment) => (
              <li key={payment.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {formatNgn(payment.amountNgn)}
                  </p>
                  <p className="text-xs text-muted">
                    {payment.orderNumber} · {payment.customerName}
                  </p>
                  <p className="text-xs text-muted">{payment.method}</p>
                </div>
                <span className="text-xs text-muted">{payment.recordedAt}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Awaiting processing", value: operational.awaitingProcessing, href: undefined },
          { label: "Ready for collection", value: operational.readyForCollection, href: "/business/orders?filter=ready" },
          { label: "Awaiting delivery", value: operational.awaitingDelivery, href: "/business/deliveries?filter=awaiting" },
          { label: "Cancelled (open period)", value: operational.cancelled, href: undefined },
        ].map((item) => {
          const inner = (
            <>
              <p className="text-2xl font-bold text-foreground">{item.value}</p>
              <p className="text-xs text-muted">{item.label}</p>
            </>
          );
          if (item.href) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-xl border border-dashed border-border bg-surface/80 px-4 py-3 text-center transition-colors hover:border-brand/30 hover:bg-brand-light/20"
              >
                {inner}
              </Link>
            );
          }
          return (
            <div
              key={item.label}
              className="rounded-xl border border-dashed border-border bg-surface/80 px-4 py-3 text-center"
            >
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
