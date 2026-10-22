"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import {
  subscribeEditorPreferences, getEditorPreferences, getDefaultEditorPreferences,
  initializeEditorPreferences, setAutosaveEnabled, setAutosaveIntervalMs, setShortcut, resetShortcuts,
} from "@/lib/preferences/editorPreferences";

export function useEditorPreferences() {
  const preferences = useSyncExternalStore(subscribeEditorPreferences, getEditorPreferences, getDefaultEditorPreferences);
  useLayoutEffect(initializeEditorPreferences, []);
  return { preferences, setAutosaveEnabled, setAutosaveIntervalMs, setShortcut, resetShortcuts };
}
