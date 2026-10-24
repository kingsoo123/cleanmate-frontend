"use client";

import { useState } from "react";
import { FormField } from "@/components/auth/form-field";
import { PinField } from "@/components/auth/pin-field";
import { AuthApiError } from "@/lib/auth/api-client";
import { createBusinessCustomer } from "@/lib/business-dashboard/customers-api";
import type { BusinessCustomer } from "@/lib/business-dashboard/customers-types";
import { isValidEmail, isValidPin, validatePhone } from "@/lib/auth/validation";

type FieldErrors = Partial<Record<string, string>>;

export function RegisterCustomerForm({
  onCustomerAdded,
}: {
  onCustomerAdded: (customer: BusinessCustomer) => void;
}) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    setErrors({});
    setFormError(null);
    setSuccess(false);

    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const pin = String(data.get("pin") ?? "");
    const defaultAddress = String(data.get("defaultAddress") ?? "").trim();

    const nextErrors: FieldErrors = {};
    if (!name) nextErrors.name = "Customer name is required.";
    if (!phone) nextErrors.phone = "Phone number is required.";
    else if (!validatePhone(phone)) nextErrors.phone = "Enter a valid phone number.";
    if (email && !isValidEmail(email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!isValidPin(pin)) {
      nextErrors.pin = "Set a 6-digit PIN the customer will use to sign in.";
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setPending(false);
      return;
    }

    try {
      const customer = await createBusinessCustomer({
        name,
        phone,
        pin,
        ...(email ? { email } : {}),
        ...(defaultAddress ? { defaultAddress } : {}),
      });
      onCustomerAdded(customer);
      form.reset();
      setSuccess(true);
    } catch (error) {
      setFormError(
        error instanceof AuthApiError
          ? error.message
          : "Could not add customer. Try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <h3 className="text-lg font-semibold text-foreground">Register customer</h3>
      <p className="mt-1 text-sm text-muted">
        Customers are onboarded by your laundry — not public sign-up. They sign
        in with phone + PIN at{" "}
        <span className="font-medium text-foreground">/login?role=customer</span>.
      </p>

      {formError ? (
        <p
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {formError}
        </p>
      ) : null}

      {success ? (
        <p
          className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
          role="status"
        >
          Customer saved. They can sign in with their phone number and PIN.
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
