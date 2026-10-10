import React from "react";
import { GripVertical } from "lucide-react";
import { ChapterCardMenu } from "./ChapterCardMenu";

interface Props {
  chapterNumber: string;
  onRename: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function ChapterCardHeader({
  chapterNumber,
  onRename,
  onMoveUp,
  onMoveDown,
  onDelete,
  canMoveUp,
  canMoveDown,
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5 min-w-0 pr-2">
        <GripVertical className="w-4 h-4 text-muted/30 group-hover:text-muted transition-colors cursor-grab shrink-0" />
        {chapterNumber ? (
          <span className="font-serif text-lg sm:text-2xl font-light text-primary/80 group-hover:text-primary transition-colors truncate">
            {chapterNumber}
          </span>
        ) : (
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary/70">
            Especial
          </span>
        )}
      </div>
      <ChapterCardMenu
        onRename={onRename}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDelete={onDelete}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
      />
    </div>
  );
}
