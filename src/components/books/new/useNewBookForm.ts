"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { useCatalog } from "@/hooks/useCatalog";
import { useBooks } from "@/hooks/useBooks";
import { saveBookCoverImage } from "@/lib/api/images";
import { validateBookLayout } from "@/utils/bookMeasurements";

export function useNewBookForm() {
  const router = useRouter();
  const { profile } = useProfile();
  const { formats, fonts, isLoading: isCatalogLoading } = useCatalog();
  const { addBook } = useBooks(profile?.id);

  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [layoutError, setLayoutError] = useState<string | null>(null);
  const [author, setAuthor] = useState("");
  const [formatId, setFormatId] = useState("");
  const [fontId, setFontId] = useState("");
  const [fontSize, setFontSize] = useState(11);
  const [lineHeight, setLineHeight] = useState(1.4);
  const [marginMm, setMarginMm] = useState(20);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile?.display_name && !author) {
      setAuthor(profile.display_name);
    }
  }, [profile, author]);

  useEffect(() => {
    if (formats.length > 0 && !formatId) setFormatId(formats[0].id);
    if (fonts.length > 0 && !fontId) setFontId(fonts[0].id);
  }, [formats, fonts, formatId, fontId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError("O título do livro é obrigatório.");
      return;
    }
    setTitleError(null);
    const error = validateBookLayout(
      formats.find((format) => format.id === formatId), fontSize, lineHeight,
      [marginMm, marginMm, marginMm, marginMm],
    );
    setLayoutError(error);
    if (error) return;
    setIsSubmitting(true);
    try {
      const marginUm = Math.round(marginMm * 1000);
      const newBook = await addBook({
        profile_id: profile?.id || "local-default-id",
        title: trimmedTitle,
        author_name: author.trim() || profile?.display_name || "Autor",
        format_id: formatId || formats[0]?.id || "fmt-br-14x21",
        font_preset_id: fontId || fonts[0]?.id || "font-merriweather",
        font_size_pt: fontSize,
        line_height_ratio: lineHeight,
        margin_top_um: marginUm,
        margin_bottom_um: marginUm,
        margin_left_um: marginUm,
        margin_right_um: marginUm,
      });

      if (coverUrl && newBook?.id) {
        await saveBookCoverImage(newBook.id, coverUrl);
      }

      router.push("/home");
    } catch {
      // error is handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    title, setTitle, titleError, layoutError,
    author, setAuthor,
    formatId, setFormatId, formats,
    fontId, setFontId, fonts,
    fontSize, setFontSize,
    lineHeight, setLineHeight,
    marginMm, setMarginMm,
    coverUrl, setCoverUrl,
    isSubmitting, handleSubmit,
    router, isCatalogLoading,
  };
}
