"use client";

import { useEffect, useState } from "react";
import { PickupHistoryView } from "@/components/customer/pickups/pickup-history-view";
import { AuthApiError } from "@/lib/auth/api-client";
import { fetchCustomerPickups } from "@/lib/customer-dashboard/customer-api";
import type { CustomerPickupRow } from "@/lib/customer-dashboard/types";

export function PickupHistoryClient() {
  const [pickups, setPickups] = useState<CustomerPickupRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchCustomerPickups();
        if (!cancelled) setPickups(list);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof AuthApiError
              ? err.message
              : "Could not load pickup history.",
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

  return <PickupHistoryView pickups={pickups} />;
}
