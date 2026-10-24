import Link from "next/link";
import { Layers, Orbit } from "lucide-react";
import { CollectionCover } from "@/components/library/CollectionCover";
import { CollectionActions } from "@/components/library/CollectionActions";
import { collectionHref } from "@/utils/libraryExplorer";
import type { LibraryCollection } from "@/types/library";
import type { useLibrary } from "@/hooks/useLibrary";

export function CollectionCard({ entry, lib }: { entry: LibraryCollection; lib: ReturnType<typeof useLibrary> }) {
  const { collection, books, kind } = entry;
  const label = kind === "series" ? "Série" : "Universo";
  const Icon = kind === "series" ? Layers : Orbit;
  return (
    <article className="book-card collection-card relative min-w-0" data-collection-id={collection.id}
      data-collection-kind={kind} draggable={kind === "series" && !lib.busy}
      onDragStart={(event) => kind === "series" ? lib.move.start(event, collection.id, "series") : event.preventDefault()}
      onDragEnd={lib.move.end} data-drop-active={lib.move.overId === collection.id}
      onDragOver={(event) => lib.move.over(event, entry)}
      onDrop={(event) => lib.move.drop(event, entry)}
      onDragLeave={(event) => {
        const next = event.relatedTarget;
        if (!(next instanceof Node) || !event.currentTarget.contains(next)) lib.move.leave();
      }}>
      <CollectionCover books={books} kind={kind} />
      <CollectionActions entry={entry} disabled={lib.busy} onOpen={lib.handleClearFilters}
        onMove={entry.kind === "series" ? () => lib.move.openSeries(entry.collection) : undefined}
        onEdit={() => lib.editCollection(entry)} onDelete={() => lib.deleteCollection(entry)} />
      <div className="book-info min-w-0 px-px pt-[15px]">
        <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted">
          <Icon aria-hidden="true" className="h-3.5 w-3.5" />{label}
        </span>
        <h2 className="font-display text-[23px] leading-[1.12]">
          <Link href={collectionHref(entry)} onClick={lib.handleClearFilters} draggable={false}
            aria-label={`Abrir ${label.toLowerCase()} ${collection.name}`}
            className="line-clamp-2 wrap-anywhere hover:text-primary after:absolute after:inset-0 after:rounded-md after:content-['']">
            {collection.name}
          </Link>
        </h2>
        <p className="mt-1.5 line-clamp-2 text-xs text-muted">{collection.description || (books.length ? "Abra para explorar os livros." : "Arraste livros para adicionar.")}</p>
        <div className="book-metadata mt-3 border-t border-border pt-2.5 text-xs text-muted">
          <span>{books.length} {books.length === 1 ? "livro" : "livros"}</span>
        </div>
      </div>
    </article>
  );
}
