import { publishDataChange } from "@/lib/data/changes";
import { invoke } from "@tauri-apps/api/core";
import type { Book } from "@/types/book";
import type { BookSeries, CreateSeriesInput, UpdateSeriesInput } from "@/types/series";
import { getStoredBooks, saveStoredBooks, SERIES_STORAGE_KEY } from "./books";

function isTauriEnvironment(): boolean {
  return typeof window !== "undefined" && Boolean((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);
}

export function getStoredSeries(): BookSeries[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(SERIES_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as BookSeries[];
  } catch {
    return [];
  }
}

export function saveStoredSeries(seriesList: BookSeries[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(SERIES_STORAGE_KEY, JSON.stringify(seriesList));
  }
}

let browserSeriesCounter = 0;

export async function listSeries(profileId: string): Promise<BookSeries[]> {
  if (!isTauriEnvironment()) {
    return getStoredSeries()
      .filter((s) => s.profile_id === profileId && !s.deleted_at)
      .sort((a, b) => a.position - b.position);
  }
  return invoke<BookSeries[]>("list_series", { profileId });
}

export async function getSeriesById(id: string): Promise<BookSeries | null> {
  if (!isTauriEnvironment()) {
    return getStoredSeries().find((s) => s.id === id && !s.deleted_at) || null;
  }
  return invoke<BookSeries | null>("get_series_by_id", { id });
}

export async function createSeries(input: CreateSeriesInput): Promise<BookSeries> {
  const name = input.name.trim();
  if (!name) throw new Error("O nome da série não pode ser vazio");

  if (!isTauriEnvironment()) {
    const list = getStoredSeries();
    const maxPos = list
      .filter((s) => s.profile_id === input.profile_id && !s.deleted_at)
      .reduce((acc, s) => Math.max(acc, s.position), -1);
    browserSeriesCounter += 1;

    const now = new Date().toISOString();
    const created: BookSeries = {
      id: `series-${Date.now()}-${browserSeriesCounter}`,
      profile_id: input.profile_id,
      universe_id: input.universe_id?.trim() || null,
      name,
      description: input.description?.trim() || null,
      position: maxPos + 1,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };
    saveStoredSeries([...list, created]);
    publishDataChange("series");
    return created;
  }

  const created = await invoke<BookSeries>("create_series", { input });
  publishDataChange("series");
  return created;
}

export async function updateSeries(id: string, input: UpdateSeriesInput): Promise<BookSeries> {
  if (!isTauriEnvironment()) {
    const list = getStoredSeries();
    const idx = list.findIndex((s) => s.id === id && !s.deleted_at);
    if (idx === -1) throw new Error("Série não encontrada");
    const current = list[idx];

    const nextName = input.name !== undefined && input.name !== null ? input.name.trim() : current.name;
    if (!nextName) throw new Error("O nome da série não pode ser vazio");

    const nextDesc =
      input.description !== undefined
        ? input.description?.trim() || null
        : current.description;

    const nextUniverse = input.clear_universe
      ? null
      : input.universe_id !== undefined
        ? input.universe_id?.trim() || null
        : current.universe_id;

    const updated: BookSeries = {
      ...current,
      name: nextName,
      description: nextDesc,
      universe_id: nextUniverse,
      updated_at: new Date().toISOString(),
    };
    list[idx] = updated;
    saveStoredSeries(list);

    if (input.clear_universe || input.universe_id !== undefined) {
      const books = getStoredBooks();
      let changedBooks = false;
      books.forEach((b) => {
        if (b.series_id === id && !b.deleted_at) {
          b.universe_id = nextUniverse;
          b.updated_at = updated.updated_at;
          changedBooks = true;
        }
      });
      if (changedBooks) {
        saveStoredBooks(books);
        publishDataChange("books");
      }
    }

    publishDataChange("series");
    return updated;
  }

  const updated = await invoke<BookSeries>("update_series", { id, input });
  publishDataChange("series");
  if (input.universe_id !== undefined || input.clear_universe) {
    publishDataChange("books");
  }
  return updated;
}

export async function reorderSeries(profileId: string, seriesIds: string[]): Promise<void> {
  if (!isTauriEnvironment()) {
    const list = getStoredSeries();
    seriesIds.forEach((id, idx) => {
      const item = list.find((s) => s.id === id && s.profile_id === profileId && !s.deleted_at);
      if (item) item.position = idx;
    });
    saveStoredSeries(list);
    publishDataChange("series");
    return;
  }

  await invoke<void>("reorder_series", { profileId, seriesIds });
  publishDataChange("series");
}

export async function reorderSeriesBooks(seriesId: string, bookIds: string[]): Promise<Book[]> {
  if (!isTauriEnvironment()) {
    const books = getStoredBooks();
    const inSeries = books
      .filter((b) => b.series_id === seriesId && !b.deleted_at)
      .sort((a, b) => (a.series_volume ?? 999999) - (b.series_volume ?? 999999) || a.position - b.position);

    const existingSet = new Set(inSeries.map((b) => b.id));
    const seen = new Set<string>();
    const finalOrder: string[] = [];

    for (const id of bookIds) {
      if (existingSet.has(id) && !seen.has(id)) {
        seen.add(id);
        finalOrder.push(id);
      }
    }
    for (const b of inSeries) {
      if (!seen.has(b.id)) {
        seen.add(b.id);
        finalOrder.push(b.id);
      }
    }

    finalOrder.forEach((id, idx) => {
      const target = books.find((b) => b.id === id);
      if (target) {
        target.series_volume = idx + 1;
        target.updated_at = new Date().toISOString();
      }
    });

    saveStoredBooks(books);
    publishDataChange("books");
    return books
      .filter((b) => b.series_id === seriesId && !b.deleted_at)
      .sort((a, b) => (a.series_volume ?? 0) - (b.series_volume ?? 0));
  }

  const reordered = await invoke<Book[]>("reorder_series_books", { seriesId, bookIds });
  publishDataChange("books");
  return reordered;
}

export async function deleteSeries(id: string): Promise<void> {
  if (!isTauriEnvironment()) {
    const list = getStoredSeries().filter((s) => s.id !== id);
    saveStoredSeries(list);

    const books = getStoredBooks();
    let changedBooks = false;
    books.forEach((b) => {
      if (b.series_id === id) {
        b.series_id = null;
        b.series_volume = null;
        changedBooks = true;
      }
    });
    if (changedBooks) {
      saveStoredBooks(books);
      publishDataChange("books");
    }
    publishDataChange("series");
    return;
  }

  await invoke<void>("delete_series", { id });
  publishDataChange("books");
  publishDataChange("series");
}

