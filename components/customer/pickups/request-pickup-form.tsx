"use client";

import Link from "next/link";
import { useState } from "react";
import { FormField } from "@/components/auth/form-field";
import { PickupStatusBadge } from "@/components/business/pickups/pickup-status-badge";
import type { CustomerSavedAddress } from "@/lib/customer-dashboard/customer-addresses";

const timeWindows = [
  "Today · 8:00 – 10:00 AM",
  "Today · 2:00 – 4:00 PM",
  "Tomorrow · Morning",
  "Tomorrow · Afternoon",
];

export function RequestPickupForm({
  addresses,
}: {
  addresses: CustomerSavedAddress[];
}) {
  const [addressId, setAddressId] = useState(addresses[0]?.id ?? "");
  const [timeWindow, setTimeWindow] = useState(timeWindows[1] ?? timeWindows[0]);
  const [itemsDescription, setItemsDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!addressId) nextErrors.addressId = "Choose a pickup address.";
    if (!itemsDescription.trim()) {
      nextErrors.itemsDescription = "Describe what we should collect.";
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    const ref = `PU-${Math.floor(2200 + Math.random() * 800)}`;
    setSubmittedRef(ref);
  }

  if (submittedRef) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-center shadow-sm">
          <p className="text-sm font-semibold text-emerald-900">Pickup requested</p>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">
            {submittedRef}
          </p>
          <div className="mt-4 flex justify-center">
            <PickupStatusBadge status="Pending Review" />
          </div>
          <p className="mt-4 text-sm text-muted">
            Your laundry will review the request, assign a rider, and notify you
            when someone is on the way.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/customer/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-full bg-brand-dark px-5 text-sm font-semibold text-white hover:opacity-90"
          >
            Dashboard
          </Link>
          <Link
            href="/customer/pickups"
            className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-surface px-5 text-sm font-semibold text-foreground hover:bg-secondary-surface"
          >
            Pickup history
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <p className="text-sm font-medium text-muted">Schedule</p>
        <h2 className="text-2xl font-bold text-foreground">Request pickup</h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6"
        noValidate
      >
        <div className="space-y-1.5">
          <label
            htmlFor="addressId"
            className="block text-sm font-medium text-foreground"
          >
            Pickup address <span className="text-brand">*</span>
          </label>
          <select
            id="addressId"
            name="addressId"
            value={addressId}
            onChange={(e) => setAddressId(e.target.value)}
            className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 ${
              errors.addressId ? "border-red-400" : "border-border"
            }`}
          >
            {addresses.map((addr) => (
              <option key={addr.id} value={addr.id}>
                {addr.label} — {addr.line}
              </option>
            ))}
          </select>
          {errors.addressId ? (
            <p className="text-xs text-red-600">{errors.addressId}</p>
          ) : null}
          <p className="text-xs text-muted">
            Manage addresses in{" "}
            <Link href="/customer/profile" className="font-medium text-brand hover:underline">
              Profile
            </Link>
            .
          </p>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="timeWindow"
            className="block text-sm font-medium text-foreground"
          >
            Preferred window
          </label>
          <select
            id="timeWindow"
            name="timeWindow"
            value={timeWindow}
            onChange={(e) => setTimeWindow(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          >
            {timeWindows.map((window) => (
              <option key={window} value={window}>
                {window}
              </option>
            ))}
          </select>
        </div>

        <FormField
          name="itemsDescription"
          label="What should we collect?"
          required
          value={itemsDescription}
          onChange={(e) => setItemsDescription(e.target.value)}
          error={errors.itemsDescription}
          placeholder="e.g. 2 bags · wash & iron, 1 suit dry clean"
        />

        <FormField
          name="notes"
          label="Note for driver (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Gate code, call on arrival…"
        />

        <button
          type="submit"
          className="flex h-11 w-full items-center justify-center rounded-full bg-brand-dark text-sm font-semibold text-white hover:opacity-90"
        >
          Submit pickup request
        </button>
      </form>
    </div>
  );
}
