"use client";

import { useLayoutEffect, useState } from "react";
import type { RefObject } from "react";
import { getSelectionRect } from "@/lib/editor/pagedCaret";

export interface PagedCaretPosition {
  left: number;
  top: number;
  height: number;
  width: number;
}

export function usePagedCaret(
  contentRef: RefObject<HTMLDivElement | null>,
  paperRef: RefObject<HTMLDivElement | null>,
  currentPage: number,
  scale: number,
) {
  const [caret, setCaret] = useState<PagedCaretPosition | null>(null);

  useLayoutEffect(() => {
    const content = contentRef.current;
    const paper = paperRef.current;
    if (!content || !paper) return;
    let frame = 0;
    const update = () => {
      const selection = window.getSelection();
      const rect = document.hasFocus() && document.activeElement === content && selection?.isCollapsed
        ? getSelectionRect(content) : null;
      const box = paper.getBoundingClientRect();
      const visible = rect && rect.height > 0 && rect.left >= box.left && rect.left <= box.right
        && rect.top >= box.top && rect.bottom <= box.bottom;
      const next = visible ? {
        left: (rect.left - box.left) / scale,
        top: (rect.top - box.top) / scale,
        height: rect.height / scale,
        width: 1 / scale,
      } : null;
      setCaret((previous) => previous?.left === next?.left && previous?.top === next?.top
        && previous?.height === next?.height && previous?.width === next?.width ? previous : next);
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    document.addEventListener("selectionchange", schedule);
    document.addEventListener("focusin", schedule);
    document.addEventListener("focusout", schedule);
    window.addEventListener("blur", schedule);
    window.addEventListener("focus", schedule);
    document.fonts.addEventListener("loadingdone", schedule);
    const observer = new MutationObserver(schedule);
    observer.observe(content, { childList: true, characterData: true, subtree: true, attributes: true });
    const resize = new ResizeObserver(schedule);
    resize.observe(paper);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("selectionchange", schedule);
      document.removeEventListener("focusin", schedule);
      document.removeEventListener("focusout", schedule);
      window.removeEventListener("blur", schedule);
      window.removeEventListener("focus", schedule);
      document.fonts.removeEventListener("loadingdone", schedule);
      observer.disconnect();
      resize.disconnect();
    };
  }, [contentRef, paperRef, currentPage, scale]);

  return caret;
}
