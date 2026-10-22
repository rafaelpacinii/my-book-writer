"use client";

import { PageContent } from "@/components/shared/PageContent";
import { ErrorState } from "@/components/shared/ErrorState";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { SettingsTabs } from "@/components/settings/SettingsTabs";
import { BackupSettingsSection } from "@/components/settings/BackupSettingsSection";
import { EditorPreferencesSection } from "@/components/settings/EditorPreferencesSection";
import { KeyboardShortcutsSection } from "@/components/settings/KeyboardShortcutsSection";
import { RestoreConfirmModal } from "@/components/settings/RestoreConfirmModal";
import { useSettingsPage } from "@/hooks/useSettingsPage";

export function Main() {
  const s = useSettingsPage();

  return (
    <>
      <PageContent>
        <SettingsHeader />
        <SettingsTabs activeTab={s.activeTab} onSelectTab={s.setActiveTab} />

        {s.statsError && s.activeTab === "backup" && (
          <ErrorState message={s.statsError} onRetry={() => { void s.retryStats(); }} />
        )}
        {s.activeTab === "backup" && (!s.statsError || s.stats) && (
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
      </PageContent>

      <RestoreConfirmModal
        isOpen={s.isRestoreModalOpen}
        onClose={() => s.setIsRestoreModalOpen(false)}
        onConfirm={s.handleConfirmRestore}
        isRestoring={s.isRestoring}
      />
    </>
  );
}
