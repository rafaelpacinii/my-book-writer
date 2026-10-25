"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSidebarCollapse } from "@/hooks/useSidebarCollapse";
import { useSidebarTooltip } from "@/hooks/useSidebarTooltip";
import { useWorkspaceNavigation } from "@/hooks/useWorkspaceNavigation";
import { SidebarTooltip } from "@/components/shared/SidebarTooltip";

export function TitleBarSidebarToggle() {
  const { isCollapsed, toggle } = useSidebarCollapse();
  const menu = useWorkspaceNavigation();
  const tooltip = useSidebarTooltip({ always: true, placement: "bottom" });
  const pathname = usePathname();
  if (pathname === "/auth" || pathname === "/") return null;
  const label = isCollapsed ? "Expandir menu" : "Recolher menu";

  return (
    <>
      <button type="button" aria-label={label} aria-expanded={!isCollapsed}
        aria-controls="workspace-navigation" className="titlebar-action titlebar-sidebar-desktop"
        onClick={() => { tooltip.hide(); toggle(); }}
        aria-describedby={tooltip.position ? tooltip.id : undefined}
        onMouseEnter={tooltip.show} onMouseLeave={tooltip.hide} onFocus={tooltip.show} onBlur={tooltip.hide}
      >
        {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
      </button>
      <button type="button" aria-label={menu.isOpen ? "Fechar menu" : "Abrir menu"}
        aria-controls="workspace-navigation" aria-expanded={menu.isOpen}
        className="titlebar-action titlebar-sidebar-mobile" onClick={menu.isOpen ? menu.close : menu.open}
      >
        {menu.isOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
      </button>
      <SidebarTooltip id={tooltip.id} label={label} position={tooltip.position} />
    </>
  );
}
