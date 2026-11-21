import type { AuthUserPayload } from "@/lib/auth/types";

export type BusinessNavItem = {
  label: string;
  href: string;
  description?: string;
};

const branchManagerNavHrefs = new Set([
  "/business/dashboard",
  "/business/orders",
  "/business/orders/new",
  "/business/customers",
  "/business/notifications",
]);

export function businessNavForUser(
  user: AuthUserPayload | null,
): BusinessNavItem[] {
  if (user?.role === "branch_manager") {
    return businessNav.filter((item) => branchManagerNavHrefs.has(item.href));
  }
  return businessNav;
}

export function isBusinessPathAllowedForUser(
  pathname: string,
  user: AuthUserPayload | null,
): boolean {
  if (user?.role !== "branch_manager") return true;
  if (pathname === "/business/dashboard") return true;
  if (pathname.startsWith("/business/orders")) return true;
  if (pathname.startsWith("/business/customers")) return true;
  if (pathname.startsWith("/business/notifications")) return true;
  return false;
}

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
