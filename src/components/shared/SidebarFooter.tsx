import { SidebarThemeToggle } from "@/components/shared/SidebarThemeToggle";
import { SidebarUserProfile } from "@/components/shared/SidebarUserProfile";

export function SidebarFooter({ onNavigate }: { onNavigate: () => void }) {
  return (
    <footer className="sidebar-footer flex shrink-0 flex-col gap-4 border-t border-border pt-4">
      <SidebarThemeToggle />
      <SidebarUserProfile onOpen={onNavigate} />
    </footer>
  );
}
