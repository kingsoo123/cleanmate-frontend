import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";

export function AuthShell({
  children,
  footer,
}: {
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-full bg-background px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-md">
        <BrandLogo href="/" className="mb-8 text-lg" size="md" />

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          {children}
        </div>

        {footer ? (
          <div className="mt-6 text-center text-sm text-muted">{footer}</div>
        ) : null}

        <p className="mt-8 text-center text-xs text-muted">
          <Link href="/" className="font-medium text-brand hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
