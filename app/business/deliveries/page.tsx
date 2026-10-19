import { Suspense } from "react";
import { DeliveriesListView } from "@/components/business/deliveries/deliveries-list-view";
import { getBusinessDeliveriesData } from "@/lib/business-dashboard/get-deliveries-data";

function DeliveriesFallback() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-4">
      <div className="h-10 w-48 rounded-lg bg-secondary-surface" />
      <div className="h-64 rounded-2xl bg-secondary-surface" />
    </div>
  );
}

export default async function BusinessDeliveriesPage() {
  const { deliveries, riders } = await getBusinessDeliveriesData();

  return (
    <Suspense fallback={<DeliveriesFallback />}>
      <DeliveriesListView
        initialDeliveries={deliveries}
        riders={riders}
      />
    </Suspense>
  );
}
