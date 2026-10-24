"use client";

import { useState } from "react";
import { FormField } from "@/components/auth/form-field";
import { AuthApiError } from "@/lib/auth/api-client";
import { formatNgn } from "@/lib/business-dashboard/format";
import { submitCustomerPayment } from "@/lib/customer-dashboard/payments-api";
import type {
  CustomerOutstandingBalance,
  LaundryTransferDetails,
} from "@/lib/customer-dashboard/payments-types";
import type { CustomerPaymentRow } from "@/lib/customer-dashboard/types";

export type CustomerPayMethod = "bank_transfer" | "pay_at_shop";

function resolveInitialOrderId(
  balances: CustomerOutstandingBalance[],
  preselectedOrderId?: string,
): string {
  if (
    preselectedOrderId &&
    balances.some((b) => b.orderId === preselectedOrderId)
  ) {
    return preselectedOrderId;
  }
  return balances[0]?.orderId ?? "";
}

export function CustomerPayBalanceForm({
  outstanding,
  transferDetails,
  preselectedOrderId,
  onPaymentSubmitted,
}: {
  outstanding: CustomerOutstandingBalance[];
  transferDetails: LaundryTransferDetails;
  preselectedOrderId?: string;
  onPaymentSubmitted: (payment: CustomerPaymentRow) => void;
}) {
  const initialOrderId = resolveInitialOrderId(outstanding, preselectedOrderId);
  const initialBalance = outstanding.find((b) => b.orderId === initialOrderId);

  const [orderId, setOrderId] = useState(initialOrderId);
  const [amount, setAmount] = useState(
    initialBalance ? String(initialBalance.outstandingNgn) : "",
  );
  const [method, setMethod] = useState<CustomerPayMethod>("bank_transfer");
  const [transferRef, setTransferRef] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const selected = outstanding.find((b) => b.orderId === orderId);

  function handleOrderChange(nextId: string) {
    setOrderId(nextId);
    setSubmitted(false);
    const balance = outstanding.find((b) => b.orderId === nextId);
    setAmount(balance ? String(balance.outstandingNgn) : "");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitted(false);

    if (!selected) {
      setError("Select an order to pay.");
      return;
    }

    const amountNgn = Math.max(0, Number.parseInt(amount, 10) || 0);
    if (amountNgn <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (amountNgn > selected.outstandingNgn) {
      setError(`Maximum for this order is ${formatNgn(selected.outstandingNgn)}.`);
      return;
    }
    if (method === "bank_transfer" && !transferRef.trim()) {
      setError("Enter your transfer reference or receipt number.");
      return;
    }

    const methodLabel =
      method === "bank_transfer" ? "Bank transfer" : "Pay at shop";

    setSubmitting(true);
    try {
      const payment = await submitCustomerPayment({
        orderId: selected.orderId,
        amountNgn,
        method: methodLabel,
        transferReference:
          method === "bank_transfer" ? transferRef.trim() : undefined,
      });
      onPaymentSubmitted(payment);
      setSubmitted(true);
      setTransferRef("");
    } catch (err) {
      setError(
        err instanceof AuthApiError
          ? err.message
          : "Could not submit payment.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (outstanding.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground">Pay balance</h3>
        <p className="mt-2 text-sm text-muted">
          You have no outstanding balances on open orders.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <h3 className="text-lg font-semibold text-foreground">Pay balance</h3>
      <p className="mt-1 text-sm text-muted">
        Submit a transfer or mark intent to pay at the shop. Your laundry confirms
        before the order balance updates.
      </p>

      {submitted ? (
        <p
          className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
          role="status"
        >
          Payment submitted. It will show as Pending until your laundry verifies
          it.
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="pay-order" className="block text-sm font-medium text-foreground">
            Order
          </label>
          <select
            id="pay-order"
            value={orderId}
            onChange={(e) => handleOrderChange(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          >
            {outstanding.map((row) => (
              <option key={row.orderId} value={row.orderId}>
                {row.orderNumber} · {formatNgn(row.outstandingNgn)} due
              </option>
            ))}
          </select>
          {selected ? (
            <p className="text-xs text-muted">
              Total {formatNgn(selected.totalNgn)} · Paid{" "}
              {formatNgn(selected.paidNgn)}
            </p>
          ) : null}
        </div>

        <FormField
          name="amount"
          type="number"
          label="Amount (₦)"
          required
          min={1}
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setSubmitted(false);
          }}
        />

        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-foreground">How you pay</span>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["bank_transfer", "Bank transfer"],
                ["pay_at_shop", "Pay at shop"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setMethod(id);
                  setSubmitted(false);
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  method === id
                    ? "bg-brand text-white"
                    : "border border-border bg-surface text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {method === "bank_transfer" ? (
          <div className="space-y-3 rounded-xl border border-border bg-secondary-surface/50 p-4 text-sm">
            <p className="font-semibold text-foreground">Transfer to</p>
            <p className="text-foreground">{transferDetails.laundryName}</p>
            <p className="text-muted">
              {transferDetails.bankName} · {transferDetails.accountName}
            </p>
            <p className="font-mono text-base font-semibold text-brand">
              {transferDetails.accountNumber}
            </p>
            <p className="text-xs text-muted">{transferDetails.note}</p>
            <FormField
              name="transferRef"
              label="Your transfer reference"
              required
              value={transferRef}
              onChange={(e) => setTransferRef(e.target.value)}
              placeholder="e.g. TXN-882910"
            />
          </div>
        ) : (
          <p className="text-sm text-muted">
            Visit the front desk at {transferDetails.laundryName}. Staff will record
            your payment and update the order.
          </p>
        )}

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="flex h-11 w-full items-center justify-center rounded-full bg-brand-dark text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit payment"}
        </button>
      </form>
    </div>
  );
}
