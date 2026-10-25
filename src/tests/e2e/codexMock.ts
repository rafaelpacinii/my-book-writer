import type { Page } from "@playwright/test";
import { mockUI } from "@/tests/e2e/uiMock";
import { book } from "@/tests/fixtures/book";
import presets from "../../../src-tauri/resources/codex-presets.json" with { type: "json" };
import type { CodexSheet, CodexTemplate } from "@/types/codex";

export async function mockCodex(page: Page) {
  await mockUI(page);
  const preset = presets[0];
  const template: CodexTemplate = { id: "initial-character", profile_id: book.profile_id, kind: "character",
    name: preset.name, preset_key: preset.preset_key, schema_json: JSON.stringify(preset.categories),
    created_at: book.created_at, updated_at: book.updated_at, deleted_at: null };
  await page.addInitScript(({ book, template }) => {
    const runtime = window as unknown as { __TAURI_INTERNALS__: {
      invoke: (command: string, args?: Record<string, unknown>) => Promise<unknown>;
    }; codexCalls: Record<string, number> };
    const original = runtime.__TAURI_INTERNALS__.invoke;
    runtime.codexCalls = {};
    const sheets: CodexSheet[] = [];
    runtime.__TAURI_INTERNALS__.invoke = async (command, args) => {
      if (!command.includes("codex")) return original(command, args);
      runtime.codexCalls[command] = (runtime.codexCalls[command] ?? 0) + 1;
      if (command === "list_codex_contexts") return [{ id: book.id, name: book.title, kind: "book", is_archived: false }];
      if (command === "resolve_codex_scope") return { profile_id: book.profile_id, book_id: book.id, universe_id: null, is_archived: false };
      if (command === "list_codex_templates") return [template];
      if (command === "list_codex_entities") {
        if (runtime.codexCalls[command] === 1) throw { code: "storage", message: "Não foi possível carregar as fichas." };
        return sheets.map((sheet) => sheet.entity);
      }
      if (command === "get_codex_sheet") return sheets.find((sheet) => sheet.entity.id === args?.id);
      if (command === "create_codex_entity") {
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (runtime.codexCalls[command] === 1) throw { code: "validation", message: "Não foi possível criar esta ficha. Tente novamente." };
        const input = args?.input as { name: string };
        const sheet: CodexSheet = { entity: { id: "native-sheet", profile_id: book.profile_id, book_id: book.id,
          universe_id: null, kind: "character", name: input.name, summary: null, role: null, status: null,
          archetype: null, tags_json: "[]", position: 0, created_at: book.created_at, updated_at: book.updated_at, deleted_at: null },
          categories: [], fields: [], images: [] };
        sheets.push(sheet);
        return sheet;
      }
      throw new Error(`Comando Códice inesperado: ${command}`);
    };
  }, { book, template });
}
