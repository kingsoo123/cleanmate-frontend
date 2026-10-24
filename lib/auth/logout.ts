import type { OnboardingRole } from "@/lib/auth/onboarding";
import { clearAuthSession, getAuthUser } from "@/lib/auth/session";

export function loginPathForRole(role: OnboardingRole): string {
  return `/login?role=${role}`;
}

/** Clears the local session and returns the sign-in path for the account type. */
export function logoutAndGetLoginPath(role?: OnboardingRole): string {
  const resolvedRole = role ?? getAuthUser()?.role ?? "customer";
  clearAuthSession();
  return loginPathForRole(resolvedRole);
}
