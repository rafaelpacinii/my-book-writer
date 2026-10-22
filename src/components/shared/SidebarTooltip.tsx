"use client";

import { createPortal } from "react-dom";

interface Props {
  id: string;
  label: string;
  position: { left: number; top: number } | null;
}

export function SidebarTooltip({ id, label, position }: Props) {
  if (!position) return null;
  return createPortal(
    <div id={id} role="tooltip" style={position}
      className="pointer-events-none fixed z-[60] -translate-y-1/2 rounded-md bg-foreground px-3 py-2 text-xs text-background shadow-lg"
    >
      <span aria-hidden="true" className="absolute top-1/2 -left-1 h-2 w-2 -translate-y-1/2 rotate-45 bg-foreground" />
      {label}
    </div>, document.body,
  );
}
