import { Suspense } from "react";
import { PaymentsListView } from "@/components/business/payments/payments-list-view";
import { getBusinessPaymentsData } from "@/lib/business-dashboard/get-payments-data";

function PaymentsFallback() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-4">
      <div className="h-10 w-40 rounded-lg bg-secondary-surface" />
      <div className="grid gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-secondary-surface" />
        ))}
      </div>
      <div className="h-64 rounded-2xl bg-secondary-surface" />
    </div>
  );
}

export default async function BusinessPaymentsPage() {
  const data = await getBusinessPaymentsData();

  return (
    <Suspense fallback={<PaymentsFallback />}>
      <PaymentsListView
        initialPayments={data.payments}
        initialOutstanding={data.outstandingOrders}
      />
    </Suspense>
  );
}
