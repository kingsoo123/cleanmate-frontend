import type {
  BusinessPaymentRecord,
  OutstandingOrderForPayment,
  PaymentListFilter,
  PaymentsSummary,
} from "@/lib/business-dashboard/payments-types";

/** Replace with API/DB when payments ledger is connected. */
export async function getBusinessPaymentsData(): Promise<{
  payments: BusinessPaymentRecord[];
  outstandingOrders: OutstandingOrderForPayment[];
  summary: PaymentsSummary;
}> {
  const outstandingOrders = previewOutstanding;
  const payments = previewPayments;
  return {
    payments,
    outstandingOrders,
    summary: computeSummary(payments, outstandingOrders),
  };
}

const previewOutstanding: OutstandingOrderForPayment[] = [
  {
    orderId: "o1",
    orderNumber: "LD-10482",
    customerName: "Ada Okonkwo",
    totalNgn: 45_000,
    paidNgn: 30_000,
    outstandingNgn: 15_000,
  },
  {
    orderId: "o2",
    orderNumber: "LD-10480",
    customerName: "Tunde Bakare",
    totalNgn: 18_500,
    paidNgn: 10_000,
    outstandingNgn: 8_500,
  },
  {
    orderId: "o5",
    orderNumber: "LD-10475",
    customerName: "Blessing Adeyemi",
    totalNgn: 38_000,
    paidNgn: 0,
    outstandingNgn: 38_000,
  },
  {
    orderId: "o6",
    orderNumber: "LD-10471",
    customerName: "Chidi Nwosu",
    totalNgn: 32_500,
    paidNgn: 0,
    outstandingNgn: 32_500,
  },
  {
    orderId: "o7",
    orderNumber: "LD-10465",
    customerName: "Walk-in — Ibrahim Bello",
    totalNgn: 28_000,
    paidNgn: 0,
    outstandingNgn: 28_000,
  },
];

const previewPayments: BusinessPaymentRecord[] = [
  {
    id: "pay1",
    reference: "PAY-8821",
    orderNumber: "LD-10479",
    customerName: "Fatima Yusuf",
    amountNgn: 62_000,
    method: "Bank transfer",
    status: "Recorded",
    recordedAt: "Today · 09:52",
    recordedBy: "Front desk",
    note: null,
  },
  {
    id: "pay2",
    reference: "PAY-8820",
    orderNumber: "LD-10480",
    customerName: "Tunde Bakare",
    amountNgn: 10_000,
    method: "Cash",
    status: "Recorded",
    recordedAt: "Today · 10:05",
    recordedBy: "Front desk",
    note: "Partial payment",
  },
  {
    id: "pay3",
    reference: "PAY-8818",
    orderNumber: "LD-10478",
    customerName: "Helen Chu",
    amountNgn: 24_000,
    method: "Cash",
    status: "Recorded",
    recordedAt: "Today · 08:40",
    recordedBy: "Manager",
    note: null,
  },
  {
    id: "pay4",
    reference: "PAY-8812",
    orderNumber: "LD-10482",
    customerName: "Ada Okonkwo",
    amountNgn: 30_000,
    method: "Bank transfer",
    status: "Recorded",
    recordedAt: "Yesterday · 16:20",
    recordedBy: "Front desk",
    note: "Transfer ref 99281",
  },
  {
    id: "pay5",
    reference: "PAY-8809",
    orderNumber: "LD-10477",
    customerName: "James Okafor",
    amountNgn: 27_000,
    method: "POS",
    status: "Recorded",
    recordedAt: "Yesterday · 11:00",
    recordedBy: "Front desk",
    note: null,
  },
  {
    id: "pay6",
    reference: "PAY-8801",
    orderNumber: "LD-10460",
    customerName: "Grace Eze",
    amountNgn: 10_000,
    method: "Bank transfer",
    status: "Pending verification",
    recordedAt: "Mon · 14:05",
    recordedBy: "Front desk",
    note: "Awaiting bank confirmation",
  },
  {
    id: "pay7",
    reference: "PAY-8795",
    orderNumber: "LD-10455",
    customerName: "Helen Chu",
    amountNgn: 18_000,
    method: "Cash",
    status: "Recorded",
    recordedAt: "8 Oct",
    recordedBy: "Driver · Samuel K.",
    note: "Cash on delivery",
  },
];

function computeSummary(
  payments: BusinessPaymentRecord[],
  outstanding: OutstandingOrderForPayment[],
): PaymentsSummary {
  const receivedTodayNgn = payments
    .filter((p) => p.recordedAt.startsWith("Today"))
    .reduce((s, p) => s + p.amountNgn, 0);
  const paymentsTodayCount = payments.filter((p) =>
    p.recordedAt.startsWith("Today"),
  ).length;
  const receivedThisWeekNgn = payments
    .filter(
      (p) =>
        p.recordedAt.startsWith("Today") ||
        p.recordedAt.startsWith("Yesterday") ||
        p.recordedAt.startsWith("Mon"),
    )
    .reduce((s, p) => s + p.amountNgn, 0);
  const outstandingOrdersNgn = outstanding.reduce(
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
      return payment.recordedAt.startsWith("Today");
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
  payments: BusinessPaymentRecord[],
  outstanding: OutstandingOrderForPayment[],
): PaymentsSummary {
  return computeSummary(payments, outstanding);
}
