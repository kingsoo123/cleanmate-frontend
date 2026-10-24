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

const previewOrders: BusinessOrderListRow[] = [
  {
    id: "o1",
    orderNumber: "LD-10482",
    customerName: "Ada Okonkwo",
    customerPhone: "+234 803 222 3344",
    source: "Pickup",
    status: "Ready",
    paymentState: "Partially Paid",
    processingStage: "Ready for handover",
    totalNgn: 45_000,
    outstandingNgn: 15_000,
    itemsSummary: "2 bags · wash & iron",
    updatedAt: "10:42",
    createdAt: "14 Oct",
  },
  {
    id: "o2",
    orderNumber: "LD-10480",
    customerName: "Tunde Bakare",
    customerPhone: "+234 807 555 6677",
    source: "Walk-in",
    status: "In Progress",
    paymentState: "Partially Paid",
    processingStage: "Ironing / Folding",
    totalNgn: 18_500,
    outstandingNgn: 8_500,
    itemsSummary: "5 shirts · dry clean",
    updatedAt: "10:18",
    createdAt: "15 Oct",
  },
  {
    id: "o3",
    orderNumber: "LD-10479",
    customerName: "Fatima Yusuf",
    customerPhone: "+234 701 888 9900",
    source: "Pickup",
    status: "Quality Check",
    paymentState: "Fully Paid",
    processingStage: "Quality check",
    totalNgn: 62_000,
    outstandingNgn: 0,
    itemsSummary: "Duvet · curtains · suits",
    updatedAt: "09:55",
    createdAt: "13 Oct",
  },
  {
    id: "o4",
    orderNumber: "LD-10477",
    customerName: "James Okafor",
    customerPhone: "+234 809 123 4567",
    source: "Walk-in",
    status: "Out for Delivery",
    paymentState: "Fully Paid",
    processingStage: "With driver",
    totalNgn: 27_000,
    outstandingNgn: 0,
    itemsSummary: "Home delivery · 1 box",
    updatedAt: "09:30",
    createdAt: "12 Oct",
  },
  {
    id: "o5",
    orderNumber: "LD-10475",
    customerName: "Blessing Adeyemi",
    customerPhone: "+234 816 444 2211",
    source: "Pickup",
    status: "Awaiting Customer Approval",
    paymentState: "Unpaid",
    processingStage: "Quotation sent",
    totalNgn: 38_000,
    outstandingNgn: 38_000,
    itemsSummary: "Pickup PU-2195 · pending quote",
    updatedAt: "08:50",
    createdAt: "16 Oct",
  },
  {
    id: "o6",
    orderNumber: "LD-10471",
    customerName: "Chidi Nwosu",
    customerPhone: "+234 802 333 7788",
    source: "Pickup",
    status: "Awaiting Customer Approval",
    paymentState: "Unpaid",
    processingStage: "Quotation",
    totalNgn: 32_500,
    outstandingNgn: 32_500,
    itemsSummary: "Corporate laundry batch",
    updatedAt: "Yesterday",
    createdAt: "15 Oct",
  },
  {
    id: "o7",
    orderNumber: "LD-10465",
    customerName: "Walk-in — Ibrahim Bello",
    customerPhone: "+234 903 111 0099",
    source: "Walk-in",
    status: "Awaiting Initial Payment",
    paymentState: "Unpaid",
    processingStage: "Front desk hold",
    totalNgn: 28_000,
    outstandingNgn: 28_000,
    itemsSummary: "Express same-day",
    updatedAt: "Yesterday",
    createdAt: "16 Oct",
  },
  {
    id: "o8",
    orderNumber: "LD-10460",
    customerName: "Grace Eze",
    customerPhone: "+234 818 777 6655",
    source: "Pickup",
    status: "Active",
    paymentState: "Partially Paid",
    processingStage: "Received at facility",
    totalNgn: 22_000,
    outstandingNgn: 12_000,
    itemsSummary: "Converted from PU-2209",
    updatedAt: "08:12",
    createdAt: "16 Oct",
  },
  {
    id: "o9",
    orderNumber: "LD-10455",
    customerName: "Helen Chu",
    customerPhone: "+234 805 999 1122",
    source: "Walk-in",
    status: "Completed",
    paymentState: "Fully Paid",
    processingStage: "Collected",
    totalNgn: 24_000,
    outstandingNgn: 0,
    itemsSummary: "Regular wash",
    updatedAt: "Mon",
    createdAt: "10 Oct",
  },
  {
    id: "o10",
    orderNumber: "LD-10450",
    customerName: "Michael Obi",
    customerPhone: "+234 708 222 3344",
    source: "Walk-in",
    status: "In Progress",
    paymentState: "Fully Paid",
    processingStage: "Washing / Dry clean",
    totalNgn: 41_000,
    outstandingNgn: 0,
    itemsSummary: "Suits · agbada",
    updatedAt: "07:45",
    createdAt: "15 Oct",
  },
  {
    id: "o11",
    orderNumber: "PU-2209",
    customerName: "Grace Eze",
    customerPhone: "+234 818 777 6655",
    source: "Pickup",
    status: "Draft",
    paymentState: "Unpaid",
    processingStage: "Pickup request",
    totalNgn: 0,
    outstandingNgn: 0,
    itemsSummary: "Awaiting review · Lekki",
    updatedAt: "06:30",
    createdAt: "17 Oct",
  },
  {
    id: "o12",
    orderNumber: "LD-10448",
    customerName: "Yemi Alade",
    customerPhone: "+234 811 555 4433",
    source: "Pickup",
    status: "Cancelled",
    paymentState: "Unpaid",
    processingStage: "Cancelled by customer",
    totalNgn: 19_000,
    outstandingNgn: 0,
    itemsSummary: "Refund not applicable",
    updatedAt: "Last week",
    createdAt: "5 Oct",
  },
];

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
