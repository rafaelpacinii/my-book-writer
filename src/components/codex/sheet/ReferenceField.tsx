import Link from "next/link";
import { Plus, X } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/shared/ErrorState";
import { useCodexReferences } from "@/hooks/useCodexReferences";
import { codexSheetHref, codexLabels } from "@/utils/codexHub";
import type { FieldValueProps } from "@/components/codex/sheet/FieldValue";
import type { CodexScopeInput } from "@/types/codex";

export function ReferenceField({ field, scope, entity, disabled, change }: FieldValueProps & { scope: CodexScopeInput; entity: string }) {
  const links = useCodexReferences(scope, entity, field.value, change);
  return (
    <div>
      <p className="mb-3 break-words text-xs font-bold text-foreground">{field.label}</p>
      <ul className="space-y-2" aria-label={`Vínculos de ${field.label}`}>
        {links.selected.map(({ id, entity: target }) => (
          <li key={id} className="flex min-w-0 items-center justify-between gap-2 rounded-md bg-primary-soft px-3 py-2 text-sm text-foreground">
            {target ? <Link className="min-w-0 break-words underline" href={codexSheetHref(scope, id)}>{target.name}</Link>
              : <span className="text-muted">Ficha indisponível</span>}
            {!disabled && <button type="button" aria-label={`Remover vínculo com ${target?.name ?? "ficha indisponível"}`}
              onClick={() => links.remove(id)} className="shrink-0 rounded-md p-2"><X size={14} aria-hidden="true" /></button>}
          </li>
        ))}
      </ul>
      {!links.ids.length && <p className="text-sm text-muted">Nenhum vínculo.</p>}
      {!disabled && <div className="mt-3 flex items-end gap-2">
        <Select label={`Vincular ficha em ${field.label}`} value={links.choice} disabled={links.isLoading || Boolean(links.error) || links.ids.length >= 100}
          onChange={(event) => links.setChoice(event.target.value)}>
          <option value="">{links.isLoading ? "Carregando fichas…" : "Escolha uma ficha"}</option>
          {links.options.map((target) => <option key={target.id} value={target.id}>{target.name} · {codexLabels[target.kind].singular}</option>)}
        </Select>
        <Button variant="outline" className="px-3" aria-label={`Adicionar vínculo em ${field.label}`} disabled={!links.choice || links.ids.length >= 100}
          onClick={links.add}><Plus size={16} aria-hidden="true" /></Button>
      </div>}
      {links.selected.some((item) => !item.entity) && !disabled && !links.isLoading && !links.error
        && <p className="mt-2 text-xs text-muted">Remova vínculos indisponíveis antes de salvar os campos.</p>}
      {links.error && <ErrorState message={links.error} onRetry={() => void links.refresh()} />}
    </div>
  );
}
