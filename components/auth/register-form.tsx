"use client";

import Link from "next/link";
import { useState } from "react";
import { FormField } from "@/components/auth/form-field";
import { PinField } from "@/components/auth/pin-field";
import {
  isValidEmail,
  isValidPin,
  validatePhone,
} from "@/lib/auth/validation";

type FieldErrors = Partial<Record<string, string>>;

function validateBusinessRegister(data: FormData): FieldErrors | null {
  const errors: FieldErrors = {};
  const email = String(data.get("email") ?? "").trim();
  const pin = String(data.get("pin") ?? "");
  const fullName = String(data.get("fullName") ?? "").trim();
  const phone = String(data.get("phone") ?? "").trim();
  const businessName = String(data.get("businessName") ?? "").trim();
  const terms = data.get("terms") === "on";

  if (!businessName) errors.businessName = "Business name is required.";
  if (!fullName) errors.fullName = "Full name is required.";
  if (!phone) errors.phone = "Phone number is required.";
  else if (!validatePhone(phone)) {
    errors.phone = "Enter a valid phone number.";
  }
  if (!email) errors.email = "Email is required.";
  else if (!isValidEmail(email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!isValidPin(pin)) {
    errors.pin = "PIN must be exactly 6 digits.";
  }
  if (!terms) errors.terms = "You must accept the terms to continue.";

  return Object.keys(errors).length ? errors : null;
}

export function RegisterForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});

    const validation = validateBusinessRegister(
      new FormData(event.currentTarget),
    );

    if (validation) {
      setErrors(validation);
      setPending(false);
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 400));
    setSubmitted(true);
    setPending(false);
  }

  if (submitted) {
    return (
      <div className="text-center">
        <p className="text-lg font-semibold text-foreground">
          Account details received
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Registration will be connected to the secure auth service in the next
          release. Your information was validated on this device only and was
          not stored yet.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login?role=business"
            className="inline-flex h-11 items-center rounded-full bg-brand-dark px-6 text-sm font-semibold text-white hover:opacity-90"
          >
            Continue to sign in
          </Link>
          <Link
            href="/business/dashboard"
            className="inline-flex h-11 items-center rounded-full border border-border px-6 text-sm font-semibold text-foreground hover:bg-secondary-surface"
          >
            Preview business dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <FormField
        name="businessName"
        label="Business name"
        placeholder="e.g. Sunbright Laundry & Dry Clean"
        autoComplete="organization"
        required
        error={errors.businessName}
      />

      <FormField
        name="fullName"
        label="Your full name"
        placeholder="Full name"
        autoComplete="name"
        required
        error={errors.fullName}
      />

      <FormField
        name="phone"
        type="tel"
        label="Phone number"
        placeholder="+234 …"
        autoComplete="tel"
        required
        error={errors.phone}
      />

      <FormField
        name="email"
        type="email"
        label="Business email"
        placeholder="you@business.com"
        autoComplete="email"
        required
        error={errors.email}
      />

      <PinField
        name="pin"
        label="6-digit PIN"
        autoComplete="new-password"
        required
        error={errors.pin}
      />

      <div className="space-y-1.5 pt-1">
        <label className="flex cursor-pointer items-start gap-2 text-sm text-muted">
          <input
            name="terms"
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-border text-brand focus:ring-brand/30"
          />
          <span>
            I agree to CleanMate&apos;s terms of service and privacy policy.
          </span>
        </label>
        {errors.terms ? (
          <p className="text-xs text-red-600" role="alert">
            {errors.terms}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 flex h-11 w-full items-center justify-center rounded-full bg-brand-dark text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
