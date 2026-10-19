import Link from "next/link";

export function CtaSection() {
  return (
    <section className="border-t border-border bg-brand-light/50 px-4 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Ready to run your laundry on CleanMate?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-muted">
          Partner laundries get orders, pickups, payments, and customer records
          in one place—and onboard the customers they serve from the dashboard.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/register?role=business"
            className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-full bg-brand-dark px-8 font-semibold text-white transition-opacity hover:opacity-90"
          >
            Create business account
          </Link>
          <Link
            href="/login?role=business"
            className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-full bg-secondary-surface px-8 font-semibold text-foreground transition-colors hover:bg-brand-light"
          >
            Business sign in
          </Link>
        </div>
        <p className="mt-8 text-sm text-muted">
          A product of Zenith Innovation Limited
        </p>
      </div>
    </section>
  );
}
