import type {
  RiderDashboardData,
  RiderJob,
  RiderJobStage,
} from "@/lib/rider-dashboard/types";

/** Replace with API scoped to signed-in rider when auth is connected. */
export async function getRiderDashboardData(): Promise<RiderDashboardData> {
  return {
    session: {
      riderId: "r1",
      riderName: "Emeka Duru",
      laundryName: "Sunbright Laundry & Dry Clean",
      dateLabel: "Today · 17 Oct 2026",
    },
    jobs: previewRiderJobs,
  };
}

/** Preview: Emeka has one active pickup en route + delivery queued. */
const previewRiderJobs: RiderJob[] = [
  {
    id: "job-pu1",
    kind: "Pickup",
    reference: "PU-2214",
    orderNumber: null,
    customerName: "Ada Okonkwo",
    customerPhone: "+234 803 222 3344",
    address: "12 Admiralty Way, Lekki Phase 1",
    scheduledFor: "Today · 2:00 – 4:00 PM",
    itemsSummary: "~2 bags · wash & iron",
    customerNotes: "Call on arrival — gate code 4421",
    collectCashNgn: 0,
    stage: "en_route",
  },
  {
    id: "job-del4",
    kind: "Delivery",
    reference: "DEL-3295",
    orderNumber: "LD-10448",
    customerName: "Yemi Alade",
    customerPhone: "+234 811 555 4433",
    address: "Surulere — 14 Bode Thomas",
    scheduledFor: "Today · 3:00 – 5:00 PM",
    itemsSummary: "Dry clean · agbada",
    customerNotes: null,
    collectCashNgn: 0,
    stage: "assigned",
  },
];

export function getActiveRiderJob(jobs: RiderJob[]): RiderJob | null {
  return jobs.find((job) => job.stage !== "completed") ?? null;
}

export function getUpcomingRiderJobs(
  jobs: RiderJob[],
  activeId: string | null,
): RiderJob[] {
  return jobs.filter((job) => job.id !== activeId && job.stage !== "completed");
}

export function nextStage(
  job: RiderJob,
): RiderJobStage | null {
  switch (job.stage) {
    case "assigned":
      return "en_route";
    case "en_route":
      return "at_location";
    case "at_location":
      return "completed";
    default:
      return null;
  }
}

export function primaryActionLabel(job: RiderJob): string {
  switch (job.stage) {
    case "assigned":
      return job.kind === "Pickup" ? "Start pickup route" : "Start delivery";
    case "en_route":
      return "I've arrived";
    case "at_location":
      return job.kind === "Pickup" ? "Confirm collected" : "Confirm delivered";
    default:
      return "Done";
  }
}

export function stageProgressIndex(stage: RiderJobStage): number {
  switch (stage) {
    case "assigned":
      return 0;
    case "en_route":
      return 1;
    case "at_location":
      return 2;
    case "completed":
      return 3;
    default:
      return 0;
  }
}

export function phoneTelHref(phone: string): string {
  return `tel:${phone.replace(/\s/g, "")}`;
}

export function mapsSearchHref(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
