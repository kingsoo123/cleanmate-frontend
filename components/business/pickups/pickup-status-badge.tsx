import type { PickupRequestStatus } from "@/lib/business-dashboard/pickups-types";

const styles: Partial<Record<PickupRequestStatus, string>> = {
  "Pending Review": "bg-amber-100 text-amber-900 ring-amber-200",
  Accepted: "bg-sky-100 text-sky-900 ring-sky-200",
  "Driver Assigned": "bg-brand-light text-brand ring-brand/20",
  "En Route": "bg-indigo-100 text-indigo-900 ring-indigo-200",
  Collected: "bg-emerald-100 text-emerald-900 ring-emerald-200",
  "Received at Facility": "bg-emerald-100 text-emerald-900 ring-emerald-200",
  "Converted to Order": "bg-secondary-surface text-foreground ring-border",
  Declined: "bg-red-100 text-red-900 ring-red-200",
};

export function PickupStatusBadge({ status }: { status: PickupRequestStatus }) {
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
