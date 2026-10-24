"use client";

import { useCallback, useEffect, useState } from "react";

import {
  enablePushNotifications,
  syncPushTokenWithBackend,
} from "@/lib/push/sync-push-token";
import {
  getBrowserPushSetupStatus,
  type BrowserPushSetupStatus,
} from "@/lib/push/push-setup-state";

type PushEnableBrowserButtonProps = {
  className?: string;
  compact?: boolean;
};

export function PushEnableBrowserButton({
  className = "",
  compact = false,
}: PushEnableBrowserButtonProps) {
  const [status, setStatus] = useState<BrowserPushSetupStatus>("not_configured");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setStatus(getBrowserPushSetupStatus());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("cleanmate-push-message", refresh);
    return () => window.removeEventListener("cleanmate-push-message", refresh);
  }, [refresh]);

  if (status === "ready" || status === "not_configured" || status === "unsupported") {
    return null;
  }

  async function handleClick() {
    setPending(true);
    setError(null);
    try {
      const result =
        status === "needs_token"
          ? await enablePushNotifications()
          : await enablePushNotifications();
      if (!result.ok) {
        setError(result.reason);
      } else {
        await syncPushTokenWithBackend();
      }
      refresh();
      window.dispatchEvent(new Event("cleanmate-push-message"));
    } finally {
      setPending(false);
    }
  }

  if (status === "blocked") {
    return (
      <p className={`text-xs leading-relaxed text-muted ${className}`}>
        Browser notifications are blocked. In Firefox: lock icon → Permissions →
        allow Notifications for this site, then reload.
      </p>
    );
  }

  const label =
    status === "needs_token"
      ? "Connect browser push"
      : "Enable browser notifications";

  return (
    <div className={className}>
      <button
        type="button"
        disabled={pending}
        onClick={() => void handleClick()}
        className={
          compact
            ? "w-full rounded-xl bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-brand/90 disabled:opacity-60"
            : "rounded-full bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand/90 disabled:opacity-60"
        }
      >
        {pending ? "Working…" : label}
      </button>
      {error ? (
        <p className="mt-2 text-xs leading-relaxed text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
