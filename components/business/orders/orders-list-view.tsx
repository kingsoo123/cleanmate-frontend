"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  OrderStatusBadge,
  PaymentStateBadge,
} from "@/components/business/status-badge";
import { BulkUpdateOrdersPanel } from "@/components/business/orders/bulk-update-orders-panel";
import { ViewOrderButton } from "@/components/business/orders/view-order-button";
import { AuthApiError } from "@/lib/auth/api-client";
import { bulkUpdateBusinessOrderStatus } from "@/lib/business-dashboard/operations-api";
import type { OrderStatus } from "@/lib/business-dashboard/types";
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
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { downloadOrdersTablePdf } from "@/lib/business-dashboard/export-orders-pdf";
import type {
  BusinessOrderListRow,
  OrderListFilter,
} from "@/lib/business-dashboard/orders-types";

const CLOSED_ORDER_STATUSES: OrderStatus[] = ["Completed", "Cancelled"];

function isOrderOpenForBulkEdit(status: OrderStatus) {
  return !CLOSED_ORDER_STATUSES.includes(status);
}

const filterTabs: { id: OrderListFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "ready", label: "Ready" },
  { id: "attention", label: "Needs attention" },
  { id: "unpaid", label: "Unpaid balance" },
];

export function OrdersListView({
  orders,
  onOrdersPatched,
}: {
  orders: BusinessOrderListRow[];
  onOrdersPatched?: (updatedRows: BusinessOrderListRow[]) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkPending, setBulkPending] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [bulkSummary, setBulkSummary] = useState<string | null>(null);
  const [pdfPending, setPdfPending] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const user = useAuthUser();
  const showCreatedByColumn = user?.role === "business";
  const canDownloadPdf = user?.role === "business";

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
  const selectableOnPage = pageOrders.filter((o) =>
    isOrderOpenForBulkEdit(o.status),
  );
  const allOnPageSelected =
    selectableOnPage.length > 0 &&
    selectableOnPage.every((o) => selectedIds.has(o.id));

  useEffect(() => {
    setSelectedIds(new Set());
    setBulkSummary(null);
    setBulkError(null);
  }, [filter, query]);

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

  function toggleSelected(orderId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
    setBulkSummary(null);
  }

  function toggleSelectAllOnPage() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        for (const order of selectableOnPage) {
          next.delete(order.id);
        }
      } else {
        for (const order of selectableOnPage) {
          next.add(order.id);
        }
      }
      return next;
    });
    setBulkSummary(null);
  }

  function clearSelection() {
    setSelectedIds(new Set());
    setBulkError(null);
    setBulkSummary(null);
  }

  async function handleBulkApply(payload: {
    status: OrderStatus;
    processingStage: string;
  }) {
    const orderIds = [...selectedIds];
    if (orderIds.length === 0) return;

    setBulkPending(true);
    setBulkError(null);
    setBulkSummary(null);
    try {
      const result = await bulkUpdateBusinessOrderStatus({
        orderIds,
        status: payload.status,
        processingStage: payload.processingStage || undefined,
      });
      onOrdersPatched?.(result.updated);
      if (result.updatedCount === 0 && result.skippedCount > 0) {
        const detail = result.skipped
          .map((s) => `${s.orderNumber}: ${s.reason}`)
          .join(" · ");
        setBulkError(
          detail || "No orders were updated. Check selection and rules below.",
        );
        setBulkSummary(null);
      } else {
        const parts = [
          `Updated ${result.updatedCount} order${result.updatedCount === 1 ? "" : "s"}.`,
        ];
        if (result.skippedCount > 0) {
          const detail = result.skipped
            .slice(0, 3)
            .map((s) => `${s.orderNumber}: ${s.reason}`)
            .join(" · ");
          parts.push(
            `${result.skippedCount} skipped${detail ? ` (${detail}${result.skippedCount > 3 ? "…" : ""})` : ""}.`,
          );
        }
        setBulkSummary(parts.join(" "));
        setBulkError(null);
      }
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const row of result.updated) {
          next.delete(row.id);
        }
        return next;
      });
    } catch (err) {
      setBulkError(
        err instanceof AuthApiError ? err.message : "Bulk update failed.",
      );
    } finally {
      setBulkPending(false);
    }
  }

  async function handleDownloadPdf() {
    if (filtered.length === 0) return;
    setPdfPending(true);
    setPdfError(null);
    try {
      await downloadOrdersTablePdf({
        orders: filtered,
        filter,
        searchQuery: query,
        businessName: user?.businessName,
        includeCreatedBy: showCreatedByColumn,
      });
    } catch {
      setPdfError("Could not generate PDF. Try again.");
    } finally {
      setPdfPending(false);
    }
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
        <div className="flex flex-wrap gap-2">
          {canDownloadPdf ? (
            <button
              type="button"
              onClick={() => void handleDownloadPdf()}
              disabled={pdfPending || filtered.length === 0}
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface px-5 text-sm font-semibold text-foreground hover:bg-secondary-surface disabled:opacity-50"
            >
              {pdfPending ? "Preparing PDF…" : "Download PDF"}
            </button>
          ) : null}
          <Link
            href="/business/orders/new"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-brand-dark px-5 text-sm font-semibold text-white hover:opacity-90"
          >
            Create new order
          </Link>
        </div>
      </div>

      {pdfError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {pdfError}
        </p>
      ) : null}

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

      <BulkUpdateOrdersPanel
        selectedCount={selectedIds.size}
        disabled={!onOrdersPatched}
        onClear={clearSelection}
        onApply={(payload) => void handleBulkApply(payload)}
        pending={bulkPending}
        error={bulkError}
        resultSummary={bulkSummary}
      />

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
                <OrderCard
                  key={order.id}
                  order={order}
                  showCreatedBy={showCreatedByColumn}
                  selectable={isOrderOpenForBulkEdit(order.status)}
                  selected={selectedIds.has(order.id)}
                  onToggleSelect={() => toggleSelected(order.id)}
                />
              ))}
            </div>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                    <th className="w-10 px-3 pb-3 pt-4 font-medium">
                      <span className="sr-only">Select</span>
                      <input
                        type="checkbox"
                        checked={allOnPageSelected}
                        disabled={selectableOnPage.length === 0}
                        onChange={toggleSelectAllOnPage}
                        className="h-4 w-4 rounded border-border text-brand focus:ring-brand/30"
                        aria-label="Select all orders on this page"
                      />
                    </th>
                    <th className="px-3 pb-3 pt-4 font-medium">Order</th>
                    <th className="pb-3 pr-4 font-medium">Tag</th>
                    <th className="pb-3 pr-4 font-medium">Customer</th>
                    {showCreatedByColumn ? (
                      <th className="pb-3 pr-4 font-medium">Created by</th>
                    ) : null}
                    <th className="pb-3 pr-4 font-medium">Source</th>
                    <th className="pb-3 pr-4 font-medium">Stage</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Payment</th>
                    <th className="pb-3 pr-4 font-medium text-right">Total</th>
                    <th className="pb-3 pr-4 font-medium text-right">Updated</th>
                    <th className="px-5 pb-3 pt-4 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pageOrders.map((order) => (
                    <tr
                      key={order.id}
                      className={`group hover:bg-secondary-surface/40 ${selectedIds.has(order.id) ? "bg-brand-light/25" : ""}`}
                    >
                      <td className="px-3 py-3.5">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(order.id)}
                          disabled={!isOrderOpenForBulkEdit(order.status)}
                          onChange={() => toggleSelected(order.id)}
                          className="h-4 w-4 rounded border-border text-brand focus:ring-brand/30 disabled:opacity-40"
                          aria-label={`Select ${order.orderNumber}`}
                        />
                      </td>
                      <td className="px-3 py-3.5 sm:px-5">
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
                      {showCreatedByColumn ? (
                        <td className="py-3.5 pr-4 text-foreground">
                          {order.createdByName ?? (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                      ) : null}
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
                        className="py-3.5 pr-4 text-right text-muted"
                        title={formatUpdatedAtTitle(order.updatedAt)}
                      >
                        {formatUpdatedAt(order.updatedAt)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <ViewOrderButton orderId={order.id} />
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

function OrderCard({
  order,
  showCreatedBy,
  selectable,
  selected,
  onToggleSelect,
}: {
  order: BusinessOrderListRow;
  showCreatedBy?: boolean;
  selectable: boolean;
  selected: boolean;
  onToggleSelect: () => void;
}) {
  return (
    <div
      className={`rounded-xl border border-border p-4 ${selected ? "bg-brand-light/30" : "bg-secondary-surface/30"}`}
    >
      <div className="flex items-start gap-3">
        {selectable ? (
          <input
            type="checkbox"
            checked={selected}
            onChange={onToggleSelect}
            className="mt-1 h-4 w-4 shrink-0 rounded border-border text-brand"
            aria-label={`Select ${order.orderNumber}`}
          />
        ) : (
          <span className="mt-1 w-4 shrink-0" aria-hidden />
        )}
        <div className="min-w-0 flex-1">
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
      {showCreatedBy && order.createdByName ? (
        <p className="text-xs text-muted">Created by {order.createdByName}</p>
      ) : null}
      <p className="text-xs text-muted">
        {order.source} · {order.processingStage}
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <PaymentStateBadge state={order.paymentState} />
        <span className="text-sm font-semibold text-foreground">
          {formatNgn(order.totalNgn)}
        </span>
      </div>
      <div className="mt-3 flex justify-end">
        <ViewOrderButton orderId={order.id} />
      </div>
        </div>
      </div>
    </div>
  );
}
