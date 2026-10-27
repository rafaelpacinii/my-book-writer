import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import { saveChapterContent } from "@/lib/api/chapters";
import { subscribeDataChanges } from "@/lib/data/changes";
import { book, chapter } from "@/tests/fixtures/book";

vi.mock("@tauri-apps/api/core", () => ({ invoke: vi.fn() }));

describe("chapter saves refresh the recent book data", () => {
  const data = new Map<string, string>();
  beforeEach(() => {
    data.clear();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
    });
    data.set("my_book_writer_books", JSON.stringify([book, { ...book, id: "other" }]));
    data.set("my_book_writer_chapters", JSON.stringify([chapter]));
  });
  afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

  it("updates only the saved book timestamp and notifies after browser persistence", async () => {
    const notify = vi.fn();
    const stop = subscribeDataChanges(notify);
    try {
      const saved = await saveChapterContent(chapter.id, chapter.content_revision, chapter.content_json);
      const books = JSON.parse(data.get("my_book_writer_books")!) as typeof book[];
      expect(books[0].updated_at).toBe(saved.updated_at);
      expect(books[1].updated_at).toBe(book.updated_at);
      expect(notify).toHaveBeenCalledExactlyOnceWith("books");
    } finally { stop(); }
  });

  it("invalidates after a native save resolves and emits nothing when the save fails", async () => {
    vi.stubGlobal("window", { __TAURI_INTERNALS__: {} });
    const notify = vi.fn();
    const stop = subscribeDataChanges(notify);
    try {
      vi.mocked(invoke).mockResolvedValueOnce(chapter);
      await saveChapterContent(chapter.id, chapter.content_revision, chapter.content_json);
      expect(notify).toHaveBeenCalledExactlyOnceWith("books");
      notify.mockClear();
      vi.mocked(invoke).mockRejectedValueOnce(new Error("Falha ao salvar"));
      await expect(saveChapterContent(chapter.id, chapter.content_revision, chapter.content_json)).rejects.toThrow("Falha ao salvar");
      expect(notify).not.toHaveBeenCalled();
    } finally { stop(); }
  });
});
