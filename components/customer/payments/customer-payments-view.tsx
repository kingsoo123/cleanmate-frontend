"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { CustomerPayBalanceForm } from "@/components/customer/payments/customer-pay-balance-form";
import { formatNgn, formatUpdatedAt } from "@/lib/business-dashboard/format";
import {
  countCustomerPaymentHistoryFilters,
  filterCustomerPaymentHistory,
  parseCustomerPaymentHistoryFilter,
} from "@/lib/customer-dashboard/get-payments-data";
import type { CustomerPaymentHistoryFilter } from "@/lib/customer-dashboard/get-payments-data";
import type {
  CustomerOutstandingBalance,
  LaundryTransferDetails,
} from "@/lib/customer-dashboard/payments-types";
import type { CustomerPaymentRow } from "@/lib/customer-dashboard/types";

const historyFilters: { id: CustomerPaymentHistoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "successful", label: "Successful" },
];

export function CustomerPaymentsView({
  initialOutstanding,
  initialTotalOutstandingNgn,
  transferDetails,
  initialHistory,
  preselectedOrderId,
}: {
  initialOutstanding: CustomerOutstandingBalance[];
  initialTotalOutstandingNgn: number;
  transferDetails: LaundryTransferDetails;
  initialHistory: CustomerPaymentRow[];
  preselectedOrderId?: string;
}) {
  const [outstanding, setOutstanding] = useState(initialOutstanding);
  const [totalOutstanding, setTotalOutstanding] = useState(
    initialTotalOutstandingNgn,
  );
  const [history, setHistory] = useState(initialHistory);

  function handlePaymentSubmitted(payment: CustomerPaymentRow) {
    setHistory((prev) => [payment, ...prev]);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm font-medium text-muted">Billing</p>
        <h2 className="text-2xl font-bold text-foreground">Payments</h2>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Total outstanding
        </p>
        <p className="mt-1 text-3xl font-bold text-foreground">
          {formatNgn(totalOutstanding)}
        </p>
        <p className="mt-1 text-sm text-muted">
          Across {outstanding.length}{" "}
          {outstanding.length === 1 ? "order" : "orders"} with a balance due
        </p>
        {outstanding.length > 0 ? (
          <ul className="mt-4 space-y-2 border-t border-border pt-4">
            {outstanding.map((row) => (
              <li
                key={row.orderId}
                className="flex items-center justify-between text-sm"
              >
                <Link
                  href={`/customer/orders/${row.orderId}`}
                  className="font-mono text-xs font-semibold text-brand hover:underline"
                >
                  {row.orderNumber}
                </Link>
                <span className="font-semibold text-amber-900">
                  {formatNgn(row.outstandingNgn)}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <CustomerPayBalanceForm
        key={preselectedOrderId ?? "default"}
        outstanding={outstanding}
        transferDetails={transferDetails}
        preselectedOrderId={preselectedOrderId}
        onPaymentSubmitted={(payment) => {
          handlePaymentSubmitted(payment);
        }}
      />

      <Suspense fallback={null}>
        <PaymentHistorySection history={history} />
      </Suspense>

      <Link
        href="/customer/orders"
        className="inline-block text-sm font-semibold text-brand hover:underline"
      >
        ← Back to my orders
      </Link>
    </div>
  );
}

function PaymentHistorySection({ history }: { history: CustomerPaymentRow[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const historyFilter = parseCustomerPaymentHistoryFilter(
    searchParams.get("filter") ?? undefined,
  );
  const historyCounts = useMemo(
    () => countCustomerPaymentHistoryFilters(history),
    [history],
  );
  const filteredHistory = useMemo(
    () => filterCustomerPaymentHistory(history, historyFilter),
    [history, historyFilter],
  );

  function setHistoryFilter(next: CustomerPaymentHistoryFilter) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("filter");
    else params.set("filter", next);
    const qs = params.toString();
    router.replace(qs ? `/customer/payments?${qs}` : "/customer/payments", {
      scroll: false,
    });
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-foreground">Payment history</h3>
        <div className="flex gap-2">
          {historyFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setHistoryFilter(f.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                historyFilter === f.id
                  ? "bg-brand text-white"
                  : "border border-border bg-surface text-muted"
              }`}
            >
              {f.label} ({historyCounts[f.id]})
            </button>
          ))}
        </div>
      </div>

      <ul className="divide-y divide-border rounded-2xl border border-border bg-surface shadow-sm">
        {filteredHistory.length === 0 ? (
          <li className="px-5 py-10 text-center text-sm text-muted">
            No payments in this view.
          </li>
        ) : (
          filteredHistory.map((payment) => (
            <li
              key={payment.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {formatNgn(payment.amountNgn)}
                </p>
                <p className="text-xs text-muted">
                  {payment.orderNumber} · {payment.method}
                </p>
                <p className="text-xs text-muted">
                  {formatUpdatedAt(payment.paidAt)}
                </p>
              </div>
              <PaymentStatusPill status={payment.status} />
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

function PaymentStatusPill({
  status,
}: {
  status: CustomerPaymentRow["status"];
}) {
  const style =
    status === "Successful"
      ? "bg-emerald-50 text-emerald-800"
      : "bg-amber-50 text-amber-900";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}
