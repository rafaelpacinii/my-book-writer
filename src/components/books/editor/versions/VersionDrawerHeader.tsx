import React from "react";
import { History, X } from "lucide-react";

interface Props {
  count: number;
  onClose: () => void;
}

export function VersionDrawerHeader({ count, onClose }: Props) {
  return (
    <div className="h-16 px-4 border-b border-border flex items-center justify-between select-none">
      <div className="flex items-center gap-2">
        <History className="w-5 h-5 text-primary" />
        <span className="text-sm font-bold text-foreground">Histórico de Versões</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-surface-hover text-muted font-bold">
          {count}
        </span>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-1 rounded-md text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
        title="Fechar histórico"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

