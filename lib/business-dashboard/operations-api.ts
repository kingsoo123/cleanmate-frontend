import { apiFetch } from "@/lib/api/http";
import type { BusinessOrderListRow } from "@/lib/business-dashboard/orders-types";
import type {
  CatalogService,
  CreatedWalkInOrderPreview,
  NewWalkInOrderDraft,
  PreviewCustomer,
} from "@/lib/business-dashboard/new-order-types";
import type {
  BusinessPickupRequest,
  PickupAssignRider,
} from "@/lib/business-dashboard/pickups-types";

export function fetchBusinessPickups() {
  return apiFetch<{
    pickups: BusinessPickupRequest[];
    riders: PickupAssignRider[];
  }>("/business/pickups");
}

export function updateBusinessPickup(
  id: string,
  payload: {
    action:
      | "accept"
      | "decline"
      | "assign"
      | "en_route"
      | "collected"
      | "received"
      | "convert";
    assignedRiderId?: string;
  },
) {
  return apiFetch<BusinessPickupRequest>(`/business/pickups/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function fetchBusinessOrders() {
  return apiFetch<BusinessOrderListRow[]>("/business/orders");
}

export function fetchBusinessOrder(orderId: string) {
  return apiFetch<BusinessOrderListRow>(`/business/orders/${orderId}`);
}

export function fetchNewOrderCatalog() {
  return apiFetch<{
    customers: PreviewCustomer[];
    services: CatalogService[];
  }>("/business/orders/catalog");
}

export function createWalkInOrder(draft: NewWalkInOrderDraft) {
  return apiFetch<CreatedWalkInOrderPreview>("/business/orders/walk-in", {
    method: "POST",
    body: JSON.stringify({
      customerMode: draft.customerMode,
      customerId: draft.customerMode === "existing" ? draft.customerId : undefined,
      walkInName: draft.customerMode === "walk-in" ? draft.walkInName : undefined,
      walkInPhone: draft.customerMode === "walk-in" ? draft.walkInPhone : undefined,
      lineItems: draft.lineItems.map((item) => ({
        serviceId: item.serviceId,
        label: item.label,
        quantity: item.quantity,
        unitPriceNgn: item.unitPriceNgn,
      })),
      deliveryPreference: draft.deliveryPreference,
      customerNotes: draft.customerNotes || undefined,
      internalNotes: draft.internalNotes || undefined,
      sendForApproval: draft.sendForApproval,
      initialPaymentNgn: draft.initialPaymentNgn,
      paymentMethod: draft.paymentMethod,
    }),
  });
}

export function fetchBusinessPaymentsLedger() {
  return apiFetch<{
    payments: {
      id: string;
      orderNumber: string;
      customerName: string;
      amountNgn: number;
      method: string;
      recordedAt: string;
    }[];
    outstanding: unknown[];
  }>("/business/payments").then((bundle) => bundle.payments);
}
