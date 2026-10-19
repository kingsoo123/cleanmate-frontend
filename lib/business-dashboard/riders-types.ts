export type DispatchRider = {
  id: string;
  fullName: string;
  phone: string;
  vehicleLabel?: string;
  status: "Active" | "Off duty" | "On job";
  jobsToday: number;
  onboardedAt: string;
};
