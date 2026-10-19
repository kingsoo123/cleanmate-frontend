import { previewCustomerOrders } from "@/lib/customer-dashboard/customer-orders-preview";
import { previewCustomerPaymentHistory } from "@/lib/customer-dashboard/customer-payments-preview";
import { previewCustomerProfile } from "@/lib/customer-dashboard/customer-profile-preview";
import type { CustomerDashboardData } from "@/lib/customer-dashboard/types";

/** Replace with API/DB queries when customer auth is connected. */
export async function getCustomerDashboardData(): Promise<CustomerDashboardData> {
  const featuredOrder = previewCustomerOrders[0] ?? null;

  return {
    customerName: previewCustomerProfile.name,
    preferredLaundry: previewCustomerProfile.preferredLaundry,
    isPreviewData: true,
    summary: {
      activeOrders: 2,
      readyOrders: 1,
      outstandingNgn: 15_000,
      openPickups: 1,
    },
    featuredOrder,
    pickupRequests: [
      {
        id: "p1",
        reference: "PU-2214",
        status: "Driver Assigned",
        scheduledFor: "Today · 2:00 – 4:00 PM",
        addressLine: "12 Admiralty Way, Lekki Phase 1",
        estimatedItems: "~2 bags · wash & iron",
      },
      {
        id: "p2",
        reference: "PU-2198",
        status: "Converted to Order",
        scheduledFor: "Mon 13 Oct",
        addressLine: "Office — Eko Atlantic",
        estimatedItems: "Converted to LD-10480",
      },
    ],
    recentOrders: previewCustomerOrders.slice(0, 3),
    recentPayments: previewCustomerPaymentHistory.slice(0, 2),
  };
}
