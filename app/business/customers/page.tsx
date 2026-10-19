import { Suspense } from "react";
import { CustomersListView } from "@/components/business/customers/customers-list-view";
import { getBusinessCustomersData } from "@/lib/business-dashboard/get-customers-data";

function CustomersFallback() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-4">
      <div className="h-10 w-40 rounded-lg bg-secondary-surface" />
      <div className="h-64 rounded-2xl bg-secondary-surface" />
    </div>
  );
}

export default async function BusinessCustomersPage() {
  const { customers } = await getBusinessCustomersData();

  return (
    <Suspense fallback={<CustomersFallback />}>
      <CustomersListView initialCustomers={customers} />
    </Suspense>
  );
}
