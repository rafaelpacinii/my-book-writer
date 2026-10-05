import { test, expect } from "./fixtures";
import { expectVisibleCaret, openPagedEditor } from "./pagedEditor";

test("caret stays visible over text on later pages and hides for blur or a text selection", async ({ page }) => {
  await openPagedEditor(page);
  await page.addStyleTag({ content: ".editor-paged-caret { animation: none !important; }" });

  for (const targetPage of [2, 3]) {
    await page.evaluate((targetPage) => {
      const content = document.querySelector<HTMLElement>(".editor-content-paged");
      const flow = document.querySelector<HTMLElement>("[data-paged-flow]");
      const paper = document.querySelector<HTMLElement>("[data-paged-paper]");
      if (!content || !flow || !paper) throw new Error("The editor is missing");
      const stride = paper.getBoundingClientRect().width;
      const origin = flow.getBoundingClientRect().left;
      const range = document.createRange();
      const paragraph = [...content.querySelectorAll("p")].find((element) => {
        if (!element.firstChild) return false;
        range.setStart(element.firstChild, 5);
        range.collapse(true);
        const rect = range.getClientRects()[0];
        return rect && Math.floor((rect.left - origin + 0.5) / stride) + 1 === targetPage;
      });
      if (!paragraph?.firstChild) throw new Error(`No text on page ${targetPage}`);
      content.focus();
      range.setStart(paragraph.firstChild, 5);
      range.collapse(true);
      const selection = getSelection();
      if (!selection) throw new Error("Browser selection is unavailable");
      selection.removeAllRanges();
      selection.addRange(range);
    }, targetPage);
    await expect(page.locator("#editor-page")).toHaveValue(String(targetPage));
    await expectVisibleCaret(page);
    await page.keyboard.press("ArrowRight");
    await expectVisibleCaret(page);
    await page.keyboard.press("Shift+ArrowRight");
    await expect(page.locator("[data-paged-caret]")).toHaveCount(0);
    await page.keyboard.press("ArrowLeft");
    await expectVisibleCaret(page);
    await page.getByRole("button", { name: "Ajustar", exact: true }).click();
    await expect(page.locator("[data-paged-caret]")).toHaveCount(0);
    await page.locator(".editor-content-paged").focus();
    await expectVisibleCaret(page);
  }
});
