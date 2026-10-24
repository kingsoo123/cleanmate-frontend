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
          "Hi {{name}}, your order {{orderNumber}} is ready at Sunbright Laundry. Balance due: {{balance}}. Reply or call us to arrange collection.",
      },
      {
        eventId: "order_ready",
        channel: "email",
        subject: "Your laundry is ready — {{orderNumber}}",
        bodyPreview:
          "Hello {{name}},\n\nYour items are ready. Total {{total}}, amount paid {{paid}}, balance {{balance}}.\n\nSunbright Laundry & Dry Clean",
      },
      {
        eventId: "quotation_sent",
        channel: "sms",
        subject: null,
        bodyPreview:
          "{{name}}, your pickup {{reference}} quote is ₦{{total}}. Open the CleanMate app to approve or call us.",
      },
      {
        eventId: "out_for_delivery",
        channel: "whatsapp",
        subject: null,
        bodyPreview:
          "Your order {{orderNumber}} is on the way with {{riderName}}. ETA {{window}}.",
      },
    ],
    log: previewLog,
    inbox: {
      unreadCount: 0,
      items: [],
    },
  };
}

const previewLog: NotificationLogEntry[] = [
  {
    id: "n1",
    sentAt: "Today · 10:44",
    eventLabel: "Order ready",
    channel: "sms",
    recipient: "+234 803 *** 3344",
    customerName: "Ada Okonkwo",
    status: "Sent",
    detail: "LD-10482",
  },
  {
    id: "n2",
    sentAt: "Today · 10:05",
    eventLabel: "Payment received",
    channel: "sms",
    recipient: "+234 807 *** 6677",
    customerName: "Tunde Bakare",
    status: "Sent",
    detail: "₦10,000 · LD-10480",
  },
  {
    id: "n3",
    sentAt: "Today · 09:52",
    eventLabel: "Payment received",
    channel: "email",
    recipient: "fatima.y@gmail.com",
    customerName: "Fatima Yusuf",
    status: "Sent",
    detail: "Receipt LD-10479",
  },
  {
    id: "n4",
    sentAt: "Today · 09:30",
    eventLabel: "Out for delivery",
    channel: "sms",
    recipient: "+234 809 *** 4567",
    customerName: "James Okafor",
    status: "Sent",
    detail: "LD-10477",
  },
  {
    id: "n5",
    sentAt: "Today · 08:15",
    eventLabel: "Pickup scheduled",
    channel: "sms",
    recipient: "+234 803 *** 3344",
    customerName: "Ada Okonkwo",
    status: "Queued",
    detail: "PU-2214 · Emeka D.",
  },
  {
    id: "n6",
    sentAt: "Yesterday · 16:00",
    eventLabel: "Quotation sent",
    channel: "sms",
    recipient: "+234 816 *** 2211",
    customerName: "Blessing Adeyemi",
    status: "Failed",
    detail: "Gateway timeout — retry pending",
  },
  {
    id: "n7",
    sentAt: "Yesterday · 11:02",
    eventLabel: "Order ready",
    channel: "email",
    recipient: "blessing.a@corp.ng",
    customerName: "Blessing Adeyemi",
    status: "Sent",
    detail: "LD-10475",
  },
];

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
