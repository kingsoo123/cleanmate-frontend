import { apiFetch } from "@/lib/api/http";
import type {
  BusinessInboxSummary,
  NotificationEventConfig,
  NotificationsData,
} from "@/lib/business-dashboard/notifications-types";

export function fetchBusinessNotifications() {
  return apiFetch<NotificationsData>("/business/notifications");
}

export function fetchBusinessInboxSummary() {
  return apiFetch<BusinessInboxSummary>("/business/notifications/inbox");
}

export function markBusinessInboxRead(payload: {
  all?: boolean;
  itemKeys?: string[];
}) {
  return apiFetch<{ ok: true }>("/business/notifications/inbox/read", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function updateBusinessNotificationSettings(payload: {
  channelEnabled?: Partial<Record<"sms" | "email" | "whatsapp", boolean>>;
  events?: Pick<NotificationEventConfig, "id" | "channels">[];
}) {
  return apiFetch<{
    channelEnabled: NotificationsData["channelEnabled"];
    events: NotificationEventConfig[];
  }>("/business/notifications/settings", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}
