"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { NotificationsView } from "@/components/business/notifications/notifications-view";
import { AuthApiError } from "@/lib/auth/api-client";
import {
  fetchBusinessNotifications,
  updateBusinessNotificationSettings,
} from "@/lib/business-dashboard/notifications-api";
import type {
  NotificationChannel,
  NotificationEventConfig,
  NotificationsData,
} from "@/lib/business-dashboard/notifications-types";

function NotificationsFallback() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-4">
      <div className="h-10 w-48 rounded-lg bg-secondary-surface" />
      <div className="h-12 rounded-xl bg-secondary-surface" />
      <div className="h-64 rounded-2xl bg-secondary-surface" />
    </div>
  );
}

export function BusinessNotificationsClient() {
  return (
    <Suspense fallback={<NotificationsFallback />}>
      <BusinessNotificationsContent />
    </Suspense>
  );
}

function BusinessNotificationsContent() {
  const [data, setData] = useState<NotificationsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const bundle = await fetchBusinessNotifications();
      setData(bundle);
      setError(null);
    } catch (err) {
      const message =
        err instanceof AuthApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not load notifications.";
      setError(message);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function persistSettings(patch: {
    channelEnabled?: NotificationsData["channelEnabled"];
    events?: NotificationEventConfig[];
  }) {
    if (!data) return;
    setSaving(true);
    try {
      await updateBusinessNotificationSettings({
        channelEnabled: patch.channelEnabled,
        events: patch.events?.map((event) => ({
          id: event.id,
          channels: event.channels,
        })),
      });
      setError(null);
    } catch (err) {
      const message =
        err instanceof AuthApiError
          ? err.message
          : "Could not save notification settings.";
      setError(message);
      await load();
    } finally {
      setSaving(false);
    }
  }

  function handleToggleChannel(channel: NotificationChannel) {
    if (!data) return;
    const next = {
      ...data.channelEnabled,
      [channel]: !data.channelEnabled[channel],
    };
    setData({ ...data, channelEnabled: next });
    void persistSettings({ channelEnabled: next });
  }

  function handleToggleEventChannel(
    eventId: NotificationEventConfig["id"],
    channel: NotificationChannel,
  ) {
    if (!data || !data.channelEnabled[channel]) return;
    const events = data.events.map((event) =>
      event.id === eventId
        ? {
            ...event,
            channels: {
              ...event.channels,
              [channel]: !event.channels[channel],
            },
          }
        : event,
    );
    setData({ ...data, events });
    void persistSettings({ events });
  }

  if (error && !data) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        {error}
      </p>
    );
  }

  if (!data) {
    return <NotificationsFallback />;
  }

  return (
    <>
      {error ? (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {error}
        </p>
      ) : null}
      {saving ? (
        <p className="mb-2 text-xs text-muted">Saving settings…</p>
      ) : null}
      <NotificationsView
        data={data}
        onToggleChannel={handleToggleChannel}
        onToggleEventChannel={handleToggleEventChannel}
      />
    </>
  );
}
