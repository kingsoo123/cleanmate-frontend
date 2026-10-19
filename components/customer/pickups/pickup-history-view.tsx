import Link from "next/link";
import { PickupStatusBadge } from "@/components/business/pickups/pickup-status-badge";
import type { CustomerPickupRow } from "@/lib/customer-dashboard/types";

export function PickupHistoryView({
  pickups,
}: {
  pickups: CustomerPickupRow[];
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">Pickups</p>
          <h2 className="text-2xl font-bold text-foreground">Pickup history</h2>
        </div>
        <Link
          href="/customer/pickups/new"
          className="inline-flex h-10 items-center rounded-full bg-brand-dark px-4 text-sm font-semibold text-white hover:opacity-90"
        >
          Request pickup
        </Link>
      </div>

      <ul className="divide-y divide-border rounded-2xl border border-border bg-surface shadow-sm">
        {pickups.length === 0 ? (
          <li className="px-5 py-10 text-center text-sm text-muted">
            No pickup requests yet.
          </li>
        ) : (
          pickups.map((pickup) => (
            <li key={pickup.id} className="px-5 py-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-mono text-sm font-semibold text-brand">
                  {pickup.reference}
                </p>
                <PickupStatusBadge status={pickup.status} />
              </div>
              <p className="mt-1 text-sm text-muted">{pickup.scheduledFor}</p>
              <p className="mt-1 text-sm text-foreground">{pickup.addressLine}</p>
              <p className="mt-1 text-xs text-muted">{pickup.estimatedItems}</p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
