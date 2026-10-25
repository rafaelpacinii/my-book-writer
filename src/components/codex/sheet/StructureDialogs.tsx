import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CategoryDialog } from "@/components/codex/sheet/CategoryDialog";
import { FieldDialog } from "@/components/codex/sheet/FieldDialog";
import type { CodexStructureEditor } from "@/hooks/useCodexStructure";

export function StructureDialogs({ editor }: { editor: CodexStructureEditor }) {
  const dialog = editor.dialog;
  const removal = editor.removal;
  return (
    <>
      {dialog?.kind === "category" && <CategoryDialog key={dialog.key ?? "new"} editor={editor} categoryKey={dialog.key} />}
      {dialog?.kind === "field" && <FieldDialog key={dialog.key ?? "new"} editor={editor} categoryKey={dialog.category} fieldKey={dialog.key} />}
      <Modal isOpen={Boolean(removal)} onClose={editor.cancelRemove}
        title={removal?.kind === "reset" ? "Descartar alterações nos campos?" : removal?.kind === "category" ? "Excluir categoria?" : "Excluir campo?"}>
        <p className="mb-5 text-sm text-foreground">
          {removal?.kind === "reset" ? "Os campos voltarão à última versão salva. A identidade e a galeria serão preservadas."
            : removal?.kind === "category" ? "A categoria e seus campos serão removidos ao salvar a ficha."
              : "O campo e seu conteúdo serão removidos ao salvar a ficha."}
        </p>
        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="outline" onClick={editor.cancelRemove}>Cancelar</Button>
          <Button variant="danger" onClick={editor.remove}>Confirmar</Button>
        </div>
      </Modal>
    </>
  );
}
