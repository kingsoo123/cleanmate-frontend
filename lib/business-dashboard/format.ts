export function formatNgn(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

const updatedAtTime = new Intl.DateTimeFormat("en-NG", {
  hour: "numeric",
  minute: "2-digit",
});

const updatedAtDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
});

function startOfLocalDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

/** Local date/time label for order “Updated” columns (API sends ISO strings). */
export function formatUpdatedAt(value: string): string {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return value;
  }

  const date = new Date(parsed);
  const now = new Date();
  const dayDiff = Math.round(
    (startOfLocalDay(now) - startOfLocalDay(date)) / 86_400_000,
  );
  const time = updatedAtTime.format(date);

  if (dayDiff === 0) return time;
  if (dayDiff === 1) return `Yesterday · ${time}`;
  if (date.getFullYear() === now.getFullYear()) {
    return `${updatedAtDate.format(date)} · ${time}`;
  }
  return `${updatedAtDate.format(date)} ${date.getFullYear()} · ${time}`;
}

export function formatMessageTime(value: string): string {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  const date = new Date(parsed);
  const now = new Date();
  const sameDay = startOfLocalDay(now) === startOfLocalDay(date);
  if (sameDay) {
    return updatedAtTime.format(date);
  }
  return `${updatedAtDate.format(date)} · ${updatedAtTime.format(date)}`;
}

export function formatUpdatedAtTitle(value: string): string | undefined {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return undefined;
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(parsed));
}
