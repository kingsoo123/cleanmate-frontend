import type {
  BusinessPickupRequest,
  PickupAssignRider,
  PickupListFilter,
  PickupRequestStatus,
} from "@/lib/business-dashboard/pickups-types";

/** Replace with API/DB when pickup workflow is connected. */
export async function getBusinessPickupsData(): Promise<{
  pickups: BusinessPickupRequest[];
  riders: PickupAssignRider[];
}> {
  return {
    riders: [
      { id: "r1", fullName: "Emeka Duru", status: "On job" },
      { id: "r2", fullName: "Samuel Kola", status: "Active" },
    ],
    pickups: previewPickups,
  };
}

const previewPickups: BusinessPickupRequest[] = [
  {
    id: "pu1",
    reference: "PU-2214",
    customerId: "c1",
    customerName: "Ada Okonkwo",
    customerPhone: "+234 803 222 3344",
    addressLine: "12 Admiralty Way, Lekki Phase 1",
    scheduledFor: "Today · 2:00 – 4:00 PM",
    estimatedItems: "~2 bags · wash & iron",
    customerNotes: "Call on arrival — gate code 4421",
    status: "Driver Assigned",
    assignedRiderId: "r1",
    assignedRiderName: "Emeka Duru",
    linkedOrderNumber: null,
    submittedAt: "Today 08:12",
    updatedAt: "10:05",
  },
  {
    id: "pu2",
    reference: "PU-2213",
    customerId: "c5",
    customerName: "Blessing Adeyemi",
    customerPhone: "+234 816 444 2211",
    addressLine: "15 Ozumba Mbadiwe, Victoria Island",
    scheduledFor: "Today · 11:00 AM – 1:00 PM",
    estimatedItems: "Dry clean · 3 suits",
    customerNotes: "",
    status: "Pending Review",
    assignedRiderId: null,
    assignedRiderName: null,
    linkedOrderNumber: null,
    submittedAt: "Today 07:40",
    updatedAt: "07:40",
  },
  {
    id: "pu3",
    reference: "PU-2210",
    customerId: "c2",
    customerName: "Tunde Bakare",
    customerPhone: "+234 807 555 6677",
    addressLine: "Office — Eko Atlantic, Tower 4",
    scheduledFor: "Yesterday · 4:00 – 6:00 PM",
    estimatedItems: "1 bag · express wash",
    customerNotes: "Reception will hold bag",
    status: "En Route",
    assignedRiderId: "r2",
    assignedRiderName: "Samuel Kola",
    linkedOrderNumber: null,
    submittedAt: "Mon 09:00",
    updatedAt: "Yesterday 16:20",
  },
  {
    id: "pu4",
    reference: "PU-2209",
    customerId: "c8",
    customerName: "Grace Eze",
    customerPhone: "+234 818 777 6655",
    addressLine: "Chevron Drive, Lekki",
    scheduledFor: "Mon 13 Oct · Morning",
    estimatedItems: "Household · curtains",
    customerNotes: "",
    status: "Pending Review",
    assignedRiderId: null,
    assignedRiderName: null,
    linkedOrderNumber: null,
    submittedAt: "Sun 18:22",
    updatedAt: "Sun 18:22",
  },
  {
    id: "pu5",
    reference: "PU-2198",
    customerId: "c1",
    customerName: "Ada Okonkwo",
    customerPhone: "+234 803 222 3344",
    addressLine: "Office — Eko Atlantic",
    scheduledFor: "Mon 13 Oct",
    estimatedItems: "Converted to order",
    customerNotes: "",
    status: "Converted to Order",
    assignedRiderId: "r1",
    assignedRiderName: "Emeka Duru",
    linkedOrderNumber: "LD-10480",
    submittedAt: "Fri 11 Oct",
    updatedAt: "Mon 13 Oct",
  },
  {
    id: "pu6",
    reference: "PU-2195",
    customerId: "c5",
    customerName: "Blessing Adeyemi",
    customerPhone: "+234 816 444 2211",
    addressLine: "VI — same as last pickup",
    scheduledFor: "10 Oct",
    estimatedItems: "Pickup batch",
    customerNotes: "",
    status: "Received at Facility",
    assignedRiderId: "r2",
    assignedRiderName: "Samuel Kola",
    linkedOrderNumber: null,
    submittedAt: "9 Oct",
    updatedAt: "10 Oct 14:00",
  },
];

const inProgressStatuses: PickupRequestStatus[] = [
  "Accepted",
  "Driver Assigned",
  "En Route",
  "Collected",
  "Received at Facility",
];

export function parsePickupListFilter(
  value: string | undefined,
): PickupListFilter {
  const allowed: PickupListFilter[] = ["all", "review", "in_progress", "done"];
  if (value && allowed.includes(value as PickupListFilter)) {
    return value as PickupListFilter;
  }
  return "all";
}

export function pickupMatchesFilter(
  pickup: BusinessPickupRequest,
  filter: PickupListFilter,
): boolean {
  switch (filter) {
    case "all":
      return pickup.status !== "Declined";
    case "review":
      return pickup.status === "Pending Review";
    case "in_progress":
      return inProgressStatuses.includes(pickup.status);
    case "done":
      return (
        pickup.status === "Converted to Order" || pickup.status === "Declined"
      );
    default:
      return true;
  }
}

export function filterPickupsList(
  pickups: BusinessPickupRequest[],
  options: { filter: PickupListFilter; query: string },
): BusinessPickupRequest[] {
  const q = options.query.trim().toLowerCase();
  return pickups.filter((pickup) => {
    if (!pickupMatchesFilter(pickup, options.filter)) return false;
    if (!q) return true;
    return (
      pickup.reference.toLowerCase().includes(q) ||
      pickup.customerName.toLowerCase().includes(q) ||
      pickup.customerPhone.replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
      pickup.addressLine.toLowerCase().includes(q)
    );
  });
}

export function countPickupsByFilter(
  pickups: BusinessPickupRequest[],
): Record<PickupListFilter, number> {
  const filters: PickupListFilter[] = ["all", "review", "in_progress", "done"];
  return Object.fromEntries(
    filters.map((filter) => [
      filter,
      pickups.filter((p) => pickupMatchesFilter(p, filter)).length,
    ]),
  ) as Record<PickupListFilter, number>;
}

export function getPickupById(
  pickups: BusinessPickupRequest[],
  id: string,
): BusinessPickupRequest | undefined {
  return pickups.find((p) => p.id === id);
}

export function nextStatusAfterAction(
  current: PickupRequestStatus,
  action:
    | "accept"
    | "decline"
    | "assign"
    | "en_route"
    | "collected"
    | "received"
    | "convert",
): PickupRequestStatus {
  if (action === "decline") return "Declined";
  if (action === "accept") return "Accepted";
  if (action === "assign") return "Driver Assigned";
  if (action === "en_route") return "En Route";
  if (action === "collected") return "Collected";
  if (action === "received") return "Received at Facility";
  if (action === "convert") return "Converted to Order";
  return current;
}
