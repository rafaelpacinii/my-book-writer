"use client";

import { useId, useRef, useState, type ToggleEvent } from "react";

export function useLibraryCreateMenu() {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, setOpen] = useState(false);
  const onToggle = (event: ToggleEvent<HTMLDivElement>) => {
    const opened = event.newState === "open";
    setOpen(opened);
    const trigger = triggerRef.current;
    const popover = popoverRef.current;
    if (!opened || !trigger || !popover) return;
    const rect = trigger.getBoundingClientRect();
    const bounds = popover.getBoundingClientRect();
    popover.style.left = `${Math.max(12, Math.min(rect.left, innerWidth - bounds.width - 12))}px`;
    popover.style.top = `${Math.max(12, Math.min(rect.bottom + 8, innerHeight - bounds.height - 12))}px`;
    popover.querySelector<HTMLElement>("a[href], button:not(:disabled)")?.focus();
  };
  const close = () => {
    popoverRef.current?.hidePopover();
    triggerRef.current?.focus();
  };
  return { id, triggerRef, popoverRef, isOpen, onToggle, close };
}
