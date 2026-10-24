export type BusinessNavItem = {
  label: string;
  href: string;
  description?: string;
};

export const businessNav: BusinessNavItem[] = [
  { label: "Dashboard", href: "/business/dashboard" },
  { label: "Orders", href: "/business/orders" },
  { label: "New order", href: "/business/orders/new" },
  { label: "Pickup requests", href: "/business/pickups" },
  { label: "Deliveries", href: "/business/deliveries" },
  { label: "Customers", href: "/business/customers" },
  { label: "Messages", href: "/business/messages" },
  { label: "Services & pricing", href: "/business/services" },
  { label: "Payments", href: "/business/payments" },
  { label: "Staff & riders", href: "/business/staff" },
  { label: "Reports", href: "/business/reports" },
  { label: "Notifications", href: "/business/notifications" },
  { label: "Settings", href: "/business/settings" },
];

export function getBusinessNavTitle(pathname: string): string {
  const exact = businessNav.find((item) => item.href === pathname);
  if (exact) return exact.label;
  if (pathname.startsWith("/business/notifications")) return "Notifications";
  if (pathname.startsWith("/business/reports")) return "Reports";
  if (pathname.startsWith("/business/payments")) return "Payments";
  if (pathname.startsWith("/business/customers")) return "Customers";
  if (pathname.startsWith("/business/messages")) return "Messages";
  if (pathname.startsWith("/business/deliveries")) return "Deliveries";
  if (pathname.startsWith("/business/pickups")) return "Pickup requests";
  if (pathname.startsWith("/business/orders/new")) return "New order";
  if (
    pathname.startsWith("/business/orders/") &&
    pathname !== "/business/orders/new"
  ) {
    return "Order details";
  }
  return "Business portal";
}
