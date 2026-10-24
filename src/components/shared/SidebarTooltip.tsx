"use client";

import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";

export interface TooltipPosition {
  left: number;
  top: number;
  placement?: "right" | "bottom";
}

interface Props {
  id: string;
  label: string;
  position: TooltipPosition | null;
}

export function SidebarTooltip({ id, label, position }: Props) {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = tooltipRef.current;
    if (!el || !position) return;
    const placement = position.placement ?? "right";
    const rect = el.getBoundingClientRect();
    const margin = 8;

    if (placement === "bottom") {
      let shift = 0;
      if (rect.right > window.innerWidth - margin) {
        shift = window.innerWidth - margin - rect.right;
      } else if (rect.left < margin) {
        shift = margin - rect.left;
      }
      el.style.transform = `translateX(calc(-50% + ${shift}px))`;
    } else {
      let shiftY = 0;
      if (rect.bottom > window.innerHeight - margin) {
        shiftY = window.innerHeight - margin - rect.bottom;
      } else if (rect.top < margin) {
        shiftY = margin - rect.top;
      }
      el.style.transform = `translateY(calc(-50% + ${shiftY}px))`;
    }
  }, [position]);

  if (!position) return null;

  return createPortal(
    <div
      ref={tooltipRef}
      id={id}
      role="tooltip"
      style={{ left: position.left, top: position.top }}
      className="pointer-events-none fixed z-[120] whitespace-nowrap rounded-md bg-foreground px-2.5 py-1 text-xs font-normal text-background shadow-md"
    >
      {label}
    </div>,
    document.body,
  );
}
