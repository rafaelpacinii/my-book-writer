export interface DatabaseStats {
  db_path: string;
  file_size_bytes: number;
  books_count: number;
  chapters_count: number;
  versions_count: number;
}

export interface BackupExportResult {
  destination_path: string;
  file_size_bytes: number;
}

export interface BackupImportResult {
  books_count: number;
  chapters_count: number;
}

export interface EditorShortcuts {
  save: string;
  focusMode: string;
  versionsDrawer: string;
  reviewDrawer: string;
  newChapter: string;
}

export interface EditorPreferences {
  autosaveEnabled: boolean;
  autosaveIntervalMs: number;
  shortcuts: EditorShortcuts;
}

export const DEFAULT_SHORTCUTS: EditorShortcuts = {
  save: "mod+s",
  focusMode: "mod+shift+f",
  versionsDrawer: "mod+shift+h",
  reviewDrawer: "mod+shift+r",
  newChapter: "mod+alt+n",
};

export const DEFAULT_EDITOR_PREFERENCES: EditorPreferences = {
  autosaveEnabled: true,
  autosaveIntervalMs: 1200,
  shortcuts: DEFAULT_SHORTCUTS,
};

