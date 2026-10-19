import Image from "next/image";
import { AppDownloadButtons } from "@/components/landing/app-download-buttons";
import { landingImages } from "@/lib/landing-images";

const avatars = [
  { bg: "bg-violet-300", label: "A" },
  { bg: "bg-indigo-300", label: "B" },
  { bg: "bg-purple-300", label: "C" },
  { bg: "bg-blue-300", label: "D" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-surface px-4 pb-12 pt-10 sm:px-8 sm:pb-16 sm:pt-14">
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-2 lg:items-center lg:gap-16 xl:gap-20">
        <div className="order-2 flex flex-col gap-8 sm:gap-10 lg:order-1 lg:max-w-xl lg:gap-11 lg:pr-6">
          <p className="inline-flex w-fit rounded-full border border-border bg-secondary-surface px-4 py-2 text-sm font-medium text-muted">
            At-home laundry & dry-cleaning service
          </p>
          <h1 className="text-4xl font-bold leading-[1.2] tracking-tight text-foreground sm:text-5xl sm:leading-[1.18] lg:text-[3.25rem] lg:leading-[1.15]">
            We pick up your{" "}
            <span className="text-brand">clothes.</span>
            <br />
            You get them back{" "}
            <span className="text-brand">clean.</span>
          </h1>
          <p className="max-w-lg text-base leading-7 text-muted sm:text-lg sm:leading-8">
            CleanMate connects you with trusted laundries—schedule pickup,
            track every stage, approve your quote, and pay clearly. For
            businesses, it is the same platform powering orders, drivers, and
            payments behind the scenes.
          </p>
          <AppDownloadButtons />
          <div className="flex items-center gap-4 pt-1">
            <div className="flex -space-x-2">
              {avatars.map((a) => (
                <span
                  key={a.label}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-surface text-xs font-bold text-brand-dark ${a.bg}`}
                >
                  {a.label}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted">
              <span className="font-semibold text-foreground">4.9/5</span> by
              120+ clients
            </p>
          </div>
        </div>

        <div className="relative order-1 mx-auto w-full max-w-md lg:order-2 lg:max-w-none">
          <div
            className="absolute -right-4 top-8 h-[88%] w-[88%] rounded-[42%] bg-brand-light lg:-right-8"
            aria-hidden
          />
          <div className="relative mx-auto aspect-[4/5] max-w-sm overflow-hidden rounded-[38%] sm:max-w-md lg:max-w-lg">
            <Image
              src={landingImages.heroAccent.src}
              alt={landingImages.heroAccent.alt}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 90vw, 480px"
            />
          </div>
          <Sparkle className="absolute left-0 top-1/4 text-brand/80" />
          <Sparkle className="absolute bottom-1/4 right-2 text-brand/60 sm:right-8" />
        </div>
      </div>
    </section>
  );
}

function Sparkle({ className }: { className?: string }) {
  return (
    <svg
      className={`h-6 w-6 ${className ?? ""}`}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 0l2.2 6.8H21l-5.5 4 2.1 6.8L12 17.4 6.4 17.6l2.1-6.8L3 6.8h6.8L12 0z" />
    </svg>
  );
}
