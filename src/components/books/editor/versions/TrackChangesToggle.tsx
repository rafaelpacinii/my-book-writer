import React from "react";
import { GitCommit, ToggleLeft, ToggleRight } from "lucide-react";

interface Props {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function TrackChangesToggle({ enabled, onToggle }: Props) {
  return (
    <div className="p-3.5 rounded-xl border border-border bg-surface-hover/30 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <GitCommit className={`w-4 h-4 ${enabled ? "text-primary" : "text-muted"}`} />
        <div>
          <p className="text-xs font-bold text-foreground">Rastrear alterações</p>
          <p className="text-[11px] text-muted">Salvar snapshots durante a edição</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onToggle(!enabled)}
        className="p-1 text-muted hover:text-foreground transition-colors cursor-pointer"
        title={enabled ? "Desativar rastreamento" : "Ativar rastreamento"}
      >
        {enabled ? (
          <ToggleRight className="w-6 h-6 text-primary" />
        ) : (
          <ToggleLeft className="w-6 h-6 text-muted" />
        )}
      </button>
    </div>
  );
}

