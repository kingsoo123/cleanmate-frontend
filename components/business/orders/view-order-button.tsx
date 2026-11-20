import Link from "next/link";

export function ViewOrderButton({
  orderId,
  className = "",
}: {
  orderId: string;
  className?: string;
}) {
  return (
    <Link
      href={`/business/orders/${orderId}`}
      className={`inline-flex h-8 items-center justify-center rounded-full border border-border bg-surface px-3 text-xs font-semibold text-foreground transition-colors hover:bg-secondary-surface ${className}`}
    >
      View
    </Link>
  );
}