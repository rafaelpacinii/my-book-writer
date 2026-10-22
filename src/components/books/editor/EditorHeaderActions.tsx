"use client";

import { MoreHorizontal, SlidersHorizontal } from "lucide-react";
import { useBookMenu } from "@/hooks/useBookMenu";
import { EditorSecondaryActions } from "./EditorSecondaryActions";
import type { EditorActionProps } from "./editorActionTypes";
import styles from "./editorChrome.module.css";

export function EditorHeaderActions(props: EditorActionProps) {
  const menuRef = useBookMenu();
  return (
    <div className={styles.actions}>
      <button type="button" onClick={props.onOpenSettings} aria-label="Diagramação"
        title="Diagramação do livro" className={`${styles.action} text-muted hover:bg-surface-hover hover:text-foreground`}
      >
        <SlidersHorizontal className="h-4 w-4" /><span className={styles.settingsLabel}>Diagramação</span>
      </button>
      <div className={styles.expandedActions}><EditorSecondaryActions {...props} /></div>
      <details ref={menuRef} className={`${styles.compactActions} relative`}>
        <summary aria-label="Mais opções do editor"
          className={`${styles.action} cursor-pointer list-none text-muted hover:bg-surface-hover hover:text-foreground [&::-webkit-details-marker]:hidden`}
        >
          <MoreHorizontal className="h-4 w-4" /><span>Mais</span>
        </summary>
        <div className={`${styles.popup} rounded-lg border border-border bg-surface shadow-lg`}
          onClick={(event) => {
            if (event.target instanceof Element && event.target.closest("button, a") && menuRef.current) menuRef.current.open = false;
          }}
        >
          <EditorSecondaryActions {...props} />
        </div>
      </details>
    </div>
  );
}
