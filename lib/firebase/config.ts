import type { FirebaseOptions } from "firebase/app";

/**
 * Next.js only exposes NEXT_PUBLIC_* to the browser when accessed statically
 * (process.env.NEXT_PUBLIC_FOO), not via process.env[variableName].
 */
const PUBLIC_FIREBASE = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim(),
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim(),
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID?.trim(),
  vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY?.trim(),
} as const;

/** True when the minimum web client config is present (see `.env.example`). */
export function isFirebaseConfigured(): boolean {
  return Boolean(
    PUBLIC_FIREBASE.apiKey &&
      PUBLIC_FIREBASE.authDomain &&
      PUBLIC_FIREBASE.projectId &&
      PUBLIC_FIREBASE.appId,
  );
}

/** Firebase web app config from public env vars (safe to bundle in the browser). */
export function getFirebaseConfig(): FirebaseOptions {
  const { apiKey, authDomain, projectId, appId } = PUBLIC_FIREBASE;

  if (!apiKey || !authDomain || !projectId || !appId) {
    throw new Error(
      "Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* variables (see .env.example).",
    );
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket: PUBLIC_FIREBASE.storageBucket,
    messagingSenderId: PUBLIC_FIREBASE.messagingSenderId,
    appId,
    measurementId: PUBLIC_FIREBASE.measurementId,
  };
}

/** Public VAPID key for `getToken()` (FCM web push). Never put the private key in the app. */
export function getFirebaseVapidKey(): string | undefined {
  return PUBLIC_FIREBASE.vapidKey;
}

export function isFcmConfigured(): boolean {
  return isFirebaseConfigured() && Boolean(PUBLIC_FIREBASE.vapidKey);
}
