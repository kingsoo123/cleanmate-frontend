import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";
import { onboardingCopy } from "@/lib/auth/onboarding";

export function RegisterContent() {
  const role = "business" as const;
  const copy = onboardingCopy[role];

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        {copy.registerTitle}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {copy.registerSubtitle}
      </p>
      <p className="mt-3 rounded-xl border border-border bg-secondary-surface/80 px-3 py-2.5 text-xs leading-relaxed text-muted">
        Customers and dispatch riders are added from your dashboard under{" "}
        <span className="font-medium text-foreground">Customers</span> and{" "}
        <span className="font-medium text-foreground">Staff & riders</span>—not
        through public sign-up.
      </p>
      <div className="mt-8">
        <RegisterForm />
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href="/login?role=business"
          className="font-semibold text-brand hover:underline"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
