import { Suspense } from "react";
import { notFound } from "next/navigation";
import { OrderDetailView } from "@/components/business/orders/order-detail-view";
import {
  getBusinessOrdersData,
  getOrderById,
} from "@/lib/business-dashboard/get-orders-data";

export async function generateStaticParams() {
  const data = await getBusinessOrdersData();
  return data.orders.map((order) => ({ id: order.id }));
}

function OrderDetailFallback() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse space-y-6">
      <div className="h-4 w-24 rounded bg-secondary-surface" />
      <div className="h-10 w-64 rounded-lg bg-secondary-surface" />
      <div className="h-48 rounded-2xl bg-secondary-surface" />
    </div>
  );
}

export default function BusinessOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<OrderDetailFallback />}>
      <BusinessOrderDetailContent params={params} />
    </Suspense>
  );
}

async function BusinessOrderDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getBusinessOrdersData();
  const order = getOrderById(data.orders, id);

  if (!order) {
    notFound();
  }

  return (
    <OrderDetailView order={order} isPreviewData={data.isPreviewData} />
  );
}
