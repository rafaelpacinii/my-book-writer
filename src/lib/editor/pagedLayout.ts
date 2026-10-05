interface LayoutGeometry {
  left: number;
  stride: number;
}

function getGeometry(flow: HTMLElement, pageWidth: number): LayoutGeometry {
  const rect = flow.getBoundingClientRect();
  const layoutWidth = parseFloat(getComputedStyle(flow).width);
  return { left: rect.left, stride: pageWidth * rect.width / layoutWidth };
}

function pageForRect(rect: DOMRect, geometry: LayoutGeometry): number {
  return Math.max(1, Math.floor((rect.left - geometry.left + 0.5) / geometry.stride) + 1);
}

export function measurePagedContent(flow: HTMLElement, content: HTMLElement, pageWidth: number): number {
  const geometry = getGeometry(flow, pageWidth);
  return Math.max(1, ...Array.from(content.getClientRects(), (rect) => pageForRect(rect, geometry)));
}

export function getSelectionPage(flow: HTMLElement, content: HTMLElement, pageWidth: number): number | null {
  const selection = window.getSelection();
  if (!selection?.focusNode || !content.contains(selection.focusNode)) return null;
  const range = document.createRange();
  range.setStart(selection.focusNode, selection.focusOffset);
  range.collapse(true);
  let rect = range.getClientRects()[0];
  if (!rect && selection.focusNode instanceof Element) {
    const children = selection.focusNode.childNodes;
    const next = children[selection.focusOffset];
    const adjacent = next ?? children[selection.focusOffset - 1];
    if (adjacent) {
      range.selectNodeContents(adjacent);
      const rects = range.getClientRects();
      rect = rects[next ? 0 : rects.length - 1];
    }
  }
  if (rect) return pageForRect(rect, getGeometry(flow, pageWidth));
  const parent = selection.focusNode.parentElement;
  const fallback = parent?.getClientRects()[0];
  return fallback ? pageForRect(fallback, getGeometry(flow, pageWidth)) : null;
}

function getWrittenPages(content: HTMLElement, geometry: LayoutGeometry): Set<number> {
  const pages = new Set<number>();
  const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    if (!walker.currentNode.textContent?.trim()) continue;
    const range = document.createRange();
    range.selectNodeContents(walker.currentNode);
    for (const rect of range.getClientRects()) pages.add(pageForRect(rect, geometry));
  }
  for (const media of content.querySelectorAll("img, svg, hr, video, canvas")) {
    for (const rect of media.getClientRects()) pages.add(pageForRect(rect, geometry));
  }
  return pages;
}

// Remove only empty blocks that would produce entirely blank, redundant sheets.
export function removeRedundantBlankPages(flow: HTMLElement, content: HTMLElement, pageWidth: number): boolean {
  let changed = false;
  const geometry = getGeometry(flow, pageWidth);
  const written = getWrittenPages(content, geometry);
  const lastWritten = Math.max(0, ...written);
  const lastAllowed = Math.max(1, lastWritten + 1);
  const emptyBlocks = Array.from(content.querySelectorAll("p, div, blockquote, br"))
    .filter((block) => !block.textContent?.trim()
      && !block.querySelector("p, div, blockquote, img, svg, hr, video, canvas"));
  for (const block of emptyBlocks) {
    const rects = Array.from(block.getClientRects());
    const redundant = rects.some((rect) => {
      const page = pageForRect(rect, geometry);
      return page > lastAllowed || (page > 1 && page < lastWritten && !written.has(page));
    });
    if (!redundant) continue;
    const selection = window.getSelection();
    const containsCursor = Boolean(selection?.focusNode && block.contains(selection.focusNode));
    const previous = block.previousSibling;
    block.remove();
    changed = true;
    if (containsCursor && selection) {
      const range = document.createRange();
      range.selectNodeContents(previous?.parentNode ? previous : content);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
  return changed;
}

export function preventBlankPageInput(event: InputEvent, flow: HTMLElement, content: HTMLElement, pageWidth: number) {
  if (event.isComposing || !["insertParagraph", "insertLineBreak"].includes(event.inputType)) return;
  const selection = window.getSelection();
  if (!selection?.isCollapsed || !selection.focusNode || !content.contains(selection.focusNode)) return;
  const geometry = getGeometry(flow, pageWidth);
  const lastWritten = Math.max(0, ...getWrittenPages(content, geometry));
  const page = getSelectionPage(flow, content, pageWidth);
  if (!page || page <= lastWritten) return;
  const rect = selection.getRangeAt(0).getClientRects()[0];
  const style = getComputedStyle(content);
  const nextParagraphHeight = parseFloat(style.lineHeight) + parseFloat(style.fontSize) * 1.25;
  const scale = geometry.stride / pageWidth;
  if (rect && rect.bottom + nextParagraphHeight * scale > flow.getBoundingClientRect().bottom) {
    event.preventDefault();
  }
}
