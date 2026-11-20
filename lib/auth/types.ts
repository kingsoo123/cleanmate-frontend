import type { OnboardingRole } from "@/lib/auth/onboarding";

export type AuthUserPayload = {
  id: string;
  role: OnboardingRole;
  fullName: string;
  businessName: string | null;
  email: string | null;
  phone: string;
  businessId?: string | null;
  branchId?: string | null;
  branchName?: string | null;
};
