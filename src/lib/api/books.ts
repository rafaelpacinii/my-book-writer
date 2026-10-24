import { publishDataChange } from "@/lib/data/changes";
import { invoke } from "@tauri-apps/api/core";
import type { Book, CreateBookInput, UpdateBookInput } from "@/types/book";
import type { BookSeries } from "@/types/series";

function isTauriEnvironment(): boolean {
  return typeof window !== "undefined" && Boolean((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);
}

export const BOOKS_STORAGE_KEY = "my_book_writer_books";
export const SERIES_STORAGE_KEY = "my_book_writer_series";

export function getStoredBooks(): Book[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(BOOKS_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as Book[];
  } catch {
    return [];
  }
}

export function saveStoredBooks(books: Book[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books));
  }
}

function getSeriesUniverseId(seriesId: string): string | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(SERIES_STORAGE_KEY);
  if (!stored) return null;
  try {
    const list = JSON.parse(stored) as BookSeries[];
    return list.find((s) => s.id === seriesId && !s.deleted_at)?.universe_id ?? null;
  } catch {
    return null;
  }
}

export function compactStoredSeriesVolumes(books: Book[], seriesId: string): void {
  const inSeries = books
    .filter((b) => b.series_id === seriesId && !b.deleted_at)
    .sort((a, b) => (a.series_volume ?? 999999) - (b.series_volume ?? 999999) || a.position - b.position);

  inSeries.forEach((book, idx) => {
    book.series_volume = idx + 1;
  });
}

function nextStoredSeriesVolume(books: Book[], seriesId: string): number {
  const max = books
    .filter((b) => b.series_id === seriesId && !b.deleted_at)
    .reduce((acc, b) => Math.max(acc, b.series_volume ?? 0), 0);
  return max + 1;
}

let browserBookCounter = 0;

async function persistCreateBook(input: CreateBookInput): Promise<Book> {
  if (!isTauriEnvironment()) {
    const list = getStoredBooks();
    const seriesId = input.series_id?.trim() || null;
    const explicitUniverseId = input.universe_id?.trim() || null;
    const universeId = explicitUniverseId ?? (seriesId ? getSeriesUniverseId(seriesId) : null);
    const seriesVolume = seriesId ? nextStoredSeriesVolume(list, seriesId) : null;
    browserBookCounter += 1;

    const newBook: Book = {
      id: `book-${Date.now()}-${browserBookCounter}`,
      profile_id: input.profile_id,
      format_id: input.format_id,
      font_preset_id: input.font_preset_id,
      universe_id: universeId,
      series_id: seriesId,
      series_volume: seriesVolume,
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

async function persistUpdateBook(id: string, input: UpdateBookInput): Promise<Book> {
  if (!isTauriEnvironment()) {
    const list = getStoredBooks();
    const idx = list.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error("Livro não encontrado");
    const current = list[idx];
    const oldSeriesId = current.series_id ?? null;

    let nextSeriesId = current.series_id ?? null;
    let nextSeriesVolume = current.series_volume ?? null;

    if (input.clear_series) {
      nextSeriesId = null;
      nextSeriesVolume = null;
    } else if (input.series_id !== undefined && input.series_id !== null) {
      const trimmedSeries = input.series_id.trim();
      if (trimmedSeries && trimmedSeries !== oldSeriesId) {
        nextSeriesId = trimmedSeries;
        nextSeriesVolume = nextStoredSeriesVolume(list, trimmedSeries);
      }
    }

    let nextUniverseId = current.universe_id ?? null;
    if (input.clear_universe) {
      nextUniverseId = null;
    } else if (input.universe_id !== undefined && input.universe_id !== null) {
      nextUniverseId = input.universe_id.trim() || null;
    } else if (nextSeriesId && nextSeriesId !== oldSeriesId) {
      nextUniverseId = getSeriesUniverseId(nextSeriesId) ?? nextUniverseId;
    }

    const updated: Book = {
      ...current,
      title: input.title ?? current.title,
      author_name: input.author_name ?? current.author_name,
      format_id: input.format_id ?? current.format_id,
      font_preset_id: input.font_preset_id ?? current.font_preset_id,
      card_image_asset_id: input.card_image_asset_id !== undefined ? input.card_image_asset_id : current.card_image_asset_id,
      universe_id: nextUniverseId,
      series_id: nextSeriesId,
      series_volume: nextSeriesVolume,
      font_size_pt: input.font_size_pt ?? current.font_size_pt,
      line_height_ratio: input.line_height_ratio ?? current.line_height_ratio,
      margin_top_um: input.margin_top_um ?? current.margin_top_um,
      margin_bottom_um: input.margin_bottom_um ?? current.margin_bottom_um,
      margin_left_um: input.margin_left_um ?? current.margin_left_um,
      margin_right_um: input.margin_right_um ?? current.margin_right_um,
      updated_at: new Date().toISOString(),
    };
    list[idx] = updated;
    if (oldSeriesId && oldSeriesId !== nextSeriesId) {
      compactStoredSeriesVolumes(list, oldSeriesId);
    }
    saveStoredBooks(list);
    return updated;
  }
  return invoke<Book>("update_book", { id, input });
}

async function persistDeleteBook(id: string): Promise<void> {
  if (!isTauriEnvironment()) {
    const current = getStoredBooks();
    const target = current.find((b) => b.id === id);
    const list = current.filter((b) => b.id !== id);
    if (target?.series_id) {
      compactStoredSeriesVolumes(list, target.series_id);
    }
    saveStoredBooks(list);
    return;
  }
  return invoke<void>("delete_book", { id });
}

export async function createBook(input: CreateBookInput): Promise<Book> {
  const book = await persistCreateBook(input);
  publishDataChange("books");
  return book;
}

export async function updateBook(id: string, input: UpdateBookInput): Promise<Book> {
  const book = await persistUpdateBook(id, input);
  publishDataChange("books");
  return book;
}

export async function deleteBook(id: string): Promise<void> {
  await persistDeleteBook(id);
  publishDataChange("books");
}
