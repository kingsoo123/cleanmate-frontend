import Link from "next/link";
import type { ReactNode } from "react";
import { MetricCard } from "@/components/business/dashboard/metric-card";
import {
  OrderStatusBadge,
  PaymentStateBadge,
} from "@/components/business/status-badge";
import { formatNgn, formatUpdatedAt } from "@/lib/business-dashboard/format";
import { PickupStatusBadge } from "@/components/business/pickups/pickup-status-badge";
import type { CustomerDashboardData } from "@/lib/customer-dashboard/types";

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
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

export function CustomerDashboardView({ data }: { data: CustomerDashboardData }) {
  const { summary, featuredOrder } = data;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-medium text-muted">Welcome back</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {data.customerName}
        </h2>
        <p className="mt-1 text-sm text-muted">
          Laundry partner:{" "}
          <span className="font-medium text-foreground">{data.preferredLaundry}</span>
        </p>
      </div>

      {data.isPreviewData ? (
        <p className="rounded-xl border border-brand/20 bg-brand-light/40 px-4 py-3 text-sm text-foreground">
          <span className="font-semibold">Preview layout.</span> Orders and
          payments below are sample data until your account is linked to your
          laundry.
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href="/customer/pickups/new"
          className="inline-flex items-center justify-center rounded-full bg-brand-dark px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Request pickup
        </Link>
        {summary.outstandingNgn > 0 ? (
          <Link
            href="/customer/payments"
            className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary-surface"
          >
            Pay balance ({formatNgn(summary.outstandingNgn)})
          </Link>
        ) : null}
        <Link
          href="/customer/orders"
          className="inline-flex items-center justify-center rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary-surface"
        >
          View all orders
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Active orders"
          value={String(summary.activeOrders)}
          accent="brand"
        />
        <MetricCard label="Ready" value={String(summary.readyOrders)} accent="success" />
        <MetricCard
          label="Balance due"
          value={formatNgn(summary.outstandingNgn)}
          accent={summary.outstandingNgn > 0 ? "warning" : undefined}
        />
        <MetricCard label="Open pickups" value={String(summary.openPickups)} />
      </div>

      {featuredOrder ? (
        <Panel
          title="Track active order"
          action={
            <Link
              href="/customer/orders"
              className="text-xs font-semibold text-brand hover:underline"
            >
              All orders
            </Link>
          }
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-foreground">
                  {featuredOrder.orderNumber}
                </p>
                <p className="text-sm text-muted">{featuredOrder.laundryName}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <OrderStatusBadge status={featuredOrder.status} />
                <PaymentStateBadge state={featuredOrder.paymentState} />
              </div>
            </div>
            <div className="rounded-xl bg-secondary-surface/80 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Current stage
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {featuredOrder.processingStage}
              </p>
              <p className="mt-2 text-xs text-muted">
                {featuredOrder.deliveryPreference} ·{" "}
                {formatUpdatedAt(featuredOrder.updatedAt)}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-muted">
                Total {formatNgn(featuredOrder.totalNgn)}
                {featuredOrder.outstandingNgn > 0 ? (
                  <span className="ml-2 font-semibold text-amber-800">
                    · {formatNgn(featuredOrder.outstandingNgn)} due
                  </span>
                ) : null}
              </span>
            </div>
          </div>
        </Panel>
      ) : null}

      <Panel
        title="Pickup requests"
        action={
          <Link
            href="/customer/pickups"
            className="text-xs font-semibold text-brand hover:underline"
          >
            History
          </Link>
        }
      >
        <ul className="divide-y divide-border">
          {data.pickupRequests.map((pickup) => (
            <li key={pickup.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{pickup.reference}</p>
                <p className="text-sm text-muted">{pickup.scheduledFor}</p>
                <p className="mt-1 truncate text-sm text-foreground/80">
                  {pickup.addressLine}
                </p>
                <p className="text-xs text-muted">{pickup.estimatedItems}</p>
              </div>
              <PickupStatusBadge status={pickup.status} />
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        title="Recent orders"
        action={
          <Link
            href="/customer/orders"
            className="text-xs font-semibold text-brand hover:underline"
          >
            See all
          </Link>
        }
      >
        <div className="space-y-3 lg:hidden">
          {data.recentOrders.map((order) => (
            <Link
              key={order.id}
              href={`/customer/orders/${order.id}`}
              className="block rounded-xl border border-border bg-secondary-surface/30 p-4 transition-colors hover:bg-secondary-surface/60"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-foreground">{order.orderNumber}</p>
                <OrderStatusBadge status={order.status} />
              </div>
              <p className="mt-1 text-sm text-muted">{order.processingStage}</p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {formatNgn(order.totalNgn)}
              </p>
            </Link>
          ))}
        </div>
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="pb-3 pr-4 font-semibold">Order</th>
                <th className="pb-3 pr-4 font-semibold">Status</th>
                <th className="pb-3 pr-4 font-semibold">Payment</th>
                <th className="pb-3 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-foreground">{order.orderNumber}</p>
                    <p className="text-xs text-muted">
                      {formatUpdatedAt(order.updatedAt)}
                    </p>
                  </td>
                  <td className="py-3 pr-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="py-3 pr-4">
                    <PaymentStateBadge state={order.paymentState} />
                  </td>
                  <td className="py-3 text-right font-medium text-foreground">
                    {formatNgn(order.totalNgn)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Recent payments">
        <ul className="divide-y divide-border">
          {data.recentPayments.map((payment) => (
            <li
              key={payment.id}
              className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
            >
              <div>
                <p className="font-medium text-foreground">
                  {formatNgn(payment.amountNgn)}
                </p>
                <p className="text-xs text-muted">
                  {payment.orderNumber} · {payment.method} · {payment.paidAt}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  payment.status === "Successful"
                    ? "bg-emerald-100 text-emerald-900"
                    : "bg-amber-100 text-amber-900"
                }`}
              >
                {payment.status}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
