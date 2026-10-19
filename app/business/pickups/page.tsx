import { Suspense } from "react";
import { PickupsListView } from "@/components/business/pickups/pickups-list-view";
import { getBusinessPickupsData } from "@/lib/business-dashboard/get-pickups-data";

function PickupsFallback() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-4">
      <div className="h-10 w-56 rounded-lg bg-secondary-surface" />
      <div className="h-64 rounded-2xl bg-secondary-surface" />
    </div>
  );
}

export default async function BusinessPickupsPage() {
  const { pickups, riders } = await getBusinessPickupsData();

  return (
    <Suspense fallback={<PickupsFallback />}>
      <PickupsListView initialPickups={pickups} riders={riders} />
    </Suspense>
  );
}
