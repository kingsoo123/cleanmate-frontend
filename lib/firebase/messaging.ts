"use client";

import {
  deleteToken,
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type Messaging,
} from "firebase/messaging";

import { getFirebaseVapidKey, isFcmConfigured } from "@/lib/firebase/config";
import { getFirebaseApp } from "@/lib/firebase/client";

export const FCM_SW_PATH =
  "/firebase-cloud-messaging-push-scope/firebase-messaging-sw.js";
export const FCM_SW_SCOPE = "/firebase-cloud-messaging-push-scope/";

const STORED_TOKEN_KEY = "cleanmate_fcm_token";

let messagingInstance: Messaging | null = null;
let messagingReady: Promise<Messaging | null> | null = null;

export function getStoredFcmToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORED_TOKEN_KEY);
}

export function setStoredFcmToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(STORED_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(STORED_TOKEN_KEY);
  }
}

export async function getFirebaseMessaging(): Promise<Messaging | null> {
  if (!isFcmConfigured()) {
    return null;
  }

  if (messagingReady) {
    return messagingReady;
  }

  messagingReady = (async () => {
    const supported = await isSupported();
    if (!supported) {
      return null;
    }
    const app = getFirebaseApp();
    if (!app) {
      return null;
    }
    messagingInstance = getMessaging(app);
    return messagingInstance;
  })();

  return messagingReady;
}

async function waitForServiceWorkerActivation(
  registration: ServiceWorkerRegistration,
): Promise<void> {
  if (registration.active) {
    return;
  }

  const worker = registration.installing ?? registration.waiting;
  if (!worker) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error("Service worker activation timed out."));
    }, 20_000);

    worker.addEventListener("statechange", () => {
      if (worker.state === "activated") {
        window.clearTimeout(timeout);
        resolve();
      }
      if (worker.state === "redundant") {
        window.clearTimeout(timeout);
        reject(new Error("Service worker failed to activate."));
      }
    });
  });
}

export async function ensureMessagingServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  let registration =
    (await navigator.serviceWorker.getRegistration(FCM_SW_SCOPE)) ?? null;

  if (!registration) {
    registration = await navigator.serviceWorker.register(FCM_SW_PATH, {
      scope: FCM_SW_SCOPE,
    });
  }

  await waitForServiceWorkerActivation(registration);
  return registration;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied";
  }
  if (Notification.permission === "granted") {
    return "granted";
  }
  if (Notification.permission === "denied") {
    return "denied";
  }
  return Notification.requestPermission();
}

export async function acquireFcmToken(options?: {
  /** When false, never shows the browser permission dialog (default). */
  prompt?: boolean;
}): Promise<string | null> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return null;
  }

  let permission = Notification.permission;
  if (permission === "default") {
    if (!options?.prompt) {
      return null;
    }
    permission = await Notification.requestPermission();
  }

  if (permission !== "granted") {
    return null;
  }

  const messaging = await getFirebaseMessaging();
  const vapidKey = getFirebaseVapidKey();
  if (!messaging || !vapidKey) {
    return null;
  }

  const registration = await ensureMessagingServiceWorker();
  if (!registration) {
    return null;
  }

  try {
    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      setStoredFcmToken(token);
    }

    return token;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to get FCM token.";
    throw new Error(message);
  }
}

export async function revokeFcmToken(): Promise<void> {
  const messaging = await getFirebaseMessaging();
  const stored = getStoredFcmToken();
  if (!messaging || !stored) {
    setStoredFcmToken(null);
    return;
  }

  try {
    await deleteToken(messaging);
  } catch {
    /* token may already be invalid */
  }
  setStoredFcmToken(null);
}

export function subscribeForegroundPushMessages(
  handler: (payload: { title?: string; body?: string; href?: string }) => void,
): () => void {
  let cancelled = false;
  let unsubscribe: (() => void) | null = null;

  void getFirebaseMessaging().then((messaging) => {
    if (cancelled || !messaging) return;
    unsubscribe = onMessage(messaging, (payload) => {
      const title = payload.notification?.title ?? payload.data?.title;
      const body = payload.notification?.body ?? payload.data?.body;
      const href = payload.data?.href;
      handler({
        title: title ?? undefined,
        body: body ?? undefined,
        href: typeof href === "string" ? href : undefined,
      });
      window.dispatchEvent(new Event("cleanmate-push-message"));
    });
  });

  return () => {
    cancelled = true;
    unsubscribe?.();
  };
}
