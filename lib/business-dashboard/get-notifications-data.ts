import type {
  NotificationLogEntry,
  NotificationLogFilter,
  NotificationsData,
} from "@/lib/business-dashboard/notifications-types";

/** Replace with API/DB when notification service is connected. */
export async function getBusinessNotificationsData(): Promise<NotificationsData> {
  return {
    channelEnabled: {
      sms: true,
      email: true,
      whatsapp: false,
    },
    events: [
      {
        id: "quotation_sent",
        label: "Quotation sent",
        description: "Customer receives itemized quote for approval.",
        channels: { sms: true, email: true, whatsapp: false },
      },
      {
        id: "order_approved",
        label: "Order approved",
        description: "Confirmation when customer approves a quotation.",
        channels: { sms: true, email: false, whatsapp: false },
      },
      {
        id: "payment_received",
        label: "Payment received",
        description: "Receipt after front desk or transfer is recorded.",
        channels: { sms: true, email: true, whatsapp: false },
      },
      {
        id: "order_ready",
        label: "Order ready",
        description: "Clothes ready for pickup or delivery scheduling.",
        channels: { sms: true, email: true, whatsapp: true },
      },
      {
        id: "pickup_scheduled",
        label: "Pickup scheduled",
        description: "Driver assigned and window confirmed.",
        channels: { sms: true, email: false, whatsapp: false },
      },
      {
        id: "out_for_delivery",
        label: "Out for delivery",
        description: "Rider en route to customer address.",
        channels: { sms: true, email: false, whatsapp: true },
      },
      {
        id: "delivery_complete",
        label: "Delivery complete",
        description: "Handover confirmed or collected at shop.",
        channels: { sms: false, email: true, whatsapp: false },
      },
    ],
    templates: [
      {
        eventId: "order_ready",
        channel: "sms",
        subject: null,
        bodyPreview:
          "Hi {{name}}, your order {{orderNumber}} is ready at {{businessName}}. Balance due: {{balance}}. Reply or call us to arrange collection.",
      },
      {
        eventId: "order_ready",
        channel: "email",
        subject: "Your laundry is ready — {{orderNumber}}",
        bodyPreview:
          "Hello {{name}},\n\nYour items are ready. Total {{total}}, amount paid {{paid}}, balance {{balance}}.\n\n{{businessName}}",
      },
      {
        eventId: "quotation_sent",
        channel: "sms",
        subject: null,
        bodyPreview:
          "{{name}}, your pickup {{reference}} quote is ₦{{total}}. Open the Washuply app to approve or call us.",
      },
      {
        eventId: "out_for_delivery",
        channel: "whatsapp",
        subject: null,
        bodyPreview:
          "Your order {{orderNumber}} is on the way with {{riderName}}. ETA {{window}}.",
      },
    ],
    log: [],
    inbox: {
      unreadCount: 0,
      items: [],
    },
  };
}


export function parseNotificationLogFilter(
  value: string | undefined,
): NotificationLogFilter {
  if (value === "sent" || value === "failed") return value;
  return "all";
}

export function filterNotificationLog(
  log: NotificationLogEntry[],
  filter: NotificationLogFilter,
  query: string,
): NotificationLogEntry[] {
  const q = query.trim().toLowerCase();
  return log.filter((entry) => {
    if (filter === "sent" && entry.status !== "Sent") return false;
    if (filter === "failed" && entry.status !== "Failed") return false;
    if (!q) return true;
    return (
      entry.customerName.toLowerCase().includes(q) ||
      entry.eventLabel.toLowerCase().includes(q) ||
      entry.recipient.toLowerCase().includes(q)
    );
  });
}

export function countLogByFilter(
  log: NotificationLogEntry[],
): Record<NotificationLogFilter, number> {
  return {
    all: log.length,
    sent: log.filter((e) => e.status === "Sent").length,
    failed: log.filter((e) => e.status === "Failed").length,
  };
}
