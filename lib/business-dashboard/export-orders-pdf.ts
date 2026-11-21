import type { BusinessOrderListRow, OrderListFilter } from "@/lib/business-dashboard/orders-types";
import { formatNgn } from "@/lib/business-dashboard/format";

const FILTER_LABELS: Record<OrderListFilter, string> = {
  all: "All orders",
  active: "Active",
  ready: "Ready",
  attention: "Needs attention",
  unpaid: "Unpaid balance",
};

function formatPdfDate(iso: string): string {
  return iso.slice(0, 10);
}

function orderTableBody(
  orders: BusinessOrderListRow[],
  includeCreatedBy: boolean,
): string[][] {
  return orders.map((order) => {
    const base = [
      order.orderNumber,
      order.tag ?? order.trackingCode ?? "—",
      order.customerName,
      order.customerPhone,
    ];
    if (includeCreatedBy) {
      base.push(order.createdByName ?? "—");
    }
  return [
    ...base,
    order.source,
    order.processingStage,
    order.status,
    order.paymentState,
    formatNgn(order.totalNgn),
    order.outstandingNgn > 0 ? formatNgn(order.outstandingNgn) : "—",
    formatPdfDate(order.updatedAt),
  ];
  });
}

function orderTableHead(includeCreatedBy: boolean): string[][] {
  const head = [
    "Order",
    "Tag",
    "Customer",
    "Phone",
  ];
  if (includeCreatedBy) {
    head.push("Created by");
  }
  return [
    [
      ...head,
      "Source",
      "Stage",
      "Status",
      "Payment",
      "Total",
      "Outstanding",
      "Updated",
    ],
  ];
}

export async function downloadOrdersTablePdf(options: {
  orders: BusinessOrderListRow[];
  filter: OrderListFilter;
  searchQuery: string;
  businessName?: string | null;
  includeCreatedBy?: boolean;
}): Promise<void> {
  const { default: autoTable } = await import("jspdf-autotable");
  const { jsPDF } = await import("jspdf");

  const includeCreatedBy = options.includeCreatedBy ?? true;
  const filterLabel = FILTER_LABELS[options.filter];
  const generated = new Date().toISOString().slice(0, 16).replace("T", " ");

  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const title = options.businessName?.trim() || "Washuply";
  doc.setFontSize(14);
  doc.text(`${title} — Orders`, 40, 36);
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  const subtitleParts = [
    filterLabel,
    `${options.orders.length} row${options.orders.length === 1 ? "" : "s"}`,
    `Generated ${generated}`,
  ];
  if (options.searchQuery.trim()) {
    subtitleParts.push(`Search: “${options.searchQuery.trim()}”`);
  }
  doc.text(subtitleParts.join(" · "), 40, 52);
  doc.setTextColor(0, 0, 0);

  autoTable(doc, {
    startY: 64,
    head: orderTableHead(includeCreatedBy),
    body: orderTableBody(options.orders, includeCreatedBy),
    styles: { fontSize: 7, cellPadding: 4, overflow: "linebreak" },
    headStyles: { fillColor: [67, 56, 202], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 52 },
      1: { cellWidth: 48 },
      2: { cellWidth: 72 },
      3: { cellWidth: 64 },
    },
    margin: { left: 40, right: 40 },
  });

  const dateStamp = new Date().toISOString().slice(0, 10);
  const filterSlug = options.filter === "all" ? "all" : options.filter;
  doc.save(`washuply-orders-${filterSlug}-${dateStamp}.pdf`);
}