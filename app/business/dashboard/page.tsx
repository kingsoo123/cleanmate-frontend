import { DashboardView } from "@/components/business/dashboard/dashboard-view";
import { getBusinessDashboardData } from "@/lib/business-dashboard/get-dashboard-data";

export default async function BusinessDashboardPage() {
  const data = await getBusinessDashboardData();

  return <DashboardView data={data} />;
}
