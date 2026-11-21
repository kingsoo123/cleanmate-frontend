import type { CustomerPaymentRow } from "@/lib/customer-dashboard/types";

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

export const previewTransferDetails: LaundryTransferDetails = {
  laundryName: "",
  bankName: "",
  accountName: "",
  accountNumber: "",
  note: "",
};

export const previewCustomerPaymentHistory: CustomerPaymentRow[] = [];

export function getCustomerOutstandingBalances(): CustomerOutstandingBalance[] {
  return [];
}

export function sumCustomerOutstandingNgn(
  balances: CustomerOutstandingBalance[],
): number {
  return balances.reduce((sum, row) => sum + row.outstandingNgn, 0);
}