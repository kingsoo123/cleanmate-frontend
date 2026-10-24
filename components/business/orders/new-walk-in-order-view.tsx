"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FormField } from "@/components/auth/form-field";
import {
  OrderStatusBadge,
  PaymentStateBadge,
} from "@/components/business/status-badge";
import { AuthApiError } from "@/lib/auth/api-client";
import { validateNewOrderStep } from "@/lib/business-dashboard/create-walk-in-order-preview";
import { createWalkInOrder } from "@/lib/business-dashboard/operations-api";
import { formatNgn } from "@/lib/business-dashboard/format";
import {
  lineItemTotal,
  sumLineItems,
} from "@/lib/business-dashboard/get-new-order-catalog";
import type {
  CatalogService,
  CreatedWalkInOrderPreview,
  DeliveryPreference,
  NewWalkInOrderDraft,
  OrderLineItem,
  PreviewBranch,
  PreviewCustomer,
} from "@/lib/business-dashboard/new-order-types";
import type { OrderStatus, PaymentState } from "@/lib/business-dashboard/types";

const STEPS = ["Customer", "Items", "Quotation", "Payment"] as const;

const defaultDraft = (branchId = ""): NewWalkInOrderDraft => ({
  branchId,
  customerMode: "existing",
  customerId: "",
  walkInName: "",
  walkInPhone: "",
  lineItems: [],
  deliveryPreference: "Pickup at shop",
  customerNotes: "",
  internalNotes: "",
  sendForApproval: false,
  initialPaymentNgn: 0,
  paymentMethod: "Cash",
});

export function NewWalkInOrderView({
  customers,
  services,
  branches,
  initialCustomerId = "",
}: {
  customers: PreviewCustomer[];
  services: CatalogService[];
  branches: PreviewBranch[];
  initialCustomerId?: string;
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<NewWalkInOrderDraft>(() => ({
    ...defaultDraft(branches[0]?.id ?? ""),
    customerId: initialCustomerId,
    customerMode: initialCustomerId ? "existing" : "existing",
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [created, setCreated] = useState<CreatedWalkInOrderPreview | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const [addServiceId, setAddServiceId] = useState(services[0]?.id ?? "");
  const [addQty, setAddQty] = useState(1);

  const totalNgn = useMemo(() => sumLineItems(draft.lineItems), [draft.lineItems]);

  useEffect(() => {
    if (!draft.branchId && branches[0]?.id) {
      patch({ branchId: branches[0].id });
    }
  }, [branches, draft.branchId]);

  const servicesByCategory = useMemo(() => {
    const map = new Map<string, CatalogService[]>();
    for (const service of services) {
      const list = map.get(service.category) ?? [];
      list.push(service);
      map.set(service.category, list);
    }
    return map;
  }, [services]);

  function patch(partial: Partial<NewWalkInOrderDraft>) {
    setDraft((prev) => ({ ...prev, ...partial }));
  }

  function goNext() {
    const nextErrors = validateNewOrderStep(step, draft);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  }

  function addLineItem() {
    const service = services.find((s) => s.id === addServiceId);
    if (!service) return;
    const qty = Math.max(1, addQty);
    const item: OrderLineItem = {
      id: crypto.randomUUID(),
      serviceId: service.id,
      label: `${service.category} · ${service.name}`,
      quantity: qty,
      unitPriceNgn: service.unitPriceNgn,
    };
    patch({ lineItems: [...draft.lineItems, item] });
    setErrors((e) => {
      const next = { ...e };
      delete next.lineItems;
      return next;
    });
  }

  function removeLineItem(id: string) {
    patch({ lineItems: draft.lineItems.filter((item) => item.id !== id) });
  }

  async function handleCreate() {
    const nextErrors = validateNewOrderStep(3, draft);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    setPending(true);
    setErrors({});
    setFormError(null);
    try {
      const result = await createWalkInOrder(draft);
      setCreated(result);
    } catch (error) {
      setFormError(
        error instanceof AuthApiError
          ? error.message
          : "Could not create order. Try again.",
      );
    } finally {
      setPending(false);
    }
  }

  if (created) {
    return (
      <OrderCreatedSuccess
        created={created}
        onStartAnother={() => {
          setCreated(null);
          setDraft(defaultDraft(branches[0]?.id ?? ""));
          setStep(0);
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">Front desk</p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            New walk-in order
          </h2>
        </div>
        <Link
          href="/business/orders"
          className="text-sm font-semibold text-brand hover:underline"
        >
          Cancel
        </Link>
      </div>

      <StepIndicator current={step} />

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        {formError ? (
          <p
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            {formError}
          </p>
        ) : null}
        {step === 0 ? (
          <CustomerStep
            draft={draft}
            customers={customers}
            branches={branches}
            errors={errors}
            onPatch={patch}
          />
        ) : null}
        {step === 1 ? (
          <ItemsStep
            draft={draft}
            services={services}
            servicesByCategory={servicesByCategory}
            addServiceId={addServiceId}
            addQty={addQty}
            errors={errors}
            onAddServiceIdChange={setAddServiceId}
            onAddQtyChange={setAddQty}
            onAdd={addLineItem}
            onRemove={removeLineItem}
          />
        ) : null}
        {step === 2 ? (
          <QuotationStep draft={draft} totalNgn={totalNgn} onPatch={patch} />
        ) : null}
        {step === 3 ? (
          <PaymentStep
            draft={draft}
            totalNgn={totalNgn}
            errors={errors}
            onPatch={patch}
          />
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 0}
            className="rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary-surface disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="rounded-full bg-brand-dark px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreate}
              disabled={pending}
              className="rounded-full bg-brand-dark px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "Creating…" : "Create order"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="flex flex-wrap gap-2">
      {STEPS.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li
            key={label}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              active
                ? "bg-brand text-white"
                : done
                  ? "bg-brand-light text-brand"
                  : "bg-secondary-surface text-muted"
            }`}
          >
            {index + 1}. {label}
          </li>
        );
      })}
    </ol>
  );
}

function CustomerStep({
  draft,
  customers,
  branches,
  errors,
  onPatch,
}: {
  draft: NewWalkInOrderDraft;
  customers: PreviewCustomer[];
  branches: PreviewBranch[];
  errors: Record<string, string>;
  onPatch: (partial: Partial<NewWalkInOrderDraft>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Customer</h3>
        <p className="mt-1 text-sm text-muted">
          Choose an existing customer or capture walk-in details. New accounts
          can also be added from{" "}
          <Link href="/business/customers" className="font-medium text-brand hover:underline">
            Customers
          </Link>
          .
        </p>
      </div>

      <SelectField
        label="Branch"
        name="branchId"
        required
        value={draft.branchId}
        onChange={(e) => onPatch({ branchId: e.target.value })}
        error={errors.branchId}
      >
        <option value="">Select branch…</option>
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
            {branch.address ? ` · ${branch.address}` : ""}
          </option>
        ))}
      </SelectField>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["existing", "Existing customer"],
            ["walk-in", "Walk-in guest"],
          ] as const
        ).map(([mode, label]) => (
          <button
            key={mode}
            type="button"
            onClick={() => onPatch({ customerMode: mode })}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              draft.customerMode === mode
                ? "bg-brand text-white"
                : "border border-border bg-surface text-foreground hover:bg-secondary-surface"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {draft.customerMode === "existing" ? (
        <SelectField
          label="Customer"
          name="customerId"
          required
          value={draft.customerId}
          onChange={(e) => onPatch({ customerId: e.target.value })}
          error={errors.customerId}
        >
          <option value="">Select customer…</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name} · {customer.phone}
            </option>
          ))}
        </SelectField>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            name="walkInName"
            label="Customer name"
            required
            value={draft.walkInName}
            onChange={(e) => onPatch({ walkInName: e.target.value })}
            error={errors.walkInName}
            placeholder="Full name"
          />
          <FormField
            name="walkInPhone"
            type="tel"
            label="Phone number"
            required
            value={draft.walkInPhone}
            onChange={(e) => onPatch({ walkInPhone: e.target.value })}
            error={errors.walkInPhone}
            placeholder="+234 …"
          />
        </div>
      )}
    </div>
  );
}

function ItemsStep({
  draft,
  services,
  servicesByCategory,
  addServiceId,
  addQty,
  errors,
  onAddServiceIdChange,
  onAddQtyChange,
  onAdd,
  onRemove,
}: {
  draft: NewWalkInOrderDraft;
  services: CatalogService[];
  servicesByCategory: Map<string, CatalogService[]>;
  addServiceId: string;
  addQty: number;
  errors: Record<string, string>;
  onAddServiceIdChange: (id: string) => void;
  onAddQtyChange: (qty: number) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Items & services</h3>
        <p className="mt-1 text-sm text-muted">
          Prices come from your{" "}
          <Link href="/business/services" className="font-medium text-brand hover:underline">
            Services & pricing
          </Link>{" "}
          catalog (preview).
        </p>
      </div>

      <div className="rounded-xl border border-border bg-secondary-surface/40 p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <SelectField
            label="Service"
            name="addService"
            value={addServiceId}
            onChange={(e) => onAddServiceIdChange(e.target.value)}
          >
            {[...servicesByCategory.entries()].map(([category, list]) => (
              <optgroup key={category} label={category}>
                {list.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} — {formatNgn(service.unitPriceNgn)}
                  </option>
                ))}
              </optgroup>
            ))}
          </SelectField>
          <FormField
            name="quantity"
            type="number"
            label="Qty"
            min={1}
            value={String(addQty)}
            onChange={(e) =>
              onAddQtyChange(Math.max(1, Number.parseInt(e.target.value, 10) || 1))
            }
            className="sm:w-24"
          />
          <button
            type="button"
            onClick={onAdd}
            className="h-11 rounded-full bg-brand px-5 text-sm font-semibold text-white hover:opacity-90 sm:mb-0"
          >
            Add
          </button>
        </div>
      </div>

      {errors.lineItems ? (
        <p className="text-sm text-red-600" role="alert">
          {errors.lineItems}
        </p>
      ) : null}

      {draft.lineItems.length === 0 ? (
        <p className="text-sm text-muted">No items yet. Add at least one line.</p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {draft.lineItems.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted">
                  {item.quantity} × {formatNgn(item.unitPriceNgn)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">
                  {formatNgn(lineItemTotal(item))}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="text-xs font-semibold text-red-700 hover:underline"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
          <li className="flex justify-between px-4 py-3 text-sm font-semibold text-foreground">
            <span>Subtotal</span>
            <span>{formatNgn(sumLineItems(draft.lineItems))}</span>
          </li>
        </ul>
      )}

      {services.length === 0 ? (
        <p className="text-sm text-amber-900">No services in catalog.</p>
      ) : null}
    </div>
  );
}

function QuotationStep({
  draft,
  totalNgn,
  onPatch,
}: {
  draft: NewWalkInOrderDraft;
  totalNgn: number;
  onPatch: (partial: Partial<NewWalkInOrderDraft>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Quotation</h3>
        <p className="mt-1 text-sm text-muted">
          Review totals and delivery preference before payment.
        </p>
      </div>

      <ul className="space-y-2 rounded-xl border border-border bg-secondary-surface/30 p-4 text-sm">
        {draft.lineItems.map((item) => (
          <li key={item.id} className="flex justify-between gap-2">
            <span className="text-foreground">
              {item.label}{" "}
              <span className="text-muted">× {item.quantity}</span>
            </span>
            <span className="font-medium">{formatNgn(lineItemTotal(item))}</span>
          </li>
        ))}
        <li className="flex justify-between border-t border-border pt-3 text-base font-bold text-foreground">
          <span>Total</span>
          <span>{formatNgn(totalNgn)}</span>
        </li>
      </ul>

      <SelectField
        label="Delivery"
        name="deliveryPreference"
        value={draft.deliveryPreference}
        onChange={(e) =>
          onPatch({ deliveryPreference: e.target.value as DeliveryPreference })
        }
      >
        <option value="Pickup at shop">Pickup at shop</option>
        <option value="Home delivery">Home delivery</option>
      </SelectField>

      <FormField
        name="customerNotes"
        label="Note for customer (optional)"
        value={draft.customerNotes}
        onChange={(e) => onPatch({ customerNotes: e.target.value })}
        placeholder="Shown on receipt / app"
      />
      <FormField
        name="internalNotes"
        label="Internal note (optional)"
        value={draft.internalNotes}
        onChange={(e) => onPatch({ internalNotes: e.target.value })}
        placeholder="Staff only"
      />
    </div>
  );
}

function PaymentStep({
  draft,
  totalNgn,
  errors,
  onPatch,
}: {
  draft: NewWalkInOrderDraft;
  totalNgn: number;
  errors: Record<string, string>;
  onPatch: (partial: Partial<NewWalkInOrderDraft>) => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Payment & activation</h3>
        <p className="mt-1 text-sm text-muted">
          Record approval and any initial payment, then activate the order for
          processing.
        </p>
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-secondary-surface/30 p-4">
        <input
          type="checkbox"
          checked={draft.sendForApproval}
          onChange={(e) =>
            onPatch({
              sendForApproval: e.target.checked,
              initialPaymentNgn: e.target.checked ? 0 : draft.initialPaymentNgn,
            })
          }
          className="mt-1 h-4 w-4 rounded border-border text-brand focus:ring-brand"
        />
        <span className="text-sm text-foreground">
          <span className="font-semibold">Send quotation for customer approval</span>
          <span className="mt-1 block text-muted">
            Use for app customers or when the customer will confirm later. Order
            stays in quotation until they approve.
          </span>
        </span>
      </label>

      {!draft.sendForApproval ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            name="initialPaymentNgn"
            type="number"
            label="Initial payment (₦)"
            min={0}
            max={totalNgn}
            value={String(draft.initialPaymentNgn)}
            onChange={(e) =>
              onPatch({
                initialPaymentNgn: Math.max(
                  0,
                  Number.parseInt(e.target.value, 10) || 0,
                ),
              })
            }
            error={errors.initialPaymentNgn}
          />
          <SelectField
            label="Payment method"
            name="paymentMethod"
            value={draft.paymentMethod}
            onChange={(e) =>
              onPatch({
                paymentMethod: e.target.value as NewWalkInOrderDraft["paymentMethod"],
              })
            }
          >
            <option value="Cash">Cash</option>
            <option value="Bank transfer">Bank transfer</option>
            <option value="POS">POS</option>
          </SelectField>
        </div>
      ) : null}

      <p className="text-sm text-muted">
        Quotation total:{" "}
        <span className="font-semibold text-foreground">{formatNgn(totalNgn)}</span>
      </p>
    </div>
  );
}

function SelectField({
  label,
  name,
  error,
  children,
  ...selectProps
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const id = selectProps.id ?? name;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
        {selectProps.required ? (
          <span className="text-brand" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </label>
      <select
        {...selectProps}
        id={id}
        name={name}
        className={`w-full rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 ${
          error ? "border-red-400" : "border-border"
        }`}
      >
        {children}
      </select>
      {error ? (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function OrderCreatedSuccess({
  created,
  onStartAnother,
}: {
  created: CreatedWalkInOrderPreview;
  onStartAnother: () => void;
}) {
  const status = created.statusLabel as OrderStatus;
  const payment = created.paymentLabel as PaymentState;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-center shadow-sm sm:p-8">
        <p className="text-sm font-semibold text-emerald-900">Order created</p>
        <p className="mt-2 font-mono text-2xl font-bold text-foreground">
          {created.orderNumber}
        </p>
        <p className="mt-2 text-sm text-foreground">{created.customerLabel}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <OrderStatusBadge status={status} />
          <PaymentStateBadge state={payment} />
        </div>
        <dl className="mt-6 grid grid-cols-3 gap-3 text-left text-sm">
          <div>
            <dt className="text-xs text-muted">Total</dt>
            <dd className="font-semibold">{formatNgn(created.totalNgn)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Paid</dt>
            <dd className="font-semibold">{formatNgn(created.paidNgn)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Due</dt>
            <dd className="font-semibold">{formatNgn(created.outstandingNgn)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-muted">
          Saved on this device only (preview). Connect the API to persist orders
          and sync with the orders list.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/business/orders"
          className="inline-flex h-11 items-center justify-center rounded-full bg-brand-dark px-5 text-sm font-semibold text-white hover:opacity-90"
        >
          View orders
        </Link>
        <button
          type="button"
          onClick={onStartAnother}
          className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-surface px-5 text-sm font-semibold text-foreground hover:bg-secondary-surface"
        >
          Create another
        </button>
      </div>
    </div>
  );
}
