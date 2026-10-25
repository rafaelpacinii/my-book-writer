import type { Page } from "@playwright/test";
import { book, chapter } from "@/tests/fixtures/book";
import type { Universe } from "@/types/universe";
import type { Book } from "@/types/book";

export const world: Universe = { id: "world", name: "Aurora", description: "Um mundo compartilhado",
  profile_id: book.profile_id, position: 0, created_at: book.created_at, updated_at: book.updated_at, deleted_at: null };
export const saga = { ...world, id: "saga", name: "Saga Aurora", universe_id: world.id };
export const independent = { ...saga, id: "independent", name: "Série independente", universe_id: null };
export const books: Book[] = [1, 2].map((number) => ({ ...book, id: `v${number}`, title: `Volume ${number}`,
  series_id: saga.id, universe_id: world.id, series_volume: number }));
books.push({ ...book, id: "direct", title: "Atlas", series_id: null, universe_id: world.id, series_volume: null },
  { ...book, id: "free", title: "Avulso", series_id: null, universe_id: null, series_volume: null });

export async function seedUniverses(page: Page) {
  await page.addInitScript(({ world, saga, independent, books, chapter }) => {
    if (sessionStorage.getItem("universes-seeded")) return;
    sessionStorage.setItem("universes-seeded", "yes");
    localStorage.setItem("my_book_writer_universes", JSON.stringify([world]));
    localStorage.setItem("my_book_writer_series", JSON.stringify([saga, independent]));
    localStorage.setItem("my_book_writer_books", JSON.stringify(books));
    localStorage.setItem("my_book_writer_chapters", JSON.stringify([{ ...chapter, book_id: books[0].id }]));
  }, { world, saga, independent, books, chapter });
}
