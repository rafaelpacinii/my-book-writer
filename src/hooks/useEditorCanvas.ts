"use client";

import { useCallback, useLayoutEffect } from "react";
import type { KeyboardEvent, RefObject } from "react";

interface Props {
  contentRef: RefObject<HTMLDivElement | null>;
  initialContent: string;
  onChange: (html: string) => void;
  onSelectionChange?: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
}

export function useEditorCanvas(props: Props) {
  const { contentRef, initialContent, onChange, onSelectionChange, onKeyDown } = props;
  const triggerChange = useCallback(() => {
    const element = contentRef.current;
    if (!element) return;
    onChange(element.innerHTML);
    onSelectionChange?.();
  }, [contentRef, onChange, onSelectionChange]);

  useLayoutEffect(() => {
    const element = contentRef.current;
    const content = initialContent || "<p><br></p>";
    // Local typing and toolbar actions already updated the DOM. Keep its selection/history.
    if (element && element.innerHTML !== content) element.innerHTML = content;
  }, [initialContent, contentRef]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.nativeEvent.isComposing) return;
    if (!event.ctrlKey && !event.metaKey) return;
    const key = event.key.toLowerCase();
    const commands: Record<string, string> = { b: "bold", i: "italic", u: "underline", y: "redo" };
    const command = commands[key];
    if (command || key === "z") {
      event.preventDefault();
      document.execCommand(command ?? (event.shiftKey ? "redo" : "undo"));
      triggerChange();
    }
  };

  return { triggerChange, handleKeyDown };
}
