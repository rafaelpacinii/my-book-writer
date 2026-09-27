import React from "react";
import { ArrowUp, ArrowDown, Edit2, Trash2 } from "lucide-react";

interface Props {
  onRename: (e: React.MouseEvent) => void;
  onMoveUp: (e: React.MouseEvent) => void;
  onMoveDown: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function ChapterMenuItems({
  onRename,
  onMoveUp,
  onMoveDown,
  onDelete,
  canMoveUp,
  canMoveDown,
}: Props) {
  return (
    <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-border bg-surface shadow-lg z-20 py-1 flex flex-col text-xs select-none">
      <button
        type="button"
        onClick={onRename}
        className="flex items-center gap-2 px-3 py-2 text-foreground hover:bg-surface-hover cursor-pointer"
      >
        <Edit2 className="w-3.5 h-3.5 text-muted" />
        <span>Renomear</span>
      </button>
      <button
        type="button"
        disabled={!canMoveUp}
        onClick={onMoveUp}
        className="flex items-center gap-2 px-3 py-2 text-foreground hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <ArrowUp className="w-3.5 h-3.5 text-muted" />
        <span>Mover para cima</span>
      </button>
      <button
        type="button"
        disabled={!canMoveDown}
        onClick={onMoveDown}
        className="flex items-center gap-2 px-3 py-2 text-foreground hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <ArrowDown className="w-3.5 h-3.5 text-muted" />
        <span>Mover para baixo</span>
      </button>
      <div className="border-t border-border my-1" />
      <button
        type="button"
        onClick={onDelete}
        className="flex items-center gap-2 px-3 py-2 text-danger hover:bg-danger/10 cursor-pointer"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Excluir capítulo</span>
      </button>
    </div>
  );
}
