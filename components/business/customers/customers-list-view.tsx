"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { RegisterCustomerForm } from "@/components/business/customers/register-customer-form";
import { formatNgn } from "@/lib/business-dashboard/format";
import {
  countCustomersByFilter,
  filterCustomersList,
  getCustomerRecentOrders,
  parseCustomerListFilter,
} from "@/lib/business-dashboard/get-customers-data";
import type {
  BusinessCustomer,
  CustomerListFilter,
} from "@/lib/business-dashboard/customers-types";

const filterTabs: { id: CustomerListFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active orders" },
  { id: "balance", label: "Outstanding balance" },
];

export function CustomersListView({
  initialCustomers,
}: {
  initialCustomers: BusinessCustomer[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customers, setCustomers] = useState(initialCustomers);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialCustomers[0]?.id ?? null,
  );

  const filter = parseCustomerListFilter(searchParams.get("filter") ?? undefined);
  const counts = useMemo(() => countCustomersByFilter(customers), [customers]);

  const filtered = useMemo(
    () => filterCustomersList(customers, { filter, query }),
    [customers, filter, query],
  );

  const selected =
    filtered.find((c) => c.id === selectedId) ??
    customers.find((c) => c.id === selectedId) ??
    null;

  function setFilter(next: CustomerListFilter) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("filter");
    else params.set("filter", next);
    const qs = params.toString();
    router.replace(qs ? `/business/customers?${qs}` : "/business/customers", {
      scroll: false,
    });
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm font-medium text-muted">CRM</p>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Customers
        </h2>
      </div>

      <div className="grid gap-8 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <RegisterCustomerForm
            onCustomerAdded={(customer) => {
              setCustomers((prev) => [customer, ...prev]);
              setSelectedId(customer.id);
            }}
          />
        </div>

        <div className="space-y-4 xl:col-span-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, phone, or email…"
              className="max-w-md flex-1 rounded-xl border border-border bg-surface py-2.5 px-4 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
            <p className="text-sm text-muted">
              <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
              customers
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
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
                    active
                      ? "bg-brand text-white"
                      : "border border-border bg-surface hover:bg-secondary-surface"
                  }`}
                >
                  {tab.label} ({counts[tab.id]})
                </button>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-border bg-surface shadow-sm">
                {filtered.length === 0 ? (
                  <p className="px-6 py-12 text-center text-sm text-muted">
                    No customers match.
                  </p>
                ) : (
                  <>
                    <ul className="divide-y divide-border lg:hidden">
                      {filtered.map((customer) => (
                        <li key={customer.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedId(customer.id)}
                            className={`w-full px-4 py-4 text-left ${
                              selectedId === customer.id
                                ? "bg-brand-light/30"
                                : "hover:bg-secondary-surface/40"
                            }`}
                          >
                            <CustomerRowSummary customer={customer} />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="hidden overflow-x-auto lg:block">
                      <table className="w-full min-w-[560px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                            <th className="px-4 py-3 font-medium">Customer</th>
                            <th className="py-3 pr-4 font-medium">Orders</th>
                            <th className="py-3 pr-4 font-medium">Active</th>
                            <th className="px-4 py-3 font-medium text-right">
                              Balance
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {filtered.map((customer) => (
                            <tr
                              key={customer.id}
                              onClick={() => setSelectedId(customer.id)}
                              className={`cursor-pointer ${
                                selectedId === customer.id
                                  ? "bg-brand-light/30"
                                  : "hover:bg-secondary-surface/40"
                              }`}
                            >
                              <td className="px-4 py-3">
                                <p className="font-medium text-foreground">
                                  {customer.name}
                                </p>
                                <p className="text-xs text-muted">{customer.phone}</p>
                              </td>
                              <td className="py-3 pr-4 text-muted">
                                {customer.totalOrders}
                              </td>
                              <td className="py-3 pr-4 text-muted">
                                {customer.activeOrders}
                              </td>
                              <td className="px-4 py-3 text-right font-medium">
                                {customer.outstandingNgn > 0 ? (
                                  <span className="text-amber-900">
                                    {formatNgn(customer.outstandingNgn)}
                                  </span>
                                ) : (
                                  <span className="text-muted">—</span>
                                )}
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
                <CustomerDetailPanel customer={selected} />
              ) : (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
                  Select a customer to view details and recent orders.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomerRowSummary({ customer }: { customer: BusinessCustomer }) {
  return (
    <>
      <p className="font-medium text-foreground">{customer.name}</p>
      <p className="text-xs text-muted">{customer.phone}</p>
      {customer.outstandingNgn > 0 ? (
        <p className="mt-1 text-xs font-semibold text-amber-900">
          {formatNgn(customer.outstandingNgn)} due
        </p>
      ) : null}
    </>
  );
}

function CustomerDetailPanel({ customer }: { customer: BusinessCustomer }) {
  const recentOrders = getCustomerRecentOrders(customer.id);

  return (
    <div className="sticky top-20 rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground">{customer.name}</h3>
      <p className="text-sm text-muted">{customer.phone}</p>
      {customer.email ? (
        <p className="text-sm text-muted">{customer.email}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {customer.portalAccess ? (
          <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-medium text-brand">
            Customer portal
          </span>
        ) : null}
        <span className="rounded-full bg-secondary-surface px-2.5 py-0.5 text-xs text-muted">
          Since {customer.registeredAt}
        </span>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <Stat label="Total orders" value={String(customer.totalOrders)} />
        <Stat label="Active" value={String(customer.activeOrders)} />
        <Stat
          label="Outstanding"
          value={
            customer.outstandingNgn > 0
              ? formatNgn(customer.outstandingNgn)
              : "None"
          }
        />
        <Stat label="Last activity" value={customer.lastActivity} />
      </dl>

      {customer.defaultAddress ? (
        <p className="mt-4 text-sm text-foreground">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            Address
          </span>
          <br />
          {customer.defaultAddress}
        </p>
      ) : null}

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Recent orders
        </p>
        <ul className="mt-2 divide-y divide-border">
          {recentOrders.map((order) => (
            <li
              key={order.orderNumber}
              className="flex items-center justify-between gap-2 py-2 text-sm"
            >
              <div>
                <p className="font-mono text-xs font-semibold text-brand">
                  {order.orderNumber}
                </p>
                <p className="text-xs text-muted">{order.status}</p>
              </div>
              <span className="font-medium">{formatNgn(order.totalNgn)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <Link
          href={`/business/orders/new?customer=${customer.id}`}
          className="inline-flex h-11 items-center justify-center rounded-full bg-brand-dark text-sm font-semibold text-white hover:opacity-90"
        >
          Create order
        </Link>
        <Link
          href="/business/orders"
          className="inline-flex h-10 items-center justify-center rounded-full border border-border text-sm font-semibold text-foreground hover:bg-secondary-surface"
        >
          All orders
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary-surface/50 px-3 py-2">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-semibold text-foreground">{value}</dd>
    </div>
  );
}
