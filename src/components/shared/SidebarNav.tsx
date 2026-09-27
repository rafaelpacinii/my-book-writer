"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Plus } from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Início",
    href: "/home",
    icon: <Home className="w-5 h-5" strokeWidth={1.8} />,
  },
  {
    label: "Biblioteca",
    href: "/library",
    icon: <LayoutGrid className="w-5 h-5" strokeWidth={1.8} />,
  },
  {
    label: "Novo livro",
    href: "/books/new",
    icon: <Plus className="w-5 h-5" strokeWidth={1.8} />,
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1.5">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-colors ${isActive
                ? "bg-primary-soft text-primary font-bold"
                : "text-muted hover:text-foreground hover:bg-surface-elevated font-medium"
              }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
