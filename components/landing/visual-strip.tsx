import Image from "next/image";
import { landingImages } from "@/lib/landing-images";

export function VisualStrip() {
  return (
    <section className="border-t border-border bg-brand-light/35 px-4 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-center text-sm font-medium text-muted">
          Fresh laundry, clear tracking—{" "}
          <span className="font-semibold text-brand">the CleanMate standard</span>
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[landingImages.washing, landingImages.hero, landingImages.sunnyHome].map(
            (img) => (
              <div
                key={img.src}
                className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-surface shadow-sm"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
