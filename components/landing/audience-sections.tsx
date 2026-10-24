import Image from "next/image";
import Link from "next/link";
import { landingImages } from "@/lib/landing-images";

const businessPoints = [
  "Central dashboard for orders, pickups, and deliveries",
  "Item-based pricing, quotations, and installment payments",
  "Processing stages from received through quality check to ready",
  "Staff roles for front desk, laundry floor, managers, and drivers",
  "Revenue, balances, and operational reports from live data",
];

const customerPoints = [
  "Request pickup from home or office on your schedule",
  "Approve quotations and see exactly what you are paying for",
  "Track washing, dry cleaning, and delivery in real time",
  "Pay in full or in installments—with a clear balance",
  "Notifications when your clothes are ready or out for delivery",
];

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 h-5 w-5 shrink-0 text-brand"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function AudienceSections() {
  return (
    <>
      <section
        id="for-businesses"
        className="scroll-mt-20 border-t border-border bg-secondary-surface/40 px-4 py-16 sm:px-8 sm:py-20"
      >
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">
              For laundry & dry-cleaning businesses
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Operate smarter. Lose fewer garments. Get paid accurately.
            </h2>
            <p className="mt-4 leading-relaxed text-muted">
              Whether you run a neighborhood laundry or a multi-service
              dry-cleaning facility, Washuply digitizes walk-ins, customer
              pickups, driver runs, and back-office work.
            </p>
            <ul className="mt-8 space-y-3">
              {businessPoints.map((point) => (
                <li key={point} className="flex gap-3 text-sm text-foreground">
                  <CheckIcon />
                  {point}
                </li>
              ))}
            </ul>
            <Link
              href="/register?role=business"
              className="mt-8 inline-flex h-11 items-center rounded-full bg-brand-dark px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Partner with Washuply
            </Link>
          </div>
          <div className="space-y-4">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
              <Image
                src={landingImages.business.src}
                alt={landingImages.business.alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
              <div className="space-y-3 rounded-xl bg-brand-light/60 p-4 font-mono text-xs text-muted">
                <p>
                  <span className="font-semibold text-brand">LD-10482</span> ·
                  Active · Ironing
                </p>
                <p>Outstanding: ₦15,000 · Pickup driver: assigned</p>
                <p className="text-foreground/90">
                  QC passed · Ready for customer collection
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="for-customers"
        className="scroll-mt-20 border-t border-border bg-surface px-4 py-16 sm:px-8 sm:py-20"
      >
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
          <div className="order-2 space-y-4 lg:order-1">
            <div className="relative aspect-[16/11] overflow-hidden rounded-2xl border border-border shadow-sm">
              <Image
                src={landingImages.customer.src}
                alt={landingImages.customer.alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand">
              Why choose Washuply
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Laundry that fits your life—not the other way around
            </h2>
            <p className="mt-4 leading-relaxed text-muted">
              End customers are onboarded by their laundry—not via public
              sign-up. Once your provider adds you in Washuply, you can sign in
              with your phone number and PIN to request pickups, approve quotes,
              and track orders.
            </p>
            <ul className="mt-8 space-y-3">
              {customerPoints.map((point) => (
                <li key={point} className="flex gap-3 text-sm text-foreground">
                  <CheckIcon />
                  {point}
                </li>
              ))}
            </ul>
            <Link
              href="/login?role=customer"
              className="mt-8 inline-flex h-11 items-center rounded-full border-2 border-brand/30 bg-brand-light/50 px-6 text-sm font-semibold text-brand transition-colors hover:border-brand hover:bg-brand-light"
            >
              Customer sign in
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
