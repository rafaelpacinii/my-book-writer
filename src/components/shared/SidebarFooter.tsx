"use client";

import React from "react";
import { Check, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { SidebarUserProfile } from "./SidebarUserProfile";

interface Props {
  isCollapsed: boolean;
}

export function SidebarFooter({ isCollapsed }: Props) {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <div className="pt-3 border-t border-border flex flex-col gap-2">
      <div
        className={`flex items-center text-muted px-2 py-1 select-none ${
          isCollapsed ? "justify-center" : "gap-2"
        }`}
        title="Salvo neste dispositivo"
      >
        <Check className="w-4 h-4 text-success shrink-0" strokeWidth={2.5} />
        {!isCollapsed && (
          <span className="text-xs font-normal truncate">
            Salvo no dispositivo
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        title={resolvedTheme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
        aria-label="Alternar tema"
        className={`flex items-center rounded-lg p-2 text-muted hover:text-foreground hover:bg-surface-elevated transition-colors cursor-pointer select-none ${
          isCollapsed ? "justify-center" : "gap-2.5 text-xs font-medium px-2.5"
        }`}
      >
        {resolvedTheme === "dark" ? (
          <Sun className="w-4.5 h-4.5 shrink-0" strokeWidth={1.8} />
        ) : (
          <Moon className="w-4.5 h-4.5 shrink-0" strokeWidth={1.8} />
        )}
        {!isCollapsed && (
          <span>{resolvedTheme === "dark" ? "Tema Claro" : "Tema Escuro"}</span>
        )}
      </button>

      <SidebarUserProfile isCollapsed={isCollapsed} />
    </div>
  );
}

