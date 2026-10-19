import { CustomerDashboardView } from "@/components/customer/dashboard/customer-dashboard-view";
import { getCustomerDashboardData } from "@/lib/customer-dashboard/get-dashboard-data";

export default async function CustomerDashboardPage() {
  const data = await getCustomerDashboardData();

  return <CustomerDashboardView data={data} />;
}
