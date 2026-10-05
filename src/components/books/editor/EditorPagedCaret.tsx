import type { PagedCaretPosition } from "@/hooks/usePagedCaret";

export function EditorPagedCaret({ position }: { position: PagedCaretPosition | null }) {
  if (!position) return null;

  // Keep this element mounted while typing so native undo grouping stays intact.
  return (
    <span
      data-paged-caret
      aria-hidden="true"
      className="editor-paged-caret absolute pointer-events-none select-none bg-current"
      style={position}
    />
  );
}
