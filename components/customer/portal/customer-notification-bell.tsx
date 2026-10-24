"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AuthApiError } from "@/lib/auth/api-client";
import { subscribeAuthSession } from "@/lib/auth/session";
import {
  CustomerNotificationsList,
} from "@/components/customer/notifications/customer-notifications-list";
import { PushBrowserPushPanel } from "@/components/push-browser-push-panel";
import {
  fetchCustomerNotifications,
  markCustomerNotificationsRead,
} from "@/lib/customer-dashboard/notifications-api";
import type { CustomerNotificationItem } from "@/lib/customer-dashboard/notifications-types";

const POLL_MS = 30_000;
const PANEL_PREVIEW_LIMIT = 8;

export function CustomerNotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CustomerNotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) {
      setLoading(true);
    }
    try {
      const bundle = await fetchCustomerNotifications();
      setItems(bundle.items ?? []);
      setUnreadCount(bundle.unreadCount ?? 0);
      setError(null);
    } catch (err) {
      if (err instanceof AuthApiError && err.status === 401) {
        setItems([]);
        setUnreadCount(0);
        setError(null);
      } else {
        setError(
          err instanceof AuthApiError
            ? err.message
            : "Could not load notifications.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh({ silent: true });
    const timer = window.setInterval(
      () => void refresh({ silent: true }),
      POLL_MS,
    );
    const onPush = () => void refresh({ silent: true });
    window.addEventListener("cleanmate-push-message", onPush);
    const unsubAuth = subscribeAuthSession(() => {
      void refresh({ silent: true });
    });
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("cleanmate-push-message", onPush);
      unsubAuth();
    };
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  async function handleOpen() {
    const next = !open;
    setOpen(next);
    if (next) {
      await refresh();
    }
  }

  async function handleMarkAllRead() {
    await markCustomerNotificationsRead({ all: true });
    await refresh({ silent: true });
  }

  async function handleItemActivate(item: CustomerNotificationItem) {
    if (!item.read) {
      await markCustomerNotificationsRead({ ids: [item.id] });
    }
    setOpen(false);
    await refresh({ silent: true });
  }

  const previewItems = items.slice(0, PANEL_PREVIEW_LIMIT);

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => void handleOpen()}
        className="relative rounded-full p-2 hover:bg-secondary-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        {unreadCount > 0 ? (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
        <svg
          className="h-5 w-5 text-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-surface shadow-lg"
        >
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">
              Notifications
              {unreadCount > 0 ? (
                <span className="ml-1.5 font-normal text-muted">
                  ({unreadCount} new)
                </span>
              ) : null}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={() => void handleMarkAllRead()}
                  className="text-xs font-semibold text-brand hover:underline"
                >
                  Mark all read
                </button>
              ) : null}
              <Link
                href="/customer/notifications"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-muted hover:text-foreground"
              >
                View all
              </Link>
            </div>
          </div>

          {loading ? (
            <p className="px-4 py-8 text-center text-sm text-muted">
              Loading…
            </p>
          ) : error ? (
            <p className="mx-4 my-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
              {error}
            </p>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              <CustomerNotificationsList
                items={previewItems}
                onItemActivate={(item) => void handleItemActivate(item)}
                emptyMessage="No notifications yet. Order updates will appear here."
              />
              {items.length > PANEL_PREVIEW_LIMIT ? (
                <p className="border-t border-border px-4 py-2 text-center text-xs text-muted">
                  <Link
                    href="/customer/notifications"
                    onClick={() => setOpen(false)}
                    className="font-semibold text-brand hover:underline"
                  >
                    See {items.length - PANEL_PREVIEW_LIMIT} more
                  </Link>
                </p>
              ) : null}
            </div>
          )}

          <PushBrowserPushPanel />
        </div>
      ) : null}
    </div>
  );
}
