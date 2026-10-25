import { invoke } from "@tauri-apps/api/core";
import { publishDataChange } from "@/lib/data/changes";
import { codexError } from "@/lib/codex/errors";
import * as browser from "@/lib/codex/browser";
import type { CodexCategoryInput, CodexContext, CodexEntity, CodexKind, CodexScope, CodexScopeInput,
  CodexSheet, CodexTemplate, CreateCodexEntityInput, UpdateCodexEntityInput } from "@/types/codex";
export { CodexError } from "@/lib/codex/errors";

export async function callCodex<T>(command: string, args: Record<string, unknown>, fallback: () => T | Promise<T>, mutate = false): Promise<T> {
  try {
    const native = typeof window !== "undefined" && Boolean((window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__);
    const result = native ? await invoke<T>(command, args) : await fallback();
    if (mutate) publishDataChange("codex");
    return result;
  } catch (error) { throw codexError(error); }
}
const call = callCodex;
export const resolveCodexScope = (scope: CodexScopeInput) =>
  call<CodexScope>("resolve_codex_scope", { scope }, () => browser.browserResolveScope(scope));
export const listCodexContexts = (profileId: string) =>
  call<CodexContext[]>("list_codex_contexts", { profileId }, () => browser.browserListContexts(profileId));
export const listCodexEntities = (scope: CodexScopeInput, kind?: CodexKind) =>
  call<CodexEntity[]>("list_codex_entities", { scope, kind: kind ?? null }, () => browser.browserListEntities(scope, kind));
export const getCodexSheet = (scope: CodexScopeInput, id: string) =>
  call<CodexSheet>("get_codex_sheet", { scope, id }, () => browser.browserGetSheet(scope, id));
export const createCodexEntity = (input: CreateCodexEntityInput) =>
  call<CodexSheet>("create_codex_entity", { input }, () => browser.browserCreateEntity(input), true);
export const updateCodexEntity = (scope: CodexScopeInput, id: string, input: UpdateCodexEntityInput) =>
  call<CodexEntity>("update_codex_entity", { scope, id, input }, () => browser.browserUpdateEntity(scope, id, input), true);
export const deleteCodexEntity = (scope: CodexScopeInput, id: string) =>
  call<void>("delete_codex_entity", { scope, id }, () => browser.browserDeleteEntity(scope, id), true);
export const saveCodexStructure = (scope: CodexScopeInput, id: string, categories: CodexCategoryInput[]) =>
  call<CodexSheet>("save_codex_structure", { scope, id, categories }, () => browser.browserSaveStructure(scope, id, categories), true);
export const listCodexTemplates = (profileId: string, kind?: CodexKind) =>
  call<CodexTemplate[]>("list_codex_templates", { profileId, kind: kind ?? null }, () => browser.browserListTemplates(profileId, kind));
export const saveCodexTemplate = (scope: CodexScopeInput, entityId: string, name: string) =>
  call<CodexTemplate>("save_codex_template", { scope, entityId, name }, () => browser.browserSaveTemplate(scope, entityId, name), true);
export const deleteCodexTemplate = (profileId: string, id: string) =>
  call<void>("delete_codex_template", { profileId, id }, () => browser.browserDeleteTemplate(profileId, id), true);
