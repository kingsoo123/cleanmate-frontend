"use client";

import { useSyncExternalStore } from "react";
import { getAuthUserSnapshot, subscribeAuthSession } from "@/lib/auth/session";

export function useAuthUser() {
  return useSyncExternalStore(
    subscribeAuthSession,
    getAuthUserSnapshot,
    () => null,
  );
}