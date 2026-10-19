"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormField } from "@/components/auth/form-field";
import { PinField } from "@/components/auth/pin-field";
import type { OnboardingRole } from "@/lib/auth/onboarding";
import { loginDestinations } from "@/lib/auth/onboarding";
import { AUTH_BACKEND_ENABLED } from "@/lib/auth/dev-bypass";
import { isValidPin, validatePhoneOrEmail } from "@/lib/auth/validation";

type FieldErrors = Partial<Record<string, string>>;

function validateLogin(data: FormData, role: OnboardingRole): FieldErrors | null {
  if (!AUTH_BACKEND_ENABLED) {
    return null;
  }

  const errors: FieldErrors = {};
  const identifier = String(data.get("identifier") ?? "");
  const pin = String(data.get("pin") ?? "");

  if (role === "rider") {
    const phone = identifier.trim();
    if (!phone) errors.identifier = "Phone number is required.";
    else if (!validatePhoneOrEmail(phone) && !/^\d[\d\s+\-()]+$/.test(phone)) {
      errors.identifier = "Enter a valid phone number.";
    }
  } else {
    const identifierError = validatePhoneOrEmail(identifier);
    if (identifierError) errors.identifier = identifierError;
  }

  if (!isValidPin(pin)) {
    errors.pin = "Enter your 6-digit PIN.";
  }

  return Object.keys(errors).length ? errors : null;
}

export function LoginForm({ role }: { role: OnboardingRole }) {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);

  const identifierLabel =
    role === "rider" ? "Phone number" : "Phone number or email";
  const identifierPlaceholder =
    role === "rider"
      ? "+234 800 000 0000"
      : "+234 800 000 0000 or you@example.com";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});

    const validation = validateLogin(new FormData(event.currentTarget), role);

    if (validation) {
      setErrors(validation);
      setPending(false);
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
    router.push(loginDestinations[role]);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {!AUTH_BACKEND_ENABLED ? (
        <p className="rounded-xl border border-brand/20 bg-brand-light/50 px-3 py-2.5 text-xs leading-relaxed text-muted">
          Development mode: you can sign in with empty fields until the backend
          is connected.
        </p>
      ) : null}

      {role === "rider" ? (
        <p className="rounded-xl border border-border bg-secondary-surface/80 px-3 py-2.5 text-xs leading-relaxed text-muted">
          Rider accounts are created by your laundry under{" "}
          <span className="font-medium text-foreground">Staff & riders</span> in
          the business portal.
        </p>
      ) : null}

      <FormField
        name="identifier"
        type={role === "rider" ? "tel" : "text"}
        label={identifierLabel}
        placeholder={identifierPlaceholder}
        autoComplete="username"
        error={errors.identifier}
      />

      <PinField
        name="pin"
        label="6-digit PIN"
        autoComplete="current-password"
        error={errors.pin}
      />

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-brand hover:underline"
        >
          Forgot PIN?
        </Link>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex h-11 w-full items-center justify-center rounded-full bg-brand-dark text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
