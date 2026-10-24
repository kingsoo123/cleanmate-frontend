"use client";

import { useEffect } from "react";

import { getFirebaseAnalytics } from "@/lib/firebase/client";

/** Initializes Firebase Analytics once on the client when config env vars are set. */
export function FirebaseAnalytics() {
  useEffect(() => {
    void getFirebaseAnalytics();
  }, []);

  return null;
}
