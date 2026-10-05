import { test as base, expect } from "@playwright/test";
import { book, chapter } from "@/tests/fixtures/book";

export const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    await page.addInitScript(({ book, chapter }) => {
      if (!localStorage.getItem("my_book_writer_books")) {
        localStorage.setItem("my_book_writer_books", JSON.stringify([book]));
      }
      if (!localStorage.getItem("my_book_writer_chapters")) {
        localStorage.setItem("my_book_writer_chapters", JSON.stringify([chapter]));
      }
    }, { book, chapter });

    // Next's development asset prefix is fixed to port 3000.
    if (baseURL && baseURL !== "http://localhost:3000") {
      await page.route("http://localhost:3000/**", async (route) => {
        const response = await route.fetch({
          url: route.request().url().replace("http://localhost:3000", baseURL),
        });
        await route.fulfill({
          response,
          headers: { ...response.headers(), "access-control-allow-origin": "*" },
        });
      });
    }

    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await use(page);
    expect(errors, "the application must not throw browser errors").toEqual([]);
  },
});

export { expect };
