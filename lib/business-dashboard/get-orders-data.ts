import type {
  BusinessOrderListRow,
  BusinessOrdersListData,
  OrderListFilter,
} from "@/lib/business-dashboard/orders-types";
import type { OrderStatus } from "@/lib/business-dashboard/types";

/** Server placeholder; client loads via JWT. */
export async function getBusinessOrdersData(): Promise<BusinessOrdersListData> {
  return {
    isPreviewData: false,
    orders: [],
  };
}


const activeStatuses: OrderStatus[] = [
  "Active",
  "In Progress",
  "Quality Check",
  "Out for Delivery",
];

export function orderMatchesListFilter(
  order: BusinessOrderListRow,
  filter: OrderListFilter,
): boolean {
  switch (filter) {
    case "all":
      return true;
    case "active":
      return activeStatuses.includes(order.status);
    case "ready":
      return order.status === "Ready";
    case "attention":
      return (
        order.status === "Awaiting Customer Approval" ||
        order.status === "Awaiting Initial Payment" ||
        order.status === "Draft" ||
        (order.status === "Ready" && order.paymentState !== "Fully Paid")
      );
    case "unpaid":
      return order.paymentState !== "Fully Paid";
    default:
      return true;
  }
}

export function parseOrderListFilter(value: string | undefined): OrderListFilter {
  const allowed: OrderListFilter[] = [
    "all",
    "active",
    "ready",
    "attention",
    "unpaid",
  ];
  if (value && allowed.includes(value as OrderListFilter)) {
    return value as OrderListFilter;
  }
  return "all";
}

export function filterOrdersList(
  orders: BusinessOrderListRow[],
  options: { filter: OrderListFilter; query: string },
): BusinessOrderListRow[] {
  const q = options.query.trim().toLowerCase();
  return orders.filter((order) => {
    if (!orderMatchesListFilter(order, options.filter)) return false;
    if (!q) return true;
    const tag = (order.tag ?? order.trackingCode ?? "").toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(q) ||
      tag.includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerPhone.replace(/\s/g, "").includes(q.replace(/\s/g, ""))
    );
  });
}

export function countOrdersByFilter(
  orders: BusinessOrderListRow[],
): Record<OrderListFilter, number> {
  const filters: OrderListFilter[] = [
    "all",
    "active",
    "ready",
    "attention",
    "unpaid",
  ];
  return Object.fromEntries(
    filters.map((filter) => [
      filter,
      orders.filter((o) => orderMatchesListFilter(o, filter)).length,
    ]),
  ) as Record<OrderListFilter, number>;
}

export function getOrderById(
  orders: BusinessOrderListRow[],
  id: string,
): BusinessOrderListRow | undefined {
  return orders.find((o) => o.id === id);
}

export function sumOutstandingNgn(orders: BusinessOrderListRow[]): number {
  return orders.reduce((sum, o) => sum + o.outstandingNgn, 0);
}

export const ORDERS_PAGE_SIZE = 10;

export function parseOrdersPage(value: string | null | undefined): number {
  const n = Number.parseInt(value ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

export function paginateOrders<T>(
  items: T[],
  page: number,
  pageSize: number = ORDERS_PAGE_SIZE,
): { page: number; pageSize: number; totalPages: number; items: T[] } {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    page: safePage,
    pageSize,
    totalPages,
    items: items.slice(start, start + pageSize),
  };
}
