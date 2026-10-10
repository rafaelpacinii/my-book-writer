import { invoke, isTauri } from "@tauri-apps/api/core";
import { getBookById } from "@/lib/api/books";
import { listChapters } from "@/lib/api/chapters";
import { listBookFormats, listFontPresets } from "@/lib/api/catalog";
import type { EpubExportResult, PdfExportInfo, PdfExportResult } from "@/types/export";

export async function getPdfExportInfo(bookId: string): Promise<PdfExportInfo> {
  if (isTauri()) return invoke<PdfExportInfo>("get_pdf_export_info", { bookId });
  const [book, chapters, formats, fonts] = await Promise.all([
    getBookById(bookId), listChapters(bookId), listBookFormats(), listFontPresets(),
  ]);
  if (!book || book.deleted_at) throw new Error("Livro não encontrado.");
  return {
    title: book.title, author: book.author_name, chapter_count: chapters.length,
    format_name: formats.find((format) => format.id === book.format_id)?.name ?? "Formato não encontrado",
    font_name: fonts.find((font) => font.id === book.font_preset_id)?.name ?? "Fonte não encontrada",
    available: false,
    unavailable_reason: "A exportação PDF está disponível no aplicativo desktop.",
  };
}

export async function exportBookPdf(bookId: string): Promise<PdfExportResult | null> {
  if (!isTauri()) throw new Error("Abra o aplicativo desktop para exportar o livro.");
  return invoke<PdfExportResult | null>("export_book_pdf", { bookId });
}

export async function exportBookEpub(bookId: string): Promise<EpubExportResult | null> {
  if (!isTauri()) throw new Error("Abra o aplicativo desktop para exportar o livro.");
  return invoke<EpubExportResult | null>("export_book_epub", { bookId });
}
