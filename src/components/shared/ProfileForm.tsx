"use client";

import { useProfileForm } from "@/hooks/useProfileForm";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function ProfileForm({ initialName, onClose }: { initialName: string; onClose: () => void }) {
  const { name, setName, error, isSaving, save } = useProfileForm(initialName, onClose);
  return (
    <form onSubmit={save} className="flex flex-col gap-4" aria-busy={isSaving}>
      <Input label="Nome ou pseudônimo de autor" value={name} onChange={(event) => setName(event.target.value)} disabled={isSaving} />
      <p className="text-sm text-muted">Seu perfil e seus livros ficam salvos neste dispositivo.</p>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <div className="mt-2 flex flex-wrap justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
        <Button type="submit" isLoading={isSaving} loadingLabel="Salvando…">Salvar alterações</Button>
      </div>
    </form>
  );
}
