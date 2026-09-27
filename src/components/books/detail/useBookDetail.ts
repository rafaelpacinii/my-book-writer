"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBookById } from "@/lib/api/books";
import { useCatalog } from "@/hooks/useCatalog";
import { useChapters } from "@/hooks/useChapters";
import type { Book } from "@/types/book";
import type { ChapterSummary } from "@/types/chapter";

export function useBookDetail(bookId: string) {
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [isBookLoading, setIsBookLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chapterToRename, setChapterToRename] = useState<ChapterSummary | null>(null);
  const [chapterToDelete, setChapterToDelete] = useState<ChapterSummary | null>(null);

  const { formats, fonts } = useCatalog();
  const {
    chapters,
    isLoading: isChaptersLoading,
    addChapter,
    renameChapter,
    reorderChaptersList,
    removeChapter,
  } = useChapters(bookId);

  useEffect(() => {
    let isMounted = true;
    void getBookById(bookId)
      .then((b) => {
        if (isMounted) setBook(b);
      })
      .finally(() => {
        if (isMounted) setIsBookLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [bookId]);

  const formatName = formats.find((f) => f.id === book?.format_id)?.name;
  const fontName = fonts.find((f) => f.id === book?.font_preset_id)?.name;

  const handleCreateChapter = async (title: string) => {
    const chapter = await addChapter(title);
    router.push(
      `/books/editor?bookId=${encodeURIComponent(bookId)}&chapterId=${encodeURIComponent(chapter.id)}`
    );
  };

  const handleDropReorder = async (sourceIndex: number, targetIndex: number) => {
    if (sourceIndex === targetIndex || sourceIndex < 0 || targetIndex < 0) return;
    if (sourceIndex >= chapters.length || targetIndex >= chapters.length) return;

    const reordered = [...chapters];
    const [moved] = reordered.splice(sourceIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    const newOrderIds = reordered.map((c) => c.id);
    await reorderChaptersList(newOrderIds);
  };

  const handleMoveChapter = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    await handleDropReorder(index, targetIndex);
  };

  const handleConfirmRename = async (newTitle: string) => {
    if (!chapterToRename) return;
    await renameChapter(chapterToRename.id, newTitle);
    setChapterToRename(null);
  };

  const handleConfirmDelete = async () => {
    if (!chapterToDelete) return;
    await removeChapter(chapterToDelete.id);
    setChapterToDelete(null);
  };

  return {
    book,
    formatName,
    fontName,
    chapters,
    isLoading: isBookLoading || isChaptersLoading,
    isModalOpen,
    setIsModalOpen,
    chapterToRename,
    setChapterToRename,
    chapterToDelete,
    setChapterToDelete,
    handleCreateChapter,
    handleMoveChapter,
    handleDropReorder,
    handleConfirmRename,
    handleConfirmDelete,
  };
}
