export type PickupRequestStatus =
  | "Pending Review"
  | "Accepted"
  | "Driver Assigned"
  | "En Route"
  | "Collected"
  | "Received at Facility"
  | "Converted to Order"
  | "Declined";

export type PickupListFilter =
  | "all"
  | "review"
  | "in_progress"
  | "done";

export type BusinessPickupRequest = {
  id: string;
  reference: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  addressLine: string;
  scheduledFor: string;
  estimatedItems: string;
  customerNotes: string;
  status: PickupRequestStatus;
  assignedRiderId: string | null;
  assignedRiderName: string | null;
  linkedOrderNumber: string | null;
  submittedAt: string;
  updatedAt: string;
};

export type PickupAssignRider = {
  id: string;
  fullName: string;
  status: "Active" | "Off duty" | "On job";
};
