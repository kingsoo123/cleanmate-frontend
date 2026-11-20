"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { isBusinessPathAllowedForUser } from "@/lib/business-dashboard/nav";
import { useAuthUser } from "@/lib/auth/use-auth-user";

export function BusinessPortalRouteGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthUser();

  useEffect(() => {
    if (!user || user.role !== "branch_manager") return;
    if (!isBusinessPathAllowedForUser(pathname, user)) {
      router.replace("/business/dashboard");
    }
  }, [pathname, router, user]);

  return children;
}