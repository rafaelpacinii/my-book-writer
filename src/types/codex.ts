export type CodexKind = "character" | "location" | "lore";
export type CodexFieldType = "short_text" | "long_text" | "tags" | "scale" | "reference" | "document";
export type CodexJSON = string | number | boolean | null | CodexJSON[] | { [key: string]: CodexJSON };

export interface CodexEntity {
  primary_image_id?: string | null;
  id: string;
  profile_id: string;
  book_id: string | null;
  universe_id: string | null;
  kind: CodexKind;
  name: string;
  summary: string | null;
  role: string | null;
  status: string | null;
  archetype: string | null;
  tags_json: string;
  position: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CodexCategory {
  id: string;
  entity_id: string;
  name: string;
  position: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CodexField {
  id: string;
  category_id: string;
  label: string;
  field_type: CodexFieldType;
  value_json: string;
  config_json: string;
  position: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CodexImage {
  id: string;
  entity_id: string;
  image_asset_id: string;
  caption: string | null;
  is_primary: boolean;
  position: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CodexTemplate {
  id: string;
  profile_id: string;
  kind: CodexKind;
  name: string;
  preset_key: string | null;
  schema_json: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CodexSheet {
  entity: CodexEntity;
  categories: CodexCategory[];
  fields: CodexField[];
  images: CodexImage[];
}

export type CodexScopeInput = { profile_id: string } & (
  | { book_id: string; universe_id?: null }
  | { universe_id: string; book_id?: null }
);
export interface CodexScope {
  profile_id: string; book_id: string | null; universe_id: string | null; is_archived: boolean;
}
export interface CodexContext { id: string; name: string; kind: "book" | "universe"; is_archived: boolean }
export interface CodexFieldInput {
  id?: string | null; label: string; field_type: CodexFieldType; value: CodexJSON; config: Record<string, CodexJSON>;
}
export interface CodexCategoryInput { id?: string | null; name: string; fields: CodexFieldInput[] }
export interface CreateCodexEntityInput { scope: CodexScopeInput; kind: CodexKind; name: string; template_id?: string | null }
export interface UpdateCodexEntityInput {
  name?: string; summary?: string; role?: string; status?: string; archetype?: string; tags?: string[];
}
export interface ImportCodexImageInput { original_filename: string; data_url: string }
export interface UpdateCodexImageInput { caption: string; is_primary: boolean }
export interface CodexStoredAsset { id: string; entity_id: string; data_url: string; sha256: string; width: number; height: number }
