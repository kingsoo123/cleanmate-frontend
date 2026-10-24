import Link from "next/link";
import { ForgotPinForm } from "@/components/auth/forgot-pin-form";
import { RoleSwitcher } from "@/components/auth/role-switcher";
import { parseOnboardingRole } from "@/lib/auth/onboarding";

export async function ForgotPasswordContent({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role: roleParam } = await searchParams;
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
      <p className="mt-8 text-center text-sm text-muted">
        Remember your PIN?{" "}
        <Link
          href={`/login?role=${role}`}
          className="font-semibold text-brand hover:underline"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
