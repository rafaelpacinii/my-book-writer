"use client";

import { useSidebarCollapse } from "@/hooks/useSidebarCollapse";
import { SidebarHeader } from "@/components/shared/SidebarHeader";
import { SidebarNav } from "@/components/shared/SidebarNav";
import { SidebarFooter } from "@/components/shared/SidebarFooter";

export function AppSidebar({ onNavigate }: { onNavigate: () => void }) {
  const { isCollapsed, toggle } = useSidebarCollapse();

  return (
    <aside data-app-sidebar aria-label="Menu principal" className="workspace-sidebar">
      <SidebarHeader isCollapsed={isCollapsed} onToggle={toggle} onNavigate={onNavigate} />
      <SidebarNav onNavigate={onNavigate} />
      <SidebarFooter onNavigate={onNavigate} />
    </aside>
  );
}
