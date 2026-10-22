"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function SidebarThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button data-sidebar-item type="button" onClick={toggleTheme} aria-label="Alternar tema"
      title={resolvedTheme === "dark" ? "Ativar tema claro" : "Ativar tema escuro"}
      className="sidebar-theme-toggle flex h-10 w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-3 text-xs text-muted hover:bg-surface-hover hover:text-foreground"
    >
      {resolvedTheme === "dark" ? <Sun className="h-4 w-4 shrink-0" /> : <Moon className="h-4 w-4 shrink-0" />}
      <span data-sidebar-expanded>{resolvedTheme === "dark" ? "Tema claro" : "Tema escuro"}</span>
    </button>
  );
}
