import { StructureToolbar } from "@/components/codex/sheet/StructureToolbar";
import { CategoryTabs } from "@/components/codex/sheet/CategoryTabs";
import { CategoryPanel } from "@/components/codex/sheet/CategoryPanel";
import { StructureDialogs } from "@/components/codex/sheet/StructureDialogs";
import { TemplateSaveDialog } from "@/components/codex/sheet/TemplateSaveDialog";
import { useCodexStructure } from "@/hooks/useCodexStructure";
import { useCodexCategoryTabs } from "@/hooks/useCodexCategoryTabs";
import type { CodexScopeInput, CodexSheet } from "@/types/codex";
import styles from "@/components/codex/sheet/dossier.module.css";

export function SheetFields({ sheet, scope, archived }: { sheet: CodexSheet; scope: CodexScopeInput; archived: boolean }) {
  const editor = useCodexStructure(scope, sheet, archived);
  const tabs = useCodexCategoryTabs(editor.items.map((item) => item.key), editor.select);
  return (
    <section className={styles.fields} aria-label="Dados da ficha">
      <StructureToolbar editor={editor} />
      {editor.dirty && <p className="mb-4 text-xs text-muted">Alterações não salvas nos campos. Salve antes de criar um modelo.</p>}
      {editor.error && <p role="alert" className="mb-4 text-sm text-danger">{editor.error}</p>}
      <CategoryTabs editor={editor} tabs={tabs} />
      {editor.active ? <CategoryPanel key={editor.active.key} editor={editor} scope={scope} entity={sheet.entity.id}
        panelId={`${tabs.id}-panel`} tabId={`${tabs.id}-${editor.active.key}`} /> : (
        <p className="py-8 text-center text-sm text-muted">Esta ficha ainda não possui categorias.</p>
      )}
      <p role="status" className="mt-4 text-xs text-muted">{editor.announcement}</p>
      <StructureDialogs editor={editor} />
      {editor.templateOpen && <TemplateSaveDialog scope={scope} entity={sheet.entity.id}
        onClose={editor.closeTemplate} onSaved={editor.templateSaved} />}
    </section>
  );
}
