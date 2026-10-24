"use client";

import { useCallback, useEffect, useId, useState, type FocusEvent, type MouseEvent } from "react";
import type { TooltipPosition } from "@/components/shared/SidebarTooltip";

export function useWindowControlTooltip() {
  const id = useId();
  const [position, setPosition] = useState<TooltipPosition | null>(null);
  const hide = useCallback(() => setPosition(null), []);
  const show = (event: MouseEvent<HTMLElement> | FocusEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setPosition({
      left: bounds.left + bounds.width / 2,
      top: bounds.bottom + 6,
      placement: "bottom",
    });
  };

  useEffect(() => {
    if (!position) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") hide(); };
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
      window.removeEventListener("keydown", onKey);
    };
  }, [position, hide]);

  return { id, position, show, hide };
}

