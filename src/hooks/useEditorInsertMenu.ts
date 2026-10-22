"use client";

import { useRef } from "react";
import { useBookMenu } from "@/hooks/useBookMenu";
import type { FormatAction } from "@/utils/textFormatting";

export function useEditorInsertMenu(onFormat: (action: FormatAction) => void) {
  const menuRef = useBookMenu();
  const rangeRef = useRef<Range | null>(null);
  const rememberSelection = () => {
    const selection = getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    const node = range?.commonAncestorContainer;
    const element = node instanceof Element ? node : node?.parentElement;
    rangeRef.current = element?.closest('[contenteditable="true"]') ? range!.cloneRange() : null;
  };
  const insert = (action: FormatAction) => {
    if (menuRef.current) menuRef.current.open = false;
    const range = rangeRef.current;
    if (range?.startContainer.isConnected) {
      const element = range.startContainer instanceof Element ? range.startContainer : range.startContainer.parentElement;
      element?.closest<HTMLElement>('[contenteditable="true"]')?.focus();
      const selection = getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
    onFormat(action);
  };
  return { menuRef, rememberSelection, insert };
}
