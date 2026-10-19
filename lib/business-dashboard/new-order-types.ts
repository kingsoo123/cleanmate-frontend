export type CatalogService = {
  id: string;
  category: string;
  name: string;
  unitPriceNgn: number;
};

export type PreviewCustomer = {
  id: string;
  name: string;
  phone: string;
};

export type OrderLineItem = {
  id: string;
  serviceId: string;
  label: string;
  quantity: number;
  unitPriceNgn: number;
};

export type DeliveryPreference = "Pickup at shop" | "Home delivery";

export type NewWalkInOrderDraft = {
  customerMode: "existing" | "walk-in";
  customerId: string;
  walkInName: string;
  walkInPhone: string;
  lineItems: OrderLineItem[];
  deliveryPreference: DeliveryPreference;
  customerNotes: string;
  internalNotes: string;
  sendForApproval: boolean;
  initialPaymentNgn: number;
  paymentMethod: "Cash" | "Bank transfer" | "POS";
};

export type CreatedWalkInOrderPreview = {
  orderNumber: string;
  orderId: string;
  customerLabel: string;
  totalNgn: number;
  paidNgn: number;
  outstandingNgn: number;
  statusLabel: string;
  paymentLabel: string;
};
