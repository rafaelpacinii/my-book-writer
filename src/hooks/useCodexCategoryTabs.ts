"use client";

import { useId, useRef, type KeyboardEvent } from "react";

export function useCodexCategoryTabs(keys: string[], select: (key: string) => void) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const buttons = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []);
    const index = buttons.findIndex((button) => button === event.target);
    if (index < 0 || !buttons.length) return;
    const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1
      : event.key === "ArrowRight" ? (index + 1) % buttons.length
        : event.key === "ArrowLeft" ? (index + buttons.length - 1) % buttons.length : -1;
    if (next < 0) return;
    event.preventDefault(); buttons[next].focus(); select(keys[next]);
  };
  return { id, ref, onKeyDown };
}
