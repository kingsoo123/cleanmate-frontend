export type CustomerNavItem = {
  label: string;
  href: string;
  shortLabel?: string;
};

export const customerNav: CustomerNavItem[] = [
  { label: "Dashboard", href: "/customer/dashboard", shortLabel: "Home" },
  { label: "Request pickup", href: "/customer/pickups/new", shortLabel: "Pickup" },
  { label: "My orders", href: "/customer/orders", shortLabel: "Orders" },
  { label: "Pickup history", href: "/customer/pickups", shortLabel: "History" },
  { label: "Payments", href: "/customer/payments", shortLabel: "Pay" },
  { label: "Profile", href: "/customer/profile", shortLabel: "Profile" },
];

export function getCustomerNavTitle(pathname: string): string {
  const exact = customerNav.find((item) => item.href === pathname);
  if (exact) return exact.label;
  if (pathname.startsWith("/customer/orders/") && pathname !== "/customer/orders") {
    return "Order details";
  }
  if (pathname.startsWith("/customer/pickups/new")) return "Request pickup";
  if (pathname.startsWith("/customer/orders/")) return "Order details";
  return "My account";
}
