"use client";

import { useEffect, useState } from "react";
import { PinField } from "@/components/auth/pin-field";
import { FormField } from "@/components/auth/form-field";
import {
  createBranchManager,
  fetchBusinessBranches,
  type BranchManagerRow,
  type BusinessBranchRow,
} from "@/lib/business-dashboard/branch-managers-api";
import { isValidPin } from "@/lib/auth/validation";

type FieldErrors = Partial<Record<string, string>>;

export function OnboardBranchManagerForm({
  onManagerAdded,
}: {
  onManagerAdded: (manager: BranchManagerRow) => void;
}) {
  const [branches, setBranches] = useState<BusinessBranchRow[]>([]);
  const [branchId, setBranchId] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    void fetchBusinessBranches()
      .then((rows) => {
        setBranches(rows);
        if (rows[0]) setBranchId(rows[0].id);
      })
      .catch(() => {
        setLoadError("Could not load branches.");
      });
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    setFormError(null);

    const data = new FormData(event.currentTarget);
    const fullName = String(data.get("fullName") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const pin = String(data.get("pin") ?? "");
    const nextErrors: FieldErrors = {};

    if (!fullName) nextErrors.fullName = "Name is required.";
    if (!phone) nextErrors.phone = "Phone number is required.";
    if (!branchId) nextErrors.branchId = "Select a branch.";
    if (!isValidPin(pin)) nextErrors.pin = "PIN must be exactly 6 digits.";

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setPending(false);
      return;
    }

    try {
      const manager = await createBranchManager({
        fullName,
        phone,
        pin,
        branchId,
      });
      onManagerAdded(manager);
      event.currentTarget.reset();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Could not add branch manager.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <h3 className="font-semibold text-foreground">Add branch manager</h3>
      <p className="mt-1 text-xs text-muted">
        They sign in at{" "}
        <span className="font-medium text-foreground">/login?role=branch_manager</span>{" "}
        with phone and the PIN you set.
      </p>

      {loadError ? (
        <p className="mt-4 text-xs text-red-700" role="alert">
          {loadError}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
        {formError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {formError}
          </p>
        ) : null}

        <FormField
          name="fullName"
          label="Full name"
          placeholder="Full name"
          error={errors.fullName}
        />

        <FormField
          name="phone"
          type="tel"
          label="Phone number"
          placeholder="+234 803 000 0000"
          error={errors.phone}
        />

        <div>
          <label
            htmlFor="branchId"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Branch
          </label>
          <select
            id="branchId"
            name="branchId"
            value={branchId}
            onChange={(event) => setBranchId(event.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground"
            disabled={!branches.length}
          >
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
          {errors.branchId ? (
            <p className="mt-1 text-xs text-red-600">{errors.branchId}</p>
          ) : null}
        </div>

        <PinField
          name="pin"
          label="6-digit sign-in PIN"
          hint="Share this PIN with the manager securely."
          error={errors.pin}
        />

        <button
          type="submit"
          disabled={pending || !branches.length}
          className="flex h-11 w-full items-center justify-center rounded-full bg-brand-dark text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Adding…" : "Add branch manager"}
        </button>
      </form>
    </div>
  );
}