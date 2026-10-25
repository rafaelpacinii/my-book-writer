import { callCodex } from "@/lib/api/codex";
import * as browser from "@/lib/codex/gallery";
import type { CodexScopeInput, CodexSheet, ImportCodexImageInput, UpdateCodexImageInput } from "@/types/codex";

export const importCodexImage = (scope: CodexScopeInput, entityId: string, input: ImportCodexImageInput) =>
  callCodex<CodexSheet>("import_codex_image", { scope, entityId, input }, () => browser.browserImportCodexImage(scope, entityId, input), true);
export const readCodexImage = (scope: CodexScopeInput, entityId: string, imageId: string) =>
  callCodex<string>("read_codex_image", { scope, entityId, imageId }, () => browser.browserReadCodexImage(scope, entityId, imageId));
export const updateCodexImage = (scope: CodexScopeInput, entityId: string, imageId: string, input: UpdateCodexImageInput) =>
  callCodex<CodexSheet>("update_codex_image", { scope, entityId, imageId, input }, () => browser.browserUpdateCodexImage(scope, entityId, imageId, input), true);
export const deleteCodexImage = (scope: CodexScopeInput, entityId: string, imageId: string) =>
  callCodex<CodexSheet>("delete_codex_image", { scope, entityId, imageId }, () => browser.browserDeleteCodexImage(scope, entityId, imageId), true);
