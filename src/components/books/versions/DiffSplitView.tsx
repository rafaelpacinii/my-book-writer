import React from "react";
import type { IndexedDiffPart } from "@/utils/textDiff";

interface Props {
  parts: IndexedDiffPart[];
  leftLabel: string;
  rightLabel: string;
}

export function DiffSplitView({ parts, leftLabel, rightLabel }: Props) {
  const leftParts = parts.filter((p) => p.type !== "added");
  const rightParts = parts.filter((p) => p.type !== "removed");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border flex-1 min-h-0">
      <div className="p-8 overflow-y-auto flex flex-col font-serif">
        <h3 className="text-xs uppercase font-sans font-bold tracking-wider text-muted mb-4 sticky top-0 bg-background/90 py-1">
          {leftLabel}
        </h3>
        <div className="text-base leading-relaxed whitespace-pre-wrap text-foreground">
          {leftParts.map((part, idx) => (
            part.type === "removed" ? (
              <del key={idx} className="bg-rose-500/20 text-rose-900 dark:text-rose-200 line-through rounded-[2px] opacity-80">
                {part.value}
              </del>
            ) : <span key={idx}>{part.value}</span>
          ))}
        </div>
      </div>

      <div className="p-8 overflow-y-auto flex flex-col font-serif">
        <h3 className="text-xs uppercase font-sans font-bold tracking-wider text-muted mb-4 sticky top-0 bg-background/90 py-1">
          {rightLabel}
        </h3>
        <div className="text-base leading-relaxed whitespace-pre-wrap text-foreground">
          {rightParts.map((part, idx) => (
            part.type === "added" ? (
              <ins key={idx} className="bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 no-underline rounded-[2px]">
                {part.value}
              </ins>
            ) : <span key={idx}>{part.value}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

