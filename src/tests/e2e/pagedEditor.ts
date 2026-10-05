import type { Page } from "@playwright/test";
import type { Book } from "@/types/book";
import type { Chapter } from "@/types/chapter";
import { book, chapter } from "@/tests/fixtures/book";
import { expect } from "./fixtures";

export const editorURL = `/books/editor?bookId=${book.id}&chapterId=${chapter.id}`;
export const settingsURL = `/books/settings?bookId=${book.id}`;

export async function openPagedEditor(page: Page) {
  await page.goto(editorURL);
  await page.getByRole("button", { name: "Paginado", exact: true }).click();
  await expect(page.locator("[data-paged-flow]")).toBeVisible();
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await expect.poll(async () => (await readEditorState(page)).total).toBeGreaterThan(1);
}

export function readEditorState(page: Page) {
  return page.evaluate(() => {
    const content = document.querySelector<HTMLElement>(".editor-content-paged");
    const navigation = document.querySelector<HTMLSelectElement>("#editor-page");
    if (!content || !navigation) throw new Error("The paginated editor is missing");
    const style = getComputedStyle(content);
    return {
      current: Number(navigation.value), total: navigation.options.length,
      paragraphCount: content.querySelectorAll("p").length,
      html: content.innerHTML, text: content.textContent ?? "",
      font: style.fontFamily, minHeight: parseFloat(style.minHeight),
    };
  });
}

export async function selectEnd(page: Page) {
  await page.locator(".editor-content-paged").evaluate((element) => {
    if (!(element instanceof HTMLElement)) throw new Error("The editor is not an HTML element");
    element.focus();
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    const selection = getSelection();
    if (!selection) throw new Error("Browser selection is unavailable");
    selection.removeAllRanges();
    selection.addRange(range);
  });
}

export async function replaceHtml(page: Page, html: string) {
  await page.locator(".editor-content-paged").evaluate((element, html) => {
    if (!(element instanceof HTMLElement)) throw new Error("The editor is not an HTML element");
    element.focus();
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = getSelection();
    if (!selection) throw new Error("Browser selection is unavailable");
    selection.removeAllRanges();
    selection.addRange(range);
    if (!document.execCommand("insertHTML", false, html)) throw new Error("Unable to replace editor content");
  }, html);
}

export function readSavedBook(page: Page): Promise<Book> {
  return page.evaluate(() => {
    const stored = localStorage.getItem("my_book_writer_books");
    if (!stored) throw new Error("No book was saved");
    const books: Book[] = JSON.parse(stored);
    return books[0];
  });
}

export function readSavedHtml(page: Page): Promise<string> {
  return page.evaluate(() => {
    const stored = localStorage.getItem("my_book_writer_chapters");
    if (!stored) throw new Error("No chapter was saved");
    const chapters: Chapter[] = JSON.parse(stored);
    const content: { html: string } = JSON.parse(chapters[0].content_json);
    return content.html;
  });
}

export async function expectVisibleCaret(page: Page) {
  const caret = page.locator("[data-paged-caret]");
  await expect(caret).toBeVisible();
  await expect(caret).toHaveCSS("opacity", "1");
  await expect.poll(() => page.evaluate(() => {
    const caret = document.querySelector<HTMLElement>("[data-paged-caret]");
    const paper = document.querySelector<HTMLElement>("[data-paged-paper]");
    const selection = getSelection();
    if (!caret || !paper || !selection?.rangeCount) return false;
    const rect = caret.getBoundingClientRect();
    const sheet = paper.getBoundingClientRect();
    const range = selection.getRangeAt(0);
    const native = range.getClientRects()[0];
    const node = selection.focusNode;
    const element = node instanceof Element ? node : node?.parentElement;
    const line = native ?? element?.getBoundingClientRect();
    return document.activeElement === document.querySelector(".editor-content-paged")
      && selection.isCollapsed && Boolean(line)
      && rect.width >= 0.9 && rect.height > 5
      && rect.left >= sheet.left && rect.right <= sheet.right
      && rect.top >= sheet.top && rect.bottom <= sheet.bottom
      && rect.left >= 0 && rect.right <= window.innerWidth
      && rect.top >= 0 && rect.bottom <= window.innerHeight
      && Math.abs(rect.left - (line?.left ?? 0)) < 2
      && rect.top >= (line?.top ?? 0) - 1 && rect.bottom <= (line?.bottom ?? 0) + 1
      && getComputedStyle(caret).backgroundColor !== "rgba(0, 0, 0, 0)";
  })).toBe(true);
}
