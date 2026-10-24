import type { CustomerDashboardData } from "@/lib/customer-dashboard/types";

/** @deprecated Client loads `/customer/dashboard` via JWT. */
export async function getCustomerDashboardData(): Promise<CustomerDashboardData> {
  return {
    customerName: "Customer",
    preferredLaundry: "Your laundry",
    isPreviewData: true,
    summary: {
      activeOrders: 0,
      readyOrders: 0,
      outstandingNgn: 0,
      openPickups: 0,
    },
    featuredOrder: null,
    pickupRequests: [],
    recentOrders: [],
    recentPayments: [],
  };
}
