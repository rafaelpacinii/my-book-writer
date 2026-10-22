"use client";

import type { ReactNode } from "react";
import { useWorkspaceScroll } from "@/hooks/useWorkspaceScroll";
import { useMobileNavigation } from "@/hooks/useMobileNavigation";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { AppHeader } from "@/components/shared/AppHeader";

export function AppShell({ children }: { children: ReactNode }) {
  const mainRef = useWorkspaceScroll();
  const menu = useMobileNavigation();

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <a href="#main-content" className="sr-only z-50 rounded bg-surface p-3 focus:not-sr-only focus:fixed">
        Ir para o conteúdo
      </a>
      {menu.isOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 min-[700px]:hidden" onClick={menu.close} />
      )}
      <div ref={menu.dialogRef} data-open={menu.isOpen} className="workspace-navigation"
        role={menu.isOpen ? "dialog" : undefined} aria-modal={menu.isOpen || undefined}
        aria-label={menu.isOpen ? "Menu principal" : undefined} tabIndex={-1}
      >
        <AppSidebar onNavigate={menu.close} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col" inert={menu.isOpen}>
        <AppHeader onOpenMenu={menu.open} />
        <main ref={mainRef} id="main-content" tabIndex={-1}
          className="workspace-main min-h-0 min-w-0 flex-1 overflow-y-auto"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
