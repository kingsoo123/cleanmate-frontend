export type RiderJobKind = "Pickup" | "Delivery";

export type RiderJobStage =
  | "assigned"
  | "en_route"
  | "at_location"
  | "completed";

export type RiderJob = {
  id: string;
  kind: RiderJobKind;
  reference: string;
  orderNumber: string | null;
  customerName: string;
  customerPhone: string;
  address: string;
  scheduledFor: string;
  itemsSummary: string;
  customerNotes: string | null;
  collectCashNgn: number;
  stage: RiderJobStage;
};

export type RiderSession = {
  riderId: string;
  riderName: string;
  laundryName: string;
  dateLabel: string;
};

export type RiderDashboardData = {
  session: RiderSession;
  jobs: RiderJob[];
};
