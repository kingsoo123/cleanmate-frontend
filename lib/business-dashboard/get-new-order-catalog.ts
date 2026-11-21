import {
  getBusinessCustomersData,
  getCustomersCatalogSlice,
} from "@/lib/business-dashboard/get-customers-data";
import type {
  CatalogService,
  PreviewCustomer,
} from "@/lib/business-dashboard/new-order-types";

/** Server placeholder; new order form loads catalog via JWT. */
export async function getNewOrderCatalog(): Promise<{
  customers: PreviewCustomer[];
  services: CatalogService[];
}> {
  const { customers } = await getBusinessCustomersData();
  return {
    customers: getCustomersCatalogSlice(customers),
    services: [],
  };
}

export function lineItemTotal(item: {
  quantity: number;
  unitPriceNgn: number;
}): number {
  return item.quantity * item.unitPriceNgn;
}

export function sumLineItems(
  items: { quantity: number; unitPriceNgn: number }[],
): number {
  return items.reduce((sum, item) => sum + lineItemTotal(item), 0);
}
