"use client";

import { SidebarNav } from "@/components/shared/SidebarNav";
import { SidebarFooter } from "@/components/shared/SidebarFooter";

export function AppSidebar({ onNavigate }: { onNavigate: () => void }) {
  return (
    <aside data-app-sidebar aria-label="Menu principal" className="workspace-sidebar">
      <SidebarNav onNavigate={onNavigate} />
      <SidebarFooter onNavigate={onNavigate} />
    </aside>
  );
}
