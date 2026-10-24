import type { CustomerOrderRow } from "@/lib/customer-dashboard/types";

const cache = new Map<string, CustomerOrderRow>();

export function getCachedCustomerOrder(orderId: string): CustomerOrderRow | null {
  return cache.get(orderId) ?? null;
}

export function setCachedCustomerOrder(order: CustomerOrderRow) {
  cache.set(order.id, order);
}

/** Seed from list navigation so detail opens without a loading flash. */
export function primeCustomerOrderCache(orders: CustomerOrderRow[]) {
  for (const order of orders) {
    cache.set(order.id, order);
  }
}
