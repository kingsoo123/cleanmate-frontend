export type CustomerOutstandingBalance = {
  orderId: string;
  orderNumber: string;
  totalNgn: number;
  paidNgn: number;
  outstandingNgn: number;
};

export type LaundryTransferDetails = {
  laundryName: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  note: string;
};

export type CustomerPaymentsOverview = {
  outstanding: CustomerOutstandingBalance[];
  totalOutstandingNgn: number;
  transferDetails: LaundryTransferDetails;
  history: import("@/lib/customer-dashboard/types").CustomerPaymentRow[];
};
