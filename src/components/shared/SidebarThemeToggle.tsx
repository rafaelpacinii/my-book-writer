"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useSidebarTooltip } from "@/hooks/useSidebarTooltip";
import { SidebarTooltip } from "@/components/shared/SidebarTooltip";

export function SidebarThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const tooltip = useSidebarTooltip();
  const label = resolvedTheme === "dark" ? "Tema claro" : "Tema escuro";

  return (
    <>
      <button data-sidebar-item type="button" onClick={() => { tooltip.hide(); toggleTheme(); }}
        aria-label="Alternar tema"
        aria-describedby={tooltip.position ? tooltip.id : undefined}
        onMouseEnter={tooltip.show} onMouseLeave={tooltip.hide} onFocus={tooltip.show} onBlur={tooltip.hide}
        className="sidebar-theme-toggle flex h-10 w-full items-center justify-center gap-2 rounded-lg px-3 text-xs text-muted hover:bg-surface-hover hover:text-foreground"
      >
        {resolvedTheme === "dark" ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
        <span data-sidebar-expanded>{label}</span>
      </button>
      <SidebarTooltip id={tooltip.id} label={label} position={tooltip.position} />
    </>
  );
}
