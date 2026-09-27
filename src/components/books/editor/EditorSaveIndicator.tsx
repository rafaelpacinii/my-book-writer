import React from "react";
import { Check, Loader2, AlertCircle, Clock } from "lucide-react";
import type { SaveStatus } from "./useChapterEditor";

interface Props {
  status: SaveStatus;
}

export function EditorSaveIndicator({ status }: Props) {
  if (status === "saving") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted select-none">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
        <span>Salvando...</span>
      </div>
    );
  }

  if (status === "unsaved") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 select-none">
        <Clock className="w-3.5 h-3.5" />
        <span>Não salvo</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center gap-1.5 text-xs text-danger select-none">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>Erro ao salvar</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted/70 select-none">
      <Check className="w-3.5 h-3.5 text-primary" />
      <span>Salvo</span>
    </div>
  );
}
