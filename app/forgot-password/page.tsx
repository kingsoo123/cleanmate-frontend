import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthFormSkeleton } from "@/components/auth/auth-form-skeleton";
import { ForgotPasswordContent } from "@/app/forgot-password/forgot-password-content";

export const metadata: Metadata = {
  title: "Reset PIN",
};

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  return (
    <AuthShell>
      <Suspense fallback={<AuthFormSkeleton />}>
        <ForgotPasswordContent searchParams={searchParams} />
      </Suspense>
    </AuthShell>
  );
}
