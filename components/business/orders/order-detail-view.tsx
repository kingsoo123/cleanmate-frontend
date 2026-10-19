import Link from "next/link";
import {
  OrderStatusBadge,
  PaymentStateBadge,
} from "@/components/business/status-badge";
import { formatNgn } from "@/lib/business-dashboard/format";
import type { BusinessOrderListRow } from "@/lib/business-dashboard/orders-types";

export function OrderDetailView({
  order,
  isPreviewData,
}: {
  order: BusinessOrderListRow;
  isPreviewData: boolean;
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/business/orders"
          className="text-sm font-semibold text-brand hover:underline"
        >
          ← All orders
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-sm font-semibold text-brand">
              {order.orderNumber}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-foreground">
              {order.customerName}
            </h2>
            <p className="mt-1 text-sm text-muted">{order.customerPhone}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <OrderStatusBadge status={order.status} />
            <PaymentStateBadge state={order.paymentState} />
          </div>
        </div>
      </div>

      {isPreviewData ? (
        <p className="rounded-xl border border-brand/20 bg-brand-light/40 px-4 py-3 text-sm text-foreground">
          <span className="font-semibold">Preview.</span> Processing actions,
          line items, and payment recording will connect here in a later phase.
        </p>
      ) : null}

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <h3 className="text-sm font-semibold text-foreground">Summary</h3>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <DetailItem label="Source" value={order.source} />
          <DetailItem label="Processing stage" value={order.processingStage} />
          <DetailItem label="Items" value={order.itemsSummary} />
          <DetailItem label="Created" value={order.createdAt} />
          <DetailItem label="Last updated" value={order.updatedAt} />
          <DetailItem label="Order total" value={formatNgn(order.totalNgn)} />
          <DetailItem
            label="Outstanding"
            value={
              order.outstandingNgn > 0
                ? formatNgn(order.outstandingNgn)
                : "None"
            }
          />
        </dl>
      </section>

      <div className="flex flex-wrap gap-3">
        <span className="inline-flex cursor-not-allowed items-center rounded-full bg-brand-dark/50 px-5 py-2.5 text-sm font-semibold text-white">
          Update status (soon)
        </span>
        <span className="inline-flex cursor-not-allowed items-center rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-muted">
          Record payment (soon)
        </span>
        <Link
          href="/business/payments"
          className="inline-flex items-center rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary-surface"
        >
          Payments module
        </Link>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}
