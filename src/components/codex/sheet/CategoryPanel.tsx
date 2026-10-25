import { ArrowLeft, ArrowRight, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FieldRow } from "@/components/codex/sheet/FieldRow";
import type { CodexStructureEditor } from "@/hooks/useCodexStructure";
import type { CodexScopeInput } from "@/types/codex";

export function CategoryPanel({ editor, scope, entity, panelId, tabId }: {
  editor: CodexStructureEditor; scope: CodexScopeInput; entity: string; panelId: string; tabId: string;
}) {
  const active = editor.active;
  if (!active) return null;
  const index = editor.items.findIndex((item) => item.key === active.key);
  return (
    <div id={panelId} role="tabpanel" aria-labelledby={tabId}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="min-w-0 break-words font-bold text-foreground">{active.name}</h3>
        {!editor.readOnly && <div className="flex flex-wrap gap-1" role="group" aria-label="Gerenciar categoria">
          <Button variant="ghost" className="px-3" aria-label="Renomear categoria" disabled={editor.busy}
            onClick={() => editor.open({ kind: "category", key: active.key })}><Pencil size={16} aria-hidden="true" /></Button>
          <Button variant="ghost" className="px-3" aria-label="Mover categoria para a esquerda" disabled={editor.busy || index === 0}
            onClick={() => editor.moveCategory(-1)}><ArrowLeft size={16} aria-hidden="true" /></Button>
          <Button variant="ghost" className="px-3" aria-label="Mover categoria para a direita" disabled={editor.busy || index === editor.items.length - 1}
            onClick={() => editor.moveCategory(1)}><ArrowRight size={16} aria-hidden="true" /></Button>
          <Button variant="ghost" className="px-3" aria-label="Excluir categoria" disabled={editor.busy}
            onClick={() => editor.askRemove({ kind: "category", key: active.key })}><Trash2 size={16} aria-hidden="true" /></Button>
        </div>}
      </div>
      <div className="space-y-4">
        {active.fields.map((field, index) => <FieldRow key={`${field.key}:${editor.revision}`} field={field} index={index}
          editor={editor} scope={scope} entity={entity} />)}
        {!active.fields.length && <p className="py-6 text-sm text-muted">Esta categoria ainda não possui campos.</p>}
      </div>
      {!editor.readOnly && <Button variant="outline" className="mt-5" disabled={editor.busy || editor.fieldCount >= 256}
        onClick={() => editor.open({ kind: "field", category: active.key })}><Plus size={16} aria-hidden="true" />Novo campo</Button>}
    </div>
  );
}
