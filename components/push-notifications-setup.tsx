"use client";

import { useEffect } from "react";

import { subscribeAuthSession } from "@/lib/auth/session";
import { isFcmConfigured } from "@/lib/firebase/config";
import { subscribeForegroundPushMessages } from "@/lib/firebase/messaging";
import { syncPushTokenWithBackend } from "@/lib/push/sync-push-token";

/**
 * When signed in, syncs FCM if notifications are already allowed and listens
 * for foreground messages. Use PushNotificationsEnablePrompt for the permission dialog.
 */
export function PushNotificationsSetup() {
  useEffect(() => {
    if (!isFcmConfigured()) {
      return;
    }

    const unsubscribePush = subscribeForegroundPushMessages((payload) => {
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted" &&
        payload.title
      ) {
        try {
          new Notification(payload.title, {
            body: payload.body,
            icon: "/window.svg",
          });
        } catch {
          /* some browsers block unless from user gesture */
        }
      }
    });

    void syncPushTokenWithBackend();

    const unsubscribeAuth = subscribeAuthSession(() => {
      void syncPushTokenWithBackend();
    });

    return () => {
      unsubscribePush();
      unsubscribeAuth();
    };
  }, []);

  return null;
}
