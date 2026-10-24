import type { OrderStatus, PaymentState } from "@/lib/business-dashboard/types";

export type OrderSource = "Walk-in" | "Pickup";

export type BusinessOrderListRow = {
  id: string;
  orderNumber: string;
  tag: string | null;
  trackingCode: string | null;
  customerName: string;
  customerPhone: string;
  source: OrderSource;
  status: OrderStatus;
  paymentState: PaymentState;
  processingStage: string;
  totalNgn: number;
  outstandingNgn: number;
  itemsSummary: string;
  updatedAt: string;
  createdAt: string;
};

export type OrderListFilter =
  | "all"
  | "active"
  | "ready"
  | "attention"
  | "unpaid";

export type BusinessOrdersListData = {
  orders: BusinessOrderListRow[];
  isPreviewData: boolean;
};
