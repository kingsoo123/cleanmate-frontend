import { PickupHistoryView } from "@/components/customer/pickups/pickup-history-view";
import { getCustomerDashboardData } from "@/lib/customer-dashboard/get-dashboard-data";

export default async function PickupHistoryPage() {
  const data = await getCustomerDashboardData();

  return <PickupHistoryView pickups={data.pickupRequests} />;
}
