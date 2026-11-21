import type {
  RiderDashboardData,
  RiderJob,
  RiderJobStage,
} from "@/lib/rider-dashboard/types";

/** Server placeholder until rider jobs API is connected. */
export async function getRiderDashboardData(): Promise<RiderDashboardData> {
  return {
    session: {
      riderId: "",
      riderName: "",
      laundryName: "",
      dateLabel: "—",
    },
    jobs: [],
  };
}

export function getActiveRiderJob(jobs: RiderJob[]): RiderJob | null {
  return jobs.find((job) => job.stage !== "completed") ?? null;
}

export function getUpcomingRiderJobs(
  jobs: RiderJob[],
  activeId: string | null,
): RiderJob[] {
  return jobs.filter((job) => job.id !== activeId && job.stage !== "completed");
}

export function nextStage(job: RiderJob): RiderJobStage | null {
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