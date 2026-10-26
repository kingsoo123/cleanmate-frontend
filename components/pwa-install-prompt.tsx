"use client";

import { useCallback, useEffect, useState } from "react";

const DISMISS_KEY = "cleanmate_pwa_install_dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isAppleMobile = /iphone|ipad|ipod/i.test(ua);
  const isOtherBrowser = /crios|fxios|edgios|opios/i.test(ua);
  return isAppleMobile && !isOtherBrowser;
}

/**
 * Install hint on the marketing home page only (not auth or portal routes).
 */
export function PwaInstallPrompt() {
  const [ready, setReady] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

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

    if (isIosSafari()) {
      setShowIosHint(true);
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setShowIosHint(false);
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

  if (!ready || dismissed || isStandaloneDisplay()) {
    return null;
  }

  const showAndroid = Boolean(deferredPrompt);
  const showBanner = showAndroid || showIosHint;

  if (!showBanner) {
    return null;
  }

  const message = showAndroid
    ? "Install Washuply on this device for quick access from your home screen."
    : "Install Washuply: tap Share, then Add to Home Screen.";

  return (
    <aside
      aria-label="Install Washuply app"
      className="mx-4 mt-10 rounded-2xl border border-brand/25 bg-brand-light/70 px-4 py-4 shadow-sm sm:mx-8 sm:px-6 sm:py-5"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium leading-relaxed text-foreground sm:text-[15px]">
          {message}
        </p>
        <div className="flex flex-wrap items-center gap-3 sm:shrink-0 sm:justify-end">
          {showAndroid ? (
            <button
              type="button"
              onClick={() => void install()}
              className="inline-flex h-11 min-w-[8.5rem] items-center justify-center rounded-full bg-brand-dark px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Install app
            </button>
          ) : null}
          <button
            type="button"
            onClick={dismiss}
            className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-surface px-4 text-sm font-semibold text-muted transition-colors hover:text-foreground"
          >
            Not now
          </button>
        </div>
      </div>
    </aside>
  );
}
