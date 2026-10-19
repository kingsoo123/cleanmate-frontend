export function MetricCard({
  label,
  value,
  hint,
  trend,
  accent = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  trend?: { direction: "up" | "down" | "neutral"; text: string };
  accent?: "default" | "brand" | "warning" | "success";
}) {
  const accentBorder = {
    default: "border-border",
    brand: "border-brand/30",
    warning: "border-amber-200",
    success: "border-emerald-200",
  }[accent];

  return (
    <article
      className={`rounded-2xl border bg-surface p-4 shadow-sm ${accentBorder}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      {trend ? (
        <p
          className={`mt-2 text-xs font-medium ${
            trend.direction === "up"
              ? "text-emerald-700"
              : trend.direction === "down"
                ? "text-red-600"
                : "text-muted"
          }`}
        >
          {trend.text}
        </p>
      ) : null}
    </article>
  );
}
