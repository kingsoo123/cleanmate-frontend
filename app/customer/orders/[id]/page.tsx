import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CustomerOrderDetailView } from "@/components/customer/orders/customer-order-detail-view";
import {
  getCustomerOrderById,
  getCustomerOrdersData,
} from "@/lib/customer-dashboard/get-orders-data";

export async function generateStaticParams() {
  const { orders } = await getCustomerOrdersData();
  return orders.map((order) => ({ id: order.id }));
}

function DetailFallback() {
  return (
    <div className="mx-auto max-w-lg animate-pulse space-y-4">
      <div className="h-4 w-20 rounded bg-secondary-surface" />
      <div className="h-32 rounded-2xl bg-secondary-surface" />
    </div>
  );
}

async function OrderDetailContent({ id }: { id: string }) {
  const order = getCustomerOrderById(id);
  if (!order) notFound();
  return <CustomerOrderDetailView order={order} />;
}

export default function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<DetailFallback />}>
      <CustomerOrderDetailPageInner params={params} />
    </Suspense>
  );
}

async function CustomerOrderDetailPageInner({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetailContent id={id} />;
}
