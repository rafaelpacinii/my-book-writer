import { test as base, expect } from "@playwright/test";
import { book, chapter } from "@/tests/fixtures/book";

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(({ book, chapter }) => {
      if (!localStorage.getItem("my_book_writer_books")) {
        localStorage.setItem("my_book_writer_books", JSON.stringify([book]));
      }
      if (!localStorage.getItem("my_book_writer_chapters")) {
        localStorage.setItem("my_book_writer_chapters", JSON.stringify([chapter]));
      }
    }, { book, chapter });

    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await use(page);
    expect(errors, "the application must not throw browser errors").toEqual([]);
  },
});

export { expect };
