"use client";

import {
  acquireFcmToken,
  getStoredFcmToken,
  revokeFcmToken,
} from "@/lib/firebase/messaging";
import { isFcmConfigured } from "@/lib/firebase/config";
import { getAccessToken } from "@/lib/auth/session";
import { registerPushToken, unregisterPushToken } from "@/lib/push/push-api";

/** Refreshes FCM registration when permission was already granted (no permission dialog). */
export async function syncPushTokenWithBackend(): Promise<void> {
  if (!isFcmConfigured() || !getAccessToken()) {
    return;
  }

  const token = await acquireFcmToken({ prompt: false });
  if (!token) {
    return;
  }

  await registerPushToken(token);
}

export type EnablePushResult =
  | { ok: true }
  | { ok: false; reason: string };

/** Call from a button click — shows the browser “Allow notifications?” prompt when needed. */
export async function enablePushNotifications(): Promise<EnablePushResult> {
  if (!isFcmConfigured()) {
    return {
      ok: false,
      reason: "Firebase push is not configured in this build (missing env vars).",
    };
  }
  if (!getAccessToken()) {
    return { ok: false, reason: "Sign in again, then retry." };
  }

  try {
    const token = await acquireFcmToken({ prompt: true });
    if (!token) {
      return {
        ok: false,
        reason:
          Notification.permission === "denied"
            ? "Notifications are blocked for this site in browser settings."
            : "Could not get an FCM token. Allow notifications and retry.",
      };
    }

    await registerPushToken(token);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason:
        error instanceof Error ? error.message : "Push registration failed.",
    };
  }
}

/** Removes the FCM token locally and from the API (call before clearing auth session). */
export async function unregisterPushFromBackend(): Promise<void> {
  const token = getStoredFcmToken();
  if (token && getAccessToken()) {
    try {
      await unregisterPushToken(token);
    } catch {
      /* session may already be invalid */
    }
  }
  await revokeFcmToken();
}
