"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";
import { ProfileAvatarButton } from "./ProfileAvatarButton";

export function AppHeader() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between h-18 px-6 lg:px-8 border-b border-border bg-surface select-none shrink-0">
      <Link href="/home" className="flex items-center gap-3 group">
        <svg
          className="w-6.5 h-6.5 text-primary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 3h6a3 3 0 0 1 3 3v15a4 4 0 0 0-4-2H4z" />
          <path d="M13 6a3 3 0 0 1 3-3h5v16h-4a4 4 0 0 0-4 2" />
        </svg>
        <span className="font-bold text-sm tracking-tight text-foreground">
          my book writer
        </span>
      </Link>

      <div className="flex items-center gap-5 sm:gap-6">
        <div className="flex items-center gap-2 text-muted">
          <svg className="w-4 h-4 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l4 4L19 6" />
          </svg>
          <span className="text-xs font-normal hidden sm:inline">
            Salvo neste dispositivo
          </span>
        </div>

        <button
          onClick={toggleTheme}
          aria-label="Alternar tema"
          className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-elevated transition-colors cursor-pointer"
        >
          {resolvedTheme === "dark" ? (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 13A9 9 0 0 1 11 3 9 9 0 1 0 21 13Z" />
            </svg>
          )}
        </button>

        <ProfileAvatarButton />
      </div>
    </header>
  );
}
