"use client";

import React from "react";
import { AppShell } from "@/components/shared/AppShell";
import { SettingsHeader } from "./SettingsHeader";
import { SettingsTabs } from "./SettingsTabs";
import { BackupSettingsSection } from "./BackupSettingsSection";
import { EditorPreferencesSection } from "./EditorPreferencesSection";
import { KeyboardShortcutsSection } from "./KeyboardShortcutsSection";
import { RestoreConfirmModal } from "./RestoreConfirmModal";
import { useSettingsPage } from "./useSettingsPage";

export function Main() {
  const s = useSettingsPage();

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto pb-16 flex flex-col gap-6">
        <SettingsHeader />
        <SettingsTabs activeTab={s.activeTab} onSelectTab={s.setActiveTab} />

        {s.activeTab === "backup" && (
          <BackupSettingsSection
            stats={s.stats}
            isLoading={s.isLoadingStats}
            isExporting={s.isExporting}
            onExport={s.handleExport}
            onRequestRestore={() => s.setIsRestoreModalOpen(true)}
            feedback={s.feedback}
          />
        )}

        {s.activeTab === "editor" && (
          <EditorPreferencesSection
            preferences={s.preferences}
            onToggleAutosave={s.setAutosaveEnabled}
            onIntervalChange={s.setAutosaveIntervalMs}
          />
        )}

        {s.activeTab === "shortcuts" && (
          <KeyboardShortcutsSection
            shortcuts={s.preferences.shortcuts}
            onReset={s.resetShortcuts}
          />
        )}
      </div>

      <RestoreConfirmModal
        isOpen={s.isRestoreModalOpen}
        onClose={() => s.setIsRestoreModalOpen(false)}
        onConfirm={s.handleConfirmRestore}
        isRestoring={s.isRestoring}
      />
    </AppShell>
  );
}
