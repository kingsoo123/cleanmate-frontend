"use client";

import Link from "next/link";
import type { OnboardingRole } from "@/lib/auth/onboarding";

const loginRoles: { role: OnboardingRole; label: string }[] = [
  { role: "business", label: "Business" },
  { role: "customer", label: "Customer" },
  { role: "rider", label: "Rider" },
];

export function RoleSwitcher({
  role,
  mode,
}: {
  role: OnboardingRole;
  mode: "register" | "login";
}) {
  if (mode === "register") {
    return null;
  }

  return (
    <div className="mb-6 flex rounded-full bg-secondary-surface p-1">
      {loginRoles.map(({ role: r, label }) => (
        <Link
          key={r}
          href={`/login?role=${r}`}
          className={`flex-1 rounded-full py-2 text-center text-xs font-semibold transition-colors sm:text-sm ${
            role === r
              ? "bg-surface text-foreground shadow-sm"
              : "text-muted hover:text-foreground"
          }`}
          aria-current={role === r ? "page" : undefined}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
