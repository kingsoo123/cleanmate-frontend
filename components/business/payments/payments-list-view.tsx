"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { AuthApiError } from "@/lib/auth/api-client";
import { MetricCard } from "@/components/business/dashboard/metric-card";
import { RecordPaymentForm } from "@/components/business/payments/record-payment-form";
import { formatNgn, formatUpdatedAt } from "@/lib/business-dashboard/format";
import { verifyBusinessPayment } from "@/lib/business-dashboard/payments-api";
import {
  countPaymentsByFilter,
  filterPaymentsList,
  parsePaymentListFilter,
  recomputeSummary,
} from "@/lib/business-dashboard/get-payments-data";
import type {
  BusinessPaymentRecord,
  OutstandingOrderForPayment,
  PaymentListFilter,
} from "@/lib/business-dashboard/payments-types";

const filterTabs: { id: PaymentListFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "cash", label: "Cash" },
  { id: "transfer", label: "Transfer" },
];

function PaymentStatusPill({
  status,
}: {
  status: BusinessPaymentRecord["status"];
}) {
  const style =
    status === "Recorded"
      ? "bg-emerald-50 text-emerald-800"
      : "bg-amber-50 text-amber-900";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}

export function PaymentsListView({
  initialPayments,
  initialOutstanding,
  onRefresh,
}: {
  initialPayments: BusinessPaymentRecord[];
  initialOutstanding: OutstandingOrderForPayment[];
  onRefresh?: () => Promise<void>;
}) {
  return (
    <Suspense fallback={null}>
      <PaymentsListViewContent
        initialPayments={initialPayments}
        initialOutstanding={initialOutstanding}
        onRefresh={onRefresh}
      />
    </Suspense>
  );
}

function PaymentsListViewContent({
  initialPayments,
  initialOutstanding,
  onRefresh,
}: {
  initialPayments: BusinessPaymentRecord[];
  initialOutstanding: OutstandingOrderForPayment[];
  onRefresh?: () => Promise<void>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [payments, setPayments] = useState(initialPayments ?? []);
  const [outstanding, setOutstanding] = useState(initialOutstanding ?? []);

  useEffect(() => {
    setPayments(initialPayments ?? []);
    setOutstanding(initialOutstanding ?? []);
  }, [initialPayments, initialOutstanding]);
  const [query, setQuery] = useState("");
  const [preselectedOrderId, setPreselectedOrderId] = useState<string>();
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const summary = useMemo(
    () => recomputeSummary(payments, outstanding),
    [payments, outstanding],
  );

  const filter = parsePaymentListFilter(searchParams.get("filter") ?? undefined);
  const counts = useMemo(() => countPaymentsByFilter(payments), [payments]);

  const filtered = useMemo(
    () => filterPaymentsList(payments, { filter, query }),
    [payments, filter, query],
  );

  function setFilter(next: PaymentListFilter) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("filter");
    else params.set("filter", next);
    const qs = params.toString();
    router.replace(qs ? `/business/payments?${qs}` : "/business/payments", {
      scroll: false,
    });
  }

  function handlePaymentRecorded(
    payment: BusinessPaymentRecord,
    orderId: string,
    amountNgn: number,
  ) {
    setPayments((prev) => [payment, ...prev]);
    setOutstanding((prev) =>
      prev
        .map((order) => {
          if (order.orderId !== orderId) return order;
          const paidNgn = order.paidNgn + amountNgn;
          const outstandingNgn = Math.max(0, order.totalNgn - paidNgn);
          return { ...order, paidNgn, outstandingNgn };
        })
        .filter((order) => order.outstandingNgn > 0),
    );
    void onRefresh?.();
  }

  async function handleVerifyPayment(paymentId: string) {
    setVerifyError(null);
    setVerifyingId(paymentId);
    try {
      const updated = await verifyBusinessPayment(paymentId);
      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? updated : p)),
      );
      await onRefresh?.();
    } catch (err) {
      setVerifyError(
        err instanceof AuthApiError
          ? err.message
          : "Could not verify payment.",
      );
    } finally {
      setVerifyingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">Finance</p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Payments
          </h2>
        </div>
        <Link
          href="/business/orders?filter=unpaid"
          className="text-sm font-semibold text-brand hover:underline"
        >
          Orders with balance
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Received today"
          value={formatNgn(summary.receivedTodayNgn)}
          hint={`${summary.paymentsTodayCount} payments logged`}
          accent="success"
        />
        <MetricCard
          label="This week"
          value={formatNgn(summary.receivedThisWeekNgn)}
          accent="brand"
        />
        <MetricCard
          label="Outstanding on orders"
          value={formatNgn(summary.outstandingOrdersNgn)}
          hint={`${outstanding.length} orders with balance`}
          accent="warning"
        />
        <MetricCard
          label="Ledger entries"
          value={String(payments.length)}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <RecordPaymentForm
            key={preselectedOrderId ?? "default"}
            outstandingOrders={outstanding}
            preselectedOrderId={preselectedOrderId}
            onPaymentRecorded={handlePaymentRecorded}
          />
        </div>

        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-border bg-surface shadow-sm">
            <div className="border-b border-border px-5 py-3">
              <h3 className="font-semibold text-foreground">Outstanding balances</h3>
              <p className="text-xs text-muted">Select to pre-fill record payment</p>
            </div>
            <ul className="max-h-64 divide-y divide-border overflow-y-auto">
              {outstanding.length === 0 ? (
                <li className="px-5 py-6 text-sm text-muted">
                  All caught up — no balances due on open orders.
                </li>
              ) : (
                outstanding.map((order) => (
                  <li key={order.orderId}>
                    <button
                      type="button"
                      onClick={() => setPreselectedOrderId(order.orderId)}
                      className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left hover:bg-secondary-surface/40"
                    >
                      <div>
                        <p className="font-mono text-xs font-semibold text-brand">
                          {order.orderNumber}
                        </p>
                        <p className="text-sm text-foreground">{order.customerName}</p>
                      </div>
                      <span className="text-sm font-semibold text-amber-900">
                        {formatNgn(order.outstandingNgn)}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search reference, order, customer…"
          className="max-w-md flex-1 rounded-xl border border-border bg-surface py-2.5 px-4 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
        <p className="text-sm text-muted">
          <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
          entries
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
              filter === tab.id
                ? "bg-brand text-white"
                : "border border-border bg-surface hover:bg-secondary-surface"
            }`}
          >
            {tab.label} ({counts[tab.id]})
          </button>
        ))}
      </div>

      {verifyError ? (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {verifyError}
        </p>
      ) : null}

      <div className="rounded-2xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-medium">Reference</th>
                <th className="py-3 pr-4 font-medium">Order</th>
                <th className="py-3 pr-4 font-medium">Customer</th>
                <th className="py-3 pr-4 font-medium">Method</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium text-right">Amount</th>
                <th className="px-5 py-3 font-medium text-right">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted">
                    No payments match.
                  </td>
                </tr>
              ) : (
                filtered.map((payment) => (
                  <tr key={payment.id} className="hover:bg-secondary-surface/30">
                    <td className="px-5 py-3">
                      <p className="font-mono text-xs font-semibold text-brand">
                        {payment.reference}
                      </p>
                      {payment.note ? (
                        <p className="max-w-[8rem] truncate text-xs text-muted">
                          {payment.note}
                        </p>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs">{payment.orderNumber}</td>
                    <td className="py-3 pr-4 text-foreground">{payment.customerName}</td>
                    <td className="py-3 pr-4 text-muted">{payment.method}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-col items-start gap-1">
                        <PaymentStatusPill status={payment.status} />
                        {payment.status === "Pending verification" ? (
                          <button
                            type="button"
                            disabled={verifyingId === payment.id}
                            onClick={() => void handleVerifyPayment(payment.id)}
                            className="text-xs font-semibold text-brand hover:underline disabled:opacity-50"
                          >
                            {verifyingId === payment.id ? "Verifying…" : "Verify"}
                          </button>
                        ) : null}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-right font-semibold">
                      {formatNgn(payment.amountNgn)}
                    </td>
                    <td className="px-5 py-3 text-right text-muted">
                      {formatUpdatedAt(payment.recordedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-muted">
        Customer-submitted transfers appear as pending until you verify them.
        Payments you record here apply to the order balance immediately.
      </p>
    </div>
  );
}
