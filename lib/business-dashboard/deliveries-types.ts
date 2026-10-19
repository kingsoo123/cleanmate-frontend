import type { PaymentState } from "@/lib/business-dashboard/types";

export type DeliveryJobStatus =
  | "Pending Assignment"
  | "Driver Assigned"
  | "Out for Delivery"
  | "Delivered"
  | "Failed Attempt"
  | "Cancelled";

export type DeliveryListFilter =
  | "all"
  | "awaiting"
  | "in_progress"
  | "done";

export type BusinessDeliveryJob = {
  id: string;
  reference: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  scheduledFor: string;
  itemsSummary: string;
  paymentState: PaymentState;
  collectOnDeliveryNgn: number;
  status: DeliveryJobStatus;
  assignedRiderId: string | null;
  assignedRiderName: string | null;
  driverNotes: string;
  updatedAt: string;
};

export type DeliveryAssignRider = {
  id: string;
  fullName: string;
  status: "Active" | "Off duty" | "On job";
};
