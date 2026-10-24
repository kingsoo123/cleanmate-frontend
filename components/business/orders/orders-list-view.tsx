"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  OrderStatusBadge,
  PaymentStateBadge,
} from "@/components/business/status-badge";
import {
  formatNgn,
  formatUpdatedAt,
  formatUpdatedAtTitle,
} from "@/lib/business-dashboard/format";
import {
  countOrdersByFilter,
  filterOrdersList,
  ORDERS_PAGE_SIZE,
  paginateOrders,
  parseOrderListFilter,
  parseOrdersPage,
  sumOutstandingNgn,
} from "@/lib/business-dashboard/get-orders-data";
import type {
  BusinessOrderListRow,
  OrderListFilter,
} from "@/lib/business-dashboard/orders-types";

const filterTabs: { id: OrderListFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "ready", label: "Ready" },
  { id: "attention", label: "Needs attention" },
  { id: "unpaid", label: "Unpaid balance" },
];

export function OrdersListView({
  orders,
}: {
  orders: BusinessOrderListRow[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");

  const filter = parseOrderListFilter(
    searchParams.get("filter") ?? undefined,
  );
  const counts = useMemo(() => countOrdersByFilter(orders), [orders]);

  const filtered = useMemo(
    () => filterOrdersList(orders, { filter, query }),
    [orders, filter, query],
  );

  const outstandingVisible = useMemo(
    () => sumOutstandingNgn(filtered),
    [filtered],
  );

  const pageFromUrl = parseOrdersPage(searchParams.get("page"));
  const pagination = useMemo(
    () => paginateOrders(filtered, pageFromUrl, ORDERS_PAGE_SIZE),
    [filtered, pageFromUrl],
  );
  const pageOrders = pagination.items;

  useEffect(() => {
    if (pageFromUrl !== pagination.page) {
      setPage(pagination.page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync URL when clamped
  }, [pageFromUrl, pagination.page]);

  function setPage(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (next <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(next));
    }
    const qs = params.toString();
    router.replace(qs ? `/business/orders?${qs}` : "/business/orders", {
      scroll: false,
    });
  }

  function setFilter(next: OrderListFilter) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") {
      params.delete("filter");
    } else {
      params.set("filter", next);
    }
    params.delete("page");
    const qs = params.toString();
    router.replace(qs ? `/business/orders?${qs}` : "/business/orders", {
      scroll: false,
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">Operations</p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Orders
          </h2>
        </div>
        <Link
          href="/business/orders/new"
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-brand-dark px-5 text-sm font-semibold text-white hover:opacity-90"
        >
          Create new order
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <label htmlFor="orders-search" className="sr-only">
            Search orders
          </label>
          <input
            id="orders-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order #, customer, or phone…"
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-4 pr-4 text-sm text-foreground placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        </div>
        <p className="text-sm text-muted">
          <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "order" : "orders"}
          {filtered.length > 0 ? (
            <span>
              {" "}
              ·{" "}
              {(pagination.page - 1) * ORDERS_PAGE_SIZE + 1}–
              {Math.min(pagination.page * ORDERS_PAGE_SIZE, filtered.length)} on
              this page
            </span>
          ) : null}
          {filter !== "all" ? (
            <span> · {counts[filter]} in this filter</span>
          ) : null}
          {outstandingVisible > 0 ? (
            <span className="ml-1 text-amber-900">
              · {formatNgn(outstandingVisible)} outstanding
            </span>
          ) : null}
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
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "bg-brand text-white shadow-sm"
                  : "border border-border bg-surface text-foreground hover:bg-secondary-surface"
              }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 text-xs ${active ? "text-white/90" : "text-muted"}`}
              >
                ({counts[tab.id]})
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-sm">
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-medium text-foreground">No orders match</p>
            <p className="mt-1 text-sm text-muted">
              Try another filter or clear your search.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setFilter("all");
              }}
              className="mt-4 text-sm font-semibold text-brand hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3 p-4 lg:hidden">
              {pageOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                    <th className="px-5 pb-3 pt-4 font-medium">Order</th>
                    <th className="pb-3 pr-4 font-medium">Tag</th>
                    <th className="pb-3 pr-4 font-medium">Customer</th>
                    <th className="pb-3 pr-4 font-medium">Source</th>
                    <th className="pb-3 pr-4 font-medium">Stage</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Payment</th>
                    <th className="pb-3 pr-4 font-medium text-right">Total</th>
                    <th className="px-5 pb-3 pt-4 font-medium text-right">
                      Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pageOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="group hover:bg-secondary-surface/40"
                    >
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/business/orders/${order.id}`}
                          className="font-mono text-xs font-semibold text-brand hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                        <p className="mt-0.5 max-w-[10rem] truncate text-xs text-muted">
                          {order.itemsSummary}
                        </p>
                      </td>
                      <td className="py-3.5 pr-4 font-mono text-xs font-semibold text-brand">
                        {order.tag ?? order.trackingCode ?? "—"}
                      </td>
                      <td className="py-3.5 pr-4">
                        <p className="font-medium text-foreground">
                          {order.customerName}
                        </p>
                        <p className="text-xs text-muted">{order.customerPhone}</p>
                      </td>
                      <td className="py-3.5 pr-4 text-muted">{order.source}</td>
                      <td className="py-3.5 pr-4 text-foreground">
                        {order.processingStage}
                      </td>
                      <td className="py-3.5 pr-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="flex flex-col gap-1">
                          <PaymentStateBadge state={order.paymentState} />
                          {order.outstandingNgn > 0 ? (
                            <span className="text-xs font-medium text-amber-900">
                              {formatNgn(order.outstandingNgn)} due
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 text-right font-medium">
                        {formatNgn(order.totalNgn)}
                      </td>
                      <td
                        className="px-5 py-3.5 text-right text-muted"
                        title={formatUpdatedAtTitle(order.updatedAt)}
                      >
                        {formatUpdatedAt(order.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <OrdersPagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={filtered.length}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}

function OrdersPagination({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) {
  if (totalItems <= ORDERS_PAGE_SIZE) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-sm text-muted">
        Page{" "}
        <span className="font-semibold text-foreground">{page}</span> of{" "}
        <span className="font-semibold text-foreground">{totalPages}</span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary-surface disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground hover:bg-secondary-surface disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: BusinessOrderListRow }) {
  return (
    <Link
      href={`/business/orders/${order.id}`}
      className="block rounded-xl border border-border bg-secondary-surface/30 p-4 transition-colors hover:bg-secondary-surface/60"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-sm font-semibold text-brand">
          {order.orderNumber}
        </p>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="mt-1 font-mono text-xs font-semibold text-brand">
        Tag {order.tag ?? order.trackingCode ?? "—"}
      </p>
      <p className="mt-1 font-medium text-foreground">{order.customerName}</p>
      <p className="text-xs text-muted">
        {order.source} · {order.processingStage}
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <PaymentStateBadge state={order.paymentState} />
        <span className="text-sm font-semibold text-foreground">
          {formatNgn(order.totalNgn)}
        </span>
      </div>
    </Link>
  );
}
