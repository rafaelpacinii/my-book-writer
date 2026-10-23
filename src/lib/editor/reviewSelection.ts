import { makeReviewAnchor } from "@/utils/reviewAnchors";
import type { ReviewAnchor } from "@/types/review";

export function captureReviewAnchor(): ReviewAnchor | null {
  const editor = document.querySelector(".editor-content");
  const selection = window.getSelection();
  if (!editor || !selection || !selection.rangeCount || selection.isCollapsed) return null;
  const range = selection.getRangeAt(0);
  if (!editor.contains(range.startContainer) || !editor.contains(range.endContainer)) return null;
  const before = range.cloneRange();
  before.selectNodeContents(editor);
  before.setEnd(range.startContainer, range.startOffset);
  const text = editor.textContent ?? "";
  const rawStart = before.toString().length;
  const raw = range.toString();
  const start = rawStart + raw.length - raw.trimStart().length;
  const end = rawStart + raw.trimEnd().length;
  return end > start ? makeReviewAnchor(text, start, end) : null;
}

export function reviewRange(editor: Element, start: number, end: number): Range | null {
  const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  let offset = 0;
  const range = document.createRange();
  let hasStart = false;
  while (node) {
    const length = node.textContent?.length ?? 0;
    if (!hasStart && start < offset + length) {
      range.setStart(node, start - offset);
      hasStart = true;
    }
    if (hasStart && end <= offset + length) {
      range.setEnd(node, end - offset);
      return range;
    }
    offset += length;
    node = walker.nextNode();
  }
  return null;
}
