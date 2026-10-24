"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AuthApiError } from "@/lib/auth/api-client";
import {
  fetchBusinessPickups,
  updateBusinessPickup,
} from "@/lib/business-dashboard/operations-api";
import { PickupStatusBadge } from "@/components/business/pickups/pickup-status-badge";
import {
  countPickupsByFilter,
  filterPickupsList,
  nextStatusAfterAction,
  parsePickupListFilter,
} from "@/lib/business-dashboard/get-pickups-data";
import type {
  BusinessPickupRequest,
  PickupAssignRider,
  PickupListFilter,
} from "@/lib/business-dashboard/pickups-types";

const filterTabs: { id: PickupListFilter; label: string }[] = [
  { id: "all", label: "All open" },
  { id: "review", label: "Awaiting review" },
  { id: "in_progress", label: "In progress" },
  { id: "done", label: "Completed" },
];

export function PickupsListView({
  initialPickups,
  riders,
}: {
  initialPickups: BusinessPickupRequest[];
  riders: PickupAssignRider[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pickups, setPickups] = useState(initialPickups);
  const [ridersList, setRidersList] = useState(riders);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialPickups[0]?.id ?? null,
  );
  const [assignRiderId, setAssignRiderId] = useState(riders[0]?.id ?? "");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchBusinessPickups();
        if (cancelled) return;
        setPickups(data.pickups);
        setRidersList(data.riders);
        setSelectedId((current) => current ?? data.pickups[0]?.id ?? null);
        setAssignRiderId((current) => current || data.riders[0]?.id || "");
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof AuthApiError
              ? err.message
              : "Could not load pickups.",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filter = parsePickupListFilter(searchParams.get("filter") ?? undefined);
  const counts = useMemo(() => countPickupsByFilter(pickups), [pickups]);

  const filtered = useMemo(
    () => filterPickupsList(pickups, { filter, query }),
    [pickups, filter, query],
  );

  const selected =
    filtered.find((p) => p.id === selectedId) ??
    pickups.find((p) => p.id === selectedId) ??
    null;

  function setFilter(next: PickupListFilter) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("filter");
    else params.set("filter", next);
    const qs = params.toString();
    router.replace(qs ? `/business/pickups?${qs}` : "/business/pickups", {
      scroll: false,
    });
  }

  function updatePickup(
    id: string,
    patch: Partial<BusinessPickupRequest>,
  ) {
    setPickups((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...patch, updatedAt: "Just now" }
          : p,
      ),
    );
  }

  async function runAction(
    pickup: BusinessPickupRequest,
    action: Parameters<typeof nextStatusAfterAction>[1],
    extra?: Partial<BusinessPickupRequest>,
  ) {
    try {
      const updated = await updateBusinessPickup(pickup.id, {
        action,
        assignedRiderId: extra?.assignedRiderId ?? undefined,
      });
      updatePickup(pickup.id, updated);
    } catch (err) {
      setLoadError(
        err instanceof AuthApiError
          ? err.message
          : "Could not update pickup.",
      );
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">Operations</p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Pickup requests
          </h2>
        </div>
        <Link
          href="/business/staff"
          className="text-sm font-semibold text-brand hover:underline"
        >
          Manage riders
        </Link>
      </div>

      {loadError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {loadError}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search reference, customer, address…"
          className="max-w-md flex-1 rounded-xl border border-border bg-surface py-2.5 px-4 text-sm text-foreground placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
        <p className="text-sm text-muted">
          <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
          requests
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterTabs.map((tab) => {
          const active = filter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "bg-brand text-white shadow-sm"
                  : "border border-border bg-surface text-foreground hover:bg-secondary-surface"
              }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 text-xs ${active ? "text-white/90" : "text-muted"}`}
              >
                ({counts[tab.id]})
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-border bg-surface shadow-sm">
            {filtered.length === 0 ? (
              <p className="px-6 py-12 text-center text-sm text-muted">
                No pickup requests match this filter.
              </p>
            ) : (
              <>
                <ul className="divide-y divide-border lg:hidden">
                  {filtered.map((pickup) => (
                    <li key={pickup.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(pickup.id)}
                        className={`w-full px-4 py-4 text-left ${
                          selectedId === pickup.id
                            ? "bg-brand-light/30"
                            : "hover:bg-secondary-surface/40"
                        }`}
                      >
                        <PickupRowSummary pickup={pickup} />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                        <th className="px-4 py-3 font-medium">Reference</th>
                        <th className="py-3 pr-4 font-medium">Customer</th>
                        <th className="py-3 pr-4 font-medium">Scheduled</th>
                        <th className="py-3 pr-4 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Rider</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filtered.map((pickup) => (
                        <tr
                          key={pickup.id}
                          onClick={() => setSelectedId(pickup.id)}
                          className={`cursor-pointer ${
                            selectedId === pickup.id
                              ? "bg-brand-light/30"
                              : "hover:bg-secondary-surface/40"
                          }`}
                        >
                          <td className="px-4 py-3">
                            <p className="font-mono text-xs font-semibold text-brand">
                              {pickup.reference}
                            </p>
                            <p className="max-w-[10rem] truncate text-xs text-muted">
                              {pickup.addressLine}
                            </p>
                          </td>
                          <td className="py-3 pr-4">
                            <p className="font-medium text-foreground">
                              {pickup.customerName}
                            </p>
                            <p className="text-xs text-muted">{pickup.customerPhone}</p>
                          </td>
                          <td className="py-3 pr-4 text-muted">
                            {pickup.scheduledFor}
                          </td>
                          <td className="py-3 pr-4">
                            <PickupStatusBadge status={pickup.status} />
                          </td>
                          <td className="px-4 py-3 text-muted">
                            {pickup.assignedRiderName ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selected ? (
            <PickupDetailPanel
              pickup={selected}
              riders={ridersList}
              assignRiderId={assignRiderId}
              onAssignRiderIdChange={setAssignRiderId}
              onAccept={() => runAction(selected, "accept")}
              onDecline={() => runAction(selected, "decline")}
              onAssign={() => {
                const rider = ridersList.find((r) => r.id === assignRiderId);
                if (!rider) return;
                runAction(selected, "assign", {
                  assignedRiderId: rider.id,
                  assignedRiderName: rider.fullName,
                });
              }}
              onEnRoute={() => runAction(selected, "en_route")}
              onCollected={() => runAction(selected, "collected")}
              onReceived={() => runAction(selected, "received")}
              onConvert={() => runAction(selected, "convert")}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-surface/80 p-8 text-center text-sm text-muted">
              Select a pickup request to review and update status.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PickupRowSummary({ pickup }: { pickup: BusinessPickupRequest }) {
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-sm font-semibold text-brand">
          {pickup.reference}
        </p>
        <PickupStatusBadge status={pickup.status} />
      </div>
      <p className="mt-1 font-medium text-foreground">{pickup.customerName}</p>
      <p className="text-xs text-muted">{pickup.scheduledFor}</p>
    </>
  );
}

function PickupDetailPanel({
  pickup,
  riders,
  assignRiderId,
  onAssignRiderIdChange,
  onAccept,
  onDecline,
  onAssign,
  onEnRoute,
  onCollected,
  onReceived,
  onConvert,
}: {
  pickup: BusinessPickupRequest;
  riders: PickupAssignRider[];
  assignRiderId: string;
  onAssignRiderIdChange: (id: string) => void;
  onAccept: () => void;
  onDecline: () => void;
  onAssign: () => void;
  onEnRoute: () => void;
  onCollected: () => void;
  onReceived: () => void;
  onConvert: () => void;
}) {
  const terminal =
    pickup.status === "Converted to Order" || pickup.status === "Declined";

  return (
    <div className="sticky top-20 rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-mono text-sm font-semibold text-brand">
            {pickup.reference}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">
            {pickup.customerName}
          </h3>
          <p className="text-sm text-muted">{pickup.customerPhone}</p>
        </div>
        <PickupStatusBadge status={pickup.status} />
      </div>

      <dl className="mt-5 space-y-3 text-sm">
        <DetailRow label="Address" value={pickup.addressLine} />
        <DetailRow label="Window" value={pickup.scheduledFor} />
        <DetailRow label="Items" value={pickup.estimatedItems} />
        {pickup.customerNotes ? (
          <DetailRow label="Customer note" value={pickup.customerNotes} />
        ) : null}
        {pickup.assignedRiderName ? (
          <DetailRow label="Rider" value={pickup.assignedRiderName} />
        ) : null}
        {pickup.linkedOrderNumber ? (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              Order
            </dt>
            <dd className="mt-1">
              <Link
                href="/business/orders"
                className="font-mono text-sm font-semibold text-brand hover:underline"
              >
                {pickup.linkedOrderNumber}
              </Link>
            </dd>
          </div>
        ) : null}
        <DetailRow label="Submitted" value={pickup.submittedAt} />
        <DetailRow label="Updated" value={pickup.updatedAt} />
      </dl>

      {terminal ? (
        <p className="mt-6 text-sm text-muted">
          {pickup.status === "Declined"
            ? "This request was declined."
            : "Converted to an order — price and process from the orders module."}
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {pickup.status === "Pending Review" ? (
            <div className="flex flex-wrap gap-2">
              <ActionButton onClick={onAccept} primary>
                Accept request
              </ActionButton>
              <ActionButton onClick={onDecline}>Decline</ActionButton>
            </div>
          ) : null}

          {pickup.status === "Accepted" ? (
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-muted">
                Assign rider
              </label>
              <select
                value={assignRiderId}
                onChange={(e) => onAssignRiderIdChange(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
              >
                {riders.map((rider) => (
                  <option key={rider.id} value={rider.id}>
                    {rider.fullName} · {rider.status}
                  </option>
                ))}
              </select>
              <ActionButton onClick={onAssign} primary>
                Assign driver
              </ActionButton>
            </div>
          ) : null}

          {pickup.status === "Driver Assigned" ? (
            <ActionButton onClick={onEnRoute} primary>
              Mark en route
            </ActionButton>
          ) : null}
          {pickup.status === "En Route" ? (
            <ActionButton onClick={onCollected} primary>
              Mark collected
            </ActionButton>
          ) : null}
          {pickup.status === "Collected" ? (
            <ActionButton onClick={onReceived} primary>
              Received at facility
            </ActionButton>
          ) : null}
          {pickup.status === "Received at Facility" ? (
            <div className="space-y-2">
              <ActionButton onClick={onConvert} primary>
                Convert to order
              </ActionButton>
              <Link
                href="/business/orders/new"
                className="block text-center text-sm font-semibold text-brand hover:underline"
              >
                Open new order form
              </Link>
            </div>
          ) : null}
        </div>
      )}

      <p className="mt-6 text-xs text-muted">
        Status changes are saved on this device (preview) until the pickup API is
        connected.
      </p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </dt>
      <dd className="mt-0.5 text-foreground">{value}</dd>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  primary,
}: {
  children: React.ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-full px-4 py-2.5 text-sm font-semibold ${
        primary
          ? "bg-brand-dark text-white hover:opacity-90"
          : "border border-border bg-surface text-foreground hover:bg-secondary-surface"
      }`}
    >
      {children}
    </button>
  );
}
