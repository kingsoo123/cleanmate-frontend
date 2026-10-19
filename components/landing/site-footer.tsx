import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface px-4 py-12 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:justify-between">
        <div>
          <p className="font-semibold text-foreground">CleanMate</p>
          <p className="mt-2 max-w-xs text-sm text-muted">
            Laundry and dry-cleaning—for businesses and customers on one
            connected platform.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted">
          <Link href="#how-it-works" className="hover:text-brand">
            How it works
          </Link>
          <Link href="#for-businesses" className="hover:text-brand">
            Businesses
          </Link>
          <Link href="#for-customers" className="hover:text-brand">
            Customers
          </Link>
          <Link href="/login?role=customer" className="hover:text-brand">
            Customer sign in
          </Link>
          <Link href="/login?role=business" className="hover:text-brand">
            Business sign in
          </Link>
          <Link href="/login?role=rider" className="hover:text-brand">
            Rider sign in
          </Link>
        </nav>
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-center text-xs text-muted md:text-left">
        © 2026 CleanMate. All rights reserved.
      </p>
    </footer>
  );
}
