"use client";

import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useBookMenu } from "@/hooks/useBookMenu";

interface Props {
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

export function ReviewCommentMenu({ onEdit, onDelete, disabled }: Props) {
  const ref = useBookMenu();
  const select = (action: () => void) => {
    if (ref.current) {
      ref.current.open = false;
      ref.current.querySelector("summary")?.focus();
    }
    action();
  };
  return (
    <details ref={ref} className="relative">
      <summary aria-label="Configurações da anotação" aria-disabled={disabled}
        onClick={(event) => { if (disabled) event.preventDefault(); }}
        className="list-none p-1 rounded text-muted hover:text-foreground cursor-pointer">
        <MoreVertical aria-hidden="true" className="w-4 h-4" />
      </summary>
      <div className="absolute right-0 bottom-full mb-1 w-28 bg-surface border border-border rounded-lg shadow-lg py-1 z-30">
        <button type="button" disabled={disabled} onClick={() => select(onEdit)}
          className="w-full px-3 py-2 text-xs text-foreground hover:bg-surface-hover flex items-center gap-2">
          <Pencil aria-hidden="true" className="w-3 h-3" /> Editar
        </button>
        <button type="button" disabled={disabled} onClick={() => select(onDelete)}
          className="w-full px-3 py-2 text-xs text-danger hover:bg-danger/10 flex items-center gap-2">
          <Trash2 aria-hidden="true" className="w-3 h-3" /> Excluir
        </button>
      </div>
    </details>
  );
}

