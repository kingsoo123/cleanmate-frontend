"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormField } from "@/components/auth/form-field";
import { PinField } from "@/components/auth/pin-field";
import { AuthApiError, forgotPin } from "@/lib/auth/api-client";
import type { OnboardingRole } from "@/lib/auth/onboarding";
import { isValidPin, validatePhoneOrEmail } from "@/lib/auth/validation";

type FieldErrors = Partial<Record<string, string>>;

export function ForgotPinForm({ role }: { role: OnboardingRole }) {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  const identifierLabel =
    role === "rider" ? "Phone number" : "Phone number or email";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    setFormError(null);

    const data = new FormData(event.currentTarget);
    const identifier = String(data.get("identifier") ?? "");
    const newPin = String(data.get("newPin") ?? "");
    const confirmPin = String(data.get("confirmPin") ?? "");

    const nextErrors: FieldErrors = {};
    if (role === "rider") {
      if (!identifier.trim()) nextErrors.identifier = "Phone number is required.";
    } else {
      const idError = validatePhoneOrEmail(identifier);
      if (idError) nextErrors.identifier = idError;
    }
    if (!isValidPin(newPin)) nextErrors.newPin = "Enter a new 6-digit PIN.";
    if (newPin !== confirmPin) nextErrors.confirmPin = "PINs do not match.";

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setPending(false);
      return;
    }

    try {
      await forgotPin({ identifier, role, newPin, confirmPin });
      setDone(true);
    } catch (error) {
      setFormError(
        error instanceof AuthApiError
          ? error.message
          : "Could not reset PIN. Try again.",
      );
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <p className="text-lg font-semibold text-foreground">PIN updated</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Sign in with your phone or email and your new 6-digit PIN.
        </p>
        <Link
          href={`/login?role=${role}`}
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full bg-brand-dark text-sm font-semibold text-white hover:opacity-90"
        >
          Continue to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
      <p className="rounded-xl border border-border bg-secondary-surface/80 px-3 py-2.5 text-xs leading-relaxed text-muted">
        For security, add SMS or email verification before production. This flow
        resets the PIN when the account matches your phone or email.
      </p>

      {formError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700" role="alert">
          {formError}
        </p>
      ) : null}

      <FormField
        name="identifier"
        type={role === "rider" ? "tel" : "text"}
        label={identifierLabel}
        autoComplete="username"
        error={errors.identifier}
      />

      <PinField
        name="newPin"
        label="New 6-digit PIN"
        autoComplete="new-password"
        hint={null}
        error={errors.newPin}
      />

      <PinField
        name="confirmPin"
        label="Confirm new PIN"
        autoComplete="new-password"
        hint={null}
        error={errors.confirmPin}
      />

      <button
        type="submit"
        disabled={pending}
        className="flex h-11 w-full items-center justify-center rounded-full bg-brand-dark text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Updating PIN…" : "Reset PIN"}
      </button>

      <button
        type="button"
        onClick={() => router.push(`/login?role=${role}`)}
        className="flex h-11 w-full items-center justify-center rounded-full border border-border text-sm font-semibold text-foreground hover:bg-secondary-surface"
      >
        Cancel
      </button>
    </form>
  );
}
