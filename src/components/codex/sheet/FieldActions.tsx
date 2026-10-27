import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ActionPopover } from "@/components/shared/ActionPopover";
import type { CodexStructureEditor } from "@/hooks/useCodexStructure";
import type { DraftField } from "@/types/codexEditing";

export function FieldActions({ editor, field, index }: { editor: CodexStructureEditor; field: DraftField; index: number }) {
  const category = editor.active;
  if (!category || editor.readOnly) return null;
  return (
    <ActionPopover label={`Ações do campo ${field.label}`}>
      <Button variant="ghost" disabled={editor.busy} aria-label={`Editar campo ${field.label}`}
        onClick={() => editor.open({ kind: "field", category: category.key, key: field.key })}>
        <Pencil size={15} aria-hidden="true" />Editar campo
      </Button>
      <Button variant="ghost" disabled={editor.busy || index === 0} aria-label={`Mover campo ${field.label} para cima`}
        onClick={() => editor.moveField(field.key, -1)}>
        <ArrowUp size={15} aria-hidden="true" />Mover para cima
      </Button>
      <Button variant="ghost" disabled={editor.busy || index === category.fields.length - 1} aria-label={`Mover campo ${field.label} para baixo`}
        onClick={() => editor.moveField(field.key, 1)}>
        <ArrowDown size={15} aria-hidden="true" />Mover para baixo
      </Button>
      <Button variant="ghost" disabled={editor.busy} aria-label={`Excluir campo ${field.label}`}
        onClick={() => editor.askRemove({ kind: "field", category: category.key, key: field.key })}>
        <Trash2 size={15} aria-hidden="true" />Excluir campo
      </Button>
    </ActionPopover>
  );
}
