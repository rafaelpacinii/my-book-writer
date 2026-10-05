"use client";

import React from "react";
import { useEditorCanvas } from "@/hooks/useEditorCanvas";

interface Props {
  contentRef: React.RefObject<HTMLDivElement | null>; initialContent: string;
  onChange: (html: string) => void; fontSizePt?: number; lineHeightRatio?: number;
  fontFamily?: string;
  onSelectionChange?: () => void; onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  textColor?: string; minHeight?: string; paddingY?: string; isPaged?: boolean;
}

export function EditorCanvas({
  contentRef, initialContent, onChange, fontSizePt = 11, fontFamily,
  lineHeightRatio = 1.6, onSelectionChange, onKeyDown: onKeyDownProp,
  textColor = "text-foreground", minHeight = "min-h-[480px]", paddingY = "py-4", isPaged = false,
}: Props) {
  const { triggerChange, handleKeyDown } = useEditorCanvas({
    contentRef, initialContent, onChange, onSelectionChange, onKeyDown: onKeyDownProp,
  });

  return (
    <div className={`w-full ${isPaged ? "h-auto" : "flex-1 flex flex-col"} ${paddingY}`}>
      <div
        ref={contentRef} contentEditable suppressContentEditableWarning
        onInput={triggerChange} onKeyDown={handleKeyDown}
        onKeyUp={onSelectionChange} onMouseUp={onSelectionChange}
        data-placeholder="Comece a escrever a história deste capítulo aqui..."
        style={{ fontSize: `${fontSizePt * 96 / 72}px`, lineHeight: lineHeightRatio, fontFamily }}
        className={`editor-content w-full ${isPaged ? "h-auto" : "flex-1"} ${minHeight} bg-transparent font-serif ${textColor} p-0 focus:ring-0 leading-relaxed tracking-normal outline-none`}
        spellCheck="true"
      />
    </div>
  );
}
