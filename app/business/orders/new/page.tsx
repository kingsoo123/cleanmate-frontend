import { Suspense } from "react";
import { NewWalkInOrderPageClient } from "@/components/business/orders/new-walk-in-order-page-client";

function NewOrderFallback() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse space-y-4">
      <div className="h-10 w-48 rounded-lg bg-secondary-surface" />
      <div className="h-96 rounded-2xl bg-secondary-surface" />
    </div>
  );
}

async function NewOrderContent({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>;
}) {
  const { customer: customerId } = await searchParams;

  return <NewWalkInOrderPageClient initialCustomerId={customerId ?? ""} />;
}

export default function BusinessNewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>;
}) {
  return (
    <Suspense fallback={<NewOrderFallback />}>
      <NewOrderContent searchParams={searchParams} />
    </Suspense>
  );
}
