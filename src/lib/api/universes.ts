import { publishDataChange } from "@/lib/data/changes";
import { invoke } from "@tauri-apps/api/core";
import type { CreateUniverseInput, Universe, UpdateUniverseInput } from "@/types/universe";
import { getStoredBooks, saveStoredBooks } from "./books";
import { getStoredSeries, saveStoredSeries } from "./series";

function isTauriEnvironment(): boolean {
  return typeof window !== "undefined" && Boolean((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);
}

export const UNIVERSES_STORAGE_KEY = "my_book_writer_universes";

function getStoredUniverses(): Universe[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(UNIVERSES_STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as Universe[];
  } catch {
    return [];
  }
}

function saveStoredUniverses(universes: Universe[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(UNIVERSES_STORAGE_KEY, JSON.stringify(universes));
  }
}

let browserUniverseCounter = 0;

export async function listUniverses(profileId: string): Promise<Universe[]> {
  if (!isTauriEnvironment()) {
    return getStoredUniverses()
      .filter((u) => u.profile_id === profileId && !u.deleted_at)
      .sort((a, b) => a.position - b.position);
  }
  return invoke<Universe[]>("list_universes", { profileId });
}

export async function getUniverseById(id: string): Promise<Universe | null> {
  if (!isTauriEnvironment()) {
    return getStoredUniverses().find((u) => u.id === id && !u.deleted_at) || null;
  }
  return invoke<Universe | null>("get_universe_by_id", { id });
}

export async function createUniverse(input: CreateUniverseInput): Promise<Universe> {
  const name = input.name.trim();
  if (!name) throw new Error("O nome do universo não pode ser vazio");

  if (!isTauriEnvironment()) {
    const list = getStoredUniverses();
    const maxPos = list
      .filter((u) => u.profile_id === input.profile_id && !u.deleted_at)
      .reduce((acc, u) => Math.max(acc, u.position), -1);
    browserUniverseCounter += 1;

    const now = new Date().toISOString();
    const created: Universe = {
      id: `universe-${Date.now()}-${browserUniverseCounter}`,
      profile_id: input.profile_id,
      name,
      description: input.description?.trim() || null,
      position: maxPos + 1,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };
    saveStoredUniverses([...list, created]);
    publishDataChange("universes");
    return created;
  }

  const created = await invoke<Universe>("create_universe", { input });
  publishDataChange("universes");
  return created;
}

export async function updateUniverse(id: string, input: UpdateUniverseInput): Promise<Universe> {
  if (!isTauriEnvironment()) {
    const list = getStoredUniverses();
    const idx = list.findIndex((u) => u.id === id && !u.deleted_at);
    if (idx === -1) throw new Error("Universo não encontrado");
    const current = list[idx];

    const nextName = input.name !== undefined && input.name !== null ? input.name.trim() : current.name;
    if (!nextName) throw new Error("O nome do universo não pode ser vazio");

    const nextDesc =
      input.description !== undefined
        ? input.description?.trim() || null
        : current.description;

    const updated: Universe = {
      ...current,
      name: nextName,
      description: nextDesc,
      updated_at: new Date().toISOString(),
    };
    list[idx] = updated;
    saveStoredUniverses(list);
    publishDataChange("universes");
    return updated;
  }

  const updated = await invoke<Universe>("update_universe", { id, input });
  publishDataChange("universes");
  return updated;
}

export async function reorderUniverses(profileId: string, universeIds: string[]): Promise<void> {
  if (!isTauriEnvironment()) {
    const list = getStoredUniverses();
    universeIds.forEach((id, idx) => {
      const item = list.find((u) => u.id === id && u.profile_id === profileId && !u.deleted_at);
      if (item) item.position = idx;
    });
    saveStoredUniverses(list);
    publishDataChange("universes");
    return;
  }

  await invoke<void>("reorder_universes", { profileId, universeIds });
  publishDataChange("universes");
}

export async function deleteUniverse(id: string): Promise<void> {
  if (!isTauriEnvironment()) {
    const list = getStoredUniverses().filter((u) => u.id !== id);
    saveStoredUniverses(list);

    const seriesList = getStoredSeries();
    let changedSeries = false;
    seriesList.forEach((s) => {
      if (s.universe_id === id) {
        s.universe_id = null;
        changedSeries = true;
      }
    });
    if (changedSeries) {
      saveStoredSeries(seriesList);
      publishDataChange("series");
    }

    const books = getStoredBooks();
    let changedBooks = false;
    books.forEach((b) => {
      if (b.universe_id === id) {
        b.universe_id = null;
        changedBooks = true;
      }
    });
    if (changedBooks) {
      saveStoredBooks(books);
      publishDataChange("books");
    }

    publishDataChange("universes");
    return;
  }

  await invoke<void>("delete_universe", { id });
  publishDataChange("books");
  publishDataChange("series");
  publishDataChange("universes");
}

