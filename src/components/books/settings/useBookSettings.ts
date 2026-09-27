"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getBookById } from "@/lib/api/books";
import { loadBookCoverUrl, saveBookCoverImage } from "@/lib/api/images";
import { useBooks } from "@/hooks/useBooks";
import { useCatalog } from "@/hooks/useCatalog";
import type { Book } from "@/types/book";

export function useBookSettings(bookId: string) {
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoadingBook, setIsLoadingBook] = useState(true);

  const { formats, fonts, isLoading: isCatalogLoading } = useCatalog();
  const { editBook, removeBook } = useBooks(book?.profile_id);

  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [author, setAuthor] = useState("");
  const [formatId, setFormatId] = useState("");
  const [fontId, setFontId] = useState("");
  const [fontSize, setFontSize] = useState(11);
  const [lineHeight, setLineHeight] = useState(1.4);
  const [marginTopMm, setMarginTopMm] = useState(20);
  const [marginBottomMm, setMarginBottomMm] = useState(20);
  const [marginLeftMm, setMarginLeftMm] = useState(20);
  const [marginRightMm, setMarginRightMm] = useState(20);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [originalCoverUrl, setOriginalCoverUrl] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    void getBookById(bookId).then((b) => {
      if (!isMounted) return;
      if (b) {
        setBook(b);
        setTitle(b.title);
        setAuthor(b.author_name);
        setFormatId(b.format_id);
        setFontId(b.font_preset_id);
        setFontSize(b.font_size_pt);
        setLineHeight(b.line_height_ratio);
        setMarginTopMm(Math.round(b.margin_top_um / 1000));
        setMarginBottomMm(Math.round(b.margin_bottom_um / 1000));
        setMarginLeftMm(Math.round(b.margin_left_um / 1000));
        setMarginRightMm(Math.round(b.margin_right_um / 1000));

        void loadBookCoverUrl(bookId, b.card_image_asset_id).then((url) => {
          if (isMounted) {
            setCoverUrl(url);
            setOriginalCoverUrl(url);
          }
        });
      }
      setIsLoadingBook(false);
    });
    return () => {
      isMounted = false;
    };
  }, [bookId]);

  const isDirty = useMemo(() => {
    if (!book) return false;
    return (
      coverUrl !== originalCoverUrl ||
      title !== book.title ||
      author !== book.author_name ||
      formatId !== book.format_id ||
      fontId !== book.font_preset_id ||
      fontSize !== book.font_size_pt ||
      lineHeight !== book.line_height_ratio ||
      marginTopMm !== Math.round(book.margin_top_um / 1000) ||
      marginBottomMm !== Math.round(book.margin_bottom_um / 1000) ||
      marginLeftMm !== Math.round(book.margin_left_um / 1000) ||
      marginRightMm !== Math.round(book.margin_right_um / 1000)
    );
  }, [
    book, coverUrl, originalCoverUrl, title, author, formatId, fontId, fontSize, lineHeight,
    marginTopMm, marginBottomMm, marginLeftMm, marginRightMm,
  ]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError("O título do livro é obrigatório.");
      return;
    }
    setTitleError(null);
    setIsSubmitting(true);
    try {
      let currentAssetId = book?.card_image_asset_id ?? null;
      if (coverUrl !== originalCoverUrl) {
        if (!coverUrl) {
          await saveBookCoverImage(bookId, null);
          currentAssetId = null;
        } else {
          const newAssetId = await saveBookCoverImage(bookId, coverUrl);
          if (newAssetId) {
            currentAssetId = newAssetId;
          }
        }
      }

      await editBook(bookId, {
        title: trimmedTitle,
        author_name: author.trim() || "Autor",
        format_id: formatId,
        font_preset_id: fontId,
        card_image_asset_id: currentAssetId,
        font_size_pt: fontSize,
        line_height_ratio: lineHeight,
        margin_top_um: Math.round(marginTopMm * 1000),
        margin_bottom_um: Math.round(marginBottomMm * 1000),
        margin_left_um: Math.round(marginLeftMm * 1000),
        margin_right_um: Math.round(marginRightMm * 1000),
      });
      router.push(`/books/view?bookId=${encodeURIComponent(bookId)}`);
    } catch {
      // handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await removeBook(bookId);
      setIsDeleteModalOpen(false);
      router.push("/library");
    } catch {
      // handled by hook
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      setIsDiscardModalOpen(true);
    } else {
      router.push(`/books/view?bookId=${encodeURIComponent(bookId)}`);
    }
  };

  const handleConfirmDiscard = () => {
    setIsDiscardModalOpen(false);
    router.push(`/books/view?bookId=${encodeURIComponent(bookId)}`);
  };

  return {
    book,
    isLoading: isLoadingBook || isCatalogLoading,
    title, setTitle, titleError,
    author, setAuthor,
    formatId, setFormatId, formats,
    fontId, setFontId, fonts,
    fontSize, setFontSize,
    lineHeight, setLineHeight,
    marginTopMm, setMarginTopMm,
    marginBottomMm, setMarginBottomMm,
    marginLeftMm, setMarginLeftMm,
    marginRightMm, setMarginRightMm,
    coverUrl, setCoverUrl,
    isDirty,
    isSubmitting,
    isDeleting,
    isDeleteModalOpen, setIsDeleteModalOpen,
    isDiscardModalOpen, setIsDiscardModalOpen,
    handleSave,
    handleConfirmDelete,
    handleCancel,
    handleConfirmDiscard,
  };
}
