"use client";

import React from "react";
import { MessageSquare } from "lucide-react";
import styles from "./editorChrome.module.css";

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  openCommentsCount: number;
  needsRecheck: boolean;
}

export function EditorReviewButton({
  isOpen,
  onToggle,
  openCommentsCount,
  needsRecheck,
}: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isOpen}
      className={`${styles.action} ${
        isOpen
          ? "bg-primary-soft text-primary"
          : "hover:bg-surface-hover text-muted hover:text-foreground"
      }`}
      title={isOpen ? "Fechar painel de revisão" : "Abrir painel de revisão"}
    >
      <MessageSquare className="w-4 h-4" />
      <span>Revisão</span>
      {openCommentsCount > 0 ? (
        <span className="px-1.5 py-0.5 text-[11px] rounded-full bg-surface-hover font-bold text-muted">
          {openCommentsCount}
        </span>
      ) : needsRecheck ? (
        <span className="w-2 h-2 rounded-full bg-warning" />
      ) : null}
    </button>
  );
}

