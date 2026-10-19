import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Reset password",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      footer={
        <>
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-brand hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Reset your PIN
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        PIN reset will be available when authentication is enabled. Contact
        your laundry administrator or CleanMate support if you need access
        urgently.
      </p>
      <Link
        href="/login"
        className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-full bg-brand-dark text-sm font-semibold text-white hover:opacity-90"
      >
        Back to sign in
      </Link>
    </AuthShell>
  );
}
