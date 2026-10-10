"use client";

import React from "react";
import type { FontPreset } from "@/types/catalog";

interface Props {
  fonts: FontPreset[];
  currentFontId?: string;
  onSelectFont: (fontId: string) => void;
}

export function EditorFontSelector({ fonts, currentFontId, onSelectFont }: Props) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={currentFontId || ""}
        onChange={(e) => onSelectFont(e.target.value)}
        className="text-xs font-medium text-foreground bg-surface hover:bg-surface-hover border border-border rounded-md px-2 py-1 pr-6 cursor-pointer appearance-none outline-none focus:border-primary transition-colors"
        title="Alterar fonte do livro"
      >
        {fonts.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-1.5 text-muted text-[10px]">
        ⌄
      </span>
    </div>
  );
}

