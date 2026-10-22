import React from "react";
import { ThemePreferencesCard } from "@/components/settings/ThemePreferencesCard";
import type { EditorPreferences } from "@/types/settings";

interface Props {
  preferences: EditorPreferences;
  onToggleAutosave: (enabled: boolean) => void;
  onIntervalChange: (intervalMs: number) => void;
}

const INTERVAL_OPTIONS = [
  { value: 800, label: "Rápido (800ms)" },
  { value: 1200, label: "Padrão (1.2s)" },
  { value: 2000, label: "Moderado (2s)" },
  { value: 5000, label: "Econômico (5s)" },
];

export function EditorPreferencesSection({ preferences, onToggleAutosave, onIntervalChange }: Props) {
  return (
    <div className="flex flex-col gap-6 w-full select-none">
      <ThemePreferencesCard />

      <div className="p-5 rounded-xl border border-border bg-surface flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground">Salvamento Automático (Autosave)</h3>
            <p className="text-xs text-muted">Grava edições em segundo plano sem interromper a escrita.</p>
          </div>
          <input
            aria-label="Salvamento automático"
            type="checkbox"
            checked={preferences.autosaveEnabled}
            onChange={(e) => onToggleAutosave(e.target.checked)}
            className="w-4 h-4 rounded text-primary accent-primary cursor-pointer"
          />
        </div>

        {preferences.autosaveEnabled && (
          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <span className="text-xs font-bold text-foreground">Frequência de salvamento:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {INTERVAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={preferences.autosaveIntervalMs === opt.value}
                  onClick={() => onIntervalChange(opt.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                    preferences.autosaveIntervalMs === opt.value
                      ? "border-primary bg-primary-soft text-primary font-bold"
                      : "border-border bg-surface hover:bg-surface-elevated text-muted hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

