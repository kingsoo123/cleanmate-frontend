"use client";

import { useCallback, useEffect, useState } from "react";

import { PushEnableBrowserButton } from "@/components/push-enable-browser-button";
import {
  getBrowserPushSetupStatus,
  type BrowserPushSetupStatus,
} from "@/lib/push/push-setup-state";

const STATUS_LABEL: Record<BrowserPushSetupStatus, string> = {
  not_configured: "Push env not loaded in this app build.",
  unsupported: "This browser does not support web push (try Chrome/Firefox, not private mode).",
  blocked: "Notifications blocked — allow them in site permissions.",
  needs_permission: "Not enabled yet.",
  needs_token: "Allowed, but device not registered.",
  ready: "Connected on this device.",
};

export function PushBrowserPushPanel() {
  const [status, setStatus] = useState<BrowserPushSetupStatus>("not_configured");

  const refresh = useCallback(() => {
    setStatus(getBrowserPushSetupStatus());
  }, []);

  useEffect(() => {
    refresh();
    window.addEventListener("cleanmate-push-message", refresh);
    return () => window.removeEventListener("cleanmate-push-message", refresh);
  }, [refresh]);

  return (
    <div className="space-y-2 border-t border-border bg-secondary-surface/40 px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
        Browser push
      </p>
      <p className="text-xs text-muted">{STATUS_LABEL[status]}</p>
      <PushEnableBrowserButton compact />
    </div>
  );
}
