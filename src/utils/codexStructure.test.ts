import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createBook } from "@/lib/api/books";
import { createCodexEntity, saveCodexStructure, saveCodexTemplate } from "@/lib/api/codex";
import { draftFromSheet, structureInput, placedField, changedField, moved } from "@/utils/codexStructure";
import { CODEX_STORAGE_KEY } from "@/lib/codex/storage";
import type { CodexScopeInput } from "@/types/codex";

const data = new Map<string, string>();
beforeEach(() => {
  data.clear(); vi.stubGlobal("window", {});
  vi.stubGlobal("localStorage", { getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value) });
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
async function fixture() {
  const book = await createBook({ profile_id: "local-default-id", title: "Obra", author_name: "Autor",
    format_id: "fmt-br-14x21", font_preset_id: "font-merriweather" });
  const scope: CodexScopeInput = { profile_id: book.profile_id, book_id: book.id };
  return { scope, sheet: await createCodexEntity({ scope, kind: "character", name: "Pessoa" }) };
}
it("moves categories and fields without losing persisted IDs, values or configuration", async () => {
  const { scope, sheet } = await fixture();
  const draft = draftFromSheet(sheet);
  const field = { ...draft[0].fields[0], value: "Ada", config: { hint: "Nome original" } };
  const updated = moved(placedField(draft, draft[0].key, draft[1].key, field), 1, -1);
  const saved = await saveCodexStructure(scope, sheet.entity.id, structureInput(updated));
  expect(saved.categories[0].id).toBe(draft[1].id);
  expect(saved.fields.find((item) => item.id === field.id)).toMatchObject({ category_id: draft[1].id,
    value_json: '"Ada"', config_json: '{"hint":"Nome original"}' });
  expect(saved.fields.map((item) => item.id).sort()).toEqual(sheet.fields.map((item) => item.id).sort());
});
it("changing a type deliberately clears its value/configuration while a rename preserves them", async () => {
  const { sheet } = await fixture();
  const field = { ...draftFromSheet(sheet)[0].fields[0], value: "Texto privado", config: { hint: "Dica" } };
  expect(changedField(field, " Novo nome ", "short_text")).toMatchObject({ label: "Novo nome", value: "Texto privado", config: { hint: "Dica" }, id: field.id });
  expect(changedField(field, "Escala", "scale")).toMatchObject({ id: field.id, value: 0, config: {} });
  const draft = draftFromSheet(sheet);
  expect(moved(draft, 0, -1)).toBe(draft);
  expect(moved(draft, draft.length - 1, 1)).toBe(draft);
});
it("serializes only the API contract and makes reusable models without copying sheet contents", async () => {
  const { scope, sheet } = await fixture();
  const draft = draftFromSheet(sheet);
  draft[0].fields[0].value = "Texto privado";
  const input = structureInput(draft);
  expect(JSON.stringify(input)).not.toContain('"key"');
  await saveCodexStructure(scope, sheet.entity.id, input);
  const template = await saveCodexTemplate(scope, sheet.entity.id, "Meu modelo");
  expect(template.schema_json).not.toContain("Texto privado");
  expect(template.schema_json).not.toContain(sheet.fields[0].id);
});
it("invalid values and quota failures preserve the persisted structure and the unsaved draft", async () => {
  const { scope, sheet } = await fixture();
  const draft = draftFromSheet(sheet);
  const before = data.get(CODEX_STORAGE_KEY);
  draft[0].fields[0] = changedField(draft[0].fields[0], "Escala", "scale");
  draft[0].fields[0].value = 101;
  expect(() => structureInput(draft)).toThrow("O valor não corresponde ao tipo do campo");
  expect(data.get(CODEX_STORAGE_KEY)).toBe(before);
  draft[0].fields[0].value = 75;
  vi.spyOn(localStorage, "setItem").mockImplementation(() => { throw new Error("quota"); });
  await expect(saveCodexStructure(scope, sheet.entity.id, structureInput(draft))).rejects.toMatchObject({ code: "storage" });
  expect(data.get(CODEX_STORAGE_KEY)).toBe(before);
  expect(draft[0].fields[0].value).toBe(75);
});
