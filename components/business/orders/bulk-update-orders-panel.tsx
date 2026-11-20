"use client";

import { useState } from "react";
import {
  DEFAULT_PROCESSING_STAGE_BY_STATUS,
  PROCESSING_STAGE_SUGGESTIONS,
  STAFF_SELECTABLE_ORDER_STATUSES,
} from "@/lib/business-dashboard/order-status-options";
import type { OrderStatus } from "@/lib/business-dashboard/types";

export function BulkUpdateOrdersPanel({
  selectedCount,
  disabled,
  onClear,
  onApply,
  pending,
  error,
  resultSummary,
}: {
  selectedCount: number;
  disabled?: boolean;
  onClear: () => void;
  onApply: (payload: {
    status: OrderStatus;
    processingStage: string;
  }) => void;
  pending: boolean;
  error: string | null;
  resultSummary: string | null;
}) {
  const [status, setStatus] = useState<OrderStatus>("In Progress");
  const [processingStage, setProcessingStage] = useState(
    DEFAULT_PROCESSING_STAGE_BY_STATUS["In Progress"] ?? "Washing / Dry clean",
  );

  if (selectedCount === 0) {
    return null;
  }

  function handleStatusChange(next: OrderStatus) {
    setStatus(next);
    const suggested = DEFAULT_PROCESSING_STAGE_BY_STATUS[next];
    if (suggested) {
      setProcessingStage(suggested);
    }
  }

  return (
    <div className="sticky top-0 z-20 rounded-2xl border border-brand/30 bg-brand-light/80 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <p className="text-sm font-semibold text-foreground">
          {selectedCount} order{selectedCount === 1 ? "" : "s"} selected
        </p>

        <label className="flex min-w-[12rem] flex-1 flex-col text-xs font-medium text-muted">
          New status
          <select
            value={status}
            disabled={disabled || pending}
            onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
            className="mt-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground"
          >
            {STAFF_SELECTABLE_ORDER_STATUSES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-[12rem] flex-[2] flex-col text-xs font-medium text-muted">
          Processing stage
          <input
            list="bulk-processing-stage-suggestions"
            value={processingStage}
            disabled={disabled || pending}
            onChange={(e) => setProcessingStage(e.target.value)}
            className="mt-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground"
          />
          <datalist id="bulk-processing-stage-suggestions">
            {PROCESSING_STAGE_SUGGESTIONS.map((stage) => (
              <option key={stage} value={stage} />
            ))}
          </datalist>
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={disabled || pending}
            onClick={() =>
              onApply({
                status,
                processingStage: processingStage.trim(),
              })
            }
            className="inline-flex h-10 items-center justify-center rounded-full bg-brand-dark px-5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Updating…" : "Apply to selected"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onClear}
            className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-surface px-4 text-sm font-semibold text-foreground hover:bg-secondary-surface"
          >
            Clear
          </button>
        </div>
      </div>

      {error ? (
        <p className="mt-3 text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {resultSummary ? (
        <p className="mt-3 text-xs font-medium text-emerald-800" role="status">
          {resultSummary}
        </p>
      ) : null}
    </div>
  );
}