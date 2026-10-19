export type PaymentMethod = "Cash" | "Bank transfer" | "POS";

export type PaymentRecordStatus = "Recorded" | "Pending verification";

export type BusinessPaymentRecord = {
  id: string;
  reference: string;
  orderNumber: string;
  customerName: string;
  amountNgn: number;
  method: PaymentMethod;
  status: PaymentRecordStatus;
  recordedAt: string;
  recordedBy: string;
  note: string | null;
};

export type OutstandingOrderForPayment = {
  orderId: string;
  orderNumber: string;
  customerName: string;
  totalNgn: number;
  paidNgn: number;
  outstandingNgn: number;
};

export type PaymentListFilter = "all" | "today" | "cash" | "transfer";

export type PaymentsSummary = {
  receivedTodayNgn: number;
  receivedThisWeekNgn: number;
  outstandingOrdersNgn: number;
  paymentsTodayCount: number;
};
