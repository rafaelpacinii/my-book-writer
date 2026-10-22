"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { useSidebarTooltip } from "@/hooks/useSidebarTooltip";
import { SidebarTooltip } from "@/components/shared/SidebarTooltip";

interface Props {
  label: string;
  href: string;
  icon: LucideIcon;
  onNavigate: () => void;
}

export function SidebarNavLink({ label, href, icon: Icon, onNavigate }: Props) {
  const pathname = usePathname();
  const tooltip = useSidebarTooltip();

  return (
    <>
      <Link data-sidebar-item href={href} onClick={onNavigate} aria-label={label}
        aria-current={pathname === href ? "page" : undefined}
        aria-describedby={tooltip.position ? tooltip.id : undefined}
        onMouseEnter={tooltip.show} onMouseLeave={tooltip.hide} onFocus={tooltip.show} onBlur={tooltip.hide}
        className="workspace-nav-link min-w-0 flex-1"
      >
        <Icon className="h-5 w-5 shrink-0" strokeWidth={1.6} />
        <span data-sidebar-expanded className="truncate">{label}</span>
      </Link>
      <SidebarTooltip id={tooltip.id} label={label} position={tooltip.position} />
    </>
  );
}
