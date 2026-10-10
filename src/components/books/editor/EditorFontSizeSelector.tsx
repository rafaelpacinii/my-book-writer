"use client";

import React from "react";

const SIZES = [9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 14];

interface Props {
  fontSizePt?: number;
  onSelectFontSize: (pt: number) => void;
}

export function EditorFontSizeSelector({ fontSizePt = 11, onSelectFontSize }: Props) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={fontSizePt}
        onChange={(e) => onSelectFontSize(Number(e.target.value))}
        className="text-xs font-medium text-foreground bg-surface hover:bg-surface-hover border border-border rounded-md px-2 py-1 pr-5 cursor-pointer appearance-none outline-none focus:border-primary transition-colors"
        title="Alterar tamanho da fonte do livro"
      >
        {SIZES.map((pt) => (
          <option key={pt} value={pt}>
            {pt} pt
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-1.5 text-muted text-[10px]">
        ⌄
      </span>
    </div>
  );
}

