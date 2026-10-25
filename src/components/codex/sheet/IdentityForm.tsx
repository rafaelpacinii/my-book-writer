import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { DiscardChangesModal } from "@/components/books/settings/DiscardChangesModal";
import { useCodexIdentity } from "@/hooks/useCodexIdentity";
import type { CodexEntity, CodexScopeInput } from "@/types/codex";

export function IdentityForm({ scope, entity, archived, backHref }: {
  scope: CodexScopeInput; entity: CodexEntity; archived: boolean; backHref: string;
}) {
  const form = useCodexIdentity(scope, entity, backHref);
  return (
    <section className="rounded-xl border border-border bg-surface p-5" aria-label="Identidade da ficha">
      <h2 className="mb-5 text-sm font-bold uppercase tracking-wider text-foreground">Identidade</h2>
      <form onSubmit={form.submit} noValidate className="flex flex-col gap-4">
        <fieldset disabled={archived || form.busy} className="flex min-w-0 flex-col gap-4">
          <Input label="Nome da ficha" value={form.values.name} maxLength={160} required onChange={(event) => form.change("name", event.target.value)} />
          <Input label="Papel na história" value={form.values.role} list="codex-roles" onChange={(event) => form.change("role", event.target.value)} />
          <datalist id="codex-roles"><option>Protagonista</option><option>Antagonista</option><option>Secundário</option><option>Coadjuvante</option></datalist>
          <Input label="Status" value={form.values.status} list="codex-status" onChange={(event) => form.change("status", event.target.value)} />
          <datalist id="codex-status"><option>Vivo</option><option>Falecido</option><option>Desaparecido</option><option>Ativo</option><option>Destruído</option></datalist>
          <Input label="Título ou arquétipo" value={form.values.archetype} onChange={(event) => form.change("archetype", event.target.value)} />
          <label className="flex flex-col gap-1.5 text-xs font-bold text-foreground">Resumo
            <textarea value={form.values.summary} rows={4} onChange={(event) => form.change("summary", event.target.value)}
              className="w-full resize-y rounded-lg border border-control-border bg-surface p-3 text-sm font-normal text-foreground" />
          </label>
          <Input label="Tags" hint="Separe as tags por vírgulas." value={form.values.tags} onChange={(event) => form.change("tags", event.target.value)} />
        </fieldset>
        <div role="group" aria-label="Tags da ficha" className="flex flex-wrap gap-2">
          {form.values.tags.split(",").map((tag) => tag.trim()).filter(Boolean).map((tag, index) => (
            <span key={`${index}:${tag}`} className="max-w-full break-words rounded-md bg-primary-soft px-2 py-1 text-xs text-foreground">{tag}</span>
          ))}
        </div>
        {form.error && <p role="alert" className="text-sm text-danger">{form.error}</p>}
        {!archived && <Button type="submit" isLoading={form.busy} disabled={!form.dirty} loadingLabel="Salvando identidade…">Salvar identidade</Button>}
        <p role="status" className="text-xs text-muted">{form.saved ? "Identidade salva." : form.dirty ? "Alterações não salvas." : ""}</p>
      </form>
      <DiscardChangesModal isOpen={form.navigation.isOpen} onClose={form.navigation.close} onDiscard={form.navigation.confirm} />
    </section>
  );
}
