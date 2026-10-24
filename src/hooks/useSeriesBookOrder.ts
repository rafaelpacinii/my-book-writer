"use client";

import { useState, type DragEvent } from "react";
import type { Book } from "@/types/book";
import { moveSeriesBook } from "@/utils/librarySeries";

export function useSeriesBookOrder(books: Book[], onReorder: (ids: string[]) => void, disabled: boolean) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  function move(sourceId: string, targetId: string) {
    if (disabled) return;
    const ids = moveSeriesBook(books, sourceId, targetId);
    if (ids) onReorder(ids);
  }

  return {
    overId,
    move,
    start: (event: DragEvent, id: string) => {
      if (disabled) { event.preventDefault(); return; }
      setDraggedId(id);
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", id);
    },
    over: (event: DragEvent, id: string) => {
      if (!draggedId || disabled) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      setOverId(id);
    },
    drop: (event: DragEvent, id: string) => {
      event.preventDefault();
      if (draggedId) move(draggedId, id);
      setDraggedId(null);
      setOverId(null);
    },
    end: () => { setDraggedId(null); setOverId(null); },
  };
}
