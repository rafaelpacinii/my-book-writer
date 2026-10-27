import { FieldActions } from "@/components/codex/sheet/FieldActions";
import { FieldValue } from "@/components/codex/sheet/FieldValue";
import { fieldLabels } from "@/utils/codexStructure";
import type { DraftField } from "@/types/codexEditing";
import type { CodexScopeInput } from "@/types/codex";
import type { CodexStructureEditor } from "@/hooks/useCodexStructure";
import styles from "@/components/codex/sheet/dossier.module.css";

export function FieldRow({ field, index, editor, scope, entity }: {
  field: DraftField; index: number; editor: CodexStructureEditor; scope: CodexScopeInput; entity: string;
}) {
  const category = editor.active!;
  return (
    <div className={styles.field} data-codex-field={field.key} data-field-type={field.field_type}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-muted">{fieldLabels[field.field_type]}</span>
        <FieldActions editor={editor} field={field} index={index} />
      </div>
      <FieldValue field={field} scope={scope} entity={entity} disabled={editor.readOnly || editor.busy}
        change={(value) => editor.value(category.key, field.key, value)} />
    </div>
  );
}
