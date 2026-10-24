"use client";

import Link from "next/link";
import { useState } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { FormField } from "@/components/auth/form-field";
import { PinField } from "@/components/auth/pin-field";
import { AuthApiError } from "@/lib/auth/api-client";
import { createCustomerAddress } from "@/lib/customer-dashboard/customer-api";
import { isValidPin } from "@/lib/auth/validation";
import type {
  CustomerProfile,
  CustomerSavedAddress,
} from "@/lib/customer-dashboard/customer-profile-preview";

type FieldErrors = Partial<Record<string, string>>;

export function CustomerProfileView({
  initialProfile,
  initialAddresses,
}: {
  initialProfile: CustomerProfile;
  initialAddresses: CustomerSavedAddress[];
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [addresses, setAddresses] = useState(initialAddresses);
  const [profileSaved, setProfileSaved] = useState(false);
  const [pinSaved, setPinSaved] = useState(false);
  const [addressSaved, setAddressSaved] = useState(false);
  const [profileErrors, setProfileErrors] = useState<FieldErrors>({});
  const [pinErrors, setPinErrors] = useState<FieldErrors>({});
  const [addressErrors, setAddressErrors] = useState<FieldErrors>({});

  function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileErrors({});
    setProfileSaved(false);

    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();

    const nextErrors: FieldErrors = {};
    if (!name) nextErrors.name = "Name is required.";

    if (Object.keys(nextErrors).length) {
      setProfileErrors(nextErrors);
      return;
    }

    setProfile((prev) => ({ ...prev, name, email }));
    setProfileSaved(true);
  }

  function handlePinSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPinErrors({});
    setPinSaved(false);

    const data = new FormData(event.currentTarget);
    const newPin = String(data.get("newPin") ?? "");
    const confirmPin = String(data.get("confirmPin") ?? "");

    const nextErrors: FieldErrors = {};
    if (!isValidPin(newPin)) nextErrors.newPin = "Enter a new 6-digit PIN.";
    if (newPin !== confirmPin) nextErrors.confirmPin = "PINs do not match.";

    if (Object.keys(nextErrors).length) {
      setPinErrors(nextErrors);
      return;
    }

    event.currentTarget.reset();
    setPinSaved(true);
  }

  async function handleAddAddress(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setAddressErrors({});
    setAddressSaved(false);

    const data = new FormData(form);
    const label = String(data.get("label") ?? "").trim();
    const line = String(data.get("line") ?? "").trim();

    const nextErrors: FieldErrors = {};
    if (!label) nextErrors.label = "Label is required (e.g. Home).";
    if (!line) nextErrors.line = "Address is required.";

    if (Object.keys(nextErrors).length) {
      setAddressErrors(nextErrors);
      return;
    }

    try {
      const created = await createCustomerAddress({ label, line });
      setAddresses((prev) => [...prev, created]);
      form.reset();
      setAddressSaved(true);
    } catch (error) {
      setAddressErrors({
        line:
          error instanceof AuthApiError
            ? error.message
            : "Could not save address.",
      });
    }
  }

  function removeAddress(id: string) {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <div>
        <p className="text-sm font-medium text-muted">Account</p>
        <h2 className="text-2xl font-bold text-foreground">Profile</h2>
      </div>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <h3 className="text-lg font-semibold text-foreground">Your laundry</h3>
        <p className="mt-2 text-sm text-foreground">{profile.preferredLaundry}</p>
        <p className="mt-1 text-xs text-muted">
          Customer since {profile.memberSince}. Contact your laundry to transfer
          or close this account.
        </p>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <h3 className="text-lg font-semibold text-foreground">Personal details</h3>
        <p className="mt-1 text-sm text-muted">
          Phone number is used to sign in and is managed by your laundry.
        </p>

        {profileSaved ? (
          <p
            className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
            role="status"
          >
            Profile updated on this device (preview).
          </p>
        ) : null}

        <form onSubmit={handleProfileSubmit} className="mt-6 space-y-4" noValidate>
          <FormField
            name="name"
            label="Full name"
            required
            defaultValue={profile.name}
            error={profileErrors.name}
          />
          <FormField
            name="phone"
            type="tel"
            label="Phone number"
            value={profile.phone}
            readOnly
            className="cursor-not-allowed bg-secondary-surface/50"
            aria-readonly
          />
          <FormField
            name="email"
            type="email"
            label="Email"
            defaultValue={profile.email}
            placeholder="For receipts (optional)"
          />
          <button
            type="submit"
            className="flex h-11 w-full items-center justify-center rounded-full bg-brand-dark text-sm font-semibold text-white hover:opacity-90"
          >
            Save details
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <h3 className="text-lg font-semibold text-foreground">Change PIN</h3>
        <p className="mt-1 text-sm text-muted">
          Use a 6-digit PIN you remember. You sign in at{" "}
          <span className="font-medium text-foreground">/login?role=customer</span>.
        </p>

        {pinSaved ? (
          <p
            className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
            role="status"
          >
            PIN updated on this device (preview). Connect the API to persist
            securely.
          </p>
        ) : null}

        <form onSubmit={handlePinSubmit} className="mt-6 space-y-4" noValidate>
          <PinField
            name="newPin"
            label="New 6-digit PIN"
            autoComplete="new-password"
            hint={null}
            error={pinErrors.newPin}
          />
          <PinField
            name="confirmPin"
            label="Confirm PIN"
            autoComplete="new-password"
            hint={null}
            error={pinErrors.confirmPin}
          />
          <button
            type="submit"
            className="flex h-11 w-full items-center justify-center rounded-full border border-border bg-surface text-sm font-semibold text-foreground hover:bg-secondary-surface"
          >
            Update PIN
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <h3 className="text-lg font-semibold text-foreground">Saved addresses</h3>
        <p className="mt-1 text-sm text-muted">
          Used for pickup and delivery when you request a collection.
        </p>

        <ul className="mt-4 space-y-3">
          {addresses.map((address) => (
            <li
              key={address.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-border bg-secondary-surface/40 px-4 py-3"
            >
              <div>
                <p className="font-medium text-foreground">{address.label}</p>
                <p className="text-sm text-muted">{address.line}</p>
              </div>
              <button
                type="button"
                onClick={() => removeAddress(address.id)}
                className="text-xs font-semibold text-red-700 hover:underline"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>

        {addressSaved ? (
          <p className="mt-4 text-sm text-emerald-800" role="status">
            Address added (preview).
          </p>
        ) : null}

        <form onSubmit={handleAddAddress} className="mt-6 space-y-4 border-t border-border pt-6" noValidate>
          <FormField
            name="label"
            label="Label"
            placeholder="Home, Office…"
            error={addressErrors.label}
          />
          <FormField
            name="line"
            label="Address"
            placeholder="Street, area, city"
            error={addressErrors.line}
          />
          <button
            type="submit"
            className="flex h-11 w-full items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-white hover:opacity-90"
          >
            Add address
          </button>
        </form>
      </section>

      <div className="flex flex-col gap-3 border-t border-border pt-6">
        <LogoutButton
          role="customer"
          className="inline-flex h-11 w-full items-center justify-center rounded-full border border-border text-sm font-semibold text-foreground hover:bg-secondary-surface"
        />
        <Link href="/" className="text-center text-sm font-semibold text-brand hover:underline">
          Back to website
        </Link>
      </div>
    </div>
  );
}
