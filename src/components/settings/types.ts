export type SettingsTab = "backup" | "editor" | "shortcuts";

export interface SettingsTabItem {
  id: SettingsTab;
  label: string;
  description: string;
}

