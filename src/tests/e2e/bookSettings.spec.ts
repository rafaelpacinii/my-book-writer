import type { Book } from "@/types/book";
import { test, expect } from "./fixtures";
import { editorURL, readSavedBook, settingsURL } from "./pagedEditor";

test("cm/in settings update physical format, margins, font and font size", async ({ page }) => {
  await page.goto(settingsURL);
  await page.getByLabel("Unidade de medida").selectOption("in");
  await expect(page.getByLabel("Superior (in)", { exact: true })).toHaveValue("0.7874");
  await page.getByLabel("Superior (in)", { exact: true }).fill("1.25");
  await page.getByLabel("Unidade de medida").selectOption("cm");
  await expect(page.getByLabel("Superior (cm)", { exact: true })).toHaveValue("3.175");
  await page.getByLabel("Unidade de medida").selectOption("in");
  await page.getByLabel("Formato", { exact: true }).selectOption("fmt-us-trade-6x9");
  await page.getByLabel("Fonte", { exact: true }).selectOption("font-inter");
  await page.getByLabel("Tamanho da fonte (pt)", { exact: true }).fill("16");
  await page.getByRole("button", { name: "Salvar alterações", exact: true }).click();
  await page.waitForURL("**/books/view?**");
  const updatedBook = await readSavedBook(page);
  expect(updatedBook.margin_top_um).toBe(31750);
  expect(updatedBook.font_preset_id).toBe("font-inter");

  await page.goto(editorURL);
  await page.getByRole("button", { name: "Paginado", exact: true }).click();
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await expect(page.locator("[data-paged-paper]")).toHaveCSS("width", "576px");
  await expect(page.locator("[data-paged-paper]")).toHaveCSS("height", "864px");
  await expect(page.locator(".editor-content-paged")).toHaveCSS("font-family", "Inter");
  const fontSize = await page.locator(".editor-content-paged").evaluate(
    (element) => {
      if (!(element instanceof HTMLElement)) throw new Error("The editor is not an HTML element");
      return {
        declared: parseFloat(element.style.fontSize),
        rendered: parseFloat(getComputedStyle(element).fontSize),
      };
    },
  );
  expect(fontSize.declared).toBeCloseTo(16 * 96 / 72, 3);
  // Engines round computed styles to their own subpixel grid.
  expect(Math.abs(fontSize.rendered - fontSize.declared)).toBeLessThan(0.02);
  await expect(page.locator("main > p")).toContainText("6 × 9 in");
});

test("decimal input, selected units and precise margins survive unrelated saves", async ({ page }) => {
  await page.goto(settingsURL);
  await page.getByLabel("Unidade de medida").selectOption("in");
  const topMargin = page.getByLabel("Superior (in)", { exact: true });
  await topMargin.fill("");
  await topMargin.pressSequentially("1.25");
  await expect(topMargin).toHaveValue("1.25");
  await page.evaluate(() => {
    const stored = localStorage.getItem("my_book_writer_books");
    if (!stored) throw new Error("No book was saved");
    const books: Book[] = JSON.parse(stored);
    books[0].margin_bottom_um = 20321;
    localStorage.setItem("my_book_writer_books", JSON.stringify(books));
  });
  await page.reload();
  await expect(page.getByLabel("Unidade de medida")).toHaveValue("in");
  await page.getByLabel("Título do livro", { exact: true }).fill("Livro com margem precisa");
  await page.getByRole("button", { name: "Salvar alterações", exact: true }).click();
  await page.waitForURL("**/books/view?**");
  expect((await readSavedBook(page)).margin_bottom_um).toBe(20321);
});
