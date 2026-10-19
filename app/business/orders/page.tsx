import { Suspense } from "react";
import { OrdersListView } from "@/components/business/orders/orders-list-view";
import { getBusinessOrdersData } from "@/lib/business-dashboard/get-orders-data";

function OrdersListFallback() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-4">
      <div className="h-10 w-48 rounded-lg bg-secondary-surface" />
      <div className="h-12 rounded-xl bg-secondary-surface" />
      <div className="h-64 rounded-2xl bg-secondary-surface" />
    </div>
  );
}

export default async function BusinessOrdersPage() {
  const data = await getBusinessOrdersData();

  return (
    <Suspense fallback={<OrdersListFallback />}>
      <OrdersListView orders={data.orders} />
    </Suspense>
  );
}
