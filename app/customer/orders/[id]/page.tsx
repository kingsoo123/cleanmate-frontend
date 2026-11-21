import { Suspense } from "react";
import { CustomerOrderDetailClient } from "@/components/customer/orders/customer-order-detail-client";

export const instant = false;

function OrderDetailPageFallback() {
  return (
    <div className="mx-auto max-w-lg animate-pulse space-y-4">
      <div className="h-4 w-20 rounded bg-secondary-surface" />
      <div className="h-32 rounded-2xl bg-secondary-surface" />
    </div>
  );
}

export default function CustomerOrderDetailPage() {
  return (
    <Suspense fallback={<OrderDetailPageFallback />}>
      <CustomerOrderDetailClient />
    </Suspense>
  );
}
