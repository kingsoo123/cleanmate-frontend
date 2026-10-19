import { Suspense } from "react";
import { NotificationsView } from "@/components/business/notifications/notifications-view";
import { getBusinessNotificationsData } from "@/lib/business-dashboard/get-notifications-data";

function NotificationsFallback() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-4">
      <div className="h-10 w-48 rounded-lg bg-secondary-surface" />
      <div className="h-12 rounded-xl bg-secondary-surface" />
      <div className="h-64 rounded-2xl bg-secondary-surface" />
    </div>
  );
}

export default async function BusinessNotificationsPage() {
  const data = await getBusinessNotificationsData();

  return (
    <Suspense fallback={<NotificationsFallback />}>
      <NotificationsView initialData={data} />
    </Suspense>
  );
}
