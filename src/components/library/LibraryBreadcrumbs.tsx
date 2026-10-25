"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Layers, Library, MoveRight, Orbit } from "lucide-react";
import { LibraryCrumbMenu } from "@/components/library/LibraryCrumbMenu";
import { libraryExplorerCrumbs } from "@/utils/libraryBreadcrumbs";
import type { useLibrary } from "@/hooks/useLibrary";
import styles from "@/components/library/libraryWorkspace.module.css";

export function LibraryBreadcrumbs({ lib }: { lib: ReturnType<typeof useLibrary> }) {
  const navRef = useRef<HTMLElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const crumbs = libraryExplorerCrumbs(lib.scope, lib.collections);

  useEffect(() => {
    if (!openId) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest?.('[draggable="true"]') && navRef.current && !navRef.current.contains(target)) setOpenId(null);
    };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpenId(null); };
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("pointerdown", onPointer); window.removeEventListener("keydown", onKey); };
  }, [openId]);

  return (
    <nav ref={navRef} aria-label="Caminho do acervo" className={styles.crumbsNav} data-dragging={Boolean(lib.move.dragging)}>
      <ol className={styles.crumbsList}>
        {crumbs.map((crumb, index) => {
          const Icon = crumb.kind === "root" ? Library : crumb.kind === "universe" ? Orbit : Layers;
          const canDrop = Boolean(lib.move.dragging && lib.move.canMove(lib.move.dragging, crumb.target));
          return (
            <li key={crumb.id} className={styles.crumbItem}>
              {index > 0 && <ChevronRight size={13} className={styles.crumbDivider} aria-hidden="true" />}
              <div className={styles.crumbSegment} data-drop-ready={canDrop} data-drop-active={lib.move.overId === crumb.id}
                onDragOver={(event) => lib.move.over(event, crumb.target)}
                onDrop={(event) => { setOpenId(null); lib.move.drop(event, crumb.target); }} onDragLeave={lib.move.leave}>
                <Link href={crumb.href} onClick={() => { setOpenId(null); lib.handleClearFilters(); }}
                  aria-current={crumb.current ? "page" : undefined} className={styles.crumbLink}
                  title={`Abrir ${crumb.label} ou soltar livros/séries aqui para mover`}>
                  <Icon size={13} aria-hidden="true" /><span>{crumb.label}</span>
                </Link>
                {crumb.menuLabel && (
                  <button type="button" className={styles.crumbToggle} aria-label={crumb.menuLabel}
                    aria-expanded={openId === crumb.id} onClick={() => setOpenId(openId === crumb.id ? null : crumb.id)}
                    onDragEnter={() => { if (lib.move.dragging) setOpenId(crumb.id); }}>
                    <ChevronDown size={12} aria-hidden="true" />
                  </button>
                )}
              </div>
              {crumb.menuLabel && openId === crumb.id && <LibraryCrumbMenu crumb={crumb} lib={lib} onClose={() => setOpenId(null)} />}
            </li>
          );
        })}
      </ol>
      <span className={styles.crumbHint} aria-hidden="true"><MoveRight size={12} />Solte itens aqui para mover</span>
    </nav>
  );
}
