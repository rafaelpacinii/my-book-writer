import { paragraph } from "@/tests/fixtures/book";
import { test, expect } from "./fixtures";
import { expectVisibleCaret, openPagedEditor, readEditorState, replaceHtml } from "./pagedEditor";

const before = "Antes da linha vazia.";
const cases = [
  { name: "soft breaks", html: `${before}<br><br>Depois da linha vazia.` },
  { name: "preserved newlines", html: `${before}\n\nDepois da linha vazia.` },
];

for (const scenario of cases) {
  test(`arrow navigation across ${scenario.name} follows the cursor on later pages`, async ({ page }) => {
    await openPagedEditor(page);
    await page.addStyleTag({ content: ".editor-paged-caret { animation: none !important; }" });
    const section = `<p>${paragraph.repeat(3)}</p>`
      + `<p data-break-lines="true" style="white-space:pre-wrap">${scenario.html}</p>`;
    await replaceHtml(page, section.repeat(18));
    await expect.poll(async () => (await readEditorState(page)).total).toBeGreaterThan(3);
    const initialHtml = (await readEditorState(page)).html;

    for (const zoom of ["fit", "actual"]) {
      if (zoom === "actual") await page.getByTitle("100% tamanho real").click();
      for (const targetPage of [2, 3]) {
        await page.evaluate(({ targetPage, offset }) => {
          const flow = document.querySelector<HTMLElement>("[data-paged-flow]");
          const paper = document.querySelector<HTMLElement>("[data-paged-paper]");
          const content = document.querySelector<HTMLElement>(".editor-content-paged");
          if (!flow || !paper || !content) throw new Error("The editor is missing");
          const scale = paper.getBoundingClientRect().width / parseFloat(paper.style.width);
          const stride = parseFloat(paper.style.width) * scale;
          const origin = flow.getBoundingClientRect().left;
          const block = [...content.querySelectorAll("[data-break-lines]")].find((element) => {
            const rect = element.getBoundingClientRect();
            return Math.floor((rect.left - origin + 0.5) / stride) + 1 === targetPage
              && rect.bottom < flow.getBoundingClientRect().bottom;
          });
          const text = block?.firstChild;
          if (!text) throw new Error(`No line breaks on page ${targetPage}`);
          content.focus();
          const range = document.createRange();
          range.setStart(text, offset);
          range.collapse(true);
          const selection = getSelection();
          if (!selection) throw new Error("Browser selection is unavailable");
          selection.removeAllRanges();
          selection.addRange(range);
        }, { targetPage, offset: before.length });
        await expect(page.locator("#editor-page")).toHaveValue(String(targetPage));

        for (const key of ["ArrowDown", "ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"]) {
          await page.keyboard.press(key);
          await expect(page.locator("#editor-page")).toHaveValue(String(targetPage));
          await expectVisibleCaret(page);
          expect(await page.evaluate(() => {
            const node = getSelection()?.focusNode;
            const element = node instanceof Element ? node : node?.parentElement;
            return Boolean(element?.closest("[data-break-lines]"));
          })).toBe(true);
        }
      }
    }
    expect((await readEditorState(page)).html).toBe(initialHtml);
  });
}
