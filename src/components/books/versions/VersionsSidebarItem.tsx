import React from "react";
import { Clock, Trash2 } from "lucide-react";
import type { ChapterVersionSummary } from "@/types/chapterVersion";

interface Props {
  version: ChapterVersionSummary;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function VersionsSidebarItem({ version, isSelected, onSelect, onDelete }: Props) {
  const dateStr = new Date(version.created_at).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-xl border text-left cursor-pointer transition-colors ${
        isSelected
          ? "border-primary bg-primary/10 text-primary shadow-xs"
          : "border-border bg-surface hover:bg-surface-hover hover:border-primary/40 text-foreground"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>
          Versão #{version.version_number}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {dateStr}
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 rounded text-muted hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            title="Excluir snapshot"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {version.description && (
        <p className="text-xs text-foreground/80 font-medium truncate mb-1">
          {version.description}
        </p>
      )}
      <span className="text-[11px] text-muted">
        {version.word_count} palavras
      </span>
    </div>
  );
}

