"use client";

import { PageContent } from "@/components/shared/PageContent";
import { ErrorState } from "@/components/shared/ErrorState";
import { LoadingRegion } from "@/components/ui/LoadingRegion";
import { LibraryHeader } from "@/components/library/LibraryHeader";
import { UniverseDialog } from "@/components/library/UniverseDialog";
import { MoveSeriesDialog } from "@/components/library/MoveSeriesDialog";
import { MoveBookDialog } from "@/components/library/MoveBookDialog";
import { SeriesDialog } from "@/components/library/SeriesDialog";
import { LibraryContent } from "@/components/library/LibraryContent";
import { LibrarySkeleton } from "@/components/library/LibrarySkeleton";
import { useLibrary } from "@/hooks/useLibrary";
import { LibraryCollections } from "@/components/library/LibraryCollections";
import { LibraryInspector } from "@/components/library/LibraryInspector";
import panels from "@/components/shared/panelWorkspace.module.css";
import styles from "@/components/library/libraryWorkspace.module.css";

export function Main() {
  const lib = useLibrary();
  return (
    <PageContent className={panels.workspace}>
      <div className={panels.header}><LibraryHeader lib={lib} /></div>
      <SeriesDialog manager={lib.seriesManager} />
      <UniverseDialog manager={lib.universeManager} />
      <MoveBookDialog key={lib.move.movingBook?.id ?? "closed"} move={lib.move} collections={lib.collections} />
      <MoveSeriesDialog key={lib.move.movingSeries?.id ?? "no-series"} move={lib.move} collections={lib.collections} />
      <p role="status" className="sr-only">{lib.seriesManager.announcement} {lib.universeManager.announcement} {lib.move.announcement}</p>
      <div className={`${panels.body} ${styles.layout} ${lib.inspector.isOpen ? styles.withInspector : ""}`}>
        <LibraryCollections lib={lib} />
        <div className={panels.catalog} data-library-catalog role="region" aria-label="Acervo da biblioteca" tabIndex={0}>
          {lib.error && <ErrorState message={lib.error} onRetry={lib.retry} />}
          {(!lib.error || lib.books.length > 0 || lib.collections.length > 0) && (
            <LoadingRegion isLoading={lib.isLoading} label="Carregando biblioteca" skeleton={<LibrarySkeleton />}>
              <LibraryContent lib={lib} />
            </LoadingRegion>
          )}
        </div>
        <LibraryInspector lib={lib} />
      </div>
    </PageContent>
  );
}
