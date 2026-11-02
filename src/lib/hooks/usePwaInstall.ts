"use client";

import { useState, useCallback, useSyncExternalStore } from "react";

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export interface PlatformInfo {
  isIos: boolean;
  isAndroid: boolean;
  isInAppBrowser: boolean;
  isMobileOrTablet: boolean;
}

const DISMISS_KEY = "careerhub_pwa_dismissed_at";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<() => void>();

function subscribePrompt(callback: () => void) {
  promptListeners.add(callback);
  return () => {
    promptListeners.delete(callback);
  };
}

function getPromptSnapshot() {
  return globalDeferredPrompt;
}

function getPromptServerSnapshot() {
  return null;
}

function setGlobalPrompt(prompt: BeforeInstallPromptEvent | null) {
  globalDeferredPrompt = prompt;
  promptListeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    setGlobalPrompt(e as BeforeInstallPromptEvent);
  });

  window.addEventListener("appinstalled", () => {
    setGlobalPrompt(null);
    dismissListeners.forEach((l) => l());
  });
}

function subscribeStandalone(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia("(display-mode: standalone)");
  const handler = () => callback();
  mql.addEventListener("change", handler);
  window.addEventListener("appinstalled", handler);
  return () => {
    mql.removeEventListener("change", handler);
    window.removeEventListener("appinstalled", handler);
  };
}

function getStandaloneSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as unknown as { standalone?: boolean }).standalone)
  );
}

const dismissListeners = new Set<() => void>();

function subscribeDismiss(callback: () => void) {
  dismissListeners.add(callback);
  return () => {
    dismissListeners.delete(callback);
  };
}

function getDismissSnapshot(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (!dismissedAt) return false;
    const timePassed = Date.now() - parseInt(dismissedAt, 10);
    return timePassed < DISMISS_DURATION_MS;
  } catch {
    return false;
  }
}

const SERVER_PLATFORM: PlatformInfo = Object.freeze({
  isIos: false,
  isAndroid: false,
  isInAppBrowser: false,
  isMobileOrTablet: false,
});

let cachedPlatform: PlatformInfo | null = null;

function getPlatformSnapshot(): PlatformInfo {
  if (typeof window === "undefined") return SERVER_PLATFORM;
  if (!cachedPlatform) {
    const ua = window.navigator.userAgent || "";
    const isIos =
      /iPad|iPhone|iPod/.test(ua) ||
      (window.navigator.platform === "MacIntel" &&
        window.navigator.maxTouchPoints > 1);

    const isAndroid = /Android/i.test(ua);
    const isInAppBrowser =
      /Telegram|FBAN|FBAV|Instagram|Line|Twitter|MicroMessenger/i.test(ua);

    const isMobileOrTablet =
      isIos ||
      isAndroid ||
      /Mobi|Tablet|iPad|iPhone|Android/i.test(ua) ||
      (window.navigator.platform === "MacIntel" &&
        window.navigator.maxTouchPoints > 1);

    cachedPlatform = Object.freeze({
      isIos,
      isAndroid,
      isInAppBrowser,
      isMobileOrTablet,
    });
  }

  return cachedPlatform;
}

function getServerPlatformSnapshot(): PlatformInfo {
  return SERVER_PLATFORM;
}

export function usePwaInstall() {
  const deferredPrompt = useSyncExternalStore(
    subscribePrompt,
    getPromptSnapshot,
    getPromptServerSnapshot
  );

  const isInstalled = useSyncExternalStore(
    subscribeStandalone,
    getStandaloneSnapshot,
    () => false
  );

  const isBannerDismissed = useSyncExternalStore(
    subscribeDismiss,
    getDismissSnapshot,
    () => true
  );

  const platform = useSyncExternalStore(
    subscribeStandalone,
    getPlatformSnapshot,
    getServerPlatformSnapshot
  );

  const [showGuide, setShowGuide] = useState(false);

  const install = useCallback(async (): Promise<boolean> => {
    if (platform.isInAppBrowser) {
      setShowGuide(true);
      return false;
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setGlobalPrompt(null);
          return true;
        }
        return false;
      } catch (error) {
        console.warn("Failed to execute PWA install prompt:", error);
      }
    }

    if (platform.isMobileOrTablet || platform.isIos) {
      setShowGuide(true);
      return false;
    }

    return false;
  }, [deferredPrompt, platform]);

  const dismissBanner = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {}
    dismissListeners.forEach((l) => l());
  }, []);

  const isInstallable =
    !isInstalled &&
    (Boolean(deferredPrompt) ||
      platform.isMobileOrTablet ||
      platform.isInAppBrowser);

  return {
    isInstallable,
    isInstalled,
    platform,
    isIos: platform.isIos,
    showIosGuide: showGuide,
    setShowIosGuide: setShowGuide,
    showGuide,
    setShowGuide,
    install,
    dismissBanner,
    isBannerDismissed,
  };
}
