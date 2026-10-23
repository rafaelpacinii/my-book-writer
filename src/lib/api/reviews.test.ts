import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  createReviewComment,
  deleteReviewComment,
  getReviewProgress,
  listReviewComments,
  markReviewProgress,
  reopenReviewComment,
  resolveReviewComment,
  updateReviewComment,
} from "./reviews";
import { book, chapter } from "@/tests/fixtures/book";
import { saveChapterContent } from "@/lib/api/chapters";
import { makeReviewAnchor } from "@/utils/reviewAnchors";

describe("reviews api client (local storage fallback)", () => {
  const store: Record<string, string> = {};

  beforeEach(() => {
    for (const key of Object.keys(store)) {
      delete store[key];
    }

    const mockStorage = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        for (const key of Object.keys(store)) {
          delete store[key];
        }
      },
    };

    store.my_book_writer_books = JSON.stringify([book]);
    store.my_book_writer_chapters = JSON.stringify([{ ...chapter, id: "c1", content_revision: 2, content_json: JSON.stringify({ html: "<p>Era uma vez</p>" }) }, { ...chapter, id: "c2" }]);
    store.my_book_writer_profile = JSON.stringify({ id: "p1" });

    (globalThis as unknown as { window: unknown }).window = {
      localStorage: mockStorage,
    };
    (globalThis as unknown as { localStorage: unknown }).localStorage = mockStorage;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (globalThis as unknown as { window?: unknown }).window;
    delete (globalThis as unknown as { localStorage?: unknown }).localStorage;
  });

  it("creates and lists review comments for a chapter", async () => {
    const comment = await createReviewComment({
      chapter_id: "c1",
      author_profile_id: "p1",
      body: "Ajustar pontuação neste parágrafo",
      original_excerpt: "Era uma vez",
      anchor_revision: 2,
    });

    expect(comment.id).toBeDefined();
    expect(comment.chapter_id).toBe("c1");
    expect(comment.status).toBe("open");
    expect(comment.original_excerpt).toBe("Era uma vez");

    const list = await listReviewComments("c1");
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(comment.id);

    const otherList = await listReviewComments("c2");
    expect(otherList).toHaveLength(0);
  });

  it("resolves and reopens a review comment", async () => {
    const comment = await createReviewComment({
      chapter_id: "c1",
      author_profile_id: "p1",
      body: "Comentário de teste",
      original_excerpt: "Texto",
      anchor_revision: 2,
    });

    const resolved = await resolveReviewComment(comment.id);
    expect(resolved.status).toBe("resolved");
    expect(resolved.resolved_at).not.toBeNull();

    const reopened = await reopenReviewComment(comment.id);
    expect(reopened.status).toBe("open");
    expect(reopened.resolved_at).toBeNull();
  });

  it("marks and retrieves review progress for a chapter", async () => {
    const progress = await markReviewProgress({
      chapter_id: "c1",
      profile_id: "p1",
      anchor_revision: 2,
      reviewed_content_revision: 2,
      needs_recheck: true,
    });

    expect(progress.chapter_id).toBe("c1");
    expect(progress.needs_recheck).toBe(true);

    const fetched = await getReviewProgress("c1");
    expect(fetched).not.toBeNull();
    expect(fetched?.needs_recheck).toBe(true);
    expect(fetched?.reviewed_content_revision).toBe(2);

    const markedComplete = await markReviewProgress({
      chapter_id: "c1",
      profile_id: "p1",
      anchor_revision: 2,
      reviewed_content_revision: 2,
      needs_recheck: false,
      anchor_json: JSON.stringify({ completed: true }),
    });
    expect(markedComplete.needs_recheck).toBe(false);
  });

  it("invalidates completed reviews after saving and rejects stale completion", async () => {
    await markReviewProgress({ chapter_id: "c1", profile_id: "p1", anchor_revision: 2,
      reviewed_content_revision: 2, needs_recheck: false, anchor_json: '{"completed":true}' });
    await saveChapterContent("c1", 2, JSON.stringify({ html: "<p>Texto novo</p>" }));
    expect((await getReviewProgress("c1"))?.needs_recheck).toBe(true);
    expect(JSON.parse(store.my_book_writer_review_progress).c1.needs_recheck).toBe(true);
    await expect(markReviewProgress({ chapter_id: "c1", profile_id: "p1", anchor_revision: 2,
      reviewed_content_revision: 2, needs_recheck: false, anchor_json: '{"completed":true}' })).rejects.toThrow("mudou");
  });

  it("requires resolved comments and invalidates progress when a comment reopens", async () => {
    const comment = await createReviewComment({ chapter_id: "c1", author_profile_id: "p1", body: "Nota", original_excerpt: "Capítulo", anchor_revision: 2 });
    const input = { chapter_id: "c1", profile_id: "p1", anchor_revision: 2, reviewed_content_revision: 2,
      needs_recheck: false, anchor_json: '{"completed":true}' };
    await expect(markReviewProgress(input)).rejects.toThrow("Resolva");
    await resolveReviewComment(comment.id);
    await markReviewProgress(input);
    await reopenReviewComment(comment.id);
    expect((await getReviewProgress("c1"))?.needs_recheck).toBe(true);
  });

  it("preserves corrupted storage and rejects invalid inputs", async () => {
    store.my_book_writer_review_comments = "{bad";
    await expect(listReviewComments("c1")).rejects.toThrow("preservados");
    await expect(createReviewComment({ chapter_id: "c1", author_profile_id: "p1", body: "Nota", original_excerpt: "Capítulo", anchor_revision: 2 })).rejects.toThrow("preservados");
    expect(store.my_book_writer_review_comments).toBe("{bad");
    delete store.my_book_writer_review_comments;
    await expect(createReviewComment({ chapter_id: "c1", author_profile_id: "p1", body: " ", original_excerpt: "Capítulo", anchor_revision: 2 })).rejects.toThrow("vazio");
    await expect(markReviewProgress({ chapter_id: "c1", profile_id: "p1", anchor_revision: 2,
      reviewed_content_revision: 2, needs_recheck: false })).rejects.toThrow("inválida");
  });

  it("preserves comments when their excerpt disappears", async () => {
    const anchor = makeReviewAnchor("Era uma vez", 0, 11);
    const comment = await createReviewComment({ chapter_id: "c1", author_profile_id: "p1", body: "Nota", original_excerpt: anchor.quote,
      anchor_revision: 2, anchor_json: JSON.stringify(anchor) });
    expect(comment.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    await saveChapterContent("c1", 2, JSON.stringify({ html: "<p>Outro texto</p>" }));
    const [removed] = await listReviewComments("c1");
    expect(removed.anchor_state).toBe("removed");
    expect(removed.original_excerpt).toBe(anchor.quote);
    expect(removed.body).toBe("Nota");
  });

  it("rolls back comment changes if persisting their review state fails", async () => {
    store.my_book_writer_review_comments = "[]";
    const previous = '{"c1":{"chapter_id":"c1","profile_id":"p1","anchor_json":"{\\"completed\\":true}","anchor_revision":2,"reviewed_content_revision":2,"needs_recheck":false,"marked_at":"2026-10-23","updated_at":"2026-10-23"}}';
    store.my_book_writer_review_progress = previous;
    const write = localStorage.setItem;
    let fail = true;
    vi.spyOn(localStorage, "setItem").mockImplementation((key, value) => {
      if (key === "my_book_writer_review_progress" && fail) { fail = false; throw new Error("Disco indisponível"); }
      write(key, value);
    });
    await expect(createReviewComment({ chapter_id: "c1", author_profile_id: "p1", body: "Nota", original_excerpt: "Capítulo", anchor_revision: 2 })).rejects.toThrow("Disco indisponível");
    expect(store.my_book_writer_review_comments).toBe("[]");
    expect(store.my_book_writer_review_progress).toBe(previous);
  });

  it("updates and deletes a review comment", async () => {
    const comment = await createReviewComment({
      chapter_id: "c1",
      author_profile_id: "p1",
      body: "Texto original",
      original_excerpt: "Trecho",
      anchor_revision: 2,
    });

    const updated = await updateReviewComment(comment.id, "Texto modificado");
    expect(updated.body).toBe("Texto modificado");

    await deleteReviewComment(comment.id);
    const listAfterDelete = await listReviewComments("c1");
    expect(listAfterDelete).toHaveLength(0);
  });
});

