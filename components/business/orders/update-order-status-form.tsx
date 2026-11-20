"use client";

import { useMemo, useState } from "react";
import { AuthApiError } from "@/lib/auth/api-client";
import {
  DEFAULT_PROCESSING_STAGE_BY_STATUS,
  PROCESSING_STAGE_SUGGESTIONS,
  STAFF_SELECTABLE_ORDER_STATUSES,
} from "@/lib/business-dashboard/order-status-options";
import { updateBusinessOrderStatus } from "@/lib/business-dashboard/operations-api";
import type { BusinessOrderListRow } from "@/lib/business-dashboard/orders-types";
import type { OrderStatus } from "@/lib/business-dashboard/types";

const CLOSED_STATUSES: OrderStatus[] = ["Completed", "Cancelled"];

export function UpdateOrderStatusForm({
  order,
  onUpdated,
}: {
  order: BusinessOrderListRow;
  onUpdated: (next: BusinessOrderListRow) => void;
}) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [processingStage, setProcessingStage] = useState(order.processingStage);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const isClosed = CLOSED_STATUSES.includes(order.status);
  const dirty = status !== order.status || processingStage !== order.processingStage;

  const selectableStatuses = useMemo(() => {
    const set = new Set<OrderStatus>(STAFF_SELECTABLE_ORDER_STATUSES);
    if (!set.has(order.status)) {
      set.add(order.status);
    }
    return [...set];
  }, [order.status]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!dirty || isClosed) return;

    setPending(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await updateBusinessOrderStatus(order.id, {
        status,
        processingStage: processingStage.trim() || undefined,
      });
      onUpdated(updated);
      setStatus(updated.status);
      setProcessingStage(updated.processingStage);
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof AuthApiError ? err.message : "Could not update order.",
      );
    } finally {
      setPending(false);
    }
  }

  function handleStatusChange(next: OrderStatus) {
    setStatus(next);
    setSaved(false);
    const suggested = DEFAULT_PROCESSING_STAGE_BY_STATUS[next];
    if (suggested && processingStage === order.processingStage) {
      setProcessingStage(suggested);
    }
  }

  if (isClosed) {
    return (
      <section className="rounded-2xl border border-border bg-secondary-surface/40 p-5 text-sm text-muted">
        This order is {order.status} and cannot be updated here.
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <h3 className="text-sm font-semibold text-foreground">Update status</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Customers with portal access receive an in-app alert when status changes.
      </p>

      <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-4">
        <label className="block text-xs font-medium text-muted">
          Order status
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            {selectableStatuses.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-xs font-medium text-muted">
          Processing stage
          <input
            list="processing-stage-suggestions"
            value={processingStage}
            onChange={(e) => {
              setProcessingStage(e.target.value);
              setSaved(false);
            }}
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
          <datalist id="processing-stage-suggestions">
            {PROCESSING_STAGE_SUGGESTIONS.map((stage) => (
              <option key={stage} value={stage} />
            ))}
          </datalist>
        </label>

        {error ? (
          <p className="text-xs text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        {saved && !dirty ? (
          <p className="text-xs font-medium text-emerald-800" role="status">
            Order updated.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending || !dirty}
          className="inline-flex h-11 items-center justify-center rounded-full bg-brand-dark px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save status"}
        </button>
      </form>
    </section>
  );
}