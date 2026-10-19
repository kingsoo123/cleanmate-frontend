import { Suspense } from "react";
import { CustomerOrdersView } from "@/components/customer/orders/customer-orders-view";
import { getCustomerOrdersData } from "@/lib/customer-dashboard/get-orders-data";

function OrdersFallback() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse space-y-4">
      <div className="h-8 w-32 rounded-lg bg-secondary-surface" />
      <div className="h-24 rounded-2xl bg-secondary-surface" />
      <div className="h-24 rounded-2xl bg-secondary-surface" />
    </div>
  );
}

export default async function CustomerOrdersPage() {
  const { orders } = await getCustomerOrdersData();

  return (
    <Suspense fallback={<OrdersFallback />}>
      <CustomerOrdersView orders={orders} />
    </Suspense>
  );
}
