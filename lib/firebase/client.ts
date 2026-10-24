"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

import { getFirebaseConfig, isFirebaseConfigured } from "@/lib/firebase/config";

let analyticsInit: Promise<Analytics | null> | null = null;

/** Singleton Firebase app for the browser client (no-op when env is missing). */
export function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) {
    return null;
  }
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(getFirebaseConfig());
}

/**
 * Firebase Analytics (client-only). Resolves to null when unsupported,
 * unconfigured, or not in a browser.
 */
export function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined" || !isFirebaseConfigured()) {
    return Promise.resolve(null);
  }

  if (!analyticsInit) {
    analyticsInit = (async () => {
      const supported = await isSupported();
      if (!supported) {
        return null;
      }
      const app = getFirebaseApp();
      if (!app) {
        return null;
      }
      return getAnalytics(app);
    })();
  }

  return analyticsInit;
}
