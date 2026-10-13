import React from "react";
import { Minimize2 } from "lucide-react";

interface Props {
  title: string;
  onExitFocus: () => void;
}

export function EditorFocusHeader({ title, onExitFocus }: Props) {
  return (
    <header className="h-12 px-6 border-b border-border bg-surface/90 backdrop-blur-md flex items-center justify-between shrink-0 select-none z-20">
      <div className="flex items-center gap-2 text-xs text-muted">
        <span className="font-semibold text-foreground truncate max-w-sm">
          {title || "Sem título"}
        </span>
        <span>•</span>
        <span>Modo foco</span>
      </div>
      <button
        type="button"
        onClick={onExitFocus}
        className="h-8 px-3 rounded-lg border border-control-border bg-surface hover:bg-surface-hover text-xs font-bold text-foreground transition-colors cursor-pointer flex items-center gap-1.5"
      >
        <Minimize2 className="w-3.5 h-3.5" />
        <span>Sair do foco</span>
      </button>
    </header>
  );
}
