import { invoke } from "@tauri-apps/api/core";
import type { BookFormat, FontPreset } from "@/types/catalog";

/**
 * Lista todos os formatos físicos de livro ativos no catálogo do sistema.
 */
export async function listBookFormats(): Promise<BookFormat[]> {
  return invoke<BookFormat[]>("list_book_formats");
}

/**
 * Lista todos os presets de fontes tipográficas ativas disponíveis para diagramação.
 */
export async function listFontPresets(): Promise<FontPreset[]> {
  return invoke<FontPreset[]>("list_font_presets");
}
