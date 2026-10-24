import type { OnboardingRole } from "@/lib/auth/onboarding";

export type AuthUserPayload = {
  id: string;
  role: OnboardingRole;
  fullName: string;
  businessName: string | null;
  email: string | null;
  phone: string;
};
