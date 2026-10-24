"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CustomerOrderDetailView } from "@/components/customer/orders/customer-order-detail-view";
import { AuthApiError } from "@/lib/auth/api-client";
import { fetchCustomerOrder } from "@/lib/customer-dashboard/customer-api";
import {
  getCachedCustomerOrder,
  setCachedCustomerOrder,
} from "@/lib/customer-dashboard/order-detail-cache";
import type { CustomerOrderRow } from "@/lib/customer-dashboard/types";

export function CustomerOrderDetailClient() {
  return (
    <Suspense fallback={<CustomerOrderDetailFallback />}>
      <CustomerOrderDetailContent />
    </Suspense>
  );
}

function CustomerOrderDetailFallback() {
  return (
    <div className="mx-auto max-w-lg animate-pulse space-y-4">
      <div className="h-4 w-20 rounded bg-secondary-surface" />
      <div className="h-32 rounded-2xl bg-secondary-surface" />
    </div>
  );
}

function CustomerOrderDetailContent() {
  const params = useParams();
  const orderId = typeof params.id === "string" ? params.id : "";
  const cached = orderId ? getCachedCustomerOrder(orderId) : null;
  const [order, setOrder] = useState<CustomerOrderRow | null>(cached);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    if (!orderId) {
      setError("Invalid order.");
      setLoading(false);
      setOrder(null);
      return;
    }

    const nextCached = getCachedCustomerOrder(orderId);
    setOrder(nextCached);
    setError(null);

    let cancelled = false;
    const hadCache = Boolean(nextCached);

    (async () => {
      if (!hadCache) {
        setLoading(true);
      }
      setError(null);
      try {
        const row = await fetchCustomerOrder(orderId);
        if (cancelled) return;
        setCachedCustomerOrder(row);
        setOrder(row);
      } catch (err) {
        if (cancelled) return;
        if (!getCachedCustomerOrder(orderId)) {
          setOrder(null);
        }
        setError(
          err instanceof AuthApiError
            ? err.message
            : "Could not load this order.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const showSkeleton = loading && !order;

  if (showSkeleton) {
    return <CustomerOrderDetailFallback />;
  }

  if (error && !order) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <Link
          href="/customer/orders"
          className="text-sm font-semibold text-brand hover:underline"
        >
          ← My orders
        </Link>
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className={loading ? "opacity-90" : undefined}>
      {error ? (
        <p
          className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
          role="status"
        >
          {error}
        </p>
      ) : null}
      <CustomerOrderDetailView order={order} />
    </div>
  );
}
