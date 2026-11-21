import type {
  BusinessCustomer,
  CustomerListFilter,
} from "@/lib/business-dashboard/customers-types";
import type { PreviewCustomer } from "@/lib/business-dashboard/new-order-types";

/** Server placeholder; live list loads in the client with the business JWT. */
export async function getBusinessCustomersData(): Promise<{
  customers: BusinessCustomer[];
}> {
  return { customers: [] };
}

export function getCustomersCatalogSlice(
  customers: BusinessCustomer[],
): PreviewCustomer[] {
  return customers.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
  }));
}

export function parseCustomerListFilter(
  value: string | undefined,
): CustomerListFilter {
  const allowed: CustomerListFilter[] = ["all", "balance", "active"];
  if (value && allowed.includes(value as CustomerListFilter)) {
    return value as CustomerListFilter;
  }
  return "all";
}

export function customerMatchesFilter(
  customer: BusinessCustomer,
  filter: CustomerListFilter,
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "balance":
      return customer.outstandingNgn > 0;
    case "active":
      return customer.activeOrders > 0;
    default:
      return true;
  }
}

export function filterCustomersList(
  customers: BusinessCustomer[],
  options: { filter: CustomerListFilter; query: string },
): BusinessCustomer[] {
  const q = options.query.trim().toLowerCase();
  return customers.filter((customer) => {
    if (!customerMatchesFilter(customer, options.filter)) return false;
    if (!q) return true;
    return (
      customer.name.toLowerCase().includes(q) ||
      customer.phone.replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
      (customer.email?.toLowerCase().includes(q) ?? false)
    );
  });
}

export function countCustomersByFilter(
  customers: BusinessCustomer[],
): Record<CustomerListFilter, number> {
  const filters: CustomerListFilter[] = ["all", "balance", "active"];
  return Object.fromEntries(
    filters.map((filter) => [
      filter,
      customers.filter((c) => customerMatchesFilter(c, filter)).length,
    ]),
  ) as Record<CustomerListFilter, number>;
}

export function getCustomerById(
  customers: BusinessCustomer[],
  id: string,
): BusinessCustomer | undefined {
  return customers.find((c) => c.id === id);
}

/** Placeholder until customer order history is loaded from the API. */
export function getCustomerRecentOrders(
  _customerId: string,
): { orderNumber: string; status: string; totalNgn: number; updatedAt: string }[] {
  return [];
}
