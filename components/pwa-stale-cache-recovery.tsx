"use client";

import { useEffect } from "react";

const RECOVERY_KEY = "cleanmate_pwa_css_recovery_v2";

/**
 * After deploys, installed PWAs can serve old HTML that references removed
 * `/_next/static/css/*` files → unstyled UI (especially on Android / tablets).
 */
export function PwaStaleCacheRecovery() {
  useEffect(() => {
  async function clearAppCaches() {
    if (!("caches" in window)) return;
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }

  async function unregisterAppServiceWorkers() {
    if (!("serviceWorker" in navigator)) return;
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations
        .filter(
          (reg) =>
            reg.scope === `${window.location.origin}/` ||
            reg.active?.scriptURL.includes("/sw.js"),
        )
        .map((reg) => reg.unregister()),
    );
  }

  async function recoverFromStaleCache() {
    try {
      if (localStorage.getItem(RECOVERY_KEY) === "1") return;
      localStorage.setItem(RECOVERY_KEY, "1");
    } catch {
      return;
    }

    await clearAppCaches();
    await unregisterAppServiceWorkers();
    window.location.reload();
  }

  async function verifyStylesheets() {
    const links = [
      ...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
    ];
    if (links.length === 0) return;

    for (const link of links) {
      const href = link.href;
      if (!href) continue;
      link.addEventListener("error", () => {
        void recoverFromStaleCache();
      });

      try {
        const response = await fetch(href, {
          method: "HEAD",
          cache: "no-store",
          credentials: "same-origin",
        });
        if (!response.ok) {
          await recoverFromStaleCache();
          return;
        }
      } catch {
        await recoverFromStaleCache();
        return;
      }
    }
    try {
      localStorage.removeItem(RECOVERY_KEY);
    } catch {
      /* ignore */
    }
  }

  function onControllerChange() {
    window.location.reload();
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );
    void navigator.serviceWorker.ready.then((reg) => {
      void reg.update();
    });
  }

  const verifyTimer = window.setTimeout(() => {
    void verifyStylesheets();
  }, 400);

  return () => {
    window.clearTimeout(verifyTimer);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
    }
  };
  }, []);

  return null;
}