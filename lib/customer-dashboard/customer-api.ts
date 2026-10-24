import { apiFetch } from "@/lib/api/http";
import type { CustomerDashboardData } from "@/lib/customer-dashboard/types";
import type { CustomerSavedAddress } from "@/lib/customer-dashboard/customer-addresses";
import type { CustomerProfile } from "@/lib/customer-dashboard/customer-profile-preview";
import type {
  CustomerOrderRow,
  CustomerPaymentRow,
  CustomerPickupRow,
} from "@/lib/customer-dashboard/types";

export function fetchCustomerDashboard() {
  return apiFetch<CustomerDashboardData>("/customer/dashboard");
}

export function fetchCustomerProfile() {
  return apiFetch<CustomerProfile>("/customer/profile");
}

export function fetchCustomerAddresses() {
  return apiFetch<CustomerSavedAddress[]>("/customer/addresses");
}

export function createCustomerAddress(payload: { label: string; line: string }) {
  return apiFetch<CustomerSavedAddress>("/customer/addresses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchCustomerPickups() {
  return apiFetch<CustomerPickupRow[]>("/customer/pickups");
}

export function createCustomerPickup(payload: {
  addressId: string;
  scheduledFor: string;
  estimatedItems: string;
  customerNotes?: string;
}) {
  return apiFetch<CustomerPickupRow>("/customer/pickups", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchCustomerOrders() {
  return apiFetch<CustomerOrderRow[]>("/customer/orders");
}

export function fetchCustomerOrder(orderId: string) {
  return apiFetch<CustomerOrderRow>(`/customer/orders/${orderId}`);
}

export function fetchCustomerPayments() {
  return apiFetch<CustomerPaymentRow[]>("/customer/payments");
}
