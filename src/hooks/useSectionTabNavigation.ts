"use client";

import type { KeyboardEvent } from "react";

export function useSectionTabNavigation<T extends string>(items: readonly { id: T }[], value: T, onChange: (value: T) => void) {
  return (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = items.findIndex((item) => item.id === value);
    const next = event.key === "ArrowRight" ? (index + 1) % items.length
      : event.key === "ArrowLeft" ? (index - 1 + items.length) % items.length
      : event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    onChange(items[next].id);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
  };
}
