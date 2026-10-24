import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useLibraryMoveForm } from "@/hooks/useLibraryMoveForm";
import type { LibraryMove } from "@/hooks/useLibraryMove";
import type { LibraryCollection } from "@/types/library";

export function MoveBookDialog({ move, collections }: { move: LibraryMove; collections: LibraryCollection[] }) {
  const form = useLibraryMoveForm(collections, move);
  if (!move.movingBook) return null;
  return (
    <Modal isOpen onClose={move.close} title="Mover livro">
      <form onSubmit={form.submit} className="flex flex-col gap-4">
        <p className="text-sm">Escolha onde guardar “{move.movingBook.title}”.</p>
        <Select label="Destino" value={form.destination} disabled={move.busy}
          onChange={(event) => form.setDestination(event.target.value)}>
          <option value="root">Biblioteca · Livro avulso</option>
          {collections.map((item) => (
            <option key={`${item.kind}:${item.collection.id}`} value={`${item.kind}:${item.collection.id}`}>
              {item.kind === "series" ? "Série" : "Universo"} · {item.collection.name}
            </option>
          ))}
        </Select>
        <p className="text-xs text-muted">O livro pode pertencer a uma série e a um universo. Vincular um universo preserva a série; na Biblioteca, os dois vínculos são removidos.</p>
        {(form.error || move.error) && <p role="alert" className="text-sm text-danger">{form.error || move.error}</p>}
        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={move.close} disabled={move.busy}>Cancelar</Button>
          <Button type="submit" isLoading={move.busy}>Mover livro</Button>
        </div>
      </form>
    </Modal>
  );
}
