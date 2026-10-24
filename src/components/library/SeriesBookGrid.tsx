import { ArrowLeft, ArrowRight, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BookCard } from "@/components/library/BookCard";
import { useSeriesBookOrder } from "@/hooks/useSeriesBookOrder";
import type { LibraryMove } from "@/hooks/useLibraryMove";
import type { Book } from "@/types/book";

interface Props {
  books: Book[];
  allBooks: Book[];
  formatMap: Map<string, string>;
  fontMap: Map<string, string>;
  view: "grid" | "list";
  disabled: boolean;
  move: LibraryMove;
  onReorder: (ids: string[]) => void;
}

export function SeriesBookGrid({ books, allBooks, formatMap, fontMap, view, disabled, onReorder, move }: Props) {
  const order = useSeriesBookOrder(allBooks, onReorder, disabled);
  return (
    <div className={view === "grid" ? "book-grid" : "book-list"} aria-busy={disabled}>
      {books.map((book, index) => {
        const position = allBooks.findIndex((item) => item.id === book.id);
        return (
          <div key={book.id} data-series-book={book.id}
            className={`min-w-0 rounded-lg ${order.overId === book.id ? "outline-2 outline-primary" : ""}`}
            onDragOver={(event) => order.over(event, book.id)}
            onDrop={(event) => order.drop(event, book.id)}>
            <BookCard book={book} index={index}
              formatName={formatMap.get(book.format_id)} fontName={fontMap.get(book.font_preset_id)}
              onMove={() => move.open(book)} disabled={disabled}
              onDragStart={(event) => move.start(event, book.id)} onDragEnd={move.end} />
            <div className="flex items-center justify-end gap-1 py-2" aria-label={`Ordem de ${book.title}`}>
              <Button type="button" variant="ghost" draggable={!disabled} disabled={disabled}
                onDragStart={(event) => order.start(event, book.id)} onDragEnd={order.end}
                aria-label={`Arrastar ${book.title}`} className="cursor-grab !px-2">
                <GripVertical aria-hidden="true" className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" disabled={disabled || position === 0}
                onClick={() => order.move(book.id, allBooks[position - 1].id)}
                aria-label={`Antecipar ${book.title}`} className="!px-2">
                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" disabled={disabled || position === allBooks.length - 1}
                onClick={() => order.move(book.id, allBooks[position + 1].id)}
                aria-label={`Adiar ${book.title}`} className="!px-2">
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
