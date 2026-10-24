import { apiFetch } from "@/lib/api/http";
import type {
  BusinessPaymentRecord,
  OutstandingOrderForPayment,
} from "@/lib/business-dashboard/payments-types";

export type BusinessPaymentsBundle = {
  payments: BusinessPaymentRecord[];
  outstanding: OutstandingOrderForPayment[];
};

export function fetchBusinessPaymentsBundle() {
  return apiFetch<BusinessPaymentsBundle | BusinessPaymentRecord[]>(
    "/business/payments",
  ).then((data) => {
    if (Array.isArray(data)) {
      return { payments: data, outstanding: [] as OutstandingOrderForPayment[] };
    }
    return {
      payments: data.payments ?? [],
      outstanding: data.outstanding ?? [],
    };
  });
}

export function recordBusinessPayment(payload: {
  orderId: string;
  amountNgn: number;
  method: string;
  note?: string;
}) {
  return apiFetch<BusinessPaymentRecord>("/business/payments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function verifyBusinessPayment(paymentId: string) {
  return apiFetch<BusinessPaymentRecord>(
    `/business/payments/${paymentId}/verify`,
    { method: "PATCH" },
  );
}
