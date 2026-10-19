import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { RoleSwitcher } from "@/components/auth/role-switcher";
import {
  onboardingCopy,
  parseOnboardingRole,
} from "@/lib/auth/onboarding";

export async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role: roleParam } = await searchParams;
  const role = parseOnboardingRole(roleParam);
  const copy = onboardingCopy[role];

  return (
    <>
      <RoleSwitcher role={role} mode="login" />
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        {copy.loginTitle}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {copy.loginSubtitle}
      </p>
      <div className="mt-8">
        <LoginForm role={role} />
      </div>
      {role === "business" ? (
        <p className="mt-6 text-center text-sm text-muted">
          New laundry partner?{" "}
          <Link
            href="/register?role=business"
            className="font-semibold text-brand hover:underline"
          >
            Create a business account
          </Link>
        </p>
      ) : (
        <p className="mt-6 text-center text-sm text-muted">
          No public sign-up for this role—your laundry creates your account from
          their dashboard.
        </p>
      )}
    </>
  );
}
