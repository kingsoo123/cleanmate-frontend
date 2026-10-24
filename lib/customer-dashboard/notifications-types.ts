export type CustomerNotificationItem = {
  id: string;
  title: string;
  body: string;
  href: string | null;
  tag: string | null;
  trackingCode: string | null;
  eventType: string;
  orderId: string | null;
  createdAt: string;
  read: boolean;
};

export type CustomerNotificationsBundle = {
  unreadCount: number;
  items: CustomerNotificationItem[];
};
