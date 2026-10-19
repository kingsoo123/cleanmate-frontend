import Link from "next/link";

export function BusinessModulePlaceholder({
  title,
  description,
  primaryAction,
}: {
  title: string;
  description: string;
  primaryAction?: { label: string; href: string };
}) {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
      {primaryAction ? (
        <Link
          href={primaryAction.href}
          className="mt-6 inline-flex rounded-full bg-brand-dark px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          {primaryAction.label}
        </Link>
      ) : null}
      <p className="mt-6 text-xs text-muted">
        Module wiring comes next in the PRD implementation sequence.
      </p>
    </div>
  );
}
