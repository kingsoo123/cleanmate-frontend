import type { BusinessDashboardData } from "@/lib/business-dashboard/types";

/** @deprecated Use fetchBusinessDashboard() from dashboard-api.ts */
export async function getBusinessDashboardData(): Promise<BusinessDashboardData> {
  return {
    businessName: "",
    periodLabel: "—",
    isPreviewData: false,
    financial: {
      revenueTodayNgn: 0,
      paymentsReceivedNgn: 0,
      outstandingBalancesNgn: 0,
      orderValueThisWeekNgn: 0,
    },
    operational: {
      totalOrders: 0,
      activeOrders: 0,
      draftRequests: 0,
      pickupsAwaitingReview: 0,
      pickupsInProgress: 0,
      awaitingProcessing: 0,
      inProcessing: 0,
      awaitingQualityCheck: 0,
      readyForCollection: 0,
      awaitingDelivery: 0,
      completedToday: 0,
      cancelled: 0,
    },
    attentionOrders: [],
    processingStages: [],
    recentOrders: [],
    driverJobs: [],
    recentPayments: [],
  };
}