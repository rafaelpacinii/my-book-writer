"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_EDITOR_PREFERENCES,
  DEFAULT_SHORTCUTS,
  type EditorPreferences,
  type EditorShortcuts,
} from "@/types/settings";

const STORAGE_KEY = "mbw_editor_preferences";
const EVENT_NAME = "mbw-preferences-changed";

function loadStoredPreferences(): EditorPreferences {
  if (typeof window === "undefined") return DEFAULT_EDITOR_PREFERENCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_EDITOR_PREFERENCES;
    const parsed = JSON.parse(raw);
    return {
      autosaveEnabled:
        typeof parsed.autosaveEnabled === "boolean"
          ? parsed.autosaveEnabled
          : DEFAULT_EDITOR_PREFERENCES.autosaveEnabled,
      autosaveIntervalMs:
        typeof parsed.autosaveIntervalMs === "number"
          ? parsed.autosaveIntervalMs
          : DEFAULT_EDITOR_PREFERENCES.autosaveIntervalMs,
      shortcuts: {
        ...DEFAULT_SHORTCUTS,
        ...(parsed.shortcuts || {}),
      },
    };
  } catch {
    return DEFAULT_EDITOR_PREFERENCES;
  }
}

export function useEditorPreferences() {
  const [preferences, setPreferences] = useState<EditorPreferences>(DEFAULT_EDITOR_PREFERENCES);

  useEffect(() => {
    setPreferences(loadStoredPreferences());

    const handleSync = () => {
      setPreferences(loadStoredPreferences());
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener(EVENT_NAME, handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener(EVENT_NAME, handleSync);
    };
  }, []);

  const savePreferences = useCallback((newPrefs: EditorPreferences) => {
    setPreferences(newPrefs);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
      window.dispatchEvent(new Event(EVENT_NAME));
    }
  }, []);

  const setAutosaveEnabled = useCallback((enabled: boolean) => {
    savePreferences({ ...preferences, autosaveEnabled: enabled });
  }, [preferences, savePreferences]);

  const setAutosaveIntervalMs = useCallback((intervalMs: number) => {
    savePreferences({ ...preferences, autosaveIntervalMs: intervalMs });
  }, [preferences, savePreferences]);

  const setShortcut = useCallback((action: keyof EditorShortcuts, shortcut: string) => {
    savePreferences({
      ...preferences,
      shortcuts: {
        ...preferences.shortcuts,
        [action]: shortcut,
      },
    });
  }, [preferences, savePreferences]);

  const resetShortcuts = useCallback(() => {
    savePreferences({
      ...preferences,
      shortcuts: DEFAULT_SHORTCUTS,
    });
  }, [preferences, savePreferences]);

  return {
    preferences,
    setAutosaveEnabled,
    setAutosaveIntervalMs,
    setShortcut,
    resetShortcuts,
  };
}

