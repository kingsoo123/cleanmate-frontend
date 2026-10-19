"use client";

import { useState } from "react";
import { FormField } from "@/components/auth/form-field";
import { formatNgn } from "@/lib/business-dashboard/format";
import type {
  BusinessPaymentRecord,
  OutstandingOrderForPayment,
  PaymentMethod,
} from "@/lib/business-dashboard/payments-types";

function resolveInitialOrderId(
  outstandingOrders: OutstandingOrderForPayment[],
  preselectedOrderId?: string,
): string {
  if (
    preselectedOrderId &&
    outstandingOrders.some((o) => o.orderId === preselectedOrderId)
  ) {
    return preselectedOrderId;
  }
  return outstandingOrders[0]?.orderId ?? "";
}

export function RecordPaymentForm({
  outstandingOrders,
  preselectedOrderId,
  onPaymentRecorded,
}: {
  outstandingOrders: OutstandingOrderForPayment[];
  preselectedOrderId?: string;
  onPaymentRecorded: (
    payment: BusinessPaymentRecord,
    orderId: string,
    amountNgn: number,
  ) => void;
}) {
  const initialOrderId = resolveInitialOrderId(
    outstandingOrders,
    preselectedOrderId,
  );
  const initialOrder = outstandingOrders.find((o) => o.orderId === initialOrderId);

  const [orderId, setOrderId] = useState(initialOrderId);
  const [amount, setAmount] = useState(
    initialOrder ? String(initialOrder.outstandingNgn) : "",
  );
  const [method, setMethod] = useState<PaymentMethod>("Cash");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selected = outstandingOrders.find((o) => o.orderId === orderId);

  function handleOrderChange(nextOrderId: string) {
    setOrderId(nextOrderId);
    setSuccess(false);
    const order = outstandingOrders.find((o) => o.orderId === nextOrderId);
    setAmount(order ? String(order.outstandingNgn) : "");
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (!selected) {
      setError("Select an order with an outstanding balance.");
      return;
    }

    const amountNgn = Math.max(0, Number.parseInt(amount, 10) || 0);
    if (amountNgn <= 0) {
      setError("Enter a payment amount greater than zero.");
      return;
    }
    if (amountNgn > selected.outstandingNgn) {
      setError(
        `Amount cannot exceed outstanding balance (${formatNgn(selected.outstandingNgn)}).`,
      );
      return;
    }

    const payment: BusinessPaymentRecord = {
      id: crypto.randomUUID(),
      reference: `PAY-${crypto.randomUUID().slice(0, 4).toUpperCase()}`,
      orderNumber: selected.orderNumber,
      customerName: selected.customerName,
      amountNgn,
      method,
      status: method === "Bank transfer" ? "Pending verification" : "Recorded",
      recordedAt: "Today · Just now",
      recordedBy: "Front desk",
      note: note.trim() || null,
    };

    onPaymentRecorded(payment, selected.orderId, amountNgn);
    setSuccess(true);
    setNote("");
    const remaining = selected.outstandingNgn - amountNgn;
    setAmount(remaining > 0 ? String(remaining) : "");
  }

  if (outstandingOrders.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <h3 className="text-lg font-semibold text-foreground">Record payment</h3>
        <p className="mt-2 text-sm text-muted">
          No orders with outstanding balances in preview data.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <h3 className="text-lg font-semibold text-foreground">Record payment</h3>
      <p className="mt-1 text-sm text-muted">
        Log cash, transfer, or POS against an order. Partial installments are
        supported.
      </p>

      {success ? (
        <p
          className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
          role="status"
        >
          Payment recorded on this device (preview).
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="orderId" className="block text-sm font-medium text-foreground">
            Order <span className="text-brand">*</span>
          </label>
          <select
            id="orderId"
            value={orderId}
            onChange={(e) => handleOrderChange(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          >
            {outstandingOrders.map((order) => (
              <option key={order.orderId} value={order.orderId}>
                {order.orderNumber} · {order.customerName} ·{" "}
                {formatNgn(order.outstandingNgn)} due
              </option>
            ))}
          </select>
          {selected ? (
            <p className="text-xs text-muted">
              Total {formatNgn(selected.totalNgn)} · Paid{" "}
              {formatNgn(selected.paidNgn)} · Due{" "}
              <span className="font-semibold text-foreground">
                {formatNgn(selected.outstandingNgn)}
              </span>
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
            setSuccess(false);
          }}
        />

        <div className="space-y-1.5">
          <label htmlFor="method" className="block text-sm font-medium text-foreground">
            Method
          </label>
          <select
            id="method"
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm"
          >
            <option value="Cash">Cash</option>
            <option value="Bank transfer">Bank transfer</option>
            <option value="POS">POS</option>
          </select>
        </div>

        <FormField
          name="note"
          label="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Transfer reference, receipt #…"
        />

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="flex h-11 w-full items-center justify-center rounded-full bg-brand-dark text-sm font-semibold text-white hover:opacity-90"
        >
          Record payment
        </button>
      </form>
    </div>
  );
}
