import Link from "next/link";

export function HeaderAccountMenus() {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link
        href="/login?role=business"
        className="hidden text-sm font-medium text-muted transition-colors hover:text-foreground sm:inline"
      >
        Sign in
      </Link>
      <Link
        href="/register?role=business"
        className="inline-flex h-10 items-center justify-center rounded-full bg-brand-dark px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:px-5"
      >
        Get started
      </Link>
    </div>
  );
}
