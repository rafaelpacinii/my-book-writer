"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBookById } from "@/lib/api/books";
import { useCatalog } from "@/hooks/useCatalog";
import { useChapters } from "@/hooks/useChapters";
import type { Book } from "@/types/book";

export function useBookDetail(bookId: string) {
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [isBookLoading, setIsBookLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { formats, fonts } = useCatalog();
  const { chapters, isLoading: isChaptersLoading, addChapter } = useChapters(bookId);

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
    router.push(`/books/${bookId}/chapters/${chapter.id}`);
  };

  return {
    book,
    formatName,
    fontName,
    chapters,
    isLoading: isBookLoading || isChaptersLoading,
    isModalOpen,
    setIsModalOpen,
    handleCreateChapter,
  };
}
