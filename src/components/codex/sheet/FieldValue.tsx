import { Input } from "@/components/ui/Input";
import { TagField } from "@/components/codex/sheet/TagField";
import { ScaleField } from "@/components/codex/sheet/ScaleField";
import { ReferenceField } from "@/components/codex/sheet/ReferenceField";
import type { DraftField } from "@/types/codexEditing";
import type { CodexJSON, CodexScopeInput } from "@/types/codex";

export interface FieldValueProps { field: DraftField; disabled: boolean; change: (value: CodexJSON) => void }
export function FieldValue({ field, disabled, change, scope, entity }: FieldValueProps & { scope: CodexScopeInput; entity: string }) {
  if (field.field_type === "tags") return <TagField field={field} disabled={disabled} change={change} />;
  if (field.field_type === "scale") return <ScaleField field={field} disabled={disabled} change={change} />;
  if (field.field_type === "reference") return <ReferenceField field={field} scope={scope} entity={entity} disabled={disabled} change={change} />;
  if (field.field_type === "document") return <div><p className="text-xs font-bold text-foreground">{field.label}</p><p className="mt-2 text-sm text-muted">Documento narrativo</p></div>;
  if (field.field_type === "long_text") return (
    <label className="flex flex-col gap-1.5 text-xs font-bold text-foreground">{field.label}
      <textarea rows={4} value={typeof field.value === "string" ? field.value : ""} disabled={disabled}
        onChange={(event) => change(event.target.value)}
        className="w-full resize-y rounded-lg border border-control-border bg-surface p-3 text-sm font-normal text-foreground disabled:opacity-60" />
    </label>
  );
  return <Input label={field.label} value={typeof field.value === "string" ? field.value : ""} maxLength={1000}
    disabled={disabled} onChange={(event) => change(event.target.value)} />;
}
