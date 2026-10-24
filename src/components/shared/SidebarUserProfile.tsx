"use client";

import { useProfileDialog } from "@/hooks/useProfileDialog";
import { getInitials } from "@/utils/format";
import { ProfileModal } from "@/components/shared/ProfileModal";
import { useSidebarTooltip } from "@/hooks/useSidebarTooltip";
import { SidebarTooltip } from "@/components/shared/SidebarTooltip";

export function SidebarUserProfile({ onOpen }: { onOpen: () => void }) {
  const { profile, isLoading, isOpen, open, close } = useProfileDialog();
  const tooltip = useSidebarTooltip();
  const label = profile?.display_name || "Perfil do autor";

  return (
    <>
      <button data-sidebar-item type="button" onClick={() => { tooltip.hide(); open(); onOpen(); }}
        aria-label="Abrir configurações do perfil"
        aria-describedby={tooltip.position ? tooltip.id : undefined}
        onMouseEnter={tooltip.show} onMouseLeave={tooltip.hide} onFocus={tooltip.show} onBlur={tooltip.hide}
        className="sidebar-profile-button flex w-full items-center gap-3 rounded-lg py-1 text-left hover:bg-surface-hover"
      >
        <span className="sidebar-profile-avatar flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-primary-soft text-xs text-primary">
          {isLoading ? <span className="skeleton-pulse h-4 w-4 rounded" /> : getInitials(profile?.display_name)}
        </span>
        <span data-sidebar-expanded className="min-w-0 flex-1">
          <span className="mb-1 block text-[9px] tracking-wider text-muted uppercase">Perfil do autor</span>
          <span className="block truncate text-[13px] font-semibold">
            {isLoading ? <span className="skeleton-pulse block h-3 w-20 rounded" /> : profile?.display_name || "Seu perfil"}
          </span>
        </span>
      </button>
      <SidebarTooltip id={tooltip.id} label={label} position={tooltip.position} />
      <ProfileModal isOpen={isOpen} onClose={close} />
    </>
  );
}
