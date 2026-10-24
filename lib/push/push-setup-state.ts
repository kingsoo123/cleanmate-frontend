"use client";

import { isFcmConfigured } from "@/lib/firebase/config";
import { getStoredFcmToken } from "@/lib/firebase/messaging";

export type BrowserPushSetupStatus =
  | "unsupported"
  | "not_configured"
  | "blocked"
  | "needs_permission"
  | "needs_token"
  | "ready";

export function getBrowserPushSetupStatus(): BrowserPushSetupStatus {
  if (!isFcmConfigured()) {
    return "not_configured";
  }
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }

  const permission = Notification.permission;
  if (permission === "denied") {
    return "blocked";
  }
  if (permission === "default") {
    return "needs_permission";
  }
  if (!getStoredFcmToken()) {
    return "needs_token";
  }
  return "ready";
}
