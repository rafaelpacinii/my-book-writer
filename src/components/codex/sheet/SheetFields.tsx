import { Plus, Save, Undo2, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CategoryTabs } from "@/components/codex/sheet/CategoryTabs";
import { CategoryPanel } from "@/components/codex/sheet/CategoryPanel";
import { StructureDialogs } from "@/components/codex/sheet/StructureDialogs";
import { TemplateSaveDialog } from "@/components/codex/sheet/TemplateSaveDialog";
import { useCodexStructure } from "@/hooks/useCodexStructure";
import { useCodexCategoryTabs } from "@/hooks/useCodexCategoryTabs";
import type { CodexScopeInput, CodexSheet } from "@/types/codex";

export function SheetFields({ sheet, scope, archived }: { sheet: CodexSheet; scope: CodexScopeInput; archived: boolean }) {
  const editor = useCodexStructure(scope, sheet, archived);
  const tabs = useCodexCategoryTabs(editor.items.map((item) => item.key), editor.select);
  return (
    <section className="min-w-0 rounded-xl border border-border bg-surface p-5 sm:p-6" aria-label="Dados da ficha">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-foreground">Dados da ficha</h2>
      <div className="mb-5 flex flex-wrap gap-2">
        {!editor.readOnly && <>
          <Button variant="outline" disabled={editor.busy || editor.items.length >= 64} onClick={() => editor.open({ kind: "category" })}>
            <Plus size={16} aria-hidden="true" />Nova categoria
          </Button>
          <Button onClick={() => void editor.save()} disabled={!editor.dirty} isLoading={editor.busy} loadingLabel="Salvando campos…">
            <Save size={16} aria-hidden="true" />Salvar campos
          </Button>
          <Button variant="ghost" aria-label="Descartar alterações nos campos" disabled={!editor.dirty || editor.busy}
            onClick={() => editor.askRemove({ kind: "reset" })}><Undo2 size={17} aria-hidden="true" /></Button>
        </>}
        <Button variant="outline" disabled={editor.dirty || editor.busy || Boolean(editor.error)} onClick={editor.openTemplate}>
          <Copy size={16} aria-hidden="true" />Salvar como modelo
        </Button>
      </div>
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
