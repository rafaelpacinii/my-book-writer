import type { Book } from "@/types/book";
import type { BookFormat, FontPreset } from "@/types/catalog";
import type { Chapter } from "@/types/chapter";

export const paragraph = "Uma história começa com personagens, lugares e acontecimentos. O escritor trabalha cada frase para contar essa história com clareza e ritmo. ";

export const book: Book = {
  id: "pagination-test", profile_id: "local-default-id",
  format_id: "fmt-br-14x21", font_preset_id: "font-merriweather",
  title: "Livro de teste", author_name: "Autor", card_image_asset_id: null, position: 0,
  font_size_pt: 11, line_height_ratio: 1.4,
  margin_top_um: 20000, margin_bottom_um: 20000,
  margin_left_um: 20000, margin_right_um: 20000,
  created_at: "2026-10-02", updated_at: "2026-10-02", deleted_at: null,
};

export const chapter: Chapter = {
  id: "chapter-test", book_id: book.id, title: "O começo da história", position: 0,
  content_json: JSON.stringify({ type: "doc", html: `<p>${paragraph.repeat(5)}</p>`.repeat(25) }),
  content_revision: 1, content_schema_version: 1, track_changes_enabled: false,
  created_at: "2026-10-02", updated_at: "2026-10-02", deleted_at: null,
};

export const format: BookFormat = {
  id: "fmt-us-trade-6x9", name: "Trade", market: "US",
  width_um: 152400, height_um: 228600, is_active: true,
};

export const font: FontPreset = {
  id: "font-inter", name: "Inter", family_name: "Inter",
  manifest_path: "fonts/inter", is_active: true,
};
