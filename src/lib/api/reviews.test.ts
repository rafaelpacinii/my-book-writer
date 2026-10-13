import { describe, it, expect, beforeEach, afterEach } from "vitest";
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

    (globalThis as unknown as { window: unknown }).window = {
      localStorage: mockStorage,
    };
    (globalThis as unknown as { localStorage: unknown }).localStorage = mockStorage;
  });

  afterEach(() => {
    delete (globalThis as unknown as { window?: unknown }).window;
    delete (globalThis as unknown as { localStorage?: unknown }).localStorage;
  });

  it("creates and lists review comments for a chapter", async () => {
    const comment = await createReviewComment({
      chapter_id: "c1",
      author_profile_id: "p1",
      body: "Ajustar pontuação neste parágrafo",
      original_excerpt: "Era uma vez",
      anchor_revision: 1,
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
      anchor_revision: 1,
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
      anchor_revision: 1,
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
      anchor_revision: 1,
      reviewed_content_revision: 2,
      needs_recheck: false,
    });
    expect(markedComplete.needs_recheck).toBe(false);
  });

  it("updates and deletes a review comment", async () => {
    const comment = await createReviewComment({
      chapter_id: "c1",
      author_profile_id: "p1",
      body: "Texto original",
      original_excerpt: "Trecho",
      anchor_revision: 1,
    });

    const updated = await updateReviewComment(comment.id, "Texto modificado");
    expect(updated.body).toBe("Texto modificado");

    await deleteReviewComment(comment.id);
    const listAfterDelete = await listReviewComments("c1");
    expect(listAfterDelete).toHaveLength(0);
  });
});

