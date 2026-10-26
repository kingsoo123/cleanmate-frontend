"use client";

import { useEffect } from "react";

const RECOVERY_KEY = "cleanmate_pwa_css_recovery_attempted";

/**
 * If a stale service worker serves old HTML, stylesheet hrefs can 404 and the UI
 * looks unstyled. Unregister the app SW once and reload.
 */
export function PwaStaleCacheRecovery() {
  useEffect(() => {
    const links = document.querySelectorAll<HTMLLinkElement>(
      'link[rel="stylesheet"]',
    );

    function recoverFromStaleCache() {
      if (typeof window === "undefined") return;
      try {
        if (sessionStorage.getItem(RECOVERY_KEY) === "1") return;
        sessionStorage.setItem(RECOVERY_KEY, "1");
      } catch {
        return;
      }

      if (!("serviceWorker" in navigator)) return;

      void navigator.serviceWorker.getRegistrations().then((registrations) => {
        const appWorkers = registrations.filter(
          (reg) =>
            reg.scope === `${window.location.origin}/` ||
            reg.active?.scriptURL.includes("/sw.js"),
        );
        if (appWorkers.length === 0) return;

        void Promise.all(appWorkers.map((reg) => reg.unregister())).then(() => {
          window.location.reload();
        });
      });
    }

    for (const link of links) {
      link.addEventListener("error", recoverFromStaleCache);
    }

    return () => {
      for (const link of links) {
        link.removeEventListener("error", recoverFromStaleCache);
      }
    };
  }, []);

  return null;
}
