export type CustomerNavItem = {
  label: string;
  href: string;
  shortLabel?: string;
};

export const customerNav: CustomerNavItem[] = [
  { label: "Dashboard", href: "/customer/dashboard", shortLabel: "Home" },
  { label: "Request pickup", href: "/customer/pickups/new", shortLabel: "Pickup" },
  { label: "My orders", href: "/customer/orders", shortLabel: "Orders" },
  { label: "Messages", href: "/customer/messages", shortLabel: "Chat" },
  { label: "Pickup history", href: "/customer/pickups", shortLabel: "History" },
  { label: "Payments", href: "/customer/payments", shortLabel: "Pay" },
  { label: "Profile", href: "/customer/profile", shortLabel: "Profile" },
  { label: "Notifications", href: "/customer/notifications", shortLabel: "Alerts" },
];

function pathnameMatchesNavItem(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/customer/dashboard") return false;
  return pathname.startsWith(`${href}/`);
}

/** One active item: longest href match wins (e.g. /pickups/new vs /pickups). */
export function isCustomerNavActive(pathname: string, href: string): boolean {
  if (!pathnameMatchesNavItem(pathname, href)) return false;

  const bestMatchLength = customerNav.reduce((max, item) => {
    if (!pathnameMatchesNavItem(pathname, item.href)) return max;
    return Math.max(max, item.href.length);
  }, 0);

  return href.length === bestMatchLength;
}

export function getCustomerNavTitle(pathname: string): string {
  const exact = customerNav.find((item) => item.href === pathname);
  if (exact) return exact.label;
  if (pathname.startsWith("/customer/orders/") && pathname !== "/customer/orders") {
    return "Order details";
  }
  if (pathname.startsWith("/customer/notifications")) return "Notifications";
  if (pathname.startsWith("/customer/messages")) return "Messages";
  if (pathname.startsWith("/customer/pickups/new")) return "Request pickup";
  if (pathname.startsWith("/customer/orders/")) return "Order details";
  return "My account";
}
