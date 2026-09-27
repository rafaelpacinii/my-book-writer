"use client";

import React from "react";
import { useTheme } from "@/hooks/useTheme";

export function AuthHeader() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between w-full h-18 px-8 lg:px-16">
      <div className="flex items-center gap-3">
        <svg
          className="w-7.5 h-7.5 text-primary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 3h6a3 3 0 0 1 3 3v15a4 4 0 0 0-4-2H4z" />
          <path d="M13 6a3 3 0 0 1 3-3h5v16h-4a4 4 0 0 0-4 2" />
        </svg>
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
          <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        ) : (
          <svg className="w-5.5 h-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>
    </header>
  );
}
