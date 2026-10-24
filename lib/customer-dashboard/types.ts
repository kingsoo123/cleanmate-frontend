import type { PickupRequestStatus } from "@/lib/business-dashboard/pickups-types";
import type { OrderStatus, PaymentState } from "@/lib/business-dashboard/types";

export type { PickupRequestStatus };

export type CustomerPickupRow = {
  id: string;
  reference: string;
  status: PickupRequestStatus;
  scheduledFor: string;
  addressLine: string;
  estimatedItems: string;
};

export type CustomerOrderRow = {
  id: string;
  orderNumber: string;
  tag: string;
  trackingCode: string;
  laundryName: string;
  status: OrderStatus;
  processingStage: string;
  paymentState: PaymentState;
  totalNgn: number;
  outstandingNgn: number;
  updatedAt: string;
  deliveryPreference: "Pickup at shop" | "Home delivery";
};

export type CustomerPaymentRow = {
  id: string;
  orderNumber: string;
  amountNgn: number;
  method: string;
  status: "Successful" | "Pending";
  paidAt: string;
};

export type CustomerDashboardData = {
  customerName: string;
  preferredLaundry: string;
  summary: {
    activeOrders: number;
    readyOrders: number;
    outstandingNgn: number;
    openPickups: number;
  };
  featuredOrder: CustomerOrderRow | null;
  pickupRequests: CustomerPickupRow[];
  recentOrders: CustomerOrderRow[];
  recentPayments: CustomerPaymentRow[];
  isPreviewData: boolean;
};
