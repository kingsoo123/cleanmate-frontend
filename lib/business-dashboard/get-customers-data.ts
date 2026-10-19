import type {
  BusinessCustomer,
  CustomerListFilter,
} from "@/lib/business-dashboard/customers-types";
import type { PreviewCustomer } from "@/lib/business-dashboard/new-order-types";

/** Replace with API/DB when customer CRM is connected. */
export async function getBusinessCustomersData(): Promise<{
  customers: BusinessCustomer[];
}> {
  return { customers: previewCustomers };
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

const previewCustomers: BusinessCustomer[] = [
  {
    id: "c1",
    name: "Ada Okonkwo",
    phone: "+234 803 222 3344",
    email: "ada.o@email.com",
    registeredAt: "Aug 2026",
    totalOrders: 24,
    activeOrders: 2,
    outstandingNgn: 15_000,
    lastActivity: "Today",
    portalAccess: true,
    defaultAddress: "12 Admiralty Way, Lekki Phase 1",
  },
  {
    id: "c2",
    name: "Tunde Bakare",
    phone: "+234 807 555 6677",
    email: null,
    registeredAt: "Sep 2026",
    totalOrders: 11,
    activeOrders: 1,
    outstandingNgn: 8_500,
    lastActivity: "Today",
    portalAccess: true,
    defaultAddress: null,
  },
  {
    id: "c3",
    name: "Fatima Yusuf",
    phone: "+234 701 888 9900",
    email: "fatima.y@gmail.com",
    registeredAt: "Jul 2026",
    totalOrders: 18,
    activeOrders: 1,
    outstandingNgn: 0,
    lastActivity: "Today",
    portalAccess: true,
    defaultAddress: "VI — Ozumba Mbadiwe",
  },
  {
    id: "c4",
    name: "James Okafor",
    phone: "+234 809 123 4567",
    email: null,
    registeredAt: "Jun 2026",
    totalOrders: 9,
    activeOrders: 1,
    outstandingNgn: 0,
    lastActivity: "Today",
    portalAccess: true,
    defaultAddress: "18 Bourdillon Road, Ikoyi",
  },
  {
    id: "c5",
    name: "Blessing Adeyemi",
    phone: "+234 816 444 2211",
    email: "blessing.a@corp.ng",
    registeredAt: "Oct 2026",
    totalOrders: 6,
    activeOrders: 2,
    outstandingNgn: 70_500,
    lastActivity: "Yesterday",
    portalAccess: true,
    defaultAddress: "15 Ozumba Mbadiwe, VI",
  },
  {
    id: "c6",
    name: "Chidi Nwosu",
    phone: "+234 802 333 7788",
    email: null,
    registeredAt: "Sep 2026",
    totalOrders: 4,
    activeOrders: 1,
    outstandingNgn: 32_500,
    lastActivity: "Yesterday",
    portalAccess: true,
    defaultAddress: null,
  },
  {
    id: "c7",
    name: "Helen Chu",
    phone: "+234 805 999 1122",
    email: null,
    registeredAt: "May 2026",
    totalOrders: 15,
    activeOrders: 0,
    outstandingNgn: 0,
    lastActivity: "3 days ago",
    portalAccess: true,
    defaultAddress: "Banana Island",
  },
  {
    id: "c8",
    name: "Grace Eze",
    phone: "+234 818 777 6655",
    email: null,
    registeredAt: "Oct 2026",
    totalOrders: 2,
    activeOrders: 1,
    outstandingNgn: 12_000,
    lastActivity: "Today",
    portalAccess: true,
    defaultAddress: "Chevron Drive, Lekki",
  },
];

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

/** Preview order history shown on customer detail. */
export function getCustomerRecentOrders(
  customerId: string,
): { orderNumber: string; status: string; totalNgn: number; updatedAt: string }[] {
  const byCustomer: Record<
    string,
    { orderNumber: string; status: string; totalNgn: number; updatedAt: string }[]
  > = {
    c1: [
      { orderNumber: "LD-10482", status: "Ready", totalNgn: 45_000, updatedAt: "Today" },
      { orderNumber: "LD-10480", status: "In Progress", totalNgn: 18_500, updatedAt: "Mon" },
    ],
    c5: [
      { orderNumber: "LD-10475", status: "Awaiting Customer Approval", totalNgn: 38_000, updatedAt: "Today" },
      { orderNumber: "LD-10471", status: "Awaiting Customer Approval", totalNgn: 32_500, updatedAt: "Yesterday" },
    ],
  };
  return byCustomer[customerId] ?? [
    { orderNumber: "LD-10400", status: "Completed", totalNgn: 22_000, updatedAt: "Last week" },
  ];
}
