"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { BrandAsset } from "@/components/shared/BrandAsset";
import { useTheme } from "@/hooks/useTheme";

export function AuthHeader() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="flex w-full items-start justify-between gap-4 px-5 py-4 sm:items-center sm:px-8 lg:px-16">
      <BrandAsset variant="horizontal" className="auth-brand-horizontal" />
      <BrandAsset variant="stacked" className="auth-brand-stacked" />

      <button
        onClick={toggleTheme}
        aria-label={`Alternar para tema ${resolvedTheme === "dark" ? "claro" : "escuro"}`}
        className="shrink-0 p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface border border-transparent hover:border-border transition-colors cursor-pointer"
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
