"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import type { OnboardingRole } from "@/lib/auth/onboarding";
import { logoutAndGetLoginPath } from "@/lib/auth/logout";
import { unregisterPushFromBackend } from "@/lib/push/sync-push-token";

type LogoutButtonProps = {
  role?: OnboardingRole;
  className?: string;
  children?: ReactNode;
};

export function LogoutButton({
  role,
  className = "text-xs font-medium text-muted hover:text-brand",
  children = "Log out",
}: LogoutButtonProps) {
  const router = useRouter();

  function handleLogout() {
    void unregisterPushFromBackend().finally(() => {
      router.replace(logoutAndGetLoginPath(role));
    });
  }

  return (
    <button type="button" onClick={handleLogout} className={className}>
      {children}
    </button>
  );
}
