/** Set in `.env.local` when store listings are live. */
export const appStoreUrl =
  process.env.NEXT_PUBLIC_APP_STORE_URL?.trim() || "#";
export const playStoreUrl =
  process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL?.trim() || "#";
