import { sumLineItems } from "@/lib/business-dashboard/get-new-order-catalog";
import type {
  CreatedWalkInOrderPreview,
  NewWalkInOrderDraft,
  PreviewCustomer,
} from "@/lib/business-dashboard/new-order-types";
import { validatePhone } from "@/lib/auth/validation";

export function resolveCustomerLabel(
  draft: NewWalkInOrderDraft,
  customers: PreviewCustomer[],
): string {
  if (draft.customerMode === "walk-in") {
    const name = draft.walkInName.trim();
    return name ? `Walk-in — ${name}` : "Walk-in customer";
  }
  const match = customers.find((c) => c.id === draft.customerId);
  return match?.name ?? "Customer";
}

export function validateNewOrderStep(
  step: number,
  draft: NewWalkInOrderDraft,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (step === 0) {
    if (!draft.branchId) {
      errors.branchId = "Select a branch for this order.";
    }
    if (draft.customerMode === "existing") {
      if (!draft.customerId) {
        errors.customerId = "Select a customer.";
      }
    } else {
      if (!draft.walkInName.trim()) {
        errors.walkInName = "Name is required for walk-in customers.";
      }
      if (!draft.walkInPhone.trim()) {
        errors.walkInPhone = "Phone number is required.";
      } else if (!validatePhone(draft.walkInPhone.trim())) {
        errors.walkInPhone = "Enter a valid phone number.";
      }
    }
  }

  if (step === 1) {
    if (draft.lineItems.length === 0) {
      errors.lineItems = "Add at least one item or service.";
    }
  }

  if (step === 3) {
    const total = sumLineItems(draft.lineItems);
    if (draft.initialPaymentNgn < 0) {
      errors.initialPaymentNgn = "Payment cannot be negative.";
    } else if (draft.initialPaymentNgn > total) {
      errors.initialPaymentNgn = "Payment cannot exceed the quotation total.";
    }
    if (!draft.sendForApproval && draft.initialPaymentNgn <= 0 && total > 0) {
      errors.initialPaymentNgn =
        "Record an initial payment or send the quotation for approval.";
    }
  }

  return errors;
}

export function createWalkInOrderPreview(
  draft: NewWalkInOrderDraft,
  customers: PreviewCustomer[],
): CreatedWalkInOrderPreview {
  const totalNgn = sumLineItems(draft.lineItems);
  const paidNgn = Math.min(draft.initialPaymentNgn, totalNgn);
  const outstandingNgn = Math.max(0, totalNgn - paidNgn);

  let statusLabel = "Active";
  let paymentLabel = "Unpaid";

  if (draft.sendForApproval) {
    statusLabel = "Awaiting Customer Approval";
    paymentLabel = paidNgn > 0 ? "Partially Paid" : "Unpaid";
  } else if (paidNgn <= 0 && totalNgn > 0) {
    statusLabel = "Awaiting Initial Payment";
    paymentLabel = "Unpaid";
  } else if (outstandingNgn > 0) {
    statusLabel = "Active";
    paymentLabel = "Partially Paid";
  } else if (totalNgn > 0) {
    statusLabel = "Active";
    paymentLabel = "Fully Paid";
  } else {
    statusLabel = "Draft";
    paymentLabel = "Unpaid";
  }

  const suffix = Math.floor(10000 + Math.random() * 90000);

  return {
    orderNumber: `LD-${suffix}`,
    orderId: crypto.randomUUID(),
    customerLabel: resolveCustomerLabel(draft, customers),
    totalNgn,
    paidNgn,
    outstandingNgn,
    statusLabel,
    paymentLabel,
  };
}
