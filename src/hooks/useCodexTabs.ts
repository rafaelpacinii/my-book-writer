"use client";

import { useRef, type KeyboardEvent } from "react";
import { codexKinds } from "@/utils/codexHub";
import type { CodexKind } from "@/types/codex";

export function useCodexTabs(onChange: (kind: CodexKind) => void) {
  const ref = useRef<HTMLDivElement>(null);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const buttons = Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)') ?? []);
    const current = buttons.findIndex((button) => button === event.target);
    if (current < 0) return;
    const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1
      : event.key === "ArrowRight" ? (current + 1) % buttons.length
        : event.key === "ArrowLeft" ? (current + buttons.length - 1) % buttons.length : -1;
    if (next < 0) return;
    event.preventDefault();
    buttons[next].focus();
    onChange(codexKinds[next]);
  };
  return { ref, onKeyDown };
}
