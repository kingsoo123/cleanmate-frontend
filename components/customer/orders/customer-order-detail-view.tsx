"use client";

import Link from "next/link";
import { useState } from "react";
import {
  OrderStatusBadge,
  PaymentStateBadge,
} from "@/components/business/status-badge";
import { formatNgn } from "@/lib/business-dashboard/format";
import type { CustomerOrderRow } from "@/lib/customer-dashboard/types";
import type { OrderStatus } from "@/lib/business-dashboard/types";

export function CustomerOrderDetailView({ order }: { order: CustomerOrderRow }) {
  const [status, setStatus] = useState(order.status);
  const [approved, setApproved] = useState(false);

  const awaitingApproval = status === "Awaiting Customer Approval";
  const canPay = order.outstandingNgn > 0 && status !== "Awaiting Customer Approval";

  function handleApprove() {
    setApproved(true);
    setStatus("Awaiting Initial Payment" as OrderStatus);
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Link
        href="/customer/orders"
        className="text-sm font-semibold text-brand hover:underline"
      >
        ← My orders
      </Link>

      <div>
        <p className="font-mono text-sm font-semibold text-brand">
          {order.orderNumber}
        </p>
        <h2 className="mt-1 text-2xl font-bold text-foreground">
          {order.laundryName}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <OrderStatusBadge status={status} />
          <PaymentStateBadge state={order.paymentState} />
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground">Progress</h3>
        <p className="mt-2 text-lg font-medium text-foreground">
          {order.processingStage}
        </p>
        <p className="mt-1 text-sm text-muted">{order.updatedAt}</p>
        <dl className="mt-5 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              Delivery
            </dt>
            <dd className="mt-1 font-medium">{order.deliveryPreference}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              Order total
            </dt>
            <dd className="mt-1 font-medium">{formatNgn(order.totalNgn)}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              Balance due
            </dt>
            <dd className="mt-1 font-medium">
              {order.outstandingNgn > 0
                ? formatNgn(order.outstandingNgn)
                : "Nothing due"}
            </dd>
          </div>
        </dl>
      </section>

      {awaitingApproval && !approved ? (
        <section className="rounded-2xl border border-brand/25 bg-brand-light/30 p-5">
          <h3 className="font-semibold text-foreground">Approve quotation</h3>
          <p className="mt-2 text-sm text-muted">
            Your laundry has sent a quote for this order. Approve to proceed with
            processing.
          </p>
          <button
            type="button"
            onClick={handleApprove}
            className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-brand-dark text-sm font-semibold text-white hover:opacity-90"
          >
            Approve {formatNgn(order.totalNgn)}
          </button>
        </section>
      ) : null}

      {approved ? (
        <p
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          role="status"
        >
          Quotation approved (preview). Initial payment can be recorded by your
          laundry or via Pay below when connected.
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        {canPay ? (
          <Link
            href={`/customer/payments?order=${order.id}`}
            className="inline-flex h-11 items-center justify-center rounded-full bg-brand-dark text-sm font-semibold text-white hover:opacity-90"
          >
            Pay balance
          </Link>
        ) : null}
        <Link
          href="/customer/pickups/new"
          className="inline-flex h-10 items-center justify-center rounded-full border border-border text-sm font-semibold text-foreground hover:bg-secondary-surface"
        >
          Request pickup
        </Link>
      </div>
    </div>
  );
}
