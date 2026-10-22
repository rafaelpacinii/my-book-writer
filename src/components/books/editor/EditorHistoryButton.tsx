import React from "react";
import { History } from "lucide-react";
import styles from "./editorChrome.module.css";

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  count: number;
}

export function EditorHistoryButton({ isOpen, onToggle, count }: Props) {
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
      title={isOpen ? "Fechar histórico de versões" : "Abrir histórico de versões"}
    >
      <History className="w-4 h-4" />
      <span>Histórico</span>
      {count > 0 && (
        <span className="px-1.5 py-0.5 text-[11px] rounded-full bg-surface-hover font-bold text-muted">
          {count}
        </span>
      )}
    </button>
  );
}

