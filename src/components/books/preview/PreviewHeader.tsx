import type { ReactNode } from "react";

export function PreviewHeader({ children }: { children: ReactNode }) {
  return (
    <header className="flex min-h-16 shrink-0 flex-wrap items-center justify-between gap-4 border-b border-border bg-surface px-5 py-3 select-none">
      <span className="min-w-0 truncate text-xs text-muted">Livro completo · somente leitura</span>
      {children}
    </header>
  );
}

