import type {
  ReportPeriod,
  ReportsSnapshot,
} from "@/lib/business-dashboard/reports-types";

function emptySnapshot(period: ReportPeriod): ReportsSnapshot {
  return {
    period,
    periodLabel: "—",
    financial: {
      recordedRevenueNgn: 0,
      paymentsReceivedNgn: 0,
      outstandingBalancesNgn: 0,
      orderValueNgn: 0,
      revenueTrend: "—",
    },
    paymentMethods: [],
    operations: {
      ordersCompleted: 0,
      ordersActive: 0,
      ordersCancelled: 0,
      pickupsCompleted: 0,
      deliveriesCompleted: 0,
      newCustomers: 0,
    },
    topCustomersByPayments: [],
  };
}

/** @deprecated Use fetchBusinessReports() from reports-api.ts */
export async function getBusinessReportsData(
  period: ReportPeriod = "today",
): Promise<ReportsSnapshot> {
  return emptySnapshot(period);
}

export function parseReportPeriod(value: string | undefined): ReportPeriod {
  if (value === "week" || value === "month") return value;
  return "today";
}

export function buildReportsCsv(snapshot: ReportsSnapshot): string {
  const lines = [
    `Washuply report,${snapshot.periodLabel}`,
    "",
    "Financial",
    `Recorded revenue,${snapshot.financial.recordedRevenueNgn}`,
    `Payments received,${snapshot.financial.paymentsReceivedNgn}`,
    `Outstanding balances,${snapshot.financial.outstandingBalancesNgn}`,
    `Order value,${snapshot.financial.orderValueNgn}`,
    "",
    "Payment methods",
    "Method,Amount (NGN),Share %",
    ...snapshot.paymentMethods.map(
      (row) => `${row.method},${row.amountNgn},${row.sharePercent}`,
    ),
    "",
    "Operations",
    ...Object.entries(snapshot.operations).map(([key, val]) => `${key},${val}`),
  ];
  return lines.join("\n");
}