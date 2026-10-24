import { apiFetch } from "@/lib/api/http";
import type { CustomerNotificationsBundle } from "@/lib/customer-dashboard/notifications-types";

export function fetchCustomerNotifications() {
  return apiFetch<CustomerNotificationsBundle>("/customer/notifications");
}

export function markCustomerNotificationsRead(payload: {
  all?: boolean;
  ids?: string[];
}) {
  return apiFetch<{ ok: true }>("/customer/notifications/read", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
