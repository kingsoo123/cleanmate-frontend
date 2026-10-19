import { previewCustomerOrders } from "@/lib/customer-dashboard/customer-orders-preview";
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
  laundryName: "Sunbright Laundry & Dry Clean",
  bankName: "GTBank",
  accountName: "Sunbright Laundry Ltd",
  accountNumber: "0123456789",
  note: "Use your order number as transfer description.",
};

export const previewCustomerPaymentHistory: CustomerPaymentRow[] = [
  {
    id: "cpay1",
    orderNumber: "LD-10482",
    amountNgn: 30_000,
    method: "Bank transfer",
    status: "Successful",
    paidAt: "12 Oct 2026",
  },
  {
    id: "cpay2",
    orderNumber: "LD-10455",
    amountNgn: 18_000,
    method: "Cash on delivery",
    status: "Successful",
    paidAt: "8 Oct 2026",
  },
  {
    id: "cpay3",
    orderNumber: "LD-10480",
    amountNgn: 10_000,
    method: "Bank transfer",
    status: "Pending",
    paidAt: "15 Oct 2026",
  },
];

export function getCustomerOutstandingBalances(): CustomerOutstandingBalance[] {
  return previewCustomerOrders
    .filter((order) => order.outstandingNgn > 0)
    .map((order) => ({
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalNgn: order.totalNgn,
      paidNgn: order.totalNgn - order.outstandingNgn,
      outstandingNgn: order.outstandingNgn,
    }));
}

export function sumCustomerOutstandingNgn(balances: CustomerOutstandingBalance[]): number {
  return balances.reduce((sum, row) => sum + row.outstandingNgn, 0);
}
