import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { CollectionForm, type CollectionFormManager } from "@/components/library/CollectionForm";

interface Props {
  manager: CollectionFormManager & { remove: () => Promise<void> };
  action: "create" | "edit" | "delete";
  item?: { id: string; name: string; description: string | null };
  label: "série" | "universo";
}

export function CollectionDialog({ manager, action, item, label }: Props) {
  const deleting = action === "delete";
  const title = deleting ? `Excluir ${label}?` : action === "create"
    ? label === "série" ? "Nova série" : "Novo universo" : `Editar ${label}`;
  return (
    <Modal isOpen onClose={manager.close} title={title}>
      {deleting ? (
        <div className="flex flex-col gap-4" aria-busy={manager.busy}>
          <p className="text-sm">Excluir {label === "série" ? "a série" : "o universo"} “{item?.name}”?</p>
          <p className="text-sm text-muted">Os livros, capítulos e séries serão preservados na biblioteca. Apenas o vínculo com {label === "série" ? "esta série" : "este universo"} será removido.</p>
          {manager.actionError && <p role="alert" className="text-sm text-danger">{manager.actionError}</p>}
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button variant="outline" onClick={manager.close} disabled={manager.busy}>Cancelar</Button>
            <Button variant="danger" onClick={manager.remove} isLoading={manager.busy}>Excluir {label}</Button>
          </div>
        </div>
      ) : <CollectionForm key={item?.id ?? "create"} item={item} label={label} manager={manager} />}
    </Modal>
  );
}
