"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { DeliveryStatusBadge } from "@/components/business/deliveries/delivery-status-badge";
import { PaymentStateBadge } from "@/components/business/status-badge";
import { formatNgn } from "@/lib/business-dashboard/format";
import {
  countDeliveriesByFilter,
  filterDeliveriesList,
  nextDeliveryStatusAfterAction,
  parseDeliveryListFilter,
} from "@/lib/business-dashboard/get-deliveries-data";
import type {
  BusinessDeliveryJob,
  DeliveryAssignRider,
  DeliveryListFilter,
} from "@/lib/business-dashboard/deliveries-types";

const filterTabs: { id: DeliveryListFilter; label: string }[] = [
  { id: "all", label: "All open" },
  { id: "awaiting", label: "Needs driver" },
  { id: "in_progress", label: "In progress" },
  { id: "done", label: "Completed" },
];

export function DeliveriesListView({
  initialDeliveries,
  riders,
}: {
  initialDeliveries: BusinessDeliveryJob[];
  riders: DeliveryAssignRider[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialDeliveries[0]?.id ?? null,
  );
  const [assignRiderId, setAssignRiderId] = useState(riders[0]?.id ?? "");

  const filter = parseDeliveryListFilter(searchParams.get("filter") ?? undefined);
  const counts = useMemo(() => countDeliveriesByFilter(deliveries), [deliveries]);

  const filtered = useMemo(
    () => filterDeliveriesList(deliveries, { filter, query }),
    [deliveries, filter, query],
  );

  const selected =
    filtered.find((d) => d.id === selectedId) ??
    deliveries.find((d) => d.id === selectedId) ??
    null;

  function setFilter(next: DeliveryListFilter) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("filter");
    else params.set("filter", next);
    const qs = params.toString();
    router.replace(qs ? `/business/deliveries?${qs}` : "/business/deliveries", {
      scroll: false,
    });
  }

  function updateJob(id: string, patch: Partial<BusinessDeliveryJob>) {
    setDeliveries((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, ...patch, updatedAt: "Just now" } : d,
      ),
    );
  }

  function runAction(
    job: BusinessDeliveryJob,
    action: Parameters<typeof nextDeliveryStatusAfterAction>[1],
    extra?: Partial<BusinessDeliveryJob>,
  ) {
    updateJob(job.id, {
      status: nextDeliveryStatusAfterAction(job.status, action),
      ...extra,
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">Operations</p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Deliveries
          </h2>
        </div>
        <div className="flex flex-wrap gap-3 text-sm font-semibold">
          <Link href="/business/orders?filter=ready" className="text-brand hover:underline">
            Ready orders
          </Link>
          <Link href="/business/staff" className="text-brand hover:underline">
            Manage riders
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search job, order #, customer, address…"
          className="max-w-md flex-1 rounded-xl border border-border bg-surface py-2.5 px-4 text-sm text-foreground placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
        <p className="text-sm text-muted">
          <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
          jobs
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
                No delivery jobs match this filter.
              </p>
            ) : (
              <>
                <ul className="divide-y divide-border lg:hidden">
                  {filtered.map((job) => (
                    <li key={job.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(job.id)}
                        className={`w-full px-4 py-4 text-left ${
                          selectedId === job.id
                            ? "bg-brand-light/30"
                            : "hover:bg-secondary-surface/40"
                        }`}
                      >
                        <DeliveryRowSummary job={job} />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                        <th className="px-4 py-3 font-medium">Job</th>
                        <th className="py-3 pr-4 font-medium">Customer</th>
                        <th className="py-3 pr-4 font-medium">Scheduled</th>
                        <th className="py-3 pr-4 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Collect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filtered.map((job) => (
                        <tr
                          key={job.id}
                          onClick={() => setSelectedId(job.id)}
                          className={`cursor-pointer ${
                            selectedId === job.id
                              ? "bg-brand-light/30"
                              : "hover:bg-secondary-surface/40"
                          }`}
                        >
                          <td className="px-4 py-3">
                            <p className="font-mono text-xs font-semibold text-brand">
                              {job.reference}
                            </p>
                            <p className="font-mono text-xs text-muted">
                              {job.orderNumber}
                            </p>
                          </td>
                          <td className="py-3 pr-4">
                            <p className="font-medium text-foreground">
                              {job.customerName}
                            </p>
                            <p className="max-w-[12rem] truncate text-xs text-muted">
                              {job.deliveryAddress}
                            </p>
                          </td>
                          <td className="py-3 pr-4 text-muted">
                            {job.scheduledFor}
                          </td>
                          <td className="py-3 pr-4">
                            <DeliveryStatusBadge status={job.status} />
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {job.collectOnDeliveryNgn > 0
                              ? formatNgn(job.collectOnDeliveryNgn)
                              : "—"}
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
            <DeliveryDetailPanel
              job={selected}
              riders={riders}
              assignRiderId={assignRiderId}
              onAssignRiderIdChange={setAssignRiderId}
              onAssign={() => {
                const rider = riders.find((r) => r.id === assignRiderId);
                if (!rider) return;
                runAction(selected, "assign", {
                  assignedRiderId: rider.id,
                  assignedRiderName: rider.fullName,
                });
              }}
              onDispatch={() => runAction(selected, "dispatch")}
              onDelivered={() => runAction(selected, "delivered")}
              onFailed={() => runAction(selected, "failed")}
              onCancel={() => runAction(selected, "cancel")}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-surface/80 p-8 text-center text-sm text-muted">
              Select a delivery job to assign a driver or update status.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DeliveryRowSummary({ job }: { job: BusinessDeliveryJob }) {
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-sm font-semibold text-brand">
          {job.reference}
        </p>
        <DeliveryStatusBadge status={job.status} />
      </div>
      <p className="mt-1 font-medium text-foreground">{job.customerName}</p>
      <p className="text-xs text-muted">
        {job.orderNumber} · {job.scheduledFor}
      </p>
    </>
  );
}

function DeliveryDetailPanel({
  job,
  riders,
  assignRiderId,
  onAssignRiderIdChange,
  onAssign,
  onDispatch,
  onDelivered,
  onFailed,
  onCancel,
}: {
  job: BusinessDeliveryJob;
  riders: DeliveryAssignRider[];
  assignRiderId: string;
  onAssignRiderIdChange: (id: string) => void;
  onAssign: () => void;
  onDispatch: () => void;
  onDelivered: () => void;
  onFailed: () => void;
  onCancel: () => void;
}) {
  const terminal =
    job.status === "Delivered" ||
    job.status === "Failed Attempt" ||
    job.status === "Cancelled";

  return (
    <div className="sticky top-20 rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-mono text-sm font-semibold text-brand">
            {job.reference}
          </p>
          <Link
            href="/business/orders"
            className="mt-0.5 font-mono text-xs font-semibold text-brand hover:underline"
          >
            {job.orderNumber}
          </Link>
          <h3 className="mt-2 text-lg font-semibold text-foreground">
            {job.customerName}
          </h3>
          <p className="text-sm text-muted">{job.customerPhone}</p>
        </div>
        <DeliveryStatusBadge status={job.status} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <PaymentStateBadge state={job.paymentState} />
        {job.collectOnDeliveryNgn > 0 ? (
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-900">
            Collect {formatNgn(job.collectOnDeliveryNgn)}
          </span>
        ) : null}
      </div>

      <dl className="mt-5 space-y-3 text-sm">
        <DetailRow label="Address" value={job.deliveryAddress} />
        <DetailRow label="Window" value={job.scheduledFor} />
        <DetailRow label="Items" value={job.itemsSummary} />
        {job.assignedRiderName ? (
          <DetailRow label="Rider" value={job.assignedRiderName} />
        ) : null}
        {job.driverNotes ? (
          <DetailRow label="Driver notes" value={job.driverNotes} />
        ) : null}
        <DetailRow label="Updated" value={job.updatedAt} />
      </dl>

      {terminal ? (
        <p className="mt-6 text-sm text-muted">
          {job.status === "Delivered"
            ? "Delivery completed — order can be marked collected in Orders."
            : job.status === "Failed Attempt"
              ? "Reschedule or reassign from a new job when the customer confirms."
              : "This delivery job was cancelled."}
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {job.status === "Pending Assignment" ? (
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

          {job.status === "Driver Assigned" ? (
            <ActionButton onClick={onDispatch} primary>
              Mark out for delivery
            </ActionButton>
          ) : null}

          {job.status === "Out for Delivery" ? (
            <div className="space-y-2">
              <ActionButton onClick={onDelivered} primary>
                Mark delivered
              </ActionButton>
              <ActionButton onClick={onFailed}>Failed attempt</ActionButton>
            </div>
          ) : null}

          {job.status !== "Out for Delivery" ? (
            <ActionButton onClick={onCancel}>Cancel job</ActionButton>
          ) : null}
        </div>
      )}

      <p className="mt-6 text-xs text-muted">
        Updates are stored on this device (preview) until the delivery API is
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
