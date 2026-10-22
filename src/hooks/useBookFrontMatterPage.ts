"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getBookById } from "@/lib/api/books";
import { listChapters } from "@/lib/api/chapters";
import { useFrontMatter } from "@/hooks/useFrontMatter";
import { useUnsavedNavigation } from "@/hooks/useUnsavedNavigation";
import { useFrontMatterForm } from "@/components/books/frontMatter/useFrontMatterForm";
import type { Book } from "@/types/book";

export function useBookFrontMatterPage(bookId: string) {
  const router = useRouter();
  const fm = useFrontMatter(bookId);
  const { form, update, isDirty } = useFrontMatterForm(fm.data);
  const [book, setBook] = useState<Book | null>(null);
  const [chapterCount, setChapterCount] = useState(0);
  const [isLoadingBook, setIsLoadingBook] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const href = `/books/view?bookId=${encodeURIComponent(bookId)}`;
  const navigation = useUnsavedNavigation(isDirty, href);

  useEffect(() => {
    let active = true;
    setIsLoadingBook(true);
    setLoadError(null);
    Promise.all([getBookById(bookId), listChapters(bookId)]).then(([loadedBook, chapters]) => {
      if (!active) return;
      setBook(loadedBook);
      setChapterCount(chapters.length);
    }).catch(() => {
      if (active) setLoadError("Não foi possível carregar as informações do livro.");
    }).finally(() => { if (active) setIsLoadingBook(false); });
    return () => { active = false; };
  }, [bookId, attempt]);

  const retry = () => { setAttempt((value) => value + 1); void fm.reload(); };
  const save = async () => {
    if (!form || fm.isSaving) return;
    if (await fm.save(form)) router.push(href);
  };

  return {
    book, chapterCount, form, update, isDirty, navigation, retry, save,
    isLoading: isLoadingBook || fm.isLoading || Boolean(fm.data && !form),
    isSaving: fm.isSaving, error: loadError || fm.error,
  };
}
