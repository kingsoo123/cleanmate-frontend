"use client";

import { useEffect, useState } from "react";
import { AuthApiError } from "@/lib/auth/api-client";
import { RequestPickupForm } from "@/components/customer/pickups/request-pickup-form";
import { fetchCustomerAddresses } from "@/lib/customer-dashboard/customer-api";
import type { CustomerSavedAddress } from "@/lib/customer-dashboard/customer-addresses";

export function RequestPickupPageClient() {
  const [addresses, setAddresses] = useState<CustomerSavedAddress[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchCustomerAddresses();
        if (!cancelled) setAddresses(list);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof AuthApiError
              ? err.message
              : "Could not load addresses.",
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
    return <p className="text-sm text-muted">Loading…</p>;
  }

  if (error) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        {error}
      </p>
    );
  }

  if (addresses.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-secondary-surface/80 px-4 py-3 text-sm text-muted">
        Add a pickup address in{" "}
        <a href="/customer/profile" className="font-semibold text-brand hover:underline">
          Profile
        </a>{" "}
        before scheduling a collection.
      </p>
    );
  }

  return <RequestPickupForm addresses={addresses} />;
}
