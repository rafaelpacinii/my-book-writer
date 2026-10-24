"use client";

import { useCallback, useEffect, useId, useState, type FocusEvent, type MouseEvent } from "react";
import { useSidebarCollapse } from "@/hooks/useSidebarCollapse";
import type { TooltipPosition } from "@/components/shared/SidebarTooltip";

export function useSidebarTooltip(options?: { always?: boolean }) {
  const { isCollapsed } = useSidebarCollapse();
  const id = useId();
  const [position, setPosition] = useState<TooltipPosition | null>(null);
  const hide = useCallback(() => setPosition(null), []);
  const show = (event: MouseEvent<HTMLElement> | FocusEvent<HTMLElement>) => {
    if ((!options?.always && !isCollapsed) || !matchMedia("(min-width: 700px)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setPosition({ left: bounds.right + 14, top: bounds.top + bounds.height / 2, placement: "right" });
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

  return { id, position: (options?.always || isCollapsed) ? position : null, show, hide };
}
