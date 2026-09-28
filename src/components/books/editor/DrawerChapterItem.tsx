import React from "react";
import { Check } from "lucide-react";
import type { ChapterSummary } from "@/types/chapter";

interface Props {
  chapter: ChapterSummary;
  index: number;
  isActive: boolean;
  onSelect: (id: string) => void;
}

export function DrawerChapterItem({
  chapter,
  index,
  isActive,
  onSelect,
}: Props) {
  const num = String(index + 1).padStart(2, "0");

  return (
    <button
      type="button"
      onClick={() => onSelect(chapter.id)}
      className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-xs transition-colors text-left cursor-pointer ${isActive
          ? "bg-primary-soft text-primary font-bold shadow-2xs"
          : "text-foreground hover:bg-surface-hover"
        }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="font-serif text-xs text-muted shrink-0">{num}</span>
        <span className="truncate">{chapter.title}</span>
      </div>
      {isActive && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
    </button>
  );
}
