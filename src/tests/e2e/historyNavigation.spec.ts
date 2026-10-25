import { test, expect } from "@/tests/e2e/fixtures";
import { book } from "@/tests/fixtures/book";

test("repeated back and forward traversal preserves all remaining destinations", async ({ page }) => {
  await page.goto("/home");
  await expect(page.locator("main").getByRole("heading", { name: book.title, exact: true })).toBeVisible();
  await page.getByRole("navigation", { name: "Navegação principal" }).getByRole("link", { name: "Biblioteca", exact: true }).click();
  await page.locator("main").getByRole("link", { name: book.title, exact: true }).click();
  await page.locator("main").getByRole("link", { name: "Configurações", exact: true }).click();
  await expect(page).toHaveURL(`/books/settings?bookId=${book.id}`);
  const back = page.getByRole("button", { name: "Voltar", exact: true });
  const forward = page.getByRole("button", { name: "Avançar", exact: true });
  for (let round = 0; round < 3; round++) {
    await back.click();
    await expect(page).toHaveURL(`/books/view?bookId=${book.id}`);
    await expect(forward).toBeEnabled();
    await back.click();
    await expect(page).toHaveURL(/\/library$/);
    await expect(forward).toBeEnabled();
    await forward.click();
    await expect(page).toHaveURL(`/books/view?bookId=${book.id}`);
    await expect(forward).toBeEnabled();
    await forward.click();
    await expect(page).toHaveURL(`/books/settings?bookId=${book.id}`);
    await expect(forward).toBeDisabled();
  }
  await page.goBack();
  await expect(page).toHaveURL(`/books/view?bookId=${book.id}`);
  await expect(forward).toBeEnabled();
  await page.goForward();
  await expect(page).toHaveURL(`/books/settings?bookId=${book.id}`);
  await expect(forward).toBeDisabled();
});
