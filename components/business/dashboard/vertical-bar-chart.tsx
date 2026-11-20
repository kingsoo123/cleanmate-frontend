export type BarChartItem = {
  label: string;
  value: number;
};

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}k`;
  return String(value);
}

export function VerticalBarChart({
  items,
  formatValue = formatCompact,
  barClassName = "bg-brand",
  emptyLabel = "No activity in this period.",
}: {
  items: BarChartItem[];
  formatValue?: (value: number) => string;
  barClassName?: string;
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-3 py-10 text-center text-sm text-muted">
        {emptyLabel}
      </p>
    );
  }

  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div
      className="flex h-44 items-end gap-2 sm:gap-3"
      role="img"
      aria-label="Bar chart"
    >
      {items.map((item) => {
        const heightPercent = (item.value / max) * 100;
        return (
          <div
            key={item.label}
            className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
          >
            <span className="text-[10px] font-medium tabular-nums text-muted sm:text-xs">
              {formatValue(item.value)}
            </span>
            <div className="flex w-full flex-1 items-end">
              <div
                className={`w-full min-h-[2px] rounded-t-md transition-all ${barClassName}`}
                style={{
                  height: `${item.value > 0 ? Math.max(heightPercent, 6) : 0}%`,
                }}
                title={`${item.label}: ${formatValue(item.value)}`}
              />
            </div>
            <span className="w-full truncate text-center text-[10px] font-medium text-foreground sm:text-xs">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}