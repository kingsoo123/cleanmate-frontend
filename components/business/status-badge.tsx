import type { OrderStatus, PaymentState } from "@/lib/business-dashboard/types";

const orderStatusStyles: Partial<Record<OrderStatus, string>> = {
  Draft: "bg-secondary-surface text-muted",
  "Awaiting Customer Approval": "bg-amber-50 text-amber-900 ring-amber-200",
  "Awaiting Initial Payment": "bg-orange-50 text-orange-900 ring-orange-200",
  Active: "bg-blue-50 text-blue-900 ring-blue-200",
  "In Progress": "bg-indigo-50 text-indigo-900 ring-indigo-200",
  "Quality Check": "bg-violet-50 text-violet-900 ring-violet-200",
  Ready: "bg-emerald-50 text-emerald-900 ring-emerald-200",
  "Out for Delivery": "bg-sky-50 text-sky-900 ring-sky-200",
  Completed: "bg-secondary-surface text-foreground ring-border",
  Cancelled: "bg-red-50 text-red-800 ring-red-200",
};

const paymentStyles: Record<PaymentState, string> = {
  Unpaid: "bg-red-50 text-red-800",
  "Partially Paid": "bg-amber-50 text-amber-900",
  "Fully Paid": "bg-emerald-50 text-emerald-900",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const style =
    orderStatusStyles[status] ?? "bg-secondary-surface text-foreground";
  return (
    <span
      className={`inline-flex max-w-[11rem] truncate rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {status}
    </span>
  );
}

export function PaymentStateBadge({ state }: { state: PaymentState }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${paymentStyles[state]}`}
    >
      {state}
    </span>
  );
}
