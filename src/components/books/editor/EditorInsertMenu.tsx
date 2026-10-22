"use client";

import { ChevronDown, Minus, Quote, Sparkles } from "lucide-react";
import { useEditorInsertMenu } from "@/hooks/useEditorInsertMenu";
import type { FormatAction } from "@/utils/textFormatting";
import styles from "./editorChrome.module.css";

export function EditorInsertMenu({ onFormat }: { onFormat: (action: FormatAction) => void }) {
  const { menuRef, rememberSelection, insert } = useEditorInsertMenu(onFormat);
  const items = [
    { action: "dialogue-dash", label: "Travessão de diálogo", Icon: Minus },
    { action: "quote", label: "Citação", Icon: Quote },
    { action: "scene-break", label: "Quebra de cena", Icon: Sparkles },
  ] as const;

  return (
    <details ref={menuRef} className="relative shrink-0">
      <summary className={`${styles.action} cursor-pointer list-none text-muted hover:bg-surface-hover hover:text-foreground [&::-webkit-details-marker]:hidden`}
        onPointerDown={rememberSelection}
        onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") rememberSelection(); }}
      >
        Inserir <ChevronDown className="h-3 w-3" />
      </summary>
      <div className={`${styles.popup} rounded-lg border border-border bg-surface shadow-lg`}>
        {items.map(({ action, label, Icon }) => (
          <button key={action} type="button" onMouseDown={(event) => event.preventDefault()}
            onClick={() => insert(action)} className={`${styles.action} text-foreground hover:bg-surface-hover`}
          >
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>
    </details>
  );
}
