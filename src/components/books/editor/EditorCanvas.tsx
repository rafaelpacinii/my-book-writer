"use client";

import React from "react";
import { useEditorCanvas } from "@/hooks/useEditorCanvas";

interface Props {
  contentRef: React.RefObject<HTMLDivElement | null>;
  initialContent: string;
  onChange: (html: string) => void;
  onSelectionChange?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  textColor?: string;
  minHeight?: string;
  paddingY?: string;
}

export function EditorCanvas({
  contentRef,
  initialContent,
  onChange,
  onSelectionChange,
  onKeyDown: onKeyDownProp,
  textColor = "text-foreground",
  minHeight = "min-h-[480px]",
  paddingY = "py-4",
}: Props) {
  const { triggerChange, handleKeyDown } = useEditorCanvas({
    contentRef,
    initialContent,
    onChange,
    onSelectionChange,
    onKeyDown: onKeyDownProp,
  });

  return (
    <div className={`w-full flex-1 flex flex-col ${paddingY}`}>
      <div
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        onInput={triggerChange}
        onKeyDown={handleKeyDown}
        onKeyUp={onSelectionChange}
        onMouseUp={onSelectionChange}
        data-placeholder="Comece a escrever a história deste capítulo aqui..."
        style={{ fontSize: "18px", lineHeight: "32px" }}
        className={`editor-content w-full flex-1 ${minHeight} bg-transparent font-serif ${textColor} p-0 focus:ring-0 tracking-normal outline-none`}
        spellCheck="true"
      />
    </div>
  );
}
