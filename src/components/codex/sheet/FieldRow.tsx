import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FieldValue } from "@/components/codex/sheet/FieldValue";
import { fieldLabels } from "@/utils/codexStructure";
import type { DraftField } from "@/types/codexEditing";
import type { CodexScopeInput } from "@/types/codex";
import type { CodexStructureEditor } from "@/hooks/useCodexStructure";

export function FieldRow({ field, index, editor, scope, entity }: {
  field: DraftField; index: number; editor: CodexStructureEditor; scope: CodexScopeInput; entity: string;
}) {
  const category = editor.active!;
  return (
    <div className="min-w-0 rounded-lg border border-border p-4" data-codex-field={field.key}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-muted">{fieldLabels[field.field_type]}</span>
        {!editor.readOnly && <div className="flex gap-1" role="group" aria-label={`Ações do campo ${field.label}`}>
          <Button variant="ghost" className="min-h-8 px-2" aria-label={`Editar campo ${field.label}`} disabled={editor.busy}
            onClick={() => editor.open({ kind: "field", category: category.key, key: field.key })}><Pencil size={14} aria-hidden="true" /></Button>
          <Button variant="ghost" className="min-h-8 px-2" aria-label={`Mover campo ${field.label} para cima`} disabled={editor.busy || index === 0}
            onClick={() => editor.moveField(field.key, -1)}><ArrowUp size={14} aria-hidden="true" /></Button>
          <Button variant="ghost" className="min-h-8 px-2" aria-label={`Mover campo ${field.label} para baixo`} disabled={editor.busy || index === category.fields.length - 1}
            onClick={() => editor.moveField(field.key, 1)}><ArrowDown size={14} aria-hidden="true" /></Button>
          <Button variant="ghost" className="min-h-8 px-2" aria-label={`Excluir campo ${field.label}`} disabled={editor.busy}
            onClick={() => editor.askRemove({ kind: "field", category: category.key, key: field.key })}><Trash2 size={14} aria-hidden="true" /></Button>
        </div>}
      </div>
      <FieldValue field={field} scope={scope} entity={entity} disabled={editor.readOnly || editor.busy}
        change={(value) => editor.value(category.key, field.key, value)} />
    </div>
  );
}
