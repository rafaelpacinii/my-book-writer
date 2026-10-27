import Link from "next/link";
import { ArrowUpRight, MapPin, Sparkles, UserRound } from "lucide-react";
import { CodexImageView } from "@/components/codex/CodexImageView";
import { codexLabels, codexSheetHref } from "@/utils/codexHub";
import type { CodexEntity, CodexScopeInput } from "@/types/codex";
import styles from "@/components/codex/codexCatalog.module.css";

const icons = { character: UserRound, location: MapPin, lore: Sparkles };

export function CodexCatalogCard({ entity, scope }: { entity: CodexEntity; scope: CodexScopeInput }) {
  const Icon = icons[entity.kind];
  return (
    <article data-codex-id={entity.id} className={styles.card}>
      <Link href={codexSheetHref(scope, entity.id, entity.kind)} aria-label={`Ver ficha de ${entity.name}`}
        className={styles.cardLink} scroll={false}>
        <div className={styles.artwork} data-kind={entity.kind} data-image={Boolean(entity.primary_image_id)}>
          {entity.primary_image_id ? <CodexImageView scope={scope} entity={entity.id} image={entity.primary_image_id}
            alt={`Imagem principal de ${entity.name}`} /> : <>
            <Icon size={28} strokeWidth={1.25} aria-hidden="true" />
            <span className={styles.monogram} aria-hidden="true">{entity.name.trim().slice(0, 1)}</span>
            <span className={styles.type}>{codexLabels[entity.kind].singular}</span>
          </>}
        </div>
        <div className={styles.description}>
          <div className={styles.cardTitle}><h2>{entity.name}</h2><ArrowUpRight size={16} aria-hidden="true" /></div>
          <p className={styles.role}>{entity.role || entity.archetype || codexLabels[entity.kind].singular}</p>
          <p className={styles.summary}>{entity.summary || "Uma história a desenvolver."}</p>
          {entity.status && <span className={styles.status}>{entity.status}</span>}
        </div>
      </Link>
    </article>
  );
}
