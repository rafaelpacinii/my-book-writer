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
      <div className="flex items-center gap-1.5">
        <GripVertical className="w-4 h-4 text-muted/30 group-hover:text-muted transition-colors cursor-grab" />
        <span className="font-serif text-3xl font-light text-primary/70 group-hover:text-primary transition-colors">
          {chapterNumber}
        </span>
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
