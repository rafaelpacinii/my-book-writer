import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCollectionForm } from "@/hooks/useCollectionForm";

export interface CollectionFormManager {
  busy: boolean;
  actionError: string | null;
  save: (name: string, description: string) => Promise<void>;
  close: () => void;
}
interface Props {
  manager: CollectionFormManager;
  item?: { name: string; description: string | null };
  label: "série" | "universo";
}

export function CollectionForm({ manager, item, label }: Props) {
  const form = useCollectionForm(item, manager.save, label);
  return (
    <form onSubmit={form.submit} className="flex flex-col gap-4" aria-busy={manager.busy}>
      <fieldset disabled={manager.busy} className="flex min-w-0 flex-col gap-4">
        <Input label={`Nome ${label === "série" ? "da série" : "do universo"}`} value={form.name} error={form.error}
          onChange={(event) => form.setName(event.target.value)} />
        <label className="flex flex-col gap-1.5 text-xs font-bold">
          Descrição (opcional)
          <textarea value={form.description} rows={3}
            onChange={(event) => form.setDescription(event.target.value)}
            className="rounded-lg border border-control-border bg-surface p-3 text-sm font-normal text-foreground" />
        </label>
      </fieldset>
      {manager.actionError && <p role="alert" className="text-sm text-danger">{manager.actionError}</p>}
      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={manager.close} disabled={manager.busy}>Cancelar</Button>
        <Button type="submit" isLoading={manager.busy}>Salvar {label}</Button>
      </div>
    </form>
  );
}
