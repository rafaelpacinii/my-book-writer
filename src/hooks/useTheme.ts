"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import {
  subscribeTheme, getThemeSnapshot, getServerThemeSnapshot,
  initializeTheme, setTheme, toggleTheme,
} from "@/lib/preferences/theme";

export type { ThemePreference, ResolvedTheme } from "@/lib/preferences/theme";

export function useTheme() {
  const state = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);
  useLayoutEffect(initializeTheme, []);
  return { ...state, setTheme, toggleTheme };
}

export type UseThemeReturn = ReturnType<typeof useTheme>;
