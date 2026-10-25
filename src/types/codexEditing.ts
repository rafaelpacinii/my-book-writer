import type { CodexCategoryInput, CodexFieldInput } from "@/types/codex";

export interface DraftField extends CodexFieldInput { key: string }
export interface DraftCategory extends Omit<CodexCategoryInput, "fields"> { key: string; fields: DraftField[] }
export type StructureDialog = { kind: "category"; key?: string } | { kind: "field"; category: string; key?: string };
export type StructureRemoval = { kind: "category"; key: string } | { kind: "field"; category: string; key: string } | { kind: "reset" };
