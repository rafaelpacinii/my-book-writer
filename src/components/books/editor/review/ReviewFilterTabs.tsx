"use client";

import React from "react";
import type { ReviewFilter } from "@/hooks/useReview";

interface Props {
  currentFilter: ReviewFilter;
  onSelect: (filter: ReviewFilter) => void;
  counts: { all: number; open: number; resolved: number };
}

export function ReviewFilterTabs({ currentFilter, onSelect, counts }: Props) {
  const tabs: Array<{ key: ReviewFilter; label: string; count: number }> = [
    { key: "all", label: "Todos", count: counts.all },
    { key: "open", label: "Abertos", count: counts.open },
    { key: "resolved", label: "Resolvidos", count: counts.resolved },
  ];

  return (
    <div className="flex items-center gap-1 bg-surface-hover/60 p-1 rounded-lg border border-border text-xs">
      {tabs.map((tab) => {
        const active = currentFilter === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onSelect(tab.key)}
            className={`flex-1 py-1 px-2 rounded-md font-bold transition-colors cursor-pointer text-center truncate ${
              active
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted hover:text-foreground"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        );
      })}
    </div>
  );
}

