"use client";

import { useCallback, useEffect, useState } from "react";

import { PushEnableBrowserButton } from "@/components/push-enable-browser-button";
import { getAccessToken, subscribeAuthSession } from "@/lib/auth/session";
import {
  getBrowserPushSetupStatus,
  type BrowserPushSetupStatus,
} from "@/lib/push/push-setup-state";

/**
 * Banner under the portal top bar when browser push is not fully set up.
 */
export function PushNotificationsEnablePrompt() {
  const [status, setStatus] = useState<BrowserPushSetupStatus>("not_configured");
  const [signedIn, setSignedIn] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const refresh = useCallback(() => {
    setStatus(getBrowserPushSetupStatus());
    setSignedIn(Boolean(getAccessToken()));
  }, []);

  useEffect(() => {
    refresh();
    const onAuth = subscribeAuthSession(refresh);
    window.addEventListener("cleanmate-push-message", refresh);
    return () => {
      onAuth();
      window.removeEventListener("cleanmate-push-message", refresh);
    };
  }, [refresh]);

  const showBanner =
    signedIn &&
    !dismissed &&
    (status === "needs_permission" ||
      status === "needs_token" ||
      status === "blocked");

  if (!showBanner) {
    return null;
  }

  const message =
    status === "blocked"
      ? "Browser notifications are blocked for this site."
      : status === "needs_token"
        ? "Notifications are allowed, but this device is not registered for push yet."
        : "Turn on browser notifications for order and message alerts.";

  return (
    <div
      role="status"
      className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-brand/30 bg-brand-light/60 px-4 py-2.5 text-xs text-foreground sm:px-6"
    >
      <span className="font-medium">{message}</span>
      <div className="flex shrink-0 items-center gap-2">
        {status !== "blocked" ? <PushEnableBrowserButton /> : null}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="rounded-full px-2 py-1.5 font-medium text-muted hover:text-foreground"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
