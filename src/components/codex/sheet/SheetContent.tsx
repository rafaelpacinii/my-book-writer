import { Archive } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Gallery } from "@/components/codex/sheet/Gallery";
import { IdentityForm } from "@/components/codex/sheet/IdentityForm";
import { SheetFields } from "@/components/codex/sheet/SheetFields";
import styles from "@/components/codex/codexWorkspace.module.css";
import { codexLabels } from "@/utils/codexHub";
import type { CodexScopeInput, CodexSheet } from "@/types/codex";

export function SheetContent({ sheet, scope, archived }: {
  sheet: CodexSheet; scope: CodexScopeInput; archived: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={sheet.entity.name} eyebrow={`Ficha de ${codexLabels[sheet.entity.kind].singular.toLocaleLowerCase("pt-BR")}`}
        description={[sheet.entity.role, sheet.entity.archetype, sheet.entity.status].filter(Boolean).join(" · ")
          || "Identidade, referências e detalhes da sua história."} />
      {archived && <p className="flex items-center gap-2 rounded-lg bg-surface-hover p-3 text-sm text-muted">
        <Archive size={16} aria-hidden="true" />Códice arquivado. Esta ficha está disponível apenas para consulta.
      </p>}
      <div className={styles.sheetColumns}>
        <div className="flex min-w-0 flex-col gap-6">
          <Gallery sheet={sheet} scope={scope} archived={archived} />
          <IdentityForm scope={scope} entity={sheet.entity} archived={archived} />
        </div>
        <SheetFields sheet={sheet} scope={scope} archived={archived} />
      </div>
    </div>
  );
}
