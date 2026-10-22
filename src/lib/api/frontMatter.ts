import { invoke, isTauri } from "@tauri-apps/api/core";
import type { BookFrontMatter, SaveFrontMatterInput } from "@/types/frontMatter";

const storageKey = (bookId: string) => `my_book_writer_front_matter_${bookId}`;

export async function getBookFrontMatter(bookId: string): Promise<BookFrontMatter> {
  if (isTauri()) {
    return invoke<BookFrontMatter>("get_book_front_matter", { bookId });
  }

  const stored = localStorage.getItem(storageKey(bookId));
  if (stored) return JSON.parse(stored) as BookFrontMatter;

  return {
    book_id: bookId,
    include_half_title: true,
    include_title_page: true,
    subtitle: null,
    publisher: null,
    edition: "1ª edição",
    publication_year: 2026,
    publication_city: null,
    include_copyright_page: true,
    copyright_text: "© 2026. Todos os direitos reservados.",
    isbn_print: null,
    isbn_digital: null,
    cover_designer: null,
    proofreader: null,
    layout_designer: "My Book Writer",
    cataloging_data: null,
    include_dedication: false,
    dedication_text: null,
    include_epigraph: false,
    epigraph_text: null,
    epigraph_author: null,
    include_table_of_contents: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function saveBookFrontMatter(
  input: SaveFrontMatterInput,
): Promise<BookFrontMatter> {
  if (isTauri()) {
    return invoke<BookFrontMatter>("save_book_front_matter", { input });
  }

  const updated: BookFrontMatter = {
    ...input,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  localStorage.setItem(storageKey(input.book_id), JSON.stringify(updated));
  return updated;
}

