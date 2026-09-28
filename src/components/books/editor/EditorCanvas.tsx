"use client";

import React, { useEffect, useRef } from "react";

interface Props {
  contentRef: React.RefObject<HTMLDivElement | null>;
  initialContent: string;
  onChange: (html: string) => void;
  fontSizePt?: number;
  lineHeightRatio?: number;
  onSelectionChange?: () => void;
}

export function EditorCanvas({
  contentRef, initialContent, onChange, fontSizePt = 11,
  lineHeightRatio = 1.6, onSelectionChange,
}: Props) {
  const isInternal = useRef(false);

  const triggerChange = () => {
    if (!contentRef.current) return;
    isInternal.current = true;
    onChange(contentRef.current.innerHTML);
    onSelectionChange?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!e.ctrlKey && !e.metaKey) return;
    const k = e.key.toLowerCase();
    if (k === "b") { e.preventDefault(); document.execCommand("bold"); triggerChange(); }
    else if (k === "i") { e.preventDefault(); document.execCommand("italic"); triggerChange(); }
    else if (k === "u") { e.preventDefault(); document.execCommand("underline"); triggerChange(); }
    else if (k === "z") {
      e.preventDefault();
      if (e.shiftKey) document.execCommand("redo");
      else document.execCommand("undo");
      triggerChange();
    } else if (k === "y") { e.preventDefault(); document.execCommand("redo"); triggerChange(); }
  };

  useEffect(() => {
    if (isInternal.current) { isInternal.current = false; return; }
    if (contentRef.current && contentRef.current.innerHTML !== initialContent) {
      contentRef.current.innerHTML = initialContent || "<p><br></p>";
    }
  }, [initialContent, contentRef]);

  return (
    <div className="w-full flex-1 flex flex-col py-4">
      <div
        ref={contentRef}
        contentEditable
        suppressContentEditableWarning
        onInput={triggerChange}
        onKeyDown={handleKeyDown}
        onKeyUp={onSelectionChange}
        onMouseUp={onSelectionChange}
        data-placeholder="Comece a escrever a história deste capítulo aqui..."
        style={{ fontSize: `${fontSizePt * 1.33}px`, lineHeight: lineHeightRatio }}
        className="editor-content w-full flex-1 min-h-[480px] bg-transparent font-serif text-foreground p-0 focus:ring-0 leading-relaxed tracking-normal outline-none"
        spellCheck="true"
      />
    </div>
  );
}
