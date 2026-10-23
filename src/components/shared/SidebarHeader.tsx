import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { BrandAsset } from "@/components/shared/BrandAsset";

interface Props {
  isCollapsed: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}

export function SidebarHeader({ isCollapsed, onToggle, onNavigate }: Props) {
  return (
    <div data-sidebar-header className="sidebar-brand-header mb-5 shrink-0 border-b border-border pb-4">
      <Link data-sidebar-item data-sidebar-brand href="/home" onClick={onNavigate} aria-label="My Book Writer — início" title="My Book Writer"
        className="flex items-center justify-center rounded-lg text-primary hover:bg-surface-hover"
      >
        <BrandAsset variant="horizontal" className="sidebar-brand-horizontal" />
        <BrandAsset className="sidebar-brand-symbol" />
      </Link>
      <button type="button" onClick={onToggle}
        aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
        aria-expanded={!isCollapsed}
        className="sidebar-collapse-button mt-4 hidden h-8 items-center justify-end gap-2 rounded-md px-2 text-xs text-muted hover:bg-surface-hover hover:text-foreground min-[700px]:flex"
      >
        <span data-sidebar-expanded>Recolher</span>
        <PanelLeftClose data-collapse-icon className="h-4 w-4" />
        <PanelLeftOpen data-expand-icon className="hidden h-4 w-4" />
      </button>
      <button type="button" onClick={onNavigate} aria-label="Fechar menu"
        className="mt-4 flex h-8 w-full items-center justify-end gap-2 rounded-md px-2 text-xs text-muted hover:bg-surface-hover hover:text-foreground min-[700px]:hidden"
      >
        Fechar<X className="h-4 w-4" />
      </button>
    </div>
  );
}
