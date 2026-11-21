"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FormField } from "@/components/auth/form-field";
import { PickupStatusBadge } from "@/components/business/pickups/pickup-status-badge";
import { AuthApiError } from "@/lib/auth/api-client";
import {
  createCustomerAddress,
  createCustomerPickup,
} from "@/lib/customer-dashboard/customer-api";
import type { CustomerSavedAddress } from "@/lib/customer-dashboard/customer-addresses";

const timeWindows = [
  "Today · 8:00 – 10:00 AM",
  "Today · 2:00 – 4:00 PM",
  "Tomorrow · Morning",
  "Tomorrow · Afternoon",
];

export function RequestPickupForm({
  addresses,
  onAddressesChange,
}: {
  addresses: CustomerSavedAddress[];
  onAddressesChange: (next: CustomerSavedAddress[]) => void;
}) {
  const [addressId, setAddressId] = useState(addresses[0]?.id ?? "");
  const [showNewAddress, setShowNewAddress] = useState(addresses.length === 0);
  const [newLabel, setNewLabel] = useState("");
  const [newLine, setNewLine] = useState("");
  const [newAddressErrors, setNewAddressErrors] = useState<Record<string, string>>(
    {},
  );
  const [timeWindow, setTimeWindow] = useState(timeWindows[1] ?? timeWindows[0]);
  const [itemsDescription, setItemsDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (addressId && addresses.some((a) => a.id === addressId)) {
      return;
    }
    setAddressId(addresses[0]?.id ?? "");
    if (addresses.length === 0) {
      setShowNewAddress(true);
    }
  }, [addresses, addressId]);

  async function saveNewAddress(): Promise<string | null> {
    const label = newLabel.trim();
    const line = newLine.trim();
    const nextErrors: Record<string, string> = {};
    if (!label) nextErrors.label = "Label is required (e.g. Home).";
    if (!line) nextErrors.line = "Street address is required.";
    if (Object.keys(nextErrors).length) {
      setNewAddressErrors(nextErrors);
      return null;
    }
    setNewAddressErrors({});
    setSavingAddress(true);
    try {
      const created = await createCustomerAddress({ label, line });
      onAddressesChange([...addresses, created]);
      setAddressId(created.id);
      setNewLabel("");
      setNewLine("");
      setShowNewAddress(false);
      return created.id;
    } catch (error) {
      setNewAddressErrors({
        line:
          error instanceof AuthApiError
            ? error.message
            : "Could not save address.",
      });
      return null;
    } finally {
      setSavingAddress(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    let useAddressId = addressId;

    if (!useAddressId && showNewAddress && (newLabel.trim() || newLine.trim())) {
      const savedId = await saveNewAddress();
      if (savedId) {
        useAddressId = savedId;
      }
    }

    if (!useAddressId) {
      if (showNewAddress) {
        if (!newLabel.trim()) nextErrors.newLabel = "Label is required.";
        if (!newLine.trim()) nextErrors.newLine = "Address is required.";
      }
      if (!nextErrors.newLabel && !nextErrors.newLine) {
        nextErrors.addressId = "Choose a saved address or add a new one.";
      }
    }
    if (!itemsDescription.trim()) {
      nextErrors.itemsDescription = "Describe what we should collect.";
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setFormError(null);
    setPending(true);
    try {
      const pickup = await createCustomerPickup({
        addressId: useAddressId,
        scheduledFor: timeWindow,
        estimatedItems: itemsDescription.trim(),
        ...(notes.trim() ? { customerNotes: notes.trim() } : {}),
      });
      setSubmittedRef(pickup.reference);
    } catch (error) {
      setFormError(
        error instanceof AuthApiError
          ? error.message
          : "Could not submit pickup request.",
      );
    } finally {
      setPending(false);
    }
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
        {formError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800" role="alert">
            {formError}
          </p>
        ) : null}

        <p className="text-sm text-muted">
          Pick a saved address or add a new pickup location on this page — no need
          to visit Profile first.
        </p>

        {addresses.length > 0 ? (
          <div className="space-y-1.5">
            <label
              htmlFor="addressId"
              className="block text-sm font-medium text-foreground"
            >
              Saved pickup address <span className="text-brand">*</span>
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
            {!showNewAddress ? (
              <button
                type="button"
                onClick={() => setShowNewAddress(true)}
                className="text-xs font-semibold text-brand hover:underline"
              >
                + Add a different pickup address
              </button>
            ) : null}
          </div>
        ) : null}

        {showNewAddress ? (
          <div className="space-y-4 rounded-xl border border-border bg-secondary-surface/30 p-4">
            <p className="text-sm font-semibold text-foreground">
              {addresses.length === 0 ? "Pickup address" : "New pickup address"}
              <span className="text-brand"> *</span>
            </p>
            <FormField
              name="newLabel"
              label="Label"
              required
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              error={newAddressErrors.label ?? errors.newLabel}
              placeholder="e.g. Home, Office"
            />
            <FormField
              name="newLine"
              label="Street address"
              required
              value={newLine}
              onChange={(e) => setNewLine(e.target.value)}
              error={newAddressErrors.line ?? errors.newLine}
              placeholder="Street, area, city, landmark…"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={savingAddress}
                onClick={() => void saveNewAddress()}
                className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary-surface disabled:opacity-60"
              >
                {savingAddress ? "Saving…" : "Save address"}
              </button>
              {addresses.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowNewAddress(false);
                    setNewLabel("");
                    setNewLine("");
                    setNewAddressErrors({});
                  }}
                  className="rounded-full px-4 py-2 text-xs font-semibold text-muted hover:text-foreground"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

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
          disabled={pending}
          className="flex h-11 w-full items-center justify-center rounded-full bg-brand-dark text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Submitting…" : "Submit pickup request"}
        </button>
      </form>
    </div>
  );
}