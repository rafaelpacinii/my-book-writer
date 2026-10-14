"use client";

import { useCallback, useEffect, useState } from "react";
import {
  exportDatabaseBackup,
  getDatabaseStats,
  importDatabaseBackup,
} from "@/lib/api/database";
import { useEditorPreferences } from "@/hooks/useEditorPreferences";
import type { DatabaseStats } from "@/types/settings";
import type { SettingsTab } from "./types";

export function useSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("backup");
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const editorPrefs = useEditorPreferences();

  const loadStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const data = await getDatabaseStats();
      setStats(data);
    } catch {
      // Falha silenciosa ou mantém anterior
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    setFeedback(null);
    try {
      const result = await exportDatabaseBackup();
      if (result) {
        setFeedback({
          type: "success",
          message: `Backup exportado com sucesso para: ${result.destination_path}`,
        });
        await loadStats();
      }
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Falha ao exportar backup.",
      });
    } finally {
      setIsExporting(false);
    }
  }, [loadStats]);

  const handleConfirmRestore = useCallback(async () => {
    setIsRestoring(true);
    setFeedback(null);
    try {
      const result = await importDatabaseBackup();
      if (result) {
        setFeedback({
          type: "success",
          message: `Backup restaurado com sucesso! (${result.books_count} livros e ${result.chapters_count} capítulos carregados).`,
        });
        setIsRestoreModalOpen(false);
        await loadStats();
      } else {
        setIsRestoreModalOpen(false);
      }
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Falha ao restaurar backup.",
      });
      setIsRestoreModalOpen(false);
    } finally {
      setIsRestoring(false);
    }
  }, [loadStats]);

  return {
    activeTab,
    setActiveTab,
    stats,
    isLoadingStats,
    isExporting,
    isRestoring,
    isRestoreModalOpen,
    setIsRestoreModalOpen,
    feedback,
    handleExport,
    handleConfirmRestore,
    ...editorPrefs,
  };
}

