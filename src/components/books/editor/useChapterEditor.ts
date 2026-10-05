"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getBookById } from "@/lib/api/books";
import { useCatalog } from "@/hooks/useCatalog";
import {
  createChapter,
  deleteChapter,
  getChapterById,
  listChapters,
  saveChapterContent,
  updateChapterTitle,
} from "@/lib/api/chapters";
import {
  countCharacters,
  countWords,
  estimateReadingTime,
  parseChapterText,
  serializeChapterText,
} from "@/utils/chapterContent";
import { executeFormatAction, type FormatAction } from "@/utils/textFormatting";
import type { Book } from "@/types/book";
import type { Chapter, ChapterSummary } from "@/types/chapter";

export type SaveStatus = "saved" | "saving" | "unsaved" | "error";

export function useChapterEditor(bookId: string, chapterId: string) {
  const router = useRouter();
  const { formats, fonts } = useCatalog();
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<ChapterSummary[]>([]);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);
  const originalTitleRef = useRef("");
  const originalTextRef = useRef("");
  const revisionRef = useRef(1);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [isNewChapterModalOpen, setIsNewChapterModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"continuous" | "paged">("continuous");
  const [isFitMode, setIsFitMode] = useState(true);

  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  const updateActiveStyles = useCallback(() => {
    if (typeof document === "undefined") return;
    try {
      setIsBold(document.queryCommandState("bold"));
      setIsItalic(document.queryCommandState("italic"));
      setIsUnderline(document.queryCommandState("underline"));
    } catch {
      // Ignora erro se seleção estiver fora
    }
  }, []);

  const handleFormat = useCallback(
    (action: FormatAction) => {
      executeFormatAction(action);
      if (contentRef.current) {
        setText(contentRef.current.innerHTML);
      }
      updateActiveStyles();
    },
    [updateActiveStyles],
  );

  const handleUndo = useCallback(() => {
    if (typeof document !== "undefined") {
      document.execCommand("undo");
      if (contentRef.current) {
        setText(contentRef.current.innerHTML);
      }
      updateActiveStyles();
    }
  }, [updateActiveStyles]);

  const handleRedo = useCallback(() => {
    if (typeof document !== "undefined") {
      document.execCommand("redo");
      if (contentRef.current) {
        setText(contentRef.current.innerHTML);
      }
      updateActiveStyles();
    }
  }, [updateActiveStyles]);

  // Carrega dados iniciais do livro e do capítulo
  useEffect(() => {
    let active = true;
    setIsLoading(true);

    Promise.all([
      getBookById(bookId),
      listChapters(bookId),
      getChapterById(chapterId),
    ])
      .then(([b, chaps, chap]) => {
        if (!active) return;
        setBook(b);
        setChapters(chaps);
        if (chap) {
          setChapter(chap);
          setTitle(chap.title);
          originalTitleRef.current = chap.title;
          const parsed = parseChapterText(chap.content_json);
          setText(parsed);
          originalTextRef.current = parsed;
          revisionRef.current = chap.content_revision;
          setSaveStatus("saved");
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [bookId, chapterId]);

  // Função central de salvamento
  const saveNow = useCallback(async () => {
    if (!chapterId) return;
    const currentTitle = title.trim();
    if (!currentTitle) return;

    const hasTitleChanged = currentTitle !== originalTitleRef.current;
    const hasTextChanged = text !== originalTextRef.current;

    if (!hasTitleChanged && !hasTextChanged) {
      setSaveStatus("saved");
      return;
    }

    setSaveStatus("saving");
    try {
      if (hasTitleChanged) {
        await updateChapterTitle(chapterId, currentTitle);
        originalTitleRef.current = currentTitle;
      }
      if (hasTextChanged) {
        const payload = serializeChapterText(text);
        const updated = await saveChapterContent(
          chapterId,
          revisionRef.current,
          payload,
        );
        revisionRef.current = updated.content_revision;
        originalTextRef.current = text;
      }
      setSaveStatus("saved");
      setLastSavedAt(new Date());
    } catch {
      setSaveStatus("error");
    }
  }, [chapterId, title, text]);

  // Auto-save com debounce de 1200ms
  useEffect(() => {
    const hasTitleChanged = title.trim() !== originalTitleRef.current;
    const hasTextChanged = text !== originalTextRef.current;

    if (!hasTitleChanged && !hasTextChanged) {
      return;
    }

    setSaveStatus("unsaved");
    const timer = setTimeout(() => {
      void saveNow();
    }, 1200);

    return () => clearTimeout(timer);
  }, [title, text, saveNow]);

  // Atalho global Ctrl+S / Cmd+S para salvar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        void saveNow();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveNow]);

  // Métricas do texto em tempo real (extrai texto limpo do HTML)
  const wordCount = useMemo(() => countWords(text), [text]);
  const charCount = useMemo(() => countCharacters(text), [text]);
  const readingTime = useMemo(() => estimateReadingTime(wordCount), [wordCount]);

  // Capítulos anterior e próximo
  const { prevChapter, nextChapter, currentIndex } = useMemo(() => {
    const idx = chapters.findIndex((c) => c.id === chapterId);
    return {
      prevChapter: idx > 0 ? chapters[idx - 1] : null,
      nextChapter: idx >= 0 && idx < chapters.length - 1 ? chapters[idx + 1] : null,
      currentIndex: idx >= 0 ? idx : 0,
    };
  }, [chapters, chapterId]);

  const handleSelectChapter = useCallback(
    async (targetChapterId: string) => {
      if (targetChapterId === chapterId) return;
      await saveNow();
      router.push(`/books/editor?bookId=${encodeURIComponent(bookId)}&chapterId=${encodeURIComponent(targetChapterId)}`);
    },
    [chapterId, bookId, saveNow, router],
  );

  const handleQuickCreateChapter = useCallback(
    async (newTitle: string) => {
      await saveNow();
      const created = await createChapter({ book_id: bookId, title: newTitle });
      setIsNewChapterModalOpen(false);
      setIsDrawerOpen(false);
      router.push(`/books/editor?bookId=${encodeURIComponent(bookId)}&chapterId=${encodeURIComponent(created.id)}`);
    },
    [bookId, saveNow, router],
  );

  const handleDeleteChapter = async () => {
    if (!chapterId) return;
    try {
      await deleteChapter(chapterId);
      setIsDeleteModalOpen(false);
      router.push(`/books/view?bookId=${encodeURIComponent(bookId)}`);
    } catch {
      // erro tratado no hook
    }
  };

  return {
    book,
    bookFormat: formats.find((format) => format.id === book?.format_id),
    bookFont: fonts.find((font) => font.id === book?.font_preset_id),
    chapter,
    chapters,
    isLoading,
    title,
    setTitle,
    text,
    setText,
    contentRef,
    handleFormat,
    handleUndo,
    handleRedo,
    isBold,
    isItalic,
    isUnderline,
    updateActiveStyles,
    saveStatus,
    lastSavedAt,
    saveNow,
    isFocusMode,
    setIsFocusMode,
    isDrawerOpen,
    setIsDrawerOpen,
    isNewChapterModalOpen,
    setIsNewChapterModalOpen,
    viewMode,
    setViewMode,
    isFitMode,
    setIsFitMode,
    handleSelectChapter,
    handleQuickCreateChapter,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    handleDeleteChapter,
    wordCount,
    charCount,
    readingTime,
    prevChapter,
    nextChapter,
    currentIndex,
  };
}
