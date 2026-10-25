import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import * as api from "./codex";
import { createBook, updateBook } from "./books";
import { createUniverse, deleteUniverse } from "./universes";
import { createSeries, updateSeries } from "./series";
import { CODEX_STORAGE_KEY } from "@/lib/codex/storage";
import { subscribeDataChanges } from "@/lib/data/changes";
import { codexEntitiesResource, invalidateCodexResources } from "@/lib/data/codexResources";
import type { CodexCategoryInput, CodexFieldType, CodexJSON, CodexScopeInput, CodexSheet } from "@/types/codex";

vi.mock("@tauri-apps/api/core", () => ({ invoke: vi.fn() }));
const data = new Map<string, string>();
const profile = "local-default-id";
const book = (title: string) => createBook({ profile_id: profile, title, author_name: "Autor",
  format_id: "fmt-br-14x21", font_preset_id: "font-merriweather" });
const scopeFor = (id: string): CodexScopeInput => ({ profile_id: profile, book_id: id });
const structure = (sheet: CodexSheet): CodexCategoryInput[] => sheet.categories.map((category) => ({
  id: category.id, name: category.name, fields: sheet.fields.filter((field) => field.category_id === category.id)
    .map((field) => ({ id: field.id, label: field.label, field_type: field.field_type,
      value: JSON.parse(field.value_json) as CodexJSON, config: JSON.parse(field.config_json) as Record<string, CodexJSON> })),
}));
beforeEach(() => {
  data.clear();
  vi.mocked(invoke).mockReset();
  vi.stubGlobal("window", {});
  vi.stubGlobal("localStorage", { getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value) });
});
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("Códice browser persistence", () => {
  it("seeds stable presets, persists every kind and saves templates without private content or IDs", async () => {
    const scope = scopeFor((await book("Obra")).id);
    const presets = await api.listCodexTemplates(profile);
    expect(presets).toHaveLength(3);
    expect(await api.listCodexTemplates(profile)).toEqual(presets);
    for (const kind of ["character", "location", "lore"] as const) {
      const sheet = await api.createCodexEntity({ scope, kind, name: "  Ficha  " });
      expect(sheet.entity.name).toBe("Ficha");
      expect(sheet.entity.id[14]).toBe("7");
      expect(sheet.categories.length).toBeGreaterThan(0);
      expect(await api.getCodexSheet(scope, sheet.entity.id)).toEqual(sheet);
    }
    const original = (await api.listCodexEntities(scope, "character"))[0];
    const sheet = await api.getCodexSheet(scope, original.id);
    const categories = structure(sheet);
    categories[0].fields[0].value = "Conteúdo privado";
    await api.saveCodexStructure(scope, original.id, categories);
    const template = await api.saveCodexTemplate(scope, original.id, "Meu modelo");
    expect(template.schema_json).not.toContain("Conteúdo privado");
    expect(template.schema_json).not.toContain(sheet.fields[0].id);
    const copy = await api.createCodexEntity({ scope, kind: "character", name: "Cópia", template_id: template.id });
    expect(copy.fields).toHaveLength(sheet.fields.length);
    expect(copy.fields[0].id).not.toBe(sheet.fields[0].id);
    await api.updateCodexEntity(scope, original.id, { tags: [" coragem ", "coragem"], role: "Protagonista" });
    expect((await api.getCodexSheet(scope, original.id)).entity.tags_json).toBe('["coragem"]');
    await api.deleteCodexEntity(scope, original.id);
    await expect(api.getCodexSheet(scope, original.id)).rejects.toMatchObject({ code: "not_found" });
    await api.deleteCodexTemplate(profile, template.id);
    await expect(api.deleteCodexTemplate(profile, presets[0].id)).rejects.toMatchObject({ code: "validation" });
  });

  it.each([false, true])("shares sheets through direct or series membership (%s), preserving IDs and archived data", async (throughSeries) => {
    const first = await book("Primeiro");
    const second = await book("Segundo");
    const scope = scopeFor(first.id);
    const sheet = await api.createCodexEntity({ scope, kind: "character", name: "Pessoa" });
    await expect(api.getCodexSheet(scopeFor(second.id), sheet.entity.id)).rejects.toMatchObject({ code: "not_found" });
    const universe = await createUniverse({ profile_id: profile, name: "Mundo" });
    if (throughSeries) {
      const series = await createSeries({ profile_id: profile, name: "Saga" });
      await updateBook(first.id, { series_id: series.id });
      await updateSeries(series.id, { universe_id: universe.id });
    } else await updateBook(first.id, { universe_id: universe.id });
    await updateBook(second.id, { universe_id: universe.id });
    const shared = await api.getCodexSheet(scopeFor(second.id), sheet.entity.id);
    expect(shared.fields).toEqual(sheet.fields);
    expect(shared.entity).toMatchObject({ id: sheet.entity.id, book_id: null, universe_id: universe.id });
    const world: CodexScopeInput = { profile_id: profile, universe_id: universe.id };
    await deleteUniverse(universe.id);
    expect((await api.listCodexContexts(profile)).find((item) => item.id === universe.id)?.is_archived).toBe(true);
    expect((await api.getCodexSheet(world, sheet.entity.id)).entity.id).toBe(sheet.entity.id);
    await expect(api.updateCodexEntity(world, sheet.entity.id, { name: "Alteração" })).rejects.toMatchObject({ code: "validation" });
  });

  it("validates field types and ownership before atomically replacing structure", async () => {
    const scope = scopeFor((await book("Obra")).id);
    const sheet = await api.createCodexEntity({ scope, kind: "location", name: "Lugar" });
    const other = await api.createCodexEntity({ scope, kind: "location", name: "Outro" });
    const pairs: [CodexFieldType, CodexJSON][] = [["short_text", "Texto"], ["long_text", "Longo"], ["tags", ["tag"]],
      ["scale", 75], ["reference", [other.entity.id]], ["document", { type: "doc", content: [] }]];
    const saved = await api.saveCodexStructure(scope, sheet.entity.id, [{ name: "Dados", fields: pairs.map(([field_type, value]) =>
      ({ label: field_type, field_type, value, config: {} })) }]);
    expect(saved.fields).toHaveLength(6);
    const before = data.get(CODEX_STORAGE_KEY);
    for (const value of [101, -1, "50"]) {
      const categories = structure(saved);
      categories[0].fields.find((field) => field.field_type === "scale")!.value = value;
      await expect(api.saveCodexStructure(scope, sheet.entity.id, categories)).rejects.toMatchObject({ code: "validation" });
      expect(data.get(CODEX_STORAGE_KEY)).toBe(before);
    }
    const categories = structure(saved);
    categories[0].fields[0].id = other.fields[0].id;
    await expect(api.saveCodexStructure(scope, sheet.entity.id, categories)).rejects.toMatchObject({ code: "validation" });
    expect(data.get(CODEX_STORAGE_KEY)).toBe(before);
  });

  it("preserves stored data on quota failure and corrupt JSON and emits no successful mutation", async () => {
    const scope = scopeFor((await book("Obra")).id);
    const sheet = await api.createCodexEntity({ scope, kind: "character", name: "Pessoa" });
    const before = data.get(CODEX_STORAGE_KEY);
    const changes: string[] = [];
    const unsubscribe = subscribeDataChanges((change) => changes.push(change));
    try {
      vi.spyOn(localStorage, "setItem").mockImplementation(() => { throw new Error("quota"); });
      await expect(api.updateCodexEntity(scope, sheet.entity.id, { name: "Novo" })).rejects.toMatchObject({ code: "storage" });
      expect(data.get(CODEX_STORAGE_KEY)).toBe(before);
      expect(changes).toEqual([]);
      data.set(CODEX_STORAGE_KEY, "{corrupt");
      await expect(api.listCodexEntities(scope)).rejects.toMatchObject({ code: "storage" });
      expect(data.get(CODEX_STORAGE_KEY)).toBe("{corrupt");
    } finally { unsubscribe(); }
  });

  it("invalidates cached data after scope changes, without mixing books or profiles", async () => {
    const scope = scopeFor((await book("Obra")).id);
    await api.createCodexEntity({ scope, kind: "lore", name: "Conceito" });
    const resource = codexEntitiesResource(scope);
    expect(codexEntitiesResource(scope)).toBe(resource);
    await resource.load();
    expect(resource.getSnapshot().data).toHaveLength(1);
    invalidateCodexResources("restore");
    expect(resource.getSnapshot().data).toBeUndefined();
    await resource.load();
    expect(resource.getSnapshot().data).toHaveLength(1);
    await expect(api.listCodexEntities({ ...scope, profile_id: "other" })).rejects.toMatchObject({ code: "not_found" });
    expect(codexEntitiesResource({ ...scope, profile_id: "other" })).not.toBe(resource);
  });
});

describe("Códice IPC contract", () => {
  it("uses registered commands and camelCase arguments and safely maps native failures", async () => {
    vi.stubGlobal("window", { __TAURI_INTERNALS__: {} });
    const scope = scopeFor("book-id");
    vi.mocked(invoke).mockResolvedValue(null);
    await api.resolveCodexScope(scope);
    await api.listCodexContexts(profile);
    await api.listCodexEntities(scope);
    await api.getCodexSheet(scope, "id");
    await api.createCodexEntity({ scope, kind: "character", name: "Pessoa" });
    await api.updateCodexEntity(scope, "id", { name: "Nome" });
    await api.deleteCodexEntity(scope, "id");
    await api.saveCodexStructure(scope, "id", []);
    await api.listCodexTemplates(profile);
    await api.saveCodexTemplate(scope, "id", "Modelo");
    await api.deleteCodexTemplate(profile, "id");
    expect(vi.mocked(invoke).mock.calls.map(([name]) => name)).toEqual([
      "resolve_codex_scope", "list_codex_contexts", "list_codex_entities", "get_codex_sheet", "create_codex_entity",
      "update_codex_entity", "delete_codex_entity", "save_codex_structure", "list_codex_templates", "save_codex_template", "delete_codex_template",
    ]);
    expect(invoke).toHaveBeenCalledWith("save_codex_template", { scope, entityId: "id", name: "Modelo" });
    expect(invoke).toHaveBeenCalledWith("list_codex_templates", { profileId: profile, kind: null });
    vi.mocked(invoke).mockRejectedValueOnce({ code: "validation", message: "Escolha outro nome" });
    await expect(api.updateCodexEntity(scope, "id", {})).rejects.toMatchObject({ code: "validation", message: "Escolha outro nome" });
    vi.mocked(invoke).mockRejectedValueOnce("SQL failed at /private/database");
    await expect(api.listCodexEntities(scope)).rejects.toMatchObject({ code: "storage" });
    await expect(api.listCodexEntities(scope)).resolves.toBeNull();
  });
});
