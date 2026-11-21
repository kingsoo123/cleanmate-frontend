import type { BusinessOrderListRow } from "@/lib/business-dashboard/orders-types";
import type { OutstandingOrderForPayment } from "@/lib/business-dashboard/payments-types";

export function orderRowToOutstanding(
  order: BusinessOrderListRow,
): OutstandingOrderForPayment {
  const paidNgn = Math.max(0, order.totalNgn - order.outstandingNgn);
  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    totalNgn: order.totalNgn,
    paidNgn,
    outstandingNgn: order.outstandingNgn,
  };
}