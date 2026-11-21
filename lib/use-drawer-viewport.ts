"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(max-width: 1279px)";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/** Viewports where the business sidebar is an overlay drawer (not pinned). */
export function useDrawerViewport() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}