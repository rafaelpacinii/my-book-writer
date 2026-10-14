import React from "react";
import { BookOpen, FileText, HardDrive, History } from "lucide-react";
import type { DatabaseStats } from "@/types/settings";

interface Props {
  stats: DatabaseStats | null;
  isLoading: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function DatabaseStatsCard({ stats, isLoading }: Props) {
  if (isLoading || !stats) {
    return (
      <div className="p-4 rounded-xl border border-border bg-surface animate-pulse h-28" />
    );
  }

  return (
    <div className="p-5 rounded-xl border border-border bg-surface flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-foreground font-bold text-sm">
          <HardDrive className="w-4 h-4 text-primary" />
          <span>Banco de Dados Local (SQLite)</span>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary-soft text-primary">
          {formatBytes(stats.file_size_bytes)}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-surface-elevated flex flex-col gap-0.5">
          <span className="text-[11px] text-muted flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Livros
          </span>
          <span className="text-base font-bold text-foreground">{stats.books_count}</span>
        </div>
        <div className="p-3 rounded-lg bg-surface-elevated flex flex-col gap-0.5">
          <span className="text-[11px] text-muted flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Capítulos
          </span>
          <span className="text-base font-bold text-foreground">{stats.chapters_count}</span>
        </div>
        <div className="p-3 rounded-lg bg-surface-elevated flex flex-col gap-0.5">
          <span className="text-[11px] text-muted flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" /> Versões
          </span>
          <span className="text-base font-bold text-foreground">{stats.versions_count}</span>
        </div>
      </div>

      <p className="text-[11px] text-muted truncate font-mono bg-surface-elevated/50 p-2 rounded">
        {stats.db_path}
      </p>
    </div>
  );
}

