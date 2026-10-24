"use client";

import { useEffect, useState } from "react";
import { CustomerProfileView } from "@/components/customer/profile/customer-profile-view";
import { AuthApiError } from "@/lib/auth/api-client";
import {
  fetchCustomerAddresses,
  fetchCustomerProfile,
} from "@/lib/customer-dashboard/customer-api";
import type { CustomerSavedAddress } from "@/lib/customer-dashboard/customer-addresses";
import type { CustomerProfile } from "@/lib/customer-dashboard/customer-profile-preview";

export function CustomerProfileClient() {
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [addresses, setAddresses] = useState<CustomerSavedAddress[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [p, a] = await Promise.all([
          fetchCustomerProfile(),
          fetchCustomerAddresses(),
        ]);
        if (!cancelled) {
          setProfile(p);
          setAddresses(a);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof AuthApiError
              ? err.message
              : "Could not load profile.",
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

  if (!profile) {
    return <p className="text-sm text-muted">Loading profile…</p>;
  }

  return (
    <CustomerProfileView
      initialProfile={profile}
      initialAddresses={addresses}
    />
  );
}
