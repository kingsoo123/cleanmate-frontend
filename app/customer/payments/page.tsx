import { Suspense } from "react";
import { CustomerPaymentsView } from "@/components/customer/payments/customer-payments-view";
import { getCustomerPaymentsData } from "@/lib/customer-dashboard/get-payments-data";

function PaymentsFallback() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse space-y-4">
      <div className="h-24 rounded-2xl bg-secondary-surface" />
      <div className="h-48 rounded-2xl bg-secondary-surface" />
    </div>
  );
}

async function PaymentsContent({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderParam } = await searchParams;
  const data = await getCustomerPaymentsData();
  const preselectedOrderId = data.outstanding.some((o) => o.orderId === orderParam)
    ? orderParam
    : undefined;

  return (
    <CustomerPaymentsView
      initialOutstanding={data.outstanding}
      initialTotalOutstandingNgn={data.totalOutstandingNgn}
      transferDetails={data.transferDetails}
      initialHistory={data.history}
      preselectedOrderId={preselectedOrderId}
    />
  );
}

export default function CustomerPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  return (
    <Suspense fallback={<PaymentsFallback />}>
      <PaymentsContent searchParams={searchParams} />
    </Suspense>
  );
}
