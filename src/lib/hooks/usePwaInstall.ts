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

const DISMISS_KEY = "careerhub_pwa_dismissed_at";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// --- Prompt Store ---
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

// Global browser listeners for PWA install events (attached once)
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

// --- Standalone Store ---
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

// --- Dismissed Store ---
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

// --- iOS Snapshot ---
function getIosSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  const isStandalone = getStandaloneSnapshot();
  if (isStandalone) return false;

  const ua = window.navigator.userAgent;
  const isIosDevice =
    /iPad|iPhone|iPod/.test(ua) ||
    (window.navigator.platform === "MacIntel" &&
      window.navigator.maxTouchPoints > 1);

  const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS/.test(ua);

  return isIosDevice && isSafari;
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

  const isIos = useSyncExternalStore(
    subscribeStandalone,
    getIosSnapshot,
    () => false
  );

  const [showIosGuide, setShowIosGuide] = useState(false);

  const install = useCallback(async (): Promise<boolean> => {
    if (isIos) {
      setShowIosGuide(true);
      return false;
    }

    if (!deferredPrompt) {
      return false;
    }

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
      return false;
    }
  }, [deferredPrompt, isIos]);

  const dismissBanner = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {}
    dismissListeners.forEach((l) => l());
  }, []);

  const isInstallable = (!isInstalled && Boolean(deferredPrompt)) || isIos;

  return {
    isInstallable,
    isInstalled,
    isIos,
    showIosGuide,
    setShowIosGuide,
    install,
    dismissBanner,
    isBannerDismissed,
  };
}
