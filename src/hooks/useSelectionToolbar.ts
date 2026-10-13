"use client";

import { useEffect, useState } from "react";

export interface SelectionPosition {
  top: number;
  left: number;
}

export function useSelectionToolbar() {
  const [position, setPosition] = useState<SelectionPosition | null>(null);
  const [selectedText, setSelectedText] = useState("");

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        setPosition(null);
        setSelectedText("");
        return;
      }

      const text = selection.toString().trim();
      if (!text) {
        setPosition(null);
        setSelectedText("");
        return;
      }

      const anchorNode = selection.anchorNode;
      const element = anchorNode instanceof Element ? anchorNode : anchorNode?.parentElement;
      const isInsideEditor = Boolean(element?.closest('[contenteditable="true"]'));

      if (!isInsideEditor) {
        setPosition(null);
        setSelectedText("");
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;

      const top = Math.max(10, rect.top - 48);
      const left = Math.min(
        window.innerWidth - 140,
        Math.max(140, rect.left + rect.width / 2),
      );

      setPosition({ top, left });
      setSelectedText(text);
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  const clearSelection = () => {
    setPosition(null);
    setSelectedText("");
  };

  return { position, selectedText, clearSelection };
}

