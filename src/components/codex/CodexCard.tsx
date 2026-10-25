import { MapPin, Sparkles, UserRound } from "lucide-react";
import Link from "next/link";
import { CodexImageView } from "@/components/codex/CodexImageView";
import { codexLabels, codexSheetHref } from "@/utils/codexHub";
import type { CodexEntity, CodexScopeInput } from "@/types/codex";

const icons = { character: UserRound, location: MapPin, lore: Sparkles };
export function CodexCard({ entity, scope }: { entity: CodexEntity; scope: CodexScopeInput }) {
  const Icon = icons[entity.kind];
  return (
    <article data-codex-id={entity.id} className="workspace-card group min-w-0 overflow-hidden">
      <Link href={codexSheetHref(scope, entity.id)} aria-label={`Ver ficha de ${entity.name}`}
        className="flex h-full w-full flex-col text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary">
        <div className="relative flex aspect-[4/3] w-full items-center justify-center border-b border-border bg-surface-hover text-muted">
          {entity.primary_image_id ? <CodexImageView scope={scope} entity={entity.id} image={entity.primary_image_id} alt={`Imagem principal de ${entity.name}`} />
            : <Icon aria-hidden="true" size={56} strokeWidth={1} />}
          <span className="absolute bottom-3 left-4 rounded-md bg-surface px-2 py-1 text-xs font-semibold text-foreground">
            {codexLabels[entity.kind].singular}
          </span>
        </div>
        <div className="flex w-full flex-1 flex-col gap-2 px-5 pt-[18px] pb-4">
          <h2 className="line-clamp-2 break-words font-display text-[25px] leading-[1.12] text-foreground">{entity.name}</h2>
          <p className="line-clamp-2 text-xs leading-relaxed text-muted">{entity.role || entity.summary || "Uma nova peça da sua história."}</p>
          {entity.status && <span className="mt-auto pt-2 text-xs font-semibold text-primary">{entity.status}</span>}
        </div>
      </Link>
    </article>
  );
}
