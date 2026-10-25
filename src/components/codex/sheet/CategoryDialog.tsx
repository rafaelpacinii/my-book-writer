import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCodexCategoryDialog } from "@/hooks/useCodexStructureDialog";
import type { CodexStructureEditor } from "@/hooks/useCodexStructure";

export function CategoryDialog({ editor, categoryKey }: { editor: CodexStructureEditor; categoryKey?: string }) {
  const form = useCodexCategoryDialog(editor, categoryKey);
  return (
    <Modal isOpen onClose={editor.close} title={categoryKey ? "Renomear categoria" : "Nova categoria"}>
      <form noValidate onSubmit={form.submit} className="flex flex-col gap-5">
        <Input label="Nome da categoria" value={form.name} maxLength={160} required error={form.error ?? undefined}
          onChange={(event) => form.setName(event.target.value)} />
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" onClick={editor.close}>Cancelar</Button>
          <Button type="submit">{categoryKey ? "Aplicar nome" : "Adicionar categoria"}</Button>
        </div>
      </form>
    </Modal>
  );
}
