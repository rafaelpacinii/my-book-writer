import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { chapter } from "@/tests/fixtures/book";
import { serializeChapterText } from "@/utils/chapterContent";
import { getChapterById, saveChapterContent } from "./chapters";
import { checkpointChapterHistory, createChapterVersion, deleteChapterVersion, getChapterVersion, listChapterVersions, restoreChapterVersion, setChapterTrackChanges } from "./versions";

describe("chapter history persists real data", () => {
  const data = new Map<string, string>();
  const chapters = "my_book_writer_chapters";
  const versions = "my_book_writer_chapter_versions";
  const original = serializeChapterText("<p>Era <strong>uma</strong> vez.</p>");
  beforeEach(() => {
    data.clear();
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
    });
    data.set(chapters, JSON.stringify([{ ...chapter, content_json: original }]));
  });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

  it("captures actual rich content, title, words and unique UUIDv7 identifiers", async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-23T12:00:00Z"));
    const first = await createChapterVersion(chapter.id, "Marco");
    const second = await createChapterVersion(chapter.id);
    expect(first.title).toBe(chapter.title);
    expect(first.content_json).toBe(original);
    expect(first.word_count).toBe(3);
    expect(first.id).not.toBe(second.id);
    expect(first.id).toMatch(/^[\da-f-]{14}7[\da-f]{3}-[89ab]/);
  });

  it("does not reuse deleted version numbers", async () => {
    const first = await createChapterVersion(chapter.id);
    await deleteChapterVersion(first.id);
    expect((await createChapterVersion(chapter.id)).version_number).toBe(2);
  });

  it("restores formatting, increments the revision and preserves the replaced content", async () => {
    const version = await createChapterVersion(chapter.id);
    const current = await saveChapterContent(chapter.id, chapter.content_revision, serializeChapterText("<p>Novo texto.</p>"));
    const restored = await restoreChapterVersion(chapter.id, version.id, current.content_revision);
    expect(restored.content_json).toBe(original);
    expect(restored.content_revision).toBe(current.content_revision + 1);
    const latest = (await listChapterVersions(chapter.id))[0];
    expect((await getChapterVersion(latest.id))?.content_json).toBe(current.content_json);
  });

  it("rejects stale restoration without creating a false safety snapshot", async () => {
    const version = await createChapterVersion(chapter.id);
    await saveChapterContent(chapter.id, chapter.content_revision, serializeChapterText("Novo"));
    await expect(restoreChapterVersion(chapter.id, version.id, chapter.content_revision)).rejects.toThrow("mudou");
    expect(await listChapterVersions(chapter.id)).toHaveLength(1);
  });

  it("preserves the draft when the safety snapshot cannot be stored", async () => {
    const version = await createChapterVersion(chapter.id);
    const current = await saveChapterContent(chapter.id, chapter.content_revision, serializeChapterText("Preservar"));
    vi.spyOn(localStorage, "setItem").mockImplementation((key, value) => {
      if (key === versions) throw new Error("Armazenamento indisponível");
      data.set(key, value);
    });
    await expect(restoreChapterVersion(chapter.id, version.id, current.content_revision)).rejects.toThrow("indisponível");
    expect((await getChapterById(chapter.id))?.content_json).toBe(current.content_json);
  });

  it("persists tracking on the real chapter and snapshots same-length rewrites", async () => {
    const old = serializeChapterText(Array(30).fill("antigo").join(" "));
    data.set(chapters, JSON.stringify([{ ...chapter, content_json: old }]));
    await setChapterTrackChanges(chapter.id, true);
    expect((await getChapterById(chapter.id))?.track_changes_enabled).toBe(true);
    await saveChapterContent(chapter.id, chapter.content_revision, serializeChapterText(Array(30).fill("novo").join(" ")));
    expect(await listChapterVersions(chapter.id)).toHaveLength(2);
  });

  it("records a pending small change at a later checkpoint and avoids duplicates", async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-23T12:00:00Z"));
    await setChapterTrackChanges(chapter.id, true);
    await saveChapterContent(chapter.id, chapter.content_revision, serializeChapterText("pequena mudança"));
    expect(await checkpointChapterHistory(chapter.id)).toBeNull();
    vi.setSystemTime(new Date("2026-10-23T12:03:01Z"));
    expect(await checkpointChapterHistory(chapter.id)).not.toBeNull();
    expect(await checkpointChapterHistory(chapter.id)).toBeNull();
  });

  it("does not overwrite corrupt version storage or create versions for missing chapters", async () => {
    await expect(createChapterVersion("missing")).rejects.toThrow("não encontrado");
    data.set(versions, "not-json");
    await expect(createChapterVersion(chapter.id)).rejects.toThrow("preservados");
    expect(data.get(versions)).toBe("not-json");
  });

  it("rejects restoring a version belonging to a different chapter", async () => {
    const version = await createChapterVersion(chapter.id);
    data.set(chapters, JSON.stringify([chapter, { ...chapter, id: "other" }]));
    await expect(restoreChapterVersion("other", version.id, chapter.content_revision)).rejects.toThrow("não pertence");
  });

  it("preserves existing data when numbering metadata is corrupt", async () => {
    data.set("my_book_writer_version_counters", "null");
    await expect(createChapterVersion(chapter.id)).rejects.toThrow("numeração");
    expect(data.get(versions)).toBeUndefined();
  });

  it("rejects malformed historical content before creating a safety copy", async () => {
    const version = await createChapterVersion(chapter.id);
    for (const content of ["invalid-json", "{}", "null"]) {
      data.set(versions, JSON.stringify([{ ...version, content_json: content }]));
      await expect(restoreChapterVersion(chapter.id, version.id, chapter.content_revision)).rejects.toThrow("inválido");
    }
    expect(await listChapterVersions(chapter.id)).toHaveLength(1);
    expect((await getChapterById(chapter.id))?.content_json).toBe(original);
  });
});
