import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useCodexTemplateSave } from "@/hooks/useCodexTemplateSave";
import type { CodexScopeInput } from "@/types/codex";

export function TemplateSaveDialog({ scope, entity, onClose, onSaved }: {
  scope: CodexScopeInput; entity: string; onClose: () => void; onSaved: (name: string) => void;
}) {
  const form = useCodexTemplateSave(scope, entity, onSaved);
  const close = () => { if (form.canClose()) onClose(); };
  return (
    <Modal isOpen onClose={close} title="Salvar como modelo">
      <form noValidate onSubmit={form.submit} className="flex flex-col gap-5">
        <p className="text-sm text-muted">Reutilize as categorias e os campos em novas fichas deste tipo. Textos, vínculos e imagens não serão copiados.</p>
        <Input label="Nome do modelo" required maxLength={160} value={form.name} disabled={form.busy}
          error={form.error ?? undefined} onChange={(event) => form.setName(event.target.value)} />
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" disabled={form.busy} onClick={close}>Cancelar</Button>
          <Button type="submit" isLoading={form.busy} loadingLabel="Salvando modelo…">Salvar modelo</Button>
        </div>
      </form>
    </Modal>
  );
}
