import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { LoadingRegion } from "@/components/ui/LoadingRegion";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/shared/ErrorState";
import { useCodexSheet } from "@/hooks/useCodex";
import { codexLabels } from "@/utils/codexHub";
import type { CodexScopeInput } from "@/types/codex";

export function CodexPreview({ scope, id, onClose }: { scope: CodexScopeInput; id: string; onClose: () => void }) {
  const data = useCodexSheet(scope, id);
  const sheet = data.sheet;
  return (
    <Modal isOpen onClose={onClose} title={sheet?.entity.name ?? "Resumo da ficha"}
      footer={<Button variant="outline" onClick={onClose}>Fechar</Button>}>
      {data.error ? <ErrorState message={data.error} onRetry={() => void data.refresh()} /> : (
        <LoadingRegion isLoading={data.isLoading} label="Carregando ficha" skeleton={<Skeleton className="h-48" />}>
          {sheet && (
            <div className="flex flex-col gap-5">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">{codexLabels[sheet.entity.kind].singular}</p>
              {sheet.entity.summary && <p className="whitespace-pre-wrap break-words text-sm text-foreground">{sheet.entity.summary}</p>}
              <dl className="grid grid-cols-2 gap-4 text-sm">
                {[["Papel", sheet.entity.role], ["Status", sheet.entity.status], ["Arquétipo", sheet.entity.archetype]].map(([label, value]) => value && (
                  <div key={label}><dt className="text-xs text-muted">{label}</dt><dd className="break-words font-medium text-foreground">{value}</dd></div>
                ))}
              </dl>
              <div>
                <h3 className="mb-3 text-sm font-bold text-foreground">Estrutura da ficha</h3>
                <ul className="space-y-3">
                  {sheet.categories.map((category) => (
                    <li key={category.id} className="rounded-lg border border-border p-3">
                      <p className="break-words text-sm font-semibold text-foreground">{category.name}</p>
                      <p className="mt-1 text-xs text-muted">{sheet.fields.filter((field) => field.category_id === category.id).length} campos</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </LoadingRegion>
      )}
    </Modal>
  );
}
