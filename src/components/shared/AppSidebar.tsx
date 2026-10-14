"use client";

import React, { useEffect, useState } from "react";
import { useSidebarCollapse } from "@/hooks/useSidebarCollapse";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarNav } from "./SidebarNav";
import { SidebarFooter } from "./SidebarFooter";

export function AppSidebar() {
  const { isCollapsed, toggle } = useSidebarCollapse();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <aside
      className={`h-screen border-r border-border bg-surface shrink-0 flex flex-col justify-between select-none ${
        mounted ? "transition-all duration-200 ease-in-out" : ""
      } ${isCollapsed ? "w-18 p-2.5" : "w-64 p-4"}`}
    >
      <div className="flex flex-col gap-4">
        <SidebarHeader isCollapsed={isCollapsed} onToggle={toggle} />
        {!isCollapsed && (
          <p className="px-2 text-[11px] font-bold tracking-wider text-muted uppercase">
            Seu espaço
          </p>
        )}
        <SidebarNav isCollapsed={isCollapsed} />
      </div>

      <SidebarFooter isCollapsed={isCollapsed} />
    </aside>
  );
}
