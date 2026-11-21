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

  return (
    <>
      {error ? (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900" role="status">
          {error} You can still add a new address below.
        </p>
      ) : null}
      <RequestPickupForm
        addresses={addresses}
        onAddressesChange={setAddresses}
      />
    </>
  );
}