"use client";

import { useProfileDialog } from "@/hooks/useProfileDialog";
import { getInitials } from "@/utils/format";
import { ProfileModal } from "@/components/shared/ProfileModal";

export function SidebarUserProfile({ onOpen }: { onOpen: () => void }) {
  const { profile, isLoading, isOpen, open, close } = useProfileDialog();

  return (
    <>
      <button data-sidebar-item type="button" onClick={() => { open(); onOpen(); }}
        aria-label="Abrir configurações do perfil" title={profile?.display_name || "Perfil do autor"}
        className="flex w-full items-center gap-3 rounded-lg py-1 text-left hover:bg-surface-hover"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-primary-soft text-xs text-primary">
          {isLoading ? <span className="skeleton-pulse h-4 w-4 rounded" /> : getInitials(profile?.display_name)}
        </span>
        <span data-sidebar-expanded className="min-w-0 flex-1">
          <span className="mb-1 block text-[9px] tracking-wider text-muted uppercase">Perfil do autor</span>
          <span className="block truncate text-[13px] font-semibold">
            {isLoading ? <span className="skeleton-pulse block h-3 w-20 rounded" /> : profile?.display_name || "Seu perfil"}
          </span>
        </span>
      </button>
      <ProfileModal isOpen={isOpen} onClose={close} />
    </>
  );
}
