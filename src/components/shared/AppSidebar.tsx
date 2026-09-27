"use client";

import React from "react";
import { useProfile } from "@/hooks/useProfile";
import { SidebarNav } from "./SidebarNav";

export function AppSidebar() {
  const { profile } = useProfile();

  return (
    <aside className="w-52 h-[calc(100vh-72px)] border-r border-border bg-surface shrink-0 hidden md:flex flex-col justify-between p-4 select-none">
      <div>
        <p className="px-2 pb-3 text-[11px] font-bold tracking-wider text-muted uppercase">
          Seu espaço
        </p>
        <SidebarNav />
      </div>

      <div className="pt-4 border-t border-border px-2">
        <p className="text-[13px] font-bold text-foreground truncate">
          {profile?.display_name || "Autor"}
        </p>
        <p className="text-xs text-muted">Seu espaço de escrita</p>
      </div>
    </aside>
  );
}
