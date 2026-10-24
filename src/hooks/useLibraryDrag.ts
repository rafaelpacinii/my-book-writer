"use client";

import { useRef, useState, type DragEvent } from "react";
import type { LibraryDragSource, LibraryMoveTarget } from "@/types/library";

export function useLibraryDrag(
  canMove: (source: LibraryDragSource, target: LibraryMoveTarget) => boolean,
  onDrop: (source: LibraryDragSource, target: LibraryMoveTarget) => void,
  disabled: boolean,
) {
  const source = useRef<LibraryDragSource | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const end = () => { source.current = null; setOverId(null); };
  return {
    overId, end,
    start: (event: DragEvent, id: string, kind: LibraryDragSource["kind"] = "book") => {
      if (disabled) { event.preventDefault(); return; }
      source.current = { kind, id };
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("application/x-mbw-library-item", JSON.stringify(source.current));
      event.dataTransfer.setData("text/plain", id);
    },
    over: (event: DragEvent, target: LibraryMoveTarget) => {
      if (!source.current || !canMove(source.current, target)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      setOverId(target.kind === "root" ? "root" : target.collection.id);
    },
    drop: (event: DragEvent, target: LibraryMoveTarget) => {
      event.preventDefault();
      event.stopPropagation();
      if (source.current && canMove(source.current, target)) onDrop(source.current, target);
      end();
    },
    leave: () => setOverId(null),
  };
}
