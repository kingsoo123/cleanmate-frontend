"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CustomerPaymentsView } from "@/components/customer/payments/customer-payments-view";
import { AuthApiError } from "@/lib/auth/api-client";
import { fetchCustomerPaymentsOverview } from "@/lib/customer-dashboard/payments-api";
import type { CustomerPaymentsOverview } from "@/lib/customer-dashboard/payments-types";

function PaymentsFallback() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse space-y-4">
      <div className="h-24 rounded-2xl bg-secondary-surface" />
      <div className="h-48 rounded-2xl bg-secondary-surface" />
    </div>
  );
}

export function CustomerPaymentsClient() {
  return (
    <Suspense fallback={<PaymentsFallback />}>
      <CustomerPaymentsContent />
    </Suspense>
  );
}

function CustomerPaymentsContent() {
  const searchParams = useSearchParams();
  const orderParam = searchParams.get("order") ?? undefined;
  const [data, setData] = useState<CustomerPaymentsOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const overview = await fetchCustomerPaymentsOverview();
        if (!cancelled) setData(overview);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof AuthApiError
              ? err.message
              : "Could not load payments.",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        {error}
      </p>
    );
  }

  if (!data) {
    return <PaymentsFallback />;
  }

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
