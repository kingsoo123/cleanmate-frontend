"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { OrderDetailView } from "@/components/business/orders/order-detail-view";
import { AuthApiError } from "@/lib/auth/api-client";
import { fetchBusinessOrder } from "@/lib/business-dashboard/operations-api";
import type { BusinessOrderListRow } from "@/lib/business-dashboard/orders-types";

export function BusinessOrderDetailClient() {
  return (
    <Suspense fallback={<OrderDetailFallback />}>
      <BusinessOrderDetailContent />
    </Suspense>
  );
}

function OrderDetailFallback() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse space-y-4">
      <div className="h-4 w-24 rounded bg-secondary-surface" />
      <div className="h-40 rounded-2xl bg-secondary-surface" />
    </div>
  );
}

function BusinessOrderDetailContent() {
  const params = useParams();
  const orderId = typeof params.id === "string" ? params.id : "";
  const [order, setOrder] = useState<BusinessOrderListRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setError("Invalid order.");
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const row = await fetchBusinessOrder(orderId);
        if (!cancelled) {
          setOrder(row);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof AuthApiError && err.status === 404) {
            setError("Order not found.");
          } else {
            setError(
              err instanceof AuthApiError
                ? err.message
                : "Could not load order.",
            );
          }
          setOrder(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (loading) {
    return <OrderDetailFallback />;
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error ?? "Order not found."}
        </p>
        <Link
          href="/business/orders"
          className="text-sm font-semibold text-brand hover:underline"
        >
          ← All orders
        </Link>
      </div>
    );
  }

  return <OrderDetailView order={order} isPreviewData={false} />;
}
