import React from "react";
import { Trash2 } from "lucide-react";

interface Props {
  onDeleteClick: () => void;
}

export function SettingsDangerZone({ onDeleteClick }: Props) {
  return (
    <div className="pt-5 border-t border-border select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-danger/30 bg-danger-soft/20">
        <div>
          <h3 className="font-bold text-sm text-foreground">
            Excluir este livro
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Remove o livro e seus capítulos deste dispositivo.
          </p>
        </div>

        <button
          type="button"
          onClick={onDeleteClick}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg bg-surface border border-danger text-danger hover:bg-danger hover:text-white font-bold text-xs transition-colors shrink-0 cursor-pointer shadow-xs"
        >
          <Trash2 className="w-4 h-4" />
          <span>Excluir livro</span>
        </button>
      </div>
    </div>
  );
}
