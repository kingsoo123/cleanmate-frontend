"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const DISMISS_KEY = "cleanmate_pwa_install_dismissed_v2";

/** Pages where we offer Add to Home Screen / install. */
const INSTALL_PATHS = new Set(["/", "/login", "/register"]);

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type IosBrowser = "safari" | "chrome" | "other";

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

function getIosBrowser(): IosBrowser | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;
  const isAppleMobile = /iphone|ipad|ipod/i.test(ua);
  if (!isAppleMobile) return null;
  if (/crios/i.test(ua)) return "chrome";
  if (/fxios|edgios|opios/i.test(ua)) return "other";
  return "safari";
}

/**
 * Install hint: Android/Chrome uses beforeinstallprompt; iOS has no system prompt —
 * we show Share → Add to Home Screen steps (Safari) or open-in-Safari guidance.
 */
export function PwaInstallPrompt() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [iosBrowser, setIosBrowser] = useState<IosBrowser | null>(null);

  const onInstallRoute =
    pathname !== null && INSTALL_PATHS.has(pathname.split("?")[0] ?? pathname);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setReady(true);

    if (isStandaloneDisplay()) return;
    try {
      if (localStorage.getItem(DISMISS_KEY) === "1") {
        setDismissed(true);
      }
    } catch {
      /* private mode */
    }

    setIosBrowser(getIosBrowser());

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  }, [deferredPrompt, dismiss]);

  if (!ready || !onInstallRoute || dismissed || isStandaloneDisplay()) {
    return null;
  }

  const showAndroid = Boolean(deferredPrompt);
  const showIos = Boolean(iosBrowser);

  if (!showAndroid && !showIos) {
    return null;
  }

  const iosMessage =
    iosBrowser === "safari"
      ? "Add Washuply to your home screen: tap Share (□↑) at the bottom of Safari, then Add to Home Screen."
      : iosBrowser === "chrome"
        ? "In Chrome: tap ⋮ (menu, bottom right) → Add to Home Screen. Apple may hide this until you visit a few times. If it’s missing, open Washuply in Safari and use Share → Add to Home Screen."
        : "On iPhone, use Safari: Share (□↑) → Add to Home Screen. Other browsers on iOS don’t show an automatic install prompt.";

  const message = showAndroid
    ? "Install Washuply on this device for quick access from your home screen."
    : iosMessage;

  const shellClass = showIos
    ? "fixed inset-x-0 bottom-0 z-50 border-t border-brand/30 bg-brand-light/95 px-4 py-3 shadow-[0_-4px_24px_rgba(99,91,255,0.2)] backdrop-blur-sm pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    : "mx-4 mt-10 rounded-2xl border border-brand/25 bg-brand-light/70 px-4 py-4 shadow-sm sm:mx-8 sm:px-6 sm:py-5";

  return (
    <aside
      aria-label="Install Washuply app"
      className={shellClass}
    >
      <div
        className={
          showIos
            ? "mx-auto flex max-w-lg flex-col gap-3"
            : "mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        }
      >
        <p className="text-sm font-medium leading-relaxed text-foreground sm:text-[15px]">
          {message}
        </p>
        <div className="flex shrink-0 items-center gap-3 sm:justify-end">
          {showAndroid ? (
            <button
              type="button"
              onClick={() => void install()}
              className="inline-flex h-11 min-w-[8.5rem] flex-1 items-center justify-center rounded-full bg-brand-dark px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:flex-none"
            >
              Install app
            </button>
          ) : null}
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-border bg-surface px-4 text-sm font-semibold text-muted transition-colors hover:text-foreground sm:flex-none sm:min-w-[6rem]"
          >
            Not now
          </button>
        </div>
      </div>
    </aside>
  );
}
