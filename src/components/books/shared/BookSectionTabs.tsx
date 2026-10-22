"use client";

import { useSectionTabNavigation } from "@/hooks/useSectionTabNavigation";

interface Props<T extends string> {
  items: readonly { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  panelId: string;
}

export function BookSectionTabs<T extends string>({ items, value, onChange, label, panelId }: Props<T>) {
  const onKeyDown = useSectionTabNavigation(items, value, onChange);
  return (
    <div role="tablist" aria-label={label} className="mb-6 flex flex-wrap gap-1 border-b border-border pb-3">
      {items.map((item) => (
        <button key={item.id} id={`${panelId}-${item.id}`} type="button" role="tab"
          aria-selected={value === item.id} aria-controls={panelId} tabIndex={value === item.id ? 0 : -1}
          onClick={() => onChange(item.id)} onKeyDown={onKeyDown}
          className={`min-h-10 rounded-lg px-3 text-sm font-medium ${value === item.id
            ? "bg-primary-soft text-primary" : "text-muted hover:bg-surface-hover hover:text-foreground"}`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
