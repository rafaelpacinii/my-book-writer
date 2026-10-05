function getRangeRect(range: Range, last = false): DOMRect | undefined {
  const rects = Array.from(range.getClientRects())
    .filter((rect) => rect.width > 0 || rect.height > 0);
  return rects[last ? rects.length - 1 : 0];
}

export function getSelectionRect(content: HTMLElement): DOMRect | null {
  const selection = window.getSelection();
  if (!selection?.focusNode || !content.contains(selection.focusNode)) return null;
  const range = document.createRange();
  range.setStart(selection.focusNode, selection.focusOffset);
  range.collapse(true);
  let rect = getRangeRect(range);
  if (!rect && selection.focusNode instanceof Element) {
    const children = selection.focusNode.childNodes;
    const next = children[selection.focusOffset];
    const adjacent = next ?? children[selection.focusOffset - 1];
    if (adjacent) {
      // A <br> has no contents, but the node itself has line geometry.
      range.selectNode(adjacent);
      rect = getRangeRect(range, !next);
    }
  }
  if (!rect && selection.focusNode instanceof Text && selection.focusNode.length > 0) {
    const offset = selection.focusOffset;
    const next = offset < selection.focusNode.length;
    range.setStart(selection.focusNode, next ? offset : offset - 1);
    range.setEnd(selection.focusNode, next ? offset + 1 : offset);
    rect = getRangeRect(range, !next);
  }
  if (rect) return rect;
  const element = selection.focusNode instanceof Element
    ? selection.focusNode : selection.focusNode.parentElement;
  // A multi-page ancestor cannot locate the caret. Do not use its first fragment.
  for (let block = element; block && block !== content; block = block.parentElement) {
    const rects = block.getClientRects();
    if (rects.length === 1) return rects[0];
    if (rects.length > 1) return null;
  }
  return null;
}
