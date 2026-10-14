import React from "react";
import { Database, Keyboard, Sliders } from "lucide-react";
import type { SettingsTab } from "./types";

interface Props {
  activeTab: SettingsTab;
  onSelectTab: (tab: SettingsTab) => void;
}

const TABS: Array<{ id: SettingsTab; label: string; icon: React.ReactNode }> = [
  {
    id: "backup",
    label: "Backup & SQLite",
    icon: <Database className="w-4 h-4" />,
  },
  {
    id: "editor",
    label: "Preferências do Editor",
    icon: <Sliders className="w-4 h-4" />,
  },
  {
    id: "shortcuts",
    label: "Atalhos de Teclado",
    icon: <Keyboard className="w-4 h-4" />,
  },
];

export function SettingsTabs({ activeTab, onSelectTab }: Props) {
  return (
    <div className="flex items-center gap-2 border-b border-border pb-3 select-none">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isActive
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted hover:text-foreground hover:bg-surface-elevated"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

