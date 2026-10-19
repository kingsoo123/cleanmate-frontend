import {
  getCustomerOutstandingBalances,
  previewCustomerPaymentHistory,
  previewTransferDetails,
  sumCustomerOutstandingNgn,
} from "@/lib/customer-dashboard/customer-payments-preview";
import type { CustomerPaymentRow } from "@/lib/customer-dashboard/types";

export type CustomerPaymentHistoryFilter = "all" | "pending" | "successful";

/** Replace with API/DB when customer payments are connected. */
export async function getCustomerPaymentsData() {
  const outstanding = getCustomerOutstandingBalances();
  return {
    outstanding,
    totalOutstandingNgn: sumCustomerOutstandingNgn(outstanding),
    transferDetails: previewTransferDetails,
    history: previewCustomerPaymentHistory,
  };
}

export function parseCustomerPaymentHistoryFilter(
  value: string | undefined,
): CustomerPaymentHistoryFilter {
  if (value === "pending" || value === "successful") return value;
  return "all";
}

export function filterCustomerPaymentHistory(
  history: CustomerPaymentRow[],
  filter: CustomerPaymentHistoryFilter,
): CustomerPaymentRow[] {
  if (filter === "pending") {
    return history.filter((row) => row.status === "Pending");
  }
  if (filter === "successful") {
    return history.filter((row) => row.status === "Successful");
  }
  return history;
}

export function countCustomerPaymentHistoryFilters(
  history: CustomerPaymentRow[],
): Record<CustomerPaymentHistoryFilter, number> {
  return {
    all: history.length,
    pending: history.filter((r) => r.status === "Pending").length,
    successful: history.filter((r) => r.status === "Successful").length,
  };
}
