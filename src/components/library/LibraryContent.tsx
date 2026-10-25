import { LibraryResultsBar } from "@/components/library/LibraryResultsBar";
import { LibraryGroups } from "@/components/library/LibraryGroups";
import { LibraryEntryGrid } from "@/components/library/LibraryEntryGrid";
import { LibraryCreateMenu } from "@/components/library/LibraryCreateMenu";
import { LibraryEmpty } from "@/components/library/LibraryEmpty";
import { LibraryFolderEmpty } from "@/components/library/LibraryFolderEmpty";
import { LibraryNoResults } from "@/components/library/LibraryNoResults";
import { SeriesBookGrid } from "@/components/library/SeriesBookGrid";
import { LinkButton } from "@/components/ui/LinkButton";
import type { useLibrary } from "@/hooks/useLibrary";

export function LibraryContent({ lib }: { lib: ReturnType<typeof useLibrary> }) {
  if (lib.scope.kind === "missing") return (
    <div className="rounded-xl border border-border bg-surface p-8 text-center">
      <h2 className="font-display text-2xl">Coleção não encontrada</h2>
      <p className="mt-2 text-sm text-muted">Ela pode ter sido excluída ou movida.</p>
      <LinkButton href="/library" className="mt-5">Voltar à Biblioteca</LinkButton>
    </div>
  );
  const scope = lib.scope;
  return (
    <section aria-label="Seu acervo">
      <LibraryResultsBar lib={lib} />
      {lib.entries.length ? scope.kind === "series" ? (
        <section aria-label={`Série ${scope.collection.name}`}>
          <SeriesBookGrid books={lib.entries.flatMap((entry) => entry.kind === "book" ? [entry.book] : [])}
            allBooks={scope.books} formatMap={lib.formatMap} fontMap={lib.fontMap} view={lib.view}
            disabled={lib.busy} move={lib.move} creation={<LibraryCreateMenu lib={lib} />}
            selectedId={lib.inspector.selectedId}
            onInspect={(book, element) => lib.inspector.select({ kind: "book", book }, element)}
            onReorder={(ids) => { void lib.seriesManager.reorder(scope.collection.id, ids); }} />
        </section>
      ) : <LibraryGroups lib={lib} /> : <div className="flex flex-col gap-6">
        <LibraryEntryGrid entries={[]} lib={lib} includeCreate />
        {lib.isFiltered ? <LibraryNoResults onClearFilters={lib.handleClearFilters} />
          : scope.kind !== "root" ? <LibraryFolderEmpty kind={scope.kind} /> : <LibraryEmpty />}
      </div>}
    </section>
  );
}
