"use client";

import React, { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { getInitials } from "@/utils/format";
import { ProfileModal } from "./ProfileModal";

export function ProfileAvatarButton() {
  const { profile } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const initials = getInitials(profile?.display_name);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        title={profile?.display_name || "Configurações do Autor"}
        aria-label="Abrir configurações do perfil"
        className="w-9 h-9 rounded-full bg-primary-soft text-primary font-bold text-xs flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all shrink-0"
      >
        {initials}
      </button>

      <ProfileModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
