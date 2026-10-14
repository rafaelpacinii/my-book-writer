"use client";

import React, { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { getInitials } from "@/utils/format";
import { ProfileModal } from "./ProfileModal";

interface Props {
  isCollapsed: boolean;
}

export function SidebarUserProfile({ isCollapsed }: Props) {
  const { profile } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const initials = getInitials(profile?.display_name);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title={profile?.display_name || "Perfil do Autor"}
        aria-label="Abrir configurações do perfil"
        className={`w-full flex items-center rounded-lg p-1.5 hover:bg-surface-elevated transition-colors text-left cursor-pointer group ${
          isCollapsed ? "justify-center" : "gap-2.5"
        }`}
      >
        <span className="w-8 h-8 rounded-full bg-primary-soft text-primary font-bold text-xs flex items-center justify-center shrink-0 group-hover:ring-2 group-hover:ring-primary/40 transition-all">
          {initials}
        </span>
        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-foreground truncate leading-tight">
              {profile?.display_name || "Autor"}
            </p>
            <p className="text-[11px] text-muted truncate leading-tight mt-0.5">
              Seu espaço
            </p>
          </div>
        )}
      </button>

      <ProfileModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

