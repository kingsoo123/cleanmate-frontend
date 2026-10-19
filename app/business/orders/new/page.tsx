import { Suspense } from "react";
import { NewWalkInOrderView } from "@/components/business/orders/new-walk-in-order-view";
import { getNewOrderCatalog } from "@/lib/business-dashboard/get-new-order-catalog";

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
  const { customers, services } = await getNewOrderCatalog();
  const validId = customers.some((c) => c.id === customerId)
    ? customerId
    : undefined;

  return (
    <NewWalkInOrderView
      customers={customers}
      services={services}
      initialCustomerId={validId ?? ""}
    />
  );
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
