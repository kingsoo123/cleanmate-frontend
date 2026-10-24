"use client";

import { useEffect, useState } from "react";
import { NewWalkInOrderView } from "@/components/business/orders/new-walk-in-order-view";
import { AuthApiError } from "@/lib/auth/api-client";
import { fetchNewOrderCatalog } from "@/lib/business-dashboard/operations-api";
import type {
  CatalogService,
  PreviewCustomer,
} from "@/lib/business-dashboard/new-order-types";

export function NewWalkInOrderPageClient({
  initialCustomerId = "",
}: {
  initialCustomerId?: string;
}) {
  const [customers, setCustomers] = useState<PreviewCustomer[]>([]);
  const [services, setServices] = useState<CatalogService[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const catalog = await fetchNewOrderCatalog();
        if (cancelled) return;
        setCustomers(catalog.customers);
        setServices(catalog.services);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof AuthApiError
              ? err.message
              : "Could not load order catalog.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-muted">Loading catalog…</p>;
  }

  if (error) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        {error}
      </p>
    );
  }

  const validCustomerId = customers.some((c) => c.id === initialCustomerId)
    ? initialCustomerId
    : "";

  return (
    <NewWalkInOrderView
      customers={customers}
      services={services}
      initialCustomerId={validCustomerId}
    />
  );
}
