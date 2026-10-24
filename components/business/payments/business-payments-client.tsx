"use client";

import { Suspense, useEffect, useState } from "react";
import { PaymentsListView } from "@/components/business/payments/payments-list-view";
import { AuthApiError } from "@/lib/auth/api-client";
import { fetchBusinessPaymentsBundle } from "@/lib/business-dashboard/payments-api";
import type {
  BusinessPaymentRecord,
  OutstandingOrderForPayment,
} from "@/lib/business-dashboard/payments-types";

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

export function BusinessPaymentsClient() {
  return (
    <Suspense fallback={<PaymentsFallback />}>
      <BusinessPaymentsContent />
    </Suspense>
  );
}

function BusinessPaymentsContent() {
  const [payments, setPayments] = useState<BusinessPaymentRecord[]>([]);
  const [outstanding, setOutstanding] = useState<OutstandingOrderForPayment[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const bundle = await fetchBusinessPaymentsBundle();
      setPayments(bundle.payments ?? []);
      setOutstanding(bundle.outstanding ?? []);
    } catch (err) {
      setError(
        err instanceof AuthApiError
          ? err.message
          : "Could not load payments.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (loading && payments.length === 0 && outstanding.length === 0) {
    return <PaymentsFallback />;
  }

  if (error && payments.length === 0) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        {error}
      </p>
    );
  }

  return (
    <PaymentsListView
      initialPayments={payments}
      initialOutstanding={outstanding}
      onRefresh={load}
    />
  );
}
