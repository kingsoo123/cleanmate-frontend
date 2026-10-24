import { apiFetch } from "@/lib/api/http";
import type { CustomerPaymentRow } from "@/lib/customer-dashboard/types";
import type { CustomerPaymentsOverview } from "@/lib/customer-dashboard/payments-types";

export function fetchCustomerPaymentsOverview() {
  return apiFetch<CustomerPaymentsOverview>("/customer/payments");
}

export function submitCustomerPayment(payload: {
  orderId: string;
  amountNgn: number;
  method: string;
  transferReference?: string;
}) {
  return apiFetch<CustomerPaymentRow>("/customer/payments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
