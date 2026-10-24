import { ForgotPinForm } from "@/components/auth/forgot-pin-form";
import { RoleSwitcher } from "@/components/auth/role-switcher";
import { parseOnboardingRole } from "@/lib/auth/onboarding";

export function ForgotPasswordContent({
  roleParam,
}: {
  roleParam: string | undefined;
}) {
  const role = parseOnboardingRole(roleParam);

  return (
    <>
      <RoleSwitcher role={role} mode="login" />
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Reset your PIN
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Enter the phone or email on your account and choose a new 6-digit PIN.
      </p>
      <ForgotPinForm role={role} />
    </>
  );
}
