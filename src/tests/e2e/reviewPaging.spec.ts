import { test, expect } from "@/tests/e2e/fixtures";
import { chapter } from "@/tests/fixtures/book";
import { editorURL, readEditorState } from "@/tests/e2e/pagedEditor";

test("a review excerpt selects its actual page without changing the paginated manuscript", async ({ page }) => {
  await page.addInitScript((chapter) => {
    const doc = JSON.parse(chapter.content_json);
    doc.html += "<p>Esta passagem única recebe uma anotação na última página.</p>";
    localStorage.setItem("my_book_writer_chapters", JSON.stringify([{ ...chapter, content_json: JSON.stringify(doc) }]));
    localStorage.setItem("mbw_editor_preferences", JSON.stringify({ autosaveEnabled: false }));
  }, chapter);
  await page.goto(editorURL);
  const content = page.locator(".editor-content");
  await content.locator("p").last().scrollIntoViewIfNeeded();
  await content.evaluate((element) => {
    const range = document.createRange(); range.selectNodeContents(element.lastElementChild!);
    const selection = getSelection()!; selection.removeAllRanges(); selection.addRange(range);
    document.dispatchEvent(new Event("selectionchange"));
  });
  await page.getByTitle("Comentar trecho selecionado", { exact: true }).click();
  const panel = page.getByRole("complementary", { name: "Revisão do capítulo", exact: true });
  await panel.getByLabel("Novo comentário", { exact: true }).fill("Rever o encerramento");
  await panel.getByRole("button", { name: "Comentar", exact: true }).click();
  await expect(panel.getByText("Rever o encerramento", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Paginado", exact: true }).click();
  await expect.poll(async () => (await readEditorState(page)).total).toBeGreaterThan(1);
  const before = (await readEditorState(page)).html;
  await panel.getByTitle("Clique para ir até este trecho no texto", { exact: true }).click();
  await expect.poll(async () => {
    const state = await readEditorState(page); return state.current === state.total;
  }).toBe(true);
  await expect(page.locator("[data-review-highlight] > div").first()).toBeInViewport();
  expect((await readEditorState(page)).html).toBe(before);
});

test("a selection spanning formatted nodes is captured and located as one excerpt", async ({ page }) => {
  await page.addInitScript((chapter) => {
    localStorage.setItem("my_book_writer_chapters", JSON.stringify([{ ...chapter,
      content_json: JSON.stringify({ html: "<p>Texto <strong>em negrito</strong> e <em>em itálico</em> para revisar.</p>" }) }]));
  }, chapter);
  await page.goto(editorURL);
  const content = page.locator(".editor-content");
  await expect(content).toBeVisible();
  await content.evaluate((element) => {
    const range = document.createRange(); range.selectNodeContents(element.firstElementChild!);
    const selection = getSelection()!; selection.removeAllRanges(); selection.addRange(range);
    document.dispatchEvent(new Event("selectionchange"));
  });
  await page.getByTitle("Comentar trecho selecionado", { exact: true }).click();
  const panel = page.getByRole("complementary", { name: "Revisão do capítulo", exact: true });
  await panel.getByLabel("Novo comentário", { exact: true }).fill("Revisar a frase formatada");
  await panel.getByRole("button", { name: "Comentar", exact: true }).click();
  await expect(panel.getByText("Revisar a frase formatada", { exact: true })).toBeVisible();
  const before = await content.innerHTML();
  await panel.getByTitle("Clique para ir até este trecho no texto", { exact: true }).click();
  await expect(page.locator("[data-review-highlight]")).toBeAttached();
  expect(await content.innerHTML()).toBe(before);
  await expect(content.locator("strong")).toHaveText("em negrito");
  await expect(content.locator("em")).toHaveText("em itálico");
});
