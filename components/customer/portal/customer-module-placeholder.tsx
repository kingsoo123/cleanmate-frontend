import Link from "next/link";

export function CustomerModulePlaceholder({
  title,
  description,
  primaryHref,
  primaryLabel,
}: {
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
}) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
      {primaryHref && primaryLabel ? (
        <Link
          href={primaryHref}
          className="mt-6 inline-flex rounded-full bg-brand-dark px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          {primaryLabel}
        </Link>
      ) : null}
    </div>
  );
}
