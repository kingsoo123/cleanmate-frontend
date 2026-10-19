"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  countLogByFilter,
  filterNotificationLog,
  parseNotificationLogFilter,
} from "@/lib/business-dashboard/get-notifications-data";
import type {
  NotificationChannel,
  NotificationEventConfig,
  NotificationLogEntry,
  NotificationLogFilter,
  NotificationsData,
  NotificationTemplate,
} from "@/lib/business-dashboard/notifications-types";

const channelLabels: Record<NotificationChannel, string> = {
  sms: "SMS",
  email: "Email",
  whatsapp: "WhatsApp",
};

const logFilters: { id: NotificationLogFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "sent", label: "Sent" },
  { id: "failed", label: "Failed" },
];

type TabId = "channels" | "events" | "templates" | "log";

export function NotificationsView({ initialData }: { initialData: NotificationsData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") as TabId) || "log";
  const logFilter = parseNotificationLogFilter(searchParams.get("filter") ?? undefined);

  const [channelEnabled, setChannelEnabled] = useState(initialData.channelEnabled);
  const [events, setEvents] = useState(initialData.events);
  const [log] = useState(initialData.log);
  const [query, setQuery] = useState("");

  const filteredLog = useMemo(
    () => filterNotificationLog(log, logFilter, query),
    [log, logFilter, query],
  );
  const logCounts = useMemo(() => countLogByFilter(log), [log]);

  function setTab(next: TabId) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "log") params.delete("tab");
    else params.set("tab", next);
    router.replace(
      params.toString()
        ? `/business/notifications?${params.toString()}`
        : "/business/notifications",
      { scroll: false },
    );
  }

  function setLogFilter(next: NotificationLogFilter) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("filter");
    else params.set("filter", next);
    router.replace(
      params.toString()
        ? `/business/notifications?${params.toString()}`
        : "/business/notifications",
      { scroll: false },
    );
  }

  function toggleChannel(channel: NotificationChannel) {
    setChannelEnabled((prev) => ({ ...prev, [channel]: !prev[channel] }));
  }

  function toggleEventChannel(
    eventId: NotificationEventConfig["id"],
    channel: NotificationChannel,
  ) {
    if (!channelEnabled[channel]) return;
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId
          ? {
              ...event,
              channels: {
                ...event.channels,
                [channel]: !event.channels[channel],
              },
            }
          : event,
      ),
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "log", label: "Delivery log" },
    { id: "channels", label: "Channels" },
    { id: "events", label: "Events" },
    { id: "templates", label: "Templates" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <p className="text-sm font-medium text-muted">Communications</p>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Notifications
        </h2>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-border pb-px">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 border-b-2 px-3 py-2 text-sm font-semibold transition-colors ${
              tab === t.id
                ? "border-brand text-brand"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "channels" ? (
        <ChannelsPanel enabled={channelEnabled} onToggle={toggleChannel} />
      ) : null}

      {tab === "events" ? (
        <EventsPanel
          events={events}
          channelEnabled={channelEnabled}
          onToggle={toggleEventChannel}
        />
      ) : null}

      {tab === "templates" ? (
        <TemplatesPanel templates={initialData.templates} />
      ) : null}

      {tab === "log" ? (
        <LogPanel
          entries={filteredLog}
          counts={logCounts}
          filter={logFilter}
          query={query}
          onQueryChange={setQuery}
          onFilterChange={setLogFilter}
        />
      ) : null}

      <p className="text-xs text-muted">
        Channel and event toggles are saved on this device (preview). Template
        editing and provider credentials will live under Settings when the
        notification API is connected.
      </p>
    </div>
  );
}

function ChannelsPanel({
  enabled,
  onToggle,
}: {
  enabled: Record<NotificationChannel, boolean>;
  onToggle: (channel: NotificationChannel) => void;
}) {
  const items: {
    channel: NotificationChannel;
    title: string;
    description: string;
  }[] = [
    {
      channel: "sms",
      title: "SMS",
      description: "Primary channel for order updates and OTP-style alerts.",
    },
    {
      channel: "email",
      title: "Email",
      description: "Receipts, quotations, and ready-for-collection summaries.",
    },
    {
      channel: "whatsapp",
      title: "WhatsApp",
      description: "Optional rich messages when your WABA is connected.",
    },
  ];

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.channel}
          className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-surface p-5 shadow-sm"
        >
          <div>
            <p className="font-semibold text-foreground">{item.title}</p>
            <p className="mt-1 text-sm text-muted">{item.description}</p>
          </div>
          <Toggle
            checked={enabled[item.channel]}
            onChange={() => onToggle(item.channel)}
            label={`Enable ${item.title}`}
          />
        </li>
      ))}
    </ul>
  );
}

function EventsPanel({
  events,
  channelEnabled,
  onToggle,
}: {
  events: NotificationEventConfig[];
  channelEnabled: Record<NotificationChannel, boolean>;
  onToggle: (
    eventId: NotificationEventConfig["id"],
    channel: NotificationChannel,
  ) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border px-5 py-3">
        <p className="font-semibold text-foreground">Customer events</p>
        <p className="text-xs text-muted">
          Choose which channels fire for each automation
        </p>
      </div>
      <ul className="divide-y divide-border">
        {events.map((event) => (
          <li key={event.id} className="px-5 py-4">
            <p className="font-medium text-foreground">{event.label}</p>
            <p className="text-sm text-muted">{event.description}</p>
            <div className="mt-3 flex flex-wrap gap-4">
              {(["sms", "email", "whatsapp"] as NotificationChannel[]).map(
                (channel) => (
                  <label
                    key={channel}
                    className={`flex items-center gap-2 text-sm ${
                      channelEnabled[channel]
                        ? "text-foreground"
                        : "text-muted"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={event.channels[channel]}
                      disabled={!channelEnabled[channel]}
                      onChange={() => onToggle(event.id, channel)}
                      className="h-4 w-4 rounded border-border text-brand focus:ring-brand disabled:opacity-40"
                    />
                    {channelLabels[channel]}
                  </label>
                ),
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TemplatesPanel({ templates }: { templates: NotificationTemplate[] }) {
  return (
    <ul className="space-y-4">
      {templates.map((template) => (
        <li
          key={`${template.eventId}-${template.channel}`}
          className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-semibold text-brand">
              {channelLabels[template.channel]}
            </span>
            <span className="text-sm font-medium text-foreground">
              {template.eventId.replace(/_/g, " ")}
            </span>
          </div>
          {template.subject ? (
            <p className="mt-3 text-sm">
              <span className="font-semibold text-muted">Subject: </span>
              {template.subject}
            </p>
          ) : null}
          <pre className="mt-3 whitespace-pre-wrap rounded-xl bg-secondary-surface/60 p-3 text-xs leading-relaxed text-foreground">
            {template.bodyPreview}
          </pre>
          <button
            type="button"
            disabled
            className="mt-3 cursor-not-allowed text-xs font-semibold text-muted"
          >
            Edit template (soon)
          </button>
        </li>
      ))}
    </ul>
  );
}

function LogPanel({
  entries,
  counts,
  filter,
  query,
  onQueryChange,
  onFilterChange,
}: {
  entries: NotificationLogEntry[];
  counts: Record<NotificationLogFilter, number>;
  filter: NotificationLogFilter;
  query: string;
  onQueryChange: (q: string) => void;
  onFilterChange: (f: NotificationLogFilter) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search customer, event, recipient…"
          className="max-w-md flex-1 rounded-xl border border-border bg-surface py-2.5 px-4 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        />
        <div className="flex gap-2">
          {logFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onFilterChange(f.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                filter === f.id
                  ? "bg-brand text-white"
                  : "border border-border bg-surface text-muted"
              }`}
            >
              {f.label} ({counts[f.id]})
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-medium">When</th>
                <th className="py-3 pr-4 font-medium">Event</th>
                <th className="py-3 pr-4 font-medium">Customer</th>
                <th className="py-3 pr-4 font-medium">Channel</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted">
                    No log entries match.
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-secondary-surface/30">
                    <td className="px-5 py-3 text-muted">{entry.sentAt}</td>
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {entry.eventLabel}
                    </td>
                    <td className="py-3 pr-4">{entry.customerName}</td>
                    <td className="py-3 pr-4 text-muted">
                      {channelLabels[entry.channel]}
                    </td>
                    <td className="py-3 pr-4">
                      <LogStatusBadge status={entry.status} />
                    </td>
                    <td className="px-5 py-3 text-xs text-muted">
                      <p>{entry.recipient}</p>
                      {entry.detail ? <p>{entry.detail}</p> : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LogStatusBadge({ status }: { status: NotificationLogEntry["status"] }) {
  const styles = {
    Sent: "bg-emerald-50 text-emerald-800",
    Failed: "bg-red-50 text-red-800",
    Queued: "bg-amber-50 text-amber-900",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        checked ? "bg-brand" : "bg-secondary-surface ring-1 ring-border"
      }`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
          checked ? "left-[1.35rem]" : "left-0.5"
        }`}
      />
    </button>
  );
}
