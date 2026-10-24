"use client";

import Link from "next/link";
import { formatUpdatedAt } from "@/lib/business-dashboard/format";
import type { CustomerNotificationItem } from "@/lib/customer-dashboard/notifications-types";

export function CustomerNotificationsList({
  items,
  onItemActivate,
  emptyMessage = "No notifications yet.",
}: {
  items: CustomerNotificationItem[];
  onItemActivate?: (item: CustomerNotificationItem) => void;
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-sm text-muted">{emptyMessage}</p>
    );
  }

  return (
    <ul>
      {items.map((item) => {
        const row = <CustomerNotificationRow item={item} />;
        const className = `block border-b border-border px-4 py-3 transition-colors hover:bg-secondary-surface/60 ${
          item.read ? "opacity-75" : "bg-brand-light/10"
        }`;

        if (item.href) {
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                onClick={() => onItemActivate?.(item)}
                className={className}
              >
                {row}
              </Link>
            </li>
          );
        }

        return (
          <li key={item.id} className={className}>
            {row}
          </li>
        );
      })}
    </ul>
  );
}

export function CustomerNotificationRow({
  item,
}: {
  item: CustomerNotificationItem;
}) {
  const tag = item.tag ?? item.trackingCode;

  return (
    <div className="flex gap-3 text-left">
      <span
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
          item.read ? "bg-transparent" : "bg-brand"
        }`}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{item.title}</p>
        <p className="mt-0.5 line-clamp-3 text-xs text-muted">{item.body}</p>
        {tag ? (
          <p className="mt-1 font-mono text-[10px] font-semibold text-brand">
            Tag {tag}
          </p>
        ) : null}
        <p className="mt-1 text-[10px] text-muted">
          {formatUpdatedAt(item.createdAt)}
        </p>
      </div>
    </div>
  );
}
