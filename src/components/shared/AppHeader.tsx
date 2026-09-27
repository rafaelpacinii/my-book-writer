"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Check, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { ProfileAvatarButton } from "./ProfileAvatarButton";

export function AppHeader() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between h-18 px-6 lg:px-8 border-b border-border bg-surface select-none shrink-0">
      <Link href="/home" className="flex items-center gap-3 group">
        <BookOpen className="w-6.5 h-6.5 text-primary" strokeWidth={1.7} />
        <span className="font-bold text-sm tracking-tight text-foreground">
          my book writer
        </span>
      </Link>

      <div className="flex items-center gap-5 sm:gap-6">
        <div className="flex items-center gap-2 text-muted">
          <Check className="w-4 h-4 text-success" strokeWidth={2.5} />
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
            <Sun className="w-5 h-5" strokeWidth={1.8} />
          ) : (
            <Moon className="w-5 h-5" strokeWidth={1.8} />
          )}
        </button>

        <ProfileAvatarButton />
      </div>
    </header>
  );
}
