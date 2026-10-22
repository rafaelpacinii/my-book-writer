import { Check, Loader2, AlertCircle, Clock } from "lucide-react";
import type { SaveStatus } from "./useChapterEditor";

interface Props {
  status: SaveStatus;
  autosaveEnabled?: boolean;
  onSave: () => void;
}

export function EditorSaveIndicator({ status, autosaveEnabled = true, onSave }: Props) {
  const Icon = { saved: Check, saving: Loader2, unsaved: Clock, error: AlertCircle }[status];
  const label = {
    saved: "Salvo neste dispositivo",
    saving: "Salvando...",
    unsaved: "Alterações não salvas",
    error: "Erro ao salvar",
  }[status];
  const color = status === "error" ? "text-danger" : status === "unsaved" ? "text-warning" : "text-muted";

  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs select-none ${color}`}>
      <span role="status" aria-live="polite" aria-atomic="true" className="flex items-center gap-1.5">
        <Icon aria-hidden="true" className={`h-3.5 w-3.5 ${status === "saving" ? "animate-spin" : status === "saved" ? "text-success" : ""}`} />
        {label}
      </span>
      {(status === "error" || (!autosaveEnabled && status !== "saving")) && (
        <button type="button" onClick={onSave} className="min-h-8 rounded px-2 font-medium text-foreground underline underline-offset-4 hover:bg-surface-hover">
          {status === "error" ? "Tentar novamente" : "Salvar"}
        </button>
      )}
    </div>
  );
}
