import type {
  ReportPeriod,
  ReportsSnapshot,
} from "@/lib/business-dashboard/reports-types";

const snapshots: Record<ReportPeriod, ReportsSnapshot> = {
  today: {
    period: "today",
    periodLabel: "Today · 17 Oct 2026",
    financial: {
      recordedRevenueNgn: 248_500,
      paymentsReceivedNgn: 186_000,
      outstandingBalancesNgn: 412_750,
      orderValueNgn: 312_000,
      revenueTrend: "+12% vs yesterday",
    },
    paymentMethods: [
      { method: "Cash", amountNgn: 78_000, sharePercent: 42 },
      { method: "Bank transfer", amountNgn: 72_000, sharePercent: 39 },
      { method: "POS", amountNgn: 36_000, sharePercent: 19 },
    ],
    operations: {
      ordersCompleted: 18,
      ordersActive: 47,
      ordersCancelled: 2,
      pickupsCompleted: 5,
      deliveriesCompleted: 4,
      newCustomers: 3,
    },
    topCustomersByPayments: [
      { customerName: "Fatima Yusuf", amountNgn: 62_000 },
      { customerName: "Ada Okonkwo", amountNgn: 30_000 },
      { customerName: "Tunde Bakare", amountNgn: 10_000 },
    ],
  },
  week: {
    period: "week",
    periodLabel: "This week · 13–17 Oct 2026",
    financial: {
      recordedRevenueNgn: 1_240_000,
      paymentsReceivedNgn: 986_000,
      outstandingBalancesNgn: 412_750,
      orderValueNgn: 1_840_000,
      revenueTrend: "+8% vs prior week",
    },
    paymentMethods: [
      { method: "Cash", amountNgn: 412_000, sharePercent: 42 },
      { method: "Bank transfer", amountNgn: 384_000, sharePercent: 39 },
      { method: "POS", amountNgn: 190_000, sharePercent: 19 },
    ],
    operations: {
      ordersCompleted: 86,
      ordersActive: 47,
      ordersCancelled: 9,
      pickupsCompleted: 28,
      deliveriesCompleted: 22,
      newCustomers: 11,
    },
    topCustomersByPayments: [
      { customerName: "Fatima Yusuf", amountNgn: 124_000 },
      { customerName: "James Okafor", amountNgn: 81_000 },
      { customerName: "Ada Okonkwo", amountNgn: 75_000 },
    ],
  },
  month: {
    period: "month",
    periodLabel: "October 2026 (month to date)",
    financial: {
      recordedRevenueNgn: 4_820_000,
      paymentsReceivedNgn: 4_105_000,
      outstandingBalancesNgn: 412_750,
      orderValueNgn: 5_640_000,
      revenueTrend: "+5% vs Sep MTD",
    },
    paymentMethods: [
      { method: "Cash", amountNgn: 1_724_000, sharePercent: 42 },
      { method: "Bank transfer", amountNgn: 1_601_000, sharePercent: 39 },
      { method: "POS", amountNgn: 780_000, sharePercent: 19 },
    ],
    operations: {
      ordersCompleted: 342,
      ordersActive: 47,
      ordersCancelled: 24,
      pickupsCompleted: 118,
      deliveriesCompleted: 96,
      newCustomers: 38,
    },
    topCustomersByPayments: [
      { customerName: "Blessing Adeyemi", amountNgn: 210_000 },
      { customerName: "Fatima Yusuf", amountNgn: 186_000 },
      { customerName: "Helen Chu", amountNgn: 142_000 },
    ],
  },
};

/** Replace with aggregated API/DB queries when reporting is connected. */
export async function getBusinessReportsData(
  period: ReportPeriod = "today",
): Promise<ReportsSnapshot> {
  return snapshots[period];
}

export function parseReportPeriod(value: string | undefined): ReportPeriod {
  if (value === "week" || value === "month") return value;
  return "today";
}

export function buildReportsCsv(snapshot: ReportsSnapshot): string {
  const lines = [
    `CleanMate report,${snapshot.periodLabel}`,
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
