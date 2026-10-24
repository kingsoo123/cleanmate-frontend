"use client";

import { useEffect, useState } from "react";
import { CustomerOrdersView } from "@/components/customer/orders/customer-orders-view";
import { AuthApiError } from "@/lib/auth/api-client";
import { fetchCustomerOrders } from "@/lib/customer-dashboard/customer-api";
import { primeCustomerOrderCache } from "@/lib/customer-dashboard/order-detail-cache";
import type { CustomerOrderRow } from "@/lib/customer-dashboard/types";

export function CustomerOrdersClient() {
  const [orders, setOrders] = useState<CustomerOrderRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchCustomerOrders();
        if (!cancelled) {
          primeCustomerOrderCache(list);
          setOrders(list);
        }
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

  return <CustomerOrdersView orders={orders} />;
}
