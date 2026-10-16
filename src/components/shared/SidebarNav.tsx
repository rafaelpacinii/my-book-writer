"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Plus, Settings } from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Início",
    href: "/home",
    icon: <Home className="w-5 h-5 shrink-0" strokeWidth={1.8} />,
  },
  {
    label: "Biblioteca",
    href: "/library",
    icon: <LayoutGrid className="w-5 h-5 shrink-0" strokeWidth={1.8} />,
  },
  {
    label: "Novo livro",
    href: "/books/new",
    icon: <Plus className="w-5 h-5 shrink-0" strokeWidth={1.8} />,
  },
  {
    label: "Configurações",
    href: "/settings",
    icon: <Settings className="w-5 h-5 shrink-0" strokeWidth={1.8} />,
  },
];

interface Props {
  isCollapsed?: boolean;
}

export function SidebarNav({ isCollapsed = false }: Props) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1.5">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            title={isCollapsed ? item.label : undefined}
            className={`flex items-center rounded-lg transition-colors ${
              isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5 text-[13px]"
            } ${
              isActive
                ? "bg-primary-soft text-primary font-bold"
                : "text-muted hover:text-foreground hover:bg-surface-elevated font-medium"
            }`}
          >
            {item.icon}
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
