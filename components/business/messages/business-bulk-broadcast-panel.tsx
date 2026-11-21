"use client";

import { useState } from "react";
import { AuthApiError } from "@/lib/auth/api-client";
import { useAuthUser } from "@/lib/auth/use-auth-user";
import { sendBulkBusinessMessages } from "@/lib/business-dashboard/messages-api";

export function BusinessBulkBroadcastPanel({
  onSent,
}: {
  onSent?: () => void;
}) {
  const user = useAuthUser();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [includeCustomers, setIncludeCustomers] = useState(true);
  const [includeStaff, setIncludeStaff] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (user?.role !== "business") {
    return null;
  }

  async function handleSend() {
    const text = body.trim();
    if (!text) {
      setError("Enter a message to send.");
      return;
    }
    if (!includeCustomers && !includeStaff) {
      setError("Select at least one audience.");
      return;
    }
    if (
      !window.confirm(
        "Send this message to everyone in the selected groups? This cannot be undone.",
      )
    ) {
      return;
    }

    setSending(true);
    setError(null);
    setResult(null);
    try {
      const summary = await sendBulkBusinessMessages({
        body: text,
        includeCustomers,
        includeStaff,
      });
      const parts: string[] = [];
      if (includeCustomers) {
        parts.push(
          `${summary.customers.sent} of ${summary.customers.attempted} customers`,
        );
        if (summary.customers.failed.length > 0) {
          parts.push(`${summary.customers.failed.length} customer send failures`);
        }
      }
      if (includeStaff) {
        parts.push(
          `${summary.staff.count} staff (managers & riders) notified`,
        );
      }
      setResult(`Sent: ${parts.join("; ")}.`);
      setBody("");
      setOpen(false);
      onSent?.();
    } catch (err) {
      setError(
        err instanceof AuthApiError
          ? err.message
          : "Bulk send failed. Try again.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <div>
          <p className="text-sm font-semibold text-foreground">
            Broadcast to everyone
          </p>
          <p className="text-xs text-muted">
            One message to all customers (inbox) and staff (push alert).
          </p>
        </div>
        <svg
          className={`h-5 w-5 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open ? (
        <div className="space-y-4 border-t border-border px-4 py-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeCustomers}
                onChange={(e) => setIncludeCustomers(e.target.checked)}
                className="rounded border-border text-brand focus:ring-brand"
              />
              All customers
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeStaff}
                onChange={(e) => setIncludeStaff(e.target.checked)}
                className="rounded border-border text-brand focus:ring-brand"
              />
              Branch managers & riders
            </label>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="Write your announcement…"
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
          {error ? (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          {result ? (
            <p className="text-sm text-foreground" role="status">
              {result}
            </p>
          ) : null}
          <button
            type="button"
            disabled={sending}
            onClick={() => void handleSend()}
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send broadcast"}
          </button>
        </div>
      ) : null}
    </div>
  );
}