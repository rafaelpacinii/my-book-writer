"use client";

import { Bold, Italic, Underline, Undo2, Redo2 } from "lucide-react";
import type { FormatAction } from "@/utils/textFormatting";

export interface FormattingProps {
  onFormat: (action: FormatAction) => void;
  onUndo: () => void;
  onRedo: () => void;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
}

export function EditorToolbarFormatting(props: FormattingProps) {
  const button = "flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface-hover hover:text-foreground";
  const formats = [
    { action: "bold", label: "Negrito (Ctrl+B)", Icon: Bold, active: props.isBold },
    { action: "italic", label: "Itálico (Ctrl+I)", Icon: Italic, active: props.isItalic },
    { action: "underline", label: "Sublinhado (Ctrl+U)", Icon: Underline, active: props.isUnderline },
  ] as const;

  return (
    <div className="flex items-center gap-0.5" onMouseDown={(event) => event.preventDefault()}>
      <button type="button" onClick={props.onUndo} className={button} title="Desfazer (Ctrl+Z)" aria-label="Desfazer">
        <Undo2 className="h-4 w-4" />
      </button>
      <button type="button" onClick={props.onRedo} className={button} title="Refazer (Ctrl+Y)" aria-label="Refazer">
        <Redo2 className="h-4 w-4" />
      </button>
      <span aria-hidden="true" className="mx-1 h-4 border-l border-border" />
      {formats.map(({ action, label, Icon, active }) => (
        <button key={action} type="button" title={label} aria-label={label} aria-pressed={Boolean(active)}
          onClick={() => props.onFormat(action)}
          className={`${button} ${active ? "bg-primary-soft text-primary" : ""}`}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
