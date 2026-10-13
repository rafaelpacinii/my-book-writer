import React from "react";
import type { IndexedDiffPart } from "@/utils/textDiff";

interface Props {
  parts: IndexedDiffPart[];
  activeChangeIndex: number;
}

export function DiffUnifiedView({ parts, activeChangeIndex }: Props) {
  if (parts.length === 0) {
    return (
      <div className="py-24 text-center text-sm text-muted">
        Nenhum conteúdo para comparar ou os textos são idênticos.
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-8 lg:p-12 font-serif text-base leading-relaxed whitespace-pre-wrap select-text text-foreground">
      {parts.map((part, idx) => {
        const isActive = Boolean(part.changeIndex && part.changeIndex === activeChangeIndex);

        if (part.type === "added") {
          return (
            <ins
              key={idx}
              data-change-id={part.changeIndex ? `change-${part.changeIndex}` : undefined}
              className={`bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 no-underline rounded-[2px] transition-all ${
                isActive ? "ring-2 ring-emerald-600 ring-offset-2 bg-emerald-500/35" : ""
              }`}
            >
              {part.value}
            </ins>
          );
        }

        if (part.type === "removed") {
          return (
            <del
              key={idx}
              data-change-id={part.changeIndex ? `change-${part.changeIndex}` : undefined}
              className={`bg-rose-500/20 text-rose-900 dark:text-rose-200 line-through rounded-[2px] opacity-80 transition-all ${
                isActive ? "ring-2 ring-rose-600 ring-offset-2 bg-rose-500/35" : ""
              }`}
            >
              {part.value}
            </del>
          );
        }

        return <span key={idx}>{part.value}</span>;
      })}
    </div>
  );
}

