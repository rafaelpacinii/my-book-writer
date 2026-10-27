"use client";

import type { ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { useLibraryCreateMenu } from "@/hooks/useLibraryCreateMenu";

export function ActionPopover({ label, children }: { label: string; children: ReactNode }) {
  const menu = useLibraryCreateMenu();
  return (
    <div>
      <button ref={menu.triggerRef} type="button" className={`${buttonStyles("ghost")} min-h-8 px-2`}
        aria-label={label} title={label} aria-expanded={menu.isOpen} popoverTarget={menu.id}>
        <MoreHorizontal size={18} aria-hidden="true" />
      </button>
      <div ref={menu.popoverRef} id={menu.id} popover="auto" onToggle={menu.onToggle}
        className="library-create-menu" role="group" aria-label={label}
        onClick={(event) => { if (event.target instanceof Element && event.target.closest("button")) menu.close(); }}>
        {children}
      </div>
    </div>
  );
}
