"use client";

import React from "react";
import { BookOpen, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function AuthHeader() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between w-full h-18 px-8 lg:px-16">
      <div className="flex items-center gap-3">
        <BookOpen className="w-7.5 h-7.5 text-primary" strokeWidth={1.7} aria-hidden="true" />
        <span className="font-bold text-[18px] text-foreground tracking-tight">
          my book writer
        </span>
      </div>

      <button
        onClick={toggleTheme}
        aria-label={`Alternar para tema ${resolvedTheme === "dark" ? "claro" : "escuro"}`}
        className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface border border-transparent hover:border-border transition-colors cursor-pointer"
      >
        {resolvedTheme === "dark" ? (
          <Sun className="w-5.5 h-5.5" strokeWidth={1.8} />
        ) : (
          <Moon className="w-5.5 h-5.5" strokeWidth={1.8} />
        )}
      </button>
    </header>
  );
}
