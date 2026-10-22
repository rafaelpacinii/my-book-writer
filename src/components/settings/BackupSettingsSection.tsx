import React from "react";
import { Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DatabaseStatsCard } from "@/components/settings/DatabaseStatsCard";
import type { DatabaseStats } from "@/types/settings";

interface Props {
  stats: DatabaseStats | null;
  isLoading: boolean;
  isExporting: boolean;
  onExport: () => void;
  onRequestRestore: () => void;
  feedback: { type: "success" | "error"; message: string } | null;
}

export function BackupSettingsSection(props: Props) {
  const { stats, isLoading, isExporting, onExport, onRequestRestore, feedback } = props;

  return (
    <div className="flex flex-col gap-5 w-full">
      <DatabaseStatsCard stats={stats} isLoading={isLoading} />

      {feedback && (
        <div
          role="status"
          className={`p-3.5 rounded-xl text-xs font-medium border ${
            feedback.type === "success"
              ? "bg-success/10 border-success/30 text-success"
              : "bg-danger/10 border-danger/30 text-danger"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <div className="p-5 rounded-xl border border-border bg-surface flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-bold text-foreground">Backup dos seus livros</h3>
          <p className="text-xs text-muted">
            Exporte uma cópia completa de segurança ou restaure seus dados a qualquer momento.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="primary"
            onClick={onExport}
            isLoading={isExporting}
            loadingLabel="Exportando backup…"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? "Exportando..." : "Exportar backup"}</span>
          </Button>

          <Button
            variant="outline"
            onClick={onRequestRestore}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Restaurar backup</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

