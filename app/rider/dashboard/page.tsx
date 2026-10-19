import { RiderDashboardView } from "@/components/rider/rider-dashboard-view";
import { getRiderDashboardData } from "@/lib/rider-dashboard/get-rider-jobs-data";

export default async function RiderDashboardPage() {
  const data = await getRiderDashboardData();

  return <RiderDashboardView initialData={data} />;
}
