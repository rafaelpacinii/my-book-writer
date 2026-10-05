"use client";

import type { RefObject } from "react";
import { useEditorCanvas } from "@/hooks/useEditorCanvas";

interface Props {
  contentRef: RefObject<HTMLDivElement | null>;
  initialContent: string;
  onChange: (html: string) => void;
  onSelectionChange?: () => void;
  fontSizePx: number;
  lineHeight: number;
}

export function EditorPagedCanvas(props: Props) {
  const { triggerChange, handleKeyDown } = useEditorCanvas(props);

  return (
    <div
      ref={props.contentRef}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label="Texto do capítulo"
      aria-multiline="true"
      onInput={triggerChange}
      onKeyDown={handleKeyDown}
      onKeyUp={props.onSelectionChange}
      onMouseUp={props.onSelectionChange}
      style={{ fontSize: props.fontSizePx, lineHeight: props.lineHeight }}
      className="editor-content editor-content-paged w-full bg-transparent p-0 outline-none"
      spellCheck
    />
  );
}
