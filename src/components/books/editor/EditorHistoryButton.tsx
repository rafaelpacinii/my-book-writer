import React from "react";
import { History } from "lucide-react";

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  count: number;
}

export function EditorHistoryButton({ isOpen, onToggle, count }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`h-11 px-4 rounded-lg border text-[13px] font-bold transition-colors cursor-pointer flex items-center gap-2 ${
        isOpen
          ? "border-primary bg-primary/10 text-primary"
          : "border-control-border bg-surface hover:bg-surface-hover text-foreground"
      }`}
      title={isOpen ? "Fechar histórico de versões" : "Abrir histórico de versões"}
    >
      <History className="w-4 h-4" />
      <span>Versões</span>
      {count > 0 && (
        <span className="px-1.5 py-0.5 text-[11px] rounded-full bg-surface-hover font-bold text-muted">
          {count}
        </span>
      )}
    </button>
  );
}

