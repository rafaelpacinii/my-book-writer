import data from "../../../src-tauri/resources/codex-presets.json";
import { uuidV7 } from "@/utils/uuidV7";
import type { CodexCategoryInput, CodexKind } from "@/types/codex";
import type { CodexStore } from "@/lib/codex/storage";
import { assertProfile } from "@/lib/codex/scopes";

interface Preset { kind: CodexKind; name: string; preset_key: string; categories: CodexCategoryInput[] }
export function ensurePresets(store: CodexStore, profile: string) {
  assertProfile(profile);
  for (const preset of data as Preset[]) {
    if (store.templates.some((item) => item.profile_id === profile && item.preset_key === preset.preset_key)) continue;
    const now = new Date().toISOString();
    store.templates.push({ id: uuidV7(), profile_id: profile, kind: preset.kind, name: preset.name,
      preset_key: preset.preset_key, schema_json: JSON.stringify(preset.categories), created_at: now, updated_at: now, deleted_at: null });
  }
}
