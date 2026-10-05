import { paragraph } from "@/tests/fixtures/book";
import { test, expect } from "./fixtures";
import { expectVisibleCaret, openPagedEditor, readEditorState, replaceHtml } from "./pagedEditor";

for (const tag of ["p", "div"]) {
  test(`arrow navigation through empty ${tag} blocks stays on later pages`, async ({ page }) => {
    await openPagedEditor(page);
    await page.addStyleTag({ content: ".editor-paged-caret { animation: none !important; }" });
    const section = `<p>${paragraph.repeat(3)}</p><p>Antes da linha vazia.</p>`
      + `<${tag} data-empty-line="true"><br></${tag}><p>Depois da linha vazia.</p>`;
    await replaceHtml(page, section.repeat(18));
    await expect.poll(async () => (await readEditorState(page)).total).toBeGreaterThan(3);
    const initialHtml = (await readEditorState(page)).html;

    for (const zoom of ["fit", "actual"]) {
      if (zoom === "actual") await page.getByTitle("100% tamanho real").click();
      for (const targetPage of [2, 3]) {
        await page.evaluate((targetPage) => {
          const flow = document.querySelector<HTMLElement>("[data-paged-flow]");
          const paper = document.querySelector<HTMLElement>("[data-paged-paper]");
          const content = document.querySelector<HTMLElement>(".editor-content-paged");
          if (!flow || !paper || !content) throw new Error("The editor is missing");
          const scale = paper.getBoundingClientRect().width / parseFloat(paper.style.width);
          const stride = parseFloat(paper.style.width) * scale;
          const origin = flow.getBoundingClientRect().left;
          const empty = [...content.querySelectorAll("[data-empty-line]")].find((element) => (
            Math.floor((element.getBoundingClientRect().left - origin + 0.5) / stride) + 1 === targetPage
          ));
          const previous = empty?.previousElementSibling?.firstChild;
          if (!previous) throw new Error(`No empty line on page ${targetPage}`);
          content.focus();
          const range = document.createRange();
          range.setStart(previous, previous.textContent?.length ?? 0);
          range.collapse(true);
          const selection = getSelection();
          if (!selection) throw new Error("Browser selection is unavailable");
          selection.removeAllRanges();
          selection.addRange(range);
        }, targetPage);
        await expect(page.locator("#editor-page")).toHaveValue(String(targetPage));
        await expectVisibleCaret(page);
        await page.keyboard.press("ArrowDown");
        await expect.poll(() => page.evaluate(() => {
          const node = getSelection()?.focusNode;
          const element = node instanceof Element ? node : node?.parentElement;
          return Boolean(element?.closest("[data-empty-line]"));
        })).toBe(true);
        await expect(page.locator("#editor-page")).toHaveValue(String(targetPage));
        await expectVisibleCaret(page);
        await page.keyboard.press("ArrowDown");
        await expect(page.locator("#editor-page")).toHaveValue(String(targetPage));
        await page.keyboard.press("ArrowUp");
        await expect(page.locator("#editor-page")).toHaveValue(String(targetPage));
        await expectVisibleCaret(page);
        await page.keyboard.press("ArrowLeft");
        await expect(page.locator("#editor-page")).toHaveValue(String(targetPage));
        await page.keyboard.press("ArrowRight");
        await expect(page.locator("#editor-page")).toHaveValue(String(targetPage));
      }
    }
    expect((await readEditorState(page)).html).toBe(initialHtml);
    await page.keyboard.type("CURSOR VISIVEL");
    await expect(page.locator("[data-empty-line]").filter({ hasText: "CURSOR VISIVEL" })).toHaveCount(1);
    await expectVisibleCaret(page);
    await page.keyboard.press("Control+z");
    await expect.poll(async () => (await readEditorState(page)).html).toBe(initialHtml);
    await expectVisibleCaret(page);
  });
}
