"use client";

import { useRef, useState } from "react";
import { updateBook } from "@/lib/api/books";
import { updateSeries } from "@/lib/api/series";
import { useLibraryDrag } from "@/hooks/useLibraryDrag";
import { libraryMoveInput, librarySeriesMoveInput } from "@/utils/libraryMove";
import type { Book } from "@/types/book";
import type { BookSeries } from "@/types/series";
import type { LibraryDragSource, LibraryMoveTarget } from "@/types/library";

export function useLibraryMove(books: Book[], series: BookSeries[], disabled: boolean) {
  const locked = useRef(false);
  const [busy, setBusy] = useState(false);
  const [movingBook, setMovingBook] = useState<Book | null>(null);
  const [movingSeries, setMovingSeries] = useState<BookSeries | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const close = () => { if (!locked.current) { setMovingBook(null); setMovingSeries(null); } };

  async function run(action: () => Promise<unknown>, title: string, target: LibraryMoveTarget) {
    if (locked.current || disabled) return;
    locked.current = true;
    setBusy(true);
    setError(null);
    try {
      await action();
      setMovingBook(null);
      setMovingSeries(null);
      setAnnouncement(`“${title}” movido para ${target.kind === "root" ? "a Biblioteca" : target.collection.name}.`);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Não foi possível salvar o vínculo. Tente novamente.");
    } finally { locked.current = false; setBusy(false); }
  }

  async function move(id: string, target: LibraryMoveTarget) {
    const book = books.find((item) => item.id === id);
    if (!book) return;
    const input = libraryMoveInput(book, target);
    if (!input) { close(); return; }
    await run(() => updateBook(id, input), book.title, target);
  }
  async function moveSeries(id: string, target: LibraryMoveTarget) {
    const item = series.find((item) => item.id === id);
    if (!item) return;
    const input = librarySeriesMoveInput(item, target);
    if (!input) { close(); return; }
    await run(() => updateSeries(id, input), item.name, target);
  }
  function canMove(source: LibraryDragSource, target: LibraryMoveTarget) {
    if (disabled || locked.current) return false;
    if (source.kind === "series") {
      const item = series.find((item) => item.id === source.id);
      return Boolean(item && librarySeriesMoveInput(item, target));
    }
    const book = books.find((item) => item.id === source.id);
    return Boolean(book && libraryMoveInput(book, target));
  }
  const drag = useLibraryDrag(canMove, (source, target) => {
    if (source.kind === "series") void moveSeries(source.id, target);
    else void move(source.id, target);
  }, disabled || busy);
  return {
    ...drag, busy, movingBook, movingSeries, error, announcement, move, moveSeries, canMove, close,
    clearError: () => setError(null),
    open: (book: Book) => { setError(null); setMovingSeries(null); setMovingBook(book); },
    openSeries: (item: BookSeries) => { setError(null); setMovingBook(null); setMovingSeries(item); },
  };
}
export type LibraryMove = ReturnType<typeof useLibraryMove>;
