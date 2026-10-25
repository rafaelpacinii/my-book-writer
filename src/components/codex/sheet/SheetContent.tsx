import { Archive, ArrowLeft } from "lucide-react";
import { LinkButton } from "@/components/ui/LinkButton";
import { Gallery } from "@/components/codex/sheet/Gallery";
import { IdentityForm } from "@/components/codex/sheet/IdentityForm";
import { SheetFields } from "@/components/codex/sheet/SheetFields";
import { SheetEditingProvider } from "@/components/codex/sheet/SheetEditingProvider";
import { codexHref, codexLabels } from "@/utils/codexHub";
import type { CodexScopeInput, CodexSheet } from "@/types/codex";

export function SheetContent({ sheet, scope, archived, contextName }: {
  sheet: CodexSheet; scope: CodexScopeInput; archived: boolean; contextName: string;
}) {
  const back = codexHref({ kind: scope.book_id ? "book" : "universe", id: scope.book_id ?? scope.universe_id! }, sheet.entity.kind);
  return (
    <SheetEditingProvider backHref={back}><div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="mb-2 break-words text-xs font-bold uppercase tracking-widest text-primary">{contextName} / {codexLabels[sheet.entity.kind].singular}</p>
          <h1 className="break-words text-3xl font-bold text-foreground">{sheet.entity.name}</h1>
        </div>
        <LinkButton href={back} variant="outline"><ArrowLeft size={16} aria-hidden="true" />Voltar ao Códice</LinkButton>
      </header>
      {archived && <p className="flex items-center gap-2 rounded-lg bg-surface-hover p-3 text-sm text-muted">
        <Archive size={16} aria-hidden="true" />Códice arquivado. Esta ficha está disponível apenas para consulta.
      </p>}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <Gallery sheet={sheet} scope={scope} archived={archived} />
          <IdentityForm scope={scope} entity={sheet.entity} archived={archived} />
        </div>
        <SheetFields sheet={sheet} scope={scope} archived={archived} />
      </div>
    </div></SheetEditingProvider>
  );
}
