import { invoke } from "@tauri-apps/api/core";
import type { Book, CreateBookInput, UpdateBookInput } from "@/types/book";

function isTauriEnvironment(): boolean {
  return typeof window !== "undefined" && Boolean((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);
}

const STORAGE_KEY = "my_book_writer_books";

function getStoredBooks(): Book[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as Book[];
  } catch {
    return [];
  }
}

function saveStoredBooks(books: Book[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  }
}

export async function createBook(input: CreateBookInput): Promise<Book> {
  if (!isTauriEnvironment()) {
    const newBook: Book = {
      id: `book-${Date.now()}`,
      profile_id: input.profile_id,
      format_id: input.format_id,
      font_preset_id: input.font_preset_id,
      title: input.title,
      author_name: input.author_name,
      card_image_asset_id: null,
      position: 0,
      font_size_pt: input.font_size_pt ?? 11,
      line_height_ratio: input.line_height_ratio ?? 1.4,
      margin_top_um: input.margin_top_um ?? 20000,
      margin_bottom_um: input.margin_bottom_um ?? 20000,
      margin_left_um: input.margin_left_um ?? 20000,
      margin_right_um: input.margin_right_um ?? 20000,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };
    const list = getStoredBooks();
    saveStoredBooks([newBook, ...list]);
    return newBook;
  }
  return invoke<Book>("create_book", { input });
}

export async function listBooks(profileId: string): Promise<Book[]> {
  if (!isTauriEnvironment()) {
    return getStoredBooks().filter((b) => b.profile_id === profileId && !b.deleted_at);
  }
  return invoke<Book[]>("list_books", { profileId });
}

export async function getBookById(id: string): Promise<Book | null> {
  if (!isTauriEnvironment()) {
    return getStoredBooks().find((b) => b.id === id) || null;
  }
  return invoke<Book | null>("get_book_by_id", { id });
}

export async function updateBook(id: string, input: UpdateBookInput): Promise<Book> {
  if (!isTauriEnvironment()) {
    const list = getStoredBooks();
    const idx = list.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error("Livro não encontrado");
    const current = list[idx];
    const updated: Book = {
      ...current,
      title: input.title ?? current.title,
      author_name: input.author_name ?? current.author_name,
      format_id: input.format_id ?? current.format_id,
      font_preset_id: input.font_preset_id ?? current.font_preset_id,
      card_image_asset_id: input.card_image_asset_id !== undefined ? input.card_image_asset_id : current.card_image_asset_id,
      font_size_pt: input.font_size_pt ?? current.font_size_pt,
      line_height_ratio: input.line_height_ratio ?? current.line_height_ratio,
      margin_top_um: input.margin_top_um ?? current.margin_top_um,
      margin_bottom_um: input.margin_bottom_um ?? current.margin_bottom_um,
      margin_left_um: input.margin_left_um ?? current.margin_left_um,
      margin_right_um: input.margin_right_um ?? current.margin_right_um,
      updated_at: new Date().toISOString(),
    };
    list[idx] = updated;
    saveStoredBooks(list);
    return updated;
  }
  return invoke<Book>("update_book", { id, input });
}

export async function deleteBook(id: string): Promise<void> {
  if (!isTauriEnvironment()) {
    const list = getStoredBooks().filter((b) => b.id !== id);
    saveStoredBooks(list);
    return;
  }
  return invoke<void>("delete_book", { id });
}
