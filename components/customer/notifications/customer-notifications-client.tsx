"use client";

import { useCallback, useEffect, useState } from "react";
import { AuthApiError } from "@/lib/auth/api-client";
import { subscribeAuthSession } from "@/lib/auth/session";
import { CustomerNotificationsList } from "@/components/customer/notifications/customer-notifications-list";
import { PushEnableBrowserButton } from "@/components/push-enable-browser-button";
import {
  fetchCustomerNotifications,
  markCustomerNotificationsRead,
} from "@/lib/customer-dashboard/notifications-api";
import type { CustomerNotificationItem } from "@/lib/customer-dashboard/notifications-types";

export function CustomerNotificationsClient() {
  const [items, setItems] = useState<CustomerNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const bundle = await fetchCustomerNotifications();
      setItems(bundle.items ?? []);
      setUnreadCount(bundle.unreadCount ?? 0);
      setError(null);
    } catch (err) {
      setItems([]);
      setUnreadCount(0);
      setError(
        err instanceof AuthApiError
          ? err.message
          : "Could not load notifications.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    return subscribeAuthSession(() => {
      void load();
    });
  }, [load]);

  async function markAllRead() {
    await markCustomerNotificationsRead({ all: true });
    await load();
  }

  async function handleItemActivate(item: CustomerNotificationItem) {
    if (!item.read) {
      await markCustomerNotificationsRead({ ids: [item.id] });
      await load();
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-lg animate-pulse space-y-3">
        <div className="h-8 w-48 rounded-lg bg-secondary-surface" />
        <div className="h-24 rounded-2xl bg-secondary-surface" />
        <div className="h-24 rounded-2xl bg-secondary-surface" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted">Account</p>
          <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
          {unreadCount > 0 ? (
            <p className="mt-1 text-sm text-muted">
              <span className="font-semibold text-brand">{unreadCount}</span>{" "}
              unread
            </p>
          ) : null}
        </div>
        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={() => void markAllRead()}
            className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary-surface"
          >
            Mark all read
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <CustomerNotificationsList
          items={items}
          onItemActivate={(item) => void handleItemActivate(item)}
          emptyMessage="When your laundry registers an order or records a payment, you'll see it here."
        />
      </section>

      <section className="rounded-2xl border border-border bg-secondary-surface/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Browser push
        </p>
        <p className="mt-1 text-sm text-muted">
          Get alerts on this device when the app is in the background.
        </p>
        <div className="mt-3">
          <PushEnableBrowserButton />
        </div>
      </section>
    </div>
  );
}
