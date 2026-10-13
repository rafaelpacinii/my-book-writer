/**
 * Localiza um trecho de texto no editor, rola suavemente até ele e aplica
 * um destaque visual (grifado) temporário por 1 segundo.
 */
export function highlightAndScrollToExcerpt(
  excerpt: string,
  containerSelector: string = ".editor-content",
  durationMs: number = 1000,
): boolean {
  if (typeof document === "undefined" || !excerpt || excerpt === "Capítulo") {
    return false;
  }

  const container = document.querySelector(containerSelector);
  if (!container) return false;

  const cleanExcerpt = excerpt.trim();
  if (!cleanExcerpt) return false;

  const showTextFilter =
    typeof NodeFilter !== "undefined" && NodeFilter.SHOW_TEXT
      ? NodeFilter.SHOW_TEXT
      : 4;

  const walker = document.createTreeWalker(container, showTextFilter, null);

  let currentNode = walker.nextNode();
  while (currentNode) {
    const text = currentNode.textContent || "";
    const index = text.indexOf(cleanExcerpt);

    if (index !== -1) {
      try {
        const range = document.createRange();
        range.setStart(currentNode, index);
        range.setEnd(currentNode, index + cleanExcerpt.length);

        const mark = document.createElement("mark");
        mark.className =
          "bg-warning/50 text-foreground rounded px-1 py-0.5 transition-all duration-300 ring-2 ring-warning/60 shadow-xs";

        range.surroundContents(mark);
        mark.scrollIntoView({ behavior: "smooth", block: "center" });

        setTimeout(() => {
          const parent = mark.parentNode;
          if (parent) {
            while (mark.firstChild) {
              parent.insertBefore(mark.firstChild, mark);
            }
            parent.removeChild(mark);
            parent.normalize();
          }
        }, durationMs);

        return true;
      } catch {
        // Fallback below if surroundContents throws (e.g. boundary split)
      }
    }
    currentNode = walker.nextNode();
  }

  const allElements = container.querySelectorAll("*");
  for (const el of Array.from(allElements)) {
    if (el.textContent?.includes(cleanExcerpt)) {
      const hasDeeper = Array.from(el.children).some((child) =>
        child.textContent?.includes(cleanExcerpt),
      );
      if (!hasDeeper) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("bg-warning/40", "transition-colors", "duration-300");
        setTimeout(() => {
          el.classList.remove("bg-warning/40", "transition-colors", "duration-300");
        }, durationMs);
        return true;
      }
    }
  }

  return false;
}
