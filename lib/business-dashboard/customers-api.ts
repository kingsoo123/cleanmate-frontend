import { apiFetch } from "@/lib/api/http";
import type { BusinessCustomer } from "@/lib/business-dashboard/customers-types";

export function fetchBusinessCustomers() {
  return apiFetch<BusinessCustomer[]>("/business/customers");
}

export function createBusinessCustomer(payload: {
  name: string;
  phone: string;
  email?: string;
  defaultAddress?: string;
  pin: string;
}) {
  return apiFetch<BusinessCustomer>("/business/customers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
