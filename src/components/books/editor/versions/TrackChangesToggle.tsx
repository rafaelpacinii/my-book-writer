import React from "react";
import { useHistoryAction } from "@/hooks/useHistoryAction";
import { GitCommit, ToggleLeft, ToggleRight } from "lucide-react";

interface Props {
  enabled: boolean;
  onToggle: (enabled: boolean) => Promise<void>;
}

export function TrackChangesToggle({ enabled, onToggle }: Props) {
  const action = useHistoryAction();
  return (
    <div>
      <div className="p-3.5 rounded-xl border border-border bg-surface-hover/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <GitCommit className={`w-4 h-4 ${enabled ? "text-primary" : "text-muted"}`} />
          <div>
            <p className="text-xs font-bold text-foreground">Rastrear alterações</p>
            <p className="text-[11px] text-muted">A cada 30 palavras alteradas ou 3 minutos</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void action.run(() => onToggle(!enabled))}
          disabled={action.isPending}
          role="switch" aria-checked={enabled}
          aria-label="Rastrear alterações"
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
      {action.error && <p role="alert" className="text-xs text-danger">{action.error}</p>}
    </div>
  );
}

