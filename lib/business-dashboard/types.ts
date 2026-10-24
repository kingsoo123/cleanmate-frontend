export type OrderStatus =
  | "Draft"
  | "Awaiting Customer Approval"
  | "Awaiting Initial Payment"
  | "Active"
  | "In Progress"
  | "Quality Check"
  | "Ready"
  | "Out for Delivery"
  | "Completed"
  | "Cancelled";

export type PaymentState = "Unpaid" | "Partially Paid" | "Fully Paid";

export type AttentionOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  reason: string;
  status: OrderStatus;
  paymentState: PaymentState;
  outstandingNgn: number;
  dueLabel: string;
};

export type ProcessingStageCount = {
  stage: string;
  count: number;
};

export type RecentOrderRow = {
  id: string;
  orderNumber: string;
  tag: string | null;
  customerName: string;
  source: "Walk-in" | "Pickup";
  status: OrderStatus;
  paymentState: PaymentState;
  totalNgn: number;
  updatedAt: string;
};

export type DriverJobRow = {
  id: string;
  reference: string;
  type: "Pickup" | "Delivery";
  driverName: string;
  status: string;
  scheduledAt: string;
};

export type PaymentRow = {
  id: string;
  orderNumber: string;
  customerName: string;
  amountNgn: number;
  method: string;
  recordedAt: string;
};

export type MetricTrend = {
  direction: "up" | "down" | "neutral";
  text: string;
};

export type FinancialMetrics = {
  revenueTodayNgn: number;
  paymentsReceivedNgn: number;
  outstandingBalancesNgn: number;
  orderValueThisWeekNgn: number;
  paymentsTrend?: MetricTrend;
};

export type OperationalMetrics = {
  totalOrders: number;
  activeOrders: number;
  draftRequests: number;
  pickupsAwaitingReview: number;
  pickupsInProgress: number;
  awaitingProcessing: number;
  inProcessing: number;
  awaitingQualityCheck: number;
  readyForCollection: number;
  awaitingDelivery: number;
  completedToday: number;
  cancelled: number;
};

export type BusinessDashboardData = {
  businessName: string;
  periodLabel: string;
  financial: FinancialMetrics;
  operational: OperationalMetrics;
  attentionOrders: AttentionOrder[];
  processingStages: ProcessingStageCount[];
  recentOrders: RecentOrderRow[];
  driverJobs: DriverJobRow[];
  recentPayments: PaymentRow[];
  /** True when metrics are UI placeholders until the API is connected. */
  isPreviewData: boolean;
};
