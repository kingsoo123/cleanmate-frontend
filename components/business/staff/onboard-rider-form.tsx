"use client";

import { useState } from "react";
import { FormField } from "@/components/auth/form-field";
import { PinField } from "@/components/auth/pin-field";
import { isValidPin, validatePhone } from "@/lib/auth/validation";
import type { DispatchRider } from "@/lib/business-dashboard/riders-types";

type FieldErrors = Partial<Record<string, string>>;

export function OnboardRiderForm({
  onRiderAdded,
}: {
  onRiderAdded: (rider: DispatchRider) => void;
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
    const fullName = String(data.get("fullName") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const pin = String(data.get("pin") ?? "");
    const vehicleLabel = String(data.get("vehicleLabel") ?? "").trim();

    const nextErrors: FieldErrors = {};
    if (!fullName) nextErrors.fullName = "Full name is required.";
    if (!phone) nextErrors.phone = "Phone number is required.";
    else if (!validatePhone(phone)) nextErrors.phone = "Enter a valid phone number.";
    if (!isValidPin(pin)) nextErrors.pin = "Set a 6-digit PIN for this rider.";

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setPending(false);
      return;
    }

    onRiderAdded({
      id: crypto.randomUUID(),
      fullName,
      phone,
      vehicleLabel: vehicleLabel || undefined,
      status: "Active",
      jobsToday: 0,
      onboardedAt: new Date().toISOString(),
    });

    event.currentTarget.reset();
    setSuccess(true);
    setPending(false);
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
      <h3 className="text-lg font-semibold text-foreground">Onboard dispatch rider</h3>
      <p className="mt-1 text-sm text-muted">
        Creates a rider profile for pickup and delivery jobs. They sign in with
        their phone number and PIN at{" "}
        <span className="font-medium text-foreground">/login?role=rider</span>.
      </p>

      {success ? (
        <p
          className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
          role="status"
        >
          Rider saved on this device (preview). Connect the API to persist accounts
          and send login details securely.
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <FormField
          name="fullName"
          label="Full name"
          placeholder="Rider full name"
          autoComplete="name"
          error={errors.fullName}
        />
        <FormField
          name="phone"
          type="tel"
          label="Phone number"
          placeholder="+234 …"
          autoComplete="tel"
          error={errors.phone}
        />
        <FormField
          name="vehicleLabel"
          label="Vehicle (optional)"
          placeholder="e.g. Bike · ABC-123-JG"
          error={errors.vehicleLabel}
        />
        <PinField
          name="pin"
          label="6-digit PIN for rider"
          autoComplete="new-password"
          error={errors.pin}
        />
        <button
          type="submit"
          disabled={pending}
          className="flex h-11 w-full items-center justify-center rounded-full bg-brand-dark text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Add dispatch rider"}
        </button>
      </form>
    </div>
  );
}
