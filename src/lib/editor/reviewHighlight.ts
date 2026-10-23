import { reviewRange } from "@/lib/editor/reviewSelection";
import { makeReviewAnchor, resolveReviewAnchor } from "@/utils/reviewAnchors";
import type { ReviewAnchor } from "@/types/review";

let clearHighlight: (() => void) | undefined;

/**
 * Localiza um trecho de texto no editor, rola suavemente até ele e aplica
 * um destaque visual (grifado) temporário por 1 segundo sem quebra de layout.
 * The overlay lives outside the editable document and can never be saved.
 */
export function highlightAndScrollToExcerpt(
  excerpt: string,
  containerSelector = ".editor-content",
  durationMs = 1000,
  anchor?: ReviewAnchor | null,
): boolean {
  if (typeof document === "undefined" || !excerpt.trim() || (excerpt === "Capítulo" && !anchor)) return false;
  const editor = document.querySelector(containerSelector);
  if (!editor) return false;
  const text = editor.textContent ?? "";
  const start = text.indexOf(excerpt);
  const target = anchor ? resolveReviewAnchor(text, anchor)
    : start !== -1 && text.indexOf(excerpt, start + 1) === -1 ? makeReviewAnchor(text, start, start + excerpt.length) : null;
  if (!target) return false;
  const range = reviewRange(editor, target.start, target.end);
  if (!range) return false;
  clearHighlight?.();
  const element = range.startContainer.parentElement;
  const jump = new CustomEvent("editor:jump-to-element", { cancelable: true, detail: { element, range } });
  if (window.dispatchEvent(jump)) element?.scrollIntoView({ behavior: "smooth", block: "center" });
  const overlay = document.createElement("div");
  overlay.dataset.reviewHighlight = "true";
  overlay.setAttribute("aria-hidden", "true");
  overlay.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:40;overflow:hidden";
  document.body.append(overlay);
  let frame = 0;
  const paint = () => {
    if (!editor.isConnected) { clearHighlight?.(); return; }
    const rects = Array.from(range.getClientRects());
    while (overlay.children.length < rects.length) overlay.append(document.createElement("div"));
    while (overlay.children.length > rects.length) overlay.lastElementChild?.remove();
    rects.forEach((rect, index) => {
      const box = overlay.children[index] as HTMLElement;
      Object.assign(box.style, { position: "absolute", left: rect.left + "px", top: rect.top + "px",
        width: rect.width + "px", height: rect.height + "px",
        background: "color-mix(in srgb,var(--primary) 25%,transparent)", borderRadius: "2px" });
    });
    frame = requestAnimationFrame(paint);
  };
  clearHighlight = () => {
    cancelAnimationFrame(frame);
    clearTimeout(timer);
    overlay.remove();
    document.removeEventListener("beforeinput", cancel, true);
    clearHighlight = undefined;
  };
  const cancel = () => clearHighlight?.();
  const timer = setTimeout(cancel, durationMs);
  document.addEventListener("beforeinput", cancel, true);
  frame = requestAnimationFrame(paint);
  return true;
}
