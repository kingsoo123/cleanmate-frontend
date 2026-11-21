import { Suspense } from "react";
import { BusinessOrderDetailClient } from "@/components/business/orders/business-order-detail-client";

function OrderDetailPageFallback() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse space-y-4">
      <div className="h-4 w-24 rounded bg-secondary-surface" />
      <div className="h-40 rounded-2xl bg-secondary-surface" />
    </div>
  );
}

export default function BusinessOrderDetailPage() {
  return (
    <Suspense fallback={<OrderDetailPageFallback />}>
      <BusinessOrderDetailClient />
    </Suspense>
  );
}