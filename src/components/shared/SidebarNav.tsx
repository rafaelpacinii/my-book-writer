"use client";

import { ChevronDown, Home, Library, Settings } from "lucide-react";
import { useSidebarNavigation } from "@/hooks/useSidebarNavigation";
import { SidebarNavLink } from "@/components/shared/SidebarNavLink";
import { SidebarRecentBooks } from "@/components/shared/SidebarRecentBooks";

export function SidebarNav({ onNavigate }: { onNavigate: () => void }) {
  const menu = useSidebarNavigation();

  return (
    <nav aria-label="Navegação principal" className="sidebar-navigation flex min-h-0 flex-1 flex-col pb-5">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <p className="sidebar-section-label">
          <span data-sidebar-expanded>PRINCIPAL</span>
          <span data-sidebar-compact aria-hidden="true">MENU</span>
        </p>
        <div className="flex flex-col gap-1">
          <SidebarNavLink label="Início" href="/home" icon={Home} onNavigate={onNavigate} />
          <div className="workspace-nav-row flex items-center">
            <SidebarNavLink label="Biblioteca" href="/library" icon={Library} onNavigate={onNavigate} />
            <button data-sidebar-expanded type="button" aria-controls={menu.collectionId}
              aria-expanded={menu.isCollectionOpen} onClick={menu.toggleCollection}
              aria-label={menu.isCollectionOpen ? "Ocultar livros recentes" : "Mostrar livros recentes"}
              className="mr-1 rounded-md p-2 text-muted hover:bg-surface-hover hover:text-foreground"
            >
              <ChevronDown className={`h-3.5 w-3.5 ${menu.isCollectionOpen ? "" : "-rotate-90"}`} />
            </button>
          </div>
          <div id={menu.collectionId} data-sidebar-expanded hidden={!menu.isCollectionOpen}>
            <SidebarRecentBooks onNavigate={onNavigate} />
          </div>
        </div>
      </div>
      <div className="sidebar-preferences mt-5 shrink-0 pt-4">
        <p className="sidebar-section-label">
          <span data-sidebar-expanded>PREFERÊNCIAS</span>
          <span data-sidebar-compact aria-hidden="true">AJUSTES</span>
        </p>
        <SidebarNavLink label="Configurações" href="/settings" icon={Settings} onNavigate={onNavigate} />
      </div>
    </nav>
  );
}
