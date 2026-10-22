"use client";

import { usePathname } from "next/navigation";
import { Menu, Moon, ShieldCheck, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const names: Record<string, string> = {
  "/home": "Início", "/library": "Biblioteca",
  "/books/new": "Novo livro", "/settings": "Configurações",
};

export function AppHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="workspace-header flex shrink-0 items-center justify-between gap-4 border-b border-border">
      <div className="flex min-w-0 items-center gap-3 text-[11px]">
        <button type="button" onClick={onOpenMenu} aria-label="Abrir menu"
          className="rounded p-2 text-muted min-[700px]:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
        <span className="hidden text-muted sm:inline">Seu espaço</span>
        <span className="hidden text-muted sm:inline" aria-hidden="true">/</span>
        <span className="truncate">{names[pathname] || "Seu livro"}</span>
      </div>
      <div className="flex shrink-0 items-center gap-4 text-muted">
        <span className="hidden items-center gap-1.5 text-[10px] min-[430px]:flex">
          <ShieldCheck className="h-3.5 w-3.5" />Armazenamento local
        </span>
        <button type="button" onClick={toggleTheme} aria-label="Alternar tema"
          className="rounded-md p-2 hover:bg-surface-hover hover:text-foreground"
        >
          {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
