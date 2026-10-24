import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordContent } from "@/app/forgot-password/forgot-password-content";

export const metadata: Metadata = {
  title: "Reset PIN",
};

type PageProps = {
  searchParams: Promise<{ role?: string }>;
};

export default async function ForgotPasswordPage({ searchParams }: PageProps) {
  const { role: roleParam } = await searchParams;

  return (
    <AuthShell
      footer={
        <>
          Remember your PIN?{" "}
          <Link
            href={`/login?role=${roleParam ?? "business"}`}
            className="font-semibold text-brand hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <ForgotPasswordContent roleParam={roleParam} />
    </AuthShell>
  );
}
