"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthApiError } from "@/lib/auth/api-client";
import {
  createCatalogService,
  deleteCatalogService,
  fetchCatalogServices,
  updateCatalogService,
} from "@/lib/business-dashboard/catalog-api";
import { formatNgn } from "@/lib/business-dashboard/format";
import type { CatalogService } from "@/lib/business-dashboard/new-order-types";

type ServiceDraft = {
  category: string;
  name: string;
  unitPriceNgn: string;
};

function groupByCategory(services: CatalogService[]) {
  const map = new Map<string, CatalogService[]>();
  for (const service of services) {
    const list = map.get(service.category) ?? [];
    list.push(service);
    map.set(service.category, list);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function parsePriceNgn(raw: string): number | null {
  const trimmed = raw.replace(/,/g, "").trim();
  if (!trimmed) return null;
  const value = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(value) || value < 1) return null;
  return value;
}

export function ServicesPricingView() {
  const [services, setServices] = useState<CatalogService[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [addDraft, setAddDraft] = useState<ServiceDraft>({
    category: "",
    name: "",
    unitPriceNgn: "",
  });
  const [addPending, setAddPending] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<ServiceDraft>({
    category: "",
    name: "",
    unitPriceNgn: "",
  });
  const [editPending, setEditPending] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const list = await fetchCatalogServices();
      setServices(list);
    } catch (err) {
      setLoadError(
        err instanceof AuthApiError ? err.message : "Could not load catalog.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const categories = useMemo(() => {
    const set = new Set(services.map((s) => s.category));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [services]);

  const grouped = useMemo(() => groupByCategory(services), [services]);

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    setAddError(null);
    const category = addDraft.category.trim();
    const name = addDraft.name.trim();
    const unitPriceNgn = parsePriceNgn(addDraft.unitPriceNgn);
    if (!category) {
      setAddError("Enter a service category (e.g. Wash & iron).");
      return;
    }
    if (!name) {
      setAddError("Enter an item name.");
      return;
    }
    if (unitPriceNgn === null) {
      setAddError("Enter a valid price in Naira.");
      return;
    }

    setAddPending(true);
    try {
      const created = await createCatalogService({
        category,
        name,
        unitPriceNgn,
      });
      setServices((prev) =>
        [...prev, created].sort(
          (a, b) =>
            a.category.localeCompare(b.category) || a.name.localeCompare(b.name),
        ),
      );
      setAddDraft({ category, name: "", unitPriceNgn: "" });
    } catch (err) {
      setAddError(
        err instanceof AuthApiError ? err.message : "Could not add item.",
      );
    } finally {
      setAddPending(false);
    }
  }

  function startEdit(service: CatalogService) {
    setEditingId(service.id);
    setEditError(null);
    setEditDraft({
      category: service.category,
      name: service.name,
      unitPriceNgn: String(service.unitPriceNgn),
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError(null);
  }

  async function saveEdit(serviceId: string) {
    setEditError(null);
    const category = editDraft.category.trim();
    const name = editDraft.name.trim();
    const unitPriceNgn = parsePriceNgn(editDraft.unitPriceNgn);
    if (!category || !name || unitPriceNgn === null) {
      setEditError("Category, name, and price are required.");
      return;
    }

    setEditPending(true);
    try {
      const updated = await updateCatalogService(serviceId, {
        category,
        name,
        unitPriceNgn,
      });
      setServices((prev) =>
        prev
          .map((row) => (row.id === serviceId ? updated : row))
          .sort(
            (a, b) =>
              a.category.localeCompare(b.category) ||
              a.name.localeCompare(b.name),
          ),
      );
      setEditingId(null);
    } catch (err) {
      setEditError(
        err instanceof AuthApiError ? err.message : "Could not save changes.",
      );
    } finally {
      setEditPending(false);
    }
  }

  async function handleDelete(service: CatalogService) {
    const ok = window.confirm(
      `Remove “${service.name}” from your catalog? Existing orders keep their saved line prices.`,
    );
    if (!ok) return;

    setDeletingId(service.id);
    try {
      await deleteCatalogService(service.id);
      setServices((prev) => prev.filter((row) => row.id !== service.id));
      if (editingId === service.id) setEditingId(null);
    } catch (err) {
      window.alert(
        err instanceof AuthApiError ? err.message : "Could not delete item.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">Catalog</p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Services & pricing
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Laundry service types, clothing categories, and per-item prices used
            when you build walk-in quotations and orders.
          </p>
        </div>
        <Link
          href="/business/orders/new"
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-border bg-surface px-5 text-sm font-semibold text-foreground hover:bg-secondary-surface/60"
        >
          New walk-in order
        </Link>
      </div>

      {loadError ? (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {loadError}
        </p>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <form
            onSubmit={(e) => void handleAdd(e)}
            className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-foreground">Add item</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Group items under a category (service type). The same item name can
              appear in different categories with different prices.
            </p>
            <div className="mt-4 space-y-3">
              <label className="block text-xs font-medium text-muted">
                Category / service type
                <input
                  list="catalog-categories"
                  value={addDraft.category}
                  onChange={(e) =>
                    setAddDraft((prev) => ({ ...prev, category: e.target.value }))
                  }
                  placeholder="e.g. Wash & iron"
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </label>
              <datalist id="catalog-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <label className="block text-xs font-medium text-muted">
                Item name
                <input
                  value={addDraft.name}
                  onChange={(e) =>
                    setAddDraft((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Shirt"
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </label>
              <label className="block text-xs font-medium text-muted">
                Unit price (₦)
                <input
                  inputMode="numeric"
                  value={addDraft.unitPriceNgn}
                  onChange={(e) =>
                    setAddDraft((prev) => ({
                      ...prev,
                      unitPriceNgn: e.target.value,
                    }))
                  }
                  placeholder="800"
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </label>
            </div>
            {addError ? (
              <p className="mt-3 text-xs text-red-700" role="alert">
                {addError}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={addPending}
              className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-brand-dark text-sm font-semibold text-white disabled:opacity-60"
            >
              {addPending ? "Adding…" : "Add to catalog"}
            </button>
          </form>
        </div>

        <div className="space-y-5 xl:col-span-3">
          {loading ? (
            <p className="text-sm text-muted">Loading catalog…</p>
          ) : grouped.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-muted">
              No items yet. Add your first service on the left.
            </p>
          ) : (
            grouped.map(([category, items]) => (
              <section
                key={category}
                className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
              >
                <header className="border-b border-border bg-secondary-surface/40 px-4 py-3 sm:px-5">
                  <h3 className="text-sm font-semibold text-foreground">
                    {category}
                  </h3>
                  <p className="text-xs text-muted">
                    {items.length} item{items.length === 1 ? "" : "s"}
                  </p>
                </header>
                <ul className="divide-y divide-border">
                  {items.map((service) => {
                    const isEditing = editingId === service.id;
                    return (
                      <li
                        key={service.id}
                        className="px-4 py-3 sm:px-5 sm:py-3.5"
                      >
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              list="catalog-categories-edit"
                              value={editDraft.category}
                              onChange={(e) =>
                                setEditDraft((prev) => ({
                                  ...prev,
                                  category: e.target.value,
                                }))
                              }
                              className="w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
                            />
                            <datalist id="catalog-categories-edit">
                              {categories.map((c) => (
                                <option key={c} value={c} />
                              ))}
                            </datalist>
                            <input
                              value={editDraft.name}
                              onChange={(e) =>
                                setEditDraft((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                              className="w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
                            />
                            <input
                              inputMode="numeric"
                              value={editDraft.unitPriceNgn}
                              onChange={(e) =>
                                setEditDraft((prev) => ({
                                  ...prev,
                                  unitPriceNgn: e.target.value,
                                }))
                              }
                              className="w-full rounded-lg border border-border px-2.5 py-1.5 text-sm"
                            />
                            {editError ? (
                              <p className="text-xs text-red-700">{editError}</p>
                            ) : null}
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={editPending}
                                onClick={() => void saveEdit(service.id)}
                                className="rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                              >
                                {editPending ? "Saving…" : "Save"}
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="rounded-full px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {service.name}
                              </p>
                              <p className="text-xs text-muted">
                                {formatNgn(service.unitPriceNgn)} per item
                              </p>
                            </div>
                            <div className="flex shrink-0 gap-2">
                              <button
                                type="button"
                                onClick={() => startEdit(service)}
                                className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary-surface/60"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                disabled={deletingId === service.id}
                                onClick={() => void handleDelete(service)}
                                className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                              >
                                {deletingId === service.id ? "Removing…" : "Remove"}
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
}