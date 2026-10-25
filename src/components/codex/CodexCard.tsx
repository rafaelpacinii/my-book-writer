import { MapPin, Sparkles, UserRound } from "lucide-react";
import Link from "next/link";
import { CodexImageView } from "@/components/codex/CodexImageView";
import { codexLabels, codexSheetHref } from "@/utils/codexHub";
import type { CodexEntity, CodexScopeInput } from "@/types/codex";
import styles from "@/components/codex/codexWorkspace.module.css";

const icons = { character: UserRound, location: MapPin, lore: Sparkles };
export function CodexCard({ entity, scope, selected = false }: { entity: CodexEntity; scope: CodexScopeInput; selected?: boolean }) {
  const Icon = icons[entity.kind];
  return (
    <article data-codex-id={entity.id}>
      <Link href={codexSheetHref(scope, entity.id, entity.kind)} aria-label={`Ver ficha de ${entity.name}`}
        aria-current={selected ? "page" : undefined} className={styles.entry} scroll={false}>
        <div className={styles.portrait}>
          {entity.primary_image_id ? <CodexImageView scope={scope} entity={entity.id} image={entity.primary_image_id} alt={`Imagem principal de ${entity.name}`} />
            : <Icon aria-hidden="true" size={24} strokeWidth={1.5} />}
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="line-clamp-2 break-words text-sm font-semibold text-foreground">{entity.name}</span>
          <span className="line-clamp-2 break-words text-xs leading-relaxed text-muted">
            {entity.role || entity.summary || codexLabels[entity.kind].singular}
          </span>
          {entity.status && <span className="truncate text-[11px] text-muted">{entity.status}</span>}
        </div>
      </Link>
    </article>
  );
}
