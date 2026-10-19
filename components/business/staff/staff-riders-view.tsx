"use client";

import Link from "next/link";
import { useState } from "react";
import { OnboardRiderForm } from "@/components/business/staff/onboard-rider-form";
import type { DispatchRider } from "@/lib/business-dashboard/riders-types";

const initialRiders: DispatchRider[] = [
  {
    id: "r1",
    fullName: "Emeka Duru",
    phone: "+234 803 111 2233",
    vehicleLabel: "Motorcycle · LND-482KA",
    status: "On job",
    jobsToday: 4,
    onboardedAt: "2026-09-01",
  },
  {
    id: "r2",
    fullName: "Samuel Kola",
    phone: "+234 807 444 5566",
    vehicleLabel: "Van · GGE-901LM",
    status: "Active",
    jobsToday: 2,
    onboardedAt: "2026-09-12",
  },
];

function StatusPill({ status }: { status: DispatchRider["status"] }) {
  const styles = {
    Active: "bg-emerald-50 text-emerald-800",
    "Off duty": "bg-secondary-surface text-muted",
    "On job": "bg-sky-50 text-sky-900",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

export function StaffRidersView() {
  const [riders, setRiders] = useState(initialRiders);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-brand">Team</p>
          <h2 className="text-2xl font-bold text-foreground">Staff & dispatch riders</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Onboard riders who handle customer pickups and deliveries. Internal
            staff roles (front desk, laundry floor, manager) will be managed
            here in a later update.
          </p>
        </div>
        <Link
          href="/login?role=rider"
          className="inline-flex h-10 items-center rounded-full border border-border bg-surface px-4 text-sm font-semibold text-foreground hover:bg-secondary-surface"
        >
          Rider sign-in page
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <OnboardRiderForm
            onRiderAdded={(rider) => setRiders((prev) => [rider, ...prev])}
          />
        </div>

        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-border bg-surface shadow-sm">
            <div className="border-b border-border px-5 py-3">
              <h3 className="font-semibold text-foreground">Dispatch riders</h3>
              <p className="text-xs text-muted">{riders.length} onboarded</p>
            </div>
            <ul className="divide-y divide-border">
              {riders.map((rider) => (
                <li key={rider.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">{rider.fullName}</p>
                      <p className="text-sm text-muted">{rider.phone}</p>
                      {rider.vehicleLabel ? (
                        <p className="mt-1 text-xs text-muted">{rider.vehicleLabel}</p>
                      ) : null}
                    </div>
                    <StatusPill status={rider.status} />
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    {rider.jobsToday} jobs today · Onboarded{" "}
                    {new Date(rider.onboardedAt).toLocaleDateString("en-NG", {
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
    </div>
  );
}
