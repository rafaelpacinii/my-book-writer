import React from "react";
import { Clock, Trash2 } from "lucide-react";
import type { VersionCardProps } from "./types";

export function VersionCard({ version, isSelected, onSelect, onDelete }: VersionCardProps) {
  const formattedDate = new Date(version.created_at).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-lg border text-left cursor-pointer transition-all flex flex-col gap-1.5 ${
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-surface hover:border-primary/50 hover:bg-surface-hover"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-foreground">
          Versão #{version.version_number}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formattedDate}
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 rounded text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Excluir snapshot"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      {version.description && (
        <p className="text-xs text-foreground/80 font-medium truncate">
          {version.description}
        </p>
      )}
      <div className="text-[11px] text-muted flex items-center gap-2">
        <span>{version.word_count} palavras</span>
      </div>
    </div>
  );
}

