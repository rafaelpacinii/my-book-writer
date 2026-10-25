import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useCodexFieldDialog } from "@/hooks/useCodexStructureDialog";
import { fieldLabels } from "@/utils/codexStructure";
import type { CodexStructureEditor } from "@/hooks/useCodexStructure";
import type { CodexFieldType } from "@/types/codex";

export function FieldDialog({ editor, categoryKey, fieldKey }: { editor: CodexStructureEditor; categoryKey: string; fieldKey?: string }) {
  const form = useCodexFieldDialog(editor, categoryKey, fieldKey);
  return (
    <Modal isOpen onClose={editor.close} title={fieldKey ? "Editar campo" : "Novo campo"}>
      <form noValidate onSubmit={form.submit} className="flex flex-col gap-5">
        <Input label="Nome do campo" value={form.name} required maxLength={160} onChange={(event) => form.setName(event.target.value)} />
        <Select label="Tipo de campo" value={form.type} onChange={(event) => form.setType(event.target.value as CodexFieldType)}>
          {Object.entries(fieldLabels).filter(([type]) => type !== "document" || form.type === "document").map(([type, label]) => (
            <option key={type} value={type} disabled={type === "document"}>{label}</option>
          ))}
        </Select>
        <Select label="Categoria do campo" value={form.category} onChange={(event) => form.setCategory(event.target.value)}>
          {editor.items.map((category) => <option key={category.key} value={category.key}>{category.name}</option>)}
        </Select>
        {form.changedType && <p className="rounded-md bg-warning-soft p-3 text-sm text-foreground">
          Alterar o tipo limpa o valor e as configurações deste campo. A alteração só será persistida ao salvar os campos da ficha.
        </p>}
        {form.error && <p role="alert" className="text-sm text-danger">{form.error}</p>}
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" onClick={editor.close}>Cancelar</Button>
          <Button type="submit">{form.changedType ? "Alterar tipo e limpar valor" : fieldKey ? "Aplicar campo" : "Adicionar campo"}</Button>
        </div>
      </form>
    </Modal>
  );
}
