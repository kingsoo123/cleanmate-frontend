import type {
  BusinessDeliveryJob,
  DeliveryAssignRider,
  DeliveryJobStatus,
  DeliveryListFilter,
} from "@/lib/business-dashboard/deliveries-types";

/** Replace with API/DB when delivery jobs are connected. */
export async function getBusinessDeliveriesData(): Promise<{
  deliveries: BusinessDeliveryJob[];
  riders: DeliveryAssignRider[];
}> {
  return {
    riders: [
      { id: "r1", fullName: "Emeka Duru", status: "On job" },
      { id: "r2", fullName: "Samuel Kola", status: "Active" },
    ],
    deliveries: previewDeliveries,
  };
}

const previewDeliveries: BusinessDeliveryJob[] = [
  {
    id: "del1",
    reference: "DEL-3301",
    orderNumber: "LD-10477",
    customerName: "James Okafor",
    customerPhone: "+234 809 123 4567",
    deliveryAddress: "18 Bourdillon Road, Ikoyi",
    scheduledFor: "Today · 10:30 – 12:30",
    itemsSummary: "1 box · wash & fold",
    paymentState: "Fully Paid",
    collectOnDeliveryNgn: 0,
    status: "Out for Delivery",
    assignedRiderId: "r2",
    assignedRiderName: "Samuel Kola",
    driverNotes: "Call before arrival",
    updatedAt: "09:30",
  },
  {
    id: "del2",
    reference: "DEL-3302",
    orderNumber: "LD-10482",
    customerName: "Ada Okonkwo",
    customerPhone: "+234 803 222 3344",
    deliveryAddress: "12 Admiralty Way, Lekki Phase 1",
    scheduledFor: "Today · 2:00 – 4:00 PM",
    itemsSummary: "2 bags · wash & iron",
    paymentState: "Partially Paid",
    collectOnDeliveryNgn: 15_000,
    status: "Pending Assignment",
    assignedRiderId: null,
    assignedRiderName: null,
    driverNotes: "",
    updatedAt: "10:42",
  },
  {
    id: "del3",
    reference: "DEL-3298",
    orderNumber: "LD-10455",
    customerName: "Helen Chu",
    customerPhone: "+234 805 999 1122",
    deliveryAddress: "Banana Island — Phase 2",
    scheduledFor: "Yesterday · Evening",
    itemsSummary: "Regular wash",
    paymentState: "Fully Paid",
    collectOnDeliveryNgn: 0,
    status: "Delivered",
    assignedRiderId: "r1",
    assignedRiderName: "Emeka Duru",
    driverNotes: "Handed to security",
    updatedAt: "Yesterday 19:10",
  },
  {
    id: "del4",
    reference: "DEL-3295",
    orderNumber: "LD-10448",
    customerName: "Yemi Alade",
    customerPhone: "+234 811 555 4433",
    deliveryAddress: "Surulere — 14 Bode Thomas",
    scheduledFor: "Mon · 3:00 – 5:00 PM",
    itemsSummary: "Dry clean · agbada",
    paymentState: "Fully Paid",
    collectOnDeliveryNgn: 0,
    status: "Driver Assigned",
    assignedRiderId: "r1",
    assignedRiderName: "Emeka Duru",
    driverNotes: "",
    updatedAt: "08:15",
  },
  {
    id: "del5",
    reference: "DEL-3290",
    orderNumber: "LD-10440",
    customerName: "Michael Obi",
    customerPhone: "+234 708 222 3344",
    deliveryAddress: "Ajah — Sangotedo",
    scheduledFor: "Fri · Morning",
    itemsSummary: "Express delivery",
    paymentState: "Unpaid",
    collectOnDeliveryNgn: 41_000,
    status: "Failed Attempt",
    assignedRiderId: "r2",
    assignedRiderName: "Samuel Kola",
    driverNotes: "Customer unavailable — reschedule",
    updatedAt: "Last week",
  },
];

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
