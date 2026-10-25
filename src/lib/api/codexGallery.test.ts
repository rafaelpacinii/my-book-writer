import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import { createBook, updateBook } from "./books";
import { createUniverse, deleteUniverse } from "./universes";
import { createCodexEntity, getCodexSheet } from "./codex";
import { importCodexImage, updateCodexImage, deleteCodexImage, readCodexImage } from "./codexGallery";
import { decodeCodexUpload } from "@/utils/codexImage";
import { subscribeDataChanges } from "@/lib/data/changes";
import { CODEX_STORAGE_KEY } from "@/lib/codex/storage";
import type { CodexScopeInput } from "@/types/codex";

vi.mock("@tauri-apps/api/core", () => ({ invoke: vi.fn() }));
vi.mock("@/utils/codexImage", () => ({ decodeCodexUpload: vi.fn() }));
const data = new Map<string, string>();
const profile = "local-default-id";
const upload = { original_filename: "portrait.png", data_url: "data:image/png;base64,image" };
beforeEach(() => {
  data.clear(); vi.mocked(invoke).mockReset();
  vi.mocked(decodeCodexUpload).mockResolvedValue({ width: 2, height: 3, sha256: "a".repeat(64) });
  vi.stubGlobal("window", {});
  vi.stubGlobal("localStorage", { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value) });
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
async function fixture() {
  const book = await createBook({ profile_id: profile, format_id: "fmt-br-14x21", font_preset_id: "font-merriweather", title: "Obra", author_name: "Autor" });
  const scope: CodexScopeInput = { profile_id: profile, book_id: book.id };
  const sheet = await createCodexEntity({ scope, kind: "character", name: "Pessoa" });
  return { book, scope, id: sheet.entity.id };
}
it("persists independent gallery assets and atomically replaces and removes the primary image", async () => {
  const { scope, id } = await fixture();
  const first = await importCodexImage(scope, id, upload);
  const second = await importCodexImage(scope, id, upload);
  expect(second.images).toHaveLength(2);
  expect(first.images[0].is_primary).toBe(true);
  const chosen = await updateCodexImage(scope, id, second.images[1].id, { caption: "Retrato atual", is_primary: true });
  expect(chosen.images.filter((image) => image.is_primary)).toHaveLength(1);
  expect(chosen.entity.primary_image_id).toBe(second.images[1].id);
  expect(await readCodexImage(scope, id, second.images[1].id)).toBe(upload.data_url);
  const removed = await deleteCodexImage(scope, id, second.images[1].id);
  expect(removed.images).toHaveLength(1);
  expect(removed.entity.primary_image_id).toBe(first.images[0].id);
  await expect(readCodexImage(scope, id, second.images[1].id)).rejects.toMatchObject({ code: "not_found" });
});
it("keeps images when a book joins a universe and enforces archived and foreign scope access", async () => {
  const { book, scope, id } = await fixture();
  const sheet = await importCodexImage(scope, id, upload);
  const universe = await createUniverse({ profile_id: profile, name: "Mundo" });
  const world: CodexScopeInput = { profile_id: profile, universe_id: universe.id };
  await expect(readCodexImage(world, id, sheet.images[0].id)).rejects.toMatchObject({ code: "not_found" });
  await updateBook(book.id, { universe_id: universe.id });
  expect((await getCodexSheet(world, id)).images).toEqual(sheet.images);
  await deleteUniverse(universe.id);
  expect(await readCodexImage(world, id, sheet.images[0].id)).toBe(upload.data_url);
  await expect(importCodexImage(world, id, upload)).rejects.toMatchObject({ code: "validation" });
  await expect(deleteCodexImage(world, id, sheet.images[0].id)).rejects.toMatchObject({ code: "validation" });
});
it("preserves all stored assets and emits no success on quota or validation failure", async () => {
  const { scope, id } = await fixture();
  const sheet = await importCodexImage(scope, id, upload);
  const before = data.get(CODEX_STORAGE_KEY);
  await expect(updateCodexImage(scope, id, sheet.images[0].id, { caption: "x".repeat(1001), is_primary: true })).rejects.toMatchObject({ code: "validation" });
  expect(data.get(CODEX_STORAGE_KEY)).toBe(before);
  const changes: string[] = [];
  const unsubscribe = subscribeDataChanges((change) => changes.push(change));
  try {
    vi.spyOn(localStorage, "setItem").mockImplementation(() => { throw new Error("quota"); });
    await expect(importCodexImage(scope, id, upload)).rejects.toMatchObject({ code: "storage" });
    expect(data.get(CODEX_STORAGE_KEY)).toBe(before);
    expect(changes).toEqual([]);
  } finally { unsubscribe(); }
});
it("matches the four registered IPC commands and maps their errors", async () => {
  vi.stubGlobal("window", { __TAURI_INTERNALS__: {} });
  vi.mocked(invoke).mockResolvedValue(null);
  const scope: CodexScopeInput = { profile_id: profile, universe_id: "world" };
  await importCodexImage(scope, "sheet", upload);
  await readCodexImage(scope, "sheet", "image");
  await updateCodexImage(scope, "sheet", "image", { caption: "Legenda", is_primary: true });
  await deleteCodexImage(scope, "sheet", "image");
  expect(vi.mocked(invoke).mock.calls.map(([name]) => name)).toEqual(["import_codex_image", "read_codex_image", "update_codex_image", "delete_codex_image"]);
  expect(invoke).toHaveBeenCalledWith("import_codex_image", { scope, entityId: "sheet", input: upload });
  vi.mocked(invoke).mockRejectedValue({ code: "validation", message: "Imagem inválida" });
  await expect(importCodexImage(scope, "sheet", upload)).rejects.toMatchObject({ code: "validation", message: "Imagem inválida" });
});
