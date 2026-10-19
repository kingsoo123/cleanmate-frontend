export type NotificationChannel = "sms" | "email" | "whatsapp";

export type NotificationEventId =
  | "quotation_sent"
  | "order_approved"
  | "payment_received"
  | "order_ready"
  | "pickup_scheduled"
  | "out_for_delivery"
  | "delivery_complete";

export type NotificationEventConfig = {
  id: NotificationEventId;
  label: string;
  description: string;
  channels: Record<NotificationChannel, boolean>;
};

export type NotificationTemplate = {
  eventId: NotificationEventId;
  channel: NotificationChannel;
  subject: string | null;
  bodyPreview: string;
};

export type NotificationLogStatus = "Sent" | "Failed" | "Queued";

export type NotificationLogEntry = {
  id: string;
  sentAt: string;
  eventLabel: string;
  channel: NotificationChannel;
  recipient: string;
  customerName: string;
  status: NotificationLogStatus;
  detail: string | null;
};

export type NotificationLogFilter = "all" | "sent" | "failed";

export type NotificationsData = {
  channelEnabled: Record<NotificationChannel, boolean>;
  events: NotificationEventConfig[];
  templates: NotificationTemplate[];
  log: NotificationLogEntry[];
};
