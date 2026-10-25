import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/shared/ErrorState";
import { useCodexCreate } from "@/hooks/useCodexCreate";
import { codexLabels } from "@/utils/codexHub";
import type { CodexKind, CodexScopeInput } from "@/types/codex";

interface Props {
  scope: CodexScopeInput; kind: CodexKind; contextName: string;
  onClose: () => void; onCreated: (id: string, name: string) => void;
}
export function CodexCreateDialog({ scope, kind, contextName, onClose, onCreated }: Props) {
  const form = useCodexCreate(scope, kind, onCreated);
  const close = () => { if (form.canClose()) onClose(); };
  return (
    <Modal isOpen onClose={close} title={`Criar ${codexLabels[kind].singular.toLocaleLowerCase("pt-BR")}`}>
      <form onSubmit={form.submit} noValidate className="flex flex-col gap-5">
        <p className="break-words text-sm text-muted">Esta ficha pertence a <strong className="text-foreground">{contextName}</strong>.</p>
        <Input label="Nome da ficha" value={form.name} disabled={form.busy} required maxLength={160}
          onChange={(event) => form.setName(event.target.value)} error={form.error ?? undefined} />
        <Select label="Modelo de ficha" value={form.template?.id ?? ""}
          disabled={form.busy || form.models.isLoading || Boolean(form.models.error)}
          onChange={(event) => form.setChosen(event.target.value)}>
          {!form.template && <option value="">{form.models.isLoading ? "Carregando modelos…" : "Nenhum modelo disponível"}</option>}
          {form.models.templates.map((template) => (
            <option key={template.id} value={template.id}>{template.name}{template.preset_key ? " · Inicial" : ""}</option>
          ))}
        </Select>
        <p className="text-xs text-muted">O modelo prepara as categorias e os campos. Cada ficha começa com seu próprio conteúdo.</p>
        {form.models.error && <ErrorState message={form.models.error} onRetry={() => void form.models.refresh()} />}
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" onClick={close} disabled={form.busy}>Cancelar</Button>
          <Button type="submit" isLoading={form.busy} loadingLabel="Criando ficha…"
            disabled={!form.template || form.models.isLoading || Boolean(form.models.error)}>Criar ficha</Button>
        </div>
      </form>
    </Modal>
  );
}
