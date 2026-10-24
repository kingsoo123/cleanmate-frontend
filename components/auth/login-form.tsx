"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormField } from "@/components/auth/form-field";
import { PinField } from "@/components/auth/pin-field";
import type { OnboardingRole } from "@/lib/auth/onboarding";
import { AuthApiError, signIn } from "@/lib/auth/api-client";
import { AUTH_BACKEND_ENABLED } from "@/lib/auth/dev-bypass";
import { loginDestinations } from "@/lib/auth/onboarding";
import { saveAuthSession } from "@/lib/auth/session";
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
  const [formError, setFormError] = useState<string | null>(null);
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
    setFormError(null);

    const data = new FormData(event.currentTarget);
    const validation = validateLogin(data, role);

    if (validation) {
      setErrors(validation);
      setPending(false);
      return;
    }

    if (!AUTH_BACKEND_ENABLED) {
      router.push(loginDestinations[role]);
      setPending(false);
      return;
    }

    try {
      const identifier = String(data.get("identifier") ?? "");
      const pin = String(data.get("pin") ?? "");
      const result = await signIn({ identifier, pin, role });
      saveAuthSession(result.accessToken, result.user);
      router.push(loginDestinations[role]);
    } catch (error) {
      setFormError(
        error instanceof AuthApiError
          ? error.message
          : "Sign in failed. Please try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {!AUTH_BACKEND_ENABLED ? (
        <p className="rounded-xl border border-brand/20 bg-brand-light/50 px-3 py-2.5 text-xs leading-relaxed text-muted">
          Development mode: you can sign in with empty fields until the backend
          is connected.
        </p>
      ) : null}

      {formError ? (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700"
          role="alert"
        >
          {formError}
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
        hint={null}
        error={errors.pin}
      />

      <div className="flex justify-end">
        <Link
          href={`/forgot-password?role=${role}`}
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
