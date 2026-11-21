import type {
  BusinessPaymentRecord,
  OutstandingOrderForPayment,
  PaymentListFilter,
  PaymentsSummary,
} from "@/lib/business-dashboard/payments-types";

/** Server placeholder; client loads via JWT. */
export async function getBusinessPaymentsData(): Promise<{
  payments: BusinessPaymentRecord[];
  outstandingOrders: OutstandingOrderForPayment[];
  summary: PaymentsSummary;
}> {
  const payments: BusinessPaymentRecord[] = [];
  const outstandingOrders: OutstandingOrderForPayment[] = [];
  return {
    payments,
    outstandingOrders,
    summary: computeSummary(payments, outstandingOrders),
  };
}


function isRecordedToday(recordedAt: string): boolean {
  const parsed = Date.parse(recordedAt);
  if (Number.isNaN(parsed)) return recordedAt.startsWith("Today");
  return new Date(parsed).toDateString() === new Date().toDateString();
}

function isRecordedThisWeek(recordedAt: string): boolean {
  const parsed = Date.parse(recordedAt);
  if (Number.isNaN(parsed)) {
    return (
      recordedAt.startsWith("Today") ||
      recordedAt.startsWith("Yesterday") ||
      recordedAt.startsWith("Mon")
    );
  }
  const date = new Date(parsed);
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  return date >= weekAgo;
}

function computeSummary(
  payments: BusinessPaymentRecord[] | undefined,
  outstanding: OutstandingOrderForPayment[] | undefined,
): PaymentsSummary {
  const rows = payments ?? [];
  const openOrders = outstanding ?? [];
  const receivedTodayNgn = rows
    .filter((p) => p.status === "Recorded" && isRecordedToday(p.recordedAt))
    .reduce((s, p) => s + p.amountNgn, 0);
  const paymentsTodayCount = rows.filter(
    (p) => p.status === "Recorded" && isRecordedToday(p.recordedAt),
  ).length;
  const receivedThisWeekNgn = rows
    .filter(
      (p) => p.status === "Recorded" && isRecordedThisWeek(p.recordedAt),
    )
    .reduce((s, p) => s + p.amountNgn, 0);
  const outstandingOrdersNgn = openOrders.reduce(
    (s, o) => s + o.outstandingNgn,
    0,
  );
  return {
    receivedTodayNgn,
    receivedThisWeekNgn,
    outstandingOrdersNgn,
    paymentsTodayCount,
  };
}

export function parsePaymentListFilter(
  value: string | undefined,
): PaymentListFilter {
  const allowed: PaymentListFilter[] = ["all", "today", "cash", "transfer"];
  if (value && allowed.includes(value as PaymentListFilter)) {
    return value as PaymentListFilter;
  }
  return "all";
}

export function paymentMatchesFilter(
  payment: BusinessPaymentRecord,
  filter: PaymentListFilter,
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "today":
      return isRecordedToday(payment.recordedAt);
    case "cash":
      return payment.method === "Cash";
    case "transfer":
      return (
        payment.method === "Bank transfer" ||
        payment.status === "Pending verification"
      );
    default:
      return true;
  }
}

export function filterPaymentsList(
  payments: BusinessPaymentRecord[],
  options: { filter: PaymentListFilter; query: string },
): BusinessPaymentRecord[] {
  const q = options.query.trim().toLowerCase();
  return payments.filter((payment) => {
    if (!paymentMatchesFilter(payment, options.filter)) return false;
    if (!q) return true;
    return (
      payment.reference.toLowerCase().includes(q) ||
      payment.orderNumber.toLowerCase().includes(q) ||
      payment.customerName.toLowerCase().includes(q)
    );
  });
}

export function countPaymentsByFilter(
  payments: BusinessPaymentRecord[],
): Record<PaymentListFilter, number> {
  const filters: PaymentListFilter[] = ["all", "today", "cash", "transfer"];
  return Object.fromEntries(
    filters.map((filter) => [
      filter,
      payments.filter((p) => paymentMatchesFilter(p, filter)).length,
    ]),
  ) as Record<PaymentListFilter, number>;
}

export function recomputeSummary(
  payments: BusinessPaymentRecord[] | undefined,
  outstanding: OutstandingOrderForPayment[] | undefined,
): PaymentsSummary {
  return computeSummary(payments, outstanding);
}
