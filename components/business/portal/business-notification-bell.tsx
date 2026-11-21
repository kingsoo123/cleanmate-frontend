"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AuthApiError } from "@/lib/auth/api-client";
import {
  fetchBusinessInboxSummary,
  markBusinessInboxRead,
} from "@/lib/business-dashboard/notifications-api";
import type { BusinessInboxItem } from "@/lib/business-dashboard/notifications-types";
import { PushBrowserPushPanel } from "@/components/push-browser-push-panel";
import { formatUpdatedAt } from "@/lib/business-dashboard/format";

const POLL_MS = 30_000;

export function BusinessNotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<BusinessInboxItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    try {
      const summary = await fetchBusinessInboxSummary();
      setItems(summary.items ?? []);
      setUnreadCount(summary.unreadCount ?? 0);
    } catch (err) {
      if (err instanceof AuthApiError && err.status === 401) {
        setItems([]);
        setUnreadCount(0);
      }
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => {
      void refresh();
    }, POLL_MS);
    window.addEventListener("cleanmate-push-message", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("cleanmate-push-message", refresh);
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
    await markBusinessInboxRead({ all: true });
    await refresh();
  }

  async function handleItemClick(item: BusinessInboxItem) {
    if (!item.read) {
      await markBusinessInboxRead({ itemKeys: [item.id] });
    }
    setOpen(false);
    await refresh();
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => void handleOpen()}
        className="relative rounded-full p-2 hover:bg-secondary-surface"
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={open}
      >
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
        <svg
          className="h-5 w-5 text-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
      </button>

      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-surface shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Alerts</p>
            <div className="flex items-center gap-2">
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
                href="/business/notifications"
                onClick={() => setOpen(false)}
                className="text-xs font-semibold text-muted hover:text-foreground"
              >
                Settings
              </Link>
            </div>
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-muted">
                No alerts right now.
              </li>
            ) : (
              items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={() => void handleItemClick(item)}
                    className={`block border-b border-border px-4 py-3 text-left transition-colors hover:bg-secondary-surface/60 ${
                      item.read ? "opacity-70" : ""
                    }`}
                  >
                    <p className="text-sm font-semibold text-foreground">
                      {item.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                      {item.body}
                    </p>
                    <p className="mt-1 text-[10px] text-muted">
                      {formatUpdatedAt(item.createdAt)}
                    </p>
                  </Link>
                </li>
              ))
            )}
          </ul>
          <PushBrowserPushPanel />
        </div>
      ) : null}
    </div>
  );
}
