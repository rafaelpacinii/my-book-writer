import { invoke } from "@tauri-apps/api/core";
import type { Chapter, ChapterSummary, CreateChapterInput } from "@/types/chapter";

function isTauriEnvironment(): boolean {
  return (
    typeof window !== "undefined" &&
    Boolean((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__)
  );
}

const STORAGE_KEY = "my_book_writer_chapters";

function getStoredChapters(): Chapter[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as Chapter[];
  } catch {
    return [];
  }
}

function saveStoredChapters(chapters: Chapter[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chapters));
  }
}

export async function createChapter(input: CreateChapterInput): Promise<Chapter> {
  if (!isTauriEnvironment()) {
    const list = getStoredChapters();
    const bookChapters = list.filter((c) => c.book_id === input.book_id && !c.deleted_at);
    const newChapter: Chapter = {
      id: `chap-${Date.now()}`,
      book_id: input.book_id,
      title: input.title,
      position: bookChapters.length,
      content_json: input.content_json || JSON.stringify({ type: "doc", content: [] }),
      content_schema_version: 1,
      content_revision: 1,
      track_changes_enabled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };
    saveStoredChapters([...list, newChapter]);
    return newChapter;
  }
  return invoke<Chapter>("create_chapter", { input });
}

export async function listChapters(bookId: string): Promise<ChapterSummary[]> {
  if (!isTauriEnvironment()) {
    const list = getStoredChapters();
    return list
      .filter((c) => c.book_id === bookId && !c.deleted_at)
      .sort((a, b) => a.position - b.position)
      .map(({ id, book_id, title, position, content_revision, track_changes_enabled, created_at, updated_at }) => ({
        id,
        book_id,
        title,
        position,
        content_revision,
        track_changes_enabled,
        created_at,
        updated_at,
      }));
  }
  return invoke<ChapterSummary[]>("list_chapters", { bookId });
}

export async function getChapterById(id: string): Promise<Chapter | null> {
  if (!isTauriEnvironment()) {
    return getStoredChapters().find((c) => c.id === id && !c.deleted_at) || null;
  }
  return invoke<Chapter | null>("get_chapter_by_id", { id });
}

export async function updateChapterTitle(id: string, title: string): Promise<Chapter> {
  if (!isTauriEnvironment()) {
    const list = getStoredChapters();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Capítulo não encontrado");
    const updated: Chapter = {
      ...list[idx],
      title,
      updated_at: new Date().toISOString(),
    };
    list[idx] = updated;
    saveStoredChapters(list);
    return updated;
  }
  return invoke<Chapter>("update_chapter_title", { id, title });
}

export async function saveChapterContent(
  id: string,
  expectedRevision: number,
  contentJson: string,
): Promise<Chapter> {
  if (!isTauriEnvironment()) {
    const list = getStoredChapters();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Capítulo não encontrado");
    if (list[idx].content_revision !== expectedRevision) {
      throw new Error("Conflito de concorrência: versão do capítulo foi modificada.");
    }
    const updated: Chapter = {
      ...list[idx],
      content_json: contentJson,
      content_revision: expectedRevision + 1,
      updated_at: new Date().toISOString(),
    };
    list[idx] = updated;
    saveStoredChapters(list);
    return updated;
  }
  return invoke<Chapter>("save_chapter_content", {
    id,
    expectedRevision,
    contentJson,
  });
}

export async function reorderChapters(
  bookId: string,
  chapterIds: string[],
): Promise<void> {
  if (!isTauriEnvironment()) {
    const list = getStoredChapters();
    const updated = list.map((c) => {
      if (c.book_id === bookId) {
        const pos = chapterIds.indexOf(c.id);
        if (pos !== -1) return { ...c, position: pos, updated_at: new Date().toISOString() };
      }
      return c;
    });
    saveStoredChapters(updated);
    return;
  }
  return invoke<void>("reorder_chapters", { bookId, chapterIds });
}

export async function deleteChapter(id: string): Promise<void> {
  if (!isTauriEnvironment()) {
    const list = getStoredChapters();
    const idx = list.findIndex((c) => c.id === id);
    if (idx !== -1) {
      list[idx].deleted_at = new Date().toISOString();
      saveStoredChapters(list);
    }
    return;
  }
  return invoke<void>("delete_chapter", { id });
}
