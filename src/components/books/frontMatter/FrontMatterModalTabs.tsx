"use client";

import React from "react";

export type FrontMatterTab = "half-title" | "title-page" | "copyright" | "dedication" | "toc";

interface Props {
  activeTab: FrontMatterTab;
  onSelectTab: (tab: FrontMatterTab) => void;
}

export function FrontMatterModalTabs({ activeTab, onSelectTab }: Props) {
  const tabs: { id: FrontMatterTab; label: string }[] = [
    { id: "half-title", label: "Falsa Folha" },
    { id: "title-page", label: "Folha de Rosto" },
    { id: "copyright", label: "Copyright & Créditos" },
    { id: "dedication", label: "Dedicatória & Epígrafe" },
    { id: "toc", label: "Sumário" },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border text-xs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSelectTab(tab.id)}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 cursor-pointer ${
            activeTab === tab.id
              ? "bg-primary text-primary-foreground"
              : "text-muted hover:text-foreground hover:bg-surface-hover"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

