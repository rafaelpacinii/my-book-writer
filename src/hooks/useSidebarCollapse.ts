"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "mbw_sidebar_collapsed";

let globalIsCollapsed = false;
let isLoaded = false;
const listeners = new Set<() => void>();

function getSnapshot(): boolean {
  if (typeof window !== "undefined" && !isLoaded) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        globalIsCollapsed = stored === "true";
      }
    } catch {
      // Ignore storage read error
    }
    isLoaded = true;
  }
  return globalIsCollapsed;
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function useSidebarCollapse() {
  const isCollapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = () => {
    globalIsCollapsed = !globalIsCollapsed;
    try {
      localStorage.setItem(STORAGE_KEY, String(globalIsCollapsed));
    } catch {
      // Ignore storage write error
    }
    listeners.forEach((listener) => listener());
  };

  return { isCollapsed, toggle };
}
