import { ChevronLeft, ChevronRight } from "lucide-react";
import { SidebarUserProfile } from "@/components/shared/SidebarUserProfile";

interface Props {
  isCollapsed: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}

export function SidebarHeader({ isCollapsed, onToggle, onNavigate }: Props) {
  return (
    <div data-sidebar-header className="sidebar-profile-header relative mb-6 border-b border-border pb-6">
      <SidebarUserProfile onOpen={onNavigate} />
      <button type="button" onClick={onToggle}
        aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
        className="sidebar-collapse-button absolute top-2 hidden h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted shadow-xs hover:bg-surface-hover hover:text-foreground min-[700px]:flex"
      >
        <ChevronLeft data-collapse-icon className="h-4 w-4" />
        <ChevronRight data-expand-icon className="hidden h-4 w-4" />
      </button>
    </div>
  );
}
