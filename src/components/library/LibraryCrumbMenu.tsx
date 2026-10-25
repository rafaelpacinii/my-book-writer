import Link from "next/link";
import { Layers, Orbit } from "lucide-react";
import { collectionHref } from "@/utils/libraryExplorer";
import type { LibraryExplorerCrumb } from "@/utils/libraryBreadcrumbs";
import type { useLibrary } from "@/hooks/useLibrary";
import styles from "@/components/library/libraryWorkspace.module.css";

export function LibraryCrumbMenu({ crumb, lib, onClose }: {
  crumb: LibraryExplorerCrumb;
  lib: ReturnType<typeof useLibrary>;
  onClose: () => void;
}) {
  return (
    <div role="region" aria-label={crumb.menuRegionLabel} className={styles.crumbMenu}>
      {crumb.items.length === 0 ? (
        <p className="px-2.5 py-2 text-xs text-muted">{crumb.menuEmptyText}</p>
      ) : (
        <ul>
          {crumb.items.map((item) => {
            const Icon = item.kind === "universe" ? Orbit : Layers;
            const target = { ...item, direct: true };
            const active = lib.scope.kind === item.kind && lib.scope.collection.id === item.collection.id;
            const canDrop = Boolean(lib.move.dragging && lib.move.canMove(lib.move.dragging, target));
            return (
              <li key={`${item.kind}-${item.collection.id}`}>
                <Link href={collectionHref(item)}
                  aria-current={active ? "page" : undefined}
                  data-drop-ready={canDrop}
                  data-drop-active={lib.move.overId === item.collection.id}
                  onClick={() => { onClose(); lib.handleClearFilters(); }}
                  onDragOver={(event) => lib.move.over(event, target)}
                  onDrop={(event) => { onClose(); lib.move.drop(event, target); }}
                  onDragLeave={lib.move.leave}>
                  <Icon size={14} aria-hidden="true" />
                  <span>{item.collection.name}</span>
                  <small>{item.kind === "universe" ? "Universo" : "Série"}</small>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

