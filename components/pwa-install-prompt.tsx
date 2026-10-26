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
    // iOS Safari
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
 * Bottom banner: native install on Android/Chrome when available; iOS Add to Home Screen hint.
 */
export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
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

  if (dismissed || isStandaloneDisplay()) {
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
    <div
      role="status"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 px-4 py-3 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] backdrop-blur-sm sm:px-6"
    >
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">{message}</p>
        <div className="flex shrink-0 items-center gap-2">
          {showAndroid ? (
            <button
              type="button"
              onClick={() => void install()}
              className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90"
            >
              Install app
            </button>
          ) : null}
          <button
            type="button"
            onClick={dismiss}
            className="rounded-full px-3 py-2 text-sm font-medium text-muted hover:text-foreground"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
