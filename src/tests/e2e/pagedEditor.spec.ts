import { paragraph } from "@/tests/fixtures/book";
import { test, expect } from "./fixtures";
import { openPagedEditor, readEditorState, readSavedHtml, replaceHtml, selectEnd } from "./pagedEditor";

test.beforeEach(async ({ page }) => {
  await openPagedEditor(page);
});

test("Enter in an earlier paragraph preserves its page and supports native undo", async ({ page }) => {
  const before = await readEditorState(page);
  expect(before.minHeight).toBeLessThan(100);
  expect(before.font).toBe("Merriweather");
  expect(await page.evaluate(() => [...document.fonts].some(
    (font) => font.status === "loaded" && font.family === "Merriweather",
  ))).toBe(true);

  await page.locator(".editor-content-paged").evaluate((element) => {
    const text = element.querySelector("p")?.firstChild;
    if (!(element instanceof HTMLElement) || !text) throw new Error("The first paragraph is missing");
    element.focus();
    const range = document.createRange();
    range.setStart(text, 15);
    range.collapse(true);
    const selection = getSelection();
    if (!selection) throw new Error("Browser selection is unavailable");
    selection.removeAllRanges();
    selection.addRange(range);
  });
  await page.keyboard.press("Enter");
  await expect.poll(async () => (await readEditorState(page)).paragraphCount).toBe(before.paragraphCount + 1);
  const after = await readEditorState(page);
  expect(after.current).toBe(1);
  expect(after.text.replace(/\u00a0/g, " ")).toBe(before.text.replace(/\u00a0/g, " "));

  await page.keyboard.press("Control+z");
  await expect.poll(async () => (await readEditorState(page)).paragraphCount).toBe(before.paragraphCount);
  await page.locator("#editor-page").selectOption("2");
  await expect(page.locator("#editor-page")).toHaveValue("2");
  expect((await readEditorState(page)).html).toBe(before.html);
});

test("zoom, editing later pages, formatting and view switches preserve the whole chapter", async ({ page }) => {
  const before = await readEditorState(page);
  await page.getByTitle("100% tamanho real").click();
  expect((await readEditorState(page)).total).toBe(before.total);
  await selectEnd(page);
  await page.keyboard.press("Enter");
  await page.keyboard.type("FIM DO CAPITULO");
  await expect.poll(async () => {
    const state = await readEditorState(page);
    return state.current === state.total && state.html.includes("FIM DO CAPITULO");
  }).toBe(true);

  await page.getByTitle("Negrito (Ctrl+B)", { exact: true }).click();
  await page.keyboard.type(" TEXTO EM NEGRITO");
  await expect.poll(() => readSavedHtml(page)).toContain("TEXTO EM NEGRITO");
  const savedHtml = await readSavedHtml(page);
  expect(savedHtml).toContain(paragraph.slice(0, 40));
  expect(savedHtml).toMatch(/<(strong|b)>[^<]*TEXTO EM NEGRITO/);
  expect(savedHtml).not.toContain("data-page-break");

  await page.getByRole("button", { name: "Contínuo", exact: true }).click();
  await expect.poll(() => page.locator(".editor-content").innerHTML()).toBe(savedHtml);
  await page.getByRole("button", { name: "Paginado", exact: true }).click();
  await expect.poll(async () => (await readEditorState(page)).html).toBe(savedHtml);
});

test("deleting, repeated Enter and pasted whitespace do not create redundant blank pages", async ({ page }) => {
  await replaceHtml(page, `<p>${paragraph}</p>`);
  await expect.poll(async () => (await readEditorState(page)).total).toBe(1);
  await selectEnd(page);
  for (let index = 0; index < 100; index++) await page.keyboard.press("Enter");
  await expect.poll(async () => (await readEditorState(page)).total).toBeLessThanOrEqual(2);
  expect((await readEditorState(page)).text).toContain(paragraph.slice(0, 40));

  await replaceHtml(page, `<p>${paragraph}</p>${"<p><br></p>".repeat(100)}<p>Depois das linhas vazias.</p>`);
  await expect.poll(async () => (await readEditorState(page)).total).toBeLessThanOrEqual(3);
  expect((await readEditorState(page)).text).toContain("Depois das linhas vazias.");
  await replaceHtml(page, "<p><br></p>".repeat(100));
  await expect.poll(async () => (await readEditorState(page)).total).toBe(1);

  await replaceHtml(page, `<p>${paragraph}</p>${"<br>".repeat(100)}<p>Depois das quebras.</p>`);
  await expect.poll(async () => (await readEditorState(page)).total).toBeLessThanOrEqual(3);
  expect((await readEditorState(page)).text).toContain("Depois das quebras.");
  await replaceHtml(page, `<p><strong>${paragraph.repeat(18)}</strong><em> TEXTO FINAL</em></p>`);
  await expect.poll(async () => (await readEditorState(page)).total).toBeGreaterThan(1);
  const longParagraph = await readEditorState(page);
  expect(longParagraph.html).toContain("<strong>");
  expect(longParagraph.html).toContain("<em>");
});
