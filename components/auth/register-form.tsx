"use client";

import { useState } from "react";
import {
  RegisterBranchesField,
  type RegisterBranchDraft,
} from "@/components/auth/register-branches-field";
import { FormField } from "@/components/auth/form-field";
import { PinField } from "@/components/auth/pin-field";
import { AuthApiError, signUp } from "@/lib/auth/api-client";
import { saveAuthSession } from "@/lib/auth/session";
import {
  isValidEmail,
  isValidPin,
  validatePhone,
} from "@/lib/auth/validation";
import { useRouter } from "next/navigation";

type FieldErrors = Partial<Record<string, string>>;

function validateBusinessRegister(
  data: FormData,
  branches: RegisterBranchDraft[],
): FieldErrors | null {
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

  const namedBranches = branches.filter((b) => b.name.trim());
  if (namedBranches.length === 0) {
    errors.branches = "Add at least one branch name.";
  }

  return Object.keys(errors).length ? errors : null;
}

export function RegisterForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [branches, setBranches] = useState<RegisterBranchDraft[]>([]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    setFormError(null);

    const data = new FormData(event.currentTarget);
    const validation = validateBusinessRegister(data, branches);

    if (validation) {
      setErrors(validation);
      setPending(false);
      return;
    }

    try {
      const branchPayload = branches
        .map((row) => ({
          name: row.name.trim(),
          address: row.address.trim() || undefined,
        }))
        .filter((row) => row.name);

      const result = await signUp({
        businessName: String(data.get("businessName") ?? ""),
        fullName: String(data.get("fullName") ?? ""),
        phone: String(data.get("phone") ?? ""),
        email: String(data.get("email") ?? ""),
        pin: String(data.get("pin") ?? ""),
        branches: branchPayload,
      });
      saveAuthSession(result.accessToken, result.user);
      router.push("/business/dashboard");
    } catch (error) {
      setFormError(
        error instanceof AuthApiError
          ? error.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {formError ? (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700"
          role="alert"
        >
          {formError}
        </p>
      ) : null}
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

      <RegisterBranchesField
        error={errors.branches}
        onChange={setBranches}
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
            I agree to Washuply&apos;s terms of service and privacy policy.
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
