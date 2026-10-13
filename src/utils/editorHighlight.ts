/**
 * Localiza um trecho de texto no editor, rola suavemente até ele e aplica
 * um destaque visual (grifado) temporário por 1 segundo sem quebra de layout.
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
          "bg-amber-400 text-stone-950 rounded-[2px] transition-colors duration-200 p-0 m-0 border-0 ring-0 shadow-none";
        mark.style.cssText = "padding: 0; margin: 0; border: 0; line-height: inherit; font-weight: inherit; display: inline;";

        range.surroundContents(mark);

        // Notifica o modo paginado para navegar até a página correta
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("editor:jump-to-element", { detail: { element: mark } }),
          );
        }

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
        // Fallback abaixo
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
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("editor:jump-to-element", { detail: { element: el as HTMLElement } }),
          );
        }
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("bg-amber-400", "text-stone-950", "transition-colors", "duration-200");
        setTimeout(() => {
          el.classList.remove("bg-amber-400", "text-stone-950", "transition-colors", "duration-200");
        }, durationMs);
        return true;
      }
    }
  }

  return false;
}
