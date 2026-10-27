import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FieldRow } from "@/components/codex/sheet/FieldRow";
import { CategoryActions } from "@/components/codex/sheet/CategoryActions";
import styles from "@/components/codex/sheet/dossier.module.css";
import type { CodexStructureEditor } from "@/hooks/useCodexStructure";
import type { CodexScopeInput } from "@/types/codex";

export function CategoryPanel({ editor, scope, entity, panelId, tabId }: {
  editor: CodexStructureEditor; scope: CodexScopeInput; entity: string; panelId: string; tabId: string;
}) {
  const active = editor.active;
  if (!active) return null;
  return (
    <div id={panelId} role="tabpanel" aria-labelledby={tabId}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="min-w-0 break-words font-bold text-foreground">{active.name}</h3>
        <CategoryActions editor={editor} />
      </div>
      <div className={styles.fieldGrid}>
        {active.fields.map((field, index) => <FieldRow key={`${field.key}:${editor.revision}`} field={field} index={index}
          editor={editor} scope={scope} entity={entity} />)}
        {!active.fields.length && <p className="py-6 text-sm text-muted">Esta categoria ainda não possui campos.</p>}
      </div>
      {!editor.readOnly && <Button variant="outline" className="mt-5" disabled={editor.busy || editor.fieldCount >= 256}
        onClick={() => editor.open({ kind: "field", category: active.key })}><Plus size={16} aria-hidden="true" />Novo campo</Button>}
    </div>
  );
}
