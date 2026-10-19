export type ReportPeriod = "today" | "week" | "month";

export type PaymentMethodBreakdownRow = {
  method: string;
  amountNgn: number;
  sharePercent: number;
};

export type ReportsSnapshot = {
  period: ReportPeriod;
  periodLabel: string;
  financial: {
    recordedRevenueNgn: number;
    paymentsReceivedNgn: number;
    outstandingBalancesNgn: number;
    orderValueNgn: number;
    revenueTrend: string;
  };
  paymentMethods: PaymentMethodBreakdownRow[];
  operations: {
    ordersCompleted: number;
    ordersActive: number;
    ordersCancelled: number;
    pickupsCompleted: number;
    deliveriesCompleted: number;
    newCustomers: number;
  };
  topCustomersByPayments: {
    customerName: string;
    amountNgn: number;
  }[];
};
