import { CollectionCard } from "@/components/library/CollectionCard";
import { BookCard } from "@/components/library/BookCard";
import type { LibraryEntry } from "@/types/library";
import type { useLibrary } from "@/hooks/useLibrary";

export function LibraryEntryGrid({ entries, lib }: { entries: LibraryEntry[]; lib: ReturnType<typeof useLibrary> }) {
  return (
    <div className={lib.view === "grid" ? "book-grid" : "book-list"}>
      {entries.map((entry, index) => entry.kind === "book" ? (
        <BookCard key={`book:${entry.book.id}`} book={entry.book} index={index}
          formatName={lib.formatMap.get(entry.book.format_id)} fontName={lib.fontMap.get(entry.book.font_preset_id)}
          onDragStart={(event) => lib.move.start(event, entry.book.id)} onDragEnd={lib.move.end}
          onMove={() => lib.move.open(entry.book)} disabled={lib.busy} />
      ) : <CollectionCard key={`${entry.kind}:${entry.collection.id}`} entry={entry} lib={lib} />)}
    </div>
  );
}
