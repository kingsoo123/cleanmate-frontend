export type CustomerListFilter = "all" | "balance" | "active";

export type BusinessCustomer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  registeredAt: string;
  totalOrders: number;
  activeOrders: number;
  outstandingNgn: number;
  lastActivity: string;
  portalAccess: boolean;
  defaultAddress: string | null;
};

export type CustomerRecentOrder = {
  orderNumber: string;
  status: string;
  totalNgn: number;
  updatedAt: string;
};
