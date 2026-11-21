import type {
  BusinessDeliveryJob,
  DeliveryAssignRider,
  DeliveryJobStatus,
  DeliveryListFilter,
} from "@/lib/business-dashboard/deliveries-types";

/** Server placeholder until delivery jobs API is connected. */
export async function getBusinessDeliveriesData(): Promise<{
  deliveries: BusinessDeliveryJob[];
  riders: DeliveryAssignRider[];
}> {
  return { deliveries: [], riders: [] };
}


const inProgressStatuses: DeliveryJobStatus[] = [
  "Driver Assigned",
  "Out for Delivery",
];

export function parseDeliveryListFilter(
  value: string | undefined,
): DeliveryListFilter {
  const allowed: DeliveryListFilter[] = [
    "all",
    "awaiting",
    "in_progress",
    "done",
  ];
  if (value && allowed.includes(value as DeliveryListFilter)) {
    return value as DeliveryListFilter;
  }
  return "all";
}

export function deliveryMatchesFilter(
  job: BusinessDeliveryJob,
  filter: DeliveryListFilter,
): boolean {
  switch (filter) {
    case "all":
      return job.status !== "Cancelled";
    case "awaiting":
      return job.status === "Pending Assignment";
    case "in_progress":
      return inProgressStatuses.includes(job.status);
    case "done":
      return (
        job.status === "Delivered" ||
        job.status === "Failed Attempt" ||
        job.status === "Cancelled"
      );
    default:
      return true;
  }
}

export function filterDeliveriesList(
  deliveries: BusinessDeliveryJob[],
  options: { filter: DeliveryListFilter; query: string },
): BusinessDeliveryJob[] {
  const q = options.query.trim().toLowerCase();
  return deliveries.filter((job) => {
    if (!deliveryMatchesFilter(job, options.filter)) return false;
    if (!q) return true;
    return (
      job.reference.toLowerCase().includes(q) ||
      job.orderNumber.toLowerCase().includes(q) ||
      job.customerName.toLowerCase().includes(q) ||
      job.deliveryAddress.toLowerCase().includes(q)
    );
  });
}

export function countDeliveriesByFilter(
  deliveries: BusinessDeliveryJob[],
): Record<DeliveryListFilter, number> {
  const filters: DeliveryListFilter[] = [
    "all",
    "awaiting",
    "in_progress",
    "done",
  ];
  return Object.fromEntries(
    filters.map((filter) => [
      filter,
      deliveries.filter((d) => deliveryMatchesFilter(d, filter)).length,
    ]),
  ) as Record<DeliveryListFilter, number>;
}

export function nextDeliveryStatusAfterAction(
  current: DeliveryJobStatus,
  action: "assign" | "dispatch" | "delivered" | "failed" | "cancel",
): DeliveryJobStatus {
  if (action === "assign") return "Driver Assigned";
  if (action === "dispatch") return "Out for Delivery";
  if (action === "delivered") return "Delivered";
  if (action === "failed") return "Failed Attempt";
  if (action === "cancel") return "Cancelled";
  return current;
}
