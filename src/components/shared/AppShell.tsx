"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useWorkspaceScroll } from "@/hooks/useWorkspaceScroll";
import { useMobileNavigation } from "@/hooks/useMobileNavigation";
import { AppSidebar } from "@/components/shared/AppSidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const mainRef = useWorkspaceScroll();
  const menu = useMobileNavigation();
  const isStudio = /^\/books\/(editor|preview|versions)$/.test(usePathname());

  return (
    <div className="workspace-shell flex h-dvh overflow-hidden bg-background text-foreground">
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
        <main ref={mainRef} id="main-content" tabIndex={-1}
          className={isStudio ? "workspace-studio flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden" : "workspace-main min-h-0 min-w-0 flex-1 overflow-y-auto"}
        >
          <button type="button" onClick={menu.open} aria-label="Abrir menu"
            className="workspace-menu-trigger mb-5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-muted hover:bg-surface-hover hover:text-foreground min-[700px]:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          {children}
        </main>
      </div>
    </div>
  );
}
