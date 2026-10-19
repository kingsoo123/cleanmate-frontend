"use client";

import { useState } from "react";
import { FormField } from "@/components/auth/form-field";
import { PinField } from "@/components/auth/pin-field";
import { isValidPin, validatePhone } from "@/lib/auth/validation";
import type { BusinessCustomer } from "@/lib/business-dashboard/customers-types";

type FieldErrors = Partial<Record<string, string>>;

export function RegisterCustomerForm({
  onCustomerAdded,
}: {
  onCustomerAdded: (customer: BusinessCustomer) => void;
}) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    setSuccess(false);

    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const pin = String(data.get("pin") ?? "");
    const defaultAddress = String(data.get("defaultAddress") ?? "").trim();

    const nextErrors: FieldErrors = {};
    if (!name) nextErrors.name = "Customer name is required.";
    if (!phone) nextErrors.phone = "Phone number is required.";
    else if (!validatePhone(phone)) nextErrors.phone = "Enter a valid phone number.";
    if (!isValidPin(pin)) {
      nextErrors.pin = "Set a 6-digit PIN the customer will use to sign in.";
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setPending(false);
      return;
    }

    onCustomerAdded({
      id: crypto.randomUUID(),
      name,
      phone,
      email: email || null,
      registeredAt: "Just now",
      totalOrders: 0,
      activeOrders: 0,
      outstandingNgn: 0,
      lastActivity: "Just now",
      portalAccess: true,
      defaultAddress: defaultAddress || null,
    });

    event.currentTarget.reset();
    setSuccess(true);
    setPending(false);
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <h3 className="text-lg font-semibold text-foreground">Register customer</h3>
      <p className="mt-1 text-sm text-muted">
        Customers are onboarded by your laundry — not public sign-up. They sign
        in with phone + PIN at{" "}
        <span className="font-medium text-foreground">/login?role=customer</span>.
      </p>

      {success ? (
        <p
          className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
          role="status"
        >
          Customer saved on this device (preview). Connect the API to persist
          accounts and send login details securely.
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <FormField
          name="name"
          label="Full name"
          required
          autoComplete="name"
          placeholder="Customer full name"
          error={errors.name}
        />
        <FormField
          name="phone"
          type="tel"
          label="Phone number"
          required
          autoComplete="tel"
          placeholder="+234 …"
          error={errors.phone}
        />
        <FormField
          name="email"
          type="email"
          label="Email (optional)"
          autoComplete="email"
          placeholder="For receipts"
          error={errors.email}
        />
        <FormField
          name="defaultAddress"
          label="Default address (optional)"
          placeholder="Pickup / delivery address"
          error={errors.defaultAddress}
        />
        <PinField
          name="pin"
          label="6-digit customer PIN"
          autoComplete="new-password"
          error={errors.pin}
        />
        <button
          type="submit"
          disabled={pending}
          className="flex h-11 w-full items-center justify-center rounded-full bg-brand-dark text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Add customer"}
        </button>
      </form>
    </div>
  );
}
