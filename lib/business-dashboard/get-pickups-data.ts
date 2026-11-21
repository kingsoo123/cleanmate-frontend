import type {
  BusinessPickupRequest,
  PickupAssignRider,
  PickupListFilter,
  PickupRequestStatus,
} from "@/lib/business-dashboard/pickups-types";

/** Server placeholder; client loads via JWT. */
export async function getBusinessPickupsData(): Promise<{
  pickups: BusinessPickupRequest[];
  riders: PickupAssignRider[];
}> {
  return { pickups: [], riders: [] };
}


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
