import type { Page } from "@playwright/test";

export async function createLibraryItem(page: Page, kind: "livro" | "série" | "universo") {
  await page.getByRole("button", { name: "Criar na biblioteca", exact: true }).click();
  await page.getByRole(kind === "livro" ? "link" : "button", { name: `Criar ${kind}`, exact: true }).click();
}
