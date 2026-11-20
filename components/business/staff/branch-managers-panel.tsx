"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { OnboardBranchManagerForm } from "@/components/business/staff/onboard-branch-manager-form";
import {
  fetchBranchManagers,
  removeBranchManager,
  type BranchManagerRow,
} from "@/lib/business-dashboard/branch-managers-api";

export function BranchManagersPanel() {
  const [managers, setManagers] = useState<BranchManagerRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    void fetchBranchManagers()
      .then(setManagers)
      .catch(() => setLoadError("Could not load branch managers."));
  }, []);

  async function handleRemove(id: string) {
    setRemovingId(id);
    try {
      await removeBranchManager(id);
      setManagers((prev) => prev.filter((row) => row.id !== id));
    } catch {
      setLoadError("Could not remove branch manager.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-brand">Branches</p>
          <h2 className="text-2xl font-bold text-foreground">Branch managers</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Managers sign in with phone and PIN. They only see dashboard, orders,
            and notifications for their assigned branch.
          </p>
        </div>
        <Link
          href="/login?role=branch_manager"
          className="inline-flex h-10 items-center rounded-full border border-border bg-surface px-4 text-sm font-semibold text-foreground hover:bg-secondary-surface"
        >
          Branch manager sign-in
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <OnboardBranchManagerForm
            onManagerAdded={(manager) =>
              setManagers((prev) => [manager, ...prev])
            }
          />
        </div>

        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-border bg-surface shadow-sm">
            <div className="border-b border-border px-5 py-3">
              <h3 className="font-semibold text-foreground">Onboarded managers</h3>
              <p className="text-xs text-muted">{managers.length} active</p>
            </div>
            {loadError ? (
              <p className="px-5 py-4 text-sm text-red-700">{loadError}</p>
            ) : null}
            <ul className="divide-y divide-border">
              {managers.length === 0 && !loadError ? (
                <li className="px-5 py-8 text-sm text-muted">
                  No branch managers yet. Add one with the form.
                </li>
              ) : null}
              {managers.map((manager) => (
                <li key={manager.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">
                        {manager.fullName}
                      </p>
                      <p className="text-sm text-muted">{manager.phone}</p>
                      <p className="mt-1 text-xs text-muted">
                        Branch: {manager.branchName}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={removingId === manager.id}
                      onClick={() => void handleRemove(manager.id)}
                      className="text-xs font-semibold text-red-700 hover:underline disabled:opacity-50"
                    >
                      {removingId === manager.id ? "Removing…" : "Remove"}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    Added{" "}
                    {new Date(manager.createdAt).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}