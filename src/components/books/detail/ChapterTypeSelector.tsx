import React from "react";
import type { ChapterType } from "@/types/chapter";
import { CHAPTER_TYPE_OPTIONS } from "@/utils/chapterType";

interface Props {
  value: ChapterType;
  onChange: (type: ChapterType) => void;
}

export function ChapterTypeSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-foreground">
        Tipo de capítulo
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ChapterType)}
        className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        {CHAPTER_TYPE_OPTIONS.map((opt) => (
          <option key={opt.type} value={opt.type}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
