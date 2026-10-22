import {
  DEFAULT_EDITOR_PREFERENCES, DEFAULT_SHORTCUTS,
  type EditorPreferences, type EditorShortcuts,
} from "@/types/settings";

const STORAGE_KEY = "mbw_editor_preferences";
let preferences = DEFAULT_EDITOR_PREFERENCES;
const listeners = new Set<() => void>();

function publish(next: EditorPreferences) {
  if (JSON.stringify(next) === JSON.stringify(preferences)) return;
  preferences = next;
  listeners.forEach((listener) => listener());
}

export function initializeEditorPreferences() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object") { publish(DEFAULT_EDITOR_PREFERENCES); return; }
    const stored = parsed as Record<string, unknown>;
    const shortcuts = { ...DEFAULT_SHORTCUTS };
    const savedShortcuts = stored.shortcuts;
    if (savedShortcuts && typeof savedShortcuts === "object") {
      for (const key of Object.keys(shortcuts) as (keyof EditorShortcuts)[]) {
        const value = (savedShortcuts as Record<string, unknown>)[key];
        if (typeof value === "string") shortcuts[key] = value;
      }
    }
    publish({
      autosaveEnabled: typeof stored.autosaveEnabled === "boolean" ? stored.autosaveEnabled : true,
      autosaveIntervalMs: typeof stored.autosaveIntervalMs === "number" && Number.isFinite(stored.autosaveIntervalMs)
        && stored.autosaveIntervalMs > 0 ? stored.autosaveIntervalMs : 1200,
      shortcuts,
    });
  } catch (error) { console.warn("Não foi possível ler as preferências do editor.", error); }
}

function save(next: EditorPreferences) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); }
  catch (error) { console.warn("As preferências do editor não serão preservadas ao reiniciar.", error); }
  publish(next);
}

export function subscribeEditorPreferences(listener: () => void) {
  listeners.add(listener);
  const sync = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) initializeEditorPreferences();
  };
  window.addEventListener("storage", sync);
  return () => { listeners.delete(listener); window.removeEventListener("storage", sync); };
}

export const getEditorPreferences = () => preferences;
export const getDefaultEditorPreferences = () => DEFAULT_EDITOR_PREFERENCES;
export const setAutosaveEnabled = (autosaveEnabled: boolean) => save({ ...preferences, autosaveEnabled });
export const setAutosaveIntervalMs = (autosaveIntervalMs: number) => save({ ...preferences, autosaveIntervalMs });
export const setShortcut = (action: keyof EditorShortcuts, shortcut: string) => save({
  ...preferences, shortcuts: { ...preferences.shortcuts, [action]: shortcut },
});
export const resetShortcuts = () => save({ ...preferences, shortcuts: DEFAULT_SHORTCUTS });
