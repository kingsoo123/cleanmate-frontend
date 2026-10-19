import {
  getBusinessCustomersData,
  getCustomersCatalogSlice,
} from "@/lib/business-dashboard/get-customers-data";
import type {
  CatalogService,
  PreviewCustomer,
} from "@/lib/business-dashboard/new-order-types";

/** Replace with services/customers API when Phase 2 is wired. */
export async function getNewOrderCatalog(): Promise<{
  customers: PreviewCustomer[];
  services: CatalogService[];
}> {
  const { customers } = await getBusinessCustomersData();
  return {
    customers: getCustomersCatalogSlice(customers),
    services: [
      { id: "s1", category: "Wash & iron", name: "Shirt", unitPriceNgn: 800 },
      { id: "s2", category: "Wash & iron", name: "Trousers", unitPriceNgn: 900 },
      { id: "s3", category: "Wash & iron", name: "Bed sheet", unitPriceNgn: 1_200 },
      { id: "s4", category: "Dry clean", name: "Suit (2-piece)", unitPriceNgn: 4_500 },
      { id: "s5", category: "Dry clean", name: "Blazer", unitPriceNgn: 3_200 },
      { id: "s6", category: "Dry clean", name: "Agbada", unitPriceNgn: 5_500 },
      { id: "s7", category: "Press only", name: "Shirt", unitPriceNgn: 500 },
      { id: "s8", category: "Household", name: "Duvet", unitPriceNgn: 3_800 },
      { id: "s9", category: "Household", name: "Curtain (per panel)", unitPriceNgn: 2_500 },
      { id: "s10", category: "Express", name: "Same-day surcharge", unitPriceNgn: 2_000 },
    ],
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
