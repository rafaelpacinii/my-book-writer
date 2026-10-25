import type { Locator, Page } from "@playwright/test";

export async function createLibraryItem(page: Page, kind: "livro" | "série" | "universo") {
  await page.getByRole("button", { name: "Criar na biblioteca", exact: true }).click();
  await page.getByRole(kind === "livro" ? "link" : "button", { name: `Criar ${kind}`, exact: true }).click();
}

/** Start the native drag before scrolling another row/pane into view. */
export async function dragLibraryItem(page: Page, source: Locator, target: Locator) {
  await source.scrollIntoViewIfNeeded();
  const start = await source.boundingBox();
  if (!start) throw new Error("Missing library drag source");
  const x = start.x + start.width / 2;
  const y = start.y + start.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 8, y + 8, { steps: 4 });
  await target.scrollIntoViewIfNeeded();
  const end = await target.boundingBox();
  if (!end) throw new Error("Missing library drop target");
  await page.mouse.move(end.x + end.width / 2, end.y + end.height / 2, { steps: 8 });
  await page.mouse.up();
}
