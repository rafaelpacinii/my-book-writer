import React from "react";
import type { DiffPart } from "@/types/chapterVersion";

export function DiffView({ diffParts }: { diffParts: DiffPart[] }) {
  return (
    <div className="font-serif leading-relaxed text-sm p-4 rounded-lg border border-border bg-surface whitespace-pre-wrap select-text">
      {diffParts.map((part, idx) => {
        if (part.type === "added") {
          return (
            <mark key={idx} className="bg-emerald-100 text-emerald-900 rounded px-0.5 no-underline">
              {part.value}
            </mark>
          );
        }
        if (part.type === "removed") {
          return (
            <del key={idx} className="bg-rose-100 text-rose-900 line-through rounded px-0.5 opacity-80">
              {part.value}
            </del>
          );
        }
        return <span key={idx}>{part.value}</span>;
      })}
    </div>
  );
}

