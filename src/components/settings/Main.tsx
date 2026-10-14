"use client";

import React from "react";
import { AppHeader } from "@/components/shared/AppHeader";
import { AppSidebar } from "@/components/shared/AppSidebar";
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
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader />
      <div className="flex flex-1">
        <AppSidebar />
        <main className="flex-1 p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto max-w-5xl">
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
        </main>
      </div>

      <RestoreConfirmModal
        isOpen={s.isRestoreModalOpen}
        onClose={() => s.setIsRestoreModalOpen(false)}
        onConfirm={s.handleConfirmRestore}
        isRestoring={s.isRestoring}
      />
    </div>
  );
}

