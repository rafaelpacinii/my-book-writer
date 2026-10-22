import type { Book } from "@/types/book";
import { bookCoverVariant } from "@/utils/bookCover";
import { BookCoverArt } from "@/components/shared/BookCoverArt";
import { BookCoverImage } from "@/components/shared/BookCoverImage";

type CoverBook = Pick<Book, "id" | "title" | "author_name" | "card_image_asset_id">;

export function BookObject({ book }: { book: CoverBook }) {
  const variant = bookCoverVariant(book.id);
  const artwork = (
    <div className="absolute inset-0 flex flex-col px-[12%] pb-[9%] pt-[13%]" aria-hidden="true">
      <span className="book-cover-title">{book.title}</span>
      <BookCoverArt variant={variant} />
      <span className="book-cover-author">{book.author_name || "Autor"}</span>
    </div>
  );

  return (
    <div className="book-object" data-cover={variant}>
      {book.card_image_asset_id ? (
        <BookCoverImage key={book.card_image_asset_id} bookId={book.id}
          assetId={book.card_image_asset_id} title={book.title} fallback={artwork} compact
        />
      ) : artwork}
    </div>
  );
}
