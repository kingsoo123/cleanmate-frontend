"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import {
  OrderStatusBadge,
  PaymentStateBadge,
} from "@/components/business/status-badge";
import { formatNgn, formatUpdatedAt } from "@/lib/business-dashboard/format";
import {
  countCustomerOrdersByFilter,
  filterCustomerOrdersList,
  parseCustomerOrderListFilter,
} from "@/lib/customer-dashboard/get-orders-data";
import type {
  CustomerOrderListFilter,
} from "@/lib/customer-dashboard/get-orders-data";
import type { CustomerOrderRow } from "@/lib/customer-dashboard/types";

const filterTabs: { id: CustomerOrderListFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "In progress" },
  { id: "ready", label: "Ready" },
  { id: "action", label: "Needs your action" },
];

export function CustomerOrdersView({ orders }: { orders: CustomerOrderRow[] }) {
  return (
    <Suspense fallback={<CustomerOrdersViewFallback />}>
      <CustomerOrdersViewContent orders={orders} />
    </Suspense>
  );
}

function CustomerOrdersViewFallback() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse space-y-4">
      <div className="h-8 w-40 rounded-lg bg-secondary-surface" />
      <div className="h-10 w-full max-w-xs rounded-xl bg-secondary-surface" />
      <div className="h-48 rounded-2xl bg-secondary-surface" />
    </div>
  );
}

function CustomerOrdersViewContent({
  orders,
}: {
  orders: CustomerOrderRow[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");

  const filter = parseCustomerOrderListFilter(
    searchParams.get("filter") ?? undefined,
  );
  const counts = useMemo(() => countCustomerOrdersByFilter(orders), [orders]);

  const filtered = useMemo(
    () => filterCustomerOrdersList(orders, { filter, query }),
    [orders, filter, query],
  );

  function setFilter(next: CustomerOrderListFilter) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("filter");
    else params.set("filter", next);
    const qs = params.toString();
    router.replace(qs ? `/customer/orders?${qs}` : "/customer/orders", {
      scroll: false,
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-medium text-muted">Orders</p>
        <h2 className="text-2xl font-bold text-foreground">My orders</h2>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search order # or stage…"
          className="w-full rounded-xl border border-border bg-surface py-2.5 px-4 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20 sm:max-w-xs"
        />
        <p className="text-sm text-muted">
          <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
          orders
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterTabs.map((tab) => {
          const active = filter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold sm:px-4 sm:text-sm ${
                active
                  ? "bg-brand text-white"
                  : "border border-border bg-surface text-foreground"
              }`}
            >
              {tab.label} ({counts[tab.id]})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-border bg-surface px-6 py-12 text-center text-sm text-muted">
          No orders match this filter.
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </ul>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: CustomerOrderRow }) {
  const needsAction =
    order.status === "Awaiting Customer Approval" ||
    order.status === "Awaiting Initial Payment";

  return (
    <li>
      <Link
        href={`/customer/orders/${order.id}`}
        className="block rounded-2xl border border-border bg-surface p-4 shadow-sm transition-colors hover:border-brand/30 hover:bg-brand-light/10 sm:p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Tag
            </p>
            <p className="font-mono text-sm font-bold text-brand">
              {order.tag || order.trackingCode || "—"}
            </p>
            <p className="text-xs text-muted">
              {order.laundryName} · Ref {order.orderNumber}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <p className="mt-3 text-sm font-medium text-foreground">
          {order.processingStage}
        </p>
        <p className="mt-1 text-xs text-muted">
          {order.deliveryPreference} · {formatUpdatedAt(order.updatedAt)}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <PaymentStateBadge state={order.paymentState} />
          <div className="text-right text-sm">
            <span className="font-semibold text-foreground">
              {formatNgn(order.totalNgn)}
            </span>
            {order.outstandingNgn > 0 ? (
              <p className="text-xs font-medium text-amber-900">
                {formatNgn(order.outstandingNgn)} due
              </p>
            ) : null}
          </div>
        </div>

        {needsAction ? (
          <p className="mt-3 text-xs font-semibold text-brand">
            Tap to review and respond →
          </p>
        ) : null}
      </Link>
    </li>
  );
}
