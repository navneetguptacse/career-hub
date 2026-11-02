"use client";

import { useCallback, useSyncExternalStore } from "react";

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
  isTablet: boolean;
  isMobile: boolean;
  isDesktop: boolean;
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

function getPromptSnapshot(): BeforeInstallPromptEvent | null {
  return globalDeferredPrompt;
}

function getPromptServerSnapshot(): null {
  return null;
}

function setGlobalPrompt(prompt: BeforeInstallPromptEvent | null) {
  globalDeferredPrompt = prompt;
  promptListeners.forEach((listener) => listener());
}

// Global modal visibility store so clicking install anywhere opens the guide
let globalGuideOpen = false;
const guideListeners = new Set<() => void>();

function subscribeGuide(callback: () => void) {
  guideListeners.add(callback);
  return () => {
    guideListeners.delete(callback);
  };
}

function getGuideSnapshot(): boolean {
  return globalGuideOpen;
}

function getGuideServerSnapshot(): boolean {
  return false;
}

export function setGlobalPwaGuide(open: boolean) {
  if (globalGuideOpen !== open) {
    globalGuideOpen = open;
    guideListeners.forEach((listener) => listener());
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    setGlobalPrompt(e as BeforeInstallPromptEvent);
  });

  window.addEventListener("appinstalled", () => {
    setGlobalPrompt(null);
    setGlobalPwaGuide(false);
    dismissListeners.forEach((listener) => listener());
  });
}

function subscribeStandalone(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mqlStandalone = window.matchMedia("(display-mode: standalone)");
  const handler = () => callback();

  mqlStandalone.addEventListener("change", handler);
  window.addEventListener("appinstalled", handler);

  return () => {
    mqlStandalone.removeEventListener("change", handler);
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
  isTablet: false,
  isMobile: false,
  isDesktop: true,
});

let cachedPlatform: PlatformInfo | null = null;
let lastWidth = 0;
let lastUa = "";

function subscribePlatform(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("resize", callback);
  window.addEventListener("orientationchange", callback);
  return () => {
    window.removeEventListener("resize", callback);
    window.removeEventListener("orientationchange", callback);
  };
}

function getPlatformSnapshot(): PlatformInfo {
  if (typeof window === "undefined") return SERVER_PLATFORM;
  const ua = window.navigator.userAgent || "";
  const width = window.innerWidth;

  if (cachedPlatform && lastWidth === width && lastUa === ua) {
    return cachedPlatform;
  }

  lastWidth = width;
  lastUa = ua;

  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    (window.navigator.platform === "MacIntel" &&
      window.navigator.maxTouchPoints > 1);

  const isAndroid = /Android/i.test(ua);

  const isInAppBrowser =
    /Telegram|FBAN|FBAV|Instagram|Line|Twitter|MicroMessenger/i.test(ua);

  const isTablet =
    /iPad/i.test(ua) ||
    (/Android/i.test(ua) && !/Mobile/i.test(ua)) ||
    (window.navigator.platform === "MacIntel" &&
      window.navigator.maxTouchPoints > 1) ||
    /Tablet|PlayBook|Silk/i.test(ua);

  const isMobile =
    (/iPhone|iPod/i.test(ua) || (/Android/i.test(ua) && /Mobile/i.test(ua))) &&
    !isTablet;

  const isSmallScreen =
    width <= 1024 ||
    (typeof window.matchMedia === "function" &&
      (window.matchMedia("(max-width: 1024px)").matches ||
        window.matchMedia("(pointer: coarse)").matches));

  const isMobileOrTablet =
    isIos || isAndroid || isTablet || isMobile || Boolean(isSmallScreen);

  const isDesktop = !isMobileOrTablet;

  cachedPlatform = Object.freeze({
    isIos,
    isAndroid,
    isInAppBrowser,
    isMobileOrTablet,
    isTablet,
    isMobile,
    isDesktop,
  });

  return cachedPlatform;
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
    subscribePlatform,
    getPlatformSnapshot,
    () => SERVER_PLATFORM
  );

  const showGuide = useSyncExternalStore(
    subscribeGuide,
    getGuideSnapshot,
    getGuideServerSnapshot
  );

  const setShowGuide = useCallback((open: boolean) => {
    setGlobalPwaGuide(open);
  }, []);

  const install = useCallback(async (): Promise<boolean> => {
    if (platform.isInAppBrowser) {
      setGlobalPwaGuide(true);
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
        setGlobalPrompt(null);
        setGlobalPwaGuide(true);
        return false;
      }
    }

    // Fallback for iOS, iPadOS, Android tablets/phones (before prompt), or desktop
    setGlobalPwaGuide(true);
    return false;
  }, [deferredPrompt, platform.isInAppBrowser]);

  const dismissBanner = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {}
    dismissListeners.forEach((listener) => listener());
  }, []);

  const isInstallable = !isInstalled;

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
