"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useWorkspaceScroll } from "@/hooks/useWorkspaceScroll";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";
import { AppSidebar } from "@/components/shared/AppSidebar";

export function AppShell({ children }: { children: ReactNode }) {
  const mainRef = useWorkspaceScroll();
  const menu = useWorkspaceNavigation();
  const isStudio = /^\/books\/(editor|preview|versions)$/.test(usePathname());

  return (
    <div className="workspace-shell flex overflow-hidden text-foreground">
      <a href="#main-content" className="sr-only z-50 rounded bg-surface p-3 focus:not-sr-only focus:fixed">
        Ir para o conteúdo
      </a>
      {menu.isOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 min-[700px]:hidden" onClick={menu.close} />
      )}
      <div id="workspace-navigation" ref={menu.dialogRef} data-open={menu.isOpen} className="workspace-navigation"
        role={menu.isOpen ? "dialog" : undefined} aria-modal={menu.isOpen || undefined}
        aria-label={menu.isOpen ? "Menu principal" : undefined} tabIndex={-1}
      >
        <AppSidebar onNavigate={menu.close} />
      </div>
      <div className="workspace-content flex min-w-0 flex-1 flex-col" inert={menu.isOpen}>
        <main ref={mainRef} id="main-content" tabIndex={-1}
          className={isStudio ? "workspace-studio flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden" : "workspace-main min-h-0 min-w-0 flex-1 overflow-y-auto"}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
