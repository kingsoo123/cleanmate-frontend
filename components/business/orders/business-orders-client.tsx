"use client";

import { useEffect, useState } from "react";
import { OrdersListView } from "@/components/business/orders/orders-list-view";
import { AuthApiError } from "@/lib/auth/api-client";
import { fetchBusinessOrders } from "@/lib/business-dashboard/operations-api";
import type { BusinessOrderListRow } from "@/lib/business-dashboard/orders-types";

export function BusinessOrdersClient() {
  const [orders, setOrders] = useState<BusinessOrderListRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchBusinessOrders();
        if (!cancelled) setOrders(list);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof AuthApiError
              ? err.message
              : "Could not load orders.",
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

  return <OrdersListView orders={orders} />;
}
