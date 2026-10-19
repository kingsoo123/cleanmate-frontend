import { previewCustomerOrders } from "@/lib/customer-dashboard/customer-orders-preview";
import type { CustomerOrderRow } from "@/lib/customer-dashboard/types";
import type { OrderStatus } from "@/lib/business-dashboard/types";

export type CustomerOrderListFilter = "all" | "active" | "ready" | "action";

/** Replace with API/DB when customer auth is connected. */
export async function getCustomerOrdersData(): Promise<{
  orders: CustomerOrderRow[];
}> {
  return { orders: previewCustomerOrders };
}

const activeStatuses: OrderStatus[] = [
  "Active",
  "In Progress",
  "Quality Check",
  "Out for Delivery",
];

export function parseCustomerOrderListFilter(
  value: string | undefined,
): CustomerOrderListFilter {
  const allowed: CustomerOrderListFilter[] = ["all", "active", "ready", "action"];
  if (value && allowed.includes(value as CustomerOrderListFilter)) {
    return value as CustomerOrderListFilter;
  }
  return "all";
}

export function customerOrderMatchesFilter(
  order: CustomerOrderRow,
  filter: CustomerOrderListFilter,
): boolean {
  switch (filter) {
    case "all":
      return order.status !== "Cancelled";
    case "active":
      return activeStatuses.includes(order.status);
    case "ready":
      return order.status === "Ready";
    case "action":
      return (
        order.status === "Awaiting Customer Approval" ||
        order.status === "Awaiting Initial Payment"
      );
    default:
      return true;
  }
}

export function filterCustomerOrdersList(
  orders: CustomerOrderRow[],
  options: { filter: CustomerOrderListFilter; query: string },
): CustomerOrderRow[] {
  const q = options.query.trim().toLowerCase();
  return orders.filter((order) => {
    if (!customerOrderMatchesFilter(order, options.filter)) return false;
    if (!q) return true;
    return (
      order.orderNumber.toLowerCase().includes(q) ||
      order.processingStage.toLowerCase().includes(q)
    );
  });
}

export function countCustomerOrdersByFilter(
  orders: CustomerOrderRow[],
): Record<CustomerOrderListFilter, number> {
  const filters: CustomerOrderListFilter[] = ["all", "active", "ready", "action"];
  return Object.fromEntries(
    filters.map((filter) => [
      filter,
      orders.filter((o) => customerOrderMatchesFilter(o, filter)).length,
    ]),
  ) as Record<CustomerOrderListFilter, number>;
}

export { getCustomerOrderById } from "@/lib/customer-dashboard/customer-orders-preview";
