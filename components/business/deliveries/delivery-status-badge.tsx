import type { DeliveryJobStatus } from "@/lib/business-dashboard/deliveries-types";

const styles: Partial<Record<DeliveryJobStatus, string>> = {
  "Pending Assignment": "bg-amber-100 text-amber-900 ring-amber-200",
  "Driver Assigned": "bg-brand-light text-brand ring-brand/20",
  "Out for Delivery": "bg-sky-100 text-sky-900 ring-sky-200",
  Delivered: "bg-emerald-100 text-emerald-900 ring-emerald-200",
  "Failed Attempt": "bg-red-100 text-red-900 ring-red-200",
  Cancelled: "bg-secondary-surface text-muted ring-border",
};

export function DeliveryStatusBadge({ status }: { status: DeliveryJobStatus }) {
  const style =
    styles[status] ?? "bg-secondary-surface text-foreground ring-border";
  return (
    <span
      className={`inline-flex max-w-[12rem] truncate rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {status}
    </span>
  );
}
