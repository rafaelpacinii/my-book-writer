import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useLibraryMoveForm } from "@/hooks/useLibraryMoveForm";
import type { LibraryMove } from "@/hooks/useLibraryMove";
import type { LibraryCollection } from "@/types/library";

export function MoveSeriesDialog({ move, collections }: { move: LibraryMove; collections: LibraryCollection[] }) {
  const universes = collections.filter((item) => item.kind === "universe");
  const form = useLibraryMoveForm(universes, move);
  if (!move.movingSeries) return null;
  return (
    <Modal isOpen onClose={move.close} title="Mover série">
      <form onSubmit={form.submit} className="flex flex-col gap-4">
        <p className="text-sm">Escolha o universo de “{move.movingSeries.name}”.</p>
        <Select label="Destino" value={form.destination} disabled={move.busy}
          onChange={(event) => form.setDestination(event.target.value)}>
          <option value="root">Biblioteca · Série sem universo</option>
          {universes.map((item) => (
            <option key={item.collection.id} value={`universe:${item.collection.id}`}>{item.collection.name}</option>
          ))}
        </Select>
        <p className="text-xs text-muted">Os livros acompanham a série: ao trocar ou remover o universo, seus vínculos também são atualizados. A ordem dos volumes é preservada.</p>
        {(form.error || move.error) && <p role="alert" className="text-sm text-danger">{form.error || move.error}</p>}
        <div className="flex justify-end gap-3 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={move.close} disabled={move.busy}>Cancelar</Button>
          <Button type="submit" isLoading={move.busy}>Mover série</Button>
        </div>
      </form>
    </Modal>
  );
}
